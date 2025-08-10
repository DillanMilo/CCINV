# Claude.md — Context & Guardrails for Creative Currents Invoicer

You are working in **Cursor** on a small, production-ready invoicing app for a solo freelancer.
Your primary goals: **fast invoice creation**, **simple income/expense tracking**, **CSV exports**, and **flawless PDF output** using the owner's template with a **centered logo**. All data must sync across devices via **Supabase**.

---

## 1) Project Awareness & Startup Ritual
- **Always open and read**: `planning.md`, `engineering-constraints.md`, `file-structure.md`, and `tasks.md` before writing code.
- **Honor constraints** from `engineering-constraints.md`: ≤500 lines per page/route, minimal files, small functions, minimal deps.
- **Never store app data in localStorage**. All persistence is in Supabase (Auth + Postgres + Storage + Realtime).
- **Cross‑device sync** relies on Supabase reads/writes and optional Realtime subscriptions for lists.
- If a task isn't listed in `tasks.md`, **add it** with a short description and today's date.

---

## 2) Tech Decisions (Do This By Default)
- **Framework:** Next.js (App Router) + TypeScript
- **UI:** Tailwind + shadcn/ui
- **Forms:** react-hook-form + zod
- **Data:** Supabase (Auth, Postgres, Storage). RLS must restrict data to `auth.user().id`.
- **PDF:** Server-side HTML → PDF (Playwright printing). Center logo, 1" margins, A4/Letter as configured in `style.md`.
- **Exports:** CSV via API routes (income/expenses by date range).
- **No Python** for MVP. Add a tiny Python worker only if we later need scheduled jobs/webhooks/heavy reporting.

---

## 3) Hard Constraints (Must Follow)
1. **≤500 LOC per page/route**. If a page nears 450 lines, pause and extract the smallest necessary component/helper (co-locate it).
2. **Minimize files**. Co‑locate one‑off components inside their route folder. Promote to `/components` only after ≥3 reuses.
3. **Small functions (~40 lines).** Prefer a couple of small helpers over a mega-function.
4. **Minimal dependencies.** Do not add libraries without an inline justification comment explaining the concrete benefit.
5. **Single source of truth:** Supabase (no localStorage).
6. **Server actions** for writes; keep client state thin.
7. **Explain any new file** with a one-line header comment: `// Purpose: <why this file exists>`.

> If a proposed refactor increases file count without measurable clarity or reuse, **do not proceed**.

---

## 4) File Structure (Tight & Minimal)
Follow `file-structure.md`. Target ~30 files total for MVP.