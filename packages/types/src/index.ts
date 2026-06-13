export interface Team {
  id: string;
  name: string;
  code: string; // E.g., "USA", "MEX", "CAN"
  flag: string; // Emoji or SVG URL
  confederation: string; // E.g., "CONCACAF", "UEFA", "CONMEBOL"
  group: string; // E.g., "A", "B", ... "L"
}

export interface GroupTeamStats {
  teamId: string;
  teamName: string;
  teamCode: string;
  teamFlag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[]; // E.g., ['W', 'D', 'L', 'W', 'W']
}

export interface Group {
  name: string; // E.g., "Group A"
  standings: GroupTeamStats[];
}

export interface MatchScorer {
  playerName: string;
  minute: number;
  isPenalty?: boolean;
  isOwnGoal?: boolean;
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'card_yellow' | 'card_red' | 'substitution';
  minute: number;
  teamId: string;
  playerOne: string; // Scorer, carded player, player off
  playerTwo?: string; // Assist provider, player on
  detail?: string; // E.g., "Penalty", "Second yellow"
  score?: string; // Match score at the time of the event
  isPenalty?: boolean; // Whether the event is a penalty
  clockDisplay?: string; // E.g. "45+2"
}

export interface MatchStats {
  possession: { home: number; away: number }; // E.g., { home: 55, away: 45 }
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
}

export interface MatchLineupPlayer {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
}

export interface MatchLineup {
  formation: string; // E.g., "4-3-3"
  startingXI: MatchLineupPlayer[];
  substitutes: MatchLineupPlayer[];
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number; // Null or undefined if upcoming
  awayScore?: number; // Null or undefined if upcoming
  status: 'upcoming' | 'live' | 'completed';
  homePenaltyScore?: number; // For matches decided by penalties
  awayPenaltyScore?: number; // For matches decided by penalties
  clock?: string; // Live match clock (e.g. 34')
  minute?: number; // E.g., 45 (or 45+2), undefined if not live
  datetime: string; // ISO 8601 string
  group: string; // E.g., "Group A"
  stadium: string;
  city: string;
  scorers: MatchScorer[];
  events: MatchEvent[];
  stats?: MatchStats;
  lineups?: {
    home: MatchLineup;
    away: MatchLineup;
  };
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  club: string;
  age: number;
  tournamentStats: {
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
  };
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: 'USA' | 'Mexico' | 'Canada';
  capacity: number;
  matchesPlayed: string[]; // Match IDs
  description?: string;
  imageUrl?: string;
}

export interface CleanSheetEntry {
  teamId: string;
  teamName: string;
  cleanSheets: number;
  teamCode: string;
  teamFlag: string;
}

export interface PlayerLeaderboards {
  goals: Player[];
  assists: Player[];
  yellowCards: Player[];
  redCards: Player[];
  minutes: Player[];
  cleanSheets: CleanSheetEntry[];
}