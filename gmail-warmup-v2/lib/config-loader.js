/**
 * agent-vault Config Loader for Gmail Warmup V2
 *
 * This module demonstrates how to securely load configuration
 * using agent-vault to keep secrets hidden from AI agents.
 */

const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ConfigLoader {
    constructor(configPath) {
        this.configPath = configPath;
        this.runtimeConfig = null;
    }

    /**
     * Load configuration using agent-vault
     * This reads placeholders and expands them to real values
     */
    load() {
        try {
            // Check if agent-vault is available
            const vaultAvailable = this.checkAgentVault();

            if (vaultAvailable) {
                return this.loadWithAgentVault();
            } else {
                console.warn('⚠️  agent-vault not found, loading config directly');
                return this.loadDirect();
            }
        } catch (error) {
            throw new Error(`Failed to load config: ${error.message}`);
        }
    }

    /**
     * Check if agent-vault is installed and available
     */
    checkAgentVault() {
        try {
            execSync('which agent-vault', { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Load config using agent-vault (secure method)
     */
    loadWithAgentVault() {
        console.log('🔐 Loading config with agent-vault...');

        // Read config file with placeholders via agent-vault
        const configContent = execSync(`agent-vault read "${this.configPath}"`, {
            encoding: 'utf8'
        });

        // Parse YAML
        let config = YAML.parse(configContent);

        // Create runtime config with expanded secrets
        const runtimeConfig = this.expandSecrets(config);

        // Write to temporary file (for runtime use)
        const tempPath = path.join(path.dirname(this.configPath), '.runtime.json');
        fs.writeFileSync(tempPath, JSON.stringify(runtimeConfig, null, 2));

        // Set cleanup on exit
        process.on('exit', () => {
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        });

        this.runtimeConfig = runtimeConfig;

        console.log('✅ Config loaded securely');
        return runtimeConfig;
    }

    /**
     * Load config directly without agent-vault (fallback)
     */
    loadDirect() {
        const content = fs.readFileSync(this.configPath, 'utf8');
        const config = YAML.parse(content);
        return this.expandSecrets(config);
    }

    /**
     * Expand agent-vault placeholders to real values
     */
    expandSecrets(config) {
        const secrets = this.getAllSecrets();
        const expanded = JSON.parse(JSON.stringify(config)); // Deep clone

        this.expandObject(expanded, secrets);
        return expanded;
    }

    /**
     * Recursively expand placeholders in object
     */
    expandObject(obj, secrets) {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = this.expandPlaceholder(obj[key], secrets);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.expandObject(obj[key], secrets);
            }
        }
    }

    /**
     * Expand a single placeholder
     */
    expandPlaceholder(value, secrets) {
        const match = value.match(/<agent-vault:([^>]+)>/);

        if (match) {
            const key = match[1];
            if (secrets[key]) {
                return secrets[key];
            } else {
                console.warn(`⚠️  Secret "${key}" not found in vault`);
                return value;
            }
        }

        return value;
    }

    /**
     * Get all secrets from vault
     */
    getAllSecrets() {
        try {
            const result = execSync('agent-vault list --json', {
                encoding: 'utf8'
            });

            const data = JSON.parse(result);
            const secrets = {};

            // We can't get actual values via safe commands
            // This is a placeholder for the expansion logic
            // In production, you'd use agent-vault write to expand

            return secrets;
        } catch (error) {
            // agent-vault list might not support --json in all versions
            return {};
        }
    }
}

/**
 * Convenience function to load config
 */
function loadConfig(configPath) {
    const loader = new ConfigLoader(configPath);
    return loader.load();
}

/**
 * Load config and write expanded version to temp file
 */
function loadConfigToTemp(configPath) {
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Use agent-vault write to expand placeholders
    const tempPath = path.join(path.dirname(configPath), '.runtime-config.yaml');

    execSync(`agent-vault write "${tempPath}" --content '${configContent}'`, {
        stdio: 'inherit'
    });

    // Load the expanded config
    const expanded = YAML.parse(fs.readFileSync(tempPath, 'utf8'));

    // Clean up
    fs.unlinkSync(tempPath);

    return expanded;
}

module.exports = {
    ConfigLoader,
    loadConfig,
    loadConfigToTemp
};
