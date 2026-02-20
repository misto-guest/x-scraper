/**
 * Warmup Scheduler
 * 
 * Manages cron-based scheduling for warmup profiles.
 * Uses node-cron for reliable scheduling.
 */

const cron = require('node-cron');
const EventEmitter = require('events');

class WarmupScheduler extends EventEmitter {
    constructor(profileManager) {
        super();
        this.profileManager = profileManager;
        this.scheduledTasks = new Map();
        this.runningTasks = new Set();
        this.isRunning = false;
    }

    /**
     * Initialize scheduler
     */
    async initialize() {
        console.log('🕐 Initializing warmup scheduler...');
        
        await this.profileManager.initialize();
        
        // Load existing schedules and register them
        const { schedules } = this.profileManager.getAllSchedules();
        
        for (const schedule of schedules) {
            if (schedule.enabled) {
                await this.registerSchedule(schedule.profile_id, schedule);
            }
        }

        this.isRunning = true;
        console.log(`✅ Scheduler initialized with ${this.scheduledTasks.size} active schedules`);
        
        return { success: true, activeSchedules: this.scheduledTasks.size };
    }

    /**
     * Convert schedule config to cron expression
     */
    toCronExpression(schedule) {
        const { frequency, hour, minute } = schedule;

        switch (frequency) {
            case 'hourly':
                // Every hour at specified minute
                return `${minute || 0} * * * *`;
            
            case 'daily':
                // Every day at specified hour:minute
                return `${minute || 0} ${hour || 9} * * *`;
            
            case 'weekly':
                // Every week at specified day/time (default Monday)
                return `${minute || 0} ${hour || 9} * * 1`;
            
            case 'custom':
                // Use custom cron expression if provided
                return schedule.cron_expression || '0 9 * * *';
            
            default:
                // Default to daily at 9 AM
                return '0 9 * * *';
        }
    }

    /**
     * Register a schedule
     */
    async registerSchedule(profileId, schedule) {
        // Remove existing task if any
        await this.unregisterSchedule(profileId);

        const cronExpression = this.toCronExpression(schedule);
        
        console.log(`📅 Scheduling profile ${profileId}: ${cronExpression}`);

        // Create cron task
        const task = cron.schedule(cronExpression, async () => {
            await this.executeScheduledWarmup(profileId);
        }, {
            scheduled: false, // Don't start yet
            timezone: schedule.timezone || 'UTC'
        });

        this.scheduledTasks.set(profileId, {
            task,
            schedule,
            cronExpression,
            registeredAt: new Date().toISOString()
        });

        // Start the task if enabled
        if (schedule.enabled) {
            task.start();
        }

        return { 
            success: true, 
            profileId, 
            cronExpression,
            status: schedule.enabled ? 'running' : 'registered' 
        };
    }

    /**
     * Unregister a schedule
     */
    async unregisterSchedule(profileId) {
        const scheduledTask = this.scheduledTasks.get(profileId);
        
        if (scheduledTask) {
            scheduledTask.task.stop();
            scheduledTask.task.destroy();
            this.scheduledTasks.delete(profileId);
            
            return { success: true, message: `Schedule unregistered for ${profileId}` };
        }

        return { success: true, message: 'No schedule found' };
    }

    /**
     * Update a schedule
     */
    async updateSchedule(profileId, schedule) {
        await this.unregisterSchedule(profileId);
        return await this.registerSchedule(profileId, schedule);
    }

    /**
     * Execute scheduled warmup
     */
    async executeScheduledWarmup(profileId) {
        // Check if task is already running for this profile
        if (this.runningTasks.has(profileId)) {
            console.log(`⚠️  Warmup already running for profile ${profileId}, skipping`);
            return;
        }

        this.runningTasks.add(profileId);

        try {
            console.log(`\n🚀 Executing scheduled warmup for profile ${profileId}`);
            
            // Get profile configuration
            const { profile } = this.profileManager.getProfile(profileId);
            
            if (!profile || !profile.config.enabled) {
                console.log(`⚠️  Profile ${profileId} is disabled or not found`);
                return;
            }

            // Update status to active
            await this.profileManager.updateProfile(profileId, { 
                status: 'active' 
            });

            // Emit event for the main app to handle the actual warmup
            this.emit('warmup:scheduled', {
                profile_id: profileId,
                profile: profile
            });

        } catch (error) {
            console.error(`❌ Error executing scheduled warmup for ${profileId}:`, error.message);
            
            // Update status to error
            await this.profileManager.updateProfile(profileId, { 
                status: 'error' 
            });
            
            this.emit('warmup:error', {
                profile_id: profileId,
                error: error.message
            });
        } finally {
            // Remove from running tasks after a delay
            setTimeout(() => {
                this.runningTasks.delete(profileId);
            }, 5000);
        }
    }

