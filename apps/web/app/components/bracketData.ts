export interface BracketMatch {
  home: string;
  away: string;
  score?: string;
  winner?: string;
  date: string;
  time: string;
  homeSeed: string;
  awaySeed: string;
  matchId?: string;
  label?: string;
  isFinal?: boolean;
  isThirdPlace?: boolean;
}

export interface BracketRound {
  title: string;
  key: string;
  matches: BracketMatch[];
}

export const rounds: BracketRound[] = [
  {
    title: "Round of 32",
    key: "r32",
    matches: [
      { home: "2A", away: "2B", score: undefined, winner: undefined, date: "Jun 29", time: "00:30", homeSeed: "2A", awaySeed: "2B", matchId: undefined },
      { home: "1C", away: "2F", score: undefined, winner: undefined, date: "Jun 29", time: "22:30", homeSeed: "1C", awaySeed: "2F", matchId: undefined },
      { home: "1E", away: "3A/3B/3C/3D/3F", score: undefined, winner: undefined, date: "Jun 30", time: "02:00", homeSeed: "1E", awaySeed: "3rd", matchId: undefined },
      { home: "1F", away: "2C", score: undefined, winner: undefined, date: "Jun 30", time: "06:30", homeSeed: "1F", awaySeed: "2C", matchId: undefined },
      { home: "2E", away: "2I", score: undefined, winner: undefined, date: "Jun 30", time: "22:30", homeSeed: "2E", awaySeed: "2I", matchId: undefined },
      { home: "1I", away: "3C/3D/3F/3G/3H", score: undefined, winner: undefined, date: "Jul 1", time: "02:30", homeSeed: "1I", awaySeed: "3rd", matchId: undefined },
      { home: "1A", away: "3C/3E/3F/3H/3I", score: undefined, winner: undefined, date: "Jul 1", time: "06:30", homeSeed: "1A", awaySeed: "3rd", matchId: undefined },
      { home: "1L", away: "3E/3H/3I/3J/3K", score: undefined, winner: undefined, date: "Jul 1", time: "21:30", homeSeed: "1L", awaySeed: "3rd", matchId: undefined },
      { home: "1G", away: "3A/3E/3H/3I/3J", score: undefined, winner: undefined, date: "Jul 2", time: "01:30", homeSeed: "1G", awaySeed: "3rd", matchId: undefined },
      { home: "2D", away: "2G", score: undefined, winner: undefined, date: "Jul 2", time: "06:30", homeSeed: "2D", awaySeed: "2G", matchId: undefined },
      { home: "1H", away: "2E", score: undefined, winner: undefined, date: "Jul 2", time: "22:30", homeSeed: "1H", awaySeed: "2E", matchId: undefined },
      { home: "1J", away: "2K", score: undefined, winner: undefined, date: "Jul 3", time: "02:30", homeSeed: "1J", awaySeed: "2K", matchId: undefined },
      { home: "1K", away: "3I/3J/3K/3L", score: undefined, winner: undefined, date: "Jul 3", time: "06:30", homeSeed: "1K", awaySeed: "3rd", matchId: undefined },
      { home: "2C", away: "2H", score: undefined, winner: undefined, date: "Jul 3", time: "21:30", homeSeed: "2C", awaySeed: "2H", matchId: undefined },
      { home: "1G", away: "3A/3B/3C/3D", score: undefined, winner: undefined, date: "Jul 4", time: "01:30", homeSeed: "1G", awaySeed: "3rd", matchId: undefined },
      { home: "1D", away: "2L", score: undefined, winner: undefined, date: "Jul 4", time: "06:30", homeSeed: "1D", awaySeed: "2L", matchId: undefined },
    ]
  },
  {
    title: "Round of 16",
    key: "r16",
    matches: [
      { home: "USA", away: "ESP", score: "2 - 1", winner: "USA", date: "Jul 3", time: "18:00", homeSeed: "1A", awaySeed: "2B", matchId: "m-1" },
      { home: "FRA", away: "CMR", score: "3 - 2", winner: "FRA", date: "Jul 4", time: "15:00", homeSeed: "1C", awaySeed: "2D", matchId: "m-live-1" },
      { home: "CAN", away: "MAR", score: "1 - 0", winner: "CAN", date: "Jul 5", time: "18:00", homeSeed: "1B", awaySeed: "2C", matchId: "m-3" },
      { home: "GER", away: "JPN", score: "2 - 0", winner: "GER", date: "Jul 5", time: "21:00", homeSeed: "1D", awaySeed: "2E", matchId: "m-3" },
      { home: "ARG", away: "ENG", score: "2 - 1", winner: "ARG", date: "Jul 6", time: "15:00", homeSeed: "1G", awaySeed: "2H", matchId: "m-live-2" },
      { home: "SEN", away: "KSA", score: "2 - 1", winner: "SEN", date: "Jul 6", time: "18:00", homeSeed: "1H", awaySeed: "2G", matchId: "m-5" },
      { home: "BRA", away: "POR", score: "4 - 2", winner: "BRA", date: "Jul 7", time: "18:00", homeSeed: "1I", awaySeed: "2J", matchId: "m-4" },
      { home: "EGY", away: "KOR", score: "0 - 1", winner: "KOR", date: "Jul 7", time: "21:00", homeSeed: "2I", awaySeed: "1J", matchId: "m-4" },
    ]
  },
  {
    title: "Quarterfinals",
    key: "qf",
    matches: [
      { home: "USA", away: "FRA", score: "1 - 2", winner: "FRA", date: "Jul 10", time: "18:00", homeSeed: "W1", awaySeed: "W2", matchId: "m-1" },
      { home: "CAN", away: "GER", score: "2 - 1", winner: "CAN", date: "Jul 11", time: "21:00", homeSeed: "W3", awaySeed: "W4", matchId: "m-3" },
      { home: "ARG", away: "SEN", score: "3 - 0", winner: "ARG", date: "Jul 12", time: "15:00", homeSeed: "W5", awaySeed: "W6", matchId: "m-live-2" },
      { home: "BRA", away: "KOR", score: "3 - 1", winner: "BRA", date: "Jul 13", time: "18:00", homeSeed: "W7", awaySeed: "W8", matchId: "m-4" },
    ]
  },
  {
    title: "Semifinals",
    key: "sf",
    matches: [
      { home: "FRA", away: "CAN", score: "1 - 2", winner: "CAN", date: "Jul 15", time: "18:00", homeSeed: "QF1", awaySeed: "QF2", matchId: "m-3" },
      { home: "ARG", away: "BRA", score: "1 - 2", winner: "BRA", date: "Jul 16", time: "21:00", homeSeed: "QF3", awaySeed: "QF4", matchId: "m-4" },
    ]
  },
  {
    title: "Final",
    key: "final",
    matches: [
      { home: "CAN", away: "BRA", score: "1 - 2", winner: "BRA", date: "Jul 19", time: "18:00", homeSeed: "SF1", awaySeed: "SF2", matchId: "m-4" },
    ]
  }
];
