import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  (process.env.GRAPHQL_BACKEND_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql")
    .replace("/graphql", "");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const authorization = request.headers.get("authorization") || "";

    const response = await fetch(`${BACKEND_BASE_URL}/api/files/upload`, {
      method: "POST",
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: text || "Upload failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.warn("[File Upload Proxy] Error:", error.message);
    return NextResponse.json(
      { error: "Backend server is not reachable." },
      { status: 502 }
    );
  }
}
