#!/usr/bin/env node

/**
 * 🧪 COMPREHENSIVE TEST SUITE - ElTrader Financiado Bot
 * 
 * Sistema completo de testing que cubre las 7 firmas con variaciones realistas
 * de preguntas de clientes, incluyendo typos, slang, y casos edge.
 * 
 * @author Claude Code Optimization
 * @version 1.0.0
 * @date 2025-08-25
 */

const InteractiveBotTester = require('./interactive-bot-tester');
const fs = require('fs').promises;
const path = require('path');

class ComprehensiveTestSuite {
    constructor() {
        this.tester = new InteractiveBotTester();
        this.results = {
            totalTests: 0,
            passed: 0,
            failed: 0,
            firmResults: {},
            categoryResults: {},
            problemPatterns: [],
            startTime: new Date(),
            endTime: null
        };
        
        // Initialize firm results tracking
        const firms = ['apex', 'alpha', 'takeprofit', 'bulenox', 'mff', 'tradeify', 'vision'];
        firms.forEach(firm => {
            this.results.firmResults[firm] = {
                total: 0,
                passed: 0,
                failed: 0,
                avgResponseTime: 0,
                problems: []
            };
        });
        
        // Test categories
        this.categories = [
            'pricing', 'accounts', 'payouts', 'rules', 
            'platforms', 'beginners', 'comparisons', 'edge_cases'
        ];
        
        this.categories.forEach(cat => {
            this.results.categoryResults[cat] = {
                total: 0,
                passed: 0,
                failed: 0
            };
        });
    }

