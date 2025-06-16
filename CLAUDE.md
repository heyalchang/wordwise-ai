# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WordWise AI** - An AI-powered writing assistant targeting ESL college students writing essays. This is a 7-day project to build a Grammarly clone with enhanced AI features.

**Current Status**: Planning phase - PRD and technical specifications complete, no code written yet.

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
suggestions (id bigint PK, doc_id uuid FK, start, end, type, message, replacements jsonb)
```

All tables have Row Level Security (RLS) enabled - users can only access their own data.

### Edge Functions

- `grammar_check.ts`: Calls LanguageTool API, stores suggestions
- `readability.ts`: Computes Flesch score and passive voice percentage
- `export_docx.ts`: Generates DOCX files with corrections applied

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

**Day 1**: Repository setup, Supabase project creation, CI/CD pipeline
**Day 2**: Auth flow (Google OAuth), database tables with RLS, dashboard page
**Day 3**: Tiptap editor integration, document autosave, responsive layout
**Day 4**: LanguageTool integration, real-time underlines, suggestion popovers
**Day 5**: Readability metrics, passive voice detection, live updates
**Day 6**: DOCX export functionality, UI polish, dark mode
**Day 7**: Testing, demo recording, documentation

## Key Implementation Notes

### Frontend Structure
```
src/
  editor/Editor.tsx          - Tiptap instance with grammar checking
  store/useDocStore.ts       - Zustand store for document state
  components/
    SuggestionPopover.tsx    - Grammar suggestion UI
    ReadabilityMeter.tsx     - Live readability metrics
  pages/
    dashboard.tsx            - Document list
    editor/[id].tsx          - Editor page with auth guard
```

### Grammar Checking Flow
1. User types in Tiptap editor
2. Debounced call to `grammar_check` Edge Function
3. Edge Function calls LanguageTool API
4. Suggestions stored in database
5. Frontend subscribes to Realtime updates
6. Underlines rendered via Tiptap highlight extension

### Phase 2 AI Enhancements (Days 4-7)
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

# Deploy Edge Functions
supabase functions deploy grammar_check
supabase functions deploy readability
supabase functions deploy export_docx

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

## Common Issues & Solutions

1. **CORS errors with LanguageTool**: Use Edge Function proxy
2. **Tiptap decoration performance**: Debounce grammar checks to 1000ms
3. **RLS policies blocking access**: Check auth.uid() in policies
4. **Readability calculation lag**: Compute client-side, not in Edge Function

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