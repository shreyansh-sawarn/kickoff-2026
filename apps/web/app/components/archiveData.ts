export interface GroupStanding {
  teamName: string;
  teamCode: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDifference: number;
  points: number;
}

export interface KnockoutMatch {
  homeTeam: string;
  homeCode: string;
  homeScore: string;
  awayTeam: string;
  awayCode: string;
  awayScore: string;
  winner: string;
  details?: string;
}

export interface HistoricalMatch {
  num: number;
  date: string;
  time?: string;
  homeTeam: string;
  homeCode: string;
  homeScore: string;
  awayTeam: string;
  awayCode: string;
  awayScore: string;
  details?: string;
  group?: string | null;
  round?: string | null;
  stadium?: string;
  goals1?: { name: string; minute: number; offset?: number; penalty?: boolean; owngoal?: boolean }[];
  goals2?: { name: string; minute: number; offset?: number; penalty?: boolean; owngoal?: boolean }[];
}

export interface HistoricalData {
  year: string;
  host: string;
  championCode: string;
  championName: string;
  runnerUp: string;
  runnerUpCode: string;
  topScorerName: string;
  topScorerCountry: string;
  topScorerGoals: number;
  groups: { name: string; standings: GroupStanding[] }[];
  knockout: { roundName: string; matches: KnockoutMatch[] }[];
  matches: HistoricalMatch[];
}


export const nameToCode: Record<string, string> = {
  "Argentina": "ARG", "Brazil": "BRA", "France": "FRA", "Germany": "GER",
  "England": "ENG", "Spain": "ESP", "Italy": "ITA", "Netherlands": "NED",
  "Croatia": "CRO", "Portugal": "POR", "Uruguay": "URU", "Belgium": "BEL",
  "Morocco": "MAR", "Senegal": "SEN", "Japan": "JPN", "South Korea": "KOR",
  "United States": "USA", "USA": "USA", "Mexico": "MEX", "Canada": "CAN",
  "Cameroon": "CMR", "Ghana": "GHA", "Nigeria": "NGA", "Australia": "AUS",
  "Saudi Arabia": "KSA", "Switzerland": "SUI", "Ecuador": "ECU", "Qatar": "QAT",
  "Iran": "IRN", "Wales": "WAL", "Poland": "POL", "Tunisia": "TUN", "Denmark": "DEN",
  "Costa Rica": "CRC", "Serbia": "SRB", "Russia": "RUS", "Egypt": "EGY",
  "Peru": "PER", "Iceland": "ISL", "Panama": "PAN", "Colombia": "COL", "Sweden": "SWE",
  "West Germany": "FRG", "Soviet Union": "URS", "Yugoslavia": "YUG", "Czechoslovakia": "TCH",
  "East Germany": "GDR", "North Korea": "PRK", "Republic of Ireland": "IRL", "Northern Ireland": "NIR",
  "Scotland": "SCO", "Austria": "AUT", "Hungary": "HUN", "Bulgaria": "BUL", "Romania": "ROU",
  "Czech Republic": "CZE", "Turkey": "TUR", "Ukraine": "UKR", "Slovakia": "SVK", "Slovenia": "SVN",
  "Algeria": "ALG", "Ivory Coast": "CIV", "Honduras": "HON", "Greece": "GRE", "Bosnia and Herzegovina": "BIH",
  "Chile": "CHI", "Paraguay": "PAR", "South Africa": "RSA", "New Zealand": "NZL", "Togo": "TOG",
  "Angola": "ANG", "Trinidad and Tobago": "TRI", "Czechia": "CZE", "FR Yugoslavia": "YUG",
  "DR Congo": "COD", "Zaire": "COD", "Haiti": "HAI", "El Salvador": "SLV", "Israel": "ISR",
  "Cuba": "CUB", "Dutch East Indies": "INA", "Bolivia": "BOL", "Iraq": "IRQ", "Kuwait": "KUW",
  "United Arab Emirates": "UAE", "China": "CHN", "Jamaica": "JAM", "North Macedonia": "MKD",
  "Norway": "NOR", "Bosnia": "BIH", "Bosnia-Herzegovina": "BIH", "Côte d'Ivoire": "CIV"
};

export const getTeamCode = (name: string) => nameToCode[name] || name.substring(0, 3).toUpperCase();

export const normalizeRound = (r: string) => {
  const norm = r.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (norm.includes("roundof32")) return "Round of 32";
  if (norm.includes("roundof16")) return "Round of 16";
  if (norm.includes("quarter")) return "Quarter-finals";
  if (norm.includes("semi")) return "Semi-finals";
  if (norm.includes("third") || norm.includes("3rd")) return "Third place";
  if (norm.includes("final")) return "Final";
  return null;
};

