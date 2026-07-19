import React from "react";
import { Match, Group, PlayerLeaderboards } from "@wc26/types";
import { getFlagCdnUrl, formatMatchTime, formatMatchDate } from "@wc26/utils";
import { DashboardFavorites } from "./DashboardFavorites";
import { DashboardLiveCarousel, DashboardNewsCarousel } from "./DashboardLiveCarousel";
import { DashboardStandingsSummary } from "./DashboardStandingsSummary";
import { FlagOrShield } from "./FlagOrShield";

interface DashboardTabProps {
  isTournamentOver?: boolean;
  starredMatches: Match[];
  liveMatches: Match[];
  upcomingMatches: Match[];
  standings: Group[];
  players: PlayerLeaderboards | null;
  favorites: string[];
  t: (key: string) => string;
  router: { push: (url: string) => void };
  setActiveTab: (tab: any) => void;
}

export default function DashboardTab({
  isTournamentOver,
  starredMatches,
  liveMatches,
  upcomingMatches,
  standings,
  players,
  favorites,
  t,
  router,
  setActiveTab
}: DashboardTabProps) {
  const topScorer = players?.goals && players.goals.length > 0 ? players.goals[0] : null;

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
      {isTournamentOver ? (
        <div className="bg-gradient-to-br from-amber-500/20 via-[#131b2e] to-slate-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full"></div>
          
          <div className="z-10 flex flex-col items-center text-center space-y-6">
            <span className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 drop-shadow-sm">World Champions</span>
            <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
              <FlagOrShield code="ar" className="w-24 h-16 rounded-xl shadow-lg shrink-0" imgClassName="object-cover" />
              <div className="flex flex-col sm:items-start items-center">
                <span className="text-4xl sm:text-5xl font-black text-white uppercase tracking-widest drop-shadow-sm text-center sm:text-left">Argentina</span>
                <span className="text-slate-400 font-bold uppercase tracking-widest mt-1">🏆 Title Winners</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4 w-full sm:w-auto">
              <button onClick={() => setActiveTab("knockout")} className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition">View Final Bracket</button>
              <button onClick={() => router.push("/archive")} className="w-full sm:w-auto px-6 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white font-bold rounded-xl transition border border-slate-700">Tournament Archive</button>
            </div>
          </div>
        </div>
      ) : (
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
                className={`relative bg-[#131b2e] border rounded-xl p-4 flex items-center justify-between hover:border-slate-700/60 transition-all duration-300 cursor-pointer overflow-hidden ${
                  match.group?.toLowerCase() === 'final' 
                    ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                    : 'border-slate-800/60'
                }`}
              >
                {match.group?.toLowerCase() === 'final' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 text-[8px] font-black uppercase px-3 py-0.5 rounded-b-md tracking-widest z-10 shadow-sm">
                    Final
                  </div>
                )}
                <div className="flex items-center space-x-4 flex-1">
                  <FlagOrShield code={match.homeTeam.code} className="w-8 h-5 shrink-0" imgClassName="object-cover" />
                  <span className="font-semibold text-sm text-slate-200 hidden sm:inline-block w-28 line-clamp-1">{match.homeTeam.name}</span>
                  <span className="font-bold text-xs text-slate-200 sm:hidden">{match.homeTeam.code}</span>
                  
                  <span className="text-slate-500 font-bold text-xs">VS</span>
                  
                  <span className="font-semibold text-sm text-slate-200 hidden sm:inline-block w-28 line-clamp-1 text-right">{match.awayTeam.name}</span>
                  <span className="font-bold text-xs text-slate-200 sm:hidden text-right">{match.awayTeam.code}</span>
                  <FlagOrShield code={match.awayTeam.code} className="w-8 h-5 shrink-0" imgClassName="object-cover" />
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
      )}

      {/* Live Stats Quick-View Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Top Scorer */}
        <div 
          onClick={() => setActiveTab("players")}
          className="bg-gradient-to-tr from-emerald-500/10 to-slate-900/60 border border-emerald-500/10 hover:border-emerald-500/30 p-4 rounded-2xl cursor-pointer hover:shadow-lg transition duration-300 flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-slate-455 font-extrabold uppercase tracking-wider block">Top Scorer</span>
            <div className="font-extrabold text-white text-sm group-hover:text-emerald-400 transition">
              {topScorer ? topScorer.name : "TBD"}
            </div>
            <span className="text-[10px] text-slate-505 font-semibold block">
              {topScorer ? `${topScorer.tournamentStats.goals} Goals` : "0 Goals"}
            </span>
          </div>
          <img src="/custom-ball.svg" alt="Top Scorer Ball" className="w-8 h-8 filter drop-shadow group-hover:scale-110 transition duration-300 object-contain" />
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
      <DashboardNewsCarousel setActiveTab={setActiveTab} />
    </div>
  );
}
