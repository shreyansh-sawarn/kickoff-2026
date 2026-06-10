import { NextResponse } from "next/server";
import { getMatches } from "@wc26/api";

export async function GET() {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30", // 1 minute Cache for match schedules
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