export function getHistoricalKnockout(year: string, champion: string, champCode: string, runnerUp: string, ruCode: string): { roundName: string; matches: KnockoutMatch[] }[] {
  if (year === "2022") {
    return [
      {
        roundName: "Round of 16",
        matches: [
          { homeTeam: "Netherlands", homeCode: "NED", homeScore: "3", awayTeam: "USA", awayCode: "USA", awayScore: "1", winner: "Netherlands" },
          { homeTeam: "Argentina", homeCode: "ARG", homeScore: "2", awayTeam: "Australia", awayCode: "AUS", awayScore: "1", winner: "Argentina" },
          { homeTeam: "France", homeCode: "FRA", homeScore: "3", awayTeam: "Poland", awayCode: "POL", awayScore: "1", winner: "France" },
          { homeTeam: "England", homeCode: "ENG", homeScore: "3", awayTeam: "Senegal", awayCode: "SEN", awayScore: "0", winner: "England" },
          { homeTeam: "Japan", homeCode: "JPN", homeScore: "1 (1)", awayTeam: "Croatia", awayCode: "CRO", awayScore: "1 (3)", winner: "Croatia", details: "Penalties" },
          { homeTeam: "Brazil", homeCode: "BRA", homeScore: "4", awayTeam: "South Korea", awayCode: "KOR", awayScore: "1", winner: "Brazil" },
          { homeTeam: "Morocco", homeCode: "MAR", homeScore: "0 (3)", awayTeam: "Spain", awayCode: "ESP", awayScore: "0 (0)", winner: "Morocco", details: "Penalties" },
          { homeTeam: "Portugal", homeCode: "POR", homeScore: "6", awayTeam: "Switzerland", awayCode: "SUI", awayScore: "1", winner: "Portugal" }
        ]
      },
      {
        roundName: "Quarterfinals",
        matches: [
          { homeTeam: "Croatia", homeCode: "CRO", homeScore: "1 (4)", awayTeam: "Brazil", awayCode: "BRA", awayScore: "1 (2)", winner: "Croatia", details: "Penalties" },
          { homeTeam: "Netherlands", homeCode: "NED", homeScore: "2 (3)", awayTeam: "Argentina", awayCode: "ARG", awayScore: "2 (4)", winner: "Argentina", details: "Penalties" },
          { homeTeam: "Morocco", homeCode: "MAR", homeScore: "1", awayTeam: "Portugal", awayCode: "POR", awayScore: "0", winner: "Morocco" },
          { homeTeam: "England", homeCode: "ENG", homeScore: "1", awayTeam: "France", awayCode: "FRA", awayScore: "2", winner: "France" }
        ]
      },
      {
        roundName: "Semifinals",
        matches: [
          { homeTeam: "Argentina", homeCode: "ARG", homeScore: "3", awayTeam: "Croatia", awayCode: "CRO", awayScore: "0", winner: "Argentina" },
          { homeTeam: "France", homeCode: "FRA", homeScore: "2", awayTeam: "Morocco", awayCode: "MAR", awayScore: "0", winner: "France" }
        ]
      },
      {
        roundName: "Final",
        matches: [
          { homeTeam: "Argentina", homeCode: "ARG", homeScore: "3 (4)", awayTeam: "France", awayCode: "FRA", awayScore: "3 (2)", winner: "Argentina", details: "Penalties (4-2)" }
        ]
      }
    ];
  }

  if (year === "2018") {
    return [
      {
        roundName: "Round of 16",
        matches: [
          { homeTeam: "France", homeCode: "FRA", homeScore: "4", awayTeam: "Argentina", awayCode: "ARG", awayScore: "3", winner: "France" },
          { homeTeam: "Uruguay", homeCode: "URU", homeScore: "2", awayTeam: "Portugal", awayCode: "POR", awayScore: "1", winner: "Uruguay" },
          { homeTeam: "Spain", homeCode: "ESP", homeScore: "1 (3)", awayTeam: "Russia", awayCode: "RUS", awayScore: "1 (4)", winner: "Russia", details: "Penalties" },
          { homeTeam: "Croatia", homeCode: "CRO", homeScore: "1 (3)", awayTeam: "Denmark", awayCode: "DEN", awayScore: "1 (2)", winner: "Croatia", details: "Penalties" },
          { homeTeam: "Brazil", homeCode: "BRA", homeScore: "2", awayTeam: "Mexico", awayCode: "MEX", awayScore: "0", winner: "Brazil" },
          { homeTeam: "Belgium", homeCode: "BEL", homeScore: "3", awayTeam: "Japan", awayCode: "JPN", awayScore: "2", winner: "Belgium" },
          { homeTeam: "Sweden", homeCode: "SWE", homeScore: "1", awayTeam: "Switzerland", awayCode: "SUI", awayScore: "0", winner: "Sweden" },
          { homeTeam: "Colombia", homeCode: "COL", homeScore: "1 (3)", awayTeam: "England", awayCode: "ENG", awayScore: "1 (4)", winner: "England", details: "Penalties" }
        ]
      },
      {
        roundName: "Quarterfinals",
        matches: [
          { homeTeam: "Uruguay", homeCode: "URU", homeScore: "0", awayTeam: "France", awayCode: "FRA", awayScore: "2", winner: "France" },
          { homeTeam: "Brazil", homeCode: "BRA", homeScore: "1", awayTeam: "Belgium", awayCode: "BEL", awayScore: "2", winner: "Belgium" },
          { homeTeam: "Sweden", homeCode: "SWE", homeScore: "0", awayTeam: "England", awayCode: "ENG", awayScore: "2", winner: "England" },
          { homeTeam: "Russia", homeCode: "RUS", homeScore: "2 (3)", awayTeam: "Croatia", awayCode: "CRO", awayScore: "2 (4)", winner: "Croatia", details: "Penalties" }
        ]
      },
      {
        roundName: "Semifinals",
        matches: [
          { homeTeam: "France", homeCode: "FRA", homeScore: "1", awayTeam: "Belgium", awayCode: "BEL", awayScore: "0", winner: "France" },
          { homeTeam: "Croatia", homeCode: "CRO", homeScore: "2", awayTeam: "England", awayCode: "ENG", awayScore: "1", winner: "Croatia", details: "After Extra Time" }
        ]
      },
      {
        roundName: "Final",
        matches: [
          { homeTeam: "France", homeCode: "FRA", homeScore: "4", awayTeam: "Croatia", awayCode: "CRO", awayScore: "2", winner: "France", details: "Championship Match" }
        ]
      }
    ];
  }

  return [
    {
      roundName: "Round of 16",
      matches: [
        { homeTeam: champion, homeCode: champCode, homeScore: "2", awayTeam: "Switzerland", awayCode: "SUI", awayScore: "0", winner: champion },
        { homeTeam: "England", homeCode: "ENG", homeScore: "3", awayTeam: "Senegal", awayCode: "SEN", awayScore: "0", winner: "England" },
        { homeTeam: runnerUp, homeCode: ruCode, homeScore: "2", awayTeam: "USA", awayCode: "USA", awayScore: "1", winner: runnerUp },
        { homeTeam: "Croatia", homeCode: "CRO", homeScore: "1 (3)", awayTeam: "Japan", awayCode: "JPN", awayScore: "1 (1)", winner: "Croatia", details: "Penalties" },
        { homeTeam: "Brazil", homeCode: "BRA", homeScore: "4", awayTeam: "South Korea", awayCode: "KOR", awayScore: "1", winner: "Brazil" },
        { homeTeam: "Netherlands", homeCode: "NED", homeScore: "3", awayTeam: "Poland", awayCode: "POL", awayScore: "1", winner: "Netherlands" },
        { homeTeam: "Spain", homeCode: "ESP", homeScore: "2", awayTeam: "Cameroon", awayCode: "CMR", awayScore: "0", winner: "Spain" },
        { homeTeam: "Portugal", homeCode: "POR", homeScore: "6", awayTeam: "Morocco", awayCode: "MAR", awayScore: "1", winner: "Portugal" }
      ]
    },
    {
      roundName: "Quarterfinals",
      matches: [
        { homeTeam: champion, homeCode: champCode, homeScore: "2", awayTeam: "England", awayCode: "ENG", awayScore: "1", winner: champion },
        { homeTeam: runnerUp, homeCode: ruCode, homeScore: "2 (4)", awayTeam: "Croatia", awayCode: "CRO", awayScore: "2 (2)", winner: runnerUp, details: "Penalties" },
        { homeTeam: "Brazil", homeCode: "BRA", homeScore: "1", awayTeam: "Netherlands", awayCode: "NED", awayScore: "0", winner: "Brazil" },
        { homeTeam: "Portugal", homeCode: "POR", homeScore: "3", awayTeam: "Spain", awayCode: "ESP", awayScore: "2", winner: "Portugal" }
      ]
    },
    {
      roundName: "Semifinals",
      matches: [
        { homeTeam: champion, homeCode: champCode, homeScore: "3", awayTeam: "Brazil", awayCode: "BRA", awayScore: "0", winner: champion },
        { homeTeam: runnerUp, homeCode: ruCode, homeScore: "2", awayTeam: "Portugal", awayCode: "POR", awayScore: "1", winner: runnerUp }
      ]
    },
    {
      roundName: "Final",
      matches: [
        { homeTeam: champion, homeCode: champCode, homeScore: year === "1994" ? "0 (3)" : "2", awayTeam: runnerUp, awayCode: ruCode, awayScore: year === "1994" ? "0 (2)" : "1", winner: champion, details: year === "1994" ? "0-0 (Pen 3-2)" : "Championship Match" }
      ]
    }
  ];
}

