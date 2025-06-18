# WordWise AI Testing Guide

**Version**: Day 5 Complete  
**Last Updated**: June 16, 2025  
**Status**: Production Ready

This guide provides comprehensive instructions for testing the WordWise AI application, including setup, manual testing procedures, and automated testing strategies.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Server Setup](#server-setup)
5. [Manual Testing Procedures](#manual-testing-procedures)
6. [Feature Testing Checklist](#feature-testing-checklist)
7. [Edge Function Testing](#edge-function-testing)
8. [Performance Testing](#performance-testing)
9. [Browser Compatibility](#browser-compatibility)
10. [Known Issues & Workarounds](#known-issues--workarounds)
11. [Automated Testing](#automated-testing)

## Prerequisites

### Required Software
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**: Latest version
- **Modern Browser**: Chrome, Firefox, Safari, or Edge
- **Supabase CLI**: Latest version (for Edge Function testing)

### Required Accounts
- **Supabase Account**: For database and authentication
- **Google OAuth App**: For authentication testing
- **LanguageTool Account**: Optional (uses public API by default)

## Environment Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd wordwise-ai
npm install
```

### 2. Environment Variables
Create a `.env` file in the project root:

```bash
# Required - Get from Supabase project settings
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# For Edge Function development (not required for frontend testing)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional - Defaults to public LanguageTool API
LANGUAGETOOL_API_URL=https://api.languagetool.org/v2/check
```

### 3. Verify Installation
```bash
# Check all builds pass
npm run typecheck
npm run lint
npm run build

# Should see no errors, only 1 minor warning acceptable
```

## Database Setup

### Option 1: Local Development (Recommended)

**Quick Setup with Test Users:**
```bash
# Start local Supabase environment
npm run db:start

# Apply schema and seed data with test users
npm run db:seed

# Generate TypeScript types
npm run db:types
```

This creates a complete local testing environment with:
- **3 pre-configured test users** (see Test Users section below)
- **6 realistic test documents** with various content types
- **Pre-populated grammar suggestions** for immediate testing
- **No external dependencies** required

### Option 2: Remote Supabase (Production Testing)

**Manual Setup:**
1. Create new Supabase project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **API** to get your URL and anon key
3. Update your `.env` file with these values

### 3. Database Schema (Remote Setup Only)
If using remote Supabase, the database should already be configured, but if starting fresh:

```sql
-- Run these in Supabase SQL Editor

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT,
  locale TEXT DEFAULT 'en-US',
  writing_goals JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table  
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  readability JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suggestions table
CREATE TABLE suggestions (
  id BIGSERIAL PRIMARY KEY,
  doc_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  start INTEGER NOT NULL,
  end INTEGER NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  replacements JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can CRUD own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own documents" ON documents
  FOR ALL USING (auth.uid() = owner);

CREATE POLICY "Users can CRUD own suggestions" ON suggestions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM documents d WHERE d.id = doc_id AND d.owner = auth.uid())
  );
```

### 3. Authentication Setup
1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Google** provider
3. Add your domain to **Site URL** (e.g., `http://localhost:5173`)
4. Configure Google OAuth in Google Cloud Console
5. Add redirect URLs: `https://your-project.supabase.co/auth/v1/callback`

## Server Setup

### 1. Development Server
```bash
# Start the Vite development server
npm run dev

# Should start on http://localhost:5173
# Hot reload enabled for development
```

### 2. Edge Functions (Optional)
If testing Edge Functions locally:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase (optional)
supabase start

# Deploy functions to production
supabase functions deploy grammar_check
supabase functions deploy readability
```

### 3. Production Build Testing
```bash
# Build and preview production version
npm run build
npm run preview

# Test production build before deployment
```

## Quick Testing Workflow

**For immediate testing with pre-loaded data:**

```bash
# 1. Setup (one-time)
npm run db:start    # Start local database
npm run db:seed     # Load test users and documents
npm run dev:local   # Start development server

# 2. Test (5 minutes)
# Open http://localhost:5173
# Sign in: test1@wordwise.ai / password123
# Dashboard: See 2 test documents
# Open "Grammar Test Document"
# See grammar highlights, click for suggestions
# Check readability sidebar for live metrics
# Test different users for different scenarios
```

**Expected Results:**
- ✅ Immediate login with test users
- ✅ Pre-populated documents with grammar errors
- ✅ Working suggestion popovers 
- ✅ Live readability analysis
- ✅ All features functional without external setup

## Manual Testing Procedures

## Local Test Users

**Available when using local development setup (`npm run db:seed`)**

### Pre-configured Test Users
All users have password: `password123`

| Email | Profile | Writing Goals | Use Case |
|-------|---------|---------------|----------|
| `test1@wordwise.ai` | Test User 1 | Academic Writing, Grammar Improvement | General testing |
| `test2@wordwise.ai` | Test User 2 | Business Writing, Clarity | Performance testing |
| `test3@wordwise.ai` | ESL Student | Academic Essays, Vocabulary, Grammar | ESL-specific testing |

### Test Documents Available

Each user has realistic test documents pre-loaded:

**Document 1: Grammar Test Document** (User 1)
- Basic grammar errors for testing corrections
- Pre-populated with 3 grammar suggestions
- Good for testing suggestion popovers

**Document 2: Readability Analysis Test** (User 1)  
- Mix of simple and complex sentences
- Tests readability metrics and passive voice detection
- Pre-populated with 2 passive voice suggestions

**Document 3: Performance Testing Essay** (User 2)
- Long climate change essay (1000+ words)
- Tests performance with large documents
- Complex academic writing style

**Document 4: Simple Test Document** (User 2)
- Basic "Hello world" content
- Quick UI testing
- High readability score

**Document 5: Formatting Test Document** (User 3)
- Bold and italic text for offset mapping testing
- Tests grammar highlighting with formatted content
- Pre-populated with 3 formatting-related suggestions

**Document 6: ESL Student Essay** (User 3)
- Authentic ESL writing: "My Experience Learning English"
- 13 realistic grammar errors with suggestions
- Perfect for testing ESL-specific features

### Authentication Testing Options

**Option 1: Email/Password (Fastest)**
```bash
# Sign in with any test user
Email: test1@wordwise.ai
Password: password123
```

**Option 2: Google OAuth (Production-like)**
- Configure Google OAuth as described in setup guide
- Test with your actual Google account
- More realistic authentication flow

### Test Environment Checklist
- [ ] Development server running on http://localhost:5173
- [ ] Database connected and accessible (local or remote)
- [ ] Test users available (local) or Google OAuth configured (remote)
- [ ] Environment variables configured
- [ ] Network connection available (for LanguageTool API)

### Pre-populated Test Data Benefits

Using the local test environment with seed data provides:
- **Immediate testing** without creating content
- **Realistic grammar errors** based on actual ESL writing patterns
- **Pre-loaded suggestions** for testing UI without API delays
- **Various document types** for comprehensive feature testing
- **Performance scenarios** with different content lengths
- **Offset mapping testing** with formatted text

## Feature Testing Checklist

### 🔐 Authentication Testing

#### Local Email/Password Login (Recommended for Testing)
- [ ] **Navigate to app**: Should redirect to login page when not authenticated
- [ ] **Use test credentials**: 
  - Email: `test1@wordwise.ai` 
  - Password: `password123`
- [ ] **Successful login**: Authenticates and redirects to dashboard
- [ ] **Verify user info**: Email and display name shown in header
- [ ] **Test logout**: "Sign out" button logs out and returns to login
- [ ] **Test other users**: Try `test2@wordwise.ai` and `test3@wordwise.ai`

#### Google OAuth Login (Production Testing)
- [ ] **Navigate to app**: Should redirect to login page when not authenticated
- [ ] **Click "Sign in with Google"**: Opens Google OAuth popup
- [ ] **Complete Google login**: Successfully authenticates and redirects to dashboard
- [ ] **Verify user info**: Email displayed in header
- [ ] **Test logout**: "Sign out" button logs out and returns to login

#### Error Scenarios
- [ ] **Invalid local credentials**: Shows error for wrong email/password
- [ ] **Cancel OAuth**: Handles cancellation gracefully
- [ ] **Network error**: Shows appropriate error message
- [ ] **Invalid credentials**: Displays error from Google

### 📄 Document Management Testing

#### Pre-loaded Documents (Local Testing)
- [ ] **Dashboard loads**: Shows test documents for logged-in user
- [ ] **Document list display**: Each user sees their own documents:
  - test1@wordwise.ai: Grammar Test, Readability Analysis
  - test2@wordwise.ai: Performance Essay, Simple Test
  - test3@wordwise.ai: Formatting Test, ESL Student Essay
- [ ] **Document metadata**: Shows titles, creation dates, and readability scores
- [ ] **User isolation**: Can't see other users' documents (RLS working)

#### Document Creation
- [ ] **Create new document**: "Create New Document" button works
- [ ] **Redirect to editor**: Automatically opens new document in editor
- [ ] **Default title**: Shows "Untitled Document"
- [ ] **Mix with test data**: New documents appear alongside pre-loaded ones

#### Document Editing
- [ ] **Title editing**: Click title to edit, Enter to save, Escape to cancel
- [ ] **Content editing**: Can type in editor, formatting works (bold, italic)
- [ ] **Autosave indicator**: Shows "Saving..." when typing
- [ ] **Auto-save timing**: Saves automatically after 1 second of inactivity
- [ ] **Test document editing**: Modify pre-loaded documents to test persistence

#### Document Navigation
- [ ] **Back to dashboard**: Back arrow returns to document list
- [ ] **Document opening**: Click any document opens it in editor
- [ ] **Multiple documents**: Can switch between test documents and new ones
- [ ] **Document persistence**: Changes to test documents persist across sessions

### ✏️ Rich Text Editor Testing

#### Basic Editing
- [ ] **Text input**: Can type and edit text normally
- [ ] **Formatting toolbar**: Bold, italic, strikethrough buttons work
- [ ] **Keyboard shortcuts**: Ctrl+B (bold), Ctrl+I (italic) work
- [ ] **Placeholder text**: Shows helpful placeholder when empty

#### Editor Features
- [ ] **Paragraph breaks**: Enter creates new paragraphs
- [ ] **Text selection**: Can select and format text ranges
- [ ] **Undo/Redo**: Ctrl+Z and Ctrl+Y work correctly
- [ ] **Copy/Paste**: Text copying preserves formatting

### 🔍 Grammar Checking Testing

#### Pre-loaded Grammar Suggestions (Local Testing)
- [ ] **Open test documents**: Grammar Test, Formatting Test, or ESL Student Essay
- [ ] **Immediate highlights**: See pre-loaded grammar errors highlighted
- [ ] **Test suggestion popovers**: Click highlights to see suggestion dialogs
- [ ] **Apply corrections**: Test applying suggestions to verify functionality
- [ ] **Verify types**: See different error types (spelling, grammar, style)

#### Live Grammar Checking
- [ ] **Type with errors**: Enter text with grammar mistakes
- [ ] **Wait for check**: 2-second delay before grammar checking triggers
- [ ] **Visual highlights**: Errors appear with colored underlines:
  - Red: Grammar errors
  - Yellow: Spelling errors  
  - Blue: Style suggestions
  - Purple: Punctuation issues

#### Suggestion Popovers
- [ ] **Click highlight**: Clicking underlined text opens suggestion popover
- [ ] **Popover positioning**: Appears near clicked text (not at fixed position)
- [ ] **Suggestion content**: Shows error message and replacement options
- [ ] **Apply suggestion**: Click replacement applies it to text
- [ ] **Ignore suggestion**: "Ignore" button dismisses suggestion
- [ ] **Close popover**: X button or ESC key closes popover

#### Advanced Grammar Testing
- [ ] **Formatted text**: Test Document 5 for bold/italic grammar highlighting
- [ ] **ESL-specific errors**: Test Document 6 with 13 realistic ESL grammar issues
- [ ] **Offset mapping**: Verify grammar highlights align correctly with formatted text
- [ ] **Multiple errors**: Can handle multiple grammar issues simultaneously
- [ ] **Error persistence**: Suggestions persist across page refreshes

#### Error Scenarios
- [ ] **Network issues**: Handles LanguageTool API failures gracefully
- [ ] **Large text**: Use Document 3 (1000+ words) for performance testing
- [ ] **Special characters**: Handles unicode and special punctuation

### 📊 Readability Analysis Testing

#### Pre-loaded Readability Data (Local Testing)
- [ ] **Open test documents**: Each has different readability scores:
  - Document 1: Flesch 65.2 (Standard), Passive 33.3%
  - Document 2: Flesch 45.8 (Difficult), Passive 50.0%
  - Document 3: Flesch 38.5 (Graduate), Passive 25.0%
  - Document 4: Flesch 85.0 (Easy), Passive 0.0%
  - Document 5: Flesch 72.1 (Fairly Easy), Passive 12.5%
  - Document 6: Flesch 78.5 (Fairly Easy), Passive 15.0%
- [ ] **Verify display**: Check readability meters show correct scores
- [ ] **Color coding**: Verify appropriate colors for different difficulty levels

#### Live Readability Analysis
- [ ] **Type content**: Enter text to trigger readability analysis
- [ ] **Wait for analysis**: 3-second delay before readability checking
- [ ] **Flesch score display**: Shows reading ease score (0-100)
- [ ] **Reading level**: Displays difficulty level (5th grade → Graduate)
- [ ] **Score colors**: Green (easy) → Red (difficult) color coding

#### Passive Voice Detection
- [ ] **Test Document 2**: High passive voice content for testing
- [ ] **Passive voice percentage**: Shows percentage of passive voice usage
- [ ] **Color feedback**: Green (low) → Red (high passive voice)
- [ ] **Real-time updates**: Updates as you type and edit

#### ESL-Friendly Features
- [ ] **Helpful tips**: Provides writing guidance based on metrics
- [ ] **Clear labels**: Simple language in readability explanations
- [ ] **Progress indicators**: Visual progress bars for easy understanding
- [ ] **ESL student profile**: Test with test3@wordwise.ai for ESL-specific features

### 💾 Data Persistence Testing

#### Autosave Functionality
- [ ] **Continuous saving**: Changes save automatically while typing
- [ ] **Save indicators**: "Saving..." and "Last saved" timestamps
- [ ] **Network resilience**: Handles temporary connection loss
- [ ] **Unmount flush**: Saves when navigating away from editor

#### Database Integration
- [ ] **Cross-device sync**: Same account on different browsers shows same data
- [ ] **Real-time updates**: Multiple tabs sync document changes
- [ ] **Suggestion persistence**: Grammar suggestions survive page refresh
- [ ] **User isolation**: Users only see their own documents (RLS working)

## Edge Function Testing

### Grammar Check Function
```bash
# Test grammar checking API directly
curl -X POST "https://your-project.supabase.co/functions/v1/grammar_check" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "docId": "test-doc-id",
    "text": "This have many erors that need fixing.",
    "htmlText": "<p>This have many <strong>erors</strong> that need fixing.</p>"
  }'

# Expected response: 
# {"success": true, "suggestions_count": 2, "suggestions": [...]}
```

### Readability Function
```bash
# Test readability analysis
curl -X POST "https://your-project.supabase.co/functions/v1/readability" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "docId": "test-doc-id", 
    "text": "This is a simple sentence. This sentence is more complex and demonstrates passive voice usage."
  }'

# Expected response:
# {"success": true, "flesch_score": 75.2, "passive_pct": 50}
```

## Performance Testing

### Load Testing Scenarios
- [ ] **Large documents**: Test with 2000+ word essays
- [ ] **Multiple users**: Simulate concurrent usage
- [ ] **Rapid typing**: Fast typing doesn't break grammar checking
- [ ] **Network throttling**: Test on slow connections

### Performance Benchmarks
- [ ] **Initial load**: App loads within 3 seconds
- [ ] **Grammar check response**: ≤ 5 seconds for 1000 words
- [ ] **Readability analysis**: ≤ 3 seconds for 1000 words  
- [ ] **Autosave speed**: Saves complete within 1 second

### Memory and CPU
- [ ] **Memory usage**: No memory leaks during extended use
- [ ] **CPU performance**: Doesn't spike during normal operation
- [ ] **Browser responsiveness**: UI remains responsive during analysis

## Browser Compatibility

### Supported Browsers
- [ ] **Chrome**: Latest version (primary development target)
- [ ] **Firefox**: Latest version
- [ ] **Safari**: Latest version (macOS)
- [ ] **Edge**: Latest version

### Mobile Testing
- [ ] **Mobile responsive**: UI adapts to mobile screens
- [ ] **Touch interface**: Grammar popovers work on touch devices
- [ ] **Mobile performance**: Acceptable performance on mobile

### Cross-Browser Features
- [ ] **OAuth login**: Works across all browsers
- [ ] **Local storage**: Persists auth state correctly
- [ ] **API calls**: No CORS issues in any browser

## Known Issues & Workarounds

### Current Limitations
1. **Popover positioning**: Currently uses simplified positioning (acceptable)
2. **Large document performance**: May slow with 5000+ words
3. **Offline functionality**: Requires internet connection for grammar checking

### Common Issues & Solutions

#### "Grammar checking not working"
- **Check**: Network connection to LanguageTool API
- **Check**: Environment variables configured correctly
- **Check**: Wait 2 seconds after typing for debounced check

#### "Authentication fails"
- **Check**: Google OAuth configured in Supabase
- **Check**: Site URL matches your domain
- **Check**: Browser allows popups

#### "Documents not saving"
- **Check**: Database connection working
- **Check**: User is authenticated
- **Check**: RLS policies allow user access

#### "Readability not updating"
- **Check**: Wait 3 seconds for debounced analysis
- **Check**: Document has sufficient text (>10 words)
- **Check**: Edge function deployed correctly

## Automated Testing

### Current Test Coverage
```bash
# Run existing tests
npm run test  # Currently: No automated tests implemented

# Linting and type checking
npm run lint      # ESLint validation
npm run typecheck # TypeScript compilation check
```

### Recommended Test Implementation

#### Unit Tests (Jest + React Testing Library)
```bash
# Recommended: Add these to package.json
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D jest-environment-jsdom

# Test files to create:
# src/hooks/__tests__/useDebounce.test.ts
# src/hooks/__tests__/useGrammarCheck.test.ts  
# src/components/__tests__/SuggestionPopover.test.tsx
# src/utils/__tests__/offsetMapping.test.ts
```

#### Integration Tests (Cypress)
```bash
# Recommended: Add Cypress for E2E testing
npm install -D cypress

# Test scenarios to implement:
# cypress/e2e/auth-flow.cy.ts - Complete login flow
# cypress/e2e/document-management.cy.ts - CRUD operations
# cypress/e2e/grammar-checking.cy.ts - End-to-end grammar workflow
# cypress/e2e/readability-analysis.cy.ts - Readability feature testing
```

#### API Testing (Edge Functions)
```bash
# Test Edge Functions with curl or Postman
# Create automated API tests for:
# - Grammar check endpoint with various inputs
# - Readability analysis with different text types
# - Error handling and edge cases
```

## Testing Checklist Summary

### Pre-Release Testing
- [ ] All manual feature tests pass
- [ ] Performance benchmarks met
- [ ] Cross-browser compatibility verified
- [ ] Database migrations applied
- [ ] Edge functions deployed and tested
- [ ] Environment variables configured
- [ ] Authentication working end-to-end
- [ ] No console errors during normal operation

### Post-Deployment Verification  
- [ ] Production build deploys successfully
- [ ] All environment variables correct in production
- [ ] Database connectivity confirmed
- [ ] OAuth flow working with production URLs
- [ ] Grammar checking functional with production API keys
- [ ] Performance acceptable under production conditions

---

## Support & Troubleshooting

### Log Files and Debugging
- **Browser Console**: Check for JavaScript errors
- **Network Tab**: Verify API calls to Supabase and LanguageTool
- **Supabase Logs**: Check database query logs and Edge Function logs
- **Application State**: Use React DevTools to inspect component state

### Getting Help
1. Check this testing guide first
2. Review CLAUDE.md for implementation details
3. Check CONVERSATION.md for recent changes
4. Create issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and OS version
   - Console error messages
   - Network connectivity status

---

**Last Updated**: June 16, 2025  
**Document Version**: Day 5 Complete  
**Next Update**: After Day 6 implementation (DOCX export feature)