import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const GRAPHQL_URL = process.env.GRAPHQL_BACKEND_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql";

interface LoginResponse {
  login: {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      fullName: string;
      role: string;
      linkedMemberId?: string;
      branch?: {
        id: string;
        branchName: string;
      };
    };
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password are required");
        }

        try {
          const response = await fetch(GRAPHQL_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                mutation Login($username: String!, $password: String!) {
                  login(username: $username, password: $password) {
                    token
                    user {
                      id
                      username
                      email
                      firstName
                      lastName
                      fullName
                      role
                      linkedMemberId
                      branch {
                        id
                        branchName
                      }
                    }
                  }
                }
              `,
              variables: {
                username: credentials.username,
                password: credentials.password,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(`Backend server responded with status ${response.status}`);
          }

          const data = await response.json();

          if (data.errors) {
            throw new Error(data.errors[0].message || "Login failed");
          }

          const loginData: LoginResponse = data.data;

          if (loginData.login && loginData.login.token) {
            return {
              id: loginData.login.user.id,
              name: loginData.login.user.fullName,
              email: loginData.login.user.email,
              username: loginData.login.user.username,
              firstName: loginData.login.user.firstName,
              lastName: loginData.login.user.lastName,
              role: loginData.login.user.role,
              linkedMemberId: loginData.login.user.linkedMemberId,
              branch: loginData.login.user.branch,
              accessToken: loginData.login.token,
            };
          }

          return null;
        } catch (error) {
          console.error("Login error:", error);

          // Better error messages for common issues
          if (error instanceof Error) {
            if (error.message.includes("ECONNREFUSED")) {
              throw new Error("Backend server is not running. Please start the backend server at " + GRAPHQL_URL);
            }
            if (error.message.includes("fetch failed")) {
              throw new Error("Cannot connect to backend server. Check if the server is running at " + GRAPHQL_URL);
            }
            throw new Error(error.message);
          }

          throw new Error("Login failed. Please try again.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.role = (user as any).role;
        token.linkedMemberId = (user as any).linkedMemberId;
        token.branch = (user as any).branch;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
        (session.user as any).role = token.role;
        (session.user as any).linkedMemberId = token.linkedMemberId;
        (session.user as any).branch = token.branch;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
};
