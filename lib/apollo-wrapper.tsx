"use client";

import React, { useMemo } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { onError } from "@apollo/client/link/error";
import { Observable } from "@apollo/client/utilities";
import { getSession } from "next-auth/react";

function makeClient() {
  // Use the Next.js API proxy to avoid CORS issues
  // Browser requests go to /api/graphql (same origin), which proxies to the backend
  const httpLink = new HttpLink({
    uri: "/api/graphql",
    fetchOptions: { cache: "no-store" },
  });

  // Auth link that reads token from NextAuth session (primary) with localStorage fallback
  const authLink = new ApolloLink((operation, forward) => {
    return new Observable((observer) => {
      (async () => {
        try {
          let token: string | null = null;

          // Primary: get token from NextAuth session
          if (typeof window !== "undefined") {
            const session = await getSession();
            token = (session as any)?.accessToken || null;

            // Fallback: localStorage (for backward compatibility)
            if (!token) {
              token = localStorage.getItem("token");
            }
          }

          operation.setContext(
            ({ headers }: { headers?: Record<string, string> }) => ({
              headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : "",
              },
            })
          );

          const sub = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });

          return () => sub.unsubscribe();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  });

  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      let hasAuthError = false;

      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        // Handle authentication errors (including expired tokens)
        if (
          message.includes("Unauthorized") ||
          message.includes("Authentication") ||
          message.includes("Expired JWT") ||
          message.includes("expired") ||
          message.includes("Invalid token")
        ) {
          hasAuthError = true;
          return;
        }

        // Check if null error is likely caused by authentication failure
        const isNullError = message.includes(
          "has wrongly returned a null value"
        );
        const isMutation = operation.query.definitions.some(
          (def: any) =>
            def.kind === "OperationDefinition" && def.operation === "mutation"
        );

        if (isNullError && isMutation) {
          hasAuthError = true;
          return;
        }

        // Suppress GraphQL null errors for list fields (backend schema issue)
        const isNullListError =
          isNullError && message.includes("non-nullable type");

        if (isNullListError) {
          console.warn(
            `[GraphQL null warning]: Message: ${message}, Path: ${path}`
          );
        } else {
          // Use console.warn to avoid triggering Next.js dev error overlay
          console.warn(
            `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
              locations
            )}, Path: ${path}`
          );
        }
      });

      // Handle auth errors after processing all errors
      if (hasAuthError && typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login?expired=true";
      }
    }

    if (networkError) {
      // Use console.warn to avoid triggering Next.js dev error overlay
      console.warn(`[Network error]: ${networkError.message || networkError}`);
    }
  });

  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            members: {
              keyArgs: ["status", "searchTerm"],
              merge(existing, incoming, { args }) {
                if (!existing) return incoming;
                if (args?.page === 0) return incoming;
                return {
                  ...incoming,
                  content: [
                    ...(existing.content || []),
                    ...(incoming.content || []),
                  ],
                };
              },
            },
          },
        },
      },
    }),
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
        errorPolicy: "all",
      },
      query: {
        fetchPolicy: "network-only",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  const client = useMemo(() => makeClient(), []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