    /**
     * Generate comprehensive test questions for all firms
     */
    generateTestQuestions() {
        const testQuestions = [];
        
        // APEX TRADER FUNDING Tests
        const apexTests = [
            // Pricing variations
            { q: "cuanto cuesta la cuenta de 100k en apex?", category: "pricing", firm: "apex" },
            { q: "precio cuenta 50k apex", category: "pricing", firm: "apex" },
            { q: "qe sale la de 250k de apex trader", category: "pricing", firm: "apex" },
            { q: "apex 100000 precio mensual", category: "pricing", firm: "apex" },
            { q: "cuanro cuesta apec 50k?", category: "pricing", firm: "apex" }, // typo
            
            // Account plans
            { q: "que cuentas tiene apex trader funding?", category: "accounts", firm: "apex" },
            { q: "planes disponibles apex", category: "accounts", firm: "apex" },
            { q: "cuales son las cuentas de apex", category: "accounts", firm: "apex" },
            { q: "apex trader que opciones tienen", category: "accounts", firm: "apex" },
            
            // Payout questions
            { q: "como retiro dinero de apex?", category: "payouts", firm: "apex" },
            { q: "cuando paga apex trader", category: "payouts", firm: "apex" },
            { q: "metodos de pago apex", category: "payouts", firm: "apex" },
            { q: "apex wise o paypal?", category: "payouts", firm: "apex" },
            
            // Trading rules
            { q: "drawdown apex 100k", category: "rules", firm: "apex" },
            { q: "reglas de trading apex trader", category: "rules", firm: "apex" },
            { q: "contratos maximos apex", category: "rules", firm: "apex" },
            { q: "apex perdida diaria limite", category: "rules", firm: "apex" },
            
            // Platform questions
            { q: "apex usa ninjatrader?", category: "platforms", firm: "apex" },
            { q: "plataformas disponibles apex trader funding", category: "platforms", firm: "apex" },
            { q: "puedo usar tradingview en apex?", category: "platforms", firm: "apex" }
        ];
        
        // ALPHA FUTURES Tests
        const alphaTests = [
            // Pricing variations
            { q: "precios alpha futures", category: "pricing", firm: "alpha" },
            { q: "cuanto sale alpha futures 100k", category: "pricing", firm: "alpha" },
            { q: "alpha futurs precio 50k", category: "pricing", firm: "alpha" }, // typo
            { q: "costo mensual alfa futures", category: "pricing", firm: "alpha" },
            
            // Account specifics
            { q: "cuentas disponibles alpha futures", category: "accounts", firm: "alpha" },
            { q: "que planes tiene alpha", category: "accounts", firm: "alpha" },
            { q: "alpha futures opciones cuentas", category: "accounts", firm: "alpha" },
            
            // Payouts
            { q: "como cobro en alpha futures?", category: "payouts", firm: "alpha" },
            { q: "alpha futures pago minimo", category: "payouts", firm: "alpha" },
            { q: "metodos retiro alpha", category: "payouts", firm: "alpha" },
            
            // Rules
            { q: "reglas alpha futures evaluacion", category: "rules", firm: "alpha" },
            { q: "drawdown maximo alpha", category: "rules", firm: "alpha" },
            { q: "alpha futures tiempo limite", category: "rules", firm: "alpha" }
        ];
        
        // TAKEPROFIT TRADER Tests  
        const takeprofitTests = [
            // Pricing with variations
            { q: "takeprofit trader precios", category: "pricing", firm: "takeprofit" },
            { q: "take profit 50k precio", category: "pricing", firm: "takeprofit" },
            { q: "cuanto cuesta tpt 100k", category: "pricing", firm: "takeprofit" },
            { q: "takeprofit precio mensual", category: "pricing", firm: "takeprofit" },
            
            // Accounts
            { q: "que cuentas ofrece takeprofit?", category: "accounts", firm: "takeprofit" },
            { q: "planes take profit trader", category: "accounts", firm: "takeprofit" },
            { q: "takeprofit opciones disponibles", category: "accounts", firm: "takeprofit" },
            
            // Payouts
            { q: "takeprofit paga cada cuanto?", category: "payouts", firm: "takeprofit" },
            { q: "retiros tpt minimo", category: "payouts", firm: "takeprofit" },
            { q: "take profit metodos de pago", category: "payouts", firm: "takeprofit" },
            
            // Rules
            { q: "reglas takeprofit trader", category: "rules", firm: "takeprofit" },
            { q: "drawdown tpt", category: "rules", firm: "takeprofit" },
            { q: "takeprofit objetivos profit", category: "rules", firm: "takeprofit" }
        ];
        
        // BULENOX Tests
        const bulenoxTests = [
            // Pricing
            { q: "bulenox precios cuentas", category: "pricing", firm: "bulenox" },
            { q: "cuanto cuesta bulenox 100k", category: "pricing", firm: "bulenox" },
            { q: "bulenox precio evaluacion", category: "pricing", firm: "bulenox" },
            
            // Accounts  
            { q: "que cuentas tiene bulenox?", category: "accounts", firm: "bulenox" },
            { q: "bulenox planes disponibles", category: "accounts", firm: "bulenox" },
            
            // Payouts
            { q: "como retiro en bulenox", category: "payouts", firm: "bulenox" },
            { q: "bulenox pagos frecuencia", category: "payouts", firm: "bulenox" },
            
            // Rules
            { q: "reglas trading bulenox", category: "rules", firm: "bulenox" },
            { q: "bulenox drawdown maximo", category: "rules", firm: "bulenox" }
        ];
        
        // MY FUNDED FUTURES Tests
        const mffTests = [
            // Pricing variations
            { q: "mff precios", category: "pricing", firm: "mff" },
            { q: "my funded futures 100k precio", category: "pricing", firm: "mff" },
            { q: "cuanto sale mff 50k", category: "pricing", firm: "mff" },
            { q: "myfundedfutures costo mensual", category: "pricing", firm: "mff" },
            
            // Accounts
            { q: "planes mff disponibles", category: "accounts", firm: "mff" },
            { q: "my funded futures cuentas", category: "accounts", firm: "mff" },
            { q: "que opciones tiene mff", category: "accounts", firm: "mff" },
            
            // Payouts
            { q: "mff paga cuando?", category: "payouts", firm: "mff" },
            { q: "retiros my funded futures", category: "payouts", firm: "mff" },
            { q: "mff metodos de pago", category: "payouts", firm: "mff" },
            
            // Rules
            { q: "reglas mff evaluacion", category: "rules", firm: "mff" },
            { q: "drawdown my funded futures", category: "rules", firm: "mff" },
            { q: "mff contratos maximos", category: "rules", firm: "mff" }
        ];
        
        // TRADEIFY Tests
        const tradeifyTests = [
            // Pricing
            { q: "tradeify precios", category: "pricing", firm: "tradeify" },
            { q: "cuanto cuesta tradeify 100k", category: "pricing", firm: "tradeify" },
            { q: "precio evaluacion tradeify", category: "pricing", firm: "tradeify" },
            
            // Accounts
            { q: "que cuentas tiene tradeify?", category: "accounts", firm: "tradeify" },
            { q: "planes disponibles tradeify", category: "accounts", firm: "tradeify" },
            
            // Payouts  
            { q: "como cobro en tradeify", category: "payouts", firm: "tradeify" },
            { q: "tradeify frecuencia pagos", category: "payouts", firm: "tradeify" },
            
            // Rules
            { q: "reglas trading tradeify", category: "rules", firm: "tradeify" },
            { q: "drawdown tradeify", category: "rules", firm: "tradeify" }
        ];
        
        // VISION TRADE Tests
        const visionTests = [
            // Pricing
            { q: "vision trade precios", category: "pricing", firm: "vision" },
            { q: "cuanto sale vision trade futures", category: "pricing", firm: "vision" },
            { q: "vision precio 100k", category: "pricing", firm: "vision" },
            
            // Accounts
            { q: "cuentas vision trade futures", category: "accounts", firm: "vision" },
            { q: "que planes tiene vision", category: "accounts", firm: "vision" },
            
            // Payouts
            { q: "vision trade como retiro", category: "payouts", firm: "vision" },
            { q: "pagos vision trade futures", category: "payouts", firm: "vision" },
            
            // Rules
            { q: "reglas vision trade", category: "rules", firm: "vision" },
            { q: "vision drawdown limite", category: "rules", firm: "vision" }
        ];
        
        // BEGINNER Questions (no specific firm)
        const beginnerTests = [
            { q: "como empiezo en prop trading?", category: "beginners", firm: null },
            { q: "cual es la mejor firma para principiantes?", category: "beginners", firm: null },
            { q: "que firma me recomiendas para empezar?", category: "beginners", firm: null },
            { q: "cual es la mas barata para empezar?", category: "beginners", firm: null },
            { q: "necesito experiencia para prop trading?", category: "beginners", firm: null }
        ];
        
        // COMPARISON Questions
        const comparisonTests = [
            { q: "apex vs takeprofit cual es mejor?", category: "comparisons", firm: null },
            { q: "diferencias entre alpha y mff", category: "comparisons", firm: null },
            { q: "compara bulenox con tradeify", category: "comparisons", firm: null },
            { q: "vision trade o apex?", category: "comparisons", firm: null },
            { q: "cual tiene mejores precios apex o alpha?", category: "comparisons", firm: null }
        ];
        
        // EDGE CASES & Special Tests
        const edgeCaseTests = [
            // Context missing
            { q: "cuanto cuesta?", category: "edge_cases", firm: null },
            { q: "como retiro?", category: "edge_cases", firm: null },
            { q: "que reglas tiene?", category: "edge_cases", firm: null },
            
            // Multiple firms in one question
            { q: "precios de apex, alpha y takeprofit", category: "edge_cases", firm: null },
            { q: "quiero comparar todas las firmas", category: "edge_cases", firm: null },
            
            // Competitor mentions
            { q: "es mejor que ftmo?", category: "edge_cases", firm: null },
            { q: "tienen algo como funded next?", category: "edge_cases", firm: null },
            
            // Discount questions
            { q: "hay descuentos disponibles?", category: "edge_cases", firm: null },
            { q: "codigos de descuento apex", category: "edge_cases", firm: "apex" },
            { q: "promos alpha futures", category: "edge_cases", firm: "alpha" },
            
            // Typos and slang
            { q: "qiero empesar con apeks", category: "edge_cases", firm: "apex" },
            { q: "alguien save de mff?", category: "edge_cases", firm: "mff" },
            { q: "ta bueno takeprofit?", category: "edge_cases", firm: "takeprofit" },
            
            // Mixed language
            { q: "what about los precios de apex?", category: "edge_cases", firm: "apex" },
            { q: "el drawdown de alpha futures es daily?", category: "edge_cases", firm: "alpha" }
        ];
        
        // Combine all tests
        testQuestions.push(
            ...apexTests,
            ...alphaTests,
            ...takeprofitTests,
            ...bulenoxTests,
            ...mffTests,
            ...tradeifyTests,
            ...visionTests,
            ...beginnerTests,
            ...comparisonTests,
            ...edgeCaseTests
        );
        
        return testQuestions;
    }

