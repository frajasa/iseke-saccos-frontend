# ISEKE SACCO Frontend - Setup Guide

## Quick Start

```bash
# Navigate to the frontend directory
cd iseke-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) - you'll be redirected to the login page.

## Prerequisites

1. **Node.js 18+** installed on your system
2. **ISEKE Backend** running on `http://localhost:8080`
   - Make sure the GraphQL endpoint is accessible at `http://localhost:8080/graphql`
   - Test it by visiting `http://localhost:8080/graphiql` in your browser

## Environment Configuration

The `.env.local` file is already configured with:

```
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
```

If your backend runs on a different port or URL, update this variable.

## Login Credentials

Use the credentials from your backend system. Contact your administrator if you don't have login credentials.

**Example (if using default backend setup)**:
- Username: `admin`
- Password: Your configured password

## Project Structure Overview

```
iseke-frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard with stats
│   ├── members/           # Member management pages
│   ├── savings/           # Savings account pages (to be implemented)
│   ├── loans/             # Loan management pages (to be implemented)
│   ├── transactions/      # Transaction history (to be implemented)
│   ├── reports/           # Reports dashboard (to be implemented)
│   ├── branches/          # Branch management (to be implemented)
│   ├── settings/          # System settings (to be implemented)
│   ├── login/             # Login page
│   ├── layout.tsx         # Root layout with Apollo & Auth providers
│   ├── page.tsx           # Home page (redirects based on auth)
│   └── globals.css        # Global CSS with custom design system
├── components/
│   └── Sidebar.tsx        # Navigation sidebar with role-based menu
├── contexts/
│   └── AuthContext.tsx    # Authentication context with JWT management
├── lib/
│   ├── apollo-client.ts   # Apollo Client configuration
│   ├── apollo-wrapper.tsx # Apollo Provider wrapper component
│   ├── types.ts           # TypeScript type definitions
│   ├── utils.ts           # Utility functions
│   └── graphql/
│       └── queries.ts     # All GraphQL queries and mutations
├── .env.local             # Environment variables
├── package.json
└── README.md
```

## Available Pages

### Implemented
- **/** - Home page (redirects to login or dashboard)
- **/login** - Login page with beautiful UI
- **/dashboard** - Main dashboard with stats cards, alerts, recent transactions
- **/members** - Member list with search, filters, and pagination

### To Be Implemented
The following page structures are ready but need implementation:
- **/members/new** - Add new member form
- **/members/[id]** - Member details and accounts
- **/savings** - Savings accounts list
- **/savings/new** - Open new savings account
- **/savings/[id]** - Savings account details with transactions
- **/loans** - Loan accounts list
- **/loans/new** - Loan application form
- **/loans/[id]** - Loan details with repayment schedule
- **/transactions** - Transaction history with advanced filters
- **/reports** - Reports dashboard with charts
- **/branches** - Branch management
- **/settings** - System settings

## Key Features Implemented

### 1. Authentication System
- JWT-based authentication
- Auto-redirect based on auth status
- Token stored in localStorage
- Automatic token expiration handling
- Logout functionality

### 2. Dashboard
- Welcome message with user's name
- 4 statistics cards (Members, Savings, Loans, Portfolio)
- Alert notifications section
- Recent transactions table
- Responsive layout

### 3. Member Management
- Member list with pagination
- Search functionality
- Status filter (Active, Inactive, Suspended, Dormant)
- Member details view link
- Responsive table

### 4. Navigation
- Role-based sidebar navigation
- Mobile-responsive hamburger menu
- Active route highlighting
- User profile display in sidebar
- Quick logout button

### 5. Design System
- Custom Tailwind CSS configuration
- Light and dark mode support
- Beautiful color palette (Primary blue, Success green, Destructive red, etc.)
- Smooth animations
- Custom scrollbar
- Consistent spacing and typography

## User Roles & Permissions

The sidebar navigation is filtered based on user role:

