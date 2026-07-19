import { Team, Match, Group, Player, Stadium, PlayerLeaderboards, CleanSheetEntry } from "@wc26/types";
import { TEAMS, STADIUMS } from "./staticData";

export * from "./staticData";

const stadiumNames: Record<string, { name: string; city: string; country: "USA" | "Mexico" | "Canada"; capacity: number }> = {
  "1": { name: "MetLife Stadium", city: "East Rutherford (NY/NJ)", country: "USA", capacity: 82500 },
  "2": { name: "Estadio Azteca", city: "Mexico City", country: "Mexico", capacity: 87523 },
  "3": { name: "BC Place", city: "Vancouver", country: "Canada", capacity: 54500 },
  "4": { name: "SoFi Stadium", city: "Inglewood (LA)", country: "USA", capacity: 70240 },
  "5": { name: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA", capacity: 71000 },
  "6": { name: "Hard Rock Stadium", city: "Miami", country: "USA", capacity: 64767 },
  "7": { name: "BMO Field", city: "Toronto", country: "Canada", capacity: 45736 },
  "8": { name: "Estadio BBVA", city: "Monterrey", country: "Mexico", capacity: 53500 },
  "9": { name: "Estadio Akron", city: "Guadalajara", country: "Mexico", capacity: 48071 },
  "10": { name: "Lumen Field", city: "Seattle", country: "USA", capacity: 69000 },
  "11": { name: "Levi's Stadium", city: "Santa Clara (SF)", country: "USA", capacity: 68500 },
  "12": { name: "Gillette Stadium", city: "Foxborough (Boston)", country: "USA", capacity: 65878 },
  "13": { name: "Lincoln Financial Field", city: "Philadelphia", country: "USA", capacity: 69796 },
  "14": { name: "NRG Stadium", city: "Houston", country: "USA", capacity: 72220 },
  "15": { name: "AT&T Stadium", city: "Arlington (Dallas)", country: "USA", capacity: 80000 },
  "16": { name: "Arrowhead Stadium", city: "Kansas City", country: "USA", capacity: 76416 }
};

const confMap: Record<string, string> = {
  USA: "CONCACAF", MEX: "CONCACAF", CAN: "CONCACAF",
  PAN: "CONCACAF", JAM: "CONCACAF", HON: "CONCACAF", SLV: "CONCACAF", CRC: "CONCACAF", CUW: "CONCACAF", HAI: "CONCACAF",
  ARG: "CONMEBOL", BRA: "CONMEBOL", COL: "CONMEBOL", URU: "CONMEBOL", ECU: "CONMEBOL", PAR: "CONMEBOL", CHI: "CONMEBOL", VEN: "CONMEBOL", BOL: "CONMEBOL", PER: "CONMEBOL",
  ENG: "UEFA", SCO: "UEFA", WAL: "UEFA", NIR: "UEFA", FRA: "UEFA", GER: "UEFA", ESP: "UEFA", ITA: "UEFA", POR: "UEFA", NED: "UEFA", BEL: "UEFA", CRO: "UEFA", SUI: "UEFA", DEN: "UEFA", AUT: "UEFA", TUR: "UEFA", UKR: "UEFA", POL: "UEFA", CZE: "UEFA", NOR: "UEFA", BIH: "UEFA",
  SEN: "CAF", MAR: "CAF", TUN: "CAF", NGA: "CAF", GHA: "CAF", CMR: "CAF", EGY: "CAF", RSA: "CAF", CIV: "CAF", CPV: "CAF", ALG: "CAF", COD: "CAF",
  JPN: "AFC", KOR: "AFC", KSA: "AFC", AUS: "AFC", IRN: "AFC", IRQ: "AFC", QAT: "AFC", UAE: "AFC", JOR: "AFC", UZB: "AFC",
  NZL: "OFC"
};

const getConfederation = (code: string) => confMap[code.toUpperCase()] || "UEFA";

export const mapTeam = (fifaCode: string, fallbackName: string, fallbackFlag: string, group: string = "TBD"): Team => {
  return {
    id: fifaCode.toLowerCase(),
    name: fallbackName === "Czech Republic" ? "Czechia" : fallbackName,
    code: fifaCode,
    flag: fallbackFlag.toLowerCase(),
    confederation: getConfederation(fifaCode),
    group
  };
};

/**
 * Get all 48 teams
 */
export async function getTeams(): Promise<Team[]> {
  return TEAMS;
}

/**
 * Get a specific team by its ID
 */
export async function getTeamById(id: string): Promise<Team | undefined> {
  const teams = await getTeams();
  return teams.find((t) => t.id.toLowerCase() === id.toLowerCase());
}

/**
 * Get all matches (completed, live, and upcoming)
 */
export async function getMatches(): Promise<Match[]> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/matches", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch matches from API proxy:", e);
    }
    return [];
  }

  const baseUrl = (process as any).env.WC26_API_BASE_URL || "https://kickoff-2026-api.fly.dev/api/v1";

  try {
    const res = await fetch(`${baseUrl}/matches`, { cache: "no-store" });

    if (!res.ok) throw new Error("API error");
    
    const json = await res.json();
    const rawGames = json.matches || [];

    const teams = await getTeams();
    const teamMap = new Map();
    teams.forEach(t => teamMap.set(t.code.toUpperCase(), t));

    return rawGames.map((m: any) => {
      const home = teamMap.get(m.home_team_code?.toUpperCase());
      const away = teamMap.get(m.away_team_code?.toUpperCase());
      
      const stadiumInfo = Object.values(stadiumNames).find(s => s.name === m.venue) || { name: m.venue || "Unknown Stadium", city: "Unknown City" };

      const status = m.status === "finished" ? "completed" : (m.status === "scheduled" ? "upcoming" : m.status);
      const matchDatetime = m.kickoff_utc.endsWith('Z') ? m.kickoff_utc : `${m.kickoff_utc.replace(' ', 'T')}Z`;

      const rawEvents = (m.events || []).map((e: any) => {
        let type = e.type;
        let isPenalty = false;
        if (type === "penalty") {
          type = "goal";
          isPenalty = true;
        }
        if (type === "yellow") type = "card_yellow";
        if (type === "red" || type === "second_yellow") type = "card_red";
        if (type === "sub_in" || type === "sub_out" || type === "sub") type = "substitution";

        let extraData: any = {};
        try {
          if (e.extra_info) {
            if (e.extra_info.startsWith("{")) {
              extraData = JSON.parse(e.extra_info);
            } else {
              extraData.playerTwo = e.extra_info;
            }
          }
        } catch (err) {}

        return {
          id: e.id ? e.id.toString() : Math.random().toString(),
          type,
          minute: e.minute,
          teamId: e.team_code ? e.team_code.toLowerCase() : "tbd",
          playerOne: e.player_name || "Unknown Player",
          playerTwo: extraData.playerTwo || undefined,
          score: extraData.score || undefined,
          isPenalty: isPenalty || extraData.isPenalty || false,
          isShootoutPenalty: extraData.isShootoutPenalty || (type === "shootout_penalty") || false,
          didScore: extraData.didScore !== undefined ? extraData.didScore : (type === "shootout_penalty" ? true : undefined),
          shotNumber: extraData.shotNumber || undefined,
          clockDisplay: extraData.clockDisplay || undefined,
          isPenaltyMiss: extraData.isPenaltyMiss || (type === "penalty_miss") || false,
          detail: extraData.detail || undefined
        };
      });

      const assists = rawEvents.filter((e: any) => e.type === "assist");
      const nonAssists = rawEvents.filter((e: any) => e.type !== "assist");

      assists.forEach((assist: any) => {
        const matchingGoal = nonAssists.find((goal: any) => 
          goal.type === "goal" && 
          goal.minute === assist.minute && 
          goal.teamId === assist.teamId &&
          !goal.playerTwo
        );
        if (matchingGoal) {
          matchingGoal.playerTwo = assist.playerOne;
        } else {
          const anyGoal = nonAssists.find((goal: any) => 
            goal.type === "goal" && 
            goal.minute === assist.minute && 
            goal.teamId === assist.teamId
          );
          if (anyGoal) {
            anyGoal.playerTwo = assist.playerOne;
          }
        }
      });

      const matchEvents = nonAssists.sort((a: any, b: any) => {
        const isShootoutA = a.isShootoutPenalty || a.type === "shootout_penalty";
        const isShootoutB = b.isShootoutPenalty || b.type === "shootout_penalty";
        if (isShootoutA && !isShootoutB) return 1;
        if (!isShootoutA && isShootoutB) return -1;
        if (isShootoutA && isShootoutB) {
          const shotA = a.shotNumber || 0;
          const shotB = b.shotNumber || 0;
          if (shotA !== shotB) return shotA - shotB;
          const aIsHome = a.teamId === m.home_team_code?.toLowerCase();
          const bIsHome = b.teamId === m.home_team_code?.toLowerCase();
          if (aIsHome && !bIsHome) return -1;
          if (!aIsHome && bIsHome) return 1;
          return 0;
        }
        return a.minute - b.minute;
      });

      const hasShootout = matchEvents.some((e: any) => e.isShootoutPenalty);
      let homePenaltyScore = matchEvents.filter((e: any) => e.isShootoutPenalty && e.didScore && e.teamId === m.home_team_code?.toLowerCase()).length;
      let awayPenaltyScore = matchEvents.filter((e: any) => e.isShootoutPenalty && e.didScore && e.teamId === m.away_team_code?.toLowerCase()).length;
      

      let mappedGroup = m.group_name;
      if (m.stage === "knockout" || ["r32", "r16", "qf", "sf", "final", "3rd"].includes(m.stage)) {
        const idStr = m.id.toLowerCase();
        if (idStr.includes("match_103") || idStr.includes("third") || idStr.includes("loser_match_101") || (m.stage?.toLowerCase() === "final" && m.venue?.includes("Miami"))) {
          mappedGroup = "3rd";
        } else {
          const stageVal = m.stage?.toLowerCase();
          if (["r32", "r16", "qf", "sf", "final", "3rd"].includes(stageVal)) {
            mappedGroup = stageVal;
          } else {
            if (idStr.includes("match_104") || idStr.includes("final") || (idStr.includes("winner_match_101"))) mappedGroup = "final";
            else if (idStr.includes("match_101") || idStr.includes("match_102") || idStr.includes("winner_match_97") || idStr.includes("winner_match_98") || idStr.includes("winner_match_99") || idStr.includes("winner_match_100") || idStr.includes("sf")) mappedGroup = "sf";
            else if (idStr.includes("match_97") || idStr.includes("match_98") || idStr.includes("match_99") || idStr.includes("match_100") || idStr.includes("winner_match_89") || idStr.includes("winner_match_90") || idStr.includes("winner_match_91") || idStr.includes("winner_match_92") || idStr.includes("winner_match_93") || idStr.includes("winner_match_94") || idStr.includes("winner_match_95") || idStr.includes("winner_match_96") || idStr.includes("qf")) mappedGroup = "qf";
            else if (idStr.includes("match_89") || idStr.includes("match_90") || idStr.includes("match_91") || idStr.includes("match_92") || idStr.includes("match_93") || idStr.includes("match_94") || idStr.includes("match_95") || idStr.includes("match_96") || idStr.includes("winner_match_7") || idStr.includes("winner_match_8") || idStr.includes("r16")) mappedGroup = "r16";
            else mappedGroup = "r32";
          }
        }
      }

      let minute = undefined;
      if (status === "live") {
        const diffMs = Date.now() - new Date(matchDatetime).getTime();
        minute = Math.min(90, Math.max(1, Math.floor(diffMs / 60000)));
      }

      return {
        id: m.id.startsWith("unknown_") ? m.id.replace("unknown_", "") : m.id,
        homeTeam: home || { id: "tbd", name: m.home_team || "TBD", code: "TBD", flag: "🏳️", confederation: "TBD", group: "TBD" },
        awayTeam: away || { id: "tbd", name: m.away_team || "TBD", code: "TBD", flag: "🏳️", confederation: "TBD", group: "TBD" },
        status,
        homeScore: m.home_score,
        awayScore: m.away_score,
        homePenaltyScore: hasShootout ? homePenaltyScore : undefined,
        awayPenaltyScore: hasShootout ? awayPenaltyScore : undefined,
        clock: m.clock,
        datetime: matchDatetime,
        minute,
        group: mappedGroup,
        stadium: stadiumInfo.name,
        city: stadiumInfo.city,
        scorers: [],
        events: matchEvents,
        home_formation: m.home_formation || undefined,
        away_formation: m.away_formation || undefined
      };
    });
  } catch (e) {
    console.warn("Failed to fetch games from Python API:", e);
    return [];
  }
}