    /**
     * Run a single test and evaluate results
     */
    async runSingleTest(testCase, index) {
        console.log(`\n🧪 Test ${index + 1}: "${testCase.q}"`);
        console.log(`   Category: ${testCase.category} | Firm: ${testCase.firm || 'GENERAL'}`);
        
        const startTime = Date.now();
        
        try {
            // Process question through bot
            await this.tester.processQuestion(testCase.q);
            
            // Get last conversation entry
            const lastEntry = this.tester.conversationHistory[this.tester.conversationHistory.length - 1];
            
            if (!lastEntry) {
                throw new Error('No response generated');
            }
            
            // Evaluate response
            const evaluation = this.evaluateResponse(testCase, lastEntry);
            
            // Update results
            this.results.totalTests++;
            
            if (evaluation.passed) {
                this.results.passed++;
                console.log(`   ✅ PASSED (${lastEntry.responseTime}ms)`);
            } else {
                this.results.failed++;
                console.log(`   ❌ FAILED: ${evaluation.reasons.join(', ')}`);
            }
            
            // Update category results
            this.results.categoryResults[testCase.category].total++;
            if (evaluation.passed) {
                this.results.categoryResults[testCase.category].passed++;
            } else {
                this.results.categoryResults[testCase.category].failed++;
            }
            
            // Update firm results if applicable
            if (testCase.firm) {
                this.results.firmResults[testCase.firm].total++;
                if (evaluation.passed) {
                    this.results.firmResults[testCase.firm].passed++;
                } else {
                    this.results.firmResults[testCase.firm].failed++;
                    this.results.firmResults[testCase.firm].problems.push({
                        question: testCase.q,
                        reasons: evaluation.reasons
                    });
                }
                
                // Update average response time
                const firmStats = this.results.firmResults[testCase.firm];
                firmStats.avgResponseTime = Math.round(
                    (firmStats.avgResponseTime * (firmStats.total - 1) + lastEntry.responseTime) / firmStats.total
                );
            }
            
            // Track problem patterns
            evaluation.problems.forEach(problem => {
                const existing = this.results.problemPatterns.find(p => p.type === problem);
                if (existing) {
                    existing.count++;
                    existing.examples.push(testCase.q);
                } else {
                    this.results.problemPatterns.push({
                        type: problem,
                        count: 1,
                        examples: [testCase.q]
                    });
                }
            });
            
            return evaluation;
            
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
            this.results.totalTests++;
            this.results.failed++;
            
            if (testCase.firm) {
                this.results.firmResults[testCase.firm].total++;
                this.results.firmResults[testCase.firm].failed++;
            }
            
            this.results.categoryResults[testCase.category].total++;
            this.results.categoryResults[testCase.category].failed++;
            
            return { passed: false, reasons: [error.message], problems: [] };
        }
    }

