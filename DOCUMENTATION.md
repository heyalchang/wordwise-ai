# WordWise AI - Documentation

## Overview

WordWise AI is an AI-powered writing assistant specifically designed for ESL (English as Second Language) college students writing essays. This project aims to build a Grammarly clone with enhanced AI features over a 7-day development sprint.

## Project Goals

- **Primary User**: ESL college students writing academic essays
- **Core Features**: Real-time grammar checking, readability analysis, document management
- **AI Enhancement**: Context-aware suggestions, personalized recommendations, academic tone adjustments

## Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Editor**: Tiptap rich text editor
- **State Management**: Zustand with Immer

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Real-time**: Supabase Realtime subscriptions
- **API**: Supabase Edge Functions (Deno runtime)

### External Services
- **Grammar Checking**: LanguageTool API
- **AI Features**: OpenAI API (Phase 2)
- **Deployment**: Vercel (frontend), Supabase (backend)

## Development Timeline

### Phase 1: Core Features (Days 1-3)
- **Day 1**: Project setup, infrastructure, CI/CD
- **Day 2**: Authentication, database setup, dashboard
- **Day 3**: Text editor, document management, autosave

### Phase 2: Grammar & AI (Days 4-7)
- **Day 4**: Grammar checking integration, real-time underlines
- **Day 5**: Readability metrics, passive voice detection
- **Day 6**: Document export (DOCX), UI polish
- **Day 7**: Testing, demo recording, documentation

## Key Features

### Real-time Grammar Checking
- Integration with LanguageTool API via Edge Functions
- Live underlines for grammar, spelling, and style issues
- Click-to-apply suggestions with contextual alternatives

### Readability Analysis
- Flesch reading score calculation
- Passive voice percentage detection
- Live updates as user types

### Document Management
- Auto-save functionality with conflict resolution
- Document history and version tracking
- Google OAuth authentication

### Export Capabilities
- DOCX export with corrections applied
- Downloadable files via signed URLs

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build for production
npm run build
```

## Environment Variables

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
LANGUAGETOOL_API_URL=https://api.languagetool.org
OPENAI_API_KEY=your_openai_key  # Phase 2
```

## Project Structure

```
src/
  editor/           # Tiptap editor components
  store/            # Zustand state management
  components/       # Reusable UI components
  pages/            # Page-level components
  assets/           # Static assets
```

## Testing Strategy

- Unit tests for utility functions (readability calculations)
- Integration tests for Edge Functions
- End-to-end tests for critical user flows
- Manual testing checklist for grammar suggestions

## Deployment

1. **Frontend**: Automatic deployment to Vercel on push to main
2. **Backend**: Edge Functions deployed via Supabase CLI
3. **Database**: Migrations applied via Supabase dashboard

## Contributing

This is a 7-day sprint project. Follow the established conventions:
- TypeScript strict mode
- Functional components with hooks
- Tailwind for styling (no CSS modules)
- ESLint + Prettier for code quality
- Descriptive variable names considering ESL context