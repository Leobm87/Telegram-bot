#!/usr/bin/env node

/**
 * 🔄 MARKDOWN TO HTML CONVERTER FOR FAQs
 * 
 * Converts all FAQ answers from Markdown to HTML format
 * for consistent Telegram Bot formatting
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zkqfyyvpyecueybxoqrt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_KEY environment variable required');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Convert Markdown text to HTML
 * @param {string} markdownText 
 * @returns {string} HTML text
 */
function convertMarkdownToHtml(markdownText) {
    if (!markdownText) return markdownText;
    
    let htmlText = markdownText;
    
    // Convert **bold** to <b>bold</b>
    htmlText = htmlText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    
    // Convert *italic* to <i>italic</i>
    htmlText = htmlText.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<i>$1</i>');
    
    // Convert `code` to <code>code</code>
    htmlText = htmlText.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert [link text](url) to <a href="url">link text</a>
    htmlText = htmlText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    return htmlText;
}

async function convertAllFaqsToHtml() {
    console.log('🔄 CONVERTING ALL FAQs FROM MARKDOWN TO HTML');
    console.log('================================================');
    
    try {
        // Get all FAQs
        const { data: faqs, error: fetchError } = await supabase
            .from('faqs')
            .select('id, question, answer_md, slug, firm_id');
            
        if (fetchError) {
            throw fetchError;
        }
        
        console.log(`📊 Found ${faqs.length} FAQs to convert`);
        console.log('');
        
        let convertedCount = 0;
        let skippedCount = 0;
        
        for (const faq of faqs) {
            const originalAnswer = faq.answer_md;
            const htmlAnswer = convertMarkdownToHtml(originalAnswer);
            
            // Only update if there were changes
            if (htmlAnswer !== originalAnswer) {
                console.log(`🔄 Converting FAQ: ${faq.question.substring(0, 60)}...`);
                console.log(`   BEFORE: ${originalAnswer.substring(0, 80)}...`);
                console.log(`   AFTER:  ${htmlAnswer.substring(0, 80)}...`);
                
                const { error: updateError } = await supabase
                    .from('faqs')
                    .update({ answer_md: htmlAnswer })
                    .eq('id', faq.id);
                    
                if (updateError) {
                    console.error(`❌ Error updating FAQ ${faq.id}:`, updateError.message);
                } else {
                    convertedCount++;
                }
                console.log('');
            } else {
                skippedCount++;
            }
        }
        
        console.log('✅ CONVERSION COMPLETED');
        console.log(`   Converted: ${convertedCount} FAQs`);
        console.log(`   Skipped: ${skippedCount} FAQs (already in correct format)`);
        console.log(`   Total: ${faqs.length} FAQs`);
        
        if (convertedCount > 0) {
            console.log('');
            console.log('🎯 NEXT STEPS:');
            console.log('   1. Test bot responses to ensure HTML formatting works');
            console.log('   2. Verify bold/italic rendering in Telegram');
            console.log('   3. Deploy updated bot to production');
        }
        
    } catch (error) {
        console.error('❌ CONVERSION FAILED:', error.message);
        process.exit(1);
    }
}

// Preview mode - show what would be converted
async function previewConversion() {
    console.log('👀 PREVIEW MODE - Showing conversion examples');
    console.log('==============================================');
    
    try {
        const { data: faqs } = await supabase
            .from('faqs')
            .select('question, answer_md')
            .limit(5);
            
        for (const faq of faqs) {
            const converted = convertMarkdownToHtml(faq.answer_md);
            if (converted !== faq.answer_md) {
                console.log(`📝 QUESTION: ${faq.question}`);
                console.log(`📄 MARKDOWN: ${faq.answer_md}`);
                console.log(`🔸 HTML:     ${converted}`);
                console.log('---');
            }
        }
    } catch (error) {
        console.error('❌ Preview failed:', error.message);
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--preview')) {
        previewConversion();
    } else if (args.includes('--convert')) {
        convertAllFaqsToHtml();
    } else {
        console.log('🔄 FAQ MARKDOWN TO HTML CONVERTER');
        console.log('');
        console.log('Usage:');
        console.log('  node convert-markdown-to-html.js --preview   # Show examples');
        console.log('  node convert-markdown-to-html.js --convert   # Convert all FAQs');
        console.log('');
        console.log('Environment Variables Required:');
        console.log('  SUPABASE_URL (optional, has default)');
        console.log('  SUPABASE_SERVICE_KEY (required)');
    }
}

module.exports = {
    convertMarkdownToHtml,
    convertAllFaqsToHtml,
    previewConversion
};