# User Authentication and Management Implementation

## Overview
This document describes the implementation of user CRUD operations and NextAuth authentication in the ISEKE SACCO system.

## Backend Implementation

### 1. GraphQL Schema Updates
**File**: `C:\iseke-backend\src\main\resources\graphql\schema.graphqls`

#### New Mutations:
```graphql
deleteUser(id: ID!): Boolean!
activateUser(id: ID!): Boolean!
resetPassword(id: ID!, newPassword: String!): Boolean!
```

#### Updated Input Types:
- `CreateUserInput`: Changed `passwordHash` to `password`, made `role` required
- `UpdateUserInput`: Made all fields optional, added `isActive` field

### 2. UserService
**File**: `C:\iseke-backend\src\main\java\tz\co\iseke\service\UserService.java`

#### Implemented Methods:
- `findAllUsers()` - Retrieve all users
- `findUserById(UUID id)` - Get user by ID
- `updateUser(UUID id, UpdateUserInput input)` - Update user details
- `deactivateUser(UUID id)` - Soft delete (set isActive=false)
- `deleteUser(UUID id)` - Hard delete user
- `activateUser(UUID id)` - Reactivate deactivated user
- `resetPassword(UUID id, String newPassword)` - Admin password reset

#### Security Features:
- Prevents self-deactivation/deletion
- Validates email uniqueness on update
- Enforces password length (min 8 characters)
- Audit trail with updatedBy/updatedAt fields

### 3. UserResolver
**File**: `C:\iseke-backend\src\main\java\tz\co\iseke\controller\UserResolver.java`

#### Query Endpoints:
- `findAllUsers` - Requires ADMIN or MANAGER role
- `findUserById(id)` - Requires ADMIN or MANAGER role

#### Mutation Endpoints:
- `updateUser` - Requires ADMIN or MANAGER role
- `deactivateUser` - Requires ADMIN role only
- `deleteUser` - Requires ADMIN role only
- `activateUser` - Requires ADMIN role only
- `resetPassword` - Requires ADMIN role only

## Frontend Implementation

### 1. NextAuth Configuration
**File**: `C:\iseke-frontend\lib\auth.ts`

#### Features:
- Credentials provider for username/password auth
- GraphQL-based authentication
- JWT session strategy
- 24-hour session duration
- Custom callbacks for token and session handling

### 2. Authentication API Route
**File**: `C:\iseke-frontend\app\api\auth\[...nextauth]\route.ts`

Standard NextAuth handler for GET and POST requests.

### 3. Updated Apollo Client
**File**: `C:\iseke-frontend\lib\apollo-client.ts`

#### Changes:
- Integrated NextAuth session token retrieval
- Falls back to localStorage for backward compatibility
- Async token resolution in authLink

### 4. GraphQL User Queries/Mutations
**File**: `C:\iseke-frontend\lib\graphql\users.ts`

Defined queries and mutations:
- `GET_ALL_USERS`
- `GET_USER_BY_ID`
- `CREATE_USER`
- `UPDATE_USER`
- `DEACTIVATE_USER`
- `DELETE_USER`
- `ACTIVATE_USER`
- `RESET_PASSWORD`

### 5. User Management Page
**File**: `C:\iseke-frontend\app\users\page.tsx`

#### Features:
- List all users with details
- Create new users
- Edit existing users
- Toggle user active status
- Delete users (with confirmation)
- Reset passwords
- Role-based display

#### UI Components:
- User table with actions
- Create user modal
- Edit user modal
- Inline action buttons (Edit, Activate/Deactivate, Reset Password, Delete)

### 6. Updated Login Page
**File**: `C:\iseke-frontend\app\login\page.tsx`

#### Changes:
- Replaced custom AuthContext with NextAuth
- Uses `signIn()` from next-auth/react
- Session-based authentication check
- Redirect to dashboard on successful login

### 7. Updated Root Layout
**File**: `C:\iseke-frontend\app\layout.tsx`

- Replaced `AuthProvider` with `SessionProvider`
- Wraps entire app for session context

## Setup Instructions

