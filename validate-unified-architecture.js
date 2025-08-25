#!/usr/bin/env node

/**
 * 🎯 UNIFIED ARCHITECTURE VALIDATION SCRIPT
 * 
 * Validates that the unified bot architecture is working correctly
 * in both development and production modes.
 * 
 * v4.4.0 - Environment Detection & Configuration System
 */

const { spawn } = require('child_process');
const path = require('path');

class UnifiedArchitectureValidator {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString().substr(11, 8);
        const icons = {
            info: '📋',
            success: '✅',
            error: '❌',
            warning: '⚠️ ',
            progress: '🔍'
        };
        console.log(`${icons[type]} [${timestamp}] ${message}`);
    }

    async runTest(testName, testFunction) {
        this.log(`Running test: ${testName}`, 'progress');
        this.results.total++;
        
        try {
            await testFunction();
            this.log(`✅ PASSED: ${testName}`, 'success');
            this.results.passed++;
        } catch (error) {
            this.log(`❌ FAILED: ${testName} - ${error.message}`, 'error');
            this.results.failed++;
        }
    }

    async testFileExists(filePath, description) {
        const fs = require('fs').promises;
        try {
            await fs.access(filePath);
            this.log(`✅ File exists: ${description}`, 'success');
        } catch (error) {
            throw new Error(`File missing: ${filePath}`);
        }
    }

    async testEnvironmentDetection() {
        const EnvironmentConfig = require('./config/environments.js');
        
        // Test development environment
        delete process.env.RAILWAY_ENVIRONMENT;
        process.env.NODE_ENV = 'development';
        
        const devConfig = new EnvironmentConfig();
        if (devConfig.isDevelopment() !== true) {
            throw new Error('Development environment detection failed');
        }
        
        // Test production environment (Railway simulation)
        process.env.RAILWAY_ENVIRONMENT = 'production';
        process.env.PORT = '3000';
        
        const prodConfig = new EnvironmentConfig();
        if (prodConfig.isProduction() !== true) {
            throw new Error('Production environment detection failed');
        }
        
        this.log('Environment detection working correctly', 'success');
    }

    async testUnifiedBotComponents() {
        // Test that unified bot can be imported without errors
        const UnifiedBot = require('./core/unified-bot.js');
        
        // Set mock environment variables for testing
        const originalEnv = process.env.OPENAI_API_KEY;
        process.env.OPENAI_API_KEY = 'test-key-for-validation';
        process.env.SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_SERVICE_KEY = 'test-key';
        
        try {
            // Test bot initialization (without starting)
            const bot = new UnifiedBot();
            
            if (!bot.envConfig) {
                throw new Error('Environment config not initialized');
            }
            
            if (!bot.logger) {
                throw new Error('Logger not initialized');
            }
            
            this.log('Unified bot components initialized successfully', 'success');
            
        } finally {
            // Restore original environment
            if (originalEnv) {
                process.env.OPENAI_API_KEY = originalEnv;
            } else {
                delete process.env.OPENAI_API_KEY;
            }
            delete process.env.SUPABASE_URL;
            delete process.env.SUPABASE_SERVICE_KEY;
        }
    }

    async testDependencyIntegration() {
        // Test all major dependencies can be loaded
        const dependencies = [
            'smart-cache-v2.js',
            'deterministic-router.js',
            'context-optimizer.js',
            'version.js'
        ];
        
        for (const dep of dependencies) {
            try {
                require(`./${dep}`);
                this.log(`✅ Dependency loaded: ${dep}`, 'success');
            } catch (error) {
                throw new Error(`Failed to load dependency: ${dep}`);
            }
        }
    }

    async testPackageJsonIntegration() {
        const packageJson = require('./package.json');
        
        if (packageJson.version !== '4.4.0') {
            throw new Error(`Version mismatch. Expected 4.4.0, got ${packageJson.version}`);
        }
        
        const requiredScripts = ['start', 'dev', 'test'];
        for (const script of requiredScripts) {
            if (!packageJson.scripts[script]) {
                throw new Error(`Missing script: ${script}`);
            }
        }
        
        this.log('Package.json configuration validated', 'success');
    }

    async testLauncherScripts() {
        await this.testFileExists('./production.js', 'Production launcher');
        await this.testFileExists('./development.js', 'Development launcher');
        
        // Test that launchers can be imported without syntax errors
        require('./production.js');
        require('./development.js');
        
        this.log('Launcher scripts validated', 'success');
    }

    async validate() {
        console.log('\n🚀 UNIFIED ARCHITECTURE VALIDATION - v4.4.0');
        console.log('='.repeat(50));
        
        await this.runTest('Core Files Exist', async () => {
            await this.testFileExists('./core/unified-bot.js', 'Unified Bot Core');
            await this.testFileExists('./config/environments.js', 'Environment Config');
            await this.testFileExists('./package.json', 'Package Configuration');
        });

        await this.runTest('Environment Detection', () => this.testEnvironmentDetection());
        await this.runTest('Unified Bot Components', () => this.testUnifiedBotComponents());
        await this.runTest('Dependency Integration', () => this.testDependencyIntegration());
        await this.runTest('Package.json Integration', () => this.testPackageJsonIntegration());
        await this.runTest('Launcher Scripts', () => this.testLauncherScripts());

        // Final report
        console.log('\n📊 VALIDATION RESULTS');
        console.log('='.repeat(30));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📊 Total: ${this.results.total}`);
        
        const successRate = (this.results.passed / this.results.total * 100).toFixed(1);
        console.log(`📈 Success Rate: ${successRate}%`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 ✅ UNIFIED ARCHITECTURE VALIDATION SUCCESSFUL!');
            console.log('✅ All systems operational in v4.4.0');
            console.log('✅ Environment detection working correctly');
            console.log('✅ Ready for development and production use');
            console.log('\n🚀 USAGE:');
            console.log('   Development: npm run dev');
            console.log('   Production:  npm start');
            console.log('   Testing:     npm test');
        } else {
            console.log('\n❌ VALIDATION FAILED - Issues need to be resolved');
            process.exit(1);
        }
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new UnifiedArchitectureValidator();
    validator.validate().catch(error => {
        console.error('❌ Validation script failed:', error);
        process.exit(1);
    });
}

module.exports = UnifiedArchitectureValidator;