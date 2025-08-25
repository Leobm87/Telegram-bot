/**
 * 🎯 CONTEXT OPTIMIZER - Performance Engine Component 3
 * 
 * GOAL: Reduce tokens sent to GPT by 60% through intent-based context optimization
 * TARGET: 1-2s response times (from 3.8s current)
 * 
 * STRATEGY:
 * 1. Intent Detection: Identify query type (pricing, plans, payout, drawdown, etc.)
 * 2. Targeted Context: Only include relevant data for the detected intent
 * 3. Field Filtering: Send only necessary fields per intent type
 * 4. Smart Aggregation: Pre-process data to reduce redundancy
 * 
 * IMPACT: 
 * - 60% token reduction → 40% faster OpenAI responses
 * - Reduced costs (fewer tokens processed)
 * - Better answer quality (focused context)
 */

class ContextOptimizer {
    constructor(logger) {
        this.logger = logger;
        
        // Intent patterns for detection
        this.intentPatterns = {
            pricing: {
                keywords: ['precio', 'costo', 'cuánto cuesta', 'valor', 'pagar', 'costar', 'cobran', 'tarifa', 'fee', 'gratis', 'gratuito', 'descuento', 'oferta'],
                requiredFields: {
                    account_plans: ['name', 'evaluation_fee', 'activation_fee', 'account_size', 'price_total'],
                    faqs: ['question', 'answer'], // Only price-related FAQs
                    discounts: ['code', 'percentage', 'description', 'requirements']
                },
                context: "precios y costos de cuentas"
            },
            
            plans: {
                keywords: ['plan', 'planes', 'cuenta', 'cuentas', 'tipo', 'tipos', 'opciones', 'tamaño', 'size', 'disponibles', 'ofrece', 'tiene'],
                requiredFields: {
                    account_plans: ['name', 'account_size', 'max_contracts', 'profit_target', 'drawdown_type', 'evaluation_fee'],
                    faqs: ['question', 'answer'], // Only plan-related FAQs
                    prop_firms: ['name', 'description']
                },
                context: "planes y tipos de cuentas disponibles"
            },
            
            payout: {
                keywords: ['retiro', 'retirar', 'pago', 'payout', 'cobrar', 'ganancia', 'profit', 'split', 'reparto', 'porcentaje', 'cuando', 'frecuencia'],
                requiredFields: {
                    payout_policies: ['profit_split_phase1', 'profit_split_phase2', 'minimum_payout', 'payout_frequency', 'payout_methods'],
                    faqs: ['question', 'answer'], // Only payout-related FAQs
                    trading_rules: ['can_trade_news', 'can_hold_overnight'] // Related to earning potential
                },
                context: "políticas de retiro y pagos"
            },
            
            drawdown: {
                keywords: ['drawdown', 'pérdida', 'límite', 'máximo', 'diario', 'trailing', 'balance', 'riesgo', 'perder', 'loss'],
                requiredFields: {
                    trading_rules: ['max_drawdown', 'daily_drawdown', 'trailing_drawdown', 'drawdown_type', 'balance_based_drawdown'],
                    account_plans: ['drawdown_type', 'trailing_threshold'],
                    faqs: ['question', 'answer'] // Only drawdown-related FAQs
                },
                context: "límites de pérdida y drawdown"
            },
            
            rules: {
                keywords: ['regla', 'reglas', 'permitido', 'prohibido', 'puedo', 'restricción', 'norma', 'requisito', 'overnight', 'news', 'noticia'],
                requiredFields: {
                    trading_rules: ['can_trade_news', 'can_hold_overnight', 'can_trade_weekends', 'minimum_days', 'consistency_rule'],
                    faqs: ['question', 'answer'], // Only rules-related FAQs
                    restrictions: ['country', 'restriction_type', 'notes']
                },
                context: "reglas de trading y restricciones"
            },
            
            platforms: {
                keywords: ['plataforma', 'platform', 'metatrader', 'ninjatrader', 'tradovate', 'rithmic', 'cqg', 'software', 'broker'],
                requiredFields: {
                    platforms: ['name', 'type', 'supported_markets'],
                    firm_platforms: ['is_available', 'additional_cost'],
                    data_feeds: ['name', 'type', 'cost'],
                    faqs: ['question', 'answer'] // Only platform-related FAQs
                },
                context: "plataformas de trading disponibles"
            },
            
            comparison: {
                keywords: ['mejor', 'peor', 'comparar', 'versus', 'vs', 'diferencia', 'ventaja', 'desventaja', 'recomendar', 'cual'],
                requiredFields: {
                    // For comparisons, we need a bit of everything but still filtered
                    account_plans: ['name', 'evaluation_fee', 'account_size', 'profit_target', 'drawdown_type'],
                    trading_rules: ['max_drawdown', 'daily_drawdown', 'can_trade_news'],
                    payout_policies: ['profit_split_phase2', 'payout_frequency'],
                    faqs: ['question', 'answer']
                },
                context: "comparación entre firmas"
            }
        };

        // Performance tracking
        this.metrics = {
            totalOptimizations: 0,
            avgTokenReduction: 0,
            intentDistribution: {}
        };
    }

