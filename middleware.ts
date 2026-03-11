import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Permission-based route mapping: which permissions grant access to which routes
const permissionRouteMap: Record<string, string[]> = {
  VIEW_DASHBOARD: ["/dashboard"],
  VIEW_MEMBERS: ["/members"],
  CREATE_MEMBERS: ["/members"],
  VIEW_SAVINGS: ["/savings"],
  VIEW_LOANS: ["/loans"],
  VIEW_TRANSACTIONS: ["/transactions"],
  TRANSFER_ACCOUNTS: ["/transactions/transfer"],
  VIEW_ACCOUNTING: ["/dashboard/accounting"],
  VIEW_BRANCHES: ["/branches"],
  VIEW_USERS: ["/users"],
  MANAGE_ROLES: ["/dashboard/roles"],
  MANAGE_SETTINGS: ["/dashboard/settings"],
  VIEW_PAYMENTS: ["/dashboard/payments"],
  MANAGE_TRANSACTION_LIMITS: ["/dashboard/transaction-limits"],
  MANAGE_SESSION_RESTRICTIONS: ["/dashboard/session-restrictions"],
  MANAGE_BATCH_IMPORTS: ["/dashboard/batch-import"],
  VIEW_PASSBOOK: ["/dashboard/passbook"],
  VIEW_CURRENCIES: ["/dashboard/currencies"],
  MANAGE_CURRENCIES: ["/dashboard/currencies"],
  ESS_ACCESS: ["/member"],
  VIEW_AUDIT_LOGS: ["/dashboard/audit-logs"],
};

// Fallback role-based routing for users without permissions loaded yet
const roleRouteMap: Record<string, string[]> = {
  ADMIN: ["*"],
  MANAGER: ["*"],
  CASHIER: ["/dashboard", "/members", "/savings", "/transactions", "/dashboard/payments"],
  LOAN_OFFICER: ["/dashboard", "/members", "/loans", "/transactions"],
  ACCOUNTANT: ["/dashboard", "/transactions", "/dashboard/accounting", "/dashboard/currencies"],
  MEMBER: ["/member"],
};

function isRouteAllowed(role: string, permissions: string[] | undefined, path: string): boolean {
  // If permissions are available, use permission-based routing
  if (permissions && permissions.length > 0) {
    for (const perm of permissions) {
      const routes = permissionRouteMap[perm];
      if (routes) {
        for (const route of routes) {
          if (path === route || path.startsWith(route + "/")) {
            return true;
          }
        }
      }
    }
    // Also allow root paths like /dashboard for any authenticated staff
    if (path === "/dashboard" && !permissions.includes("ESS_ACCESS")) {
      return true;
    }
    return false;
  }

  // Fallback to role-based routing
  const allowedRoutes = roleRouteMap[role];
  if (!allowedRoutes) return false;
  if (allowedRoutes.includes("*")) return true;
  return allowedRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow access to login page
    if (path === "/login") {
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role as string;
    const permissions = token.permissions as string[] | undefined;

    if (role) {
      // Root page is allowed for everyone (it redirects)
      if (path === "/") {
        return NextResponse.next();
      }

      if (!isRouteAllowed(role, permissions, path)) {
        const redirectTo = role === "MEMBER" ? "/member" : "/dashboard";
        return NextResponse.redirect(new URL(redirectTo, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname === "/login") {
          return true;
        }
        return !!token;
      },
    },
  }
);

// Protect all routes except public ones
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|api/auth|api/graphql|api/files).*)",
  ],
};
