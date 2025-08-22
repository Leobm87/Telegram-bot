/**
 * RAILWAY PRODUCTION SERVER - ElTrader Financiado Bot
 * Minimal logging, production-ready
 */

const express = require('express');
const MultiFirmProductionBot = require('./multiFirmProductionBot');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

// Railway health check
app.get('/', (req, res) => {
    res.json({
        status: 'ElTrader Bot ONLINE',
        version: '2.0.0',
        uptime: Math.round(process.uptime()),
        firms: 7
    });
});

// Simple status check
app.get('/status', (req, res) => {
    res.json({
        bot: bot ? 'running' : 'stopped',
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        timestamp: new Date().toISOString()
    });
});

let bot = null;

async function startBot() {
    try {
        console.log('🚂 Starting bot on Railway...');
        
        // Check required env vars
        const required = ['TELEGRAM_BOT_TOKEN', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'OPENAI_API_KEY'];
        const missing = required.filter(env => !process.env[env]);
        
        if (missing.length > 0) {
            throw new Error(`Missing env vars: ${missing.join(', ')}`);
        }
        
        bot = new MultiFirmProductionBot();
        console.log('✅ Bot started successfully');
        
    } catch (error) {
        console.error('❌ Bot startup failed:', error.message);
        process.exit(1);
    }
}

app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`);
    startBot();
});

// Graceful shutdown
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

module.exports = app;