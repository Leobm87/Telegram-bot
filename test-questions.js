/**
 * Comprehensive test questions for all 7 firms
 * Organized by category and language
 */

const testQuestions = {
  // Pricing questions
  pricing: {
    spanish: [
      "cuanto cuesta {firm}?",
      "precios de {firm}",
      "cual es el costo de una cuenta en {firm}?",
      "que precio tiene {firm}?",
      "cuanto vale {firm}?",
      "tarifas de {firm}",
      "costo de evaluacion {firm}",
      "precio cuenta fondeada {firm}"
    ],
    english: [
      "what are {firm} prices?",
      "{firm} pricing",
      "how much does {firm} cost?",
      "{firm} evaluation fee",
      "cost of {firm} account",
      "{firm} funded account price",
      "{firm} fees",
      "price for {firm}"
    ],
    typos: [
      "cuato cuesta {firm}?",
      "presios de {firm}",
      "{firm} prcing",
      "costo d {firm}"
    ]
  },

  // Account plans
  accounts: {
    spanish: [
      "que planes tiene {firm}?",
      "tipos de cuenta {firm}",
      "cuentas disponibles en {firm}",
      "opciones de cuenta {firm}",
      "tamaños de cuenta {firm}",
      "cuenta de 10k en {firm}",
      "cuenta de 100k en {firm}",
      "fases de evaluacion {firm}"
    ],
    english: [
      "{firm} account sizes",
      "what accounts does {firm} offer?",
      "{firm} evaluation phases",
      "{firm} account types",
      "{firm} funding options",
      "10k account at {firm}",
      "100k account {firm}",
      "{firm} challenge phases"
    ]
  },

  // Payout policies
  payouts: {
    spanish: [
      "como paga {firm}?",
      "cuando paga {firm}?",
      "metodos de retiro {firm}",
      "profit split {firm}",
      "porcentaje de ganancia {firm}",
      "frecuencia de pago {firm}",
      "minimo de retiro {firm}",
      "comisiones de retiro {firm}"
    ],
    english: [
      "{firm} payout methods",
      "{firm} profit split",
      "when does {firm} pay?",
      "{firm} withdrawal methods",
      "minimum payout {firm}",
      "{firm} payout frequency",
      "{firm} withdrawal fees",
      "how to withdraw from {firm}"
    ]
  },

  // Trading rules
  rules: {
    spanish: [
      "reglas de {firm}",
      "drawdown {firm}",
      "perdida maxima {firm}",
      "reglas de trading {firm}",
      "horarios de {firm}",
      "noticias en {firm}",
      "scalping en {firm}",
      "swing trading {firm}"
    ],
    english: [
      "{firm} trading rules",
      "{firm} drawdown limits",
      "{firm} news trading",
      "{firm} trading hours",
      "max loss {firm}",
      "{firm} scalping allowed",
      "{firm} holding overnight",
      "{firm} weekend holding"
    ]
  },

  // Platforms
  platforms: {
    spanish: [
      "plataformas de {firm}",
      "{firm} mt4",
      "{firm} mt5",
      "ninja trader {firm}",
      "tradingview {firm}",
      "que plataforma usa {firm}?",
      "plataformas disponibles {firm}",
      "ctrader {firm}"
    ],
    english: [
      "{firm} trading platforms",
      "does {firm} have mt4?",
      "{firm} mt5 available?",
      "{firm} ninjatrader",
      "{firm} platform options",
      "what platforms does {firm} support?",
      "{firm} ctrader",
      "{firm} tradingview"
    ]
  },

  // Edge cases
  edge_cases: {
    ambiguous: [
      "{firm}",
      "info {firm}",
      "tell me about {firm}",
      "{firm} good?",
      "{firm} review",
      "opiniones {firm}",
      "{firm} vale la pena?",
      "is {firm} worth it?"
    ],
    competitors: [
      "{firm} vs ftmo",
      "{firm} o mff?",
      "mejor {firm} o apex?",
      "diferencia entre {firm} y bulenox",
      "{firm} compared to funded next",
      "why {firm} over ftmo?",
      "{firm} mejor que takeprofit?"
    ],
    complex: [
      "compare precios y payout de {firm} con otras firms",
      "cual es la mejor cuenta de {firm} para scalping con poco capital?",
      "puedo hacer swing trading en {firm} durante noticias?",
      "what's the best {firm} account for a beginner with $500 budget?",
      "can I trade crypto on {firm} during weekends with a 10k account?"
    ],
    minimal: [
      "precio",
      "payout",
      "rules",
      "mt4",
      "costo",
      "reglas",
      "pago"
    ]
  },

  // Common misspellings and variations
  misspellings: {
    apex: ["apx", "appex", "apeks", "apeex"],
    bulenox: ["bulnox", "buelnox", "bulenx", "bullenox"],
    takeprofit: ["takprofit", "take profit", "takeprofit", "takeproffit"],
    myfundedfutures: ["mff", "my funded futures", "myfunded", "funded futures"],
    alpha: ["alfa", "alpha futures", "alphafutures", "alfa futures"],
    tradeify: ["tradify", "tradefy", "tradeyfi", "tradeify"],
    vision: ["vizion", "vision trade", "visiontrade", "vission"]
  }
};

