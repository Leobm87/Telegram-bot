#!/usr/bin/env node

/**
 * ⚡ QUICK TEST RUNNER - ElTrader Financiado Bot
 * 
 * Herramienta rápida para ejecutar tests específicos con el bot
 * sin necesidad de ejecutar toda la suite completa.
 * 
 * Uso: node quick-test-runner.js [firm] [category] [count]
 * 
 * @author Claude Code Optimization
 * @version 1.0.0
 * @date 2025-08-25
 */

const InteractiveBotTester = require('./interactive-bot-tester');

class QuickTestRunner {
    constructor() {
        this.tester = new InteractiveBotTester();
        
        // Quick test templates by category
        this.quickTests = {
            pricing: [
                "cuanto cuesta la cuenta de {size} en {firm}?",
                "precio {firm} {size}",
                "{firm} {size} precio mensual",
                "que sale la evaluacion {firm} {size}",
                "{firm} precios todas las cuentas"
            ],
            accounts: [
                "que cuentas tiene {firm}?",
                "planes disponibles {firm}",
                "{firm} opciones de cuentas",
                "tamaños de cuenta {firm}",
                "{firm} cuenta mas grande"
            ],
            payouts: [
                "como retiro dinero de {firm}?",
                "{firm} paga cada cuanto",
                "metodos de pago {firm}",
                "{firm} minimo retiro",
                "{firm} usa wise?"
            ],
            rules: [
                "reglas {firm}",
                "drawdown {firm} {size}",
                "{firm} perdida diaria maxima",
                "contratos maximos {firm}",
                "{firm} objetivos profit"
            ],
            platforms: [
                "{firm} usa ninjatrader?",
                "plataformas disponibles {firm}",
                "puedo usar tradingview en {firm}?",
                "{firm} plataforma incluida",
                "{firm} rithmic disponible?"
            ],
            general: [
                "como funciona {firm}?",
                "{firm} es buena opcion?",
                "ventajas de {firm}",
                "{firm} para principiantes",
                "{firm} opiniones"
            ]
        };
        
        // Account sizes for testing
        this.accountSizes = ['50k', '100k', '150k', '200k', '250k'];
        
        // Firm data
        this.firms = {
            apex: 'apex',
            alpha: 'alpha futures',
            takeprofit: 'takeprofit',
            bulenox: 'bulenox',
            mff: 'mff',
            tradeify: 'tradeify',
            vision: 'vision trade'
        };
    }

    /**
     * Parse command line arguments
     */
    parseArgs() {
        const args = process.argv.slice(2);
        
        return {
            firm: args[0] || 'random',
            category: args[1] || 'all',
            count: parseInt(args[2]) || 5
        };
    }

    /**
     * Get random element from array
     */
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Generate test questions based on parameters
     */
    generateQuestions(firm, category, count) {
        const questions = [];
        const firmName = firm === 'random' ? null : this.firms[firm] || firm;
        const categories = category === 'all' ? Object.keys(this.quickTests) : [category];
        
        for (let i = 0; i < count; i++) {
            // Select category
            const selectedCategory = this.getRandomElement(categories);
            const templates = this.quickTests[selectedCategory];
            
            if (!templates) {
                console.error(`❌ Category '${selectedCategory}' not found`);
                continue;
            }
            
            // Select template
            const template = this.getRandomElement(templates);
            
            // Select firm
            const selectedFirm = firmName || this.firms[this.getRandomElement(Object.keys(this.firms))];
            
            // Select account size
            const size = this.getRandomElement(this.accountSizes);
            
            // Generate question
            const question = template
                .replace(/{firm}/g, selectedFirm)
                .replace(/{size}/g, size);
            
            questions.push({
                question,
                category: selectedCategory,
                firm: selectedFirm
            });
        }
        
        return questions;
    }

