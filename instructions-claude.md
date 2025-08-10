# Instructions for Claude

## Hard Constraints
- ≤500 LOC per page/route file.
- Co-locate components; promote only if 3+ reuses.
- Keep functions ~40 lines max.
- Minimal dependencies; justify new libs.
- No localStorage — persist in Supabase.
- Server actions preferred for writes.
- Explain new files in a one-line comment at top.

## Coding Style
- TypeScript + Next.js App Router.
- Tailwind for layout; shadcn/ui for components.
- Use zod + react-hook-form for forms.
- Keep all helpers small & purpose-driven.