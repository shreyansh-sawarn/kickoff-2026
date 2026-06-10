import React from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { getCountryFlag } from "@wc26/utils";
import { useRouter } from "expo-router";
import { useMobileDashboard } from "./hooks/useMobileDashboard";
import { MobileCountdownBanner, MobileFixtureCard, MobileGroupTable } from "./components/DashboardComponents";
import { styles } from "./utils/styles";

export default function Native() {
  const router = useRouter();
  const state = useMobileDashboard();
  const {
    activeTab,
    setActiveTab,
    matches,
    standings,
    loading,
    countdown,
    favorites,
    predictions,
    isTournamentOver,
    fetchData,
    savePrediction,
    calculatePoints,
    liveMatches,
    upcomingMatches,
    starredMatches,
  } = state;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Image source={require("../assets/logo.png")} style={{ width: 28, height: 28, marginRight: 6, resizeMode: "contain" }} />
          <Text style={styles.headerText}>KICKOFF 2026</Text>
        </View>
        <TouchableOpacity onPress={fetchData} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(["dashboard", "matches", "standings", "predictions"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && matches.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Drafting squads...</Text>
        </View>
      ) : (
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Countdown Banner */}
          <MobileCountdownBanner
            isTournamentOver={isTournamentOver}
            countdown={countdown}
          />

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <View style={styles.section}>
              {/* Starred matches */}
              {starredMatches.length > 0 && (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionTitleFav}>⭐️ STARRED TEAM FIXTURES</Text>
                  {starredMatches.map((match) => (
                    <MobileFixtureCard
                      key={match.id}
                      match={match}
                      onPress={() => router.push("/match/" + match.id)}
                      highlightBorderColor="#fbbf24"
                    />
                  ))}
                </View>
              )}

              {/* Live Ticker */}
              {liveMatches.length > 0 && (
                <View style={styles.sectionBlock}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.liveIndicatorDot} />
                    <Text style={styles.sectionTitleLive}>LIVE MATCHES ({liveMatches.length})</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.liveScroll}>
                    {liveMatches.map((match) => (
                      <TouchableOpacity
                        key={match.id}
                        onPress={() => router.push("/match/" + match.id)}
                        style={styles.liveCard}
                      >
                        <View style={styles.liveCardHeader}>
                          <Text style={styles.liveCardGroup}>{match.group}</Text>
                          <Text style={styles.liveCardTime}>Live {match.minute}'</Text>
                        </View>
                        <View style={styles.liveCardTeamsRow}>
                          <View style={styles.liveCardTeam}>
                            <Text style={styles.flag}>{getCountryFlag(match.homeTeam.code)}</Text>
                            <Text style={styles.teamName} numberOfLines={1}>{match.homeTeam.code}</Text>
                          </View>
                          <View style={styles.liveCardScoreContainer}>
                            <Text style={styles.liveCardScore}>
                              {match.homeScore} : {match.awayScore}
                            </Text>
                          </View>
                          <View style={styles.liveCardTeam}>
                            <Text style={styles.flag}>{getCountryFlag(match.awayTeam.code)}</Text>
                            <Text style={styles.teamName} numberOfLines={1}>{match.awayTeam.code}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Upcoming Highlights */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>UPCOMING FIXTURES</Text>
                {upcomingMatches.slice(0, 3).map((match) => (
                  <MobileFixtureCard
                    key={match.id}
                    match={match}
                    onPress={() => router.push("/match/" + match.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* MATCHES TAB */}
          {activeTab === "matches" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>FULL MATCH SCHEDULE</Text>
              {matches.map((match) => (
                <MobileFixtureCard
                  key={match.id}
                  match={match}
                  onPress={() => router.push("/match/" + match.id)}
                />
              ))}
            </View>
          )}

          {/* STANDINGS TAB */}
          {activeTab === "standings" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>GROUP STANDINGS</Text>
              {standings.slice(0, 4).map((group, groupIdx) => (
                <MobileGroupTable
                  key={groupIdx}
                  group={group}
                />
              ))}
            </View>
          )}

          {/* PREDICTIONS TAB */}
          {activeTab === "predictions" && (
            <View style={styles.section}>
              <View style={styles.predHeader}>
                <Text style={styles.sectionTitle}>SCORE PREDICTOR GAME</Text>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsLabel}>SCORE: </Text>
                  <Text style={styles.pointsText}>{calculatePoints()} pts</Text>
                </View>
              </View>

              {upcomingMatches.map((match) => {
                const pred = predictions[match.id] || { home: 0, away: 0 };
                return (
                  <View key={match.id} style={styles.predCard}>
                    <View style={styles.predTeamsColumn}>
                      <View style={styles.predTeamRow}>
                        <Text style={styles.fixtureFlag}>{getCountryFlag(match.homeTeam.code)}</Text>
                        <Text style={styles.fixtureTeamText}>{match.homeTeam.code}</Text>
                      </View>
                      <View style={[styles.predTeamRow, { marginTop: 10 }]}>
                        <Text style={styles.fixtureFlag}>{getCountryFlag(match.awayTeam.code)}</Text>
                        <Text style={styles.fixtureTeamText}>{match.awayTeam.code}</Text>
                      </View>
                    </View>

                    <View style={styles.predInputsRow}>
                      <TextInput
                        keyboardType="numeric"
                        defaultValue={String(pred.home)}
                        onChangeText={(text) => savePrediction(match.id, "home", text)}
                        style={styles.predInput}
                      />
                      <Text style={styles.predColon}>:</Text>
                      <TextInput
                        keyboardType="numeric"
                        defaultValue={String(pred.away)}
                        onChangeText={(text) => savePrediction(match.id, "away", text)}
                        style={styles.predInput}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ by Shreyansh</Text>
      </View>
    </SafeAreaView>
  );
}