/**
 * Get a specific match by ID
 */
export async function getMatchById(id: string): Promise<Match | undefined> {
  const matches = await getMatches();
  return matches.find((m) => m.id === id);
}

export async function getMatchesByGroup(group: string) {
  const matches = await getMatches();
  return matches.filter((m: any) => m.group === group);
}

export async function getNews(limit: number = 5) {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/news?limit=${limit}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch news via local API proxy, falling back:", e);
    }
  }

  const baseUrl = (process as any).env.WC26_API_BASE_URL || "https://kickoff-2026-api.fly.dev/api/v1";
  try {
    const res = await fetch(`${baseUrl}/news?limit=${limit}`);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) {
    console.warn("Failed to fetch news from Python API:", e);
    return [];
  }
}

/**
 * Get standings for all groups
 */
export async function getStandings(): Promise<Group[]> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/standings");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch standings from API proxy:", e);
    }
    return [];
  }

  const baseUrl = (process as any).env.WC26_API_BASE_URL || "https://kickoff-2026-api.fly.dev/api/v1";

  try {
    const res = await fetch(`${baseUrl}/standings`);

    if (!res.ok) throw new Error("API error");
    
    const json = await res.json();
    const rawGroups = json.groups || {};

    const teams = await getTeams();
    const teamMap = new Map();
    teams.forEach(t => teamMap.set(t.code.toUpperCase(), t));

    const mappedGroups = Object.keys(rawGroups).map(groupName => {
      const standings = rawGroups[groupName].map((gt: any) => {
        const team = teamMap.get(gt.team_code?.toUpperCase()) || {
          id: "unknown",
          name: gt.team_name || "Unknown Team",
          code: gt.team_code || "UNK",
          flag: "🏳️",
        };
        return {
          teamId: team.id,
          teamName: team.name,
          teamCode: team.code,
          teamFlag: team.flag,
          played: gt.played || 0,
          won: gt.won || 0,
          drawn: gt.drawn || 0,
          lost: gt.lost || 0,
          goalsFor: gt.goals_for || 0,
          goalsAgainst: gt.goals_against || 0,
          goalDifference: gt.goal_diff || 0,
          points: gt.points || 0,
          form: [],
        };
      });

      return {
        name: groupName,
        standings,
      };
    });

    mappedGroups.sort((a: any, b: any) => a.name.localeCompare(b.name));
    return mappedGroups;
  } catch (e) {
    console.warn("Failed to fetch standings from Python API:", e);
    return [];
  }
}

