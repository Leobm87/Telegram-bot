#!/usr/bin/env node

/**
 * 📋 MANUAL TEST SCENARIOS - ElTrader Financiado Bot
 * 
 * Colección de escenarios de prueba manual organizados por categoría
 * para usar con el interactive-bot-tester.js
 * 
 * @author Claude Code Optimization
 * @version 1.0.0
 * @date 2025-08-25
 */

const fs = require('fs').promises;
const path = require('path');

class ManualTestScenarios {
    constructor() {
        this.scenarios = this.buildScenarios();
    }

    buildScenarios() {
        return {
            // PRICING QUESTIONS - All Firms
            pricing: {
                apex: [
                    "cuanto cuesta la cuenta de 100k en apex?",
                    "precio apex 50k mensual",
                    "que sale la evaluacion apex 250k",
                    "apex trader funding precios todas las cuentas",
                    "hay descuentos para apex?"
                ],
                alpha: [
                    "precios alpha futures",
                    "cuanto cuesta alpha 100k",
                    "alpha futures precio evaluacion 50k",
                    "todas las cuentas de alpha con precios",
                    "alpha futures tiene promos?"
                ],
                takeprofit: [
                    "takeprofit trader precios",
                    "tpt 100k cuanto sale",
                    "precio mensual take profit 50k",
                    "takeprofit todas las cuentas precios",
                    "descuentos takeprofit"
                ],
                bulenox: [
                    "bulenox precios cuentas",
                    "cuanto cuesta bulenox 100k",
                    "precio evaluacion bulenox",
                    "todos los planes bulenox con precios",
                    "bulenox tiene descuentos?"
                ],
                mff: [
                    "mff precios",
                    "my funded futures 100k precio",
                    "cuanto sale mff evaluacion",
                    "todos los precios de mff",
                    "codigos descuento mff"
                ],
                tradeify: [
                    "tradeify precios",
                    "cuanto cuesta tradeify 100k",
                    "precio planes tradeify",
                    "tradeify todos los precios",
                    "hay descuentos tradeify?"
                ],
                vision: [
                    "vision trade precios",
                    "cuanto sale vision 100k",
                    "vision trade futures precio evaluacion",
                    "todos los precios vision",
                    "promos vision trade"
                ]
            },

            // ACCOUNT PLANS - All Firms
            accounts: {
                apex: [
                    "que cuentas tiene apex?",
                    "planes disponibles apex trader",
                    "apex opciones de cuentas",
                    "tamaños de cuenta apex",
                    "apex cuenta mas grande"
                ],
                alpha: [
                    "cuentas alpha futures",
                    "que planes tiene alpha",
                    "opciones alpha futures",
                    "alpha cuenta maxima",
                    "planes disponibles alpha"
                ],
                takeprofit: [
                    "takeprofit que cuentas ofrece",
                    "planes take profit trader",
                    "opciones tpt",
                    "takeprofit cuenta mas grande",
                    "todos los planes takeprofit"
                ],
                bulenox: [
                    "bulenox cuentas disponibles",
                    "planes bulenox",
                    "que opciones tiene bulenox",
                    "bulenox tamaños cuenta",
                    "bulenox plan maximo"
                ],
                mff: [
                    "mff que cuentas tiene",
                    "my funded futures planes",
                    "opciones mff disponibles",
                    "mff cuenta maxima",
                    "todos los planes mff"
                ],
                tradeify: [
                    "tradeify cuentas",
                    "planes tradeify disponibles",
                    "opciones tradeify",
                    "tradeify cuenta mas grande",
                    "todos los planes tradeify"
                ],
                vision: [
                    "vision trade cuentas",
                    "planes vision disponibles",
                    "opciones vision trade futures",
                    "vision cuenta maxima",
                    "todos los planes vision"
                ]
            },

            // PAYOUT/WITHDRAWAL - All Firms
            payouts: {
                apex: [
                    "como retiro dinero de apex?",
                    "apex paga cada cuanto",
                    "metodos de pago apex trader",
                    "apex minimo retiro",
                    "apex usa wise?"
                ],
                alpha: [
                    "como cobro en alpha futures",
                    "alpha cuando paga",
                    "metodos retiro alpha",
                    "alpha futures pago minimo",
                    "alpha acepta paypal?"
                ],
                takeprofit: [
                    "takeprofit como retiro",
                    "cuando paga take profit trader",
                    "tpt metodos de pago",
                    "takeprofit minimo para cobrar",
                    "takeprofit paga por wise?"
                ],
                bulenox: [
                    "bulenox como cobro",
                    "cuando paga bulenox",
                    "metodos pago bulenox",
                    "bulenox retiro minimo",
                    "bulenox acepta transferencia?"
                ],
                mff: [
                    "mff como retiro dinero",
                    "my funded futures cuando paga",
                    "metodos de pago mff",
                    "mff minimo retiro",
                    "mff paga por crypto?"
                ],
                tradeify: [
                    "tradeify como cobro",
                    "cuando paga tradeify",
                    "metodos retiro tradeify",
                    "tradeify pago minimo",
                    "tradeify usa wise?"
                ],
                vision: [
                    "vision trade como retiro",
                    "cuando paga vision",
                    "metodos pago vision trade",
                    "vision minimo para cobrar",
                    "vision acepta paypal?"
                ]
            },

            // TRADING RULES - All Firms
            rules: {
                apex: [
                    "reglas apex trader funding",
                    "drawdown apex 100k",
                    "apex perdida diaria maxima",
                    "contratos maximos apex",
                    "apex objetivos profit"
                ],
                alpha: [
                    "reglas alpha futures",
                    "drawdown alpha",
                    "alpha futures limite perdida",
                    "contratos alpha maximo",
                    "alpha objetivos evaluacion"
                ],
                takeprofit: [
                    "reglas takeprofit trader",
                    "drawdown tpt",
                    "take profit limite diario",
                    "contratos maximos takeprofit",
                    "takeprofit objetivos"
                ],
                bulenox: [
                    "reglas trading bulenox",
                    "drawdown bulenox",
                    "bulenox perdida maxima",
                    "contratos bulenox limite",
                    "bulenox objetivos profit"
                ],
                mff: [
                    "reglas mff",
                    "drawdown my funded futures",
                    "mff limite perdida diaria",
                    "contratos maximos mff",
                    "mff objetivos evaluacion"
                ],
                tradeify: [
                    "reglas tradeify",
                    "drawdown tradeify",
                    "tradeify limite perdida",
                    "contratos tradeify maximo",
                    "tradeify objetivos"
                ],
                vision: [
                    "reglas vision trade",
                    "drawdown vision",
                    "vision limite diario",
                    "contratos vision maximo",
                    "vision objetivos profit"
                ]
            },

            // PLATFORM QUESTIONS
            platforms: {
                general: [
                    "que plataformas usa apex?",
                    "alpha futures tiene ninjatrader?",
                    "takeprofit acepta tradingview?",
                    "bulenox que plataformas ofrece?",
                    "mff puedo usar metatrader?",
                    "tradeify plataformas disponibles",
                    "vision trade usa rithmic?"
                ],
                specific: [
                    "apex ninjatrader gratis?",
                    "alpha con tradovate",
                    "takeprofit plataforma incluida",
                    "bulenox costo plataforma",
                    "mff rithmic data",
                    "tradeify mt5 disponible?",
                    "vision quantower incluido?"
                ]
            },

            // BEGINNER QUESTIONS
            beginners: [
                "como empiezo en prop trading?",
                "cual firma es mejor para principiantes?",
                "que firma me recomiendas para empezar?",
                "cual es la mas barata para comenzar?",
                "necesito experiencia para prop trading?",
                "cual es mas facil de pasar?",
                "que firma tiene mejores reglas para novatos?",
                "puedo empezar con poca plata?",
                "cual tiene el challenge mas facil?",
                "que firma perdona mas errores?"
            ],

            // COMPARISON QUESTIONS
            comparisons: [
                "apex vs takeprofit cual es mejor?",
                "diferencia entre alpha y mff",
                "compara bulenox con tradeify",
                "vision o apex para principiantes?",
                "cual paga mejor apex o alpha?",
                "takeprofit vs mff reglas",
                "bulenox o vision para scalping?",
                "tradeify vs apex precios",
                "alpha o takeprofit para swing?",
                "mff vs vision drawdown"
            ],

            // EDGE CASES & TYPOS
            edge_cases: {
                typos: [
                    "apeks trader cuanto cuesta",
                    "alpa futures precios",
                    "takprofit reglas",
                    "bulenocs drawdown",
                    "mf funded futures",
                    "tradify plataformas",
                    "vison trade pagos"
                ],
                incomplete: [
                    "cuanto cuesta?",
                    "como retiro?",
                    "que reglas tiene?",
                    "cuando pagan?",
                    "hay descuentos?",
                    "cual es mejor?",
                    "como empiezo?"
                ],
                multiple_firms: [
                    "precios de apex alpha y takeprofit",
                    "compara todas las firmas",
                    "cual de las 7 es mejor?",
                    "diferencias entre todas",
                    "precios de todas las firmas"
                ],
                slang: [
                    "ta bueno apex?",
                    "alpha futures ta caro?",
                    "takeprofit es facil o que?",
                    "bulenox vale la pena mano?",
                    "mff ta bueno pa empezar?",
                    "tradeify q onda",
                    "vision trade sirve?"
                ],
                mixed_language: [
                    "el drawdown de apex es daily?",
                    "alpha futures tiene live chat?",
                    "takeprofit reset cuanto sale?",
                    "bulenox scaling plan tiene?",
                    "mff profit split cuanto es?",
                    "tradeify copy trading permite?",
                    "vision trade news trading?"
                ]
            },

            // SPECIFIC SCENARIOS
            specific_scenarios: {
                discounts: [
                    "hay descuentos activos?",
                    "codigos de descuento apex",
                    "promos alpha futures",
                    "takeprofit black friday",
                    "bulenox descuento nuevo usuario",
                    "mff codigo promocional",
                    "tradeify ofertas",
                    "vision trade descuentos"
                ],
                reset_refund: [
                    "apex costo reset",
                    "alpha futures reset gratis?",
                    "takeprofit reembolso",
                    "bulenox devuelve dinero?",
                    "mff reset incluido",
                    "tradeify politica reembolso",
                    "vision reset cuenta"
                ],
                countries: [
                    "apex acepta mexico?",
                    "alpha futures desde argentina",
                    "takeprofit colombia permitido?",
                    "bulenox restricciones paises",
                    "mff acepta venezuela?",
                    "tradeify desde españa",
                    "vision trade latam?"
                ],
                verification: [
                    "apex pide kyc?",
                    "alpha futures verificacion",
                    "takeprofit documentos necesarios",
                    "bulenox id requerido?",
                    "mff verificacion identidad",
                    "tradeify kyc obligatorio?",
                    "vision trade documentacion"
                ]
            }
        };
    }

