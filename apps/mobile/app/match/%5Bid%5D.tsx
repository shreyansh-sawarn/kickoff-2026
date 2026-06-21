import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getMatchById } from "@wc26/api";
import { Match } from "@wc26/types";
import { getCountryFlag, formatMatchDate, formatMatchTime } from "@wc26/utils";
import { StatusBar } from "expo-status-bar";

export default function MatchDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const matchId = Array.isArray(id) ? id[0] : id;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"lineup" | "stats" | "events">("lineup");

  useEffect(() => {
    async function loadMatch() {
      try {
        setLoading(true);
        if (matchId) {
          const data = await getMatchById(matchId);
          if (data) setMatch(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMatch();
  }, [matchId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Fetching lineup sheets...</Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Match not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{match.group}</Text>
        <View style={{ width: 60 }} /> {/* Spacer */}
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Score Banner */}
        <View style={styles.scoreBanner}>
          <Text style={styles.stadiumText}>{match.stadium}</Text>
          <Text style={styles.cityText}>{match.city}</Text>

          <View style={styles.matchTeamsRow}>
            {/* Home Team */}
            <View style={styles.teamCol}>
              <Text style={styles.flagLarge}>{getCountryFlag(match.homeTeam.code)}</Text>
              <Text style={styles.teamNameText} numberOfLines={1}>{match.homeTeam.name}</Text>
              <Text style={styles.codeText}>{match.homeTeam.code}</Text>
            </View>

            {/* Score */}
            <View style={styles.scoreCol}>
              {match.status === "upcoming" ? (
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>{formatMatchTime(match.datetime)}</Text>
                  <Text style={styles.dateText}>{formatMatchDate(match.datetime)}</Text>
                </View>
              ) : (
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>
                    {match.homeScore} : {match.awayScore}
                  </Text>
                  {match.status === "live" ? (
                    <Text style={styles.liveLabel}>LIVE {match.minute}'</Text>
                  ) : (
                    <Text style={styles.finalLabel}>FT</Text>
                  )}
                </View>
              )}
            </View>

            {/* Away Team */}
            <View style={styles.teamCol}>
              <Text style={styles.flagLarge}>{getCountryFlag(match.awayTeam.code)}</Text>
              <Text style={styles.teamNameText} numberOfLines={1}>{match.awayTeam.name}</Text>
              <Text style={styles.codeText}>{match.awayTeam.code}</Text>
            </View>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabsRow}>
          {(
            [
              { id: "lineup", label: "Lineups" },
              { id: "stats", label: "Stats" },
              { id: "events", label: "Events" },
            ] as const
          ).map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveSubTab(tab.id)}
              style={[styles.subTabButton, activeSubTab === tab.id && styles.subTabActive]}
            >
              <Text style={[styles.subTabLabel, activeSubTab === tab.id && styles.subTabActiveLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LINEUPS TAB */}
        {activeSubTab === "lineup" && (
          <View style={styles.tabContent}>
            {match.lineups ? (
              <View style={styles.lineupLayout}>
                {/* Home starting XI */}
                <View style={styles.lineupBlock}>
                  <Text style={styles.teamLineupTitle}>{match.homeTeam.code} Starting XI</Text>
                  {match.lineups.home.startingXI.map((player) => (
                    <View key={player.id} style={styles.playerRow}>
                      <View style={styles.numberBadge}>
                        <Text style={styles.numberText}>{player.number}</Text>
                      </View>
                      <Text style={styles.playerName}>{player.name}</Text>
                      <Text style={styles.playerPosition}>{player.position}</Text>
                    </View>
                  ))}
                </View>

                {/* Away starting XI */}
                <View style={styles.lineupBlock}>
                  <Text style={styles.teamLineupTitle}>{match.awayTeam.code} Starting XI</Text>
                  {match.lineups.away.startingXI.map((player) => (
                    <View key={player.id} style={styles.playerRow}>
                      <View style={styles.numberBadge}>
                        <Text style={styles.numberText}>{player.number}</Text>
                      </View>
                      <Text style={styles.playerName}>{player.name}</Text>
                      <Text style={styles.playerPosition}>{player.position}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.emptyBlock}>
                <Text style={styles.emptyText}>Lineups will be updated 1 hour before kickoff.</Text>
              </View>
            )}
          </View>
        )}

        {/* STATS TAB */}
        {activeSubTab === "stats" && (
          <View style={styles.tabContent}>
            {match.stats ? (
              <View style={styles.statsCard}>
                {/* Possession bar */}
                <View style={styles.statGroup}>
                  <View style={styles.statLabelRow}>
                    <Text style={styles.statTextBold}>{match.stats.possession.home}%</Text>
                    <Text style={styles.statLabel}>Possession</Text>
                    <Text style={styles.statTextBold}>{match.stats.possession.away}%</Text>
                  </View>
                  <View style={styles.statBarBg}>
                    <View style={[styles.statBarHome, { width: `${match.stats.possession.home}%` }]} />
                    <View style={[styles.statBarAway, { width: `${match.stats.possession.away}%` }]} />
                  </View>
                </View>

                {/* Grid Comparison */}
                {(
                  [
                    { label: "Shots", key: "shots" },
                    { label: "Shots on Target", key: "shotsOnTarget" },
                    { label: "Corners", key: "corners" },
                    { label: "Fouls", key: "fouls" },
                    { label: "Yellow Cards", key: "yellowCards" },
                    { label: "Red Cards", key: "redCards" },
                  ] as const
                ).map((item) => {
                  const homeVal = match.stats?.[item.key]?.home || 0;
                  const awayVal = match.stats?.[item.key]?.away || 0;
                  const total = homeVal + awayVal || 1;
                  const homePercent = (homeVal / total) * 100;

                  return (
                    <View key={item.key} style={styles.statCompareRow}>
                      <View style={styles.statLabelRow}>
                        <Text style={styles.statValueText}>{homeVal}</Text>
                        <Text style={styles.statLabel}>{item.label}</Text>
                        <Text style={styles.statValueText}>{awayVal}</Text>
                      </View>
                      <View style={styles.statBarBgMini}>
                        <View style={[styles.statBarHomeMini, { width: `${homePercent}%` }]} />
                        <View style={[styles.statBarAwayMini, { width: `${100 - homePercent}%` }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyBlock}>
                <Text style={styles.emptyText}>Statistics will show in real time during the match.</Text>
              </View>
            )}
          </View>
        )}

        {/* EVENTS TAB */}
        {activeSubTab === "events" && (
          <View style={styles.tabContent}>
            {match.events && match.events.length > 0 ? (
              <View style={styles.eventsCard}>
                {match.events.filter(e => e.type !== "assist").map((event) => {
                  const isHome = event.teamId === match.homeTeam.id;
                  
                  return (
                    <View key={event.id} style={[styles.eventRow, isHome ? styles.eventHome : styles.eventAway]}>
                      <View style={styles.eventTimeBadge}>
                        <Text style={styles.eventTimeText}>{event.minute}'</Text>
                      </View>
                      <View style={styles.eventDetails}>
                        <Text style={styles.eventPlayerText}>
                          {event.type === "goal" && "⚽ "}
                          {event.type === "card_yellow" && "🟨 "}
                          {event.type === "card_red" && "🟥 "}
                          {event.type === "substitution" && "🔄 "}
                          {event.playerOne}
                        </Text>
                        {event.playerTwo && (
                          <Text style={styles.eventAssistText}>
                            {event.type === "substitution" ? `In: ${event.playerTwo}` : `Assist: ${event.playerTwo}`}
                          </Text>
                        )}
                        {event.detail && <Text style={styles.eventDetailText}>{event.detail}</Text>}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyBlock}>
                <Text style={styles.emptyText}>Match timeline events will be listed here.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b0f19",
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0b0f19",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#10b981",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backBtnText: {
    color: "#10b981",
    fontWeight: "bold",
    fontSize: 14,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  scoreBanner: {
    backgroundColor: "#131b2e",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  stadiumText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: "750",
    textAlign: "center",
  },
  cityText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  matchTeamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  teamCol: {
    alignItems: "center",
    width: "30%",
  },
  flagLarge: {
    fontSize: 48,
    marginBottom: 6,
  },
  teamNameText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  codeText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
  },
  scoreCol: {
    alignItems: "center",
    width: "40%",
  },
  scoreBadge: {
    backgroundColor: "#0b0f19",
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  scoreText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
  liveLabel: {
    color: "#ef4444",
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 4,
  },
  finalLabel: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 4,
  },
  timeBadge: {
    backgroundColor: "#0b0f19",
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  timeText: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "800",
  },
  dateText: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(19, 27, 46, 0.4)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  subTabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  subTabActive: {
    backgroundColor: "#10b981",
  },
  subTabLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "750",
  },
  subTabActiveLabel: {
    color: "#fff",
  },
  tabContent: {
    marginBottom: 40,
  },
  lineupLayout: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lineupBlock: {
    backgroundColor: "#131b2e",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 12,
    width: "48%",
  },
  teamLineupTitle: {
    color: "#10b981",
    fontSize: 11,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    paddingBottom: 6,
    marginBottom: 8,
    textAlign: "center",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  numberBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#0b0f19",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  numberText: {
    color: "#10b981",
    fontSize: 9,
    fontWeight: "bold",
  },
  playerName: {
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  playerPosition: {
    color: "#64748b",
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statsCard: {
    backgroundColor: "#131b2e",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
  },
  statGroup: {
    marginBottom: 16,
  },
  statLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statTextBold: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
  },
  statBarBg: {
    height: 8,
    backgroundColor: "#0b0f19",
    borderRadius: 99,
    flexDirection: "row",
    overflow: "hidden",
  },
  statBarHome: {
    backgroundColor: "#10b981",
    height: "100%",
  },
  statBarAway: {
    backgroundColor: "#fbbf24",
    height: "100%",
  },
  statCompareRow: {
    borderTopWidth: 1,
    borderTopColor: "rgba(30, 41, 59, 0.4)",
    paddingTop: 10,
    marginTop: 10,
  },
  statValueText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  statBarBgMini: {
    height: 4,
    backgroundColor: "#0b0f19",
    borderRadius: 99,
    flexDirection: "row",
    overflow: "hidden",
    marginTop: 4,
  },
  statBarHomeMini: {
    backgroundColor: "#10b981",
    height: "100%",
  },
  statBarAwayMini: {
    backgroundColor: "#fbbf24",
    height: "100%",
  },
  eventsCard: {
    backgroundColor: "#131b2e",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(30, 41, 59, 0.3)",
  },
  eventHome: {
    justifyContent: "flex-start",
  },
  eventAway: {
    flexDirection: "row-reverse",
  },
  eventTimeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0b0f19",
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
  },
  eventTimeText: {
    color: "#10b981",
    fontSize: 10,
    fontWeight: "bold",
  },
  eventDetails: {
    flex: 1,
  },
  eventPlayerText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "750",
  },
  eventAssistText: {
    color: "#94a3b8",
    fontSize: 10,
    marginTop: 2,
  },
  eventDetailText: {
    color: "#fbbf24",
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 2,
  },
  emptyBlock: {
    backgroundColor: "#131b2e",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
  },
});
