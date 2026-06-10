import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Match, Group } from "@wc26/types";
import { getCountryFlag, formatMatchDate, formatMatchTime } from "@wc26/utils";
import { styles } from "../utils/styles";

// --- COUNTDOWN BANNER ---
interface MobileCountdownBannerProps {
  isTournamentOver: boolean;
  countdown: { days: number; hours: number; minutes: number };
}

export function MobileCountdownBanner({ isTournamentOver, countdown }: MobileCountdownBannerProps) {
  return isTournamentOver ? (
    <View style={styles.concludedCard}>
      <Text style={styles.concludedTitle}>🏆 UNITED 2026 CONCLUDED</Text>
      <View style={styles.winnerBadge}>
        <Text style={styles.winnerBadgeText}>🏆 CHAMPIONS: ARGENTINA</Text>
      </View>
    </View>
  ) : (
    <View style={styles.countdownCard}>
      <Text style={styles.countdownTitle}>⚡ UNITED 2026 COUNTDOWN</Text>
      <View style={styles.countdownRow}>
        <View style={styles.countdownCol}>
          <Text style={styles.countdownVal}>{countdown.days}</Text>
          <Text style={styles.countdownLbl}>DAYS</Text>
        </View>
        <View style={styles.countdownCol}>
          <Text style={styles.countdownVal}>{countdown.hours}</Text>
          <Text style={styles.countdownLbl}>HOURS</Text>
        </View>
        <View style={styles.countdownCol}>
          <Text style={styles.countdownVal}>{countdown.minutes}</Text>
          <Text style={styles.countdownLbl}>MINUTES</Text>
        </View>
      </View>
    </View>
  );
}

// --- FIXTURE CARD ---
interface MobileFixtureCardProps {
  match: Match;
  onPress: () => void;
  highlightBorderColor?: string;
}

export function MobileFixtureCard({ match, onPress, highlightBorderColor }: MobileFixtureCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.fixtureCard,
        highlightBorderColor ? { borderColor: highlightBorderColor } : null
      ]}
    >
      <View style={styles.fixtureTeams}>
        <View style={styles.fixtureTeamRow}>
          <Text style={styles.fixtureFlag}>{getCountryFlag(match.homeTeam.code)}</Text>
          <Text style={styles.fixtureTeamText}>{match.homeTeam.name}</Text>
        </View>
        <View style={styles.fixtureTeamRow}>
          <Text style={styles.fixtureFlag}>{getCountryFlag(match.awayTeam.code)}</Text>
          <Text style={styles.fixtureTeamText}>{match.awayTeam.name}</Text>
        </View>
      </View>
      <View style={styles.fixtureTimeBlock}>
        {match.status === "upcoming" ? (
          <>
            <Text style={styles.fixtureTime}>{formatMatchTime(match.datetime)}</Text>
            <Text style={styles.fixtureDate}>{formatMatchDate(match.datetime)}</Text>
          </>
        ) : (
          <>
            <Text style={styles.matchScoreText}>{match.homeScore} - {match.awayScore}</Text>
            <Text style={[styles.fixtureDate, match.status === "live" && { color: "#ef4444" }]}>
              {match.status === "live" ? `LIVE ${match.minute}'` : "FINAL"}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

// --- GROUP TABLE ---
interface MobileGroupTableProps {
  group: Group;
}

export function MobileGroupTable({ group }: MobileGroupTableProps) {
  return (
    <View style={styles.groupBlock}>
      <Text style={styles.groupTitle}>{group.name}</Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.th, { flex: 1 }]}>TEAM</Text>
        <Text style={[styles.th, styles.thCenter]}>P</Text>
        <Text style={[styles.th, styles.thCenter]}>GD</Text>
        <Text style={[styles.th, styles.thCenter]}>PTS</Text>
      </View>
      {group.standings.map((stat, idx) => (
        <View key={stat.teamId} style={styles.tableRow}>
          <View style={styles.tableTeamCell}>
            <Text style={styles.tableRank}>{idx + 1}</Text>
            <Text style={styles.tableFlag}>{getCountryFlag(stat.teamCode)}</Text>
            <Text style={styles.tableTeamText}>{stat.teamCode}</Text>
          </View>
          <Text style={[styles.td, styles.tdCenter]}>{stat.played}</Text>
          <Text style={[styles.td, styles.tdCenter]}>
            {stat.goalDifference > 0 ? `+${stat.goalDifference}` : stat.goalDifference}
          </Text>
          <Text style={[styles.td, styles.tdCenter, styles.tdPoints]}>{stat.points}</Text>
        </View>
      ))}
    </View>
  );
}
