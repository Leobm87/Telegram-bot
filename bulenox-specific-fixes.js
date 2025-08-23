/**
 * BULENOX SPECIFIC FIXES
 * 
 * Corrige problemas específicos en respuestas de Bulenox:
 * 1. Pricing "pago único" → "mensual" 
 * 2. Missing "Opción 1" y "Opción 2"
 * 3. Información incompleta sobre drawdown types
 */

function enhanceBulenoxResponse(question, originalResponse, firmSlug) {
    if (firmSlug !== 'bulenox') {
        return originalResponse;
    }

    const lowerQuestion = question.toLowerCase();
    
    // 🎯 BULENOX CUENTA PLANS CORRECTION
    if (lowerQuestion.includes('cuenta') || lowerQuestion.includes('plan') || lowerQuestion.includes('precio')) {
        return formatBulenoxPlansResponse();
    }
    
    // 🎯 BULENOX OPTIONS EXPLANATION  
    if (lowerQuestion.includes('opcion') || lowerQuestion.includes('option') || lowerQuestion.includes('diferencia')) {
        return formatBulenoxOptionsResponse();
    }
    
    // 🎯 BULENOX RESET POLICY
    if (lowerQuestion.includes('reset') || lowerQuestion.includes('renovar')) {
        return formatBulenoxResetResponse();
    }
    
    // 🎯 BULENOX DRAWDOWN TYPES
    if (lowerQuestion.includes('drawdown') || lowerQuestion.includes('trailing') || lowerQuestion.includes('eod')) {
        return formatBulenoxDrawdownResponse();
    }

    // Return enhanced original if no specific fixes apply
    return originalResponse;
}

function formatBulenoxPlansResponse() {
    return `🔵 <b>Bulenox</b>

<b>Cuentas disponibles (MENSUAL):</b>

<b>📋 OPCIÓN 1: Trailing Drawdown</b>
• <b>25K Account:</b> <code>$145/mes</code> - Drawdown: $1,500 (trailing)
• <b>50K Account:</b> <code>$175/mes</code> - Drawdown: $2,500 (trailing)  
• <b>100K Account:</b> <code>$215/mes</code> - Drawdown: $3,000 (trailing)
• <b>150K Account:</b> <code>$325/mes</code> - Drawdown: $4,500 (trailing)
• <b>250K Account:</b> <code>$535/mes</code> - Drawdown: $5,500 (trailing)

<b>📋 OPCIÓN 2: EOD Drawdown (con límite pérdida diaria)</b>  
• <b>25K Account:</b> <code>$145/mes</code> - Daily Loss: $500
• <b>50K Account:</b> <code>$175/mes</code> - Daily Loss: $1,100
• <b>100K Account:</b> <code>$215/mes</code> - Daily Loss: $2,200  
• <b>150K Account:</b> <code>$325/mes</code> - Daily Loss: $3,300
• <b>250K Account:</b> <code>$535/mes</code> - Daily Loss: $4,500

<b>⚡ Cuotas de Activación (pago único tras evaluación):</b>
25K: $143 | 50K: $148 | 100K: $248 | 150K: $498 | 250K: $898

<b>🔄 Reset:</b> GRATIS en renovación mensual o $78 pago inmediato

<b>📊 Reglas:</b>
• Evaluación: 1 día mínimo, sin tiempo límite
• Multicuentas: Máximo 11, activar 3 a la vez
• Consistency rule: 40% para retiros

¿Algo más específico? 🚀`;
}

function formatBulenoxOptionsResponse() {
    return `🔵 <b>Bulenox - Diferencias entre Opciones</b>

<b>🎯 OPCIÓN 1: Trailing Drawdown</b>
• Drawdown se actualiza con posiciones <b>abiertas</b>
• <b>NO</b> hay límite de pérdida diaria
• Escalado de contratos: <b>NO aplicable</b>
• <b>Más flexible</b> para swing trading dentro del día

<b>🎯 OPCIÓN 2: EOD Drawdown</b>  
• Drawdown se actualiza al <b>final del día</b>
• <b>SÍ</b> hay límite de pérdida diaria
• Escalado de contratos: <b>SÍ aplicable</b>
• <b>Más estricto</b> con límites diarios

<b>💡 Recomendación:</b>
• <b>Opción 1</b> para traders que prefieren flexibilidad
• <b>Opción 2</b> para traders disciplinados con límites estrictos

<b>⚠️ Importante:</b> Swing trading/overnight <b>NO PERMITIDO</b> en ambas opciones

¿Algo más específico? 🚀`;
}

function formatBulenoxResetResponse() {
    return `🔵 <b>Bulenox - Política de Reset</b>

<b>🔄 Opciones de Reset:</b>

<b>1. Reset GRATIS:</b>
• Esperar renovación de suscripción mensual
• Mantiene fecha de expiración
• Conserva días de trading si violas antes del billing date

<b>2. Reset INMEDIATO:</b> 
• Pago de <code>$78</code> (todos los tamaños)
• Proceso: Login → Profile → "Reset Account"
• Borra ganancias/pérdidas previas  
• NO conserva días de trading previos

<b>📧 Notificación:</b> Email inmediato tras reset
<b>⏰ Timing:</b> Reset gratis disponible cada mes

<b>💡 Tip:</b> Si violas regla antes del billing date, el reset gratis SÍ conserva días completados

¿Algo más específico? 🚀`;
}

function formatBulenoxDrawdownResponse() {
    return `🔵 <b>Bulenox - Tipos de Drawdown</b>

<b>📊 TRAILING DRAWDOWN (Opción 1):</b>
• Se actualiza con posiciones <b>abiertas</b>
• Más dinámico y flexible
• Riesgo: Puede cambiar durante trades activos

<b>📊 EOD DRAWDOWN (Opción 2):</b>
• Se actualiza al <b>final del día</b>
• Más predecible
• Incluye límites de pérdida diaria adicionales

<b>📋 Límites por Cuenta:</b>
• 25K: $1,500 drawdown | $500 daily (EOD)
• 50K: $2,500 drawdown | $1,100 daily (EOD)  
• 100K: $3,000 drawdown | $2,200 daily (EOD)
• 150K: $4,500 drawdown | $3,300 daily (EOD)
• 250K: $5,500 drawdown | $4,500 daily (EOD)

<b>⚠️ Importante:</b> Todas las posiciones deben cerrarse antes del cierre de sesión

¿Algo más específico? 🚀`;
}

module.exports = {
    enhanceBulenoxResponse
};