/**
 * Get top players stats leaderboard
 */
export async function getPlayers(): Promise<PlayerLeaderboards> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/scorers");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch players from API proxy:", e);
    }
    return { goals: [], assists: [], yellowCards: [], redCards: [], minutes: [], cleanSheets: [] };
  }

  const baseUrl = (process as any).env.WC26_API_BASE_URL || "https://kickoff-2026-api.fly.dev/api/v1";
  
  const fetchList = async (endpoint: string, key: string, statProp: string): Promise<Player[]> => {
    try {
      const res = await fetch(`${baseUrl}/${endpoint}`, { cache: "no-store" } as any);
      if (res.ok) {
        const json = await res.json();
        return (json[key] || []).map((p: any, idx: number) => ({
          id: `p-${idx}-${p.team_code}`,
          name: p.player_name,
          teamId: p.team_code.toLowerCase(),
          teamName: TEAMS.find(t => t.code === p.team_code)?.name || p.team_code,
          position: statProp === 'goals' ? "FWD" : "MID" as const,
          club: "National Team",
          age: 26,
          tournamentStats: {
            goals: statProp === 'goals' ? p.count : 0,
            assists: statProp === 'assists' ? p.count : 0,
            yellowCards: statProp === 'yellowCards' ? p.count : 0,
            redCards: statProp === 'redCards' ? p.count : 0,
            minutesPlayed: statProp === 'minutesPlayed' ? p.count : 0
          }
        }));
      }
    } catch (e) {
      console.warn(`Failed to fetch ${endpoint} from python api:`, e);
    }
    return [];
  };

  let goals = await fetchList('scorers', 'scorers', 'goals');
  let assists = await fetchList('assists', 'assists', 'assists');
  let yellowCards = await fetchList('yellow-cards', 'yellow_cards', 'yellowCards');
  let redCards = await fetchList('red-cards', 'red_cards', 'redCards');
  let minutes = await fetchList('minutes', 'minutes', 'minutesPlayed');

  // Derive clean sheets and assist counts from matches
  let cleanSheets: CleanSheetEntry[] = [];
  try {
    const matches = await getMatches();
    const cleanSheetMap = new Map<string, CleanSheetEntry>();
    const allAssistCounts = new Map<string, number>();
    
    matches.forEach(m => {
      // count assists
      m.events?.forEach(e => {
        if (e.type === "goal" && e.playerTwo) {
          const key = `${e.playerTwo}-${e.teamId}`.toLowerCase();
          allAssistCounts.set(key, (allAssistCounts.get(key) || 0) + 1);
        }
      });

      if (m.status === "completed") {
        if (m.awayScore === 0) {
          // Home team clean sheet
          const current = cleanSheetMap.get(m.homeTeam.id) || {
            teamId: m.homeTeam.id,
            teamName: m.homeTeam.name,
            teamCode: m.homeTeam.code,
            teamFlag: m.homeTeam.flag,
            cleanSheets: 0
          };
          current.cleanSheets++;
          cleanSheetMap.set(m.homeTeam.id, current);
        }
        if (m.homeScore === 0) {
          // Away team clean sheet
          const current = cleanSheetMap.get(m.awayTeam.id) || {
            teamId: m.awayTeam.id,
            teamName: m.awayTeam.name,
            teamCode: m.awayTeam.code,
            teamFlag: m.awayTeam.flag,
            cleanSheets: 0
          };
          current.cleanSheets++;
          cleanSheetMap.set(m.awayTeam.id, current);
        }
      }
    });
    cleanSheets = Array.from(cleanSheetMap.values()).sort((a, b) => b.cleanSheets - a.cleanSheets).slice(0, 10);

    // Apply assist counts to goal scorers
    goals.forEach(g => {
      const key = `${g.name}-${g.teamId}`.toLowerCase();
      g.tournamentStats.assists = allAssistCounts.get(key) || 0;
    });
  } catch(e) {}

  return {
    goals,
    assists,
    yellowCards,
    redCards,
    minutes,
    cleanSheets
  };
}

