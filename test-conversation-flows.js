/**
 * 🔄 CONVERSATION FLOW TESTER - ElTrader Financiado
 * 
 * Sistema de testing automatizado para flujos conversacionales multi-turno.
 * Valida coherencia entre respuestas y testing sistemático de todas las firmas.
 */

const InteractiveBotTester = require('./interactive-bot-tester');

class ConversationFlowTester extends InteractiveBotTester {
    constructor() {
        super();
        this.setupReadline = () => {}; // Disable interactive mode
        this.rl = null;
        
        this.conversationFlows = [
            {
                name: 'Apex - Account Selection Flow',
                firm: 'apex',
                flow: [
                    'Que cuentas tiene apex?',
                    'Cuanto cuesta la de 50K?',
                    'Y el drawdown de esa cuenta?',
                    'Con que plataformas puedo operar?'
                ],
                expectedPatterns: [
                    'account_plans',
                    'price_monthly',
                    'drawdown',
                    'platform'
                ]
            },
            {
                name: 'Alpha Futures - Payment Flow',
                firm: 'alpha',
                flow: [
                    'Como puedo retirar dinero de alpha futures?',
                    'Cuanto tiempo demora?',
                    'Hay comisiones por retiro?',
                    'Puedo usar PayPal?'
                ],
                expectedPatterns: [
                    'withdrawal',
                    'processing_time',
                    'fees',
                    'payment_methods'
                ]
            },
            {
                name: 'TakeProfit - Evaluation Flow',
                firm: 'takeprofit',
                flow: [
                    'Como funciona la evaluacion en takeprofit?',
                    'Cuantos dias minimo necesito?',
                    'Que pasa si fallo?',
                    'Puedo hacer reset?'
                ],
                expectedPatterns: [
                    'evaluation',
                    'minimum_days',
                    'failure_rules',
                    'reset_policy'
                ]
            },
            {
                name: 'Multi-Firm Comparison',
                firm: null,
                flow: [
                    'Que es mejor apex o bulenox?',
                    'En terminos de precios como se comparan?',
                    'Y las reglas de drawdown?',
                    'Cual recomendarias para principiantes?'
                ],
                expectedPatterns: [
                    'comparison',
                    'pricing_comparison',
                    'rules_comparison',
                    'recommendation'
                ]
            }
        ];
    }

    async runAllFlows() {
        console.log('🔄 TESTING CONVERSATION FLOWS - ElTrader Financiado');
        console.log('===================================================');
        
        const results = [];
        
        for (const flow of this.conversationFlows) {
            console.log(`\n${'='.repeat(80)}`);
            console.log(`🧪 TESTING FLOW: ${flow.name}`);
            console.log(`🏢 Target Firm: ${flow.firm || 'MULTI-FIRM'}`);
            console.log(`📝 Questions: ${flow.flow.length}`);
            
            const flowResult = await this.runSingleFlow(flow);
            results.push(flowResult);
            
            // Clear conversation history between flows
            this.conversationHistory = [];
            
            console.log(`✅ Flow completed: ${flowResult.success ? 'SUCCESS' : 'FAILED'}`);
            console.log(`📊 Success rate: ${flowResult.successRate}%`);
        }
        
        this.generateFlowReport(results);
        return results;
    }

