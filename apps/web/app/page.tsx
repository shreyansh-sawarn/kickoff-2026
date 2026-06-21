"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "./hooks/useDashboard";
import JsonLd, { generateMatchSchema, generateTeamSchema } from "./components/JsonLd";
import Header from "./components/Header";
import CountdownBanner from "./components/CountdownBanner";
import DashboardTab from "./components/DashboardTab";
import MatchesTab from "./components/MatchesTab";
import StandingsTab from "./components/StandingsTab";
import PredictorTab from "./components/PredictorTab";
import { TeamsTab } from "./components/TeamsTab";
import { BracketTab } from "./components/BracketTab";
import { PlayersTab } from "./components/PlayersTab";
import { StadiumsTab } from "./components/StadiumsTab";
import { ArchiveTab } from "./components/ArchiveTab";
import { AboutTab } from "./components/AboutTab";
import NewsTab from "./components/NewsTab";

export default function Web() {
  const router = useRouter();
  const state = useDashboard();
  const {
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
  } = state;

  return (
    <div className="bg-[#0b0f19] text-slate-100 min-h-screen pb-12">
      {/* Dynamic SEO Structured Schemas (JSON-LD) */}
      {matches?.slice(0, 10).map((m) => (
        <JsonLd key={`schema-match-${m.id}`} schema={generateMatchSchema(m)} />
      ))}
      {teams?.slice(0, 10).map((tData) => (
        <JsonLd key={`schema-team-${tData.id}`} schema={generateTeamSchema(tData)} />
      ))}

      {/* Premium Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        moreMenuOpen={moreMenuOpen}
        setMoreMenuOpen={setMoreMenuOpen}
        loading={loading}
        handleRefresh={handleRefresh}
        t={t}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading && matches.length === 0 ? (
          <div className="space-y-8 animate-pulse">
            {/* Header / Banner Skeleton */}
            <div className="h-40 bg-slate-800/40 rounded-3xl border border-slate-700/30"></div>
            
            {/* Grid Layout skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-slate-800/30 rounded-2xl border border-slate-700/20"></div>
                <div className="h-64 bg-slate-800/30 rounded-2xl border border-slate-700/20"></div>
              </div>
              {/* Right 1 Col Skeleton */}
              <div className="space-y-6">
                <div className="h-56 bg-slate-800/30 rounded-2xl border border-slate-700/20"></div>
                <div className="h-48 bg-slate-800/30 rounded-2xl border border-slate-700/20"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Countdown or Archival Winner Banner */}
            <CountdownBanner
              isTournamentOver={isTournamentOver}
              countdown={countdown}
            />

            {/* TAB CONTENTS */}
            {activeTab === "dashboard" && (
              <DashboardTab
                starredMatches={starredMatches}
                liveMatches={liveMatches}
                upcomingMatches={upcomingMatches}
                standings={standings}
                players={players}
                favorites={favorites}
                t={t}
                router={router}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "matches" && (
              <MatchesTab
                matches={matches}
                liveMatches={liveMatches}
                t={t}
                router={router}
              />
            )}

            {activeTab === "standings" && (
              <StandingsTab
                standings={standings}
                t={t}
              />
            )}

            {activeTab === "knockout" && (
              <BracketTab
                t={t}
                router={router}
                matches={matches}
              />
            )}

            {activeTab === "teams" && (
              <TeamsTab
                teams={teams}
                matches={matches}
                favorites={favorites}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                toggleFavorite={toggleFavorite}
                t={t}
              />
            )}

            {activeTab === "players" && (
              <PlayersTab
                players={players}
                t={t}
              />
            )}

            {activeTab === "stadiums" && (
              <StadiumsTab
                stadiums={stadiums}
                t={t}
              />
            )}

            {activeTab === "archive" && (
              <ArchiveTab
                t={t}
              />
            )}

            {activeTab === "predictions" && (
              <PredictorTab
                upcomingMatches={upcomingMatches}
                predictions={predictions}
                calculatePoints={calculatePoints}
                savePrediction={savePrediction}
                t={t}
              />
            )}

            {activeTab === "about" && (
              <AboutTab
                t={t}
              />
            )}

            {activeTab === "news" && (
              <NewsTab
                t={t}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/40 py-6 text-center text-xs text-slate-500 font-medium tracking-wide">
        Made with ❤️ by Shreyansh
      </footer>
    </div>
  );
}
