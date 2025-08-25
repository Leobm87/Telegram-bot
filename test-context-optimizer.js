/**
 * TEST CONTEXT OPTIMIZER
 * Tests current bot performance to establish baseline before implementing Context Optimizer
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// Import current bot components
const SmartCacheV2 = require('./smart-cache-v2');
const DeterministicRouter = require('./deterministic-router');

class PerformanceTester {
    constructor() {
        // Initialize connections
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );
        
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // Initialize components
        this.cache = new SmartCacheV2();
        this.router = new DeterministicRouter();

        // Test questions by intent type
        this.testQuestions = {
            pricing: [
                "¿Cuánto cuesta la cuenta de 100k en Apex?",
                "¿Qué precio tiene la cuenta de 50k en Alpha Futures?",
                "¿Cuál es el costo de la evaluación de 25k en Bulenox?"
            ],
            plans: [
                "¿Qué planes tiene Alpha Futures?",
                "¿Qué cuentas ofrece Apex?",
                "¿Cuáles son las opciones de cuenta en TakeProfit?"
            ],
            payout: [
                "¿Cómo son los retiros en Apex?",
                "¿Cuál es la política de pagos de Alpha Futures?",
                "¿Cada cuánto puedo retirar en Bulenox?"
            ],
            drawdown: [
                "¿Cuál es el drawdown máximo en Apex?",
                "¿Qué límite de pérdida diaria tiene Alpha Futures?",
                "¿Cuál es el trailing drawdown de TakeProfit?"
            ]
        };

        this.metrics = {
            totalTime: 0,
            tokensSent: 0,
            tokensReceived: 0,
            dbQueries: 0,
            cacheHits: 0,
            cacheMisses: 0,
            byIntent: {}
        };
    }

    async measureTokens(text) {
        // Approximate token count (GPT-4 uses ~4 chars per token)
        return Math.ceil(text.length / 4);
    }

    async searchDatabase(firm, question) {
        const startDb = Date.now();
        let dbData = [];
        
        // Track DB queries
        this.metrics.dbQueries++;

        // Query multiple tables (current approach)
        const tables = ['faqs', 'account_plans', 'trading_rules', 'payout_policies'];
        
        for (const table of tables) {
            try {
                const { data } = await this.supabase
                    .from(table)
                    .select('*')
                    .eq('firm_id', firm.id);
                
                if (data) dbData = dbData.concat(data);
            } catch (error) {
                console.error(`Error querying ${table}:`, error);
            }
        }

        const dbTime = Date.now() - startDb;
        return { data: dbData, time: dbTime };
    }

    async testQuestion(question, intentType) {
        console.log(`\n📊 Testing: "${question}"`);
        const startTime = Date.now();
        
        // Detect firm
        const firm = this.detectFirm(question);
        if (!firm) {
            console.log("❌ No firm detected");
            return null;
        }

        console.log(`✅ Firm detected: ${firm.name}`);

        // Check cache
        const cacheKey = this.cache.generateKey(question, firm.slug);
        const cached = this.cache.get(cacheKey);

        if (cached) {
            this.metrics.cacheHits++;
            console.log("🎯 CACHE HIT!");
            return { time: Date.now() - startTime, cached: true };
        }

        this.metrics.cacheMisses++;

        // Search database
        const { data: dbData, time: dbTime } = await this.searchDatabase(firm, question);
        console.log(`📚 DB Query: ${dbTime}ms, ${dbData.length} results`);

        // Prepare context (CURRENT APPROACH - sending everything)
        const context = this.prepareContext(dbData, firm);
        const contextTokens = await this.measureTokens(JSON.stringify(context));
        this.metrics.tokensSent += contextTokens;
        console.log(`📝 Context size: ${contextTokens} tokens`);

        // Call OpenAI
        const openaiStart = Date.now();
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Eres un experto en prop trading. Responde basándote SOLO en la información proporcionada."
                    },
                    {
                        role: "user",
                        content: `Pregunta: ${question}\n\nInformación disponible:\n${JSON.stringify(context, null, 2)}`
                    }
                ],
                temperature: 0.1,
                max_tokens: 500
            });

            const openaiTime = Date.now() - openaiStart;
            const responseTokens = await this.measureTokens(completion.choices[0].message.content);
            this.metrics.tokensReceived += responseTokens;

            console.log(`🤖 OpenAI: ${openaiTime}ms, ${responseTokens} tokens received`);

            const totalTime = Date.now() - startTime;
            this.metrics.totalTime += totalTime;

            // Track by intent
            if (!this.metrics.byIntent[intentType]) {
                this.metrics.byIntent[intentType] = {
                    count: 0,
                    totalTime: 0,
                    avgTokensSent: 0,
                    avgTokensReceived: 0
                };
            }

            this.metrics.byIntent[intentType].count++;
            this.metrics.byIntent[intentType].totalTime += totalTime;
            this.metrics.byIntent[intentType].avgTokensSent = 
                (this.metrics.byIntent[intentType].avgTokensSent * (this.metrics.byIntent[intentType].count - 1) + contextTokens) / 
                this.metrics.byIntent[intentType].count;
            this.metrics.byIntent[intentType].avgTokensReceived = 
                (this.metrics.byIntent[intentType].avgTokensReceived * (this.metrics.byIntent[intentType].count - 1) + responseTokens) / 
                this.metrics.byIntent[intentType].count;

            return {
                time: totalTime,
                dbTime,
                openaiTime,
                contextTokens,
                responseTokens,
                cached: false
            };

        } catch (error) {
            console.error("❌ OpenAI Error:", error);
            return null;
        }
    }

    detectFirm(question) {
        // Simple firm detection (from current bot)
        const firms = {
            'apex': { id: 1, name: 'Apex', slug: 'apex' },
            'alpha': { id: 2, name: 'Alpha Futures', slug: 'alpha' },
            'bulenox': { id: 3, name: 'Bulenox', slug: 'bulenox' },
            'takeprofit': { id: 4, name: 'TakeProfit', slug: 'takeprofit' },
            'myfundedfutures': { id: 5, name: 'MyFundedFutures', slug: 'myfundedfutures' },
            'tradeify': { id: 6, name: 'Tradeify', slug: 'tradeify' },
            'vision': { id: 7, name: 'Vision Trade', slug: 'vision' }
        };

        const lowerQ = question.toLowerCase();
        for (const [key, firm] of Object.entries(firms)) {
            if (lowerQ.includes(key) || lowerQ.includes(firm.name.toLowerCase())) {
                return firm;
            }
        }
        return null;
    }

    prepareContext(dbData, firm) {
        // Current approach - send all data
        return {
            firm: firm.name,
            data: dbData
        };
    }

    async runTests() {
        console.log("🚀 PERFORMANCE TEST - CURRENT IMPLEMENTATION");
        console.log("============================================\n");

        // Test each intent type
        for (const [intent, questions] of Object.entries(this.testQuestions)) {
            console.log(`\n🎯 TESTING INTENT: ${intent.toUpperCase()}`);
            console.log("--------------------------------");
            
            for (const question of questions) {
                await this.testQuestion(question, intent);
                // Small delay between tests
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Show final metrics
        this.showMetrics();
    }

    showMetrics() {
        console.log("\n\n📊 FINAL PERFORMANCE METRICS");
        console.log("=====================================");
        
        const totalQuestions = Object.values(this.testQuestions).flat().length;
        const avgTime = this.metrics.totalTime / totalQuestions;
        
        console.log(`\n📈 OVERALL STATISTICS:`);
        console.log(`   Total questions: ${totalQuestions}`);
        console.log(`   Average response time: ${avgTime.toFixed(0)}ms`);
        console.log(`   Total tokens sent: ${this.metrics.tokensSent}`);
        console.log(`   Total tokens received: ${this.metrics.tokensReceived}`);
        console.log(`   DB queries: ${this.metrics.dbQueries}`);
        console.log(`   Cache hits: ${this.metrics.cacheHits}`);
        console.log(`   Cache misses: ${this.metrics.cacheMisses}`);
        console.log(`   Cache hit rate: ${((this.metrics.cacheHits / totalQuestions) * 100).toFixed(1)}%`);

        console.log(`\n📊 BY INTENT TYPE:`);
        for (const [intent, stats] of Object.entries(this.metrics.byIntent)) {
            const avgTime = stats.totalTime / stats.count;
            console.log(`\n   ${intent.toUpperCase()}:`);
            console.log(`   - Avg response time: ${avgTime.toFixed(0)}ms`);
            console.log(`   - Avg tokens sent: ${stats.avgTokensSent.toFixed(0)}`);
            console.log(`   - Avg tokens received: ${stats.avgTokensReceived.toFixed(0)}`);
        }

        console.log(`\n💡 OPTIMIZATION OPPORTUNITIES:`);
        console.log(`   - Current avg tokens sent: ${(this.metrics.tokensSent / totalQuestions).toFixed(0)}`);
        console.log(`   - Target with Context Optimizer: ~${Math.floor((this.metrics.tokensSent / totalQuestions) * 0.4)} (-60%)`);
        console.log(`   - Potential time saving: ${(avgTime * 0.7).toFixed(0)}ms → ${(avgTime * 0.3).toFixed(0)}ms`);

        console.log(`\n🎯 CONTEXT OPTIMIZER GOALS:`);
        console.log(`   1. Reduce context tokens by 60% (intent-specific contexts)`);
        console.log(`   2. Optimize DB queries (fetch only relevant fields)`);
        console.log(`   3. Implement intent-based caching strategies`);
        console.log(`   4. Target: 1-2s consistent response times`);
    }
}

// Run tests
async function main() {
    // Check environment variables
    if (!process.env.OPENAI_API_KEY || !process.env.SUPABASE_URL) {
        console.error("❌ Missing environment variables!");
        console.log("Usage: OPENAI_API_KEY=xxx SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx node test-context-optimizer.js");
        process.exit(1);
    }

    const tester = new PerformanceTester();
    await tester.runTests();
}

main().catch(console.error);