import { ApolloError } from "@apollo/client";

export type ErrorType = "network" | "graphql" | "not-found" | "unknown";

export function classifyError(error: ApolloError | Error | unknown): ErrorType {
  if (!error) return "unknown";

  if (error instanceof ApolloError) {
    if (error.networkError) return "network";
    if (
      error.graphQLErrors?.some(
        (e) =>
          e.extensions?.code === "NOT_FOUND" ||
          e.message?.toLowerCase().includes("not found")
      )
    )
      return "not-found";
    if (error.graphQLErrors?.length) return "graphql";
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("failed to fetch") ||
      msg.includes("network") ||
      msg.includes("cannot connect") ||
      msg.includes("econnrefused") ||
      msg.includes("load failed")
    )
      return "network";
  }

  return "unknown";
}

export function isNetworkError(error: ApolloError | Error | unknown): boolean {
  return classifyError(error) === "network";
}

export function isNullListError(error: ApolloError | Error | unknown): boolean {
  if (!error) return false;

  // Check individual GraphQL errors first (most reliable)
  if (error instanceof ApolloError && error.graphQLErrors?.length) {
    return error.graphQLErrors.some((e) => {
      const msg = (e.message || "").toLowerCase();
      return (
        // Apollo/graphql-java null value error
        (msg.includes("null value") && msg.includes("non-nullable")) ||
        (msg.includes("wrongly returned a null") && msg.includes("non-nullable")) ||
        // Spring Boot GraphQL null errors
        msg.includes("cannot return null for non-nullable") ||
        // Generic null list patterns
        (msg.includes("null") && msg.includes("non-null")) ||
        // DataFetcherResult null on list
        (msg.includes("null") && msg.includes("[") && msg.includes("]"))
      );
    });
  }

  // Fallback: check top-level error message
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return (
    (msg.includes("null value") && msg.includes("non-nullable")) ||
    (msg.includes("wrongly returned a null") && msg.includes("non-nullable")) ||
    msg.includes("cannot return null for non-nullable")
  );
}

export function getUserFriendlyMessage(
  error: ApolloError | Error | unknown
): string {
  if (isNullListError(error)) {
    return "No records found.";
  }

  const type = classifyError(error);

  switch (type) {
    case "network":
      return "Unable to connect to the server. Please check your connection and try again.";
    case "not-found":
      return "The requested resource was not found.";
    case "graphql":
      if (error instanceof ApolloError && error.graphQLErrors?.length) {
        return error.graphQLErrors[0].message;
      }
      return "Something went wrong while processing your request.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}
