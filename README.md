# ISEKE SACCOS Management System - Frontend

A beautiful, responsive Next.js 15.5.5 frontend for the ISEKE SACCOS Management System, built with TypeScript and Tailwind CSS.

## Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Dashboard** - Overview with stats, alerts, and recent transactions
- **Member Management** - Registration, profiles, search, and status tracking
- **Savings Management** - Account opening, deposits, withdrawals, balance tracking
- **Loan Management** - Applications, approvals, disbursements, repayment schedules
- **Transaction History** - Comprehensive transaction tracking with filtering
- **Reporting** - Portfolio summary, delinquency, financial statements
- **Branch Management** - Multi-branch support with filtering

## Tech Stack

- Next.js 15.5.5 with App Router
- TypeScript
- Tailwind CSS
- Apollo Client (GraphQL)
- Lucide React (Icons)

## Getting Started

### Prerequisites

- Node.js 18+
- Backend running on http://localhost:8080

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
```

## Project Structure

```
iseke-frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard & protected routes
│   ├── members/           # Member management
│   ├── savings/           # Savings accounts
│   ├── loans/             # Loan management
│   ├── transactions/      # Transaction history
│   ├── reports/           # Reports dashboard
│   ├── branches/          # Branch management
│   └── login/             # Authentication
├── components/            # Reusable UI components
├── contexts/             # React contexts (Auth)
├── lib/                  # Utilities & configuration
│   ├── apollo-client.ts  # GraphQL client
│   ├── types.ts          # TypeScript types
│   ├── utils.ts          # Helper functions
│   └── graphql/          # GraphQL queries
└── .env.local            # Environment variables
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## User Roles

| Role | Access |
|------|--------|
| ADMIN | Full system access |
| MANAGER | All modules except system settings |
| CASHIER | Members, Savings, Transactions |
| LOAN_OFFICER | Members, Loans |
| ACCOUNTANT | Dashboard, Transactions, Reports |

## Key Features

### Responsive Design
- Mobile-first approach
- Hamburger menu on mobile
- Responsive tables with horizontal scroll
- Touch-friendly interface

### Beautiful UI
- Custom Tailwind design system
- Smooth animations and transitions
- Consistent color palette
- Dark mode support (prefers-color-scheme)

### Performance
- Server Components where possible
- Code splitting
- Apollo Client caching
- Optimized images

### Security
- JWT token management
- Automatic token expiration
- Role-based route protection
- Secure API communication

## GraphQL Integration

All API calls use GraphQL via Apollo Client:

```typescript
import { useQuery } from "@apollo/client";
import { GET_MEMBERS } from "@/lib/graphql/queries";

const { data, loading, error } = useQuery(GET_MEMBERS);
```

## Utility Functions

Located in `lib/utils.ts`:

- `formatCurrency()` - Format TZS amounts
- `formatDate()` - Date formatting
- `formatPhoneNumber()` - Tanzanian phone numbers
- `calculateAge()` - Calculate age from DOB
- `getStatusColor()` - Status badge colors
- `cn()` - Merge Tailwind classes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Copyright © 2025 ISEKE SACCOS. All rights reserved.
# iseke-saccos-frontend
