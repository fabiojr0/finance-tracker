# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npm start        # Start production server
```

No test framework is configured.

## Architecture

Next.js 15 App Router + TypeScript + Tailwind CSS + Supabase (PostgreSQL + Auth).

**App is in Portuguese (pt-BR).** Route names, UI text, types, and constants use Portuguese.

### Routing (App Router)

- `app/(auth)/` — Login (`login/`) and signup (`cadastro/`) with a centered layout
- `app/(dashboard)/` — Protected routes: `dashboard/`, `transacoes/`, `categorias/`, `calendario/`, `relatorios/`, `configuracoes/` with sidebar+header layout
- `app/api/` — API routes: `auth/callback`, `parse-file` (CSV/PDF parsing), `import-statement` (AI-powered via OpenRouter/DeepSeek)

### State Management

Global state lives in `lib/contexts/finance-context.tsx` (`FinanceProvider`), providing CRUD for transactions and categories via `useFinance()` hook. Wrapped at the dashboard layout level. Modal state is managed via dedicated context providers (`TransactionModalProvider`, `CategoryModalProvider`).

### Supabase Clients

Two Supabase client factories:
- `lib/supabase/client.ts` — Browser client (singleton)
- `lib/supabase/server.ts` — Server-side client (per-request, cookie-based)

### Component Organization

- `components/ui/` — Base primitives (Button, Card, Input, Modal, DateInput, CategorySelect)
- `components/{feature}/` — Domain components (dashboard/, transactions/, categories/, calendar/)
- `components/shared/` — Cross-feature (EmptyState, Skeleton, PeriodSelector, GlobalSearch)
- `components/layout/` — Header, Sidebar

### Key Patterns

- **Forms**: React Hook Form + Zod (`lib/utils/validation.ts` for schemas, `@hookform/resolvers` for integration)
- **Styling**: Tailwind with CSS variables for theming; dark theme default; `cn()` utility from `lib/utils/cn.ts` (clsx + tailwind-merge)
- **Path alias**: `@/*` maps to project root
- **Types**: `types/database.ts` (auto-generated Supabase types), `types/transaction.ts`, `types/category.ts`
- **Transaction types**: `'receita' | 'despesa' | 'investimento' | 'transferencia'`
- **Transaction status**: `'pendente' | 'concluida' | 'cancelada'`

### Database Tables

- `profiles` — user_id, full_name, avatar_url, currency
- `categories` — id, user_id, name, type, icon, color, is_active
- `transactions` — id, user_id, category_id, type, amount, description, date, status, tags, notes

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENROUTER_API_KEY          # For AI statement import
```
