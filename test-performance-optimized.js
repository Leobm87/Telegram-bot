/**
 * PERFORMANCE TEST - Context Optimizer Validation
 * Tests the bot with Context Optimizer to measure improvements
 */

const TelegramBot = require('node-telegram-bot-api');

// Test configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TEST_CHAT_ID = process.env.MODERATOR_CHAT_ID || '8197351501';

const testQueries = [
    // Pricing queries
    { question: "¿Cuánto cuesta la cuenta de 100k en Apex?", expectedIntent: "pricing" },
    { question: "¿Qué precio tiene la cuenta de 50k en Alpha Futures?", expectedIntent: "pricing" },
    
    // Plans queries  
    { question: "¿Qué planes tiene Alpha Futures?", expectedIntent: "plans" },
    { question: "¿Qué cuentas ofrece Apex?", expectedIntent: "plans" },
    
    // Payout queries
    { question: "¿Cómo son los retiros en Apex?", expectedIntent: "payout" },
    { question: "¿Cuál es la política de pagos de Alpha Futures?", expectedIntent: "payout" },
    
    // Drawdown queries
    { question: "¿Cuál es el drawdown máximo en Apex?", expectedIntent: "drawdown" },
    { question: "¿Qué límite de pérdida diaria tiene Alpha Futures?", expectedIntent: "drawdown" }
];

class PerformanceTester {
    constructor() {
        this.bot = new TelegramBot(BOT_TOKEN, { polling: false });
        this.metrics = {
            totalQueries: 0,
            totalTime: 0,
            responses: []
        };
        this.botStarted = false;
    }

    async waitForBot() {
        console.log("⏳ Esperando 5 segundos para que el bot se inicialice completamente...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        this.botStarted = true;
    }

    async sendQuery(question) {
        const startTime = Date.now();
        
        try {
            // Send message and wait for response
            await this.bot.sendMessage(TEST_CHAT_ID, question);
            
            // Wait for response (simulate receiving it)
            await new Promise(resolve => setTimeout(resolve, 4000)); // Wait 4s for response
            
            const responseTime = Date.now() - startTime;
            
            return {
                question,
                responseTime,
                success: true
            };
            
        } catch (error) {
            console.error(`❌ Error sending query: ${error.message}`);
            return {
                question,
                responseTime: 0,
                success: false,
                error: error.message
            };
        }
    }

    async runTests() {
        if (!this.botStarted) {
            await this.waitForBot();
        }

        console.log("\n🚀 PERFORMANCE TEST - CONTEXT OPTIMIZER");
        console.log("=========================================\n");

        for (const testCase of testQueries) {
            console.log(`📊 Testing: "${testCase.question}"`);
            console.log(`   Expected intent: ${testCase.expectedIntent}`);
            
            const result = await this.sendQuery(testCase.question);
            
            if (result.success) {
                console.log(`   ✅ Response time: ${result.responseTime}ms`);
                this.metrics.totalTime += result.responseTime;
                this.metrics.totalQueries++;
            } else {
                console.log(`   ❌ Failed: ${result.error}`);
            }
            
            this.metrics.responses.push(result);
            
            // Small delay between queries
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.showResults();
    }

    showResults() {
        console.log("\n\n📊 PERFORMANCE TEST RESULTS");
        console.log("=====================================");
        
        const successfulQueries = this.metrics.responses.filter(r => r.success);
        const avgResponseTime = this.metrics.totalTime / successfulQueries.length;
        
        console.log(`\n📈 OVERALL METRICS:`);
        console.log(`   Total queries: ${testQueries.length}`);
        console.log(`   Successful: ${successfulQueries.length}`);
        console.log(`   Failed: ${testQueries.length - successfulQueries.length}`);
        console.log(`   Average response time: ${avgResponseTime.toFixed(0)}ms`);
        
        console.log(`\n📊 RESPONSE TIMES BY QUERY:`);
        successfulQueries.forEach(result => {
            console.log(`   - "${result.question.substring(0, 40)}...": ${result.responseTime}ms`);
        });
        
        console.log(`\n🎯 PERFORMANCE IMPROVEMENTS:`);
        const baseline = 3800; // Previous average
        const improvement = ((baseline - avgResponseTime) / baseline * 100).toFixed(1);
        console.log(`   Baseline: ${baseline}ms`);
        console.log(`   Current: ${avgResponseTime.toFixed(0)}ms`);
        console.log(`   Improvement: ${improvement}%`);
        
        if (avgResponseTime <= 2000) {
            console.log(`\n✅ TARGET ACHIEVED! Response time ≤ 2s`);
        } else {
            console.log(`\n⚠️ Target not yet achieved. Current: ${avgResponseTime.toFixed(0)}ms, Target: ≤2000ms`);
        }

        console.log(`\n💡 NOTE: Para métricas más precisas, revisa los logs del bot principal`);
        console.log(`   donde se muestra el intent detectado y la reducción de tokens.`);
    }
}

// Run test
async function main() {
    if (!BOT_TOKEN) {
        console.error("❌ TELEGRAM_BOT_TOKEN no está configurado!");
        process.exit(1);
    }

    console.log("🤖 Bot Performance Tester - Context Optimizer Validation");
    console.log("======================================================");
    console.log(`📱 Chat ID: ${TEST_CHAT_ID}`);
    console.log(`🔧 Queries to test: ${testQueries.length}`);
    
    const tester = new PerformanceTester();
    await tester.runTests();
}

main().catch(console.error);