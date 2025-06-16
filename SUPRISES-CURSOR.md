# Team Surprise Log (developer-authored)

_Add any unexpected issues, quirks, or discoveries here. Claude will not modify this file._

## 2025-06-16 - Critical Bug Analysis

### Confirmed Schema Mismatch ⚠️
**Issue**: Database uses `start`/`end` columns but code uses `start_pos`/`end_pos`
**Files affected**: 
- `supabase/functions/grammar_check/index.ts` - inserts with wrong column names
- `src/lib/supabase.ts` - TypeScript interface mismatch
- All suggestion-related components expect wrong field names

**Impact**: Grammar suggestions completely broken - INSERT operations will fail

**Priority**: CRITICAL - Must fix before any testing

### Grammar Highlighting Offset Bug ⚠️  
**Issue**: We send plain text to LanguageTool but apply offsets to HTML content
**Impact**: Any bold/italic formatting will shift all subsequent grammar highlights to wrong positions
**Example**: Text "Hello **world** test" becomes "Hello world test" for LanguageTool, but offsets don't account for `**` tags

### Missing RLS Policies 
**Issue**: Client-side suggestion deletions use anon key but may lack proper RLS policies
**Impact**: Users can't dismiss/apply grammar suggestions
**Need to verify**: Database RLS policies for suggestions table

### Tiptap API Misuse
**Issue**: `unsetHighlight()` doesn't exist in Tiptap Highlight extension
**Current code**: `editor.chain().focus().unsetHighlight().run()`
**Should be**: `editor.chain().focus().unsetAllMarks().run()` or custom command