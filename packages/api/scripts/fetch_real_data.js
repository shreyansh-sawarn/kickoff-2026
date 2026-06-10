const fs = require('fs');
const path = require('path');
const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

const confMap = {
  // Hosts
  USA: "CONCACAF", MEX: "CONCACAF", CAN: "CONCACAF",
  // CONCACAF
  PAN: "CONCACAF", JAM: "CONCACAF", HON: "CONCACAF", SLV: "CONCACAF", CRC: "CONCACAF", CUW: "CONCACAF", HAI: "CONCACAF",
  // CONMEBOL
  ARG: "CONMEBOL", BRA: "CONMEBOL", COL: "CONMEBOL", URU: "CONMEBOL", ECU: "CONMEBOL", PAR: "CONMEBOL", CHI: "CONMEBOL", VEN: "CONMEBOL", BOL: "CONMEBOL", PER: "CONMEBOL",
  // UEFA
  ENG: "UEFA", SCO: "UEFA", WAL: "UEFA", NIR: "UEFA", FRA: "UEFA", GER: "UEFA", ESP: "UEFA", ITA: "UEFA", POR: "UEFA", NED: "UEFA", BEL: "UEFA", CRO: "UEFA", SUI: "UEFA", DEN: "UEFA", AUT: "UEFA", TUR: "UEFA", UKR: "UEFA", POL: "UEFA", CZE: "UEFA", NOR: "UEFA", BIH: "UEFA", CZECHIA: "UEFA",
  // CAF
  SEN: "CAF", MAR: "CAF", TUN: "CAF", NGA: "CAF", GHA: "CAF", CMR: "CAF", EGY: "CAF", RSA: "CAF", CIV: "CAF", CPV: "CAF", ALG: "CAF", COD: "CAF",
  // AFC
  JPN: "AFC", KOR: "AFC", KSA: "AFC", AUS: "AFC", IRN: "AFC", IRQ: "AFC", QAT: "AFC", UAE: "AFC", JOR: "AFC", UZB: "AFC",
  // OFC
  NZL: "OFC"
};

function getConfederation(code) {
  return confMap[code.toUpperCase()] || "UEFA";
}