    /**
     * Display menu of test scenarios
     */
    displayMenu() {
        console.log('\n📋 MANUAL TEST SCENARIOS - ElTrader Financiado Bot');
        console.log('=' .repeat(60));
        console.log('\nCategories available:');
        console.log('1. Pricing Questions (all firms)');
        console.log('2. Account Plans (all firms)');
        console.log('3. Payout/Withdrawal (all firms)');
        console.log('4. Trading Rules (all firms)');
        console.log('5. Platform Questions');
        console.log('6. Beginner Questions');
        console.log('7. Comparison Questions');
        console.log('8. Edge Cases & Typos');
        console.log('9. Specific Scenarios');
        console.log('10. Export All Questions');
        console.log('0. Exit');
    }

    /**
     * Display questions for a specific category
     */
    displayCategory(category) {
        switch(category) {
            case '1':
                this.displayPricingQuestions();
                break;
            case '2':
                this.displayAccountQuestions();
                break;
            case '3':
                this.displayPayoutQuestions();
                break;
            case '4':
                this.displayRulesQuestions();
                break;
            case '5':
                this.displayPlatformQuestions();
                break;
            case '6':
                this.displayBeginnerQuestions();
                break;
            case '7':
                this.displayComparisonQuestions();
                break;
            case '8':
                this.displayEdgeCases();
                break;
            case '9':
                this.displaySpecificScenarios();
                break;
            case '10':
                this.exportAllQuestions();
                break;
        }
    }

