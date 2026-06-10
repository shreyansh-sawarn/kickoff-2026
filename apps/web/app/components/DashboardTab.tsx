import React from "react";
import { Match, Group } from "@wc26/types";
import { getFlagCdnUrl, formatMatchTime, formatMatchDate } from "@wc26/utils";
import { DashboardFavorites } from "./DashboardFavorites";
import { DashboardLiveCarousel, DashboardNewsCarousel } from "./DashboardLiveCarousel";
import { DashboardStandingsSummary } from "./DashboardStandingsSummary";

interface DashboardTabProps {
  starredMatches: Match[];
  liveMatches: Match[];
  upcomingMatches: Match[];
  standings: Group[];
  favorites: string[];
  t: (key: string) => string;
  router: { push: (url: string) => void };
  setActiveTab: (tab: any) => void;
}

export default function DashboardTab({
  starredMatches,
  liveMatches,
  upcomingMatches,
  standings,
  favorites,
  t,
  router,
  setActiveTab
}: DashboardTabProps) {
  return (
    <div className="space-y-8">
      {/* Pinned Starred Teams Feeds */}
      <DashboardFavorites 
        starredMatches={starredMatches} 
        t={t} 
        router={router} 
      />

      {/* Live Scores Ticker */}
      <DashboardLiveCarousel 
        liveMatches={liveMatches} 
        upcomingMatches={upcomingMatches} 
        t={t} 
        router={router} 
      />

      {/* Dashboard layout blocks: Upcoming Fixtures & Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upcoming matches */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase text-emerald-400 tracking-wider">{t("upcomingFixtures")}</h3>
            <button 
              onClick={() => setActiveTab("matches")}
              className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
            >
              View Full Schedule →
            </button>
          </div>

          <div className="space-y-4">
            {upcomingMatches.slice(0, 3).map((match) => (
              <div 
                key={match.id}
                onClick={() => router.push(`/matches/${match.id}`)}
                className="bg-[#131b2e] border border-slate-800/60 rounded-xl p-4 flex items-center justify-between hover:border-slate-700/60 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-8 h-5 relative overflow-hidden rounded shadow-sm shrink-0">
                    <img src={getFlagCdnUrl(match.homeTeam.code)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-semibold text-sm text-slate-200 hidden sm:inline-block w-28 line-clamp-1">{match.homeTeam.name}</span>
                  <span className="font-bold text-xs text-slate-200 sm:hidden">{match.homeTeam.code}</span>
                  
                  <span className="text-slate-500 font-bold text-xs">VS</span>
                  
                  <span className="font-semibold text-sm text-slate-200 hidden sm:inline-block w-28 line-clamp-1 text-right">{match.awayTeam.name}</span>
                  <span className="font-bold text-xs text-slate-200 sm:hidden text-right">{match.awayTeam.code}</span>
                  <div className="w-8 h-5 relative overflow-hidden rounded shadow-sm shrink-0">
                    <img src={getFlagCdnUrl(match.awayTeam.code)} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="text-right pl-4 border-l border-slate-800/80 flex flex-col justify-center">
                  <span className="text-emerald-400 font-black text-sm">{formatMatchTime(match.datetime)}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{formatMatchDate(match.datetime)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Mini Standing */}
        <DashboardStandingsSummary standings={standings} setActiveTab={setActiveTab} />
      </div>

      {/* Live Stats Quick-View Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Top Scorer */}
        <div 
          onClick={() => setActiveTab("players")}
          className="bg-gradient-to-tr from-emerald-500/10 to-slate-900/60 border border-emerald-500/10 hover:border-emerald-500/30 p-4 rounded-2xl cursor-pointer hover:shadow-lg transition duration-300 flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wider block">Top Scorer</span>
            <div className="font-extrabold text-white text-sm group-hover:text-emerald-400 transition">TBD</div>
            <span className="text-[10px] text-slate-505 font-semibold block">0 Goals</span>
          </div>
          <span className="text-2xl filter drop-shadow group-hover:scale-110 transition duration-300">⚽</span>
        </div>

        {/* Card 2: Knockout Stage */}
        <div 
          onClick={() => setActiveTab("knockout")}
          className="bg-gradient-to-tr from-rose-500/10 to-slate-900/60 border border-rose-500/10 hover:border-rose-500/30 p-4 rounded-2xl cursor-pointer hover:shadow-lg transition duration-300 flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wider block">Knockout Stage</span>
            <div className="font-extrabold text-white text-sm group-hover:text-rose-400 transition">Road to Final</div>
            <span className="text-[10px] text-slate-505 font-semibold block">32 Teams Advance</span>
          </div>
          <span className="text-2xl filter drop-shadow group-hover:scale-110 transition duration-300">⚔️</span>
        </div>

        {/* Card 3: Teams */}
        <div 
          onClick={() => setActiveTab("teams")}
          className="bg-gradient-to-tr from-blue-500/10 to-slate-900/60 border border-blue-500/10 hover:border-blue-500/30 p-4 rounded-2xl cursor-pointer hover:shadow-lg transition duration-300 flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-wider block">Teams</span>
            <div className="font-extrabold text-white text-sm group-hover:text-blue-400 transition">48 Nations</div>
            <span className="text-[10px] text-slate-505 font-semibold block">Expanded Format</span>
          </div>
          <span className="text-2xl filter drop-shadow group-hover:scale-110 transition duration-300">🌍</span>
        </div>

        {/* Card 4: Stadiums */}
        <div 
          onClick={() => setActiveTab("stadiums")}
          className="bg-gradient-to-tr from-amber-500/10 to-slate-900/60 border border-amber-500/10 hover:border-amber-500/30 p-4 rounded-2xl cursor-pointer hover:shadow-lg transition duration-300 flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-slate-455 font-extrabold uppercase tracking-wider block">Stadiums</span>
            <div className="font-extrabold text-white text-sm group-hover:text-amber-400 transition">16 Host Venues</div>
            <span className="text-[10px] text-slate-505 font-semibold block">US, Mexico, Canada</span>
          </div>
          <span className="text-2xl filter drop-shadow group-hover:scale-110 transition duration-300">🏟️</span>
        </div>
      </div>

      {/* World Cup News & Highlights Carousel */}
      <DashboardNewsCarousel />
    </div>
  );
}