async function main() {
  console.log("Fetching teams, groups, and games...");
  try {
    const teamsData = await get("https://worldcup26.ir/get/teams");
    const gamesData = await get("https://worldcup26.ir/get/games");

    const teamsList = teamsData.teams || [];
    const gamesList = gamesData.games || [];

    console.log(`Fetched ${teamsList.length} teams and ${gamesList.length} games.`);

    // Map teams
    const mappedTeams = teamsList.map(t => {
      const code = t.fifa_code === "CZE" ? "CZE" : t.fifa_code;
      return {
        id: t.fifa_code.toLowerCase(),
        name: t.name_en === "Czech Republic" ? "Czechia" : t.name_en,
        code: code,
        flag: t.iso2.toLowerCase(),
        confederation: getConfederation(code),
        group: t.groups
      };
    });

    // Sort teams by group and code
    mappedTeams.sort((a, b) => {
      if (a.group !== b.group) return a.group.localeCompare(b.group);
      return a.code.localeCompare(b.code);
    });

    // Map stadium ID to Stadium info
    const stadiumNames = {
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

    const mappedStadiums = Object.entries(stadiumNames).map(([id, info]) => ({
      id: `st-${id}`,
      name: info.name,
      city: info.city,
      country: info.country,
      capacity: info.capacity,
      matchesPlayed: []
    }));

    // Find team helper
    const findTeamByFifaId = (fifaId) => {
      const raw = teamsList.find(t => t.id === String(fifaId));
      if (!raw) return null;
      return mappedTeams.find(t => t.code === raw.fifa_code);
    };

    // Map matches
    const mappedMatches = gamesList.map(m => {
      const home = findTeamByFifaId(m.home_team_id);
      const away = findTeamByFifaId(m.away_team_id);
      const stadiumInfo = stadiumNames[m.stadium_id] || { name: "Unknown Stadium", city: "Unknown City" };

      // Parse date format "06/11/2026 13:00"
      let datetime = new Date().toISOString();
      if (m.local_date) {
        const parts = m.local_date.split(" ");
        if (parts.length === 2) {
          const dateParts = parts[0].split("/");
          const timeParts = parts[1].split(":");
          if (dateParts.length === 3 && timeParts.length === 2) {
            // Month is 0-indexed, local Date object in UTC-ish or standard format
            const d = new Date(Date.UTC(
              parseInt(dateParts[2]),
              parseInt(dateParts[0]) - 1,
              parseInt(dateParts[1]),
              parseInt(timeParts[0]),
              parseInt(timeParts[1])
            ));
            datetime = d.toISOString();
          }
        }
      }

      const status = m.finished === "TRUE" ? "completed" : m.time_elapsed && m.time_elapsed !== "notstarted" ? "live" : "upcoming";
      const homeScore = status !== "upcoming" ? parseInt(m.home_score) : undefined;
      const awayScore = status !== "upcoming" ? parseInt(m.away_score) : undefined;

      const groupName = m.type === "group" ? `Group ${m.group}` : m.group;

      return {
        id: `m-${m.id}`,
        homeTeam: home || { id: "tBD", name: m.home_team_label || "TBD", code: "TBD", flag: "🏳️", confederation: "TBD", group: "TBD" },
        awayTeam: away || { id: "tBD", name: m.away_team_label || "TBD", code: "TBD", flag: "🏳️", confederation: "TBD", group: "TBD" },
        status: status,
        homeScore,
        awayScore,
        datetime: datetime,
        group: groupName,
        stadium: stadiumInfo.name,
        city: stadiumInfo.city,
        scorers: [],
        events: []
      };
    });

    // Let's generate MOCK_STANDINGS
    // Rich Mock Players
    const mockPlayers = [
      {
        id: "p-mbappe",
        name: "Kylian Mbappé",
        teamId: "fra",
        teamName: "France",
        position: "FWD",
        club: "Real Madrid",
        age: 27,
        tournamentStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0 }
      },
      {
        id: "p-messi",
        name: "Lionel Messi",
        teamId: "arg",
        teamName: "Argentina",
        position: "FWD",
        club: "Inter Miami",
        age: 38,
        tournamentStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0 }
      },
      {
        id: "p-kane",
        name: "Harry Kane",
        teamId: "eng",
        teamName: "England",
        position: "FWD",
        club: "Bayern Munich",
        age: 32,
        tournamentStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0 }
      },
      {
        id: "p-vinicius",
        name: "Vinícius Júnior",
        teamId: "bra",
        teamName: "Brazil",
        position: "FWD",
        club: "Real Madrid",
        age: 25,
        tournamentStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0 }
      },
      {
        id: "p-pulisic",
        name: "Christian Pulisic",
        teamId: "usa",
        teamName: "United States",
        position: "MID",
        club: "AC Milan",
        age: 27,
        tournamentStats: { goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0 }
      }
    ];

    const standingsContent = `import { Team, Match, Group, Player, Stadium } from "@wc26/types";

export const MOCK_TEAMS: Team[] = ${JSON.stringify(mappedTeams, null, 2)};

export const MOCK_STADIUMS: Stadium[] = ${JSON.stringify(mappedStadiums, null, 2)};

export const MOCK_PLAYERS: Player[] = ${JSON.stringify(mockPlayers, null, 2)};

// Generate Standings for all 12 groups dynamically starting at 0 for all teams
export const MOCK_STANDINGS: Group[] = Array.from({ length: 12 }, (_, i) => {
  const groupLetter = String.fromCharCode(65 + i); // A, B, C... L
  const groupTeams = MOCK_TEAMS.filter((t) => t.group === groupLetter);

  return {
    name: \`Group \${groupLetter}\`,
    standings: [
      {
        teamId: groupTeams[0]?.id || "",
        teamName: groupTeams[0]?.name || "",
        teamCode: groupTeams[0]?.code || "",
        teamFlag: groupTeams[0]?.flag || "",
        played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: []
      },
      {
        teamId: groupTeams[1]?.id || "",
        teamName: groupTeams[1]?.name || "",
        teamCode: groupTeams[1]?.code || "",
        teamFlag: groupTeams[1]?.flag || "",
        played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: []
      },
      {
        teamId: groupTeams[2]?.id || "",
        teamName: groupTeams[2]?.name || "",
        teamCode: groupTeams[2]?.code || "",
        teamFlag: groupTeams[2]?.flag || "",
        played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: []
      },
      {
        teamId: groupTeams[3]?.id || "",
        teamName: groupTeams[3]?.name || "",
        teamCode: groupTeams[3]?.code || "",
        teamFlag: groupTeams[3]?.flag || "",
        played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: []
      }
    ]
  };
});

export const MOCK_MATCHES: Match[] = ${JSON.stringify(mappedMatches, null, 2)};
`;

    const outputPath = path.join(__dirname, '../src/mockData.ts');
    fs.writeFileSync(outputPath, standingsContent, 'utf-8');
    console.log(`Successfully updated ${outputPath}`);
  } catch (error) {
    console.error("Failed to generate mock data:", error);
    process.exit(1);
  }
}

main();
