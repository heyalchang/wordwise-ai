-- Initial schema setup for WordWise AI
-- Creates all necessary tables, policies, and indexes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  locale TEXT DEFAULT 'en-US',
  writing_goals JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table  
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  readability JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suggestions table (using quoted column names to avoid reserved word conflicts)
CREATE TABLE IF NOT EXISTS suggestions (
  id BIGSERIAL PRIMARY KEY,
  doc_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  start_pos INTEGER NOT NULL,
  end_pos INTEGER NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  replacements JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can CRUD own profile" ON profiles;
DROP POLICY IF EXISTS "Users can CRUD own documents" ON documents;
DROP POLICY IF EXISTS "owner suggestions" ON suggestions;

-- RLS Policies
CREATE POLICY "Users can CRUD own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own documents" ON documents
  FOR ALL USING (auth.uid() = owner);

-- Fixed RLS policy for suggestions with proper DELETE support
CREATE POLICY "owner suggestions" ON suggestions
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM documents d 
      WHERE d.id = doc_id AND d.owner = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d 
      WHERE d.id = doc_id AND d.owner = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_doc_id ON suggestions(doc_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_start_end ON suggestions(start_pos, end_pos);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on documents
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();