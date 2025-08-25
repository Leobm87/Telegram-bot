#!/usr/bin/env node
/**
 * LAUNCHER PARA PRODUCCIÓN (RAILWAY)
 * 
 * Este archivo inicia el bot en modo producción:
 * - Logging mínimo (console only)
 * - Servidor Express con health checks
 * - Debug deshabilitado
 * - Optimizado para Railway
 */

const MultiFirmProductionBot = require('./multiFirmProductionBot');
const express = require('express');

console.log('🚀 INICIANDO EN MODO PRODUCCIÓN...');

// Railway automáticamente detecta el ambiente
// No necesitamos forzar NODE_ENV

try {
    const bot = new MultiFirmProductionBot();
    
    // Express server for Railway health checks
    const app = express();
    const PORT = process.env.PORT || 8080;
    
    app.get('/', (req, res) => {
        res.json({ 
            status: 'online',
            bot: 'ElTrader Financiado Bot v4.4',
            firms: 7,
            environment: 'production'
        });
    });
    
    app.listen(PORT, () => {
        console.log(`🌐 Servidor disponible en puerto ${PORT}`);
    });
    
    // Manejo graceful de shutdown para Railway
    process.on('SIGTERM', () => {
        console.log('📴 SIGTERM recibido, cerrando bot...');
        process.exit(0);
    });
    
    process.on('SIGINT', () => {
        console.log('📴 SIGINT recibido, cerrando bot...');
        process.exit(0);
    });
    
} catch (error) {
    console.error('❌ Error iniciando bot en producción:', error.message);
    process.exit(1);
}