/**
 * Gmail Warmup V2 - Main Orchestrator
 * 
 * This is the entry point that ties everything together:
 * - AdsPower V2 API Client
 * - Profile Manager (data persistence)
 * - Scheduler (cron jobs)
 * - Warmup Engine (Puppeteer automation)
 * - API Server (Express + UI)
 * 
 * Usage:
 *   node index.js                    # Start with UI on http://localhost:3000
 *   node index.js --test <profileId> # Test single profile
 *   node index.js --import           # Import all profiles from AdsPower
 */

const AdsPowerV2Client = require('./lib/adspower-v2-client');
const ProfileManager = require('./lib/profile-manager');
const WarmupScheduler = require('./lib/scheduler');
const WarmupEngine = require('./lib/warmup-engine');
const ApiServer = require('./lib/api-server');
const path = require('path');

// Configuration
const CONFIG = {
    dataDir: path.join(__dirname, 'data'),
    screenshotDir: path.join(__dirname, 'screenshots'),
    adspower: {
        apiKey: '746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329',
        baseUrl: 'http://77.42.21.134:50325'
    },
    server: {
        port: process.env.PORT || 3000
    }
};

// Global instances
let adspowerClient;
let profileManager;
let scheduler;
let apiServer;

/**
 * Initialize all components
 */
async function initialize() {
    console.log('🔧 Initializing Gmail Warmup V2...\n');

    // Create directories
    const fs = require('fs').promises;
    await fs.mkdir(CONFIG.dataDir, { recursive: true });
    await fs.mkdir(CONFIG.screenshotDir, { recursive: true });

    // Initialize AdsPower V2 client
    console.log('📡 Connecting to AdsPower V2 API...');
    adspowerClient = new AdsPowerV2Client(CONFIG.adspower);
    
    const connectionTest = await adspowerClient.testConnection();
    if (!connectionTest.success) {
        console.warn(`⚠️  AdsPower connection warning: ${connectionTest.message}`);
    } else {
        console.log('✅ AdsPower V2 connected');
    }

    // Initialize profile manager
    console.log('📁 Loading profile data...');
    profileManager = new ProfileManager(CONFIG.dataDir);
    await profileManager.initialize();
    const { profiles } = profileManager.getAllProfiles();
    console.log(`✅ Loaded ${profiles.length} profiles`);

    // Initialize scheduler
    console.log('🕐 Initializing scheduler...');
    scheduler = new WarmupScheduler(profileManager);
    await scheduler.initialize();
    console.log(`✅ Scheduler running with ${scheduler.scheduledTasks.size} schedules`);

    // Initialize API server
    console.log('🌐 Starting API server...');
    apiServer = new ApiServer(profileManager, scheduler, adspowerClient, WarmupEngine);

    // Listen for scheduled warmup events
    scheduler.on('warmup:scheduled', async (data) => {
        console.log(`\n⏰ Scheduled warmup triggered for ${data.profile_id}`);
        await executeWarmup(data.profile_id, data.profile);
    });

    scheduler.on('warmup:error', (data) => {
        console.error(`❌ Scheduled warmup error for ${data.profile_id}: ${data.error}`);
    });

    console.log('\n✅ Initialization complete!\n');
}

/**
 * Execute warmup for a profile
 */
