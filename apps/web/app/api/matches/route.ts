import { NextResponse } from "next/server";
import { getMatches } from "@wc26/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, max-age=0, must-revalidate", 
  };

  try {
    const matches = await getMatches();
    return new NextResponse(
      JSON.stringify({ success: true, source: "live-api", data: matches }),
      { status: 200, headers }
    );
  } catch (err: any) {
    console.error("Upstream API failed:", err);
    return new NextResponse(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers }
    );
  }
}
