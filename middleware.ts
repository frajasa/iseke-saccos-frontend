import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define which roles can access which route prefixes
const roleRouteMap: Record<string, string[]> = {
  ADMIN: ["*"], // Admin can access everything
  MANAGER: ["*"], // Manager can access everything
  CASHIER: ["/dashboard", "/members", "/savings", "/transactions", "/dashboard/payments"],
  LOAN_OFFICER: ["/dashboard", "/members", "/loans", "/transactions"],
  ACCOUNTANT: ["/dashboard", "/transactions", "/dashboard/accounting"],
  MEMBER: ["/member"],
};

function isRouteAllowed(role: string, path: string): boolean {
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

    // Role-based route protection
    const role = token.role as string;
    if (role) {
      // Root page is allowed for everyone (it redirects)
      if (path === "/") {
        return NextResponse.next();
      }

      if (!isRouteAllowed(role, path)) {
        // Redirect MEMBER role to /member, others to /dashboard
        const redirectTo = role === "MEMBER" ? "/member" : "/dashboard";
        return NextResponse.redirect(new URL(redirectTo, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow login page without token
        if (req.nextUrl.pathname === "/login") {
          return true;
        }
        // All other pages require a token
        return !!token;
      },
    },
  }
);

// Protect all routes except public ones
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (NextAuth API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|api/auth|api/graphql|api/files).*)",
  ],
};
