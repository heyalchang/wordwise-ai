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

## 2025-06-16 – Day 4 progress snapshot

### Work delivered today
- `supabase/functions/grammar_check` deployed and verified via Realtime suggestions flow.
- Grammar UI polished: coloured underlines, `SuggestionPopover` with icons, Ignore / Apply actions.
- Hook `useGrammarCheck` + debounce wired into `Editor.tsx`; autosave + grammar check coexist.
- Supabase client file added with strict type defs.
- Proof-of-concept `EditorPage`, `Dashboard`, `Login` pages running behind Google OAuth; routing guards stable.
- `.cursorrules` refined (duplicate header removed) and `SUPRISES-CURSOR.md` scaffolded for human notes.

### Build & CI
- `npm run lint`, `typecheck`, and `build` all pass.
- GitHub Actions green; Vercel preview auto-deploy succeeded.

### Up-next (Day 5 agenda)
1. Implement `readability` edge function (Flesch + passive%) and `ReadabilityMeter` component.
2. `export_docx` edge function and download button in UI.
3. Popover UX: caret-positioning & ESC close.
4. Add bulk "Apply all" / "Ignore rule" to suggestions toolbar.
5. Write Cypress E2E test & CI step.
6. Create `docs/Cursor-Day-4-Complete.md` end-of-day summary.

### Bug / risk list after quick scan (to triage)
- **Column name mismatch**: Edge fn uses `start_pos`/`end_pos`, DB spec shows `start`/`end`. Align schema or code.
- **Offset drift**: We strip HTML before LanguageTool so offsets don't match Tiptap HTML → highlights mis-align when formatting added. Need mapping strategy.
- **Highlight clearing**: `unsetHighlight` not in Tiptap Highlight ext; replace with correct command.
- **RLS deletions**: Client `delete` on `suggestions` may fail under RLS. Ensure policy grants owner access or call RPC.
- **Auth loading race**: Render may flash unauthenticated state; gate routes while `loading`.
- **Autosave flush**: Debounced save not flushed on unmount; last keystroke could be lost.
- **Env var guard**: Hard throw in `supabase.ts` disrupts dev HMR; consider console warn in dev.
- **Popover position**: Currently hard-coded (100,100). Implement caret-based positioning.

---
(Add new dated sections below for future analysis.) 