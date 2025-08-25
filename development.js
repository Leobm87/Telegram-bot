#!/usr/bin/env node
/**
 * LAUNCHER PARA DESARROLLO LOCAL
 * 
 * Este archivo inicia el bot en modo desarrollo:
 * - Logging completo con Winston + archivos
 * - Sin servidor Express
 * - Debug habilitado
 * - Bot directo sin wrapper
 */

require('dotenv').config();
const UnifiedMultiFirmBot = require('./core/unified-bot');

console.log('🔧 INICIANDO EN MODO DESARROLLO...');

// Forzar ambiente de desarrollo
process.env.NODE_ENV = 'development';

try {
    const bot = new UnifiedMultiFirmBot();
    bot.start();
} catch (error) {
    console.error('❌ Error iniciando bot en desarrollo:', error.message);
    process.exit(1);
}