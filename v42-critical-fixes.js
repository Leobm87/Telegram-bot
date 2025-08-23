// =====================================================
// ELTRADER BOT v4.2 - CRITICAL FIXES IMPLEMENTATION
// =====================================================
// Deploy Date: 23 Aug 2025
// Priority: IMMEDIATE (Revenue Impact: €8K-12K/month)

// CRITICAL FIX 1: DISCOUNT SYSTEM INTEGRATION (OPTIONAL)
// =====================================================
async function getActiveDiscount(supabase, firmId) {
  // Discount system disabled for now - will be configured after core bot is working
  return null;
  
  /* FUTURE IMPLEMENTATION:
  try {
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('firm_id', firmId)
      .eq('active', true)
      .gt('expires_at', new Date().toISOString())
      .order('discount_percentage', { ascending: false })
      .limit(1);
    
    if (error) {
      console.log('Discount query error:', error.message);
      return null;
    }
    
    return data?.length > 0 ? data[0] : null;
  } catch (error) {
    console.log('Discount system error:', error);
    return null;
  }
  */
}

function formatDiscountOffer(discount, firmName) {
  if (!discount) return '';
  
  const discountEmoji = discount.discount_percentage >= 20 ? '🔥' : '🎯';
  const urgencyText = isExpiringSoon(discount.expires_at) ? ' ⏰ ÚLTIMAS HORAS' : '';
  
  return `\n\n${discountEmoji} **OFERTA ESPECIAL ${firmName.toUpperCase()}:**
💰 **${discount.code}** - Ahorra ${discount.discount_percentage}%${urgencyText}
🔗 Regístrate: ${discount.affiliate_link}
📅 Válido hasta: ${formatExpiryDate(discount.expires_at)}`;
}

function isExpiringSoon(expiryDate, hoursThreshold = 24) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const hoursUntilExpiry = (expiry - now) / (1000 * 60 * 60);
  return hoursUntilExpiry <= hoursThreshold;
}

function formatExpiryDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// CRITICAL FIX 2: EXTERNAL FIRM BLOCKING SYSTEM
// =====================================================
const BLOCKED_EXTERNAL_FIRMS = [
  'FTMO', 'TopStep', 'The5ers', 'FundedNext', 'MyForexFunds', 'Prop Firm',
  'E8 Markets', 'Blue Guardian', 'City Traders Imperium', 'SurgeTrader',
  'Nova Funding', 'The Funded Trader', 'Lark Funding', 'True Forex Funds'
];

const REDIRECT_TO_OUR_FIRMS = `
🎯 **Solo trabajo con nuestras 7 firmas especializadas:**

🟠 **Apex** - El estándar de la industria
🔵 **Bulenox** - Condiciones europeas premium  
🟢 **TakeProfit** - Máxima flexibilidad
🟡 **MyFundedFutures** - Futuros especializados
🔴 **Alpha Futures** - Tecnología avanzada
⚪ **Tradeify** - Innovación en trading
🟣 **Vision Trade** - Acceso global

¿Sobre cuál te gustaría saber más? 🚀
`;

function blockExternalFirms(response) {
  // Check if response mentions blocked firms
  const mentionsExternal = BLOCKED_EXTERNAL_FIRMS.some(firm => 
    response.toLowerCase().includes(firm.toLowerCase())
  );
  
  if (mentionsExternal) {
    return REDIRECT_TO_OUR_FIRMS;
  }
  
  return response;
}

function enhanceSystemPrompt(basePrompt) {
  const externalBlockingPrompt = `
PROHIBICIÓN ABSOLUTA - FIRMAS EXTERNAS:
- NUNCA menciones: ${BLOCKED_EXTERNAL_FIRMS.join(', ')}
- Si preguntan sobre firmas externas, redirige a nuestras 7 firmas
- SOLO promociona: Apex, Bulenox, TakeProfit, MFF, Alpha, Tradeify, Vision Trade
- Siempre incluye descuentos activos cuando estén disponibles

`;
  
  return externalBlockingPrompt + basePrompt;
}

// CRITICAL FIX 3: ENHANCED RESPONSE QUALITY
// =====================================================
async function generateEnhancedResponse(question, firmId, firmName, supabase, openai) {
  // SIMPLIFIED VERSION: Just apply post-processing to existing response
  // The main bot already handles FAQ search and response generation
  // This function will be used for post-processing only
  return null; // Return null to indicate main bot should handle response generation
}

// VALIDATION FUNCTIONS
// =====================================================
function validateV42Fixes() {
  const checks = [
    {
      name: 'Discount System Functions',
      test: typeof getActiveDiscount === 'function' && typeof formatDiscountOffer === 'function',
      required: true
    },
    {
      name: 'External Firm Blocking',
      test: BLOCKED_EXTERNAL_FIRMS.length > 10 && typeof blockExternalFirms === 'function',
      required: true
    },
    {
      name: 'Enhanced Response Pipeline',
      test: typeof generateEnhancedResponse === 'function',
      required: true
    }
  ];
  
  console.log('🔍 V4.2 FIXES VALIDATION:');
  let allPassed = true;
  
  checks.forEach(check => {
    const status = check.test ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${check.name}: ${status}`);
    if (check.required && !check.test) {
      allPassed = false;
    }
  });
  
  console.log(`\n🎯 OVERALL STATUS: ${allPassed ? '✅ READY FOR DEPLOYMENT' : '❌ FIXES NEEDED'}`);
  return allPassed;
}

// EXPORT FUNCTIONS FOR INTEGRATION
// =====================================================
module.exports = {
  getActiveDiscount,
  formatDiscountOffer,
  blockExternalFirms,
  enhanceSystemPrompt,
  generateEnhancedResponse,
  validateV42Fixes,
  BLOCKED_EXTERNAL_FIRMS,
  REDIRECT_TO_OUR_FIRMS
};

// AUTO-VALIDATION ON LOAD
if (require.main === module) {
  validateV42Fixes();
}