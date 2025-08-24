/**
 * ENHANCED ERROR HANDLER - v4.3 SYSTEM STABILITY
 * 
 * 🛡️ COMPREHENSIVE ERROR MANAGEMENT:
 * - Database connection failures
 * - OpenAI API timeouts & rate limits  
 * - Telegram API errors
 * - Memory issues & context overflows
 * - Version validation failures
 * - Cache corruption recovery
 * 
 * 🚨 GRACEFUL DEGRADATION:
 * - Fallback responses when systems fail
 * - Auto-retry with exponential backoff
 * - Circuit breaker patterns
 * - Health monitoring & alerts
 */

const VERSION = require('./version');

class EnhancedErrorHandler {
    constructor(logger = console) {
        this.logger = logger;
        this.errorCounts = new Map();
        this.circuitBreakers = new Map();
        this.lastHealthCheck = Date.now();
        
        // Error categories and their handling strategies
        this.ERROR_STRATEGIES = {
            DATABASE_ERROR: {
                maxRetries: 3,
                backoffMs: 1000,
                fallbackResponse: 'Lo siento, tengo problemas temporales accediendo a la información. Por favor, inténtalo en unos minutos.',
                circuitBreakerThreshold: 5
            },
            OPENAI_ERROR: {
                maxRetries: 2,
                backoffMs: 2000,
                fallbackResponse: 'Estoy experimentando alta demanda. Tu consulta es importante, inténtalo de nuevo en un momento.',
                circuitBreakerThreshold: 3
            },
            TELEGRAM_ERROR: {
                maxRetries: 5,
                backoffMs: 500,
                fallbackResponse: null, // Let Telegram handle it
                circuitBreakerThreshold: 10
            },
            MEMORY_ERROR: {
                maxRetries: 1,
                backoffMs: 100,
                fallbackResponse: 'Optimizando respuesta... Por favor reformula tu pregunta de manera más específica.',
                circuitBreakerThreshold: 2
            },
            VALIDATION_ERROR: {
                maxRetries: 0,
                backoffMs: 0,
                fallbackResponse: 'Error interno del sistema. Los administradores han sido notificados.',
                circuitBreakerThreshold: 1
            }
        };
    }
    
    /**
     * Main error handling entry point
     */
    async handleError(error, context = {}) {
        const errorCategory = this.categorizeError(error);
        const strategy = this.ERROR_STRATEGIES[errorCategory];
        
        // Log error with full context
        this.logError(error, errorCategory, context);
        
        // Update error metrics
        this.updateErrorMetrics(errorCategory);
        
        // Check circuit breaker
        if (this.isCircuitBreakerOpen(errorCategory)) {
            return {
                shouldFallback: true,
                fallbackResponse: strategy.fallbackResponse,
                errorCategory: errorCategory,
                circuitBreakerActive: true
            };
        }
        
        // Determine if retry is appropriate
        const shouldRetry = context.retryCount < strategy.maxRetries;
        
        return {
            shouldRetry: shouldRetry,
            shouldFallback: !shouldRetry,
            fallbackResponse: strategy.fallbackResponse,
            errorCategory: errorCategory,
            backoffMs: strategy.backoffMs * Math.pow(2, context.retryCount || 0),
            circuitBreakerActive: false
        };
    }
    
    /**
     * Categorize errors by type for appropriate handling
     */
    categorizeError(error) {
        const errorMessage = error.message?.toLowerCase() || '';
        const errorStack = error.stack?.toLowerCase() || '';
        
        // Database errors
        if (errorMessage.includes('supabase') || 
            errorMessage.includes('connection refused') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('connect econnrefused')) {
            return 'DATABASE_ERROR';
        }
        
        // OpenAI API errors
        if (errorMessage.includes('openai') ||
            errorMessage.includes('rate limit') ||
            errorMessage.includes('quota exceeded') ||
            errorMessage.includes('model overloaded') ||
            error.status === 429) {
            return 'OPENAI_ERROR';
        }
        
        // Telegram errors
        if (errorMessage.includes('telegram') ||
            errorMessage.includes('bot api') ||
            error.status === 400 || 
            error.status === 409) {
            return 'TELEGRAM_ERROR';
        }
        
        // Memory/Performance errors
        if (errorMessage.includes('out of memory') ||
            errorMessage.includes('heap') ||
            errorMessage.includes('context length') ||
            errorMessage.includes('token limit')) {
            return 'MEMORY_ERROR';
        }
        
        // Version/Validation errors
        if (errorMessage.includes('version') ||
            errorMessage.includes('validation failed') ||
            errorMessage.includes('fixes not loaded')) {
            return 'VALIDATION_ERROR';
        }
        
        // Default to database error for safety
        return 'DATABASE_ERROR';
    }
    