async function executeWarmup(profileId, profile) {
    const startTime = Date.now();

    try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🚀 Warmup for Profile: ${profileId}`);
        console.log(`${'='.repeat(60)}\n`);

        // Update status
        await profileManager.updateProfile(profileId, { status: 'active' });

        // Start profile via AdsPower
        console.log('🔌 Starting AdsPower profile...');
        const startResult = await adspowerClient.startProfile(profileId);

        if (!startResult.success) {
            throw new Error(`Failed to start profile: ${startResult.message || 'Unknown error'}`);
        }

        console.log(`✅ Profile started on port ${startResult.puppeteer_port}`);
        console.log(`📡 CDP: ${startResult.cdp_url}\n`);

        // Wait for browser to be ready
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Initialize warmup engine
        const warmupEngine = new WarmupEngine({
            activities: profile?.config?.activities || ['gmail', 'search'],
            screenshotDir: CONFIG.screenshotDir,
            enableScreenshots: true
        });

        await warmupEngine.initialize(startResult.cdp_url, profileId);

        // Run warmup
        const result = await warmupEngine.runWarmup();
        result.duration = Date.now() - startTime;

        console.log('\n📊 Warmup Results:');
        console.log(`   Success: ${result.success}`);
        console.log(`   Activities: ${result.summary?.successful || 0}/${result.summary?.total || 0}`);
        console.log(`   Duration: ${Math.round(result.duration / 1000)}s`);

        // Update statistics
        await profileManager.updateStats(profileId, result);

        // Update profile
        const metadata = {
            lastRun: new Date().toISOString(),
            lastStatus: result.success ? 'success' : 'error',
            totalRuns: (profile?.metadata?.totalRuns || 0) + 1,
            successfulRuns: result.success ? (profile?.metadata?.successfulRuns || 0) + 1 : (profile?.metadata?.successfulRuns || 0),
            failedRuns: !result.success ? (profile?.metadata?.failedRuns || 0) + 1 : (profile?.metadata?.failedRuns || 0)
        };

        await profileManager.updateProfile(profileId, {
            status: result.success ? 'idle' : 'error',
            metadata
        });

        console.log('\n✅ Warmup completed successfully!\n');

        return result;

    } catch (error) {
        console.error(`\n❌ Warmup failed for ${profileId}: ${error.message}\n`);

        // Update with error status
        const metadata = {
            lastRun: new Date().toISOString(),
            lastStatus: 'error',
            totalRuns: (profile?.metadata?.totalRuns || 0) + 1,
            failedRuns: (profile?.metadata?.failedRuns || 0) + 1
        };

        await profileManager.updateProfile(profileId, {
            status: 'error',
            metadata
        });

        return { success: false, error: error.message };

    } finally {
        // Cleanup - CRITICAL for memory management
        console.log('🧹 Cleaning up...');
        
        try {
            await adspowerClient.stopProfile(profileId);
            console.log('✅ Profile stopped');
        } catch (error) {
            console.warn(`⚠️  Error stopping profile: ${error.message}`);
        }

        console.log(`${'='.repeat(60)}\n`);
    }
}

/**
 * Test single profile
 */
async function testProfile(profileId) {
    await initialize();

    const { profile } = profileManager.getProfile(profileId);
    
    if (!profile) {
        console.error(`❌ Profile ${profileId} not found in local database`);
        console.log(`💡 Import from AdsPower first, or add manually\n`);
        process.exit(1);
    }

    console.log(`🧪 Testing warmup for profile: ${profileId}`);
    console.log(`📋 Profile: ${profile.name || 'Unnamed'}\n`);

    const result = await executeWarmup(profileId, profile);

    if (result.success) {
        console.log('✅ Test completed successfully!');
        process.exit(0);
    } else {
        console.error('❌ Test failed!');
        process.exit(1);
    }
}

/**
 * Import profiles from AdsPower
 */
async function importProfiles() {
    await initialize();

    console.log('\n📥 Importing profiles from AdsPower...\n');

    try {
        const { profiles, total } = await adspowerClient.getAllProfilesPaginated(500);
        
        console.log(`Found ${total} profiles in AdsPower`);

        const result = await profileManager.importProfiles(profiles);

        console.log(`\n✅ Import complete:`);
        console.log(`   New: ${result.imported}`);
        console.log(`   Updated: ${result.updated}`);
        console.log(`   Total: ${result.total}\n`);

    } catch (error) {
        console.error(`❌ Import failed: ${error.message}\n`);
        process.exit(1);
    }

    process.exit(0);
}

/**
 * Start main server
 */
async function startServer() {
    await initialize();

    try {
        await apiServer.start(CONFIG.server.port);

        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n\n🛑 Shutting down gracefully...\n');
            
            try {
                await scheduler.stopAll();
                await apiServer.stop();
                
                // Stop all active profiles
                const stopResult = await adspowerClient.stopAllProfiles();
                console.log(`🛑 Stopped ${stopResult.stopped}/${stopResult.total} active profiles\n`);
                
                console.log('✅ Shutdown complete. Goodbye!\n');
                process.exit(0);
            } catch (error) {
                console.error(`❌ Shutdown error: ${error.message}\n`);
                process.exit(1);
            }
        });

        // Keep process running
        console.log('🎉 Gmail Warmup V2 is running!');
        console.log('💡 Press Ctrl+C to stop\n');

    } catch (error) {
        console.error(`\n❌ Server error: ${error.message}\n`);
        process.exit(1);
    }
}

/**
 * CLI entry point
 */
async function main() {
    const args = process.argv.slice(2);

    // Check flags
    if (args.includes('--test')) {
        const profileId = args[args.indexOf('--test') + 1];
        if (!profileId) {
            console.error('❌ Please provide a profile ID: --test <profileId>\n');
            process.exit(1);
        }
        await testProfile(profileId);
        return;
    }

    if (args.includes('--import')) {
        await importProfiles();
        return;
    }

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Gmail Warmup V2 - Usage:

  node index.js                    # Start dashboard server
  node index.js --test <profileId> # Test single profile
  node index.js --import           # Import profiles from AdsPower
  node index.js --help             # Show this help

Examples:

  node index.js                    # Start UI on http://localhost:3000
  node index.js --test k12am9a2    # Test specific profile
  node index.js --import           # Import all AdsPower profiles

Configuration:

  AdsPower Server: ${CONFIG.adspower.baseUrl}
  Data Directory: ${CONFIG.dataDir}
  Screenshots:    ${CONFIG.screenshotDir}

        `);
        process.exit(0);
        return;
    }

    // Default: start server
    await startServer();
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error(`\n💥 Fatal error: ${error.message}\n`);
        console.error(error.stack);
        process.exit(1);
    });
}

// Export for testing
module.exports = {
    initialize,
    executeWarmup,
    testProfile,
    importProfiles,
    startServer
};
