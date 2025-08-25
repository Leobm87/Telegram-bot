/**
 * CONFIGURACIÓN UNIFICADA POR AMBIENTE
 * 
 * Este archivo elimina la duplicación de código entre desarrollo y producción
 * Detecta automáticamente el ambiente y aplica la configuración correcta
 */

const winston = require('winston');

class EnvironmentConfig {
    constructor() {
        this.environment = this.detectEnvironment();
        this.config = this.getConfig();
    }

    detectEnvironment() {
        // Railway siempre tiene RAILWAY_ENVIRONMENT
        if (process.env.RAILWAY_ENVIRONMENT) {
            return 'production';
        }
        
        // Variables locales de desarrollo
        if (process.env.NODE_ENV === 'development' || !process.env.PORT) {
            return 'development';
        }
        
        // Default a desarrollo si hay dudas
        return 'development';
    }

    getConfig() {
        const baseConfig = {
            // Configuración común para todos los ambientes
            botName: 'ElTrader Financiado Bot',
            version: '4.3.0',
            maxRetries: 3,
            cacheTimeout: 5 * 60 * 1000, // 5 minutos
            
            // Configuración de OpenAI
            openai: {
                model: 'gpt-4o-mini',
                maxTokens: 600,
                temperature: 0.1
            }
        };

        const environmentConfigs = {
            development: {
                ...baseConfig,
                
                // LOGGING: Completo con Winston + archivos
                logging: {
                    level: 'debug',
                    useWinston: true,
                    useFiles: true,
                    console: true,
                    logDir: '../logs'
                },
                
                // SERVIDOR: Sin Express, bot directo
                server: {
                    enabled: false,
                    port: null
                },
                
                // DEBUG: Habilitado
                debug: {
                    enabled: true,
                    showQueries: true,
                    showResponses: true,
                    performanceMetrics: true
                },
                
                // TELEGRAM: Polling más frecuente para desarrollo
                telegram: {
                    polling: {
                        interval: 1000
                    }
                }
            },

            production: {
                ...baseConfig,
                
                // LOGGING: Mínimo para Railway
                logging: {
                    level: 'info',
                    useWinston: false,
                    useFiles: false,
                    console: true,
                    logDir: null
                },
                
                // SERVIDOR: Express habilitado para Railway
                server: {
                    enabled: true,
                    port: process.env.PORT || 3000,
                    healthCheck: '/health',
                    statusEndpoint: '/status'
                },
                
                // DEBUG: Deshabilitado para performance
                debug: {
                    enabled: false,
                    showQueries: false,
                    showResponses: false,
                    performanceMetrics: false
                },
                
                // TELEGRAM: Polling optimizado para producción
                telegram: {
                    polling: {
                        interval: 2000
                    }
                }
            }
        };

        return environmentConfigs[this.environment];
    }

    // Crear logger según ambiente
    createLogger() {
        if (this.config.logging.useWinston) {
            // Desarrollo: Winston completo
            return winston.createLogger({
                level: this.config.logging.level,
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                ),
                transports: [
                    new winston.transports.Console({
                        format: winston.format.simple()
                    }),
                    ...(this.config.logging.useFiles ? [
                        new winston.transports.File({ 
                            filename: `${this.config.logging.logDir}/error.log`, 
                            level: 'error' 
                        }),
                        new winston.transports.File({ 
                            filename: `${this.config.logging.logDir}/combined.log` 
                        })
                    ] : [])
                ]
            });
        } else {
            // Producción: Console simple
            return {
                info: (msg) => console.log(`[INFO] ${msg}`),
                error: (msg) => console.error(`[ERROR] ${msg}`),
                warn: (msg) => console.warn(`[WARN] ${msg}`),
                debug: (msg) => {
                    if (this.config.debug.enabled) {
                        console.log(`[DEBUG] ${msg}`);
                    }
                }
            };
        }
    }

    // Helper methods para validación
    isDevelopment() {
        return this.environment === 'development';
    }

    isProduction() {
        return this.environment === 'production';
    }

    getEnvironment() {
        return this.environment;
    }

    // Mostrar configuración actual
    displayConfig() {
        const logger = this.createLogger();
        
        logger.info(`🚀 ELTRADER BOT INICIADO`);
        logger.info(`📊 Ambiente: ${this.environment.toUpperCase()}`);
        logger.info(`🤖 Versión: ${this.config.version}`);
        
        if (this.config.server.enabled) {
            logger.info(`🌐 Servidor Express: Puerto ${this.config.server.port}`);
        } else {
            logger.info(`🔧 Modo desarrollo: Bot directo`);
        }
        
        if (this.config.debug.enabled) {
            logger.info(`🔍 Debug habilitado: Métricas y queries visibles`);
        }
    }
}

module.exports = EnvironmentConfig;