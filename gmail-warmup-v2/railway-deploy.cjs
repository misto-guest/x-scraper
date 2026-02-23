#!/usr/bin/env node

/**
 * Railway Deployment CLI
 * Universal deployment tool for Railway
 *
 * Usage:
 *   railway-deploy init              # Initialize deployment config
 *   railway-deploy deploy            # Deploy to Railway
 *   railway-deploy deploy --yes      # Deploy without confirmation
 *   railway-deploy status            # Check deployment status
 *   railway-deploy logs              # View logs
 *   railway-deploy url               # Get deployment URL
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    banner: (msg) => console.log(`${colors.bright}${colors.blue}${msg}${colors.reset}`)
};

/**
 * Check if Railway CLI is installed
 */
function checkRailwayCLI() {
    try {
        execSync('railway --version', { stdio: 'ignore' });
        return true;
    } catch {
        log.info('Railway CLI not found. Installing...');
        execSync('npm install -g @railway/cli', { stdio: 'inherit' });
        log.success('Railway CLI installed');
        return true;
    }
}

/**
 * Detect project type
 */
function detectProjectType() {
    const packageJson = path.join(process.cwd(), 'package.json');
    const requirementsTxt = path.join(process.cwd(), 'requirements.txt');
    const dockerfile = path.join(process.cwd(), 'Dockerfile');
    const indexHtml = path.join(process.cwd(), 'index.html');

    if (fs.existsSync(packageJson)) {
        const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps.next) return { type: 'nodejs', framework: 'nextjs' };
        if (deps.express) return { type: 'nodejs', framework: 'express' };
        if (deps.react) return { type: 'nodejs', framework: 'react' };
        if (deps.vue) return { type: 'nodejs', framework: 'vue' };
        return { type: 'nodejs', framework: 'node' };
    }

    if (fs.existsSync(requirementsTxt)) return { type: 'python', framework: 'python' };
    if (fs.existsSync(dockerfile)) return { type: 'docker', framework: 'docker' };
    if (fs.existsSync(indexHtml)) return { type: 'static', framework: 'static' };

    return { type: 'nodejs', framework: 'node' };
}

/**
 * Get app name
 */
function getAppName() {
    // Try package.json
    const packageJson = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJson)) {
        const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
        if (pkg.name) return pkg.name;
    }

    // Try git repo
    try {
        const remote = execSync('git remote get-url origin', { encoding: 'utf8' });
        return remote.trim().split('/').pop().replace('.git', '');
    } catch {}

    // Use directory name
    return path.basename(process.cwd()).toLowerCase().replace(/[^a-z0-9-]/g, '');
}

/**
 * Initialize Railway config
 */