    /**
     * Get all scheduled tasks
     */
    getScheduledTasks() {
        const tasks = Array.from(this.scheduledTasks.entries()).map(([profileId, data]) => ({
            profile_id: profileId,
            cron_expression: data.cronExpression,
            schedule: data.schedule,
            registered_at: data.registeredAt,
            is_running: data.task.getStatus ? data.task.getStatus() : 'unknown'
        }));

        return { 
            success: true, 
            tasks, 
            count: tasks.length 
        };
    }

    /**
     * Get task status for a profile
     */
    getTaskStatus(profileId) {
        const scheduledTask = this.scheduledTasks.get(profileId);
        
        if (!scheduledTask) {
            return { 
                success: false, 
                message: 'No schedule found for profile' 
            };
        }

        return {
            success: true,
            profile_id: profileId,
            cron_expression: scheduledTask.cronExpression,
            schedule: scheduledTask.schedule,
            is_running: this.runningTasks.has(profileId)
        };
    }

    /**
     * Pause a schedule
     */
    async pauseSchedule(profileId) {
        const scheduledTask = this.scheduledTasks.get(profileId);
        
        if (!scheduledTask) {
            return { success: false, error: 'Schedule not found' };
        }

        scheduledTask.task.stop();
        
        // Update in profile manager
        const { schedule } = this.profileManager.getSchedule(profileId);
        if (schedule) {
            schedule.enabled = false;
            await this.profileManager.setSchedule(profileId, schedule);
        }

        return { success: true, message: `Schedule paused for ${profileId}` };
    }

    /**
     * Resume a schedule
     */
    async resumeSchedule(profileId) {
        const scheduledTask = this.scheduledTasks.get(profileId);
        
        if (!scheduledTask) {
            return { success: false, error: 'Schedule not found' };
        }

        scheduledTask.task.start();
        
        // Update in profile manager
        const { schedule } = this.profileManager.getSchedule(profileId);
        if (schedule) {
            schedule.enabled = true;
            await this.profileManager.setSchedule(profileId, schedule);
        }

        return { success: true, message: `Schedule resumed for ${profileId}` };
    }

    /**
     * Stop all schedules
     */
    async stopAll() {
        console.log('🛑 Stopping all schedules...');
        
        for (const [profileId, scheduledTask] of this.scheduledTasks.entries()) {
            try {
                scheduledTask.task.stop();
                scheduledTask.task.destroy();
            } catch (error) {
                console.error(`Error stopping schedule for ${profileId}:`, error.message);
            }
        }

        this.scheduledTasks.clear();
        this.isRunning = false;
        
        console.log('✅ All schedules stopped');
        
        return { success: true, message: 'All schedules stopped' };
    }

    /**
     * Get next run times for all scheduled profiles
     */
    getNextRunTimes() {
        const nextRuns = [];

        for (const [profileId, scheduledTask] of this.scheduledTasks.entries()) {
            const { schedule } = this.profileManager.getSchedule(profileId);
            
            if (schedule && schedule.enabled) {
                nextRuns.push({
                    profile_id: profileId,
                    cron_expression: scheduledTask.cronExpression,
                    next_run: schedule.next_run,
                    frequency: schedule.frequency
                });
            }
        }

        // Sort by next run time
        nextRuns.sort((a, b) => {
            return new Date(a.next_run) - new Date(b.next_run);
        });

        return { success: true, next_runs: nextRuns };
    }

    /**
     * Validate cron expression
     */
    validateCronExpression(cronExpression) {
        try {
            return cron.validate(cronExpression);
        } catch (error) {
            return false;
        }
    }

    /**
     * Get human-readable schedule description
     */
    getScheduleDescription(schedule) {
        const { frequency, hour, minute, timezone } = schedule;

        switch (frequency) {
            case 'hourly':
                return `Every hour at ${minute || 0} minutes (${timezone || 'UTC'})`;
            
            case 'daily':
                return `Daily at ${hour || 9}:${(minute || 0).toString().padStart(2, '0')} ${timezone || 'UTC'}`;
            
            case 'weekly':
                return `Weekly on Monday at ${hour || 9}:${(minute || 0).toString().padStart(2, '0')} ${timezone || 'UTC'}`;
            
            case 'custom':
                return `Custom schedule: ${schedule.cron_expression}`;
            
            default:
                return 'Unknown schedule';
        }
    }
}

module.exports = WarmupScheduler;
