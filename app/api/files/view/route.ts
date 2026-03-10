import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  (process.env.GRAPHQL_BACKEND_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql")
    .replace("/graphql", "");

export async function GET(request: NextRequest) {
  try {
    const filePath = request.nextUrl.searchParams.get("path");
    if (!filePath) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
    }

    const authorization = request.headers.get("authorization") || "";

    const response = await fetch(`${BACKEND_BASE_URL}/api/files/${filePath}`, {
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "File not found" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: any) {
    console.warn("[File View Proxy] Error:", error.message);
    return NextResponse.json({ error: "Backend server is not reachable." }, { status: 502 });
  }
}
