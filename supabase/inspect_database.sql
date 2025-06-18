-- Database Inspection Queries for WordWise AI
-- Run these queries in Supabase SQL Editor to verify database setup

-- 1. Check if all required tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'documents', 'suggestions')
ORDER BY table_name;

-- Expected: 3 rows with profiles, documents, suggestions

-- 2. Verify RLS is enabled on all tables
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  hasindexes as has_indexes
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'documents', 'suggestions')
ORDER BY tablename;

-- Expected: All should show rls_enabled = true

-- 3. List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operations,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected: Policies for each table allowing users to access their own data

-- 4. Check indexes for performance
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'documents', 'suggestions')
ORDER BY tablename, indexname;

-- 5. Verify current user can authenticate
SELECT 
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'Authenticated'
    ELSE 'Not authenticated'
  END as auth_status;

-- Expected: Should show a UUID if authenticated, NULL if not

-- 6. Count documents (only visible if authenticated and test data loaded)
SELECT 
  COUNT(*) as total_documents,
  COUNT(CASE WHEN title LIKE '%Test%' THEN 1 END) as test_documents
FROM documents;

-- Expected: 5 total documents (all test documents) if seed data loaded

-- 7. Document details (content length and readability)
SELECT 
  id,
  title,
  LENGTH(content) as content_length,
  LENGTH(content) - LENGTH(REPLACE(content, '<', '')) as html_tag_count,
  readability->'flesch_score' as flesch_score,
  readability->'passive_pct' as passive_voice_pct,
  created_at,
  updated_at
FROM documents 
ORDER BY title;

-- 8. Suggestions breakdown
SELECT 
  d.title as document_title,
  s.type as suggestion_type,
  COUNT(s.id) as suggestion_count,
  AVG(s.end - s.start) as avg_suggestion_length
FROM documents d
LEFT JOIN suggestions s ON d.id = s.doc_id
GROUP BY d.id, d.title, s.type
ORDER BY d.title, s.type;

-- 9. Check for orphaned suggestions (should be none due to foreign key)
SELECT 
  s.id,
  s.doc_id,
  s.type,
  s.message
FROM suggestions s
LEFT JOIN documents d ON s.doc_id = d.id
WHERE d.id IS NULL;

-- Expected: No results (no orphaned suggestions)

-- 10. Profile information
SELECT 
  id,
  display_name,
  locale,
  writing_goals,
  created_at
FROM profiles;

-- 11. Test RLS isolation (this should only return current user's data)
SELECT 
  'documents' as table_name,
  COUNT(*) as accessible_records
FROM documents
UNION ALL
SELECT 
  'suggestions' as table_name,
  COUNT(*) as accessible_records  
FROM suggestions
UNION ALL
SELECT 
  'profiles' as table_name,
  COUNT(*) as accessible_records
FROM profiles;

-- 12. Check for any database errors or warnings
SELECT 
  'Database inspection complete' as status,
  NOW() as inspection_time,
  version() as postgres_version;

-- Additional debugging queries if needed:

-- Check auth.users table (requires elevated permissions)
-- SELECT id, email, created_at FROM auth.users LIMIT 5;

-- Check specific document content (useful for debugging offset mapping)
-- SELECT id, title, SUBSTRING(content, 1, 200) as content_preview 
-- FROM documents 
-- WHERE id = 'test-doc-5';

-- Check suggestion positioning details
-- SELECT doc_id, start, "end", "end" - start as length, type, message
-- FROM suggestions 
-- WHERE doc_id = 'test-doc-5'
-- ORDER BY start;