    displayPricingQuestions() {
        console.log('\n💰 PRICING QUESTIONS BY FIRM:');
        console.log('=' .repeat(40));
        
        Object.entries(this.scenarios.pricing).forEach(([firm, questions]) => {
            console.log(`\n🏢 ${firm.toUpperCase()}:`);
            questions.forEach((q, i) => {
                console.log(`   ${i + 1}. ${q}`);
            });
        });
    }

    displayAccountQuestions() {
        console.log('\n📊 ACCOUNT PLAN QUESTIONS BY FIRM:');
        console.log('=' .repeat(40));
        
        Object.entries(this.scenarios.accounts).forEach(([firm, questions]) => {
            console.log(`\n🏢 ${firm.toUpperCase()}:`);
            questions.forEach((q, i) => {
                console.log(`   ${i + 1}. ${q}`);
            });
        });
    }

    displayPayoutQuestions() {
        console.log('\n💸 PAYOUT/WITHDRAWAL QUESTIONS BY FIRM:');
        console.log('=' .repeat(40));
        
        Object.entries(this.scenarios.payouts).forEach(([firm, questions]) => {
            console.log(`\n🏢 ${firm.toUpperCase()}:`);
            questions.forEach((q, i) => {
                console.log(`   ${i + 1}. ${q}`);
            });
        });
    }

