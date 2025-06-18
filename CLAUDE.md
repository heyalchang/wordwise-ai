# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

#1 Rule:  You never go Leroy Jenkins.  That's not who you are.

#2  Staff engineer mindset. Clarity over rush to be clever.

## Project Overview

**WordWise AI** - An AI-powered writing assistant targeting ESL college students writing essays. This is a 7-day project to build a Grammarly clone with enhanced AI features.

**Current Status**: Day 4 complete - Full grammar checking system implemented with real-time suggestions, highlighting, and interactive popovers. Ready for Day 5 (readability metrics).

## Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Tiptap editor
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **External APIs**: LanguageTool (grammar checking), OpenAI (Phase 2 AI enhancements)
- **Deployment**: Vercel (frontend), Supabase (backend)

### Database Schema

```sql
-- profiles: User profiles with preferences
profiles (id uuid PK, display_name, locale, writing_goals jsonb)

-- documents: User documents with autosave
documents (id uuid PK, owner uuid FK, title, content, readability jsonb)

-- suggestions: Grammar/style suggestions from LanguageTool
suggestions (id bigint PK, doc_id uuid FK, start_pos, end_pos, type, message, replacements jsonb)
```

All tables have Row Level Security (RLS) enabled - users can only access their own data.

### Edge Functions

- `grammar_check.ts`: ✅ IMPLEMENTED - Calls LanguageTool API, handles offset mapping, stores suggestions
- `readability.ts`: ✅ IMPLEMENTED - Computes Flesch score and passive voice percentage
- `export_docx.ts`: 🔄 PLANNED - Generates DOCX files with corrections applied

## Development Setup

```bash
# Initialize project
npm create vite@latest wordwise-ai -- --template react-ts
cd wordwise-ai
npm install

# Install core dependencies
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-highlight
npm install @supabase/supabase-js zustand immer
npm install @headlessui/react react-router-dom
npm install -D @types/react @types/node tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p

# Development
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Implementation Timeline

**Day 1**: ✅ Repository setup, Supabase project creation, CI/CD pipeline
**Day 2**: ✅ Auth flow (Google OAuth), database tables with RLS, dashboard page
**Day 3**: ✅ Tiptap editor integration, document autosave, responsive layout
**Day 4**: ✅ LanguageTool integration, real-time underlines, suggestion popovers
**Day 5**: ✅ Readability metrics, passive voice detection, live updates, critical bug fixes
**Day 6**: 🔄 DOCX export functionality, UI polish, dark mode
**Day 7**: 🔄 Testing, demo recording, documentation

## Current Implementation Status (Day 5 Complete)

### ✅ Completed Features
- **Authentication System**: Google OAuth with Supabase Auth
- **Document Management**: Create, save, load documents with real-time sync
- **Rich Text Editor**: Tiptap integration with autosave functionality
- **Grammar Checking**: Full LanguageTool integration with Edge Functions + critical bug fixes
- **Real-time Suggestions**: Live grammar checking with visual highlighting (accurate positioning)
- **Interactive Corrections**: Click-to-apply suggestion popovers
- **Database Integration**: PostgreSQL with RLS, real-time subscriptions (schema corrected)
- **Readability Analysis**: Flesch Reading Ease scores with live progress gauges
- **Passive Voice Detection**: Real-time percentage tracking with ESL-friendly tips
- **HTML-Text Offset Mapping**: Accurate grammar highlighting with formatted content

### 🔄 In Progress / Planned
- **Export Functionality**: DOCX export with applied corrections
- **UI Enhancements**: Dark mode, mobile optimization, caret-based popovers
- **Advanced AI**: OpenAI integration for context-aware suggestions
- **Polish Items**: Auth loading states, autosave flush, environment error handling

## Key Implementation Notes

### Frontend Structure
```
src/
  editor/Editor.tsx          - ✅ Tiptap instance with grammar checking
  store/useDocStore.ts       - ✅ Zustand store for document state
  hooks/
    useGrammarCheck.ts       - ✅ Real-time grammar checking hook (with offset mapping)
    useReadabilityCheck.ts   - ✅ Debounced readability analysis hook
    useDebounce.ts           - ✅ Debounced input handling + value debouncing
  components/
    SuggestionPopover.tsx    - ✅ Grammar suggestion UI
    ReadabilityMeter.tsx     - ✅ Live readability metrics with progress gauges
  utils/
    offsetMapping.ts         - ✅ HTML-to-text position mapping utilities
  pages/
    Dashboard.tsx            - ✅ Document list
    EditorPage.tsx           - ✅ Editor page with auth guard
    Login.tsx                - ✅ Authentication page
  contexts/
    AuthContext.tsx          - ✅ Authentication context
