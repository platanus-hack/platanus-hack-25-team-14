import { auth } from "../../../../auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  try {
    const response = await handler.GET(request);
    return response;
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json(
      {
        error: "Authentication error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const response = await handler.POST(request);
    return response;
  } catch (error) {
    console.error("Auth POST error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error details:", {
      message: errorMessage,
      url: request.url,
      origin: request.headers.get("origin"),
      referer: request.headers.get("referer"),
    });
    return NextResponse.json(
      { error: "Authentication error", details: errorMessage },
      { status: 500 }
    );
  }
}