function initRailwayConfig(options = {}) {
    log.banner('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log.banner('   🚀 Railway Deployment Initialization');
    log.banner('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    checkRailwayCLI();

    const { type, framework } = detectProjectType();
    log.info(`Detected: ${type} ${framework ? `(${framework})` : ''}`);

    let appName = options.app || getAppName();
    log.info(`App name: ${appName}`);

    // Create .railway-app.yml
    const config = {
        app: appName,
        type: type,
        framework: framework,
        build: {
            command: getBuildCommand(type, framework)
        },
        start: {
            command: getStartCommand(type, framework)
        },
        environment: [
            { key: 'NODE_ENV', value: 'production' },
            { key: 'PORT', value: '18789' }
        ]
    };

    const configPath = path.join(process.cwd(), '.railway-app.yml');
    fs.writeFileSync(configPath, `# Railway App Configuration\n# Generated: ${new Date().toISOString()}\n\n` +
        `app: "${appName}"\n` +
        `type: "${type}"\n` +
        `framework: "${framework}"\n\n` +
        `build:\n` +
        `  command: "${config.build.command}"\n\n` +
        `start:\n` +
        `  command: "${config.start.command}"\n\n` +
        `environment:\n` +
        config.environment.map(e => `  - key: "${e.key}"\n    value: "${e.value}"`).join('\n') + '\n'
    );

    log.success(`Configuration created: ${configPath}`);

    // Create .env.example if doesn't exist
    const envExample = path.join(process.cwd(), '.env.example');
    if (!fs.existsSync(envExample)) {
        fs.writeFileSync(envExample,
            '# Environment Variables\n' +
            '# Copy this file to .env and fill in your values\n\n' +
            'NODE_ENV=production\n' +
            'PORT=18789\n'
        );
        log.success(`Example .env created: ${envExample}`);
    }

    // Create DEPLOYMENT_INFO.md
    const deploymentInfo = `# Deployment Information\n\n` +
        `**Initialized:** ${new Date().toISOString()}\n` +
        `**App Name:** ${appName}\n` +
        `**Project Type:** ${type} ${framework ? `(${framework})` : ''}\n\n` +
        `## Next Steps\n\n` +
        `1. Review \`.railway-app.yml\` configuration\n` +
        `2. Fill in \`.env\` with your environment variables\n` +
        `3. Run: \`railway-deploy deploy\`\n\n` +
        `## Commands\n\n` +
        `\`\`\`bash\n` +
        `# Deploy\n` +
        `railway-deploy deploy\n\n` +
        `# View logs\n` +
        `railway-deploy logs\n\n` +
        `# Get URL\n` +
        `railway-deploy url\n\n` +
        `# Check status\n` +
        `railway-deploy status\n` +
        `\`\`\`\n`;

    fs.writeFileSync(path.join(process.cwd(), 'DEPLOYMENT_INFO.md'), deploymentInfo);
    log.success(`Deployment guide created: DEPLOYMENT_INFO.md`);

    log.success('\n🎉 Initialization complete!');
    log.info('Run "railway-deploy deploy" to deploy to Railway');
}

function getBuildCommand(type, framework) {
    const commands = {
        nodejs: {
            nextjs: 'npm install && npm run build',
            express: 'npm install',
            react: 'npm install && npm run build',
            vue: 'npm install && npm run build',
            node: 'npm install'
        },
        python: {
            python: 'pip install -r requirements.txt'
        },
        docker: {
            docker: 'docker build -t app .'
        },
        static: {
            static: 'npm install -g serve'
        }
    };
    return commands[type]?.[framework] || 'npm install';
}

function getStartCommand(type, framework) {
    const commands = {
        nodejs: {
            nextjs: 'npm start',
            express: 'npm start',
            react: 'npm start',
            vue: 'npm start',
            node: 'npm start'
        },
        python: {
            python: 'python app.py'
        },
        docker: {
            docker: 'docker run -p 80:80 app'
        },
        static: {
            static: 'serve -s . -p 80'
        }
    };
    return commands[type]?.[framework] || 'npm start';
}

/**
 * Deploy to Railway
 */
async function deployToRailway(options = {}) {
    log.banner('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log.banner('   🚀 Deploying to Railway');
    log.banner('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    checkRailwayCLI();

    // Check if logged in
    try {
        execSync('railway status', { stdio: 'ignore' });
    } catch {
        log.warning('Not logged into Railway');
        execSync('railway login', { stdio: 'inherit' });
    }

    // Load environment variables
    await loadEnvVariables(options);

    // Deploy
    log.info('Deploying to Railway...');
    try {
        execSync('railway up', { stdio: 'inherit' });
        log.success('\n✅ Deployment started!');
    } catch (error) {
        log.error('Deployment failed');
        process.exit(1);
    }

    // Get URL
    setTimeout(() => {
        try {
            const domain = execSync('railway domain', { encoding: 'utf8' }).trim().split('\n')[0];
            log.success(`🌐 Deployed to: ${domain}`);

            // Save URL
            fs.writeFileSync(path.join(process.cwd(), '.railway-url'), domain);
        } catch {}
    }, 3000);
}

/**
 * Load environment variables
 */
async function loadEnvVariables(options = {}) {
    const envFile = path.join(process.cwd(), '.env');

    if (!fs.existsSync(envFile)) {
        log.warning('No .env file found');
        return;
    }

    const envContent = fs.readFileSync(envFile, 'utf8');
    const variables = envContent
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.split('='))
        .filter(([key]) => key);

    if (variables.length === 0) return;

    log.info(`Found ${variables.length} environment variables`);

    if (!options.yes) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise(resolve => {
            rl.question('Load environment variables to Railway? (y/n): ', resolve);
        });
        rl.close();

        if (answer.toLowerCase() !== 'y') return;
    }

    for (const [key, value] of variables) {
        try {
            execSync(`railway variables set "${key.trim()}=${value.trim()}"`, { stdio: 'ignore' });
            log.info(`Set: ${key}`);
        } catch {
            log.warning(`Failed to set: ${key}`);
        }
    }

    log.success('Environment variables loaded');
}

/**
 * Get deployment URL
 */
function getUrl() {
    try {
        const domain = execSync('railway domain', { encoding: 'utf8' }).trim().split('\n')[0];
        log.success(`🌐 ${domain}`);
        return domain;
    } catch {
        log.error('Could not retrieve URL');
    }
}

/**
 * View logs
 */
function viewLogs() {
    try {
        execSync('railway logs -f', { stdio: 'inherit' });
    } catch {
        log.error('Could not fetch logs');
    }
}

/**
 * Check status
 */
function checkStatus() {
    log.info('Checking Railway status...');
    try {
        const output = execSync('railway status', { encoding: 'utf8' });
        console.log(output);
    } catch {
        log.error('Could not check status');
    }
}

// CLI interface
const command = process.argv[2];
const options = {
    yes: process.argv.includes('--yes') || process.argv.includes('-y'),
    app: process.argv.find(arg => arg.startsWith('--app='))?.split('=')[1]
};

switch (command) {
    case 'init':
        initRailwayConfig(options);
        break;
    case 'deploy':
        deployToRailway(options);
        break;
    case 'url':
        getUrl();
        break;
    case 'logs':
        viewLogs();
        break;
    case 'status':
        checkStatus();
        break;
    default:
        console.log(`
Railway Deployment CLI

Usage:
  railway-deploy init              Initialize Railway config
  railway-deploy deploy            Deploy to Railway
  railway-deploy deploy --yes      Deploy without confirmation
  railway-deploy url               Get deployment URL
  railway-deploy logs              View live logs
  railway-deploy status            Check deployment status

Options:
  --yes, -y                       Auto-confirm all prompts
  --app=NAME                      Specify app name

Examples:
  railway-deploy init
  railway-deploy deploy --yes
  railway-deploy url
        `);
}
