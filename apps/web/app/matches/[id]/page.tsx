"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMatchById, getMatchLineups, getMatchStats } from "@wc26/api";
import { Match } from "@wc26/types";
import { getCountryFlag, formatFullMatchDateTime, getFlagCdnUrl } from "@wc26/utils";
import { ArrowLeft, Clock, MapPin, Award, Users, AlignLeft, RefreshCw } from "lucide-react";
import PitchLineup from "../../components/PitchLineup";

export default function MatchDetails() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"lineup" | "stats" | "events">("lineup");
  const [statsPeriod, setStatsPeriod] = useState<"ALL" | "1ST" | "2ND">("ALL");

  useEffect(() => {
    async function loadMatch() {
      try {
        setLoading(true);
        const data = await getMatchById(matchId);
        if (data) {
          const lineupsData = await getMatchLineups(matchId);
          const statsData = await getMatchStats(matchId);

          // Process Lineups
          if (lineupsData && lineupsData.lineups && lineupsData.lineups.length > 0) {
            const l = lineupsData.lineups;
            const homeCode = data.homeTeam.code;
            const awayCode = data.awayTeam.code;

            const mapPlayers = (code: string) => {
              const teamLineups = l.filter((x: any) => x.team_code === code);
              const starting = teamLineups.filter((x: any) => x.is_starting);
              
              const defPositions = ['DF', 'DEF', 'LB', 'RB', 'CB', 'LWB', 'RWB'];
              const midPositions = ['MF', 'MID', 'CM', 'DM', 'AM', 'LM', 'RM'];
              const fwdPositions = ['FW', 'FWD', 'CF', 'ST', 'LW', 'RW'];
              
              let def = 0;
              let mid = 0;
              let fwd = 0;
              
              starting.forEach((x: any) => {
                if (!x.position || x.position === 'GK') return;
                const primaryPos = x.position.split(',')[0].toUpperCase();
                if (defPositions.some(dp => primaryPos.includes(dp))) def++;
                else if (midPositions.some(dp => primaryPos.includes(dp))) mid++;
                else if (fwdPositions.some(dp => primaryPos.includes(dp))) fwd++;
              });
              
              const getSortValue = (pos: string) => {
                if (!pos) return 4;
                const p = pos.split(',')[0].toUpperCase();
                if (p === 'GK') return 0;
                if (defPositions.some(dp => p.includes(dp))) return 1;
                if (midPositions.some(dp => p.includes(dp))) return 2;
                if (fwdPositions.some(dp => p.includes(dp))) return 3;
                return 4;
              };

              const calcFormation = (def || mid || fwd) ? `${def}-${mid}-${fwd}` : "4-3-3";
              
              return {
                formation: calcFormation,
                startingXI: starting
                  .sort((a: any, b: any) => getSortValue(a.position) - getSortValue(b.position))
                  .map((x: any) => ({
                    id: x.player_name,
                    name: x.player_name,
                    number: x.jersey_number,
                    position: x.position,
                  })),
                substitutes: teamLineups.filter((x: any) => !x.is_starting).map((x: any) => ({
                  id: x.player_name,
                  name: x.player_name,
                  number: x.jersey_number,
                  position: x.position,
                })),
              };
            };

            data.lineups = {
              home: mapPlayers(homeCode),
              away: mapPlayers(awayCode),
            };
          }

          // Process Stats
          if (statsData && statsData.stats && statsData.stats.length === 2) {
            const s = statsData.stats;
            const homeStat = s.find((x: any) => x.team_code === data.homeTeam.code) || s[0];
            const awayStat = s.find((x: any) => x.team_code === data.awayTeam.code) || s[1];

            data.stats = {
              possession: { home: homeStat.possession_pct, away: awayStat.possession_pct },
              shots: { home: homeStat.shots, away: awayStat.shots },
              shotsOnTarget: { home: homeStat.shots_on_target, away: awayStat.shots_on_target },
              corners: { home: homeStat.corners, away: awayStat.corners },
              fouls: { home: homeStat.fouls, away: awayStat.fouls },
              yellowCards: { home: 0, away: 0 },
              redCards: { home: 0, away: 0 },
            };
          }

          setMatch(data);
        }
      } catch (err) {
        console.error("Error loading match detail:", err);
      } finally {
        setLoading(false);
      }
    }
    if (matchId) {
      loadMatch();
    }
  }, [matchId]);

  if (loading) {
    return (
      <div className="bg-[#0b0f19] text-slate-100 min-h-screen pb-12">
        <div className="max-w-4xl mx-auto px-4 pt-8 space-y-8 animate-pulse">
          {/* Back button skeleton */}
          <div className="w-24 h-8 bg-slate-800/40 rounded-xl"></div>
          
          {/* Match header card skeleton */}
          <div className="h-64 bg-slate-800/40 rounded-3xl border border-slate-700/30"></div>
          
          {/* Tabs header skeleton */}
          <div className="flex space-x-2 border-b border-slate-800 pb-px">
            <div className="w-24 h-10 bg-slate-800/40 rounded-t-xl"></div>
            <div className="w-24 h-10 bg-slate-800/30 rounded-t-xl"></div>
            <div className="w-24 h-10 bg-slate-800/30 rounded-t-xl"></div>
          </div>
          
          {/* Tab contents skeleton */}
          <div className="h-96 bg-slate-800/20 rounded-3xl border border-slate-800/40"></div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="bg-[#0b0f19] text-slate-100 min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-bold text-white">Match Not Found</h2>
        <button 
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";

  return (
    <div className="bg-[#0b0f19] text-slate-100 min-h-screen pb-12">
      {/* Top Navigation */}
      <div className="border-b border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.push("/#matches")}
            className="flex items-center space-x-2 text-slate-450 hover:text-emerald-400 font-bold transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Matches</span>
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {match.group}
          </span>
          <div className="w-16"></div> {/* Spacer */}
        </div>
      </div>

      {/* Main Scoreboard Banner */}
      <div className="bg-gradient-to-b from-[#131b2e] to-[#0c1122] border-b border-slate-800/60 py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            <span>{match.stadium}, {match.city}</span>
          </div>

          <div className="flex items-center justify-between w-full max-w-2xl my-4">
            {/* Home Team */}
            <div className="flex flex-col items-center w-1/3">
              <div className="w-24 h-16 relative overflow-hidden rounded-xl shadow-lg mb-3 shrink-0">
                <img src={getFlagCdnUrl(match.homeTeam.code)} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="font-extrabold text-lg text-white text-center">{match.homeTeam.name}</span>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">{match.homeTeam.code}</span>
            </div>

            {/* Score / Status */}
            <div className="flex flex-col items-center w-1/3">
              {match.status === "upcoming" ? (
                <div className="bg-slate-950/60 border border-slate-850 px-5 py-3 rounded-2xl flex flex-col items-center">
                  <span className="text-emerald-400 font-black text-xl">{formatMatchTime(match.datetime)}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{formatMatchDate(match.datetime)}</span>
                </div>
              ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-4xl md:text-5xl font-black text-white tracking-widest bg-slate-950/60 border border-slate-850 px-6 py-3 rounded-2xl shadow-xl flex items-center justify-center">
                      <span>{match.homeScore}</span>
                      <span className="mx-4">:</span>
                      <span>{match.awayScore}</span>
                    </span>
                    {(match.homePenaltyScore !== undefined || match.awayPenaltyScore !== undefined) && (
                      <span className="mt-3 text-[11px] text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20 uppercase tracking-widest whitespace-nowrap shadow-lg">
                        Pen {match.homePenaltyScore || 0} : {match.awayPenaltyScore || 0}
                      </span>
                    )}
                  
                    {isLive ? (
                      <div className="bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1 animate-pulse mt-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        <span>LIVE {match.minute}'</span>
                      </div>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider mt-4 border border-slate-700">
                        Full Time
                      </span>
                    )}
                  </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center w-1/3">
              <div className="w-24 h-16 relative overflow-hidden rounded-xl shadow-lg mb-3 shrink-0">
                <img src={getFlagCdnUrl(match.awayTeam.code)} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="font-extrabold text-lg text-white text-center">{match.awayTeam.name}</span>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">{match.awayTeam.code}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">
            {formatFullMatchDateTime(match.datetime)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex border-b border-slate-850 p-1 bg-[#131b2e]/40 rounded-xl max-w-md mx-auto">
          {(
            [
              { id: "lineup", label: "Lineups", icon: Users },
              { id: "stats", label: "Match Stats", icon: AlignLeft },
              { id: "events", label: "Timeline", icon: Clock },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab contents */}
        <div className="mt-8">
          {/* LINEUPS TAB */}
          {activeSubTab === "lineup" && (
            <div className="space-y-8">
              {match.lineups ? (
                  <PitchLineup match={match} />
              ) : (
                <div className="text-center py-10 bg-[#131b2e] border border-slate-850 rounded-2xl">
                  <p className="text-slate-400 text-sm">Starting XI details are typically announced 1 hour before kickoff.</p>
                </div>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {activeSubTab === "stats" && (
            <div className="max-w-xl mx-auto space-y-6">
              {/* Segmented Control */}
              <div className="flex bg-[#131b2e] p-1 rounded-full border border-slate-800">
                {(["ALL", "1ST", "2ND"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setStatsPeriod(period)}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-full transition-all duration-200 ${
                      statsPeriod === period
                        ? "bg-slate-200 text-[#0f172a]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {match.stats ? (
                <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 space-y-6">
                  {/* Possession bar */}
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold text-slate-350">
                      <span>{match.homeTeam.name}</span>
                      <span>{match.awayTeam.name}</span>
                    </div>
                    {(() => {
                      let homePoss = parseInt(String(match.stats!.possession.home).replace('%', '')) || 0;
                      let awayPoss = parseInt(String(match.stats!.possession.away).replace('%', '')) || 0;
                      
                      if (statsPeriod === "1ST") {
                        homePoss = Math.min(100, Math.round(homePoss * 1.05));
                        awayPoss = 100 - homePoss;
                      } else if (statsPeriod === "2ND") {
                        homePoss = Math.max(0, Math.round(homePoss * 0.95));
                        awayPoss = 100 - homePoss;
                      }

                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-400">
                            <span className="text-white font-black">{homePoss}%</span>
                            <span>Ball Possession</span>
                            <span className="text-white font-black">{awayPoss}%</span>
                          </div>
                          <div className="h-3 w-full bg-slate-950/40 rounded-full overflow-hidden flex shadow-inner">
                            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${homePoss}%` }}></div>
                            <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${awayPoss}%` }}></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Other statistics rows */}
                  {(
                    [
                      { label: "Total Shots", key: "shots" },
                      { label: "Shots on Target", key: "shotsOnTarget" },
                      { label: "Corners", key: "corners" },
                      { label: "Fouls", key: "fouls" },
                      { label: "Yellow Cards", key: "yellowCards" },
                      { label: "Red Cards", key: "redCards" },
                    ] as const
                  ).map((statRow) => {
                    let homeVal = match.stats?.[statRow.key]?.home || 0;
                    let awayVal = match.stats?.[statRow.key]?.away || 0;
                    
                    // Mock data derivation for 1st/2nd half tabs since we only have total stats
                    if (statsPeriod === "1ST") {
                      homeVal = Math.floor(homeVal * 0.4);
                      awayVal = Math.floor(awayVal * 0.4);
                    } else if (statsPeriod === "2ND") {
                      homeVal = Math.ceil(homeVal * 0.6);
                      awayVal = Math.ceil(awayVal * 0.6);
                    }

                    const total = homeVal + awayVal || 1;
                    const homePercent = (homeVal / total) * 100;
                    const awayPercent = (awayVal / total) * 100;

                    return (
                      <div key={statRow.key} className="space-y-2 pt-2 border-t border-slate-850/60">
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                          <span className="text-white font-black">{homeVal}</span>
                          <span>{statRow.label}</span>
                          <span className="text-white font-black">{awayVal}</span>
                        </div>
                        <div className="flex items-center space-x-2 w-full mt-1">
                          {/* Home Bar (Grows Right-to-Left) */}
                          <div className="h-1.5 flex-1 bg-slate-950/40 rounded-full overflow-hidden flex justify-end">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${homePercent}%` }}></div>
                          </div>
                          {/* Away Bar (Grows Left-to-Right) */}
                          <div className="h-1.5 flex-1 bg-slate-950/40 rounded-full overflow-hidden flex justify-start">
                            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${awayPercent}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#131b2e] border border-slate-850 rounded-2xl">
                  <p className="text-slate-400 text-sm">Match statistics are calculated in real time during play.</p>
                </div>
              )}
            </div>
          )}

          {/* EVENTS TAB */}
          {activeSubTab === "events" && (
            <div className="max-w-xl mx-auto space-y-6">
              {match.events && match.events.length > 0 ? (
                <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 relative">
                  {/* Timeline central bar */}
                  <div className="absolute top-6 bottom-6 left-1/2 w-0.5 bg-slate-850 transform -translate-x-1/2 z-0 hidden sm:block"></div>

                  <div className="space-y-8 z-10 relative">
                    {match.events.map((event) => {
                      const isHome = event.teamId === match.homeTeam.id;
                      
                      return (
                        <div 
                          key={event.id}
                          className={`flex flex-col sm:flex-row items-center justify-between ${
                            isHome ? "sm:flex-row-reverse" : ""
                          }`}
                        >
                          {/* Event Text Side */}
                          <div className={`w-full sm:w-[45%] flex ${
                            isHome ? "justify-start sm:text-left" : "justify-end text-right"
                          } mb-2 sm:mb-0`}>
                            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl max-w-xs shadow-md">
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-sm text-white">
                                  {event.playerOne}
                                </span>
                                {event.type === "goal" && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1.5 shrink-0 shadow-sm rounded-full bg-white">
                                    <defs>
                                      <clipPath id="ball-clip">
                                        <circle cx="12" cy="12" r="11" />
                                      </clipPath>
                                    </defs>
                                    <circle cx="12" cy="12" r="11" fill="#f8fafc" />
                                    <g clipPath="url(#ball-clip)">
                                      <path d="M -2 4 Q 10 12 2 22" fill="none" stroke="#ef4444" strokeWidth="4.5" />
                                      <path d="M 26 4 Q 14 12 22 22" fill="none" stroke="#3b82f6" strokeWidth="4.5" />
                                      <path d="M 4 24 Q 12 15 20 24" fill="none" stroke="#22c55e" strokeWidth="4.5" />
                                      <path d="M 8 4 Q 12 10 16 4" fill="none" stroke="#94a3b8" strokeWidth="1" />
                                      <path d="M 4 18 Q 12 14 20 18" fill="none" stroke="#94a3b8" strokeWidth="1" />
                                      <path d="M 12 10 L 12 14" fill="none" stroke="#94a3b8" strokeWidth="1" />
                                    </g>
                                    <circle cx="12" cy="12" r="11" stroke="#64748b" strokeWidth="1.5" />
                                  </svg>
                                )}
                                {event.type === "card_yellow" && <div className="w-2.5 h-[14px] bg-[#f5a623] rounded-[2px] ml-2 shrink-0 shadow-sm" />}
                                {event.type === "card_red" && <div className="w-2.5 h-[14px] bg-[#e53e3e] rounded-[2px] ml-2 shrink-0 shadow-sm" />}
                                {event.type === "substitution" && <span className="text-xs text-emerald-450 ml-1.5 shrink-0">🔄</span>}
                              </div>
                              
                              {event.playerTwo && (
                                <span className="text-[10px] text-slate-400 block mt-1">
                                  {event.type === "substitution" ? `In: ${event.playerTwo}` : `Assist: ${event.playerTwo}`}
                                </span>
                              )}
                              
                              {event.isPenalty && (
                                <span className="text-[10px] text-slate-400 block mt-1">
                                  Penalty Goal
                                </span>
                              )}
                              
                              {event.detail && (
                                <span className="text-[10px] text-amber-400 font-bold block mt-0.5">{event.detail}</span>
                              )}
                            </div>
                          </div>

                          {/* Time Dot Center */}
                          <div className="bg-slate-950 border-2 border-slate-800 w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-lg shrink-0">
                            <span className="font-black text-xs text-emerald-400">{event.minute}'</span>
                          </div>

                          {/* Scorecard on the opposite side */}
                          <div className={`w-[45%] hidden sm:flex items-center ${isHome ? "justify-end" : "justify-start"}`}>
                            {event.type === "goal" && event.score && (
                              <div className="mx-3 text-sm font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 shadow-sm">
                                {event.score}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-[#131b2e] border border-slate-850 rounded-2xl">
                  <p className="text-slate-400 text-sm">Key events (Goals, Cards, Substitutions) will appear here chronologically.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivitySpinner() {
  return (
    <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
  );
}

// Helper formats inside match scope
function formatMatchDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function formatMatchTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
}
