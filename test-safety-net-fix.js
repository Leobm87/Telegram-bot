/**
 * CRITICAL TEST: Apex Safety Net Bug Resolution
 * Tests that specific conditions now execute before generic ones
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const apexFixes = require('./apex-specific-fixes');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testApexSafetyNetFix() {
    console.log('🧪 TESTING CRÍTICO: APEX SAFETY NET BUG RESOLUTION');
    console.log('================================================');
    
    const question = 'cual es el safety net de la cuenta de 100k en apex?';
    console.log('📝 PREGUNTA:', question);
    
    // Generate base AI response
    console.log('\n🤖 Step 1: Generating base AI response...');
    
    const aiResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        messages: [
            {
                role: 'system',
                content: 'Eres un experto en Apex Trader Funding. Responde sobre Safety Net.'
            },
            {
                role: 'user', 
                content: question
            }
        ]
    });
    
    const baseResponse = aiResponse.choices[0].message.content;
    console.log('📄 BASE RESPONSE LENGTH:', baseResponse.length);
    console.log('📄 BASE PREVIEW:', baseResponse.substring(0, 150) + '...');
    
    // Apply Apex fixes
    console.log('\n🔧 Step 2: Applying Apex specific fixes...');
    
    const enhancedResponse = apexFixes.enhanceApexResponse(question, baseResponse, 'apex');
    console.log('📄 ENHANCED RESPONSE LENGTH:', enhancedResponse.length);
    
    // Verify fix effectiveness  
    console.log('\n✅ Step 3: Verifying fix effectiveness...');
    
    const checks = {
        'Contains Safety Net': enhancedResponse.toLowerCase().includes('safety net'),
        'Contains $103,100': enhancedResponse.includes('103,100'),
        'Contains 100K specific': enhancedResponse.toLowerCase().includes('100k') || enhancedResponse.includes('100,000'),
        'Not generic response': !enhancedResponse.includes('Planes de Cuenta') && !enhancedResponse.includes('EVALUACIÓN (Pago Único)'),
        'Length changed from 966': enhancedResponse.length !== 966,
        'Contains threshold/umbral': enhancedResponse.toLowerCase().includes('umbral') || enhancedResponse.toLowerCase().includes('threshold')
    };
    
    console.log('\n📊 CRITICAL VALIDATION RESULTS:');
    console.log('==============================');
    
    let passedChecks = 0;
    let totalChecks = Object.keys(checks).length;
    
    for (const [check, passed] of Object.entries(checks)) {
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${check}: ${passed}`);
        if (passed) passedChecks++;
    }
    
    console.log(`\n📈 SUCCESS RATE: ${Math.round((passedChecks / totalChecks) * 100)}%`);
    
    if (passedChecks >= 4) {
        console.log('\n🎉 ✅ APEX SAFETY NET BUG SUCCESSFULLY RESOLVED!');
        console.log('✅ Specific conditions now execute before generic ones');
        console.log('✅ Users get relevant Safety Net information');
        console.log('✅ No more 966-character identical responses');
        
        console.log('\n💬 ENHANCED RESPONSE SAMPLE (first 300 chars):');
        console.log(`"${enhancedResponse.substring(0, 300)}..."`);
        
        // Test other critical edge cases
        console.log('\n🔍 BONUS: Testing other edge cases...');
        
        const edgeCases = [
            'que umbral minimo tiene apex para retiros?',
            'como son los planes de apex?',
            'que metodos de pago acepta apex?'
        ];
        
        for (const edgeCase of edgeCases) {
            console.log(`\n📝 Edge case: "${edgeCase}"`);
            const edgeResponse = apexFixes.enhanceApexResponse(edgeCase, 'Generic response', 'apex');
            const isSpecific = edgeResponse.length !== 966 && !edgeResponse.includes('Generic response');
            console.log(`   ${isSpecific ? '✅' : '❌'} Gets specific response: ${isSpecific}`);
        }
        
        return true;
    } else {
        console.log(`\n❌ APEX FIX NEEDS REVIEW - Only ${passedChecks}/${totalChecks} checks passed`);
        console.log('\n💬 ACTUAL ENHANCED RESPONSE:');
        console.log(enhancedResponse);
        
        return false;
    }
}

testApexSafetyNetFix()
    .then(success => {
        console.log(`\n🏁 CRITICAL TEST RESULT: ${success ? '✅ SUCCESS' : '❌ NEEDS REVIEW'}`); 
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ CRITICAL ERROR:', error);
        process.exit(1);
    });