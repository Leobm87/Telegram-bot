/**
 * DIAGNÓSTICO BUG BULENOX PRICING
 * Problema: Bot dice "pago único" cuando debería decir "mensual"
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function diagnoseBulenoxBug() {
    console.log('🔍 TESTING BULENOX PRICING BUG - DIAGNÓSTICO DETALLADO');
    console.log('=====================================================');
    
    console.log('\n📊 Step 1: Verificar datos en BD...');
    
    const { data: plans } = await supabase
        .from('account_plans')
        .select('display_name, account_size, price_monthly, phase, drawdown_type')
        .eq('firm_id', '7567df00-7cf8-4afc-990f-6f8da04e36a4')
        .limit(5);
        
    console.log('✅ BD PRICING DATA:');
    plans.forEach(plan => {
        console.log(`   ${plan.display_name} - $${plan.price_monthly} MONTHLY, ${plan.drawdown_type}`);
    });
    
    console.log('\n🤖 Step 2: Generate AI response with correct context...');
    
    const contextData = plans.map(p => 
        `$${p.account_size} (${p.phase}): $${p.price_monthly}/month, ${p.drawdown_type} drawdown`
    ).join(', ');
    
    console.log('📄 CONTEXT SENT TO AI:', contextData.substring(0, 200) + '...');
    
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        messages: [
            {
                role: 'system',
                content: `Eres experto en Bulenox. IMPORTANTE: 
                - Los precios son MENSUALES ($X/mes), nunca "pago único"
                - Bulenox tiene Opción 1 (Trailing Drawdown) y Opción 2 (EOD Drawdown)  
                - Responde en español con formato correcto`
            },
            {
                role: 'user',
                content: `que cuentas hay en bulenox? Datos: ${contextData}`
            }
        ]
    });
    
    const aiResponse = response.choices[0].message.content;
    console.log('\n💬 AI RESPONSE LENGTH:', aiResponse.length);
    console.log('💬 AI RESPONSE:');
    console.log(aiResponse);
    
    console.log('\n🔍 Step 3: Analyze response issues...');
    
    const issues = {
        'Says pago único': aiResponse.toLowerCase().includes('pago único') || aiResponse.toLowerCase().includes('único'),
        'Says monthly/mensual': aiResponse.toLowerCase().includes('mensual') || aiResponse.toLowerCase().includes('/mes') || aiResponse.toLowerCase().includes('monthly'),
        'Mentions Opcion 1/2': aiResponse.toLowerCase().includes('opción 1') || aiResponse.toLowerCase().includes('opción 2'),
        'Shows correct prices': aiResponse.includes('145') && aiResponse.includes('175'),
        'Shows drawdown types': aiResponse.toLowerCase().includes('trailing') || aiResponse.toLowerCase().includes('eod')
    };
    
    console.log('\n📊 ISSUE ANALYSIS:');
    for (const [issue, found] of Object.entries(issues)) {
        console.log(`${found ? '✅' : '❌'} ${issue}: ${found}`);
    }
    
    const hasIssues = issues['Says pago único'] || !issues['Says monthly/mensual'] || !issues['Mentions Opcion 1/2'];
    
    if (hasIssues) {
        console.log('\n🚨 PROBLEM CONFIRMED: AI is generating incorrect pricing format');
        console.log('📋 ROOT CAUSE: AI not interpreting price_monthly field correctly');
        console.log('🔧 SOLUTION NEEDED: Create bulenox-specific-fixes.js');
        
        // Test what production bot would generate
        console.log('\n🎯 Step 4: Test production bot response...');
        
        const MultiFirmBot = require('./multiFirmProductionBot');
        const bot = new MultiFirmBot('test');
        
        try {
            const productionResponse = await bot.processQuestion('que cuentas hay en bulenox?', 12345);
            console.log('\n🤖 PRODUCTION BOT RESPONSE:');
            console.log(productionResponse);
            
            const prodIssues = {
                'Prod says pago único': productionResponse.toLowerCase().includes('pago único'),
                'Prod missing options': !productionResponse.toLowerCase().includes('opción'),
                'Prod correct pricing': productionResponse.includes('145') && productionResponse.includes('/mes')
            };
            
            console.log('\n📊 PRODUCTION ANALYSIS:');
            for (const [issue, found] of Object.entries(prodIssues)) {
                console.log(`${found ? '❌' : '✅'} ${issue}: ${found}`);
            }
            
        } catch (error) {
            console.log('❌ Error testing production bot:', error.message);
        }
        
    } else {
        console.log('\n✅ AI response appears correct with enhanced context');
    }
    
    return !hasIssues;
}

diagnoseBulenoxBug()
    .then(success => {
        console.log(`\n🏁 DIAGNOSIS RESULT: ${success ? '✅ ISSUE RESOLVED WITH BETTER PROMPTING' : '❌ NEEDS BULENOX-SPECIFIC FIXES'}`);
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ DIAGNOSIS ERROR:', error);
        process.exit(1);
    });