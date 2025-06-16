# Cursor Comments

## 2025-06-16 – Initial sync

### Current repo snapshot
- Project root flattened; standard Vite + React + TS scaffold in place.
- Tooling: ESLint + Prettier, Tailwind, `typecheck` script, GitHub Actions (CI & Vercel deploy).
- Core dependencies already installed (Supabase, Tiptap, Zustand, etc.).
- Feature directories created but **no feature code yet** (`src/editor`, `src/store`, …).
- Dev server, lint, and type-check all pass.

### Collaboration / code-style guard-rails (from CLAUDE.md)
- Strict TypeScript; run `npm run typecheck` before push.
- ESLint + Prettier must pass (`npm run lint`).
- Functional React components with hooks only.
- Tailwind for styling; avoid CSS modules / inline styles.
- Zustand for global state; local React state otherwise.
- Edge Functions deploy via Supabase CLI.
- Document daily progress: add a dated summary in `docs/` and append to `CONVERSATION.md` (newest at top).
- Keep commits small, descriptive; ensure CI green.

### Immediate next steps (Day 2)
1. Create `src/lib/supabase.ts` with initialized client (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
2. Implement AuthContext + Google OAuth sign-in screen.
3. SQL migrations: `profiles`, `documents`, `suggestions` with RLS.
4. Scaffold `pages/dashboard.tsx` listing user docs.

## 2025-06-16 – Catch-up sync

### New code since initial snapshot
- Supabase client bootstrap (`src/lib/supabase.ts`) with typed interfaces.
- Auth flow in place: `AuthContext`, `Login`, `Dashboard`, `EditorPage` with route guards.
- Editor stack complete: `Editor.tsx` (Tiptap + toolbar) + autosave via `useDocStore` & `useDebounce`.
- Grammar pipeline delivered:
  - Edge function `supabase/functions/grammar_check` → LanguageTool → `suggestions` table.
  - Hook `useGrammarCheck` + realtime channel.
  - UI: coloured underlines & `SuggestionPopover` (apply / ignore).
- Repo hygiene: `.cursorrules` and `SUPRISES-CURSOR.md` added; CI green, Vercel preview builds.

### Immediate next tasks
1. Build `readability` edge function (+ `ReadabilityMeter` component).
2. Implement `export_docx` flow and download button.
3. Position popovers at caret, ESC-dismiss; add bulk actions.
4. Cypress E2E happy-path and add to CI.
5. Documentation: create `docs/Cursor-Day-4-Complete.md` at EOD.

---
(Add new dated sections below for future analysis.) 