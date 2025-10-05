-- =====================================================
-- AimAi Database Schema - Complete SQL
-- All tables required for the web application
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. SESSIONS TABLE
-- Stores user session data for authentication
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- =====================================================
-- 2. USERS TABLE
-- Stores user profiles including name, gender, class, stream
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    
    -- User profile data (saved after login)
    name TEXT,
    gender VARCHAR(10),
    class VARCHAR(20),
    stream VARCHAR(50),
    is_profile_complete BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Preferences
    language VARCHAR(10) NOT NULL DEFAULT 'english',
    theme VARCHAR(10) NOT NULL DEFAULT 'light',
    
    -- Usage tracking
    daily_usage_minutes INTEGER NOT NULL DEFAULT 0,
    last_usage_reset TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Chat adaptation preferences
    conversation_preferences JSONB,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. CONVERSATIONS TABLE
-- Stores chat conversations/sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR REFERENCES users(id),
    title TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. QUESTIONS TABLE
-- Stores student questions (text, image, audio input)
-- =====================================================
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id VARCHAR NOT NULL REFERENCES conversations(id),
    question_text TEXT NOT NULL,
    input_type VARCHAR(10) NOT NULL, -- 'text', 'image', 'audio'
    
    -- Categorization
    subject VARCHAR(100), -- 'physics', 'chemistry', 'math', 'biology'
    chapter TEXT,
    topic TEXT,
    
    -- Media URLs
    image_url TEXT,
    audio_url TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 5. SOLUTIONS TABLE
-- Stores AI-generated solutions and explanations
-- =====================================================
CREATE TABLE IF NOT EXISTS solutions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id VARCHAR NOT NULL REFERENCES questions(id),
    solution_text TEXT NOT NULL,
    explanation TEXT,
    
    -- Categorization
    subject VARCHAR(100) NOT NULL,
    chapter TEXT,
    topic TEXT,
    
    -- NEET/JEE Previous Year Questions references
    neet_jee_pyq JSONB,
    
    -- Language and sharing
    language VARCHAR(10) NOT NULL,
    share_url TEXT NOT NULL UNIQUE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_bookmarked BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 6. EXAM UPDATES TABLE
-- Stores latest NEET/JEE exam updates and news
-- =====================================================
CREATE TABLE IF NOT EXISTS exam_updates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_type VARCHAR(10) NOT NULL, -- 'neet' or 'jee'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    published_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 7. EXAM CRITERIA TABLE
-- Stores NEET/JEE exam patterns and syllabus
-- =====================================================
CREATE TABLE IF NOT EXISTS exam_criteria (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_type VARCHAR(10) NOT NULL, -- 'neet' or 'jee'
    pattern TEXT NOT NULL,
    criteria TEXT NOT NULL,
    syllabus JSONB NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 8. API KEYS TABLE
-- Stores API keys for external integrations (like Telegram bot)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR REFERENCES users(id),
    key VARCHAR(64) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    last_used TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES for better query performance
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Conversations table indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Questions table indexes
CREATE INDEX IF NOT EXISTS idx_questions_conversation_id ON questions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);

-- Solutions table indexes
CREATE INDEX IF NOT EXISTS idx_solutions_question_id ON solutions(question_id);
CREATE INDEX IF NOT EXISTS idx_solutions_share_url ON solutions(share_url);
CREATE INDEX IF NOT EXISTS idx_solutions_is_bookmarked ON solutions(is_bookmarked);
CREATE INDEX IF NOT EXISTS idx_solutions_subject ON solutions(subject);

-- Exam updates indexes
CREATE INDEX IF NOT EXISTS idx_exam_updates_exam_type ON exam_updates(exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_updates_published_at ON exam_updates(published_at);

-- API keys indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample exam criteria for NEET
INSERT INTO exam_criteria (exam_type, pattern, criteria, syllabus, last_updated)
VALUES (
    'neet',
    '180 MCQs | 720 Marks | 3 Hours',
    'Physics: 45 Questions (180 marks), Chemistry: 45 Questions (180 marks), Biology: 90 Questions (360 marks)',
    '{
        "subjects": [
            {
                "name": "Physics",
                "topics": ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Modern Physics"]
            },
            {
                "name": "Chemistry",
                "topics": ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry"]
            },
            {
                "name": "Biology",
                "topics": ["Botany", "Zoology", "Human Physiology", "Genetics", "Ecology"]
            }
        ]
    }'::jsonb,
    NOW()
)
ON CONFLICT DO NOTHING;

-- Insert sample exam criteria for JEE
INSERT INTO exam_criteria (exam_type, pattern, criteria, syllabus, last_updated)
VALUES (
    'jee',
    '90 MCQs | 300 Marks | 3 Hours',
    'Physics: 30 Questions (100 marks), Chemistry: 30 Questions (100 marks), Mathematics: 30 Questions (100 marks)',
    '{
        "subjects": [
            {
                "name": "Physics",
                "topics": ["Mechanics", "Electricity & Magnetism", "Thermal Physics", "Optics", "Modern Physics"]
            },
            {
                "name": "Chemistry",
                "topics": ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry"]
            },
            {
                "name": "Mathematics",
                "topics": ["Algebra", "Calculus", "Coordinate Geometry", "Trigonometry", "Vectors"]
            }
        ]
    }'::jsonb,
    NOW()
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count all tables
SELECT 
    'sessions' as table_name, COUNT(*) as row_count FROM sessions
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'solutions', COUNT(*) FROM solutions
UNION ALL
SELECT 'exam_updates', COUNT(*) FROM exam_updates
UNION ALL
SELECT 'exam_criteria', COUNT(*) FROM exam_criteria
UNION ALL
SELECT 'api_keys', COUNT(*) FROM api_keys;

-- Show table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name IN ('users', 'conversations', 'questions', 'solutions', 'exam_updates', 'exam_criteria', 'api_keys', 'sessions')
ORDER BY 
    table_name, ordinal_position;