    async runSingleFlow(flowConfig) {
        const flowResults = [];
        const startTime = Date.now();
        
        console.log(`\n🚀 Starting conversation flow...`);
        
        for (let i = 0; i < flowConfig.flow.length; i++) {
            const question = flowConfig.flow[i];
            const isFirst = i === 0;
            const isLast = i === flowConfig.flow.length - 1;
            
            console.log(`\n${i + 1}. 📝 Question: "${question}"`);
            console.log(`   Context: ${isFirst ? 'INITIAL' : 'CONTEXTUAL'} ${isLast ? '(FINAL)' : ''}`);
            
            try {
                const questionStartTime = Date.now();
                
                // Simulate question processing
                const firmSlug = this.detectFirmFromQuestion(question);
                const keywords = this.extractSearchKeywords(question);
                const comprehensiveData = await this.searchDatabase(question, firmSlug, keywords);
                const response = await this.generateResponse(question, firmSlug ? this.firms[firmSlug] : null, comprehensiveData);
                
                const questionTime = Date.now() - questionStartTime;
                
                // Analyze response quality
                const analysis = this.analyzeResponse(response, comprehensiveData, flowConfig);
                
                const questionResult = {
                    order: i + 1,
                    question,
                    response,
                    firmDetected: firmSlug,
                    keywords,
                    dataFound: comprehensiveData,
                    responseTime: questionTime,
                    analysis,
                    contextual: !isFirst,
                    success: analysis.score >= 70 // 70% minimum quality score
                };
                
                flowResults.push(questionResult);
                
                // Show immediate feedback
                console.log(`   ⚡ Response time: ${questionTime}ms`);
                console.log(`   🏢 Firm detected: ${firmSlug || 'GENERAL'}`);
                console.log(`   📊 Quality score: ${analysis.score}%`);
                console.log(`   📄 Response length: ${response.length} chars`);
                
                if (analysis.issues.length > 0) {
                    console.log(`   ⚠️ Issues: ${analysis.issues.join(', ')}`);
                }
                
                // Show response preview
                const preview = response.length > 150 ? response.substring(0, 150) + '...' : response;
                console.log(`   💬 Preview: "${preview}"`);
                
                // Add to conversation history for context
                this.conversationHistory.push({
                    question,
                    response,
                    firm: firmSlug,
                    keywords,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
                flowResults.push({
                    order: i + 1,
                    question,
                    error: error.message,
                    success: false
                });
            }
            
            // Pause between questions to simulate real conversation
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const totalTime = Date.now() - startTime;
        const successfulQuestions = flowResults.filter(r => r.success).length;
        const successRate = Math.round((successfulQuestions / flowResults.length) * 100);
        
        return {
            name: flowConfig.name,
            firm: flowConfig.firm,
            questions: flowResults,
            totalTime,
            successRate,
            success: successRate >= 80 // 80% minimum for flow success
        };
    }

    analyzeResponse(response, data, flowConfig) {
        const analysis = {
            score: 0,
            issues: [],
            strengths: []
        };
        
        let score = 0;
        
        // Basic quality checks (40 points)
        if (response.length >= 100) {
            score += 10;
            analysis.strengths.push('Adequate length');
        } else {
            analysis.issues.push('Too short');
        }
        
        if (!response.includes('información no disponible')) {
            score += 10;
            analysis.strengths.push('Specific information provided');
        } else {
            analysis.issues.push('Generic response');
        }
        
        if (response.includes('<b>') && !response.includes('**')) {
            score += 10;
            analysis.strengths.push('Correct HTML formatting');
        } else if (response.includes('**')) {
            analysis.issues.push('Using markdown instead of HTML');
        }
        
        if (response.match(/\$[\d,]+/) && !response.match(/\$?\d+%/)) {
            score += 10;
            analysis.strengths.push('Correct monetary formatting');
        } else if (response.match(/\$?\d+%/)) {
            analysis.issues.push('Incorrect monetary formatting');
        }
        
        // Data utilization (30 points)
        if (data.faqs && data.faqs.length > 0) {
            score += 15;
            analysis.strengths.push('Found relevant FAQs');
        }
        
        if (data.plans && data.plans.length > 0) {
            score += 15;
            analysis.strengths.push('Found relevant plans');
        }
        
        // Firm-specific checks (20 points)
        if (flowConfig.firm) {
            const firmName = this.firms[flowConfig.firm]?.name;
            if (firmName && response.includes(firmName)) {
                score += 20;
                analysis.strengths.push('Mentions correct firm');
            } else {
                analysis.issues.push('Missing firm identification');
            }
        } else {
            score += 20; // Multi-firm questions get this automatically
        }
        
        // Contextual coherence (10 points)
        if (this.conversationHistory.length > 0) {
            // Check if response maintains context from previous questions
            const lastQuestion = this.conversationHistory[this.conversationHistory.length - 1];
            if (lastQuestion.firm && this.detectFirmFromQuestion(response.toLowerCase()) === lastQuestion.firm) {
                score += 10;
                analysis.strengths.push('Maintains contextual firm focus');
            } else {
                analysis.issues.push('Lost contextual focus');
            }
        } else {
            score += 10; // First question gets this automatically
        }
        
        analysis.score = Math.min(score, 100);
        return analysis;
    }

    generateFlowReport(results) {
        console.log(`\n${'='.repeat(100)}`);
        console.log('📋 CONVERSATION FLOWS REPORT');
        console.log(`${'='.repeat(100)}`);
        
        const overallSuccess = results.filter(r => r.success).length;
        const overallRate = Math.round((overallSuccess / results.length) * 100);
        
        console.log(`📊 OVERALL RESULTS:`);
        console.log(`   Success Rate: ${overallRate}% (${overallSuccess}/${results.length} flows)`);
        console.log(`   Total Questions: ${results.reduce((sum, r) => sum + r.questions.length, 0)}`);
        console.log(`   Total Time: ${results.reduce((sum, r) => sum + r.totalTime, 0)}ms`);
        
        console.log(`\n📋 FLOW BREAKDOWN:`);
        results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${result.name}: ${result.successRate}% (${result.totalTime}ms)`);
            
            if (!result.success) {
                const failedQuestions = result.questions.filter(q => !q.success);
                console.log(`     Failed questions: ${failedQuestions.length}`);
                failedQuestions.forEach(q => {
                    console.log(`       - Q${q.order}: ${q.question.substring(0, 50)}...`);
                    if (q.analysis) {
                        console.log(`         Issues: ${q.analysis.issues.join(', ')}`);
                    }
                });
            }
        });
        
        console.log(`\n🔍 COMMON ISSUES DETECTED:`);
        const allIssues = results.flatMap(r => 
            r.questions.flatMap(q => q.analysis ? q.analysis.issues : [])
        );
        const issueCount = {};
        allIssues.forEach(issue => {
            issueCount[issue] = (issueCount[issue] || 0) + 1;
        });
        
        Object.entries(issueCount)
            .sort((a, b) => b[1] - a[1])
            .forEach(([issue, count]) => {
                console.log(`   - ${issue}: ${count} occurrences`);
            });
        
        console.log(`\n💪 STRENGTHS IDENTIFIED:`);
        const allStrengths = results.flatMap(r => 
            r.questions.flatMap(q => q.analysis ? q.analysis.strengths : [])
        );
        const strengthCount = {};
        allStrengths.forEach(strength => {
            strengthCount[strength] = (strengthCount[strength] || 0) + 1;
        });
        
        Object.entries(strengthCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5) // Top 5 strengths
            .forEach(([strength, count]) => {
                console.log(`   - ${strength}: ${count} occurrences`);
            });
        
        console.log(`\n🎯 RECOMMENDATIONS:`);
        if (overallRate < 80) {
            console.log('   ⚠️ Overall success rate below 80% - requires attention');
        }
        
        if (issueCount['Generic response'] > 2) {
            console.log('   🔧 Improve FAQ search and database queries');
        }
        
        if (issueCount['Incorrect monetary formatting'] > 0) {
            console.log('   💰 Fix monetary formatting in response generation');
        }
        
        if (issueCount['Using markdown instead of HTML'] > 0) {
            console.log('   📝 Enforce HTML formatting in system prompts');
        }
        
        console.log(`\n🚀 SYSTEM STATUS: ${overallRate >= 80 ? '✅ PRODUCTION READY' : '⚠️ NEEDS IMPROVEMENT'}`);
    }

    async runSpecificFirmFlow(firmSlug) {
        const firmFlows = this.conversationFlows.filter(f => f.firm === firmSlug);
        
        if (firmFlows.length === 0) {
            console.log(`❌ No flows defined for firm: ${firmSlug}`);
            return;
        }
        
        console.log(`🏢 Testing flows for: ${this.firms[firmSlug]?.name || firmSlug}`);
        
        for (const flow of firmFlows) {
            await this.runSingleFlow(flow);
            this.conversationHistory = []; // Clear between flows
        }
    }
}

// Auto-run if called directly
if (require.main === module) {
    const tester = new ConversationFlowTester();
    
    const args = process.argv.slice(2);
    
    if (args.length > 0 && args[0] === '--firm') {
        const firmSlug = args[1];
        if (!firmSlug) {
            console.log('❌ Please specify firm slug after --firm');
            process.exit(1);
        }
        tester.runSpecificFirmFlow(firmSlug).then(() => {
            console.log('\n✅ Firm-specific flow testing completed');
            process.exit(0);
        }).catch(error => {
            console.error('❌ Flow testing failed:', error.message);
            process.exit(1);
        });
    } else {
        tester.runAllFlows().then(() => {
            console.log('\n✅ All conversation flows completed');
            process.exit(0);
        }).catch(error => {
            console.error('❌ Flow testing failed:', error.message);
            process.exit(1);
        });
    }
}

module.exports = ConversationFlowTester;