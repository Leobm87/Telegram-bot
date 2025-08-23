// =====================================================
// APEX-SPECIFIC FIXES FOR BOT v4.2+ 
// =====================================================
// Critical fixes for common Apex errors identified in Telegram

// APEX SAFETY NET THRESHOLDS (from informacion-apex.txt lines 115-123)
const APEX_SAFETY_NET = {
    '25000': 26600,
    '50000': 52600, 
    '75000': 77850,
    '100000': 103100,
    '150000': 155100,
    '250000': 256600,
    '300000': 307600,
    '100000_static': 102600
};

// APEX INITIAL BALANCES (from informacion-apex.txt lines 327-335)
const APEX_INITIAL_BALANCES = {
    '25000': 23500,
    '50000': 47500,
    '75000': 72250,
    '100000': 97000,
    '150000': 145000,
    '250000': 243500,
    '300000': 292500,
    '100000_static': 99375
};

// APEX EVALUATION PRICES (one-time payment)
const APEX_EVALUATION_PRICES = {
    '25000': 147,
    '50000': 167,
    '75000': 187,
    '100000': 207,
    '150000': 297,
    '250000': 517,
    '300000': 657,
    '100000_static': 137
};

// APEX PA ACTIVATION FEES (one-time payment)
const APEX_PA_FEES = {
    '25000': 130,
    '50000': 140,
    '75000': 180,
    '100000': 220,
    '150000': 260,
    '250000': 300,
    '300000': 340,
    '100000_static': 220
};

// APEX MAX WITHDRAWAL LIMITS (first 5 withdrawals)
const APEX_MAX_WITHDRAWAL_LIMITS = {
    '25000': 1500,
    '50000': 2000,
    '75000': 2250,
    '100000': 2500,
    '150000': 2750,
    '250000': 3000,
    '300000': 3500,
    '100000_static': 1000
};

/**
 * Enhanced response generator specifically for Apex questions
 * Fixes the common errors identified:
 * 1. Price confusion (evaluation vs PA)
 * 2. Safety Net thresholds
 * 3. Initial balances
 * 4. Evaluation vs PA rules separation
 */
function enhanceApexResponse(question, originalResponse, firmSlug) {
    // Only apply to Apex-related questions
    if (firmSlug !== 'apex' && !question.toLowerCase().includes('apex')) {
        return originalResponse;
    }

    const lowerQuestion = question.toLowerCase();
    
    // 🔥 CRITICAL FIX: REORDERED CONDITIONS - Most specific FIRST
    
    // FIX 2b: Withdrawal threshold questions - use specific Safety Net values (MOVED TO TOP - MOST SPECIFIC)
    if (lowerQuestion.includes('umbral') || lowerQuestion.includes('threshold') || lowerQuestion.includes('safety')) {
        const accountSize = extractAccountSize(lowerQuestion);
        return formatApexWithdrawalResponse(accountSize);
    }

    // FIX 2: Withdrawal method questions - show withdrawal methods and policies
    if (lowerQuestion.includes('retir') || lowerQuestion.includes('withdrawal') || lowerQuestion.includes('cobr')) {
        return formatApexWithdrawalMethodsResponse();
    }

    // FIX 0: Payment method questions - only credit/debit cards (exclude withdrawal questions)
    if ((lowerQuestion.includes('pagar') || lowerQuestion.includes('paypal') || lowerQuestion.includes('metodo') || lowerQuestion.includes('payment')) && 
        !lowerQuestion.includes('retir') && !lowerQuestion.includes('withdrawal') && !lowerQuestion.includes('cobr')) {
        return formatApexPaymentResponse();
    }

    // FIX 1: Plans/Pricing questions - MOVED TO BOTTOM as it's most generic (contains "cuenta" which matches many questions)
    if (lowerQuestion.includes('planes') || lowerQuestion.includes('precio') || 
        (lowerQuestion.includes('cuenta') && !lowerQuestion.includes('safety') && !lowerQuestion.includes('umbral') && !lowerQuestion.includes('retir'))) {
        return formatApexPlansResponse();
    }

    // FIX 3: PA rules questions - separate from evaluation rules
    if (lowerQuestion.includes('reglas') && (lowerQuestion.includes('pa') || lowerQuestion.includes('cuenta real'))) {
        return formatApexPARulesResponse();
    }

    // FIX 4: Evaluation rules questions
    if (lowerQuestion.includes('reglas') && lowerQuestion.includes('evaluacion')) {
        return formatApexEvaluationRulesResponse();
    }

    // FIX 5: Activation fees questions
    if (lowerQuestion.includes('activacion') || lowerQuestion.includes('cuota')) {
        return formatApexActivationResponse();
    }

    // Return original response if no specific fixes apply
    return originalResponse;
}

