/**
 * AdsPower API V2 Client
 * Updated for V2 endpoints with proper CDP handling
 * 
 * Key differences from V1:
 * - POST /api/v2/browser-profile/list for listing
 * - CDP URL format: ws://server:8080/port/CDP_PORT/devtools/browser/GUID
 * - Better pagination support
 */

const http = require('http');

class AdsPowerV2Client {
    constructor(config = {}) {
        this.apiKey = config.apiKey || '746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329';
        this.baseUrl = config.baseUrl || 'http://77.42.21.134:50325';
        this.apiVersion = 'v2';
        this.timeout = config.timeout || 30000;
        this.retryDelay = config.retryDelay || 1000; // Initial retry delay
        this.maxRetries = config.maxRetries || 3;
    }

    /**
     * Delay helper for rate limiting
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Make API request to AdsPower V2 with retry logic
     */
    async request(endpoint, method = 'GET', data = null, retryCount = 0) {
        return new Promise(async (resolve, reject) => {
            const url = `${this.baseUrl}/api/${this.apiVersion}${endpoint}`;
            const urlObj = new URL(url);

            // Add API key to query parameters
            urlObj.searchParams.append('api_key', this.apiKey);

            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: this.timeout
            };

            const req = http.request(urlObj, options, (res) => {
                let body = '';

                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(body);
                        
                        // V2 API returns { code: 0, data: {...} } on success
                        if (response.code === 0) {
                            resolve(response.data || response);
                        } else if (response.msg && response.msg.includes('Too many request')) {
                            // Rate limit hit - retry with exponential backoff
                            if (retryCount < this.maxRetries) {
                                const delay = this.retryDelay * Math.pow(2, retryCount);
                                console.log(`⚠️  Rate limit hit, retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.maxRetries})`);
                                
                                setTimeout(async () => {
                                    try {
                                        const result = await this.request(endpoint, method, data, retryCount + 1);
                                        resolve(result);
                                    } catch (error) {
                                        reject(error);
                                    }
                                }, delay);
                            } else {
                                reject(new Error(`Rate limit exceeded after ${this.maxRetries} retries`));
                            }
                        } else {
                            reject(new Error(`API Error: ${response.msg || response.message || 'Unknown error'}`));
                        }
                    } catch (e) {
                        reject(new Error(`Invalid JSON response: ${body}`));
                    }
                });
            });

            req.on('error', async (error) => {
                // Retry on connection errors
                if (retryCount < this.maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, retryCount);
                    console.log(`⚠️  Connection error, retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.maxRetries})`);
                    
                    setTimeout(async () => {
                        try {
                            const result = await this.request(endpoint, method, data, retryCount + 1);
                            resolve(result);
                        } catch (err) {
                            reject(err);
                        }
                    }, delay);
                } else {
                    reject(new Error(`Connection failed after ${this.maxRetries} retries: ${error.message}`));
                }
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`Request timeout after ${this.timeout}ms`));
            });

            if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            await this.getProfiles({ page: 1, page_size: 1 });
            return {
                success: true,
                message: 'Connected to AdsPower V2 API',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                hint: 'Make sure AdsPower is running and API is enabled'
            };
        }
    }

    /**
     * Get all profiles (V2 endpoint)
     * @param {Object} options - { group_id, page, page_size, keywords }
     */
    async getProfiles(options = {}) {
        const data = {
            page: options.page || 1,
            page_size: options.page_size || 100,
            group_id: options.group_id || null,
            keywords: options.keywords || null
        };

        // Remove null values
        Object.keys(data).forEach(key => {
            if (data[key] === null) delete data[key];
        });

        return await this.request('/browser-profile/list', 'POST', data);
    }

    /**
     * Get detailed profile information
     * @param {string} profileId - Profile ID
     */
    async getProfileInfo(profileId) {
        const data = { profile_id: profileId };
        return await this.request('/browser-profile/info', 'POST', data);
    }

    /**
     * Check if a profile is active
     * @param {string} profileId - Profile ID
     */
    async isProfileActive(profileId) {
        const data = { profile_id: profileId };
        const result = await this.request('/browser-profile/is-active', 'POST', data);
        return result.is_active === true;
    }

    /**
     * Get all profile groups
     */
    async getGroups() {
        return await this.request('/group/list', 'GET');
    }

    /**
     * Start a profile browser
     * @param {string} profileId - Profile ID
     * @param {Object} options - Launch options
     */
    async startProfile(profileId, options = {}) {
        const data = {
            profile_id: profileId,
            headless: options.headless || false,
            open_tabs: options.open_tabs !== false,
            ip_tab: options.ip_tab || false,
            clear_cache_after_closing: options.clear_cache_after_closing || false
        };

        const result = await this.request('/browser-profile/start', 'POST', data);

        // Extract CDP connection details
        if (result && result.ws && result.puppeteer_port) {
            // Extract the server IP from baseUrl
            const serverMatch = this.baseUrl.match(/http:\/\/([^:]+)/);
            const serverIP = serverMatch ? serverMatch[1] : '95.217.224.154';

            return {
                success: true,
                profile_id: profileId,
                ws_url: result.ws,
                puppeteer_port: result.puppeteer_port,
                cdp_url: `ws://${serverIP}:8080/port/${result.puppeteer_port}`,
                user_data_dir: result.user_data_dir,
                browser_pid: result.browser_pid
            };
        }

        return result;
    }

    /**
     * Stop a profile browser
     * @param {string} profileId - Profile ID
     */
    async stopProfile(profileId) {
        const data = { profile_id: profileId };
        return await this.request('/browser-profile/close', 'POST', data);
    }

    /**
     * Stop all active profiles
     */
    async stopAllProfiles() {
        // First get all profiles, then filter active ones
        const profiles = await this.getProfiles({ page: 1, page_size: 200 });
        const activeProfiles = profiles.list.filter(p => p.status === 'Active');

        const results = [];
        for (const profile of activeProfiles) {
            try {
                await this.stopProfile(profile.profile_id);
                results.push({ profile_id: profile.profile_id, success: true });
            } catch (error) {
                results.push({ profile_id: profile.profile_id, success: false, error: error.message });
            }
        }

        return {
            total: activeProfiles.length,
            stopped: results.filter(r => r.success).length,
            results
        };
    }

    /**
     * Delete a profile
     * @param {string} profileId - Profile ID
     */
    async deleteProfile(profileId) {
        const data = { profile_id: profileId };
        return await this.request('/browser-profile/delete', 'POST', data);
    }

    /**
     * Create a new profile
     * @param {Object} profileData - Profile configuration
     */
    async createProfile(profileData) {
        return await this.request('/browser-profile/create', 'POST', profileData);
    }

    /**
     * Update a profile
     * @param {string} profileId - Profile ID
     * @param {Object} updates - Fields to update
     */
    async updateProfile(profileId, updates) {
        const data = {
            profile_id: profileId,
            ...updates
        };
        return await this.request('/browser-profile/update', 'POST', data);
    }

    /**
     * Get profile audit logs
     * @param {string} profileId - Profile ID
     */
    async getAuditLogs(profileId, options = {}) {
        const data = {
            profile_id: profileId,
            page: options.page || 1,
            page_size: options.page_size || 50
        };
        return await this.request('/audit-log/list', 'POST', data);
    }

    /**
     * Comprehensive profile data extraction
     * @param {string} profileId - Profile ID
     */
    async getFullProfileData(profileId) {
        try {
            const [info, isActive] = await Promise.allSettled([
                this.getProfileInfo(profileId),
                this.isProfileActive(profileId)
            ]);

            return {
                success: true,
                profile_id: profileId,
                basic_info: info.status === 'fulfilled' ? info.value : null,
                is_active: isActive.status === 'fulfilled' ? isActive.value : null,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                profile_id: profileId
            };
        }
    }

    /**
     * Batch operation - Get multiple profiles with rate limiting
     */
    async getAllProfilesPaginated(maxProfiles = 500) {
        const allProfiles = [];
        let page = 1;
        let hasMore = true;
        const pageSize = 50; // Smaller batch size to avoid rate limiting

        while (hasMore && allProfiles.length < maxProfiles) {
            try {
                // Add delay between pages to avoid rate limiting
                if (page > 1) {
                    await this.delay(1000); // 1 second delay between pages
                }

                const result = await this.getProfiles({ page, page_size: pageSize });
                
                if (result.list && result.list.length > 0) {
                    allProfiles.push(...result.list);
                    hasMore = result.list.length === pageSize;
                    page++;
                    
                    console.log(`   Fetched ${allProfiles.length} profiles so far...`);
                } else {
                    hasMore = false;
                }
            } catch (error) {
                console.error(`   Error fetching page ${page}:`, error.message);
                // Continue to next page on error
                page++;
                
                // Max 3 consecutive errors
                if (page > 3 && allProfiles.length === 0) {
                    throw error;
                }
            }
        }

        return {
            profiles: allProfiles,
            total: allProfiles.length,
            pages: page - 1
        };
    }
                page++;
            } else {
                hasMore = false;
            }
        }

        return {
            total: allProfiles.length,
            profiles: allProfiles
        };
    }
}

module.exports = AdsPowerV2Client;