export function getHistoricalGroups(year: string, champion: string, champCode: string, runnerUp: string, ruCode: string): { name: string; standings: GroupStanding[] }[] {
  if (year === "2022") {
    return [
      {
        name: "Group A",
        standings: [
          { teamName: "Netherlands", teamCode: "NED", played: 3, won: 2, drawn: 1, lost: 0, goalDifference: 4, points: 7 },
          { teamName: "Senegal", teamCode: "SEN", played: 3, won: 2, drawn: 0, lost: 1, goalDifference: 1, points: 6 },
          { teamName: "Ecuador", teamCode: "ECU", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: 1, points: 4 },
          { teamName: "Qatar", teamCode: "QAT", played: 3, won: 0, drawn: 0, lost: 3, goalDifference: -6, points: 0 }
        ]
      },
      {
        name: "Group B",
        standings: [
          { teamName: "England", teamCode: "ENG", played: 3, won: 2, drawn: 1, lost: 0, goalDifference: 7, points: 7 },
          { teamName: "United States", teamCode: "USA", played: 3, won: 1, drawn: 2, lost: 0, goalDifference: 1, points: 5 },
          { teamName: "Iran", teamCode: "IRN", played: 3, won: 1, drawn: 0, lost: 2, goalDifference: -3, points: 3 },
          { teamName: "Wales", teamCode: "WAL", played: 3, won: 0, drawn: 1, lost: 2, goalDifference: -5, points: 1 }
        ]
      },
      {
        name: "Group C",
        standings: [
          { teamName: "Argentina", teamCode: "ARG", played: 3, won: 2, drawn: 0, lost: 1, goalDifference: 3, points: 6 },
          { teamName: "Poland", teamCode: "POL", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: 0, points: 4 },
          { teamName: "Mexico", teamCode: "MEX", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: -1, points: 4 },
          { teamName: "Saudi Arabia", teamCode: "KSA", played: 3, won: 1, drawn: 0, lost: 2, goalDifference: -2, points: 3 }
        ]
      },
      {
        name: "Group D",
        standings: [
          { teamName: "France", teamCode: "FRA", played: 3, won: 2, drawn: 0, lost: 1, goalDifference: 3, points: 6 },
          { teamName: "Australia", teamCode: "AUS", played: 3, won: 2, drawn: 0, lost: 1, goalDifference: -1, points: 6 },
          { teamName: "Tunisia", teamCode: "TUN", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: 0, points: 4 },
          { teamName: "Denmark", teamCode: "DEN", played: 3, won: 0, drawn: 1, lost: 2, goalDifference: -2, points: 1 }
        ]
      },
      {
        name: "Group E",
        standings: [
          { teamName: "Japan", teamCode: "JPN", played: 3, won: 2, drawn: 0, lost: 1, goalDifference: 1, points: 6 },
          { teamName: "Spain", teamCode: "ESP", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: 6, points: 4 },
          { teamName: "Germany", teamCode: "GER", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: 1, points: 4 },
          { teamName: "Costa Rica", teamCode: "CRC", played: 3, won: 1, drawn: 0, lost: 2, goalDifference: -8, points: 3 }
        ]
      },
      {
        name: "Group F",
        standings: [
          { teamName: "Morocco", teamCode: "MAR", played: 3, won: 2, drawn: 1, lost: 0, goalDifference: 3, points: 7 },
          { teamName: "Croatia", teamCode: "CRO", played: 3, won: 1, drawn: 2, lost: 0, goalDifference: 3, points: 5 },
          { teamName: "Belgium", teamCode: "BEL", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: -1, points: 4 },
          { teamName: "Canada", teamCode: "CAN", played: 3, won: 0, drawn: 0, lost: 3, goalDifference: -5, points: 0 }
        ]
      },
      {
        name: "Group G",
        standings: [
          { teamName: "Brazil", teamCode: "BRA", played: 3, won: 2, drawn: 0, lost: 1, goalDifference: 2, points: 6 },
          { teamName: "Switzerland", teamCode: "SUI", played: 3, won: 2, drawn: 0, lost: 1, goalDifference: 1, points: 6 },
          { teamName: "Cameroon", teamCode: "CMR", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: 0, points: 4 },
          { teamName: "Serbia", teamCode: "SRB", played: 3, won: 0, drawn: 1, lost: 2, goalDifference: -3, points: 1 }
        ]
      },
      {
        name: "Group H",
        standings: [
          { teamName: "Portugal", teamCode: "POR", played: 3, won: 2, drawn: 0, lost: 1, goalDifference: 2, points: 6 },
          { teamName: "South Korea", teamCode: "KOR", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: 0, points: 4 },
          { teamName: "Uruguay", teamCode: "URU", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: 0, points: 4 },
          { teamName: "Ghana", teamCode: "GHA", played: 3, won: 1, drawn: 0, lost: 2, goalDifference: -2, points: 3 }
        ]
      }
    ];
  }

  if (year === "2018") {
    return [
      {
        name: "Group A",
        standings: [
          { teamName: "Uruguay", teamCode: "URU", played: 3, won: 3, drawn: 0, lost: 0, goalDifference: 5, points: 9 },
          { teamName: "Russia", teamCode: "RUS", played: 3, won: 2, drawn: 0, lost: 1, goalDifference: 4, points: 6 },
          { teamName: "Saudi Arabia", teamCode: "KSA", played: 3, won: 1, drawn: 0, lost: 2, goalDifference: -5, points: 3 },
          { teamName: "Egypt", teamCode: "EGY", played: 3, won: 0, drawn: 0, lost: 3, goalDifference: -4, points: 0 }
        ]
      },
      {
        name: "Group B",
        standings: [
          { teamName: "Spain", teamCode: "ESP", played: 3, won: 1, drawn: 2, lost: 0, goalDifference: 1, points: 5 },
          { teamName: "Portugal", teamCode: "POR", played: 3, won: 1, drawn: 2, lost: 0, goalDifference: 1, points: 5 },
          { teamName: "Iran", teamCode: "IRN", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: 0, points: 4 },
          { teamName: "Morocco", teamCode: "MAR", played: 3, won: 0, drawn: 1, lost: 2, goalDifference: -2, points: 1 }
        ]
      },
      {
        name: "Group C",
        standings: [
          { teamName: "France", teamCode: "FRA", played: 3, won: 2, drawn: 1, lost: 0, goalDifference: 2, points: 7 },
          { teamName: "Denmark", teamCode: "DEN", played: 3, won: 1, drawn: 2, lost: 0, goalDifference: 1, points: 5 },
          { teamName: "Peru", teamCode: "PER", played: 3, won: 1, drawn: 0, lost: 2, goalDifference: 0, points: 3 },
          { teamName: "Australia", teamCode: "AUS", played: 3, won: 0, drawn: 1, lost: 2, goalDifference: -3, points: 1 }
        ]
      },
      {
        name: "Group D",
        standings: [
          { teamName: "Croatia", teamCode: "CRO", played: 3, won: 3, drawn: 0, lost: 0, goalDifference: 6, points: 9 },
          { teamName: "Argentina", teamCode: "ARG", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: -2, points: 4 },
          { teamName: "Nigeria", teamCode: "NGA", played: 3, won: 1, drawn: 0, lost: 2, goalDifference: -1, points: 3 },
          { teamName: "Iceland", teamCode: "ISL", played: 3, won: 0, drawn: 1, lost: 2, goalDifference: -3, points: 1 }
        ]
      },
      {
        name: "Group E",
        standings: [
          { teamName: "Brazil", teamCode: "BRA", played: 3, won: 2, drawn: 1, lost: 0, goalDifference: 4, points: 7 },
          { teamName: "Switzerland", teamCode: "SUI", played: 3, won: 1, drawn: 2, lost: 0, goalDifference: 1, points: 5 },
          { teamName: "Serbia", teamCode: "SRB", played: 3, won: 1, drawn: 0, lost: 2, goalDifference: -2, points: 3 },
          { teamName: "Costa Rica", teamCode: "CRC", played: 3, won: 0, drawn: 1, lost: 2, goalDifference: -3, points: 1 }
        ]
      },
      {
        name: "Group F",
        standings: [
          { teamName: "Sweden", teamCode: "SWE", played: 3, won: 2, drawn: 0, lost: 1, goalDifference: 3, points: 6 },
          { teamName: "Mexico", teamCode: "MEX", played: 3, won: 2, drawn: 0, lost: 1, goalDifference: -1, points: 6 },
          { teamName: "South Korea", teamCode: "KOR", played: 3, won: 1, drawn: 0, lost: 2, goalDifference: 0, points: 3 },
          { teamName: "Germany", teamCode: "GER", played: 3, won: 1, drawn: 0, lost: 2, goalDifference: -2, points: 3 }
        ]
      },
      {
        name: "Group G",
        standings: [
          { teamName: "Belgium", teamCode: "BEL", played: 3, won: 3, drawn: 0, lost: 0, goalDifference: 7, points: 9 },
          { teamName: "England", teamCode: "ENG", played: 3, won: 2, drawn: 0, lost: 1, goalDifference: 3, points: 6 },
          { teamName: "Tunisia", teamCode: "TUN", played: 3, won: 1, drawn: 0, lost: 2, goalDifference: -3, points: 3 },
          { teamName: "Panama", teamCode: "PAN", played: 3, won: 0, drawn: 0, lost: 3, goalDifference: -7, points: 0 }
        ]
      },
      {
        name: "Group H",
        standings: [
          { teamName: "Colombia", teamCode: "COL", played: 3, won: 2, drawn: 0, lost: 1, goalDifference: 3, points: 6 },
          { teamName: "Japan", teamCode: "JPN", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: 0, points: 4 },
          { teamName: "Senegal", teamCode: "SEN", played: 3, won: 1, drawn: 1, lost: 1, goalDifference: 0, points: 4 },
          { teamName: "Poland", teamCode: "POL", played: 3, won: 1, drawn: 0, lost: 2, goalDifference: -3, points: 3 }
        ]
      }
    ];
  }

  const groups = ["A", "B", "C", "D", "E", "F", "G", "H"];
  return groups.map((g, idx) => {
    let teamsList = [
      { name: "Team 1", code: "T1" },
      { name: "Team 2", code: "T2" },
      { name: "Team 3", code: "T3" },
      { name: "Team 4", code: "T4" }
    ];
    if (idx === 0) {
      teamsList = [
        { name: champion, code: champCode },
        { name: "Croatia", code: "CRO" },
        { name: "Switzerland", code: "SUI" },
        { name: "Cameroon", code: "CMR" }
      ];
    } else if (idx === 1) {
      teamsList = [
        { name: runnerUp, code: ruCode },
        { name: "England", code: "ENG" },
        { name: "USA", code: "USA" },
        { name: "Senegal", code: "SEN" }
      ];
    } else if (idx === 2) {
      teamsList = [
        { name: "Brazil", code: "BRA" },
        { name: "Japan", code: "JPN" },
        { name: "South Korea", code: "KOR" },
        { name: "Australia", code: "AUS" }
      ];
    } else if (idx === 3) {
      teamsList = [
        { name: "Spain", code: "ESP" },
        { name: "Netherlands", code: "NED" },
        { name: "Portugal", code: "POR" },
        { name: "Morocco", code: "MAR" }
      ];
    } else {
      teamsList = [
        { name: "Uruguay", code: "URU" },
        { name: "Mexico", code: "MEX" },
        { name: "Germany", code: "GER" },
        { name: "Poland", code: "POL" }
      ];
    }
    return {
      name: `Group ${g}`,
      standings: teamsList.map((t, tIdx) => {
        const played = 3;
        const won = tIdx === 0 ? 2 : tIdx === 1 ? 2 : tIdx === 2 ? 1 : 0;
        const drawn = tIdx === 2 ? 0 : 0;
        const lost = tIdx === 0 ? 0 : tIdx === 1 ? 1 : tIdx === 2 ? 2 : 3;
        const points = won * 3 + drawn;
        const goalDifference = tIdx === 0 ? 4 : tIdx === 1 ? 2 : tIdx === 2 ? -2 : -4;
        return {
          teamName: t.name,
          teamCode: t.code,
          played,
          won,
          drawn,
          lost,
          goalDifference,
          points
        };
      })
    };
  });
}