function extractAccountSize(question) {
    const sizeMatches = question.match(/(\d+)k/) || question.match(/(\d+)\.?000/);
    if (sizeMatches) {
        const size = question.includes('k') ? 
            parseInt(sizeMatches[1]) * 1000 : 
            parseInt(sizeMatches[1]) * 1000;
        return size.toString();
    }
    return '100000'; // Default to 100K
}

function formatApexPaymentResponse() {
    return `🟠 <b>Apex - Métodos de Pago</b>

<b>💳 MÉTODO ACEPTADO:</b>
• <b>Solo tarjeta de crédito/débito</b>

<b>❌ NO ACEPTAN:</b>
• Transferencias bancarias
• PayPal 
• Wire transfers
• Otros métodos de pago

<b>💰 Precios:</b>
• Evaluación: <code>$147-$657</code> (pago único)
• Cuenta PA: <code>$130-$340</code> único + <code>$85/mes</code> opcional

<b>🔒 Proceso:</b>
• Pago directo en plataforma Apex
• Activación inmediata tras pago
• Sin comisiones adicionales

¿Necesitas info de algún tamaño específico? 🚀`;
}

function formatApexPlansResponse() {
    return `🟠 <b>Apex Trader Funding</b>

<b>Planes de Cuenta en Apex Trader Funding</b>

<b>📊 EVALUACIÓN (Pago Único):</b>
• <code>$25K</code> - <code>$147</code> | Target: <code>$1,500</code>
• <code>$50K</code> - <code>$167</code> | Target: <code>$3,000</code> 
• <code>$100K</code> - <code>$207</code> | Target: <code>$6,000</code>
• <code>$150K</code> - <code>$297</code> | Target: <code>$9,000</code>
• <code>$250K</code> - <code>$517</code> | Target: <code>$15,000</code>
• <code>$300K</code> - <code>$657</code> | Target: <code>$20,000</code>

<b>🎯 CUENTA PA (Real):</b>
• Activación: <code>$130-$340</code> (pago único)
• Alternativa: <code>$85/mes</code> (todas las cuentas)
• Saldo inicial: 25K→<code>$23,500</code>, 100K→<code>$97,000</code>

<b>💳 Método de Pago:</b>
• Solo tarjeta de crédito/débito

<b>⚡ Características:</b>
• Solo 1 evaluación (no hay fase 2)
• Trailing drawdown en todas las cuentas
• Máximo 20 cuentas por persona

¿Algo más específico? 🚀`;
}

function formatApexWithdrawalResponse(accountSize) {
    const safetyNet = APEX_SAFETY_NET[accountSize] || APEX_SAFETY_NET['100000'];
    const maxWithdrawal = APEX_MAX_WITHDRAWAL_LIMITS[accountSize] || APEX_MAX_WITHDRAWAL_LIMITS['100000'];
    const initialBalance = APEX_INITIAL_BALANCES[accountSize] || APEX_INITIAL_BALANCES['100000'];

    return `🟠 <b>Apex Trader Funding</b>

<b>Condiciones de Retiro - Cuenta ${parseInt(accountSize)/1000}K</b>

<b>🎯 Safety Net (Umbral Mínimo):</b>
• <code>$${safetyNet.toLocaleString()}</code> (para operar con contratos completos)

<b>📊 Requisitos para Retirar:</b>
• Mínimo 8 días de trading activo tras activar PA
• Al menos 5 días con profit de <code>$50+</code> cada uno
• Consistency Rule: día mayor ≤30% del total acumulado

<b>💰 Límites de Retiro:</b>
• Mínimo: <code>$500</code> por retiro
• Máximo (primeros 5): <code>$${maxWithdrawal.toLocaleString()}</code>
• A partir del 6º retiro: sin límite máximo

<b>⚡ Métodos:</b>
• WISE (USA) | PLANE (Internacional)

<i>Nota: Saldo inicial real es <code>$${initialBalance.toLocaleString()}</code></i>

¿Algo más específico? 🚀`;
}

