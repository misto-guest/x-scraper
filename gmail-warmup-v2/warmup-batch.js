/**
 * Batch Gmail Warmup Runner
 *
 * Processes multiple profiles with configurable concurrency and rate limiting
 *
 * Usage:
 *   node warmup-batch.js                    # Run all profiles from config
 *   node warmup-batch.js --parallel 5       # Run 5 profiles at once
 *   node warmup-batch.js --profiles k12am9a2,k12am9a3  # Specific profiles
 *   node warmup-batch.js --file profiles.txt  # Read profiles from file
 */

const { executeWarmup } = require('./warmup-single');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
    // Maximum concurrent warmup sessions
    maxConcurrent: 3,

    // Delay between starting new profiles (seconds)
    startDelay: 30,

    // Maximum retries per profile
    maxRetries: 2,

    // Log file
    logFile: path.join(__dirname, 'logs', `batch-${new Date().toISOString().split('T')[0]}.log`),

    // Results file
    resultsFile: path.join(__dirname, 'data', 'batch-results.json'),

    // Default profiles if none specified
    defaultProfiles: [
        'k12am9a2',
        // Add your 50 profile IDs here
    ]
};

/**
 * Logger with file output
 */
class Logger {
    constructor(logFile) {
        this.logFile = logFile;
    }

