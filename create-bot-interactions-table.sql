-- 📊 BOT INTERACTIONS TABLE FOR ANALYTICS & IMPROVEMENT
-- This table will store all user interactions with the bot for analysis

CREATE TABLE IF NOT EXISTS bot_interactions (
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for analytics queries
    INDEX idx_bot_interactions_timestamp (timestamp),
    INDEX idx_bot_interactions_firm (selected_firm),
    INDEX idx_bot_interactions_success (success),
    INDEX idx_bot_interactions_version (bot_version)
);

-- Add Row Level Security (optional)
ALTER TABLE bot_interactions ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to insert/select (for bot usage)
CREATE POLICY "Allow service role access" ON bot_interactions
    FOR ALL USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE bot_interactions IS 'Stores all bot interactions for analytics and improvement';
COMMENT ON COLUMN bot_interactions.question IS 'User question (truncated to 500 chars)';
COMMENT ON COLUMN bot_interactions.selected_firm IS 'Which firm was detected/selected for the question';
COMMENT ON COLUMN bot_interactions.response_length IS 'Length of bot response in characters';
COMMENT ON COLUMN bot_interactions.success IS 'Whether the interaction was successful or had errors';
COMMENT ON COLUMN bot_interactions.error_message IS 'Error message if success=false';