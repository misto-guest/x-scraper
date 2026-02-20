#!/usr/bin/env node

/**
 * Gmail Warmup V2 - Standalone Server
 * Starts the web dashboard without AdsPower dependency
 * Useful for UI testing and profile management
 */

const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3003;
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'ui')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'Gmail Warmup V2 (Standalone)'
    });
});

// Get profiles
app.get('/api/profiles', async (req, res) => {
    try {
        const profilesPath = path.join(DATA_DIR, 'profiles.json');
        const data = await fs.readFile(profilesPath, 'utf8');
        const profiles = JSON.parse(data);
        res.json({ success: true, profiles });
    } catch (error) {
        res.json({ success: true, profiles: [] });
    }
});

// Get single profile
app.get('/api/profiles/:profileId', async (req, res) => {
    try {
        const profilesPath = path.join(DATA_DIR, 'profiles.json');
        const data = await fs.readFile(profilesPath, 'utf8');
        const profiles = JSON.parse(data);
        const profile = profiles.find(p => p.id === req.params.profileId);
        if (profile) {
            res.json({ success: true, profile });
        } else {
            res.status(404).json({ success: false, error: 'Profile not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add profile
app.post('/api/profiles', async (req, res) => {
    try {
        const profilesPath = path.join(DATA_DIR, 'profiles.json');
        const data = await fs.readFile(profilesPath, 'utf8');
        let profiles = JSON.parse(data);

        const newProfile = {
            id: req.body.id || req.body.adspowerProfileId,
            name: req.body.name,
            email: req.body.email,
            adspowerProfileId: req.body.adspowerProfileId,
            status: req.body.status || 'active',
            schedule: {
                enabled: req.body.schedule?.enabled || false,
                frequency: req.body.schedule?.frequency || 'daily',
                hour: req.body.schedule?.hour || 9,
                minute: req.body.schedule?.minute || 0,
                timezone: req.body.schedule?.timezone || 'Europe/Amsterdam'
            },
            stats: {
                totalRuns: 0,
                lastRun: null,
                lastStatus: null,
                successRate: 0
            },
            createdAt: new Date().toISOString()
        };

        profiles.push(newProfile);
        await fs.writeFile(profilesPath, JSON.stringify(profiles, null, 2));

        res.json({ success: true, profile: newProfile });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update profile
app.put('/api/profiles/:profileId', async (req, res) => {
    try {
        const profilesPath = path.join(DATA_DIR, 'profiles.json');
        const data = await fs.readFile(profilesPath, 'utf8');
        let profiles = JSON.parse(data);

        const index = profiles.findIndex(p => p.id === req.params.profileId);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        profiles[index] = { ...profiles[index], ...req.body };
        await fs.writeFile(profilesPath, JSON.stringify(profiles, null, 2));

        res.json({ success: true, profile: profiles[index] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete profile
app.delete('/api/profiles/:profileId', async (req, res) => {
    try {
        const profilesPath = path.join(DATA_DIR, 'profiles.json');
        const data = await fs.readFile(profilesPath, 'utf8');
        let profiles = JSON.parse(data);

        const filteredProfiles = profiles.filter(p => p.id !== req.params.profileId);
        await fs.writeFile(profilesPath, JSON.stringify(filteredProfiles, null, 2));

        res.json({ success: true, message: 'Profile deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Import from AdsPower (mock for standalone)
app.post('/api/import', async (req, res) => {
    res.json({
        success: true,
        message: 'Import not available in standalone mode. Use full system with AdsPower connection.',
        imported: 0
    });
});

// Run warmup (mock for standalone)
app.post('/api/profiles/:profileId/run', async (req, res) => {
    res.json({
        success: false,
        message: 'Warmup execution not available in standalone mode. Deploy to Railway or connect to AdsPower server.'
    });
});

// Get stats
app.get('/api/stats', async (req, res) => {
    try {
        const profilesPath = path.join(DATA_DIR, 'profiles.json');
        const data = await fs.readFile(profilesPath, 'utf8');
        const profiles = JSON.parse(data);

        const stats = {
            totalProfiles: profiles.length,
            activeProfiles: profiles.filter(p => p.status === 'active').length,
            totalRuns: profiles.reduce((sum, p) => sum + (p.stats?.totalRuns || 0), 0),
            lastRun: profiles.reduce((latest, p) => {
                if (!p.stats?.lastRun) return latest;
                return !latest || p.stats.lastRun > latest ? p.stats.lastRun : latest;
            }, null)
        };

        res.json({ success: true, stats });
    } catch (error) {
        res.json({ success: true, stats: { totalProfiles: 0, activeProfiles: 0, totalRuns: 0, lastRun: null } });
    }
});

// Serve UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║     Gmail Warmup V2 - Standalone Dashboard                ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔌 API: http://localhost:${PORT}/api`);
    console.log('\n📋 Available:');
    console.log('  • View and manage profiles');
    console.log('  • Configure schedules');
    console.log('  • View statistics');
    console.log('  • Test UI and workflows\n');
    console.log('⚠️  Note: Warmup execution requires AdsPower connection');
    console.log('        Deploy to Railway or connect to AdsPower server\n');
    console.log('══════════════════════════════════════════════════════════════\n');
});

// Keep process alive
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down gracefully...\n');
    process.exit(0);
});