// Function to generate all test questions for a specific firm
function generateFirmTests(firm) {
  const allTests = [];
  
  // Process each category
  Object.entries(testQuestions).forEach(([category, questions]) => {
    if (category === 'misspellings') return; // Handle separately
    
    Object.entries(questions).forEach(([subcategory, questionList]) => {
      questionList.forEach(template => {
        // Replace {firm} placeholder
        const question = template.replace(/{firm}/g, firm);
        allTests.push({
          question,
          category,
          subcategory,
          firm,
          expectedFirm: firm
        });
      });
    });
  });

  // Add misspelling tests
  if (testQuestions.misspellings[firm]) {
    testQuestions.misspellings[firm].forEach(misspelling => {
      Object.entries(testQuestions.pricing).forEach(([lang, questions]) => {
        if (questions.length > 0) {
          const question = questions[0].replace(/{firm}/g, misspelling);
          allTests.push({
            question,
            category: 'misspellings',
            subcategory: lang,
            firm,
            expectedFirm: firm,
            misspelling
          });
        }
      });
    });
  }

  return allTests;
}

// Generate comprehensive test suite for all firms
function generateCompleteTestSuite() {
  const firms = ['apex', 'bulenox', 'takeprofit', 'myfundedfutures', 'alpha', 'tradeify', 'vision'];
  const completeTestSuite = [];

  firms.forEach(firm => {
    const firmTests = generateFirmTests(firm);
    completeTestSuite.push(...firmTests);
  });

  // Add generic edge cases
  testQuestions.edge_cases.minimal.forEach(question => {
    completeTestSuite.push({
      question,
      category: 'edge_cases',
      subcategory: 'minimal',
      firm: 'unknown',
      expectedFirm: 'context_dependent'
    });
  });

  return completeTestSuite;
}

// Performance test questions (rapid fire)
const performanceTests = [
  "apex precio",
  "bulenox payout",
  "takeprofit rules",
  "mff platforms",
  "alpha drawdown",
  "tradeify fees",
  "vision mt4"
];

// Validation rules for quality assurance
const validationRules = {
  formatting: {
    monetary: /\$[\d,]+(\.\d{2})?/,
    percentage: /\d+(\.\d+)?%/,
    noIncorrectPercentage: /\d{3,}%/, // Flag 150% instead of $150
    properHTML: /<[^>]+>/,
    properMarkdown: /[*_`#\[\]]/
  },
  
  forbidden_phrases: [
    "info not available",
    "information not available",
    "i don't have",
    "unable to find",
    "no tengo información",
    "no puedo encontrar"
  ],

  required_elements: {
    pricing: ['$', 'price', 'cost', 'precio', 'costo'],
    payout: ['%', 'profit', 'split', 'payout', 'withdrawal'],
    rules: ['drawdown', 'loss', 'limit', 'rule', 'regla'],
    platforms: ['mt4', 'mt5', 'ninjatrader', 'tradingview', 'platform']
  }
};

module.exports = {
  testQuestions,
  generateFirmTests,
  generateCompleteTestSuite,
  performanceTests,
  validationRules
};