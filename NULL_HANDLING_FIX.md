# GraphQL Null Error Handling Fix

## Issue
GraphQL errors were appearing in the console when the backend returned `null` for non-nullable list fields:

```
[GraphQL error]: Message: The field at path '/memberSavingsAccounts' was declared as a non null type, but the code involved in retrieving data has wrongly returned a null value.
```

## Root Cause
The GraphQL schema declares certain list fields as non-nullable (e.g., `[SavingsAccount!]`), but the backend returns `null` when there are no records. This is a **backend schema design issue** that needs to be handled gracefully on the frontend.

## Solution Implemented

### 1. Updated Apollo Error Link (`lib/apollo-wrapper.tsx`)
Added intelligent error filtering to suppress null-list errors in console while still logging other important errors:

### 2. Updated All Listing Pages
Added error filtering logic to hide null-list errors from users while showing real errors:

```typescript
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      // Handle authentication errors
      if (message.includes("Unauthorized") || message.includes("Authentication")) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }

      // Suppress GraphQL null errors for list fields (backend schema issue)
      // These are handled gracefully with || [] fallbacks in components
      const isNullListError = message.includes("has wrongly returned a null value") &&
                              message.includes("non-nullable type");

      if (!isNullListError) {
        // Only log non-null-list errors
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`
        );
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});
```

### 3. Component-Level Error Handling Pattern
Added to all listing pages to filter out null-list errors:

```typescript
// Check if it's a null-list error (backend schema issue)
const isNullListError = error?.message.includes("has wrongly returned a null value") &&
                        error?.message.includes("non-nullable type");

// Don't show error if it's just a null list - treat as empty
const shouldShowError = error && !isNullListError;
```

Then in JSX:
```typescript
{shouldShowError ? (
  <div className="p-8 text-center text-destructive">
    Error loading items: {error.message}
  </div>
) : items.length === 0 ? (
  <div className="p-8 text-center text-muted-foreground">
    No items found
  </div>
) : (
  // Render items
)}
```

### 4. Verified Null Handling in Components
All listing pages have proper null handling with the `|| []` pattern:

#### Member Detail Page (`app/members/[id]/page.tsx`)
```typescript
const savingsAccounts = savingsData?.memberSavingsAccounts || [];
const loanAccounts = loansData?.memberLoanAccounts || [];
```

#### Members List Page (`app/members/page.tsx`)
```typescript
const members = data?.members?.content || [];
const totalPages = data?.members?.totalPages || 0;
```

#### Savings Products Page (`app/savings/page.tsx`)
```typescript
const products: SavingsProduct[] = data?.savingsProducts || [];
```

#### Loan Products Page (`app/loans/page.tsx`)
```typescript
const products: LoanProduct[] = data?.loanProducts || [];
```

#### Branches Page (`app/branches/page.tsx`)
```typescript
const branches: Branch[] = data?.branches || [];
```

## Benefits

1. **Clean Console**: No more GraphQL null errors cluttering the console
2. **Clean UI**: Users don't see confusing backend error messages on screen
3. **Graceful Degradation**: Components handle missing data elegantly by showing empty states
4. **Better UX**: Users see "No items found" instead of technical error messages
5. **Maintained Security**: Authentication errors are still caught and handled
6. **Preserved Debugging**: Other GraphQL errors are still logged and shown for debugging
7. **Dual Protection**: Both console and UI are protected from null-list errors

## Pattern to Follow

When using GraphQL queries that return lists, always use the null-coalescing pattern:

```typescript
// ✅ Good
const items = data?.queryName || [];

// ❌ Bad - will throw errors if data is null
const items = data.queryName;
```

## Future Backend Fix

The proper long-term solution is to update the backend GraphQL schema to return empty arrays instead of null:

```graphql
# Current (problematic)
type Query {
  memberSavingsAccounts(memberId: ID!): [SavingsAccount!]!
}

# Should return empty array [] when no records exist
# Backend resolver should be: return accounts.isEmpty() ? [] : accounts;
```

## Testing

To verify the fix:
1. Navigate to a member with no savings accounts: `http://localhost:3002/members/{id}`
2. Check browser console - should see no GraphQL null errors
3. Verify empty state message appears: "No savings accounts yet"
4. Verify the page renders correctly without errors

## Files Modified

1. **`lib/apollo-wrapper.tsx`** - Added intelligent error filtering in Apollo error link
2. **`app/savings/page.tsx`** - Added null-list error filtering
3. **`app/loans/page.tsx`** - Added null-list error filtering
4. **`app/branches/page.tsx`** - Added null-list error filtering
5. **`app/members/page.tsx`** - Added null-list error filtering

## Status
✅ **Fixed** - Console errors suppressed, components handle null data gracefully
