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

const UnifiedMultiFirmBot = require('./core/unified-bot');

console.log('🚀 INICIANDO EN MODO PRODUCCIÓN...');

// Railway automáticamente detecta el ambiente
// No necesitamos forzar NODE_ENV

try {
    const bot = new UnifiedMultiFirmBot();
    bot.start();
    
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