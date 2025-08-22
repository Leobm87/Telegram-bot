// Script to create bot_interactions table in Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createInteractionsTable() {
    console.log('📊 Creating bot_interactions table...');
    
    try {
        // First, let's try to insert a test record to see what happens
        const testRecord = {
            timestamp: new Date().toISOString(),
            chat_id: 'test_chat',
            question: 'Test question',
            selected_firm: 'test',
            response_length: 100,
            success: true,
            bot_version: '3.0.0'
        };
        
        const { data, error } = await supabase
            .from('bot_interactions')
            .insert([testRecord]);
        
        if (error) {
            if (error.message.includes('does not exist')) {
                console.log('❌ Table does not exist. Creating via SQL...');
                
                // Since we can't execute raw SQL, let's modify the bot to handle missing table
                console.log('⚠️ Table will be created manually in Supabase dashboard');
                console.log('📋 SQL to execute in Supabase SQL Editor:');
                console.log(`
CREATE TABLE bot_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    chat_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50),
    username VARCHAR(100),
    question TEXT NOT NULL,
    selected_firm VARCHAR(50),
    response_length INTEGER,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    bot_version VARCHAR(20) NOT NULL DEFAULT '3.0.0',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
                `);
            } else {
                console.error('❌ Insert error:', error.message);
            }
        } else {
            console.log('✅ Table exists and test record inserted');
            
            // Clean up test record
            await supabase
                .from('bot_interactions')
                .delete()
                .eq('chat_id', 'test_chat');
            console.log('🧹 Test record cleaned up');
        }
        
    } catch (error) {
        console.error('❌ Script error:', error.message);
    }
}

createInteractionsTable();