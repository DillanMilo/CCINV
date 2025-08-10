# Creative Currents Invoicer — Planning

**Owner:** Dillan Milosevich  
**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase (Auth + Postgres + Storage)  
**Goal:** Fast invoice creation + income/expense tracking with CSV exports, profile data (EIN/bank/tax), logo on invoices, categories for tips, and cross-device sync.

---

## Phase 1 (MVP)
- Create/send invoices as PDF with your template + centered logo.
- Profile: company name, EIN, tax reg no., bank details, address, logo upload.
- Line items: description, qty, rate, tax rate, discount.
- Income tracker: record paid invoices + ad-hoc income (with categories: "Tips", "Services", etc.).
- Expense tracker: add expenses with category, merchant, receipt upload.
- CSV export for income & expenses by date range.
- Dashboard with totals (MTD, YTD).

---

## Phase 2 (Future)
- Clients directory + default billing terms.
- Payment links (Stripe) + "Paid" auto-sync.
- Recurring invoices.
- Multi-currency.
- Category breakdown charts & reports.

---

## Constraints
- Page/route files ≤ 500 LOC.
- Minimize files & abstractions — co-locate components where possible.
- Server actions preferred; thin client state.
- No localStorage for persistence.
- Minimal dependencies: Tailwind, shadcn/ui, Supabase, zod, react-hook-form.

---

## Pages
- `/` Dashboard
- `/invoices` list | `/invoices/new` | `/invoices/[id]`
- `/income` list
- `/expenses` list
- `/profile`
- `/api/export/income` | `/api/export/expenses`

---

## Success Criteria
- Create invoice in < 60 seconds.
- Export month's data in 1 click.
- PDF matches your template within 2px margin.