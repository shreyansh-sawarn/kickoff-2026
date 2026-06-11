import { NextResponse } from "next/server";
import { getMatchStats } from "@wc26/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
  };

  try {
    const { id } = await params;
    const data = await getMatchStats(id);
    return new NextResponse(
      JSON.stringify({ success: true, source: "live-api", data }),
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