    /**
     * Main optimization method - reduces context based on intent
     * 🔧 CRITICAL FIX: Add safeguards against over-reduction
     */
    async optimizeContext(question, dbData, firm) {
        const startTime = Date.now();
        
        // Detect intent
        const intent = this.detectIntent(question);
        this.logger?.info('Intent detected', { intent: intent.type, confidence: intent.confidence });
        
        // Filter data based on intent
        const optimizedData = this.filterByIntent(dbData, intent.type);
        
        // Calculate reduction metrics
        const originalSize = JSON.stringify(dbData).length;
        const optimizedSize = JSON.stringify(optimizedData).length;
        let reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
        
        // 🔧 CRITICAL SAFEGUARD: Prevent over-reduction
        const minTokens = 200; // Minimum tokens to retain
        const estimatedOptimizedTokens = Math.ceil(optimizedSize / 4);
        
        if (estimatedOptimizedTokens < minTokens) {
            this.logger?.warn('Over-reduction detected, falling back to safe filtering', {
                optimizedTokens: estimatedOptimizedTokens,
                minRequired: minTokens,
                originalReduction: `${reduction}%`
            });
            
            // Fallback: use less aggressive filtering
            const safeData = this.safeFilterData(dbData, intent.type);
            const safeSize = JSON.stringify(safeData).length;
            reduction = ((originalSize - safeSize) / originalSize * 100).toFixed(1);
            
            return {
                context: this.buildOptimizedContext(safeData, firm, intent.type),
                intent: intent.type,
                reduction: parseFloat(reduction),
                metrics: {
                    originalTokens: Math.ceil(originalSize / 4),
                    optimizedTokens: Math.ceil(safeSize / 4),
                    time: Date.now() - startTime,
                    safeguardActivated: true
                }
            };
        }
        
        // Update metrics
        this.updateMetrics(intent.type, reduction);
        
        const optimizationTime = Date.now() - startTime;
        
        this.logger?.info('Context optimized', {
            intent: intent.type,
            originalTokens: Math.ceil(originalSize / 4),
            optimizedTokens: Math.ceil(optimizedSize / 4),
            reduction: `${reduction}%`,
            time: `${optimizationTime}ms`
        });

        return {
            context: this.buildOptimizedContext(optimizedData, firm, intent.type),
            intent: intent.type,
            reduction: parseFloat(reduction),
            metrics: {
                originalTokens: Math.ceil(originalSize / 4),
                optimizedTokens: Math.ceil(optimizedSize / 4),
                time: optimizationTime
            }
        };
    }

    /**
     * Detect intent from question using keyword matching
     * 🔧 CRITICAL FIX: Improved intent detection with lower threshold
     */
    detectIntent(question) {
        const lowerQ = question.toLowerCase();
        let bestMatch = { type: 'general', confidence: 0 };

        for (const [intentType, config] of Object.entries(this.intentPatterns)) {
            const matchCount = config.keywords.filter(keyword => lowerQ.includes(keyword)).length;
            const confidence = matchCount / config.keywords.length;

            if (confidence > bestMatch.confidence) {
                bestMatch = { type: intentType, confidence };
            }
        }

        // 🔧 CRITICAL: Lower threshold to catch more specific intents
        // This prevents falling back to over-restrictive 'general' filtering
        if (bestMatch.confidence < 0.05) {
            bestMatch.type = 'general';
        }

        this.logger?.info('Intent analysis', {
            question: question.substring(0, 50),
            detectedIntent: bestMatch.type,
            confidence: (bestMatch.confidence * 100).toFixed(1) + '%',
            threshold: '5%'
        });

        return bestMatch;
    }

