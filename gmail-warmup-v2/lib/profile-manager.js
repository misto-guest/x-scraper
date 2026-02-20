/**
 * Profile Manager
 * 
 * Handles CRUD operations for warmup profiles with data persistence.
 * Stores profile configurations, schedules, and statistics.
 */

const fs = require('fs').promises;
const path = require('path');

class ProfileManager {
    constructor(dataDir = './data') {
        this.dataDir = dataDir;
        this.profilesFile = path.join(dataDir, 'profiles.json');
        this.schedulesFile = path.join(dataDir, 'schedules.json');
        this.statsFile = path.join(dataDir, 'stats.json');
        
        this.profiles = new Map();
        this.schedules = new Map();
        this.stats = new Map();
    }

    /**
     * Initialize data directory and load existing data
     */
    async initialize() {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
            
            await this.loadProfiles();
            await this.loadSchedules();
            await this.loadStats();
            
            return { success: true, message: 'Profile manager initialized' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Load profiles from file
     */
    async loadProfiles() {
        try {
            const data = await fs.readFile(this.profilesFile, 'utf8');
            const profiles = JSON.parse(data);
            
            this.profiles.clear();
            for (const profile of profiles) {
                this.profiles.set(profile.profile_id, profile);
            }
            
            return { success: true, count: this.profiles.size };
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist yet, start fresh
                return { success: true, count: 0 };
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Save profiles to file
     */
    async saveProfiles() {
        try {
            const profiles = Array.from(this.profiles.values());
            await fs.writeFile(this.profilesFile, JSON.stringify(profiles, null, 2));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Load schedules from file
     */
    async loadSchedules() {
        try {
            const data = await fs.readFile(this.schedulesFile, 'utf8');
            const schedules = JSON.parse(data);
            
            this.schedules.clear();
            for (const schedule of schedules) {
                this.schedules.set(schedule.profile_id, schedule);
            }
            
            return { success: true, count: this.schedules.size };
        } catch (error) {
            if (error.code === 'ENOENT') {
                return { success: true, count: 0 };
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Save schedules to file
     */
    async saveSchedules() {
        try {
            const schedules = Array.from(this.schedules.values());
            await fs.writeFile(this.schedulesFile, JSON.stringify(schedules, null, 2));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Load statistics from file
     */
    async loadStats() {
        try {
            const data = await fs.readFile(this.statsFile, 'utf8');
            const stats = JSON.parse(data);
            
            this.stats.clear();
            for (const stat of stats) {
                this.stats.set(stat.profile_id, stat);
            }
            
            return { success: true, count: this.stats.size };
        } catch (error) {
            if (error.code === 'ENOENT') {
                return { success: true, count: 0 };
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Save statistics to file
     */
    async saveStats() {
        try {
            const stats = Array.from(this.stats.values());
            await fs.writeFile(this.statsFile, JSON.stringify(stats, null, 2));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * CREATE - Add a new profile
     */
    async addProfile(profileData) {
        const profile = {
            profile_id: profileData.profile_id,
            name: profileData.name || `Profile ${profileData.profile_id}`,
            email: profileData.email || null,
            group_id: profileData.group_id || null,
            status: profileData.status || 'idle', // idle, active, error
            config: {
                activities: profileData.activities || ['gmail', 'search'],
                frequency: profileData.frequency || 'daily', // daily, hourly, weekly
                hour: profileData.hour || 9,
                minute: profileData.minute || 0,
                timezone: profileData.timezone || 'UTC',
                enabled: profileData.enabled !== false
            },
            metadata: {
                createdAt: new Date().toISOString(),
                lastRun: null,
                lastStatus: null,
                totalRuns: 0,
                successfulRuns: 0,
                failedRuns: 0
            }
        };

        this.profiles.set(profile.profile_id, profile);
        await this.saveProfiles();
        
        return { success: true, profile };
    }

    /**
     * READ - Get a profile by ID
     */
    getProfile(profileId) {
        const profile = this.profiles.get(profileId);
        if (!profile) {
            return { success: false, error: 'Profile not found' };
        }
        return { success: true, profile };
    }

    /**
     * READ - Get all profiles
     */
    getAllProfiles() {
        const profiles = Array.from(this.profiles.values());
        return { 
            success: true, 
            profiles,
            count: profiles.length 
        };
    }

    /**
     * READ - Get profiles by status
     */
    getProfilesByStatus(status) {
        const profiles = Array.from(this.profiles.values())
            .filter(p => p.status === status);
        return { 
            success: true, 
            profiles, 
            count: profiles.length 
        };
    }

    /**
     * READ - Get enabled profiles
     */
    getEnabledProfiles() {
        const profiles = Array.from(this.profiles.values())
            .filter(p => p.config.enabled);
        return { 
            success: true, 
            profiles, 
            count: profiles.length 
        };
    }

    /**
     * UPDATE - Update a profile
     */
    async updateProfile(profileId, updates) {
        const profile = this.profiles.get(profileId);
        if (!profile) {
            return { success: false, error: 'Profile not found' };
        }

        // Update fields
        if (updates.name !== undefined) profile.name = updates.name;
        if (updates.email !== undefined) profile.email = updates.email;
        if (updates.status !== undefined) profile.status = updates.status;
        
        if (updates.config) {
            profile.config = { ...profile.config, ...updates.config };
        }

        profile.metadata.updatedAt = new Date().toISOString();

        this.profiles.set(profileId, profile);
        await this.saveProfiles();
        
        return { success: true, profile };
    }

    /**
     * DELETE - Remove a profile
     */
    async deleteProfile(profileId) {
        if (!this.profiles.has(profileId)) {
            return { success: false, error: 'Profile not found' };
        }

        this.profiles.delete(profileId);
        this.schedules.delete(profileId);
        this.stats.delete(profileId);
        
        await Promise.all([
            this.saveProfiles(),
            this.saveSchedules(),
            this.saveStats()
        ]);
        
        return { success: true, message: 'Profile deleted' };
    }

    /**
     * Set profile schedule
     */
    async setSchedule(profileId, schedule) {
        const profile = this.profiles.get(profileId);
        if (!profile) {
            return { success: false, error: 'Profile not found' };
        }

        const scheduleData = {
            profile_id: profileId,
            cron_expression: schedule.cron_expression,
            frequency: schedule.frequency || 'daily',
            hour: schedule.hour || 9,
            minute: schedule.minute || 0,
            timezone: schedule.timezone || 'UTC',
            enabled: schedule.enabled !== false,
            next_run: this.calculateNextRun(schedule),
            metadata: {
                createdAt: new Date().toISOString(),
                totalRuns: 0
            }
        };

        this.schedules.set(profileId, scheduleData);
        await this.saveSchedules();
        
        return { success: true, schedule: scheduleData };
    }

    /**
     * Get schedule for a profile
     */
    getSchedule(profileId) {
        const schedule = this.schedules.get(profileId);
        if (!schedule) {
            return { success: false, error: 'Schedule not found' };
        }
        return { success: true, schedule };
    }

    /**
     * Get all schedules
     */
    getAllSchedules() {
        const schedules = Array.from(this.schedules.values());
        return { 
            success: true, 
            schedules, 
            count: schedules.length 
        };
    }

    /**
     * Calculate next run time based on schedule
     */
    calculateNextRun(schedule) {
        const now = new Date();
        const next = new Date();

        switch (schedule.frequency) {
            case 'hourly':
                next.setHours(next.getHours() + 1);
                next.setMinutes(schedule.minute || 0);
                break;
            case 'daily':
                if (schedule.hour !== undefined) {
                    next.setHours(schedule.hour, schedule.minute || 0, 0, 0);
                    if (next <= now) {
                        next.setDate(next.getDate() + 1);
                    }
                }
                break;
            case 'weekly':
                next.setDate(next.getDate() + 7);
                if (schedule.hour !== undefined) {
                    next.setHours(schedule.hour, schedule.minute || 0, 0, 0);
                }
                break;
            default:
                next.setDate(next.getDate() + 1);
        }

        return next.toISOString();
    }

    /**
     * Update statistics after a run
     */
    async updateStats(profileId, runResult) {
        let stats = this.stats.get(profileId);
        
        if (!stats) {
            stats = {
                profile_id: profileId,
                history: [],
                totals: {
                    runs: 0,
                    successful: 0,
                    failed: 0,
                    totalDuration: 0
                }
            };
        }

        const runEntry = {
            timestamp: new Date().toISOString(),
            success: runResult.success,
            duration: runResult.duration || 0,
            activities: runResult.stats?.activities || [],
            summary: runResult.summary || {}
        };

        stats.history.push(runEntry);
        stats.history = stats.history.slice(-100); // Keep last 100 runs

        stats.totals.runs++;
        stats.totals.totalDuration += runResult.duration || 0;

        if (runResult.success) {
            stats.totals.successful++;
        } else {
            stats.totals.failed++;
        }

        this.stats.set(profileId, stats);
        await this.saveStats();

        return { success: true, stats };
    }

    /**
     * Get statistics for a profile
     */
    getStats(profileId) {
        const stats = this.stats.get(profileId);
        if (!stats) {
            return { 
                success: true, 
                stats: {
                    profile_id: profileId,
                    history: [],
                    totals: { runs: 0, successful: 0, failed: 0, totalDuration: 0 }
                }
            };
        }
        return { success: true, stats };
    }

    /**
     * Bulk import profiles from AdsPower
     */
    async importProfiles(adspowerProfiles) {
        let imported = 0;
        let updated = 0;

        for (const apProfile of adspowerProfiles) {
            const existing = this.profiles.get(apProfile.profile_id);
            
            const profileData = {
                profile_id: apProfile.profile_id,
                name: apProfile.name || `Profile ${apProfile.profile_id}`,
                group_id: apProfile.group_id || null,
                status: 'idle'
            };

            if (existing) {
                await this.updateProfile(apProfile.profile_id, profileData);
                updated++;
            } else {
                await this.addProfile(profileData);
                imported++;
            }
        }

        return { 
            success: true, 
            imported, 
            updated, 
            total: imported + updated 
        };
    }

    /**
     * Get summary statistics
     */
    getSummary() {
        const profiles = Array.from(this.profiles.values());
        const stats = Array.from(this.stats.values());

        const summary = {
            totalProfiles: profiles.length,
            enabledProfiles: profiles.filter(p => p.config.enabled).length,
            activeProfiles: profiles.filter(p => p.status === 'active').length,
            scheduledProfiles: this.schedules.size,
            totalRuns: stats.reduce((sum, s) => sum + s.totals.runs, 0),
            successfulRuns: stats.reduce((sum, s) => sum + s.totals.successful, 0),
            failedRuns: stats.reduce((sum, s) => sum + s.totals.failed, 0)
        };

        return { success: true, summary };
    }
}

module.exports = ProfileManager;
