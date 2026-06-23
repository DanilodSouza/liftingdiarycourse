# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## IMPORTANT: Docs-First Rule

**Before generating any code**, you MUST first check the `docs/` directory for a relevant guide. If a docs file exists that covers the feature, component, or domain you are working on, read it in full before writing a single line of code. The docs take precedence over assumptions from training data.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

- /docs/ui.md
- /docs/data-fetching.md
- /docs/data-mutations.md
- /docs/auth.md
- /docs/server-components.md

## Architecture

This is a **Next.js 16 App Router** project. Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/` — this version has breaking changes from prior releases.

- `app/layout.tsx` — root layout; sets up Geist fonts (via CSS variables `--font-geist-sans`, `--font-geist-mono`) and applies them to `<html>`
- `app/page.tsx` — home route (`/`)
- `app/globals.css` — global styles including Tailwind imports

**Styling:** Tailwind CSS v4 (PostCSS-based, configured via `postcss.config.mjs`). Import path is `@tailwindcss/postcss`, not the v3 plugin.

**TypeScript:** Strict mode enabled. Path alias `@/*` maps to the repo root.

**No Pages Router** — use only App Router conventions (`app/` directory, Server Components by default, `"use client"` for client components).