### Backend Setup

1. **No additional configuration needed** - The backend changes are code-only

2. **Database**: Ensure your PostgreSQL database is running and schema is up to date

3. **Test the endpoints** using GraphQL Playground or any GraphQL client

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<generate-a-secret-key>
   ```

4. **Generate NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

## Usage

### Creating a User
1. Navigate to `/users`
2. Click "Create User"
3. Fill in required fields:
   - First Name
   - Last Name
   - Email
   - Password (min 8 chars)
   - Confirm Password
   - Role
4. Optional fields: Middle Name, Phone Number
5. Click "Create"

### Updating a User
1. Navigate to `/users`
2. Click the edit icon next to a user
3. Modify any fields
4. Click "Update"

### Deactivating/Activating a User
1. Navigate to `/users`
2. Click the user status icon (UserX to deactivate, UserCheck to activate)
3. User status will toggle

### Resetting a Password
1. Navigate to `/users`
2. Click the key icon
3. Enter new password (min 8 characters)
4. Confirm

### Deleting a User
1. Navigate to `/users`
2. Click the trash icon
3. Confirm deletion
4. User will be permanently removed

## Security Considerations

### Backend Security
- Role-based access control using `@PreAuthorize`
- Password encryption using BCrypt
- Prevention of self-deletion/deactivation
- Audit trails for all user modifications

### Frontend Security
- JWT-based session management
- Secure token storage
- HTTPS recommended for production
- CSRF protection via NextAuth

### Best Practices
1. **Never expose NEXTAUTH_SECRET** in version control
2. **Use HTTPS** in production
3. **Rotate secrets** periodically
4. **Implement rate limiting** on login endpoint
5. **Log authentication events** for security monitoring

## API Examples

### GraphQL Mutation Examples

#### Create User
```graphql
mutation CreateUser {
  createUser(input: {
    firstName: "John"
    lastName: "Doe"
    email: "john.doe@example.com"
    password: "securepassword123"
    confirmPassword: "securepassword123"
    role: CASHIER
  }) {
    id
    username
    email
    fullName
    role
  }
}
```

#### Update User
```graphql
mutation UpdateUser {
  updateUser(id: "user-uuid-here", input: {
    firstName: "Jane"
    email: "jane.doe@example.com"
    role: MANAGER
  }) {
    id
    fullName
    email
    role
  }
}
```

#### Delete User
```graphql
mutation DeleteUser {
  deleteUser(id: "user-uuid-here")
}
```

## Troubleshooting

### Common Issues

#### 1. "Unauthorized" errors
- Ensure the backend is running
- Check that JWT token is valid
- Verify user has correct role permissions

#### 2. Login fails
- Check GraphQL endpoint URL
- Verify credentials are correct
- Check backend logs for errors

#### 3. Session not persisting
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Ensure cookies are enabled

#### 4. Apollo Client errors
- Verify GraphQL URL is correct
- Check network connectivity
- Review browser console for errors

## Future Enhancements

1. **Email verification** for new users
2. **Password reset** via email
3. **Two-factor authentication**
4. **User activity logs**
5. **Bulk user operations**
6. **Advanced user search/filtering**
7. **User profile pictures**
8. **Last login tracking**

## Files Modified/Created

### Backend
- ✅ `UserService.java` (created)
- ✅ `UserResolver.java` (created)
- ✅ `schema.graphqls` (updated)

### Frontend
- ✅ `lib/auth.ts` (created)
- ✅ `app/api/auth/[...nextauth]/route.ts` (created)
- ✅ `lib/apollo-client.ts` (updated)
- ✅ `lib/graphql/users.ts` (created)
- ✅ `app/users/page.tsx` (created)
- ✅ `app/login/page.tsx` (updated)
- ✅ `app/layout.tsx` (updated)
- ✅ `.env.example` (created)

## Support

For issues or questions, contact your development team or refer to:
- NextAuth.js Documentation: https://next-auth.js.org
- Apollo Client Documentation: https://www.apollographql.com/docs/react
- GraphQL Documentation: https://graphql.org