    async log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}\n`;

        // Console output
        console.log(logMessage.trim());

        // File output
        try {
            await fs.mkdir(path.dirname(this.logFile), { recursive: true });
            await fs.appendFile(this.logFile, logMessage);
        } catch (error) {
            console.warn('Failed to write log:', error.message);
        }
    }

    async error(message) {
        await this.log(message, 'ERROR');
    }

    async warn(message) {
        await this.log(message, 'WARN');
    }

    async info(message) {
        await this.log(message, 'INFO');
    }

    async success(message) {
        await this.log(message, 'SUCCESS');
    }
}

/**
 * Batch warmup manager
 */
class BatchWarmupManager {
    constructor(config = {}) {
        this.config = { ...CONFIG, ...config };
        this.logger = new Logger(this.config.logFile);
        this.results = [];
        this.running = 0;
        this.completed = 0;
        this.failed = 0;
    }

    /**
     * Get profile list from various sources
     */
    async getProfiles(args) {
        let profiles = [];

        // From command line --profiles flag
        const profilesIndex = args.indexOf('--profiles');
        if (profilesIndex !== -1 && args[profilesIndex + 1]) {
            profiles = args[profilesIndex + 1].split(',');
            await this.logger.info(`Using ${profiles.length} profiles from command line`);
            return profiles;
        }

        // From file --file flag
        const fileIndex = args.indexOf('--file');
        if (fileIndex !== -1 && args[fileIndex + 1]) {
            const filePath = args[fileIndex + 1];
            try {
                const content = await fs.readFile(filePath, 'utf8');
                profiles = content.split('\n')
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('#'));
                await this.logger.info(`Loaded ${profiles.length} profiles from ${filePath}`);
                return profiles;
            } catch (error) {
                await this.logger.error(`Failed to read profile file: ${error.message}`);
                return [];
            }
        }

        // From configuration
        profiles = this.config.defaultProfiles;
        await this.logger.info(`Using ${profiles.length} default profiles`);
        return profiles;
    }

    /**
     * Process a single profile with retries
     */
    async processProfile(profileId, retryCount = 0) {
        const attempt = retryCount + 1;
        await this.logger.info(`[${attempt}/${this.config.maxRetries + 1}] Starting profile: ${profileId}`);

        try {
            const result = await executeWarmup(profileId, ['gmail', 'search', 'news']);

            // Track results
            this.results.push({
                profileId,
                success: result.successCount > 0,
                successCount: result.successCount,
                totalActivities: result.totalActivities,
                attempt,
                timestamp: new Date().toISOString()
            });

            if (result.successCount > 0) {
                this.completed++;
                await this.logger.success(`✅ Profile ${profileId} completed (${result.successCount}/${result.totalActivities} activities)`);
                return { success: true, profileId };
            } else {
                throw new Error('No activities completed successfully');
            }

        } catch (error) {
            await this.logger.error(`❌ Profile ${profileId} failed: ${error.message}`);

            // Retry if under limit
            if (retryCount < this.config.maxRetries) {
                await this.logger.warn(`🔄 Retrying profile ${profileId} in 60 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 60000));
                return await this.processProfile(profileId, retryCount + 1);
            }

            // Max retries exceeded
            this.failed++;
            this.results.push({
                profileId,
                success: false,
                error: error.message,
                attempt,
                timestamp: new Date().toISOString()
            });

            return { success: false, profileId, error: error.message };
        }
    }

    /**
     * Process profiles with concurrency control
     */
    async processBatch(profiles) {
        await this.logger.info(`\n${'='.repeat(70)}`);
        await this.logger.info(`🚀 BATCH WARMUP STARTED`);
        await this.logger.info(`📊 Total profiles: ${profiles.length}`);
        await this.logger.info(`⚡ Max concurrent: ${this.config.maxConcurrent}`);
        await this.logger.info(`⏱️  Start delay: ${this.config.startDelay}s`);
        await this.logger.info(`${'='.repeat(70)}\n`);

        const queue = [...profiles];
        const startTime = Date.now();

        while (queue.length > 0 || this.running > 0) {
            // Start new profiles if under concurrency limit
            while (queue.length > 0 && this.running < this.config.maxConcurrent) {
                const profileId = queue.shift();
                this.running++;

                // Process profile asynchronously
                this.processProfile(profileId)
                    .then(() => {
                        this.running--;
                    })
                    .catch(() => {
                        this.running--;
                    });

                // Delay before starting next profile
                if (queue.length > 0) {
                    await new Promise(resolve => setTimeout(resolve, this.config.startDelay * 1000));
                }
            }

            // Wait before checking queue again
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        const duration = Math.round((Date.now() - startTime) / 1000);

        await this.logger.info(`\n${'='.repeat(70)}`);
        await this.logger.info(`✅ BATCH WARMUP COMPLETED`);
        await this.logger.info(`⏱️  Total duration: ${Math.round(duration / 60)}m ${duration % 60}s`);
        await this.logger.info(`📊 Results:`);
        await this.logger.info(`   ✅ Successful: ${this.completed}`);
        await this.logger.info(`   ❌ Failed: ${this.failed}`);
        await this.logger.info(`   📈 Success rate: ${Math.round((this.completed / profiles.length) * 100)}%`);
        await this.logger.info(`${'='.repeat(70)}\n`);

        // Save results
        await this.saveResults();

        return {
            total: profiles.length,
            completed: this.completed,
            failed: this.failed,
            duration,
            results: this.results
        };
    }

    /**
     * Save results to file
     */
    async saveResults() {
        try {
            await fs.mkdir(path.dirname(this.config.resultsFile), { recursive: true });
            await fs.writeFile(
                this.config.resultsFile,
                JSON.stringify(this.results, null, 2)
            );
            await this.logger.info(`💾 Results saved to: ${this.config.resultsFile}`);
        } catch (error) {
            await this.logger.error(`Failed to save results: ${error.message}`);
        }
    }
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);

    // Parse configuration
    const parallelIndex = args.indexOf('--parallel');
    const maxConcurrent = parallelIndex !== -1 && args[parallelIndex + 1]
        ? parseInt(args[parallelIndex + 1])
        : CONFIG.maxConcurrent;

    const manager = new BatchWarmupManager({ maxConcurrent });

    try {
        // Get profiles to process
        const profiles = await manager.getProfiles(args);

        if (profiles.length === 0) {
            await manager.logger.error('No profiles to process. Exiting.');
            process.exit(1);
        }

        // Process batch
        const summary = await manager.processBatch(profiles);

        // Exit with appropriate code
        process.exit(summary.failed > 0 ? 1 : 0);

    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { BatchWarmupManager };
