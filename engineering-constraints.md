# Engineering Constraints

## Golden Rules
1. Page/route files ≤ 500 LOC (skip blank lines & comments).
2. Minimize file count; co-locate components unless reused 3+ times.
3. Functions ~40 lines max.
4. No dead code or placeholder files.
5. Minimal dependencies.
6. All persistent data in Supabase (no localStorage).
7. Server actions for writes; keep client state thin.
8. Explain every new file with a one-line comment at top: `// Purpose: ...`.

## File Structure Target
- `/app` — routes + co-located components.
- `/lib` — cross-feature helpers.
- `/components` — shared UI (≥3 uses only).
- `/types` — shared schemas/types.

## Justification
Every file must justify its existence — if a feature can be inlined without breaking the LOC cap, do it.