    /**
     * Filter database data based on detected intent
     */
    filterByIntent(dbData, intentType) {
        const config = this.intentPatterns[intentType];
        if (!config || intentType === 'general') {
            // For general intent, return minimal essential data
            return this.filterGeneralData(dbData);
        }

        const filtered = {};

        // Group data by table
        const groupedData = this.groupByTable(dbData);

        // Filter each table based on intent requirements
        for (const [table, records] of Object.entries(groupedData)) {
            if (config.requiredFields[table]) {
                const fields = config.requiredFields[table];
                
                filtered[table] = records.map(record => {
                    const filteredRecord = {};
                    
                    // Always include ID for reference
                    if (record.id) filteredRecord.id = record.id;
                    
                    // Include only required fields
                    fields.forEach(field => {
                        if (record[field] !== undefined && record[field] !== null) {
                            filteredRecord[field] = record[field];
                        }
                    });
                    
                    return filteredRecord;
                }).filter(record => Object.keys(record).length > 1); // Remove empty records
            }
        }

        // Special handling for FAQs - filter by relevance
        if (filtered.faqs && intentType !== 'general') {
            filtered.faqs = this.filterRelevantFAQs(filtered.faqs, intentType);
        }

        return filtered;
    }

    /**
     * Filter FAQs based on intent relevance
     * 🔧 CRITICAL FIX: Prevent FAQ over-filtering, ensure content reaches AI
     */
    filterRelevantFAQs(faqs, intentType) {
        const keywords = this.intentPatterns[intentType].keywords;
        
        const relevantFAQs = faqs.filter(faq => {
            const faqText = (faq.question + ' ' + (faq.answer || faq.answer_md || '')).toLowerCase();
            return keywords.some(keyword => faqText.includes(keyword));
        });
        
        // 🔧 CRITICAL: If not enough relevant FAQs, include some general ones
        if (relevantFAQs.length < 3) {
            const additionalFAQs = faqs.filter(faq => !relevantFAQs.includes(faq)).slice(0, 5);
            return [...relevantFAQs, ...additionalFAQs].slice(0, 8);
        }
        
        return relevantFAQs.slice(0, 8); // Increased from 5 to 8 to retain more content
    }

    /**
     * Filter general data when no specific intent is detected
     * 🔧 CRITICAL FIX: Prevent over-reduction, ensure minimum content retention
     */
    filterGeneralData(dbData) {
        const filtered = {};
        const groupedData = this.groupByTable(dbData);

        // For general queries, include basic info from all tables - EXPANDED FIELDS
        const generalFields = {
            account_plans: ['name', 'display_name', 'account_size', 'evaluation_fee', 'price_monthly', 'profit_target', 'drawdown_max', 'drawdown_type'],
            trading_rules: ['rule_name', 'max_drawdown', 'daily_drawdown', 'value_text', 'value_numeric'],
            payout_policies: ['policy_name', 'profit_split_phase2', 'payout_frequency', 'minimum_payout', 'description'],
            faqs: ['question', 'answer', 'answer_md', 'slug']
        };

        for (const [table, records] of Object.entries(groupedData)) {
            if (generalFields[table]) {
                // 🔧 CRITICAL: Increase minimum records to prevent content elimination
                if (table === 'faqs') {
                    // FAQs are critical - keep more content
                    filtered[table] = records.slice(0, 8);
                } else {
                    // Other data - keep reasonable amount
                    filtered[table] = records.slice(0, 6);
                }
            }
        }

        return filtered;
    }