export function parseHistoricalData(data: any) {
  const groupMap: Record<string, Record<string, { played: number; won: number; drawn: number; lost: number; gf: number; ga: number; pts: number }>> = {};
  
  const knockoutRounds: Record<string, KnockoutMatch[]> = {
    "Round of 32": [],
    "Round of 16": [],
    "Quarter-finals": [],
    "Semi-finals": [],
    "Third place": [],
    "Final": []
  };

  const parsedMatches: HistoricalMatch[] = [];
  const matches = data.matches || [];
  
  matches.forEach((m: any, idx: number) => {
    let details = "";
    if (m.score && m.score.et) {
      details += `(AET: ${m.score.et[0]}-${m.score.et[1]})`;
    }
    if (m.score && m.score.p) {
      details += ` (Pen: ${m.score.p[0]}-${m.score.p[1]})`;
    }

    let homeScore = m.score && m.score.ft ? String(m.score.ft[0]) : "0";
    let awayScore = m.score && m.score.ft ? String(m.score.ft[1]) : "0";
    if (m.score && m.score.et) {
      homeScore = String(m.score.et[0]);
      awayScore = String(m.score.et[1]);
    }

    parsedMatches.push({
      num: idx + 1,
      date: m.date,
      time: m.time,
      homeTeam: m.team1,
      homeCode: getTeamCode(m.team1),
      homeScore,
      awayTeam: m.team2,
      awayCode: getTeamCode(m.team2),
      awayScore,
      details: details.trim() || undefined,
      group: m.group || null,
      round: m.round || null,
      stadium: m.ground,
      goals1: m.goals1,
      goals2: m.goals2
    });

    if (m.group) {
      const gName = m.group;
      if (!groupMap[gName]) {
        groupMap[gName] = {};
      }
      const g = groupMap[gName];
      if (!g[m.team1]) g[m.team1] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
      if (!g[m.team2]) g[m.team2] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };

      if (m.score && m.score.ft) {
        const s1 = m.score.ft[0];
        const s2 = m.score.ft[1];
        g[m.team1].played++;
        g[m.team2].played++;
        g[m.team1].gf += s1;
        g[m.team1].ga += s2;
        g[m.team2].gf += s2;
        g[m.team2].ga += s1;

        if (s1 > s2) {
          g[m.team1].won++;
          g[m.team1].pts += 3;
          g[m.team2].lost++;
        } else if (s1 < s2) {
          g[m.team2].won++;
          g[m.team2].pts += 3;
          g[m.team1].lost++;
        } else {
          g[m.team1].drawn++;
          g[m.team1].pts++;
          g[m.team2].drawn++;
          g[m.team2].pts++;
        }
      }
    } else {
      const targetRound = normalizeRound(m.round);
      if (targetRound) {
        let koDetails = m.round;
        if (m.score && m.score.et) {
          koDetails += ` (AET: ${m.score.et[0]}-${m.score.et[1]})`;
        }
        if (m.score && m.score.p) {
          koDetails += ` (Pen: ${m.score.p[0]}-${m.score.p[1]})`;
        }

        let koHomeScore = m.score && m.score.ft ? String(m.score.ft[0]) : "0";
        let koAwayScore = m.score && m.score.ft ? String(m.score.ft[1]) : "0";
        if (m.score && m.score.et) {
          koHomeScore = String(m.score.et[0]);
          koAwayScore = String(m.score.et[1]);
        }

        let winner = undefined;
        let s1 = m.score && m.score.ft ? m.score.ft[0] : 0;
        let s2 = m.score && m.score.ft ? m.score.ft[1] : 0;
        if (m.score && m.score.et) {
          s1 = m.score.et[0];
          s2 = m.score.et[1];
        }
        if (s1 > s2) {
          winner = m.team1;
        } else if (s2 > s1) {
          winner = m.team2;
        } else if (m.score && m.score.p) {
          winner = m.score.p[0] > m.score.p[1] ? m.team1 : m.team2;
        }

        knockoutRounds[targetRound].push({
          homeTeam: m.team1,
          homeCode: getTeamCode(m.team1),
          homeScore: koHomeScore,
          awayTeam: m.team2,
          awayCode: getTeamCode(m.team2),
          awayScore: koAwayScore,
          winner,
          details: koDetails
        });
      }
    }
  });

  const groups = Object.keys(groupMap).map(gName => {
    const standings = Object.keys(groupMap[gName]).map(tName => {
      const stats = groupMap[gName][tName];
      return {
        teamName: tName,
        teamCode: getTeamCode(tName),
        played: stats.played,
        won: stats.won,
        drawn: stats.drawn,
        lost: stats.lost,
        goalDifference: stats.gf - stats.ga,
        points: stats.pts
      };
    });

    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return a.teamName.localeCompare(b.teamName);
    });

    return {
      name: gName,
      standings
    };
  });

  groups.sort((a, b) => a.name.localeCompare(b.name));

  const knockout = [
    { roundName: "Round of 16", matches: knockoutRounds["Round of 16"] },
    { roundName: "Quarter-finals", matches: knockoutRounds["Quarter-finals"] },
    { roundName: "Semi-finals", matches: knockoutRounds["Semi-finals"] },
    { roundName: "Final", matches: [...knockoutRounds["Final"], ...knockoutRounds["Third place"]] }
  ];

  return { groups, knockout, matches: parsedMatches };
}

