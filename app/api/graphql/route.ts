import { NextRequest, NextResponse } from "next/server";

const BACKEND_GRAPHQL_URL =
  process.env.GRAPHQL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  "http://localhost:8080/graphql";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const authorization = request.headers.get("authorization") || "";

    const response = await fetch(BACKEND_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body,
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.warn("[GraphQL Proxy] Backend unreachable:", error.message);
    return NextResponse.json(
      {
        errors: [
          {
            message: "Backend server is not reachable. Please try again later.",
          },
        ],
      },
      { status: 502 }
    );
  }
}
