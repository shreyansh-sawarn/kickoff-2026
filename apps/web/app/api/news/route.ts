import { NextResponse } from "next/server";
import { getNews } from "@wc26/api";

export async function GET(request: Request) {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=180, stale-while-revalidate=90",
  };

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 5;
    
    const data = await getNews(limit);
    return new NextResponse(
      JSON.stringify({ success: true, source: "live-api", data }),
      { status: 200, headers }
    );
  } catch (err: any) {
    console.error("Upstream News API failed:", err);
    return new NextResponse(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers }
    );
  }
}