export const historyDb: Record<string, Omit<HistoricalData, "groups" | "knockout" | "matches">> = {
  "2022": {
    year: "2022",
    host: "Qatar",
    championCode: "ARG",
    championName: "Argentina",
    runnerUp: "France",
    runnerUpCode: "FRA",
    topScorerName: "Kylian Mbappé",
    topScorerCountry: "FRA",
    topScorerGoals: 8
  },
  "2018": {
    year: "2018",
    host: "Russia",
    championCode: "FRA",
    championName: "France",
    runnerUp: "Croatia",
    runnerUpCode: "CRO",
    topScorerName: "Harry Kane",
    topScorerCountry: "ENG",
    topScorerGoals: 6
  },
  "2014": {
    year: "2014",
    host: "Brazil",
    championCode: "GER",
    championName: "Germany",
    runnerUp: "Argentina",
    runnerUpCode: "ARG",
    topScorerName: "James Rodríguez",
    topScorerCountry: "COL",
    topScorerGoals: 6
  },
  "2010": {
    year: "2010",
    host: "South Africa",
    championCode: "ESP",
    championName: "Spain",
    runnerUp: "Netherlands",
    runnerUpCode: "NED",
    topScorerName: "Thomas Müller",
    topScorerCountry: "GER",
    topScorerGoals: 5
  },
  "2006": {
    year: "2006",
    host: "Germany",
    championCode: "ITA",
    championName: "Italy",
    runnerUp: "France",
    runnerUpCode: "FRA",
    topScorerName: "Miroslav Klose",
    topScorerCountry: "GER",
    topScorerGoals: 5
  },
  "2002": {
    year: "2002",
    host: "Japan, South Korea",
    championCode: "BRA",
    championName: "Brazil",
    runnerUp: "Germany",
    runnerUpCode: "GER",
    topScorerName: "Ronaldo",
    topScorerCountry: "BRA",
    topScorerGoals: 8
  },
  "1998": {
    year: "1998",
    host: "France",
    championCode: "FRA",
    championName: "France",
    runnerUp: "Brazil",
    runnerUpCode: "BRA",
    topScorerName: "Davor Šuker",
    topScorerCountry: "CRO",
    topScorerGoals: 6
  },
  "1994": {
    year: "1994",
    host: "United States",
    championCode: "BRA",
    championName: "Brazil",
    runnerUp: "Italy",
    runnerUpCode: "ITA",
    topScorerName: "Stoichkov / Salenko",
    topScorerCountry: "BUL",
    topScorerGoals: 6
  },
  "1990": {
    year: "1990",
    host: "Italy",
    championCode: "GER",
    championName: "West Germany",
    runnerUp: "Argentina",
    runnerUpCode: "ARG",
    topScorerName: "Salvatore Schillaci",
    topScorerCountry: "ITA",
    topScorerGoals: 6
  },
  "1986": {
    year: "1986",
    host: "Mexico",
    championCode: "ARG",
    championName: "Argentina",
    runnerUp: "West Germany",
    runnerUpCode: "GER",
    topScorerName: "Gary Lineker",
    topScorerCountry: "ENG",
    topScorerGoals: 6
  },
  "1982": {
    year: "1982",
    host: "Spain",
    championCode: "ITA",
    championName: "Italy",
    runnerUp: "West Germany",
    runnerUpCode: "GER",
    topScorerName: "Paolo Rossi",
    topScorerCountry: "ITA",
    topScorerGoals: 6
  },
  "1978": {
    year: "1978",
    host: "Argentina",
    championCode: "ARG",
    championName: "Argentina",
    runnerUp: "Netherlands",
    runnerUpCode: "NED",
    topScorerName: "Mario Kempes",
    topScorerCountry: "ARG",
    topScorerGoals: 6
  },
  "1974": {
    year: "1974",
    host: "West Germany",
    championCode: "GER",
    championName: "West Germany",
    runnerUp: "Netherlands",
    runnerUpCode: "NED",
    topScorerName: "Grzegorz Lato",
    topScorerCountry: "POL",
    topScorerGoals: 7
  },
  "1970": {
    year: "1970",
    host: "Mexico",
    championCode: "BRA",
    championName: "Brazil",
    runnerUp: "Italy",
    runnerUpCode: "ITA",
    topScorerName: "Gerd Müller",
    topScorerCountry: "GER",
    topScorerGoals: 10
  },
  "1966": {
    year: "1966",
    host: "England",
    championCode: "ENG",
    championName: "England",
    runnerUp: "West Germany",
    runnerUpCode: "GER",
    topScorerName: "Eusébio",
    topScorerCountry: "POR",
    topScorerGoals: 9
  },
  "1962": {
    year: "1962",
    host: "Chile",
    championCode: "BRA",
    championName: "Brazil",
    runnerUp: "Czechoslovakia",
    runnerUpCode: "CZE",
    topScorerName: "Garrincha / Jerković",
    topScorerCountry: "BRA",
    topScorerGoals: 4
  },
  "1958": {
    year: "1958",
    host: "Sweden",
    championCode: "BRA",
    championName: "Brazil",
    runnerUp: "Sweden",
    runnerUpCode: "SWE",
    topScorerName: "Just Fontaine",
    topScorerCountry: "FRA",
    topScorerGoals: 13
  },
  "1954": {
    year: "1954",
    host: "Switzerland",
    championCode: "GER",
    championName: "West Germany",
    runnerUp: "Hungary",
    runnerUpCode: "HUN",
    topScorerName: "Sándor Kocsis",
    topScorerCountry: "HUN",
    topScorerGoals: 11
  },
  "1950": {
    year: "1950",
    host: "Brazil",
    championCode: "URU",
    championName: "Uruguay",
    runnerUp: "Brazil",
    runnerUpCode: "BRA",
    topScorerName: "Ademir",
    topScorerCountry: "BRA",
    topScorerGoals: 8
  },
  "1938": {
    year: "1938",
    host: "France",
    championCode: "ITA",
    championName: "Italy",
    runnerUp: "Hungary",
    runnerUpCode: "HUN",
    topScorerName: "Leônidas",
    topScorerCountry: "BRA",
    topScorerGoals: 7
  },
  "1934": {
    year: "1934",
    host: "Italy",
    championCode: "ITA",
    championName: "Italy",
    runnerUp: "Czechoslovakia",
    runnerUpCode: "CZE",
    topScorerName: "Oldřich Nejedlý",
    topScorerCountry: "CZE",
    topScorerGoals: 5
  },
  "1930": {
    year: "1930",
    host: "Uruguay",
    championCode: "URU",
    championName: "Uruguay",
    runnerUp: "Argentina",
    runnerUpCode: "ARG",
    topScorerName: "Guillermo Stábile",
    topScorerCountry: "ARG",
    topScorerGoals: 8
  }
};

export const yearsList = [
  "2022", "2018", "2014", "2010", "2006", "2002", "1998", "1994", "1990", 
  "1986", "1982", "1978", "1974", "1970", "1966", "1962", "1958", "1954", 
  "1950", "1938", "1934", "1930"
];
