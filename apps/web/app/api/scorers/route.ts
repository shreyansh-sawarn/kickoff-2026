import { NextResponse } from "next/server";
import { getPlayers } from "@wc26/api";
import { teamProfiles } from "../../components/teamProfilesData";

export async function GET() {
  // Force hot-reload to clear cache
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
  };

  try {
    let players = await getPlayers();
    
    // Cross-reference with teamProfilesData to get real clubs and positions
    const mapPlayerInfo = (playerList: any[]) => {
      return playerList.map(p => {
        const teamProfile = teamProfiles.find(tp => tp.team_id === p.teamId);
        if (teamProfile) {
          const profilePlayer = teamProfile.key_players.find(kp => 
            kp.name.toLowerCase().includes(p.name.toLowerCase()) || 
            p.name.toLowerCase().includes(kp.name.toLowerCase())
          );
          if (profilePlayer) {
            p.club = profilePlayer.club;
            p.position = profilePlayer.position;
          }
        }
        return p;
      });
    };

    players.goals = mapPlayerInfo(players.goals);
    players.assists = mapPlayerInfo(players.assists);
    players.yellowCards = mapPlayerInfo(players.yellowCards);
    players.redCards = mapPlayerInfo(players.redCards);
    players.minutes = mapPlayerInfo(players.minutes);

    return new NextResponse(
      JSON.stringify({ success: true, source: "live-api", data: players }),
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
