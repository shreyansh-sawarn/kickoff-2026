// Flag Emoji Helper
// Converts ISO 3166-1 alpha-2 or standard FIFA country codes to Emoji Flags
export function getCountryFlag(countryCode: string): string {
  const code = countryCode.toUpperCase();
  
  // Custom mapping for FIFA specific codes (e.g. ENG, SCO, WAL, NIR, or others)
  const fifaMap: Record<string, string> = {
    // Hosts
    USA: "🇺🇸",
    MEX: "🇲🇽",
    CAN: "🇨🇦",
    // Conmebol
    ARG: "🇦🇷",
    BRA: "🇧🇷",
    COL: "🇨🇴",
    URU: "🇺🇾",
    ECU: "🇪🇨",
    PAR: "🇵🇾",
    CHI: "🇨🇱",
    VEN: "🇻🇪",
    BOL: "🇧🇴",
    PER: "🇵🇪",
    // Uefa
    ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    WAL: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
    NIR: "🏴󠁧󠁢󠁮󠁩󠁲󠁿",
    FRA: "🇫🇷",
    GER: "🇩🇪",
    ESP: "🇪🇸",
    ITA: "🇮🇹",
    POR: "🇵🇹",
    NED: "🇳🇱",
    BEL: "🇧🇪",
    CRO: "🇭🇷",
    SUI: "🇨🇭",
    DEN: "🇩🇰",
    AUT: "🇦🇹",
    TUR: "🇹🇷",
    UKR: "🇺🇦",
    POL: "🇵🇱",
    // Caf
    SEN: "🇸🇳",
    MAR: "🇲🇦",
    TUN: "🇹🇳",
    NGA: "🇳🇬",
    GHA: "🇬🇭",
    CMR: "🇨🇲",
    EGY: "🇪🇬",
    RSA: "🇿🇦",
    // Afc
    JPN: "🇯🇵",
    KOR: "🇰🇷",
    KSA: "🇸🇦",
    AUS: "🇦🇺",
    IRN: "🇮🇷",
    IRQ: "🇮🇶",
    QAT: "🇶🇦",
    UAE: "🇦🇪",
    // Concacaf
    CRC: "🇨🇷",
    PAN: "🇵🇦",
    JAM: "🇯🇲",
    HON: "🇭🇳",
    SLV: "🇸🇻",
    // Fallbacks
    UNITED_STATES: "🇺🇸",
    MEXICO: "🇲🇽",
    CANADA: "🇨🇦",
  };

  if (fifaMap[code]) {
    return fifaMap[code];
  }

  // If code is 2 characters, convert to emoji flag
  if (code.length === 2) {
    const codePoints = code
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    try {
      return String.fromCodePoint(...codePoints);
    } catch {
      return "🏳️";
    }
  }

  return "🏳️";
}

export function getFlagCdnUrl(countryCode: string): string {
  const c = countryCode.toUpperCase();
  if (c === "GDR") return "/flags/gdr.svg";
  if (c === "URS") return "/flags/urs.svg";
  if (c === "YUG") return "/flags/yug.svg";

  const map: Record<string, string> = {
    USA: "us", MEX: "mx", CAN: "ca", ARG: "ar", BRA: "br",
    COL: "co", URU: "uy", ECU: "ec", PAR: "py", CHI: "cl",
    VEN: "ve", BOL: "bo", PER: "pe", FRA: "fr", GER: "de",
    ESP: "es", ITA: "it", POR: "pt", NED: "nl", BEL: "be",
    CRO: "hr", SUI: "ch", DEN: "dk", AUT: "at", TUR: "tr",
    UKR: "ua", POL: "pl", SEN: "sn", MAR: "ma", TUN: "tn",
    NGA: "ng", GHA: "gh", CMR: "cm", EGY: "eg", RSA: "za",
    JPN: "jp", KOR: "kr", KSA: "sa", AUS: "au", IRN: "ir",
    IRQ: "iq", QAT: "qa", UAE: "ae", CRC: "cr", PAN: "pa",
    JAM: "jm", HON: "hn", SLV: "sv", ALG: "dz", SWE: "se",
    ENG: "gb-eng", SCO: "gb-sct", WAL: "gb-wls", NIR: "gb-nir",
    NZL: "nz", CPV: "cv", CIV: "ci", HAI: "ht", ANG: "ao",
    BUL: "bg", ROU: "ro", HUN: "hu", ISR: "il", CUB: "cu",
    PRK: "kp", IRL: "ie", SRB: "rs", SVN: "si", SVK: "sk",
    GRE: "gr", BIH: "ba", COD: "cd", CUW: "cw",
    FRG: "de", GDR: "de", URS: "ru", YUG: "rs", TCH: "cz",
    TOG: "tg", TRI: "tt", INA: "id", KUW: "kw", CHN: "cn"
  };
  const iso2 = map[c] || c.toLowerCase().substring(0, 2);
  return `https://flagcdn.com/w160/${iso2}.png`;
}

// Format ISO DateTime into a human-readable local time
export function formatMatchTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return "00:00";
    }
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "00:00";
  }
}

// Format ISO DateTime into a human-readable local date
export function formatMatchDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// Format Full Date Time
export function formatFullMatchDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// Returns the formatted match status or time remaining
export function getMatchStatusLabel(
  status: "upcoming" | "live" | "completed",
  minute?: number
): string {
  switch (status) {
    case "live":
      return `Live ${minute ? minute : 0}'`;
    case "completed":
      return "FT";
    case "upcoming":
    default:
      return "Upcoming";
  }
}

// Calculates predictor game score points for a single match
export function calculateMatchPredictionPoints(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number
): number {
  // 1. Exact match
  if (predHome === actualHome && predAway === actualAway) {
    return 3;
  }
  // 2. Correct outcome
  const predOutcome = predHome > predAway ? 1 : predHome < predAway ? -1 : 0;
  const actualOutcome = actualHome > actualAway ? 1 : actualHome < actualAway ? -1 : 0;
  if (predOutcome === actualOutcome) {
    return 1;
  }
  // 3. No match
  return 0;
}

// Format group or round identifier into standard user-facing uppercase names (e.g. R16, QF, Group A)
export function formatGroupOrRound(group: string): string {
  if (!group) return "";
  const g = group.toLowerCase().trim();
  if (g === "r32") return "R32";
  if (g === "r16") return "R16";
  if (g === "qf") return "QF";
  if (g === "sf") return "SF";
  if (g === "3rd") return "3rd Place";
  if (g === "final") return "2026 FIFA World Cup Final";
  if (g.startsWith("group")) {
    return group.charAt(0).toUpperCase() + group.slice(1);
  }
  return group;
}

