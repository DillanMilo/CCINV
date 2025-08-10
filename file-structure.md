# File Structure (Tight & Minimal)

app/
  layout.tsx
  page.tsx                         # Dashboard
  invoices/
    page.tsx                       # List
    new/page.tsx                   # Editor
    [id]/page.tsx                   # Show/PDF preview
  income/page.tsx
  expenses/page.tsx
  profile/page.tsx
  api/
    export/
      income/route.ts
      expenses/route.ts

lib/
  supabase-browser.ts
  supabase-server.ts
  money.ts
  invoice-number.ts

components/
  ui/... (shadcn)
  DataTable.tsx
  FormField.tsx

types/
  schemas.ts