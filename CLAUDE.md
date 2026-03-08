# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ISEKE SACCOS Management System frontend — a Next.js 15 app for managing a Savings and Credit Cooperative (SACCOS) in Tanzania. It connects to a GraphQL backend (default: `http://localhost:8080/graphql`).

## Commands

- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run lint` — run ESLint (flat config, extends next/core-web-vitals and next/typescript)
- No test framework is configured

## Architecture

### Tech Stack
- **Next.js 15** with App Router, React 19, TypeScript, Tailwind CSS v4
- **Apollo Client** for GraphQL, **NextAuth v4** for authentication (JWT/credentials)
- **Recharts** for charts, **Lucide React** + **Heroicons** for icons, **Sonner** for toasts

### Request Flow
Browser → `/api/graphql` (Next.js proxy route in `app/api/graphql/route.ts`) → backend GraphQL server. This proxy avoids CORS issues. The Apollo client (`lib/apollo-wrapper.tsx`) always hits `/api/graphql` on the same origin.

### Authentication
- NextAuth with CredentialsProvider — config in `lib/auth.ts`, route handler in `app/api/auth/[...nextauth]/route.ts`
- Login calls the backend `login` mutation directly from the server side
- JWT tokens stored in NextAuth session, attached to GraphQL requests via Apollo auth link
- Session is available client-side via `useSession()` from next-auth/react
- Auth errors in GraphQL responses trigger redirect to `/login?expired=true`

### Provider Hierarchy (app/layout.tsx)
`SessionProvider` → `ApolloWrapper` → page content + `Toaster`

### Protected Routes
Route groups use layout files that check session status via `useSession()` and redirect unauthenticated users to `/login`. Two patterns exist:
- `components/AuthLayout.tsx` — reusable wrapper with Sidebar (used by most module layouts)
- `app/dashboard/layout.tsx` — standalone layout with same auth check + Sidebar

### Key Directories
- `lib/graphql/queries.ts` — all GraphQL query/mutation definitions
- `lib/graphql/users.ts` — user-specific GraphQL operations
- `lib/types.ts` — shared TypeScript interfaces and enums
- `lib/utils.ts` — formatting helpers (currency as TZS, dates, Tanzanian phone numbers, etc.)
- `lib/error-utils.ts` — error handling utilities
- `components/ui/` — reusable UI primitives (Button, Card, StatCard, PageHeader, ErrorDisplay)
- `components/Sidebar.tsx` — main navigation sidebar
- `components/MemberSidebar.tsx` — member portal navigation

### Route Structure
- `/login` — login page
- `/dashboard` — main dashboard + accounting sub-routes (`/dashboard/accounting/*`, `/dashboard/payments/*`, `/dashboard/employers`, `/dashboard/payroll`)
- `/members`, `/savings`, `/loans`, `/branches`, `/transactions`, `/users` — CRUD modules with nested routes for detail/edit/new views
- `/member` — member self-service portal (separate from admin `/members`)

### Path Aliases
`@/*` maps to project root (configured in tsconfig.json). Use `@/lib/...`, `@/components/...`, etc.

### Environment Variables
- `NEXT_PUBLIC_GRAPHQL_URL` — backend GraphQL endpoint (default: `http://localhost:8080/graphql`)
- `GRAPHQL_BACKEND_URL` — optional override for the server-side proxy
- `NEXTAUTH_SECRET` — required for NextAuth JWT signing
- `NEXTAUTH_URL` — NextAuth base URL (default: `http://localhost:3000`)

### User Roles
ADMIN, MANAGER, CASHIER, LOAN_OFFICER, ACCOUNTANT, MEMBER — defined in `lib/types.ts` as `UserRole` enum.
