# Database Setup and Verification Guide

**Purpose**: This guide helps verify the WordWise AI database is properly configured and populated with test data.

## Quick Setup Steps

### 1. Apply Database Schema
Run this in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of supabase/migrations/01_complete_setup.sql
-- This creates all tables, RLS policies, and indexes
```

### 2. Verify Schema
Check that tables exist:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'documents', 'suggestions');

-- Should return 3 rows: documents, profiles, suggestions
```

### 3. Verify RLS Policies
```sql
-- Check RLS policies are enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'documents', 'suggestions');

-- All should show rowsecurity = true

-- List specific policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 4. Populate Test Data (After Authentication)
**Important**: You must be authenticated as a user first!

1. Sign in to your app with Google OAuth
2. Run the test data population:

```sql
-- Copy and paste the contents of supabase/seed.sql
-- This creates sample documents and suggestions for testing
```

## Database Inspection Queries

### Check Document Count
```sql
SELECT COUNT(*) as document_count FROM documents;
-- Should return 5 test documents after seeding
```

### Verify Document Content
```sql
SELECT id, title, LENGTH(content) as content_length, readability 
FROM documents 
ORDER BY title;

-- Should show:
-- test-doc-1: Grammar Test Document (~300 chars)
-- test-doc-2: Readability Analysis Test (~800 chars)  
-- test-doc-3: Performance Testing Essay (~3000+ chars)
-- test-doc-4: Simple Test Document (~100 chars)
-- test-doc-5: Formatting Test Document (~500 chars)
```

### Check Suggestions
```sql
SELECT doc_id, type, COUNT(*) as suggestion_count 
FROM suggestions 
GROUP BY doc_id, type 
ORDER BY doc_id, type;

-- Should show various grammar, spelling, and style suggestions
-- across multiple test documents
```

### Verify RLS is Working
```sql
-- This should only return data for the current authenticated user
SELECT d.title, COUNT(s.id) as suggestion_count
FROM documents d
LEFT JOIN suggestions s ON d.id = s.doc_id
GROUP BY d.id, d.title
ORDER BY d.title;

-- If you see data, RLS is working (you can access your own documents)
-- If you see no data, either you're not authenticated or RLS is blocking access
```

## Test Scenarios Created

### Document 1: Grammar Test Document
- **Content**: Basic text with common grammar errors
- **Purpose**: Test grammar checking fundamentals
- **Errors**: Spelling mistakes, subject-verb disagreement, possessive vs contraction
- **Expected Suggestions**: 3-5 grammar/spelling suggestions

### Document 2: Readability Analysis Test  
- **Content**: Mix of simple and complex sentences with passive voice
- **Purpose**: Test readability metrics and passive voice detection
- **Flesch Score**: ~45.8 (College level)
- **Passive Voice**: ~50%

### Document 3: Performance Testing Essay
- **Content**: Long-form essay about climate change (~3000+ characters)
- **Purpose**: Test performance with larger documents
- **Use Case**: Stress test grammar checking and readability analysis

### Document 4: Simple Test Document
- **Content**: Very basic "Hello world" type content
- **Purpose**: Test basic functionality with minimal content
- **Flesch Score**: ~85.0 (Easy reading)

### Document 5: Formatting Test Document
- **Content**: Text with HTML formatting (bold, italic, lists)
- **Purpose**: Test offset mapping with formatted content
- **Critical**: Tests that grammar highlights position correctly with HTML tags

## Troubleshooting

### "No tables found"
- Schema migration not applied
- Run `01_complete_setup.sql` in Supabase SQL Editor

### "Permission denied" errors
- RLS policies not properly configured
- User not authenticated
- Check that `auth.uid()` returns a valid user ID

### "No test data visible"
- Not authenticated as a user
- Test data not populated
- Run `seed.sql` after signing in to the app

### "Grammar suggestions not working"
- Edge Functions not deployed
- Environment variables missing
- LanguageTool API connectivity issues

## Verification Checklist

- [ ] **Tables created**: profiles, documents, suggestions exist
- [ ] **RLS enabled**: All tables have row-level security enabled
- [ ] **Policies active**: Can query own data, cannot access other users' data  
- [ ] **Indexes created**: Performance indexes on key columns
- [ ] **Test documents**: 5 test documents with varying content types
- [ ] **Sample suggestions**: Pre-populated grammar suggestions for testing UI
- [ ] **User profile**: Test user profile with preferences
- [ ] **Edge Functions**: grammar_check and readability functions deployed
- [ ] **Authentication**: Google OAuth working end-to-end

## Manual Testing with Test Data

### Grammar Checking
1. Open Document 1 (Grammar Test Document)
2. Click on underlined errors to see suggestion popovers
3. Apply suggestions and verify they update correctly
4. Add new text with errors and wait 2 seconds for checking

### Readability Analysis  
1. Open Document 2 (Readability Analysis Test)
2. Check that readability sidebar shows:
   - Flesch Score: ~45.8
   - Reading Level: College
   - Passive Voice: ~50% (yellow/red indicator)
3. Edit content and verify metrics update

### Offset Mapping
1. Open Document 5 (Formatting Test Document)  
2. Click on grammar errors within bold/italic text
3. Verify suggestion popovers appear in correct positions
4. Apply suggestions to formatted text

### Performance
1. Open Document 3 (Performance Testing Essay)
2. Verify grammar checking completes within 5 seconds
3. Test typing additional content - should remain responsive
4. Check that readability analysis updates smoothly

---

**Note**: This test data provides comprehensive coverage for manual testing. For automated testing, consider creating additional edge cases and stress test scenarios.