#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

/**
 * 🚀 INTERACTIVE BOT TESTER - ElTrader Financiado
 * 
 * Sistema de testing interactivo que permite a Claude Code probar el bot
 * como si fuera un usuario real, con conversación continua y análisis automático.
 * 
 * 🎯 Features:
 * - Chat interactivo en tiempo real
 * - Comandos especiales para debugging
 * - Análisis automático de calidad de respuestas
 * - Historial de conversación contextual
 * - Detección de problemas comunes
 * - Guardado de sesiones problemáticas
 */

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

class InteractiveBotTester {
    constructor() {
        this.config = {
            supabase: {
                url: process.env.SUPABASE_URL,
                serviceKey: process.env.SUPABASE_SERVICE_KEY
            },
            openai: {
                apiKey: process.env.OPENAI_API_KEY
            }
        };

        this.supabase = createClient(this.config.supabase.url, this.config.supabase.serviceKey);
        this.openai = new OpenAI({ apiKey: this.config.openai.apiKey });
        
        // Complete firm configurations
        this.firms = {
            apex: {
                id: '854bf730-8420-4297-86f8-3c4a972edcf2',
                slug: 'apex',
                name: 'Apex Trader Funding',
                keywords: ['apex', 'apex trader', 'apextraderfunding'],
                color: '🟠'
            },
            alpha: {
                id: '2ff70297-718d-42b0-ba70-cde70d5627b5',
                slug: 'alpha-futures',
                name: 'Alpha Futures',
                keywords: ['alpha', 'alpha futures', 'alpha-futures', 'alphafutures'],
                color: '🔴'
            },
            takeprofit: {
                id: '08a7b506-4836-486a-a6e9-df12059c55d3',
                slug: 'takeprofit',
                name: 'TakeProfit Trader',
                keywords: ['takeprofit', 'take profit', 'tpt', 'tptrader'],
                color: '🟢'
            },
            bulenox: {
                id: '7567df00-7cf8-4afc-990f-6f8da04e36a4',
                slug: 'bulenox',
                name: 'Bulenox',
                keywords: ['bulenox'],
                color: '🔵'
            },
            mff: {
                id: '1b40dc38-91ff-4a35-be46-1bf2d5749433',
                slug: 'myfundedfutures',
                name: 'My Funded Futures',
                keywords: ['mff', 'my funded futures', 'myfundedfutures'],
                color: '🟡'
            },
            tradeify: {
                id: '1a95b01e-4eef-48e2-bd05-6e2f79ca57a8',
                slug: 'tradeify',
                name: 'Tradeify',
                keywords: ['tradeify'],
                color: '⚪'
            },
            vision: {
                id: '2e82148c-9646-4dde-8240-f1871334a676',
                slug: 'vision-trade',
                name: 'Vision Trade Futures',
                keywords: ['vision', 'vision trade', 'vision trade futures'],
                color: '🟣'
            }
        };
        
        this.cache = new Map();
        this.conversationHistory = [];
        this.debugMode = false;
        this.sessionStats = {
            questionsAsked: 0,
            averageResponseTime: 0,
            problemsDetected: 0,
            firmsTestedCount: new Set()
        };
        
        this.setupReadline();
    }