```

### Grammar Checking Flow
1. User types in Tiptap editor
2. Debounced call to `grammar_check` Edge Function
3. Edge Function calls LanguageTool API
4. Suggestions stored in database
5. Frontend subscribes to Realtime updates
6. Underlines rendered via Tiptap highlight extension

### Phase 2 AI Enhancements (Days 5-7)
- Context-aware writing suggestions using OpenAI
- Personalized style recommendations based on user goals
- Essay structure analysis for ESL students
- Vocabulary enhancement suggestions
- Academic tone adjustments

## Testing Strategy

- Unit tests for readability calculations
- Integration tests for Edge Functions
- E2E tests with Cypress for critical user flows
- Manual testing checklist for grammar suggestions

## Deployment

1. Frontend deploys to Vercel automatically on push to main
2. Edge Functions deploy via Supabase CLI
3. Environment variables required:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `LANGUAGETOOL_API_URL`
   - `OPENAI_API_KEY` (Phase 2)

## Common Commands

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Type checking
npm run typecheck

# Build for production
npm run build

# Deploy implemented Edge Functions
supabase functions deploy grammar_check

# Deploy planned Edge Functions (not yet implemented)
# supabase functions deploy readability
# supabase functions deploy export_docx

# Run migrations
supabase db push
```

## Code Style Conventions

- Use TypeScript strict mode
- Functional components with hooks
- Zustand for global state, React state for local
- Tailwind for styling (no CSS modules)
- ESLint + Prettier for formatting
- Descriptive variable names for ESL context

## Critical Bug Fixes (Day 5)

### ✅ Database Schema Mismatch (RESOLVED)
- **Issue**: Code used `start_pos`/`end_pos` but database schema used `start`/`end`
- **Fix**: Updated all interfaces, components, and Edge Functions to use correct column names
- **Impact**: Grammar suggestions now work instead of causing database INSERT errors

### ✅ Tiptap Highlight Clearing API (RESOLVED)
- **Issue**: `unsetHighlight()` doesn't exist in Tiptap Highlight extension
- **Fix**: Implemented proper ProseMirror transaction-based clearing that only removes highlight marks
- **Impact**: No more JavaScript errors, preserves user formatting (bold, italic, etc.)

### ✅ HTML-to-Text Offset Mapping (RESOLVED)
- **Issue**: LanguageTool receives plain text but offsets applied to HTML content with formatting
- **Fix**: Created comprehensive offset mapping utilities that translate between HTML and text positions
- **Impact**: Grammar highlights now position correctly even with bold/italic formatting

## Common Issues & Solutions

1. **CORS errors with LanguageTool**: Use Edge Function proxy ✅
2. **Tiptap decoration performance**: Debounce grammar checks to 2000ms ✅
3. **RLS policies blocking access**: Check auth.uid() in policies ✅
4. **Readability calculation lag**: Compute server-side with 3s debouncing ✅
5. **Grammar highlight offset drift**: Use HTML-to-text mapping utilities ✅

## Key Files to Check

- `/docs/PRD - wordwise.md` - Complete product requirements
- `/docs/technical spec.txt` - Detailed technical implementation plan
- Database schema and RLS policies in technical spec
- 7-day execution timeline with daily deliverables

## AI Assistant Guidelines

When implementing features:
1. Follow the ESL student user stories from the technical spec
2. Prioritize real-time feedback and clear UI for non-native speakers
3. Keep language simple in UI copy
4. Test with long-form essay content (500-2000 words)
5. Ensure grammar suggestions are contextual, not just rule-based

## Technical Verification (Day 4)

### Working Features
✅ **Authentication**: Google OAuth login/logout  
✅ **Document CRUD**: Create, save, load, delete documents  
✅ **Real-time Editor**: Tiptap with autosave every 2 seconds  
✅ **Grammar Checking**: LanguageTool API via Edge Function  
✅ **Visual Highlighting**: Color-coded error types in editor  
✅ **Suggestion Popovers**: Interactive correction interface  
✅ **Database Persistence**: All data stored in Supabase with RLS  

### Development Commands
```bash
npm run dev          # ✅ Starts dev server on localhost:5173
npm run typecheck    # ✅ TypeScript compilation check
npm run lint         # ✅ ESLint validation (1 minor warning)
npm run build        # ✅ Production build successful
```

### Environment Variables Required
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key  
- `SUPABASE_SERVICE_ROLE_KEY` - For Edge Function database access
- `LANGUAGETOOL_API_URL` - Optional, defaults to public API

## Memories

- Keep documentation up-to-date. CLAUDE.md is for claude and machines. DOCUMENTATION.md is for humans.
- After each conversation turn, write to CONVERSATION.md: the request and a couple sentences on what we did and what happened.
- When something surprising happens, write into Surprises.md what we expected to happen and what we discovered. This will be used for long-term learning so we work even more efficiently in the future.
- As each day's work is completed, document that it is complete and what we did with a document in the docs folder
- Nothing is deleted from the CONVERSATION.md log.  New entries are entered on top and the older entries are pushed down.
- commit after any major changes.  absolutely after a day's work is done.
- There is another developer working in this directory. Claude should never modify these files: .cursorrules, CURSOR_COMMENTS.md, SURPRISES-CURSOR.md