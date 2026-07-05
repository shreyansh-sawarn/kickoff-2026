import { useState, useEffect } from "react";
import { 
  getMatches, 
  getStandings, 
  getTeams, 
  getPlayers, 
  getStadiums 
} from "@wc26/api";
import { Match, Group, Team, Player, Stadium, PlayerLeaderboards } from "@wc26/types";
import { calculateMatchPredictionPoints } from "@wc26/utils";
import { TRANSLATIONS } from "../locales/translations";

export type TabType = "dashboard" | "matches" | "standings" | "teams" | "knockout" | "stadiums" | "players" | "archive" | "predictions" | "about" | "news";
export type SupportedLang = "en" | "es" | "pt" | "fr" | "zh" | "ja" | "ko";

export function useDashboard() {
  const [activeTab, setActiveTabState] = useState<TabType>("dashboard");

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const validTabs = ["dashboard", "matches", "standings", "teams", "knockout", "stadiums", "players", "archive", "predictions", "about", "news"];
    const getTabFromUrl = (): TabType => {
      const path = window.location.pathname.replace("/", "");
      if (validTabs.includes(path)) return path as TabType;
      
      const hash = window.location.hash.replace("#", "");
      if (validTabs.includes(hash)) return hash as TabType;
      
      return "dashboard";
    };

    setActiveTabState(getTabFromUrl());
    
    const handlePopState = () => {
      setActiveTabState(getTabFromUrl());
    };
    
    const handleHashChange = () => {
      setActiveTabState(getTabFromUrl());
    };
    
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);
 
  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      const newPath = tab === "dashboard" ? "/" : `/${tab}`;
      const params = new URLSearchParams(window.location.search);
      params.delete("filter");
      const searchStr = params.toString();
      const newUrl = searchStr ? `${newPath}?${searchStr}` : newPath;
      window.history.pushState(null, "", newUrl);
    }
  };

  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Group[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<PlayerLeaderboards | null>(null);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [lang, setLang] = useState<SupportedLang>("en");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const t = (key: string): string => {
    return TRANSLATIONS[lang]?.[key] || key;
  };

  // Calculate Countdown to World Cup 2026 Kickoff
  useEffect(() => {
    // Dynamically target the earliest upcoming match; fallback to opening match kickoff
    const getTarget = () => {
      const upcomingMatches = matches.filter(m => m.status === "upcoming" && m.datetime);
      if (upcomingMatches.length > 0) {
        const sorted = [...upcomingMatches].sort(
          (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        );
        return new Date(sorted[0].datetime).getTime();
      }
      // Fallback: Mexico vs South Africa opening kickoff (UTC)
      return new Date("2026-06-11T19:00:00Z").getTime();
    };

    const interval = setInterval(() => {
      const targetDate = getTarget();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference < 0) {
        clearInterval(interval);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [matches]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [m, s, tData, p, st] = await Promise.all([
        getMatches(),
        getStandings(),
        getTeams(),
        getPlayers(),
        getStadiums()
      ]);
      setMatches(m);
      setStandings(s);
      setTeams(tData);
      setPlayers(p);
      setStadiums(st);

      // Load persistent states
      if (typeof window !== "undefined") {
        const savedFavs = localStorage.getItem("wc26-favorites");
        if (savedFavs) setFavorites(JSON.parse(savedFavs));
        
        const savedPreds = localStorage.getItem("wc26-predictions");
        if (savedPreds) setPredictions(JSON.parse(savedPreds));

        const savedLang = localStorage.getItem("wc26-lang");
        if (savedLang && savedLang in TRANSLATIONS) {
          setLang(savedLang as SupportedLang);
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchesSilently = async () => {
    try {
      const m = await getMatches();
      setMatches(m);
    } catch (err) {
      console.error("Silent matches refresh failed:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Poll matches silently every 15 seconds in the background
    const interval = setInterval(() => {
      fetchMatchesSilently();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (teamId: string) => {
    const updated = favorites.includes(teamId)
      ? favorites.filter(id => id !== teamId)
      : [...favorites, teamId];
    setFavorites(updated);
    localStorage.setItem("wc26-favorites", JSON.stringify(updated));
  };

  const savePrediction = (matchId: string, team: "home" | "away", val: string) => {
    const scoreVal = parseInt(val);
    if (isNaN(scoreVal)) return;

    const current = predictions[matchId] || { home: 0, away: 0 };
    const updated = {
      ...predictions,
      [matchId]: {
        ...current,
        [team]: scoreVal
      }
    };
    setPredictions(updated);
    localStorage.setItem("wc26-predictions", JSON.stringify(updated));
  };

  const calculatePoints = () => {
    let score = 0;
    matches.forEach(m => {
      if (m.status === "completed" && predictions[m.id]) {
        const pred = predictions[m.id];
        const actualHome = m.homeScore ?? 0;
        const actualAway = m.awayScore ?? 0;

        score += calculateMatchPredictionPoints(
          pred.home,
          pred.away,
          actualHome,
          actualAway
        );
      }
    });
    return score;
  };


  const handleRefresh = () => {
    fetchData();
  };

  const liveMatches = matches.filter(m => m.status === "live");
  let upcomingMatches = matches.filter(m => m.status === "upcoming");
  let completedMatches = matches.filter(m => m.status === "completed");



  const starredMatches = matches.filter(m => 
    favorites.includes(m.homeTeam.id) || favorites.includes(m.awayTeam.id)
  );

  const isTournamentOver = Date.now() > new Date("2026-07-20T00:00:00Z").getTime();

  return {
    activeTab,
    setActiveTab,
    matches,
    standings,
    teams,
    players,
    stadiums,
    loading,
    favorites,
    predictions,
    lang,
    setLang,
    searchQuery,
    setSearchQuery,
    countdown,
    moreMenuOpen,
    setMoreMenuOpen,
    t,
    toggleFavorite,
    savePrediction,
    calculatePoints,
    handleRefresh,
    liveMatches,
    upcomingMatches,
    starredMatches,
    isTournamentOver
  };
}
