/**
 * Express Server for Gmail Warmup V2
 * 
 * Provides REST API for the UI and handles warmup execution.
 */

const express = require('express');
const path = require('path');

class ApiServer {
    constructor(profileManager, scheduler, adspowerClient, warmupEngine) {
        this.app = express();
        this.profileManager = profileManager;
        this.scheduler = scheduler;
        this.adspowerClient = adspowerClient;
        this.warmupEngineClass = warmupEngine;
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, '../ui')));
    }

    setupRoutes() {
        // Serve UI
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../ui/index.html'));
        });

        // API: Get all profiles
        this.app.get('/api/profiles', async (req, res) => {
            try {
                const result = this.profileManager.getAllProfiles();
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // API: Get a single profile
        this.app.get('/api/profiles/:profileId', (req, res) => {
            try {
                const result = this.profileManager.getProfile(req.params.profileId);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // API: Add profile
        this.app.post('/api/profiles', async (req, res) => {
            try {
                const profileData = {
                    profile_id: req.body.profile_id,
                    name: req.body.name,
                    email: req.body.email,
                    frequency: req.body.frequency,
                    hour: req.body.hour,
                    minute: req.body.minute,
                    timezone: req.body.timezone,
                    activities: req.body.activities,
                    enabled: req.body.enabled
                };

                const result = await this.profileManager.addProfile(profileData);

                // Also set schedule
                if (result.success) {
                    await this.profileManager.setSchedule(req.body.profile_id, {
                        frequency: req.body.frequency,
                        hour: req.body.hour,
                        minute: req.body.minute,
                        timezone: req.body.timezone,
                        enabled: req.body.enabled,
                        cron_expression: this.scheduler.toCronExpression(req.body)
                    });

                    // Register with scheduler
                    await this.scheduler.registerSchedule(req.body.profile_id, {
                        frequency: req.body.frequency,
                        hour: req.body.hour,
                        minute: req.body.minute,
                        timezone: req.body.timezone,
                        enabled: req.body.enabled
                    });
                }

                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // API: Update profile
        this.app.put('/api/profiles/:profileId', async (req, res) => {
            try {
                const updates = {
                    name: req.body.name,
                    email: req.body.email,
                    config: {
                        frequency: req.body.frequency,
                        hour: req.body.hour,
                        minute: req.body.minute,
                        timezone: req.body.timezone,
                        activities: req.body.activities,
                        enabled: req.body.enabled
                    }
                };

                const result = await this.profileManager.updateProfile(req.params.profileId, updates);

                // Update schedule
                if (result.success) {
                    await this.profileManager.setSchedule(req.params.profileId, {
                        frequency: req.body.frequency,
                        hour: req.body.hour,
                        minute: req.body.minute,
                        timezone: req.body.timezone,
                        enabled: req.body.enabled,
                        cron_expression: this.scheduler.toCronExpression(req.body)
                    });

                    // Update scheduler
                    await this.scheduler.updateSchedule(req.params.profileId, {
                        frequency: req.body.frequency,
                        hour: req.body.hour,
                        minute: req.body.minute,
                        timezone: req.body.timezone,
                        enabled: req.body.enabled
                    });
                }

                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // API: Delete profile
        this.app.delete('/api/profiles/:profileId', async (req, res) => {
            try {
                const result = await this.profileManager.deleteProfile(req.params.profileId);
                await this.scheduler.unregisterSchedule(req.params.profileId);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // API: Import profiles from AdsPower
        this.app.post('/api/import', async (req, res) => {
            try {
                const adspowerProfiles = await this.adspowerClient.getAllProfilesPaginated(500);
                const result = await this.profileManager.importProfiles(adspowerProfiles.profiles);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // API: Get statistics
        this.app.get('/api/stats/:profileId', (req, res) => {
            try {
                const result = this.profileManager.getStats(req.params.profileId);
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // API: Get all schedules
        this.app.get('/api/schedules', (req, res) => {
            try {
                const result = this.profileManager.getAllSchedules();
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // API: Run warmup for a profile
        this.app.post('/api/warmup/:profileId', async (req, res) => {
            try {
                const profileId = req.params.profileId;
                const { profile } = this.profileManager.getProfile(profileId);

                if (!profile) {
                    return res.status(404).json({ success: false, error: 'Profile not found' });
                }

                // Update status
                await this.profileManager.updateProfile(profileId, { status: 'active' });

                // Start the profile
                const startResult = await this.adspowerClient.startProfile(profileId);

                if (!startResult.success) {
                    await this.profileManager.updateProfile(profileId, { status: 'error' });
                    return res.status(500).json({ success: false, error: 'Failed to start profile' });
                }

                // Initialize warmup engine
                const warmupEngine = new this.warmupEngineClass({
                    activities: profile.config?.activities || ['gmail', 'search'],
                    screenshotDir: path.join(__dirname, '../screenshots')
                });

                await warmupEngine.initialize(startResult.cdp_url, profileId);

                // Run warmup asynchronously
                this.runWarmupAsync(warmupEngine, profileId);

                res.json({ 
                    success: true, 
                    message: 'Warmup started',
                    profile_id: profileId 
                });

            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // API: Get summary
        this.app.get('/api/summary', (req, res) => {
            try {
                const result = this.profileManager.getSummary();
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // API: Get scheduled tasks
        this.app.get('/api/scheduler/tasks', (req, res) => {
            try {
                const result = this.scheduler.getScheduledTasks();
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // API: Test AdsPower connection
        this.app.get('/api/test-connection', async (req, res) => {
            try {
                const result = await this.adspowerClient.testConnection();
                res.json(result);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    /**
     * Run warmup asynchronously (doesn't block response)
     */
    async runWarmupAsync(warmupEngine, profileId) {
        const startTime = Date.now();

        try {
            // Run warmup
            const result = await warmupEngine.runWarmup();

            // Calculate duration
            result.duration = Date.now() - startTime;

            // Update stats
            await this.profileManager.updateStats(profileId, result);

            // Update profile metadata
            const { profile } = this.profileManager.getProfile(profileId);
            if (profile) {
                profile.metadata.lastRun = new Date().toISOString();
                profile.metadata.lastStatus = result.success ? 'success' : 'error';
                profile.metadata.totalRuns++;
                
                if (result.success) {
                    profile.metadata.successfulRuns++;
                    await this.profileManager.updateProfile(profileId, { status: 'idle' });
                } else {
                    profile.metadata.failedRuns++;
                    await this.profileManager.updateProfile(profileId, { status: 'error' });
                }
            }

        } catch (error) {
            console.error(`Warmup error for ${profileId}:`, error.message);
            await this.profileManager.updateProfile(profileId, { status: 'error' });
        } finally {
            // Cleanup - critical for memory management
            await warmupEngine.cleanup();

            // Stop the profile
            try {
                await this.adspowerClient.stopProfile(profileId);
            } catch (error) {
                console.error(`Error stopping profile ${profileId}:`, error.message);
            }
        }
    }

    /**
     * Start the server
     */
    start(port = 3000) {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(port, () => {
                    console.log(`\n🚀 Gmail Warmup V2 Server`);
                    console.log(`📊 Dashboard: http://localhost:${port}`);
                    console.log(`🔌 API: http://localhost:${port}/api`);
                    console.log(`\n✅ Server started on port ${port}\n`);
                    resolve(port);
                });

                this.server.on('error', (error) => {
                    if (error.code === 'EADDRINUSE') {
                        reject(new Error(`Port ${port} is already in use`));
                    } else {
                        reject(error);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Stop the server
     */
    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('Server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

module.exports = ApiServer;