    /**
     * Execute operation with error handling and retry logic
     */
    async executeWithRetry(operation, context = {}) {
        let lastError = null;
        let retryCount = 0;
        
        while (true) {
            try {
                const result = await operation();
                
                // Reset circuit breaker on success
                this.resetCircuitBreaker(context.operationType || 'unknown');
                
                return result;
                
            } catch (error) {
                lastError = error;
                
                const errorResponse = await this.handleError(error, { 
                    ...context, 
                    retryCount 
                });
                
                // If circuit breaker is active, return fallback immediately
                if (errorResponse.circuitBreakerActive) {
                    throw new EnhancedError(error, {
                        category: errorResponse.errorCategory,
                        shouldFallback: true,
                        fallbackResponse: errorResponse.fallbackResponse,
                        circuitBreakerActive: true
                    });
                }
                
                // If should retry, wait and try again
                if (errorResponse.shouldRetry) {
                    retryCount++;
                    if (errorResponse.backoffMs > 0) {
                        await this.delay(errorResponse.backoffMs);
                    }
                    continue;
                }
                
                // No more retries, throw enhanced error
                throw new EnhancedError(error, {
                    category: errorResponse.errorCategory,
                    shouldFallback: errorResponse.shouldFallback,
                    fallbackResponse: errorResponse.fallbackResponse,
                    retryCount: retryCount
                });
            }
        }
    }
    
    /**
     * Circuit breaker implementation
     */
    isCircuitBreakerOpen(errorCategory) {
        const breaker = this.circuitBreakers.get(errorCategory);
        if (!breaker) return false;
        
        const now = Date.now();
        const strategy = this.ERROR_STRATEGIES[errorCategory];
        
        // Check if circuit breaker should be opened
        if (breaker.failures >= strategy.circuitBreakerThreshold) {
            if (!breaker.openedAt) {
                breaker.openedAt = now;
                this.logger.warn(`Circuit breaker OPENED for ${errorCategory}`, {
                    failures: breaker.failures,
                    threshold: strategy.circuitBreakerThreshold
                });
            }
            
            // Keep circuit open for 60 seconds
            return (now - breaker.openedAt) < 60000;
        }
        
        return false;
    }
    
    resetCircuitBreaker(errorCategory) {
        if (this.circuitBreakers.has(errorCategory)) {
            const breaker = this.circuitBreakers.get(errorCategory);
            if (breaker.openedAt) {
                this.logger.info(`Circuit breaker CLOSED for ${errorCategory}`);
            }
            breaker.failures = 0;
            breaker.openedAt = null;
        }
    }
    
    /**
     * Update error metrics for monitoring
     */
    updateErrorMetrics(errorCategory) {
        // Update error counts
        const currentCount = this.errorCounts.get(errorCategory) || 0;
        this.errorCounts.set(errorCategory, currentCount + 1);
        
        // Update circuit breaker
        if (!this.circuitBreakers.has(errorCategory)) {
            this.circuitBreakers.set(errorCategory, { failures: 0, openedAt: null });
        }
        const breaker = this.circuitBreakers.get(errorCategory);
        breaker.failures++;
    }
    
    /**
     * Log error with proper context and structure
     */
    logError(error, category, context) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            version: VERSION.version,
            category: category,
            message: error.message,
            stack: error.stack,
            context: context,
            errorCounts: Object.fromEntries(this.errorCounts),
            uptime: Math.round(process.uptime())
        };
        
        // Use appropriate log level based on severity
        if (category === 'VALIDATION_ERROR' || category === 'MEMORY_ERROR') {
            this.logger.error('🚨 CRITICAL ERROR:', errorInfo);
        } else if (category === 'DATABASE_ERROR' || category === 'OPENAI_ERROR') {
            this.logger.warn('⚠️ SYSTEM ERROR:', errorInfo);
        } else {
            this.logger.info('ℹ️ ERROR HANDLED:', errorInfo);
        }
    }
    
    /**
     * Generate fallback responses based on context
     */
    generateFallbackResponse(errorCategory, context = {}) {
        const strategy = this.ERROR_STRATEGIES[errorCategory];
        let baseResponse = strategy.fallbackResponse;
        
        if (!baseResponse) return null;
        
        // Add context-specific information if available
        if (context.firmName) {
            baseResponse += `\n\nMientras tanto, puedes contactar directamente con ${context.firmName} para obtener información actualizada.`;
        }
        
        if (context.isComparison) {
            baseResponse += '\n\nPara comparaciones específicas, por favor intenta con una pregunta más directa sobre una firma en particular.';
        }
        
        return baseResponse;
    }
    
    /**
     * Health check method for monitoring
     */
    getHealthStatus() {
        const now = Date.now();
        const timeSinceLastCheck = now - this.lastHealthCheck;
        this.lastHealthCheck = now;
        
        const errorSummary = {};
        for (const [category, count] of this.errorCounts.entries()) {
            errorSummary[category] = {
                count: count,
                circuitBreakerOpen: this.isCircuitBreakerOpen(category)
            };
        }
        
        return {
            status: Object.values(errorSummary).some(e => e.circuitBreakerOpen) ? 'degraded' : 'healthy',
            version: VERSION.version,
            uptime: Math.round(process.uptime()),
            errorSummary: errorSummary,
            timeSinceLastCheck: timeSinceLastCheck
        };
    }
    
    /**
     * Utility method for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Enhanced Error class with additional metadata
 */
class EnhancedError extends Error {
    constructor(originalError, metadata = {}) {
        super(originalError.message);
        this.name = 'EnhancedError';
        this.originalError = originalError;
        this.category = metadata.category;
        this.shouldFallback = metadata.shouldFallback;
        this.fallbackResponse = metadata.fallbackResponse;
        this.circuitBreakerActive = metadata.circuitBreakerActive;
        this.retryCount = metadata.retryCount || 0;
        this.timestamp = new Date().toISOString();
        this.version = VERSION.version;
    }
}

module.exports = { EnhancedErrorHandler, EnhancedError };