/**
 * 🧪 Test Cache Contamination Fix
 * 
 * This test validates that SmartCache V2 fixes prevent incorrect cached responses
 * from contaminating different query types.
 */

const MultiFirmBot = require('./multiFirmProductionBot');

async function testCacheContaminationFix() {
    console.log('🧪 TESTING FIXED SMARTCACHE V2 - CACHE CONTAMINATION FIX');
    console.log('======================================================');
    
    const bot = new MultiFirmBot();
    
    // Test the exact same sequence that failed in production
    const testSequence = [
        'alpha futures metodos de retiro?',
        'que planes hay en alpha futures?',
        'que tipo de drawdown hay en alpha future?', 
        'como son los precios en alpha futures?'
    ];
    
    console.log('📋 Testing exact sequence that failed in production...\n');
    
    let correctResponses = 0;
    let totalTests = testSequence.length;
    
    for (let i = 0; i < testSequence.length; i++) {
        const question = testSequence[i];
        console.log((i+1) + '. 📝 QUESTION:', question);
        
        try {
            const startTime = Date.now();
            const response = await bot.searchAndGenerateResponse(question);
            const responseTime = Date.now() - startTime;
            
            console.log('⚡ Response time:', responseTime + 'ms');
            console.log('📄 Response length:', response.length + ' chars');
            
            // Check for the specific content markers
            const isRetiroResponse = response.includes('Wire Transfer') || response.includes('ACH') || response.includes('Wise');
            const isPlanesResponse = response.includes('Plan') || response.includes('25K') || response.includes('50K');
            const isDrawdownResponse = response.includes('drawdown') || response.includes('Trailing') || response.includes('Estático');
            const isPreciosResponse = response.includes('precio') || response.includes('costo');
            
            console.log('🔍 Content analysis:');
            console.log('   Contains retiro markers:', isRetiroResponse);
            console.log('   Contains planes markers:', isPlanesResponse); 
            console.log('   Contains drawdown markers:', isDrawdownResponse);
            console.log('   Contains pricing markers:', isPreciosResponse);
            
            // Determine if response matches expected content type
            let isCorrect = false;
            let expectedType = '';
            
            if (question.includes('metodos de retiro')) {
                expectedType = 'withdrawal methods';
                isCorrect = isRetiroResponse && !isPlanesResponse;
            } else if (question.includes('que planes hay')) {
                expectedType = 'account plans';
                isCorrect = isPlanesResponse && !isRetiroResponse;
            } else if (question.includes('drawdown')) {
                expectedType = 'drawdown information';
                isCorrect = isDrawdownResponse;
            } else if (question.includes('precios')) {
                expectedType = 'pricing information';
                isCorrect = isPlanesResponse || isPreciosResponse;
            }
            
            console.log('✅ Expected type:', expectedType);
            console.log('🎯 Response correct:', isCorrect ? '✅ YES' : '❌ NO - CACHE CONTAMINATION DETECTED');
            
            if (isCorrect) {
                correctResponses++;
            } else {
                console.log('💬 Incorrect response (first 200 chars):');
                console.log('"' + response.substring(0, 200) + '..."');
            }
            
        } catch (error) {
            console.error('❌ ERROR:', error.message);
        }
        
        console.log('---');
    }
    
    console.log('\n📊 TEST RESULTS:');
    console.log('===============');
    console.log('Correct responses:', correctResponses + '/' + totalTests);
    console.log('Success rate:', Math.round((correctResponses/totalTests) * 100) + '%');
    
    if (correctResponses === totalTests) {
        console.log('\n🎉 ✅ CACHE CONTAMINATION FIX SUCCESSFUL!');
        console.log('✅ All responses now match expected content types');
        console.log('✅ SmartCache V2 is working correctly');
        console.log('✅ Ready for production deployment');
    } else {
        console.log('\n⚠️  CACHE CONTAMINATION STILL PRESENT');
        console.log('❌ Some responses still showing incorrect content');
        console.log('🔧 Additional fixes needed in SmartCache V2');
    }
    
    console.log('\n🏁 CACHE CONTAMINATION TEST COMPLETED');
}

testCacheContaminationFix().catch(console.error);