    /**
     * Run quick test
     */
    async runQuickTest(questions) {
        console.log(`\n⚡ QUICK TEST - ${questions.length} questions`);
        console.log('=' .repeat(50));
        
        // Initialize tester
        await this.tester.init();
        
        // Disable prompts for automated testing
        this.tester.rl.pause();
        
        const results = {
            total: questions.length,
            successful: 0,
            failed: 0,
            avgResponseTime: 0,
            problems: []
        };
        
        // Run each question
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            console.log(`\n📝 Test ${i + 1}/${questions.length}`);
            console.log(`   Question: "${q.question}"`);
            console.log(`   Category: ${q.category} | Expected Firm: ${q.firm}`);
            
            const startTime = Date.now();
            
            try {
                // Process question
                await this.tester.processQuestion(q.question);
                
                // Get response
                const lastEntry = this.tester.conversationHistory[this.tester.conversationHistory.length - 1];
                
                if (lastEntry) {
                    const responseTime = Date.now() - startTime;
                    results.avgResponseTime += responseTime;
                    
                    // Check for problems
                    const problems = this.tester.detectProblems(lastEntry.response, {
                        faqs: lastEntry.dataFound.faqs,
                        plans: lastEntry.dataFound.plans
                    });
                    
                    if (problems.length > 0) {
                        results.failed++;
                        results.problems.push({
                            question: q.question,
                            problems
                        });
                        console.log(`   ❌ Problems detected: ${problems.join(', ')}`);
                    } else {
                        results.successful++;
                        console.log(`   ✅ Success (${responseTime}ms)`);
                    }
                    
                    // Show response preview
                    const preview = lastEntry.response.substring(0, 150).replace(/\n/g, ' ');
                    console.log(`   Response preview: ${preview}...`);
                } else {
                    results.failed++;
                    console.log(`   ❌ No response generated`);
                }
                
            } catch (error) {
                results.failed++;
                console.log(`   ❌ Error: ${error.message}`);
            }
            
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Calculate final stats
        results.avgResponseTime = results.avgResponseTime / questions.length;
        
        // Display summary
        console.log('\n' + '=' .repeat(50));
        console.log('📊 QUICK TEST SUMMARY');
        console.log('=' .repeat(50));
        console.log(`Total Tests: ${results.total}`);
        console.log(`Successful: ${results.successful} ✅`);
        console.log(`Failed: ${results.failed} ❌`);
        console.log(`Success Rate: ${((results.successful / results.total) * 100).toFixed(1)}%`);
        console.log(`Avg Response Time: ${Math.round(results.avgResponseTime)}ms`);
        
        if (results.problems.length > 0) {
            console.log('\n⚠️ Problems Found:');
            results.problems.slice(0, 5).forEach(p => {
                console.log(`   - "${p.question}"`);
                console.log(`     Issues: ${p.problems.join(', ')}`);
            });
        }
        
        // Close readline
        this.tester.rl.close();
    }

    /**
     * Show usage instructions
     */
    showUsage() {
        console.log('\n⚡ QUICK TEST RUNNER - ElTrader Financiado Bot');
        console.log('=' .repeat(50));
        console.log('\nUsage: node quick-test-runner.js [firm] [category] [count]');
        console.log('\nParameters:');
        console.log('  firm     - Firm to test (apex, alpha, takeprofit, bulenox, mff, tradeify, vision, random)');
        console.log('  category - Category to test (pricing, accounts, payouts, rules, platforms, general, all)');
        console.log('  count    - Number of tests to run (default: 5)');
        console.log('\nExamples:');
        console.log('  node quick-test-runner.js apex pricing 10');
        console.log('  node quick-test-runner.js random all 20');
        console.log('  node quick-test-runner.js mff rules');
        console.log('  node quick-test-runner.js');
    }

    /**
     * Main execution
     */
    async run() {
        const args = this.parseArgs();
        
        // Validate inputs
        if (args.firm === 'help' || args.category === 'help') {
            this.showUsage();
            return;
        }
        
        console.log('\n🚀 Starting Quick Test Runner...');
        console.log(`   Firm: ${args.firm}`);
        console.log(`   Category: ${args.category}`);
        console.log(`   Tests: ${args.count}`);
        
        // Generate questions
        const questions = this.generateQuestions(args.firm, args.category, args.count);
        
        if (questions.length === 0) {
            console.error('❌ No questions generated. Check your parameters.');
            this.showUsage();
            return;
        }
        
        // Run tests
        await this.runQuickTest(questions);
    }
}

// Run if called directly
if (require.main === module) {
    const runner = new QuickTestRunner();
    runner.run().catch(error => {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = QuickTestRunner;