| Role | Can Access |
|------|------------|
| **ADMIN** | All modules |
| **MANAGER** | Dashboard, Members, Savings, Loans, Transactions, Reports, Branches |
| **CASHIER** | Dashboard, Members, Savings, Transactions |
| **LOAN_OFFICER** | Dashboard, Members, Loans |
| **ACCOUNTANT** | Dashboard, Transactions, Reports |

## Development Workflow

### Running Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Starting Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Customization

### Changing Colors
Edit `app/globals.css` and modify the CSS variables:

```css
:root {
  --primary: #2563eb;        /* Main brand color */
  --success: #10b981;        /* Success states */
  --destructive: #ef4444;    /* Errors, warnings */
  --accent: #f59e0b;         /* Highlights */
  /* ... more colors */
}
```

### Adding New Pages
1. Create a new folder in `app/` directory
2. Add a `page.tsx` file with your component
3. Use the dashboard layout by nesting under `/dashboard`
4. Add navigation link in `components/Sidebar.tsx`

Example:
```typescript
// app/dashboard/new-module/page.tsx
"use client";

export default function NewModulePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Module</h1>
      {/* Your content */}
    </div>
  );
}
```

### Adding GraphQL Queries
Add new queries/mutations to `lib/graphql/queries.ts`:

```typescript
export const GET_SOMETHING = gql`
  query GetSomething($id: ID!) {
    something(id: $id) {
      id
      name
    }
  }
`;
```

Then use in your component:
```typescript
import { useQuery } from "@apollo/client/react";
import { GET_SOMETHING } from "@/lib/graphql/queries";

const { data, loading, error } = useQuery(GET_SOMETHING, {
  variables: { id: "123" }
});
```

## Troubleshooting

### Issue: "Network Error" when logging in
**Solution**: Verify the backend is running on http://localhost:8080

```bash
# Check if backend is running
curl http://localhost:8080/graphql
```

### Issue: Build fails with TypeScript errors
**Solution**: Ensure all imports are correct and types match the backend schema

```bash
# Clean build cache
rm -rf .next
npm run build
```

### Issue: Styles not applying
**Solution**: Restart the development server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Issue: Apollo Client errors
**Solution**: Check the browser console for detailed GraphQL errors. The error messages will indicate what went wrong.

### Issue: Token expired
**Solution**: JWT tokens expire after 24 hours. Simply log in again.

## Next Steps

To complete the full frontend implementation:

1. **Implement Member Create/Edit Pages**
   - Form validation
   - KYC information collection
   - Photo upload (if needed)

2. **Implement Savings Module**
   - Account opening form
   - Deposit/Withdrawal forms
   - Transaction history
   - Balance display

3. **Implement Loan Module**
   - Loan application workflow
   - Guarantor management
   - Collateral tracking
   - Repayment schedule view
   - Loan approval interface

4. **Implement Transaction Module**
   - Advanced filtering
   - Date range picker
   - Export functionality
   - Transaction details modal

5. **Implement Reports Module**
   - Portfolio summary with charts
   - Delinquency reports
   - Financial statements
   - PDF export

6. **Add Real-Time Features**
   - WebSocket for notifications
   - Live transaction updates
   - Dashboard auto-refresh

7. **Add PWA Support**
   - Offline capability
   - Install prompt
   - Service worker

8. **Add Tests**
   - Unit tests with Jest
   - Integration tests
   - E2E tests with Playwright

## Useful Commands

```bash
# Install a new package
npm install package-name

# Remove a package
npm uninstall package-name

# Update all packages
npm update

# Check for outdated packages
npm outdated

# Run TypeScript type check
npx tsc --noEmit

# Format code (if Prettier is configured)
npx prettier --write .
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Lucide Icons](https://lucide.dev/)

## Support

For technical support:
1. Check the browser console for errors
2. Verify backend API is accessible
3. Review GraphQL schema at http://localhost:8080/graphiql
4. Contact the development team

## License

Copyright © 2025 ISEKE SACCO. All rights reserved.
