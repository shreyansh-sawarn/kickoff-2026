"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMatchById, getMatchLineups, getMatchStats } from "@wc26/api";
import { Match } from "@wc26/types";
import { getCountryFlag, formatFullMatchDateTime, getFlagCdnUrl } from "@wc26/utils";
import { ArrowLeft, Clock, MapPin, Award, Users, AlignLeft, RefreshCw, Check, X } from "lucide-react";
import PitchLineup from "../../components/PitchLineup";
import { FlagOrShield } from "../../components/FlagOrShield";

export default function MatchDetails() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"lineup" | "stats" | "events" | "shootout">("lineup");
  const [fromSource, setFromSource] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setFromSource(params.get("from"));
    }
  }, []);

  const getJerseyNumber = (playerName: string, isHome: boolean) => {
    if (!match?.lineups) return "";
    const teamLineup = isHome ? match.lineups.home : match.lineups.away;
    if (!teamLineup) return "";
    const player = [
      ...(teamLineup.startingXI || []),
      ...(teamLineup.substitutes || [])
    ].find((p: any) => p.name.trim().toLowerCase() === playerName.trim().toLowerCase());
    return player ? `#${player.number}` : "";
  };

  useEffect(() => {
    async function loadMatch(silent = false) {
      try {
        if (!silent) {
          setLoading(true);
        }
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
              
              const isDef = (p: string) => p.includes('DEFENDER') || p.includes('BACK') || ['DF', 'DEF', 'LB', 'RB', 'CB', 'LWB', 'RWB'].includes(p);
              const isDM = (p: string) => p.includes('DEFENSIVE MIDFIELDER') || ['DM', 'CDM'].includes(p);
              const isAM = (p: string) => p.includes('ATTACKING MIDFIELDER') || ['AM', 'CAM', 'AMC', 'AML', 'AMR'].includes(p);
              const isMid = (p: string) => p.includes('MIDFIELDER') || ['MF', 'MID', 'CM', 'LM', 'RM'].includes(p);
              const isFwd = (p: string) => p.includes('FORWARD') || p.includes('WING') || p.includes('STRIKER') || ['FW', 'FWD', 'CF', 'ST', 'LW', 'RW'].includes(p);
              
              let def = 0;
              let dm = 0;
              let mid = 0;
              let am = 0;
              let fwd = 0;
              
              starting.forEach((x: any) => {
                if (!x.position || x.position.toUpperCase() === 'GOALKEEPER' || x.position.toUpperCase() === 'GK') return;
                const primaryPos = x.position.split(',')[0].toUpperCase().trim();
                if (isDef(primaryPos)) def++;
                else if (isDM(primaryPos)) dm++;
                else if (isAM(primaryPos)) am++;
                else if (isMid(primaryPos)) mid++;
                else if (isFwd(primaryPos)) fwd++;
              });
              
              const getSortValue = (pos: string) => {
                if (!pos) return 5;
                const p = pos.split(',')[0].toUpperCase().trim();
                if (p === 'GK' || p === 'GOALKEEPER') return 0;
                if (isDef(p)) return 1;
                if (isDM(p)) return 2;
                if (isMid(p) && !isAM(p)) return 3;
                if (isAM(p)) return 4;
                if (isFwd(p)) return 5;
                return 5;
              };

              const getHorizontalWeight = (pos: string) => {
                if (!pos) return 5;
                const p = pos.toUpperCase().trim();
                
                // Specific Center-Left / Center-Right first to prevent substring collision
                if (p.includes("CENTER LEFT") || p.includes("LEFT CENTER") || p.includes("LCB") || p.includes("LCM")) return 3;
                if (p.includes("CENTER RIGHT") || p.includes("RIGHT CENTER") || p.includes("RCB") || p.includes("RCM")) return 7;

                // Left side positions
                if (p.includes("LEFT") || p.includes("LWB") || p.includes("LB") || p.includes("LF") || p.includes("LW")) return 1;
                
                // Right side positions
                if (p.includes("RIGHT") || p.includes("RWB") || p.includes("RB") || p.includes("RF") || p.includes("RW")) return 9;
                
                // Center positions
                if (p.includes("DEFENSIVE MIDFIELDER") || p.includes("DM")) return 4.5;
                if (p.includes("ATTACKING MIDFIELDER") || p.includes("AM")) return 5.5;
                
                return 5;
              };

              // Compute 3-part or 4-part formation string dynamically
              const parts = [];
              if (def > 0) parts.push(def);
              if (dm > 0 || mid > 0) {
                if (am > 0) {
                  parts.push(dm + mid);
                  parts.push(am);
                } else {
                  parts.push(dm + mid);
                }
              } else if (am > 0) {
                parts.push(am);
              }
              if (fwd > 0) parts.push(fwd);
              
               const calcFormation = parts.length >= 3 ? parts.join("-") : "4-3-3";
              const isHome = code === data.homeTeam.code;
              const serverFormation = isHome ? data.home_formation : data.away_formation;
              const finalFormation = serverFormation || calcFormation;
              
              return {
                formation: finalFormation,
                startingXI: starting
                  .sort((a: any, b: any) => {
                    const sortA = getSortValue(a.position);
                    const sortB = getSortValue(b.position);
                    if (sortA !== sortB) return sortA - sortB;
                    return getHorizontalWeight(a.position) - getHorizontalWeight(b.position);
                  })
                  .map((x: any) => ({
                    id: (x.player_name || "").trim(),
                    name: (x.player_name || "").trim(),
                    number: x.jersey_number,
                    position: x.position,
                  })),
                substitutes: teamLineups.filter((x: any) => !x.is_starting).map((x: any) => ({
                  id: (x.player_name || "").trim(),
                  name: (x.player_name || "").trim(),
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
              yellowCards: { home: homeStat.yellow_cards || homeStat.yellowCards || 0, away: awayStat.yellow_cards || awayStat.yellowCards || 0 },
              redCards: { home: homeStat.red_cards || homeStat.redCards || 0, away: awayStat.red_cards || awayStat.redCards || 0 },
            };
          }

          // Identify own goals dynamically
          if (data.lineups && data.events) {
            const homePlayers = new Set(
              [
                ...(data.lineups.home?.startingXI || []),
                ...(data.lineups.home?.substitutes || []),
              ].map((p: any) => p.name.trim().toLowerCase())
            );
            const awayPlayers = new Set(
              [
                ...(data.lineups.away?.startingXI || []),
                ...(data.lineups.away?.substitutes || []),
              ].map((p: any) => p.name.trim().toLowerCase())
            );

            data.events = data.events.map((event: any) => {
              if (event.type === "goal") {
                const pName = (event.playerOne || "").trim().toLowerCase();
                const isHomeEvent = event.teamId.toLowerCase() === data.homeTeam.code.toLowerCase();
                const isAwayEvent = event.teamId.toLowerCase() === data.awayTeam.code.toLowerCase();

                // If it's a home goal event, but the player is in the away lineup: own goal
                if (isHomeEvent && awayPlayers.has(pName)) {
                  return { ...event, type: "own_goal" };
                }
                // If it's an away goal event, but the player is in the home lineup: own goal
                if (isAwayEvent && homePlayers.has(pName)) {
                  return { ...event, type: "own_goal" };
                }
              }
              return event;
            });
          }

          setMatch(data);
        }
      } catch (err) {
        console.error("Error loading match detail:", err);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    }

    if (matchId) {
      loadMatch();

      // Poll match details every 15 seconds in the background
      const interval = setInterval(() => {
        loadMatch(true);
      }, 15000);

      return () => clearInterval(interval);
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
            onClick={() => {
              if (fromSource === "knockout") {
                router.push("/knockout");
              } else if (fromSource === "archive") {
                router.push("/archive");
              } else {
                router.push(match.status === "completed" ? "/matches?filter=finished" : "/matches?filter=upcoming");
              }
            }}
            className="flex items-center space-x-2 text-slate-450 hover:text-emerald-400 font-bold transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{fromSource === "knockout" ? "Knockout" : fromSource === "archive" ? "Archive" : "Matches"}</span>
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {match.group === "final"
              ? "2026 FIFA World Cup Final"
              : match.group === "3rd"
              ? "3rd Place"
              : match.group === "sf"
              ? "Semifinals"
              : match.group === "qf"
              ? "Quarterfinals"
              : match.group === "r16"
              ? "Round of 16"
              : match.group === "r32"
              ? "Round of 32"
              : match.group}
          </span>
          <div className="w-16"></div> {/* Spacer */}
        </div>
      </div>

      {/* Main Scoreboard Banner */}
      <div className="bg-gradient-to-b from-[#131b2e] to-[#0c1122] border-b border-slate-800/60 py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            <span>{match.stadium}</span>
          </div>

          <div className="flex items-center justify-between w-full max-w-2xl my-4">
            {/* Home Team */}
            <div className="flex flex-col items-center w-1/3">
              <FlagOrShield 
                code={match.homeTeam.code} 
                className="w-24 h-16 rounded-xl shadow-lg mb-3 shrink-0" 
                imgClassName="object-cover" 
              />
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
                        <span>LIVE {match.clock || `${match.minute}'`}</span>
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
              <FlagOrShield 
                code={match.awayTeam.code} 
                className="w-24 h-16 rounded-xl shadow-lg mb-3 shrink-0" 
                imgClassName="object-cover" 
              />
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
        {(() => {
          const hasShootout = match.events?.some((e) => e.isShootoutPenalty) || 
                              (match.homePenaltyScore !== undefined && match.homePenaltyScore !== null) || 
                              (match.awayPenaltyScore !== undefined && match.awayPenaltyScore !== null);

          const tabs: Array<{ id: "lineup" | "stats" | "events" | "shootout"; label: string; icon: any }> = [
            { id: "lineup", label: "Lineups", icon: Users },
            { id: "stats", label: "Match Stats", icon: AlignLeft },
            { id: "events", label: "Timeline", icon: Clock },
          ];

          if (hasShootout) {
            tabs.push({ id: "shootout", label: "Shootout", icon: Award });
          }

          return (
            <div className="flex border-b border-slate-850 p-1 bg-[#131b2e]/40 rounded-xl max-w-lg mx-auto">
              {tabs.map((tab) => {
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
          );
        })()}

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
              {match.stats ? (
                <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 space-y-6">
                  {/* Possession bar */}
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold text-slate-350">
                      <span>{match.homeTeam.name}</span>
                      <span>{match.awayTeam.name}</span>
                    </div>
                    {(() => {
                      const homePoss = parseInt(String(match.stats!.possession.home).replace('%', '')) || 0;
                      const awayPoss = parseInt(String(match.stats!.possession.away).replace('%', '')) || 0;

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
                    const homeVal = match.stats?.[statRow.key]?.home || 0;
                    const awayVal = match.stats?.[statRow.key]?.away || 0;

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
                    {(() => {
                      let runningHomeScore = 0;
                      let runningAwayScore = 0;
                      
                      const normalEvents = match.events
                        .filter(e => !e.isShootoutPenalty && (e.type as string) !== "assist")
                        .map(event => {
                          if (event.type === "goal" || event.type === "own_goal") {
                            if (event.teamId === match.homeTeam.id) {
                              runningHomeScore++;
                            } else {
                              runningAwayScore++;
                            }
                            return {
                              ...event,
                              score: `${runningHomeScore}:${runningAwayScore}`
                            };
                          }
                          return event;
                        });
                      
                      let runningHomePenaltyScore = 0;
                      let runningAwayPenaltyScore = 0;
                      
                      const shootoutEvents = match.events
                        .filter(e => e.isShootoutPenalty && (e.type as string) !== "assist")
                        .map(event => {
                          const isHome = event.teamId === match.homeTeam.id;
                          if (event.didScore) {
                            if (isHome) {
                              runningHomePenaltyScore++;
                            } else {
                              runningAwayPenaltyScore++;
                            }
                          }
                          return {
                            ...event,
                            runningScore: `${runningHomePenaltyScore}:${runningAwayPenaltyScore}`
                          };
                        });

                      return (
                        <>
                          {normalEvents.map((event) => {
                            const isHome = event.teamId === match.homeTeam.id;
                            
                            return (
                              <div 
                                key={event.id}
                                className={`flex flex-col sm:flex-row items-center justify-between ${
                                  isHome ? "" : "sm:flex-row-reverse"
                                }`}
                              >
                                {/* Event Text Side */}
                                <div className={`w-full sm:w-[45%] flex ${
                                  isHome ? "justify-end text-right" : "justify-start sm:text-left"
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
                                      {event.type === "own_goal" && (
                                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1.5 shrink-0 shadow-sm rounded-full bg-white">
                                           <defs>
                                             <clipPath id="og-ball-clip-page">
                                               <circle cx="12" cy="12" r="11" />
                                             </clipPath>
                                           </defs>
                                           <circle cx="12" cy="12" r="11" fill="#fee2e2" />
                                           <g clipPath="url(#og-ball-clip-page)">
                                             <path d="M -2 4 Q 10 12 2 22" fill="none" stroke="#ef4444" strokeWidth="4.5" />
                                             <path d="M 26 4 Q 14 12 22 22" fill="none" stroke="#dc2626" strokeWidth="4.5" />
                                             <path d="M 4 24 Q 12 15 20 24" fill="none" stroke="#b91c1c" strokeWidth="4.5" />
                                             <path d="M 8 4 Q 12 10 16 4" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                                             <path d="M 4 18 Q 12 14 20 18" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                                             <path d="M 12 10 L 12 14" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                                           </g>
                                           <circle cx="12" cy="12" r="11" stroke="#dc2626" strokeWidth="1.5" />
                                         </svg>
                                      )}
                                      {event.type === "card_yellow" && <div className="w-2.5 h-[14px] bg-[#f5a623] rounded-[2px] ml-2 shrink-0 shadow-sm" />}
                                      {event.type === "card_red" && <div className="w-2.5 h-[14px] bg-[#e53e3e] rounded-[2px] ml-2 shrink-0 shadow-sm" />}
                                      {event.type === "substitution" && <span className="text-xs text-emerald-450 ml-1.5 shrink-0">🔄</span>}
                                    </div>
                                    
                                    {event.playerTwo && (
                                      <span className="text-[10px] text-slate-400 block mt-1">
                                        {event.type === "substitution" ? `Out: ${event.playerTwo}` : `Assist: ${event.playerTwo}`}
                                      </span>
                                    )}
                                    
                                    {event.isPenalty && (
                                      <span className="text-[10px] text-slate-400 block mt-1">
                                        Penalty Goal
                                      </span>
                                    )}

                                    {event.type === "own_goal" && (
                                      <span className="text-[10px] text-slate-400 block mt-1">
                                        Own Goal
                                      </span>
                                    )}
                                    
                                    {event.detail && (
                                      <span className="text-[10px] text-amber-400 font-bold block mt-0.5">{event.detail}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Time Dot Center */}
                                <div className="bg-slate-950 border-2 border-slate-800 w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-lg shrink-0">
                                  <span className="font-black text-xs text-emerald-400">{event.clockDisplay || event.minute}'</span>
                                </div>

                                {/* Scorecard on the opposite side */}
                                <div className={`w-[45%] hidden sm:flex items-center ${isHome ? "justify-start" : "justify-end"}`}>
                                  {(event.type === "goal" || event.type === "own_goal") && event.score && (
                                    <div className="mx-3 text-sm font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 shadow-sm">
                                      {event.score}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {shootoutEvents.length > 0 && (
                            <div className="flex flex-col items-center my-6 relative z-10">
                              <div className="bg-[#131b2e] px-4 text-xs font-black uppercase tracking-widest text-amber-450 border border-amber-500/30 py-2 rounded-2xl shadow-lg flex items-center space-x-2">
                                <span>⚽</span>
                                <span>Penalty Shootout ({match.homePenaltyScore} - {match.awayPenaltyScore})</span>
                              </div>
                            </div>
                          )}

                          {shootoutEvents.map((event) => {
                            const isHome = event.teamId === match.homeTeam.id;
                            
                            return (
                              <div 
                                key={event.id}
                                className={`flex flex-col sm:flex-row items-center justify-between ${
                                  isHome ? "" : "sm:flex-row-reverse"
                                }`}
                              >
                                {/* Event Text Side */}
                                <div className={`w-full sm:w-[45%] flex ${
                                  isHome ? "justify-end text-right" : "justify-start sm:text-left"
                                } mb-2 sm:mb-0`}>
                                  <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl max-w-xs shadow-md">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-extrabold text-sm text-white">
                                        {event.playerOne}
                                      </span>
                                      {event.didScore ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1.5 shrink-0 shadow-sm rounded-full bg-white">
                                          <defs>
                                            <clipPath id="ball-clip-shootout">
                                              <circle cx="12" cy="12" r="11" />
                                            </clipPath>
                                          </defs>
                                          <circle cx="12" cy="12" r="11" fill="#f8fafc" />
                                          <g clipPath="url(#ball-clip-shootout)">
                                            <path d="M -2 4 Q 10 12 2 22" fill="none" stroke="#ef4444" strokeWidth="4.5" />
                                            <path d="M 26 4 Q 14 12 22 22" fill="none" stroke="#3b82f6" strokeWidth="4.5" />
                                            <path d="M 4 24 Q 12 15 20 24" fill="none" stroke="#22c55e" strokeWidth="4.5" />
                                            <path d="M 8 4 Q 12 10 16 4" fill="none" stroke="#94a3b8" strokeWidth="1" />
                                            <path d="M 4 18 Q 12 14 20 18" fill="none" stroke="#94a3b8" strokeWidth="1" />
                                            <path d="M 12 10 L 12 14" fill="none" stroke="#94a3b8" strokeWidth="1" />
                                          </g>
                                          <circle cx="12" cy="12" r="11" stroke="#64748b" strokeWidth="1.5" />
                                        </svg>
                                      ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1.5 shrink-0 shadow-sm rounded-full bg-red-100 border border-red-500 flex items-center justify-center p-0.5">
                                          <path d="M18 6L6 18M6 6l12 12" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      )}
                                    </div>
                                    <span className={`text-[10px] font-bold block mt-1 ${event.didScore ? "text-emerald-450" : "text-rose-500"}`}>
                                      {event.didScore ? "Penalty Scored" : "Penalty Missed"}
                                    </span>
                                  </div>
                                </div>

                                {/* Time Dot Center */}
                                <div className="bg-slate-950 border-2 border-amber-500/40 w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-lg shrink-0">
                                  <span className="font-black text-xs text-amber-400">P{event.shotNumber}</span>
                                </div>

                                {/* Scorecard on the opposite side */}
                                <div className={`w-[45%] hidden sm:flex items-center ${isHome ? "justify-start" : "justify-end"}`}>
                                  <div className="mx-3 text-sm font-black tracking-widest text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 shadow-sm">
                                    {event.runningScore}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-[#131b2e] border border-slate-850 rounded-2xl">
                  <p className="text-slate-400 text-sm">Key events (Goals, Cards, Substitutions) will appear here chronologically.</p>
                </div>
              )}
            </div>
          )}

          {/* SHOOTOUT TAB */}
          {activeSubTab === "shootout" && (
            <div className="max-w-xl mx-auto space-y-6">
              {(() => {
                const shootoutEvents = match.events?.filter((e) => e.isShootoutPenalty) || [];
                
                // Group by round/shotNumber
                const roundsMap: Record<number, { home?: any; away?: any }> = {};
                shootoutEvents.forEach((event) => {
                  const shotNum = event.shotNumber || 1;
                  if (!roundsMap[shotNum]) {
                    roundsMap[shotNum] = {};
                  }
                  if (event.teamId === match.homeTeam.id) {
                    roundsMap[shotNum].home = event;
                  } else {
                    roundsMap[shotNum].away = event;
                  }
                });

                const maxRound = Math.max(...Object.keys(roundsMap).map(Number), 5);
                const roundsList = Array.from({ length: maxRound }, (_, i) => i + 1);

                // Compute shootout title
                const homeWon = (match.homePenaltyScore || 0) > (match.awayPenaltyScore || 0);
                const winnerName = homeWon ? match.homeTeam.name : match.awayTeam.name;
                const winnerScore = homeWon ? match.homePenaltyScore : match.awayPenaltyScore;
                const loserScore = homeWon ? match.awayPenaltyScore : match.homePenaltyScore;
                const titleText = match.status === "completed" 
                  ? `${winnerName} advances ${winnerScore}-${loserScore} on penalties`
                  : `Penalty Shootout (${match.homePenaltyScore || 0} - ${match.awayPenaltyScore || 0})`;

                return (
                  <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4">
                      <div className="flex items-center space-x-3 w-1/3">
                        <FlagOrShield 
                          code={match.homeTeam.code} 
                          className="w-8 h-5 rounded shadow shrink-0" 
                          imgClassName="object-cover" 
                        />
                        <span className="font-bold text-slate-200 text-sm">{match.homeTeam.code}</span>
                      </div>
                      <div className="flex flex-col items-center text-center w-1/3">
                        <span className="font-extrabold text-sm text-white">{titleText}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Penalty Shootout</span>
                      </div>
                      <div className="flex items-center justify-end space-x-3 w-1/3">
                        <span className="font-bold text-slate-200 text-sm">{match.awayTeam.code}</span>
                        <FlagOrShield 
                          code={match.awayTeam.code} 
                          className="w-8 h-5 rounded shadow shrink-0" 
                          imgClassName="object-cover" 
                        />
                      </div>
                    </div>

                    {/* Shootout Rounds */}
                    <div className="space-y-4">
                      {roundsList.map((roundNum) => {
                        const { home, away } = roundsMap[roundNum] || {};
                        return (
                          <div key={roundNum} className="flex items-center justify-between py-2 border-b border-slate-850/40 last:border-0">
                            {/* Left Taker (Home) */}
                            <div className="w-[42%] text-left">
                              {home ? (
                                <div>
                                  <div className="font-bold text-sm text-white truncate">{home.playerOne}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {getJerseyNumber(home.playerOne, true) ? `${getJerseyNumber(home.playerOne, true)} • ` : ""}Penalty - {home.didScore ? "Scored" : "Missed"}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-slate-500 text-xs italic">-</div>
                              )}
                            </div>

                            {/* Center Status Indicators */}
                            <div className="w-[16%] flex items-center justify-center space-x-2 shrink-0">
                              {/* Home Outcome */}
                              {home ? (
                                home.didScore ? (
                                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md">
                                    <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-md">
                                    <X className="w-3.5 h-3.5 stroke-[3.5]" />
                                  </div>
                                )
                              ) : (
                                <div className="w-6 h-6 rounded-full border border-slate-800 bg-slate-900/40" />
                              )}

                              {/* Round Number */}
                              <span className="text-xs font-bold text-slate-400 w-4 text-center">{roundNum}</span>

                              {/* Away Outcome */}
                              {away ? (
                                away.didScore ? (
                                  <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md">
                                    <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-md">
                                    <X className="w-3.5 h-3.5 stroke-[3.5]" />
                                  </div>
                                )
                              ) : (
                                <div className="w-6 h-6 rounded-full border border-slate-800 bg-slate-900/40" />
                              )}
                            </div>

                            {/* Right Taker (Away) */}
                            <div className="w-[42%] text-right">
                              {away ? (
                                <div>
                                  <div className="font-bold text-sm text-white truncate">{away.playerOne}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Penalty - {away.didScore ? "Scored" : "Missed"}{getJerseyNumber(away.playerOne, false) ? ` • ${getJerseyNumber(away.playerOne, false)}` : ""}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-slate-500 text-xs italic">-</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
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