/**
 * Get all 16 stadiums
 */
export async function getStadiums(): Promise<Stadium[]> {
  return STADIUMS;
}

const resolveToUpstreamId = (matchId: string): string => {
  if (matchId && !matchId.startsWith("group_") && !matchId.startsWith("unknown_")) {
    return `unknown_${matchId}`;
  }
  return matchId;
};

export async function getMatchLineups(matchId: string): Promise<any> {
  const upstreamId = resolveToUpstreamId(matchId);
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/matches/${matchId}/lineups`);
      if (res.ok) {
        const json = await res.json();
        return json.data || { lineups: [] };
      }
    } catch (e) {
      console.warn("Failed to fetch lineups from proxy:", e);
    }
    return { lineups: [] };
  }

  const baseUrl = (process as any).env.WC26_API_BASE_URL || "https://kickoff-2026-api.fly.dev/api/v1";
  try {
    const res = await fetch(`${baseUrl}/matches/${upstreamId}/lineups`, { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}
  return { lineups: [] };
}

export async function getMatchStats(matchId: string): Promise<any> {
  const upstreamId = resolveToUpstreamId(matchId);
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/matches/${matchId}/stats`);
      if (res.ok) {
        const json = await res.json();
        return json.data || { stats: [] };
      }
    } catch (e) {
      console.warn("Failed to fetch stats from proxy:", e);
    }
    return { stats: [] };
  }

  const baseUrl = (process as any).env.WC26_API_BASE_URL || "https://kickoff-2026-api.fly.dev/api/v1";
  try {
    const res = await fetch(`${baseUrl}/matches/${upstreamId}/stats`, { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}
  return { stats: [] };
}
