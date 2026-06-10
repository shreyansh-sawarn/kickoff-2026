import { NextResponse } from "next/server";
import { getStadiums } from "@wc26/api";

export async function GET() {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", // Static data, cache long
  };

  try {
    const stadiums = await getStadiums();
    return new NextResponse(
      JSON.stringify({ success: true, source: "static", data: stadiums }),
      { status: 200, headers }
    );
  } catch (err: any) {
    return new NextResponse(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers }
    );
  }
}