    displayRulesQuestions() {
        console.log('\n📋 TRADING RULES QUESTIONS BY FIRM:');
        console.log('=' .repeat(40));
        
        Object.entries(this.scenarios.rules).forEach(([firm, questions]) => {
            console.log(`\n🏢 ${firm.toUpperCase()}:`);
            questions.forEach((q, i) => {
                console.log(`   ${i + 1}. ${q}`);
            });
        });
    }

    displayPlatformQuestions() {
        console.log('\n🖥️ PLATFORM QUESTIONS:');
        console.log('=' .repeat(40));
        
        console.log('\n📌 General Platform Questions:');
        this.scenarios.platforms.general.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q}`);
        });
        
        console.log('\n📌 Specific Platform Questions:');
        this.scenarios.platforms.specific.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q}`);
        });
    }

    displayBeginnerQuestions() {
        console.log('\n🆕 BEGINNER QUESTIONS:');
        console.log('=' .repeat(40));
        
        this.scenarios.beginners.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q}`);
        });
    }

    displayComparisonQuestions() {
        console.log('\n🔍 COMPARISON QUESTIONS:');
        console.log('=' .repeat(40));
        
        this.scenarios.comparisons.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q}`);
        });
    }

    displayEdgeCases() {
        console.log('\n⚠️ EDGE CASES & SPECIAL TESTS:');
        console.log('=' .repeat(40));
        
        console.log('\n🔤 Typos & Misspellings:');
        this.scenarios.edge_cases.typos.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q}`);
        });
        
        console.log('\n❓ Incomplete Questions:');
        this.scenarios.edge_cases.incomplete.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q}`);
        });
        
        console.log('\n🏢 Multiple Firms:');
        this.scenarios.edge_cases.multiple_firms.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q}`);
        });
        
        console.log('\n💬 Slang & Informal:');
        this.scenarios.edge_cases.slang.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q}`);
        });
        
        console.log('\n🌐 Mixed Language:');
        this.scenarios.edge_cases.mixed_language.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q}`);
        });
    }

    displaySpecificScenarios() {
        console.log('\n🎯 SPECIFIC SCENARIOS:');
        console.log('=' .repeat(40));
        
        console.log('\n💰 Discount Questions:');
        this.scenarios.specific_scenarios.discounts.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q}`);
        });
        
        console.log('\n🔄 Reset & Refund:');
        this.scenarios.specific_scenarios.reset_refund.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q}`);
        });
        
        console.log('\n🌍 Country Restrictions:');
        this.scenarios.specific_scenarios.countries.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q}`);
        });
        
        console.log('\n🆔 KYC & Verification:');
        this.scenarios.specific_scenarios.verification.forEach((q, i) => {
            console.log(`   ${i + 1}. ${q}`);
        });
    }

    /**
     * Export all questions to a file for batch testing
     */
    async exportAllQuestions() {
        const allQuestions = [];
        
        // Collect all questions
        Object.values(this.scenarios).forEach(category => {
            if (typeof category === 'object' && !Array.isArray(category)) {
                Object.values(category).forEach(questions => {
                    if (Array.isArray(questions)) {
                        allQuestions.push(...questions);
                    }
                });
            } else if (Array.isArray(category)) {
                allQuestions.push(...category);
            }
        });
        
        // Remove duplicates
        const uniqueQuestions = [...new Set(allQuestions)];
        
        // Save to file
        const filename = `test-questions-${new Date().toISOString().slice(0, 10)}.txt`;
        const filepath = path.join(__dirname, filename);
        
        try {
            await fs.writeFile(filepath, uniqueQuestions.join('\n'));
            console.log(`\n✅ Exported ${uniqueQuestions.length} unique questions to: ${filepath}`);
        } catch (error) {
            console.error(`❌ Error exporting questions: ${error.message}`);
        }
    }

    /**
     * Interactive menu system
     */
    async run() {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const question = (query) => new Promise(resolve => readline.question(query, resolve));
        
        while (true) {
            this.displayMenu();
            const choice = await question('\nSelect category (0-10): ');
            
            if (choice === '0') {
                console.log('\n👋 Exiting manual test scenarios...');
                readline.close();
                break;
            }
            
            this.displayCategory(choice);
            
            await question('\nPress Enter to continue...');
        }
    }
}

// Export for use in other scripts
module.exports = ManualTestScenarios;

// Run if called directly
if (require.main === module) {
    const scenarios = new ManualTestScenarios();
    scenarios.run().catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
}