    /**
     * Evaluate a bot response against test criteria
     */
    evaluateResponse(testCase, conversationEntry) {
        const evaluation = {
            passed: true,
            reasons: [],
            problems: []
        };
        
        const response = conversationEntry.response;
        const detectedFirm = conversationEntry.firm;
        
        // Check 1: Firm detection accuracy
        if (testCase.firm && detectedFirm !== testCase.firm) {
            evaluation.passed = false;
            evaluation.reasons.push(`Firm detection failed: expected ${testCase.firm}, got ${detectedFirm || 'none'}`);
            evaluation.problems.push('firm_detection_error');
        }
        
        // Check 2: Response uses database information
        if (conversationEntry.dataFound.faqs === 0 && conversationEntry.dataFound.plans === 0) {
            if (!response.includes('/start') && testCase.category !== 'edge_cases') {
                evaluation.passed = false;
                evaluation.reasons.push('No database information used');
                evaluation.problems.push('no_data_found');
            }
        }
        
        // Check 3: Monetary formatting
        const moneyFormatErrors = response.match(/\$?\d{3,}%/g);
        if (moneyFormatErrors) {
            evaluation.passed = false;
            evaluation.reasons.push(`Monetary format error: ${moneyFormatErrors.join(', ')}`);
            evaluation.problems.push('monetary_format_error');
        }
        
        // Check 4: No "information not available" for common questions
        if (testCase.category !== 'edge_cases') {
            if (response.includes('información no disponible') || 
                response.includes('no tengo información') ||
                response.includes('no puedo proporcionar')) {
                evaluation.passed = false;
                evaluation.reasons.push('Generic "no info" response');
                evaluation.problems.push('generic_no_info');
            }
        }
        
        // Check 5: Response length and quality
        if (response.length < 100 && testCase.category !== 'edge_cases') {
            evaluation.passed = false;
            evaluation.reasons.push('Response too short');
            evaluation.problems.push('response_too_short');
        }
        
        // Check 6: HTML formatting (not markdown)
        if (response.includes('**') || response.includes('##')) {
            evaluation.passed = false;
            evaluation.reasons.push('Using markdown instead of HTML');
            evaluation.problems.push('markdown_instead_html');
        }
        
        // Check 7: Contains relevant information for category
        const categoryChecks = {
            pricing: ['$', 'precio', 'cuesta', 'mensual'],
            accounts: ['cuenta', 'plan', 'disponible'],
            payouts: ['pago', 'retiro', 'cobr', 'transferencia'],
            rules: ['regla', 'drawdown', 'limite', 'perdida'],
            platforms: ['plataforma', 'ninjatrader', 'tradingview', 'metatrader']
        };
        
        if (categoryChecks[testCase.category]) {
            const keywords = categoryChecks[testCase.category];
            const hasRelevantInfo = keywords.some(kw => response.toLowerCase().includes(kw));
            
            if (!hasRelevantInfo && testCase.category !== 'edge_cases') {
                evaluation.passed = false;
                evaluation.reasons.push(`Missing ${testCase.category} information`);
                evaluation.problems.push(`missing_${testCase.category}_info`);
            }
        }
        
        // Check 8: Response time (warning only, not fail)
        if (conversationEntry.responseTime > 3000) {
            evaluation.problems.push('slow_response');
        }
        
        return evaluation;
    }

