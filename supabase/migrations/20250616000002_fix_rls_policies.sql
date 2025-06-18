-- Fix RLS policies for suggestions table to properly handle DELETE operations
-- This ensures users can delete their own suggestions without RLS blocking

-- Drop the existing policy
DROP POLICY IF EXISTS "owner suggestions" ON suggestions;

-- Create comprehensive policy that explicitly handles all operations including DELETE
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

-- Verify RLS is enabled (should already be enabled)
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;