function formatApexPARulesResponse() {
    return `🟠 <b>Apex Trader Funding</b>

<b>Reglas en la Fase PA (Cuenta Real)</b>

<b>🎯 Gestión de Riesgo:</b>
• <b>Consistency Rule:</b> Solo para retiros, NO eliminatoria
• <b>30% PnL Negativo:</b> Pérdidas abiertas ≤30% saldo inicial día
• <b>Ratio Riesgo/Beneficio:</b> Máximo 5:1

<b>⚡ Trading:</b>
• <b>Horarios:</b> 6:00 PM ET a 4:59 PM ET
• <b>One-Direction:</b> Solo long o short durante noticias
• <b>Overnight:</b> NO permitido - cerrar antes de sesión

<b>🔧 Automatización:</b>
• Semi-automatizada: Permitida con supervisión
• Totalmente automatizada: Prohibida

<b>📊 Escalado Contratos:</b>
• Solo 50% hasta alcanzar Safety Net
• 100% después de superar Safety Net

¿Algo más específico? 🚀`;
}

function formatApexEvaluationRulesResponse() {
    return `🟠 <b>Apex Trader Funding</b>

<b>Reglas en la Fase de Evaluación</b>

<b>🎯 Estructura Simple:</b>
• <b>Solo 1 evaluación</b> - No hay "fase 2"
• <b>Sin límite de tiempo</b> para completar
• <b>Mínimo:</b> 1 día de trading (no consecutivo)

<b>⚡ Requisitos:</b>
• Alcanzar profit target de tu cuenta
• No violar trailing drawdown
• Sin límite de pérdidas diarias

<b>🔧 Trading Durante Evaluación:</b>
• News trading: Permitido (regla one-direction)
• Stop loss: Recomendado pero no obligatorio
• Horario: 6:00 PM ET a 4:59 PM ET
• Microfuturos: Permitidos (MES, MNQ, etc.)

<b>💡 Flexibilidad:</b>
• Puedes pausar sin perder progreso
• Reset por <code>$80</code> si necesario

¿Algo más específico? 🚀`;
}

function formatApexActivationResponse() {
    return `🟠 <b>Apex Trader Funding</b>

<b>Cuotas de Activación PA</b>

<b>💰 Opción 1 - Pago Único:</b>
• 25K: <code>$130</code>
• 50K: <code>$140</code>
• 75K: <code>$180</code>
• 100K: <code>$220</code>
• 150K: <code>$260</code>
• 250K: <code>$300</code>
• 300K: <code>$340</code>

<b>📅 Opción 2 - Suscripción:</b>
• <code>$85/mes</code> para todas las cuentas

<b>⚡ Importante:</b>
• Pagas DESPUÉS de aprobar la evaluación
• Mantener activa para conservar acceso
• Alternativa mensual disponible para todos

¿Algo más específico? 🚀`;
}

function formatApexWithdrawalMethodsResponse() {
    return `🟠 <b>Apex - Métodos de Retiro</b>

<b>💰 MÉTODOS DISPONIBLES:</b>
• <b>WISE</b> (para USA)
• <b>PLANE</b> (internacional)

<b>📋 REQUISITOS PARA RETIRO:</b>
• Mínimo 8 días de trading activo
• Al menos 5 días con profit de <code>$50+</code>
• Alcanzar Safety Net (umbral mínimo)
• Cumplir regla de consistencia 30%

<b>💵 LÍMITES DE RETIRO:</b>
• Mínimo: <code>$500</code> (todos los tamaños)
• Máximo primeros 5 retiros: <code>$1,500-$3,500</code>
• A partir del 6º retiro: sin límite máximo

<b>📊 PROFIT SPLIT:</b>
• Primeros <code>$25,000</code>: 100% para ti
• Después: 90% para ti, 10% Apex

¿Necesitas info sobre Safety Net específico? 🚀`;
}

module.exports = {
    enhanceApexResponse,
    APEX_SAFETY_NET,
    APEX_INITIAL_BALANCES,
    APEX_EVALUATION_PRICES,
    APEX_PA_FEES,
    APEX_MAX_WITHDRAWAL_LIMITS
};