    /**
     * Generate comprehensive test report
     */
    async generateReport() {
        const report = {
            summary: {
                totalTests: this.results.totalTests,
                passed: this.results.passed,
                failed: this.results.failed,
                successRate: ((this.results.passed / this.results.totalTests) * 100).toFixed(2) + '%',
                duration: this.results.endTime - this.results.startTime,
                timestamp: new Date().toISOString()
            },
            firmPerformance: {},
            categoryPerformance: {},
            commonProblems: [],
            recommendations: []
        };
        
        // Firm performance analysis
        Object.entries(this.results.firmResults).forEach(([firm, stats]) => {
            if (stats.total > 0) {
                report.firmPerformance[firm] = {
                    total: stats.total,
                    passed: stats.passed,
                    failed: stats.failed,
                    successRate: ((stats.passed / stats.total) * 100).toFixed(2) + '%',
                    avgResponseTime: stats.avgResponseTime + 'ms',
                    failureExamples: stats.problems.slice(0, 3)
                };
            }
        });
        
        // Category performance analysis
        Object.entries(this.results.categoryResults).forEach(([category, stats]) => {
            if (stats.total > 0) {
                report.categoryPerformance[category] = {
                    total: stats.total,
                    passed: stats.passed,
                    failed: stats.failed,
                    successRate: ((stats.passed / stats.total) * 100).toFixed(2) + '%'
                };
            }
        });
        
        // Common problems analysis
        report.commonProblems = this.results.problemPatterns
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map(problem => ({
                type: problem.type,
                occurrences: problem.count,
                examples: problem.examples.slice(0, 3)
            }));
        
        // Generate recommendations
        if (report.commonProblems.find(p => p.type === 'firm_detection_error')) {
            report.recommendations.push('Improve firm detection algorithm - consider adding more keywords or fuzzy matching');
        }
        
        if (report.commonProblems.find(p => p.type === 'no_data_found')) {
            report.recommendations.push('Enhance FAQ search algorithm - implement better keyword extraction');
        }
        
        if (report.commonProblems.find(p => p.type === 'monetary_format_error')) {
            report.recommendations.push('Fix monetary formatting - ensure all dollar amounts use proper format');
        }
        
        if (report.commonProblems.find(p => p.type === 'generic_no_info')) {
            report.recommendations.push('Reduce generic responses - always try to provide relevant information');
        }
        
        // Identify best and worst performing firms
        const firmPerformanceArray = Object.entries(report.firmPerformance)
            .map(([firm, stats]) => ({ firm, successRate: parseFloat(stats.successRate) }))
            .sort((a, b) => b.successRate - a.successRate);
        
        if (firmPerformanceArray.length > 0) {
            report.bestPerformingFirm = firmPerformanceArray[0];
            report.worstPerformingFirm = firmPerformanceArray[firmPerformanceArray.length - 1];
        }
        
        return report;
    }