    setupReadline() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '\n🤖 You> '
        });
        
        this.rl.on('line', (input) => this.handleInput(input.trim()));
        this.rl.on('close', () => this.handleExit());
    }

    async init() {
        console.clear();
        console.log('🚀 BOT INTERACTIVO - ElTrader Financiado');
        console.log('=====================================');
        console.log('✅ Conexión a Supabase: OK');
        console.log('✅ Conexión a OpenAI: OK');
        console.log('✅ 7 Firmas configuradas: OK');
        console.log('\n📋 Comandos disponibles:');
        console.log('   /help     - Lista completa de comandos');
        console.log('   /test     - Ejecutar tests predefinidos');
        console.log('   /firms    - Ver todas las firmas');
        console.log('   /debug    - Activar modo debug');
        console.log('   /clear    - Limpiar historial');
        console.log('   /exit     - Salir');
        console.log('\n💡 Escribe cualquier pregunta como usuario real...');
        
        this.rl.prompt();
    }

    async handleInput(input) {
        if (!input) {
            this.rl.prompt();
            return;
        }

        // Handle special commands
        if (input.startsWith('/')) {
            await this.handleCommand(input);
            return;
        }

        // Regular question - process like real user
        await this.processQuestion(input);
    }

    async handleCommand(command) {
        const [cmd, ...args] = command.split(' ');
        
        switch (cmd) {
            case '/help':
                this.showHelp();
                break;
                
            case '/clear':
                this.conversationHistory = [];
                console.log('✅ Historial limpiado');
                break;
                
            case '/debug':
                this.debugMode = !this.debugMode;
                console.log(`🔧 Modo debug: ${this.debugMode ? 'ON' : 'OFF'}`);
                break;
                
            case '/firms':
                this.showFirms();
                break;
                
            case '/test':
                if (args.length > 0) {
                    await this.runSpecificTest(args[0]);
                } else {
                    await this.runQuickTests();
                }
                break;
                
            case '/analyze':
                this.analyzeLastResponse();
                break;
                
            case '/save':
                await this.saveSession(args[0] || 'session');
                break;
                
            case '/stats':
                this.showStats();
                break;
                
            case '/compare':
                if (args.length >= 2) {
                    await this.compareFirms(args[0], args[1]);
                } else {
                    console.log('❌ Uso: /compare [firma1] [firma2]');
                }
                break;
                
            case '/exit':
                this.handleExit();
                return;
                
            default:
                console.log(`❌ Comando desconocido: ${cmd}`);
                console.log('💡 Usa /help para ver comandos disponibles');
        }
        
        this.rl.prompt();
    }

    showHelp() {
        console.log('\n📋 COMANDOS DISPONIBLES:');
        console.log('========================');
        console.log('🔧 Control:');
        console.log('   /help               - Mostrar esta ayuda');
        console.log('   /clear              - Limpiar historial de conversación');
        console.log('   /debug              - Toggle modo debug (métricas detalladas)');
        console.log('   /exit               - Salir del tester');
        console.log('');
        console.log('📊 Testing:');
        console.log('   /test               - Ejecutar tests rápidos predefinidos');
        console.log('   /test [firma]       - Test específico de una firma');
        console.log('   /analyze            - Analizar calidad de última respuesta');
        console.log('   /stats              - Mostrar estadísticas de sesión');
        console.log('');
        console.log('🏢 Información:');
        console.log('   /firms              - Lista de las 7 firmas disponibles');
        console.log('   /compare [f1] [f2]  - Comparar dos firmas');
        console.log('');
        console.log('💾 Persistencia:');
        console.log('   /save [nombre]      - Guardar sesión actual');
        console.log('');
        console.log('💡 También puedes hacer preguntas normales como usuario real!');
    }

    showFirms() {
        console.log('\n🏢 FIRMAS DISPONIBLES:');
        console.log('=====================');
        Object.entries(this.firms).forEach(([slug, firm]) => {
            console.log(`${firm.color} ${firm.name} (${slug})`);
            console.log(`   Keywords: ${firm.keywords.join(', ')}`);
        });
    }

    showStats() {
        console.log('\n📊 ESTADÍSTICAS DE SESIÓN:');
        console.log('==========================');
        console.log(`📝 Preguntas realizadas: ${this.sessionStats.questionsAsked}`);
        console.log(`⚡ Tiempo promedio respuesta: ${this.sessionStats.averageResponseTime}ms`);
        console.log(`⚠️ Problemas detectados: ${this.sessionStats.problemsDetected}`);
        console.log(`🏢 Firmas testeadas: ${this.sessionStats.firmsTestedCount.size}/7`);
        
        if (this.sessionStats.firmsTestedCount.size > 0) {
            const testedFirms = Array.from(this.sessionStats.firmsTestedCount)
                .map(slug => this.firms[slug]?.name)
                .filter(Boolean);
            console.log(`   - ${testedFirms.join(', ')}`);
        }
        
        console.log(`💬 Preguntas en historial: ${this.conversationHistory.length}`);
    }

    async processQuestion(question) {
        const startTime = Date.now();
        
        if (this.debugMode) {
            console.log(`\n🔍 DEBUG: Processing question: "${question}"`);
        }

        try {
            // Step 1: Detect firm
            const firmSlug = this.detectFirmFromQuestion(question);
            const firm = firmSlug ? this.firms[firmSlug] : null;
            
            if (this.debugMode) {
                console.log(`📍 DEBUG: Firm detected: ${firmSlug || 'GENERAL'}`);
            }
            
            // Step 2: Extract keywords  
            const keywords = this.extractSearchKeywords(question);
            
            if (this.debugMode) {
                console.log(`🔑 DEBUG: Keywords extracted: ${keywords.join(', ')}`);
            }
            
            // Step 3: Search database
            let comprehensiveData = await this.searchDatabase(question, firmSlug, keywords);
            
            if (this.debugMode) {
                console.log(`📊 DEBUG: Database results - FAQs: ${comprehensiveData.faqs?.length || 0}, Plans: ${comprehensiveData.plans?.length || 0}`);
            }
            
            // Step 4: Generate AI response
            const response = await this.generateResponse(question, firm, comprehensiveData);
            
            const responseTime = Date.now() - startTime;
            
            // Update stats
            this.sessionStats.questionsAsked++;
            this.sessionStats.averageResponseTime = Math.round(
                (this.sessionStats.averageResponseTime * (this.sessionStats.questionsAsked - 1) + responseTime) / this.sessionStats.questionsAsked
            );
            
            if (firmSlug) {
                this.sessionStats.firmsTestedCount.add(firmSlug);
            }
            
            // Add to conversation history
            const conversationEntry = {
                question,
                response,
                firm: firmSlug,
                keywords,
                responseTime,
                timestamp: new Date().toISOString(),
                dataFound: {
                    faqs: comprehensiveData.faqs?.length || 0,
                    plans: comprehensiveData.plans?.length || 0
                }
            };
            
            this.conversationHistory.push(conversationEntry);
            
            // Display response
            console.log(`\n${response}`);
            
            if (this.debugMode) {
                console.log(`\n🔧 DEBUG METRICS:`);
                console.log(`   Response time: ${responseTime}ms`);
                console.log(`   Response length: ${response.length} chars`);
                console.log(`   FAQs found: ${comprehensiveData.faqs?.length || 0}`);
                console.log(`   Plans found: ${comprehensiveData.plans?.length || 0}`);
            }
            
            // Auto-analyze for problems
            const problems = this.detectProblems(response, comprehensiveData);
            if (problems.length > 0) {
                this.sessionStats.problemsDetected++;
                console.log(`\n⚠️ PROBLEMAS DETECTADOS:`);
                problems.forEach(problem => console.log(`   - ${problem}`));
            }
            
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
            if (this.debugMode) {
                console.log(`🔍 DEBUG ERROR STACK:`, error.stack);
            }
        }
        
        this.rl.prompt();
    }

    // Copy exact methods from production bot
    extractSearchKeywords(question) {
        const lowerQuestion = question.toLowerCase();
        
        const keywordGroups = {
            payment: ['retir', 'pag', 'cobr', 'dinero', 'dolar', 'transferencia', 'wire', 'ach', 'wise', 'paypal', 'metodo'],
            rules: ['regla', 'limit', 'drawdown', 'perdida', 'target', 'objetivo', 'dias', 'tiempo'],
            evaluation: ['evaluacion', 'demo', 'challenge', 'paso', 'aprobar', 'pasar'],
            live: ['live', 'real', 'financiad', 'fondeado', 'funded'],
            pricing: ['precio', 'cost', 'mensual', 'activacion', 'reset', 'barato', 'caro'],
            platform: ['plataforma', 'ninjatrader', 'tradingview', 'metatrader', 'rithmic'],
            general: ['cuenta', 'plan', 'como', 'que', 'cuando', 'donde', 'proceso']
        };
        
        const extractedKeywords = [];
        
        Object.entries(keywordGroups).forEach(([group, keywords]) => {
            keywords.forEach(keyword => {
                if (lowerQuestion.includes(keyword)) {
                    extractedKeywords.push(keyword);
                }
            });
        });
        
        const questionWords = question.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length >= 3)
            .filter(word => !['que', 'como', 'donde', 'cuando', 'con', 'para', 'por', 'una', 'los', 'las', 'del', 'con'].includes(word))
            .slice(0, 5);
        
        return [...new Set([...extractedKeywords, ...questionWords])];
    }

    detectFirmFromQuestion(question) {
        const lowerQuestion = question.toLowerCase();
        
        for (const [slug, firm] of Object.entries(this.firms)) {
            for (const keyword of firm.keywords) {
                if (lowerQuestion.includes(keyword.toLowerCase())) {
                    return slug;
                }
            }
        }
        
        return null;
    }

    async searchDatabase(question, firmSlug, keywords) {
        let comprehensiveData = { faqs: [], plans: [] };
        
        if (firmSlug && this.firms[firmSlug]) {
            const firmId = this.firms[firmSlug].id;
            
            // Enhanced FAQ search with keywords
            let faqSearchConditions = [];
            keywords.forEach(keyword => {
                faqSearchConditions.push(`question.ilike.%${keyword}%`);
                faqSearchConditions.push(`answer_md.ilike.%${keyword}%`);
            });
            
            if (faqSearchConditions.length === 0) {
                faqSearchConditions = [`question.ilike.%${question}%`, `answer_md.ilike.%${question}%`];
            }
            
            try {
                const [faqs, plans] = await Promise.all([
                    this.supabase.from('faqs')
                        .select('question, answer_md, slug')
                        .eq('firm_id', firmId)
                        .or(faqSearchConditions.join(','))
                        .limit(8),
                    
                    this.supabase.from('account_plans')
                        .select('display_name, account_size, price_monthly, profit_target, daily_loss_limit, drawdown_max, drawdown_type, max_contracts_minis, max_contracts_micros, phase')
                        .eq('firm_id', firmId)
                ]);

                comprehensiveData = {
                    faqs: faqs.data || [],
                    plans: plans.data || []
                };

            } catch (error) {
                if (this.debugMode) {
                    console.log(`❌ Database error: ${error.message}`);
                }
            }
        }
        
        return comprehensiveData;
    }

    async generateResponse(question, firm, comprehensiveData) {
        // Build context like production bot
        let context = '';
        let hasMeaningfulFAQs = comprehensiveData.faqs && comprehensiveData.faqs.length > 0;
        
        if (hasMeaningfulFAQs) {
            context += '=== PREGUNTAS FRECUENTES (PRIORIDAD ALTA) ===\n';
            context += comprehensiveData.faqs.map(faq => 
                `Q: ${faq.question}\nA: ${faq.answer_md}`
            ).join('\n\n') + '\n\n';
        }
        
        if (!hasMeaningfulFAQs || (comprehensiveData.plans && comprehensiveData.plans.length > 0)) {
            if (comprehensiveData.plans && comprehensiveData.plans.length > 0) {
                context += '=== PLANES DE CUENTA ===\n';
                context += comprehensiveData.plans.map(plan => {
                    let planInfo = `${plan.display_name} - $${plan.account_size?.toLocaleString() || plan.account_size} (${plan.price_monthly ? '$' + plan.price_monthly + '/mes' : 'N/A'})`;
                    if (plan.profit_target) planInfo += ` | Target: $${plan.profit_target.toLocaleString()}`;
                    if (plan.daily_loss_limit) planInfo += ` | Pérdida diaria: ${plan.daily_loss_limit}%`;
                    if (plan.drawdown_max) planInfo += ` | Drawdown: $${plan.drawdown_max.toLocaleString()} (${plan.drawdown_type})`;
                    if (plan.max_contracts_minis) planInfo += ` | Contratos: ${plan.max_contracts_minis} minis`;
                    return planInfo;
                }).join('\n') + '\n\n';
            }
        }

        // System prompt like production bot
        const systemPrompt = `Eres un amigo experto en prop trading que ayuda de manera natural y conversacional.

${firm ? `FIRMA: ${firm.name} ${firm.color}` : 'CONSULTA GENERAL'}

🔥 REGLA CRÍTICA - SOLO ESTAS 7 FIRMAS:
• Apex Trader Funding 🟠
• TakeProfit Trader 🟢  
• Bulenox 🔵
• My Funded Futures (MFF) 🟡
• Alpha Futures 🔴
• Tradeify ⚪
• Vision Trade Futures 🟣

❌ PROHIBIDO ABSOLUTO:
• NUNCA mencionar FTMO, TopstepTrader, The5ers, u OTRAS firmas
• NUNCA usar **markdown** - SOLO HTML tags
• SOLO recomendar nuestras 7 firmas disponibles
• Si no tienes info de nuestras firmas, dirígelo a /start

ESTILO DE RESPUESTA - ESTANDARIZADO:
• ESTRUCTURA: Máximo 8-10 líneas organizadas en bullets
• PRIORIDAD: FAQ específico → Datos estructurados → Combinación inteligente
• FORMATO CONSISTENTE: Siempre incluir precios como <code>$XXX/mes</code>
• VALORES MONETARIOS: Siempre formatear como $X,XXX (nunca porcentajes para dinero)
• TONO: Profesional, directo, útil - mismo nivel para todas las firmas
• COMPLETITUD: Responder la pregunta específica + 1-2 datos adicionales relevantes
• LLAMADA A ACCIÓN: Siempre terminar sugiriendo más preguntas específicas

FORMATO HTML TELEGRAM:
• USA <b>texto</b> para negrita (funciona perfecto)
• USA <i>texto</i> para cursiva si necesario
• USA <code>texto</code> para datos importantes (precios, porcentajes)
• USA emojis y bullets simples (•)
• Respuestas completas pero organizadas para mobile
• Párrafos cortos separados por líneas en blanco
• NUNCA uses **markdown** - solo HTML tags

USA LA INFORMACIÓN DISPONIBLE:
• PRIORIDAD 1: FAQs específicos (si existe FAQ relevante, úsalo como base)
• PRIORIDAD 2: Complementa con datos estructurados (planes/precios/reglas)
• PRIORIDAD 3: Si no hay FAQs, usa datos estructurados como fuente principal
• Combina fuentes inteligentemente para respuestas completas
• Si no hay información relevante, sugiere usar /start o preguntar diferente`;

        const userPrompt = `PREGUNTA: ${question}

CONTEXTO COMPLETO ESTRUCTURADO:
${context}

Responde utilizando toda la información relevante disponible.`;

        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.1,
                max_tokens: 800
            });

            let response = completion.choices[0].message.content;
            
            if (firm) {
                response = `${firm.color} <b>${firm.name}</b>\n\n${response}`;
            }

            response += `\n\n¿Algo más específico? 🚀`;

            return response;

        } catch (error) {
            return `❌ Error generando respuesta IA: ${error.message}`;
        }
    }

    detectProblems(response, data) {
        const problems = [];
        
        // Check for monetary formatting issues
        if (response.match(/\$?\d+%/)) {
            problems.push('Formato monetario incorrecto - mostrando porcentajes en lugar de dinero');
        }
        
        // Check for generic responses
        if (response.includes('información no disponible') || response.includes('no tengo información')) {
            problems.push('Respuesta genérica - debería encontrar información relevante');
        }
        
        // Check if too short for meaningful questions
        if (response.length < 200 && data.faqs && data.faqs.length > 0) {
            problems.push('Respuesta muy corta cuando hay FAQs disponibles');
        }
        
        // Check for markdown usage instead of HTML
        if (response.includes('**') || response.includes('##')) {
            problems.push('Usando markdown en lugar de HTML tags');
        }
        
        return problems;
    }

    analyzeLastResponse() {
        if (this.conversationHistory.length === 0) {
            console.log('❌ No hay respuestas para analizar');
            return;
        }
        
        const lastEntry = this.conversationHistory[this.conversationHistory.length - 1];
        
        console.log('\n📊 ANÁLISIS DE RESPUESTA:');
        console.log('========================');
        console.log(`📝 Pregunta: "${lastEntry.question}"`);
        console.log(`🏢 Firma detectada: ${lastEntry.firm || 'GENERAL'}`);
        console.log(`🔑 Keywords: ${lastEntry.keywords.join(', ')}`);
        console.log(`⚡ Tiempo respuesta: ${lastEntry.responseTime}ms`);
        console.log(`📊 Datos encontrados: ${lastEntry.dataFound.faqs} FAQs, ${lastEntry.dataFound.plans} planes`);
        console.log(`📄 Longitud respuesta: ${lastEntry.response.length} caracteres`);
        
        const problems = this.detectProblems(lastEntry.response, lastEntry.dataFound);
        if (problems.length > 0) {
            console.log(`⚠️ Problemas detectados:`);
            problems.forEach(problem => console.log(`   - ${problem}`));
        } else {
            console.log(`✅ No se detectaron problemas`);
        }
    }

    async runQuickTests() {
        console.log('\n🧪 EJECUTANDO TESTS RÁPIDOS...');
        console.log('================================');
        
        const quickTests = [
            'Que cuentas tiene apex?',
            'Como funciona takeprofit?',
            'Cuales son los precios de alpha futures?',
            'Que reglas tiene mff?'
        ];
        
        for (const question of quickTests) {
            console.log(`\n⏳ Testing: "${question}"`);
            await this.processQuestion(question);
            
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n✅ Tests rápidos completados');
    }

    async saveSession(name) {
        try {
            const sessionData = {
                timestamp: new Date().toISOString(),
                stats: this.sessionStats,
                conversation: this.conversationHistory
            };
            
            const filename = `session-${name}-${Date.now()}.json`;
            const filepath = path.join(__dirname, 'sessions', filename);
            
            // Create sessions directory if it doesn't exist
            await fs.mkdir(path.join(__dirname, 'sessions'), { recursive: true });
            
            await fs.writeFile(filepath, JSON.stringify(sessionData, null, 2));
            console.log(`✅ Sesión guardada: ${filepath}`);
            
        } catch (error) {
            console.log(`❌ Error guardando sesión: ${error.message}`);
        }
    }

    async compareFirms(firm1, firm2) {
        if (!this.firms[firm1] || !this.firms[firm2]) {
            console.log('❌ Una o ambas firmas no existen. Usa /firms para ver disponibles');
            return;
        }
        
        console.log(`\n🔍 COMPARANDO: ${this.firms[firm1].name} vs ${this.firms[firm2].name}`);
        console.log('='.repeat(60));
        
        await this.processQuestion(`Compara ${firm1} vs ${firm2} en precios y reglas`);
    }

    handleExit() {
        console.log('\n👋 ¡Sesión terminada!');
        console.log('===============================');
        this.showStats();
        console.log('\n💾 Tips: Usa /save antes de salir para guardar conversaciones importantes');
        console.log('🚀 ¡Hasta la próxima!');
        
        if (this.rl) {
            this.rl.close();
        }
        
        process.exit(0);
    }
}

// Auto-run if called directly
if (require.main === module) {
    const tester = new InteractiveBotTester();
    tester.init().catch(error => {
        console.error('❌ Error iniciando tester:', error.message);
        process.exit(1);
    });
}

module.exports = InteractiveBotTester;