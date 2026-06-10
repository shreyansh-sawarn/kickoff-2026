import { useState, useEffect } from "react";
import { 
  getMatches, 
  getStandings, 
  getTeams 
} from "@wc26/api";
import { Match, Group, Team } from "@wc26/types";
import { calculateMatchPredictionPoints } from "@wc26/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "../utils/notifications";
import * as Notifications from "expo-notifications";

export type MobileTabType = "dashboard" | "matches" | "standings" | "predictions";

export function useMobileDashboard() {
  const [activeTab, setActiveTab] = useState<MobileTabType>("dashboard");
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Group[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  const [favorites, setFavorites] = useState<string[]>([]);
  const [predictions, setPredictions] = useState<Record<string, { home: number; away: number }>>({});
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  const isTournamentOver = Date.now() > new Date("2026-07-20T00:00:00Z").getTime();

  // Countdown to June 11, 2026
  useEffect(() => {
    const targetDate = new Date("2026-06-11T18:00:00Z").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference < 0) {
        clearInterval(interval);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setCountdown({ days, hours, minutes });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Register push notifications on mount
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Foreground notification received:", notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped/interacted:", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [m, s, t] = await Promise.all([
        getMatches(),
        getStandings(),
        getTeams(),
      ]);
      setMatches(m);
      setStandings(s);
      setTeams(t);

      // Load persistent states
      const savedFavs = await AsyncStorage.getItem("wc26-favorites");
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedPreds = await AsyncStorage.getItem("wc26-predictions");
      if (savedPreds) setPredictions(JSON.parse(savedPreds));
    } catch (err) {
      console.error("Error fetching mobile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleFavorite = async (teamId: string) => {
    const updated = favorites.includes(teamId)
      ? favorites.filter((id) => id !== teamId)
      : [...favorites, teamId];
    setFavorites(updated);
    await AsyncStorage.setItem("wc26-favorites", JSON.stringify(updated));
  };

  const savePrediction = async (matchId: string, team: "home" | "away", val: string) => {
    const scoreVal = parseInt(val);
    if (isNaN(scoreVal)) return;

    const current = predictions[matchId] || { home: 0, away: 0 };
    const updated = {
      ...predictions,
      [matchId]: {
        ...current,
        [team]: scoreVal,
      },
    };
    setPredictions(updated);
    await AsyncStorage.setItem("wc26-predictions", JSON.stringify(updated));
  };

  const calculatePoints = () => {
    let score = 0;
    matches.forEach((m) => {
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


  const liveMatches = matches.filter((m) => m.status === "live");
  const upcomingMatches = matches.filter((m) => m.status === "upcoming");
  const starredMatches = matches.filter((m) =>
    favorites.includes(m.homeTeam.id) || favorites.includes(m.awayTeam.id)
  );

  return {
    activeTab,
    setActiveTab,
    matches,
    standings,
    teams,
    loading,
    countdown,
    favorites,
    predictions,
    expoPushToken,
    isTournamentOver,
    fetchData,
    toggleFavorite,
    savePrediction,
    calculatePoints,
    liveMatches,
    upcomingMatches,
    starredMatches,
  };
}