    /**
     * Save test results to file
     */
    async saveResults(report) {
        try {
            const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
            const filename = `test-results-${timestamp}.json`;
            const filepath = path.join(__dirname, 'test-results', filename);
            
            // Create directory if it doesn't exist
            await fs.mkdir(path.join(__dirname, 'test-results'), { recursive: true });
            
            // Save JSON report
            await fs.writeFile(filepath, JSON.stringify(report, null, 2));
            
            // Generate HTML report
            const htmlReport = this.generateHTMLReport(report);
            const htmlFilepath = filepath.replace('.json', '.html');
            await fs.writeFile(htmlFilepath, htmlReport);
            
            console.log(`\n✅ Results saved:`);
            console.log(`   JSON: ${filepath}`);
            console.log(`   HTML: ${htmlFilepath}`);
            
        } catch (error) {
            console.error(`❌ Error saving results: ${error.message}`);
        }
    }

    /**
     * Generate HTML report for better visualization
     */
    generateHTMLReport(report) {
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ElTrader Bot Test Results - ${new Date().toLocaleDateString()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1, h2, h3 {
            color: #2c3e50;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .metric {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #3498db;
        }
        .metric h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #7f8c8d;
            text-transform: uppercase;
        }
        .metric .value {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
        }
        .success { border-left-color: #27ae60; }
        .warning { border-left-color: #f39c12; }
        .danger { border-left-color: #e74c3c; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ecf0f1;
        }
        th {
            background: #34495e;
            color: white;
            font-weight: bold;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .problem {
            background: #fee;
            padding: 10px;
            border-radius: 5px;
            margin: 5px 0;
            border-left: 4px solid #e74c3c;
        }
        .recommendation {
            background: #e8f5e9;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            border-left: 4px solid #27ae60;
        }
        .chart {
            margin: 30px 0;
        }
        .bar {
            display: flex;
            align-items: center;
            margin: 10px 0;
        }
        .bar-label {
            width: 150px;
            font-weight: bold;
        }
        .bar-container {
            flex: 1;
            background: #ecf0f1;
            height: 30px;
            border-radius: 15px;
            overflow: hidden;
            position: relative;
        }
        .bar-fill {
            height: 100%;
            background: #3498db;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 10px;
            color: white;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 ElTrader Bot - Comprehensive Test Results</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        
        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value">${report.summary.totalTests}</div>
            </div>
            <div class="metric success">
                <h3>Passed</h3>
                <div class="value">${report.summary.passed}</div>
            </div>
            <div class="metric danger">
                <h3>Failed</h3>
                <div class="value">${report.summary.failed}</div>
            </div>
            <div class="metric ${parseFloat(report.summary.successRate) >= 90 ? 'success' : parseFloat(report.summary.successRate) >= 80 ? 'warning' : 'danger'}">
                <h3>Success Rate</h3>
                <div class="value">${report.summary.successRate}</div>
            </div>
        </div>

        <h2>📊 Firm Performance</h2>
        <table>
            <thead>
                <tr>
                    <th>Firm</th>
                    <th>Tests</th>
                    <th>Passed</th>
                    <th>Failed</th>
                    <th>Success Rate</th>
                    <th>Avg Response Time</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(report.firmPerformance).map(([firm, stats]) => `
                    <tr>
                        <td><strong>${firm.toUpperCase()}</strong></td>
                        <td>${stats.total}</td>
                        <td style="color: #27ae60;">${stats.passed}</td>
                        <td style="color: #e74c3c;">${stats.failed}</td>
                        <td>${stats.successRate}</td>
                        <td>${stats.avgResponseTime}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <h2>📈 Category Performance</h2>
        <div class="chart">
            ${Object.entries(report.categoryPerformance).map(([category, stats]) => `
                <div class="bar">
                    <div class="bar-label">${category}</div>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${stats.successRate}; background: ${parseFloat(stats.successRate) >= 90 ? '#27ae60' : parseFloat(stats.successRate) >= 80 ? '#f39c12' : '#e74c3c'}">
                            ${stats.successRate}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <h2>⚠️ Common Problems</h2>
        ${report.commonProblems.map(problem => `
            <div class="problem">
                <strong>${problem.type.replace(/_/g, ' ').toUpperCase()}</strong> - ${problem.occurrences} occurrences
                <br><small>Examples: ${problem.examples.join(' | ')}</small>
            </div>
        `).join('')}

        <h2>💡 Recommendations</h2>
        ${report.recommendations.map(rec => `
            <div class="recommendation">
                ${rec}
            </div>
        `).join('')}

        ${report.bestPerformingFirm ? `
            <h2>🏆 Performance Summary</h2>
            <p><strong>Best Performing Firm:</strong> ${report.bestPerformingFirm.firm.toUpperCase()} (${report.bestPerformingFirm.successRate}% success rate)</p>
            <p><strong>Worst Performing Firm:</strong> ${report.worstPerformingFirm.firm.toUpperCase()} (${report.worstPerformingFirm.successRate}% success rate)</p>
        ` : ''}
    </div>
</body>
</html>`;
    }

    /**
     * Run the complete test suite
     */
    async runFullTestSuite() {
        console.log('🚀 COMPREHENSIVE TEST SUITE - ElTrader Financiado Bot');
        console.log('=' .repeat(60));
        console.log('Testing all 7 firms with realistic customer questions...\n');
        
        // Initialize bot tester
        await this.tester.init();
        
        // Generate test questions
        const testQuestions = this.generateTestQuestions();
        console.log(`\n📋 Generated ${testQuestions.length} test questions`);
        console.log('Starting tests...\n');
        
        // Run tests with progress indicator
        for (let i = 0; i < testQuestions.length; i++) {
            await this.runSingleTest(testQuestions[i], i);
            
            // Small delay between tests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Progress indicator every 10 tests
            if ((i + 1) % 10 === 0) {
                const progress = ((i + 1) / testQuestions.length * 100).toFixed(1);
                console.log(`\n📊 Progress: ${i + 1}/${testQuestions.length} (${progress}%)\n`);
            }
        }
        
        // Mark end time
        this.results.endTime = new Date();
        
        // Generate report
        console.log('\n📊 Generating comprehensive report...');
        const report = await this.generateReport();
        
        // Display summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${report.summary.totalTests}`);
        console.log(`Passed: ${report.summary.passed} ✅`);
        console.log(`Failed: ${report.summary.failed} ❌`);
        console.log(`Success Rate: ${report.summary.successRate}`);
        console.log(`Duration: ${Math.round(report.summary.duration / 1000)}s`);
        
        // Save results
        await this.saveResults(report);
        
        // Exit
        process.exit(0);
    }
}

// Run if called directly
if (require.main === module) {
    const suite = new ComprehensiveTestSuite();
    suite.runFullTestSuite().catch(error => {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = ComprehensiveTestSuite;