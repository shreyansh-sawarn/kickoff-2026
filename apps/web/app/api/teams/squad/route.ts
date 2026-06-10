import { NextResponse } from "next/server";
import { teamProfiles } from "../../../components/teamProfilesData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.toLowerCase() || "";

  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600", // Cache response
  };

  const normalizedId = id === "turkey" || id === "türkiye" ? "tur" : id;
  const localProfile = teamProfiles.find((p) => p.team_id === normalizedId);

  return new NextResponse(
    JSON.stringify({
      success: true,
      source: "local-database",
      coach: localProfile?.coach || "TBD",
      players: localProfile?.key_players || [],
    }),
    { status: 200, headers }
  );
}