    /**
     * Safe fallback filtering when over-reduction is detected
     * 🔧 CRITICAL: Ensures minimum content always reaches AI
     */
    safeFilterData(dbData, intentType) {
        const filtered = {};
        const groupedData = this.groupByTable(dbData);

        // Safe filtering - always include essential fields and reasonable content
        const safeFields = {
            account_plans: ['display_name', 'account_size', 'price_monthly', 'profit_target', 'drawdown_max', 'drawdown_type', 'phase'],
            trading_rules: ['rule_name', 'value_text', 'value_numeric', 'phase'],
            payout_policies: ['policy_name', 'description', 'profit_split_percentage', 'minimum_payout'],
            faqs: ['question', 'answer_md', 'slug'] // Always include full FAQ content
        };

        for (const [table, records] of Object.entries(groupedData)) {
            if (safeFields[table] && records.length > 0) {
                if (table === 'faqs') {
                    // FAQs are most important - always include substantial content
                    filtered[table] = records.slice(0, 10);
                } else {
                    // Other tables - include reasonable amount
                    filtered[table] = records.slice(0, 8);
                }
            }
        }

        this.logger?.info('Safe filtering applied', {
            originalRecords: dbData.length,
            safeFilteredTables: Object.keys(filtered).length,
            contentRetained: 'HIGH_PRIORITY'
        });

        return filtered;
    }

    /**
     * Group flat database array by table type
     */
    groupByTable(dbData) {
        const grouped = {};
        
        dbData.forEach(record => {
            // Detect table type from record structure
            let table = 'unknown';
            
            if (record.evaluation_fee !== undefined || record.account_size !== undefined) {
                table = 'account_plans';
            } else if (record.max_drawdown !== undefined || record.daily_drawdown !== undefined) {
                table = 'trading_rules';
            } else if (record.profit_split_phase1 !== undefined || record.payout_frequency !== undefined) {
                table = 'payout_policies';
            } else if (record.question !== undefined && record.answer !== undefined) {
                table = 'faqs';
            } else if (record.platform_type !== undefined) {
                table = 'platforms';
            } else if (record.code !== undefined && record.percentage !== undefined) {
                table = 'discounts';
            }
            
            if (!grouped[table]) grouped[table] = [];
            grouped[table].push(record);
        });
        
        return grouped;
    }

    /**
     * Build optimized context string for GPT
     */
    buildOptimizedContext(filteredData, firm, intentType) {
        const config = this.intentPatterns[intentType] || { context: "información general" };
        
        let context = `Información de ${firm.name} sobre ${config.context}:\n\n`;

        // Structure context based on intent
        for (const [table, records] of Object.entries(filteredData)) {
            if (records && records.length > 0) {
                context += `${this.getTableTitle(table)}:\n`;
                
                if (table === 'faqs') {
                    // Special formatting for FAQs
                    records.forEach(faq => {
                        context += `P: ${faq.question}\nR: ${faq.answer}\n\n`;
                    });
                } else {
                    // Structured data formatting
                    context += JSON.stringify(records, null, 2) + '\n\n';
                }
            }
        }

        // Add intent-specific instructions
        context += `\nResponde basándote SOLO en la información proporcionada sobre ${config.context}.`;
        
        return context;
    }

    /**
     * Get friendly table titles
     */
    getTableTitle(table) {
        const titles = {
            account_plans: '📊 Planes de Cuenta',
            trading_rules: '📋 Reglas de Trading',
            payout_policies: '💰 Políticas de Pago',
            faqs: '❓ Preguntas Frecuentes',
            platforms: '🖥️ Plataformas',
            discounts: '🎯 Descuentos Activos',
            firm_platforms: '🔧 Plataformas Disponibles',
            data_feeds: '📡 Feeds de Datos'
        };
        
        return titles[table] || table;
    }

    /**
     * Update performance metrics
     */
    updateMetrics(intentType, reduction) {
        this.metrics.totalOptimizations++;
        
        // Update average reduction
        this.metrics.avgTokenReduction = 
            (this.metrics.avgTokenReduction * (this.metrics.totalOptimizations - 1) + parseFloat(reduction)) / 
            this.metrics.totalOptimizations;
        
        // Track intent distribution
        if (!this.metrics.intentDistribution[intentType]) {
            this.metrics.intentDistribution[intentType] = 0;
        }
        this.metrics.intentDistribution[intentType]++;
    }

    /**
     * Get performance report
     */
    getMetrics() {
        return {
            ...this.metrics,
            avgTokenReduction: this.metrics.avgTokenReduction.toFixed(1) + '%'
        };
    }
}

module.exports = ContextOptimizer;