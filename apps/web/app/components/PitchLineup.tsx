"use client";

import React, { useState } from "react";
import { Match, MatchEvent } from "@wc26/types";
import { getFlagCdnUrl } from "@wc26/utils";

interface PitchLineupProps {
  match: Match;
}

export default function PitchLineup({ match }: PitchLineupProps) {
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">("home");

  const homeLineup = match.lineups?.home;
  const awayLineup = match.lineups?.away;

  if (!homeLineup || !awayLineup) return null;

  // Helper to chunk players by formation (e.g., "4-3-3")
  const parseFormation = (formation: string, players: any[]) => {
    // Basic fallback if formation string is weird
    let parts = formation.split("-").map(Number);
    if (parts.length < 3 || parts.some(isNaN)) parts = [4, 3, 3];
    
    // We expect 1 GK + parts
    // Filter out GK
    const gk = players.find(p => p.position === "GK") || players[0];
    const outfield = players.filter(p => p.id !== gk?.id);
    
    const rows = [[gk]];
    let offset = 0;
    for (const count of parts) {
      rows.push(outfield.slice(offset, offset + count));
      offset += count;
    }
    return rows;
  };

  const homeRows = parseFormation(homeLineup.formation, homeLineup.startingXI);
  const awayRows = parseFormation(awayLineup.formation, awayLineup.startingXI);
  
  // Reverse away rows so they face the home team
  const awayRowsReversed = [...awayRows].reverse();

  // Helper to find substitution events
  const getSubOutEvent = (playerId: string) => {
    return match.events?.find(e => e.type === "substitution" && e.playerOne === playerId);
  };
  const getSubInEvent = (playerId: string) => {
    return match.events?.find(e => e.type === "substitution" && e.playerTwo === playerId);
  };

  const renderPlayerNode = (player: any, isHome: boolean, isSub = false) => {
    const subOut = getSubOutEvent(player.name);
    const subIn = getSubInEvent(player.name);
    
    return (
      <div key={player.id} className="flex flex-col items-center relative z-10 mx-1 my-1 flex-1">
        <div className="relative">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shadow-md
            ${isHome ? "bg-red-600 border-white text-white" : "bg-white border-red-600 text-red-600"}
          `}>
            {player.number}
          </div>
          {/* Sub Out Icon (Red) */}
          {subOut && (
            <div className="absolute -bottom-1 -left-2 bg-[#131b2e] rounded-full">
               <span className="text-red-500 text-[10px]">🔴</span>
            </div>
          )}
          {/* Sub In Icon (Green) */}
          {subIn && (
            <div className="absolute -bottom-1 -left-2 bg-[#131b2e] rounded-full">
               <span className="text-emerald-500 text-[10px]">🟢</span>
            </div>
          )}
        </div>
        <div className="mt-1 bg-[#131b2e]/80 px-1.5 py-0.5 rounded text-[9px] font-bold text-white text-center shadow whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px]">
          {player.name.split(" ").pop()}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Pitch and Banners Container */}
      <div className="max-w-md mx-auto bg-[#131b2e] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        
        {/* Home Team Banner (Outside Top) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center">
            <img src={getFlagCdnUrl(match.homeTeam.code)} alt="" className="w-6 h-4 object-cover rounded-sm mr-3 shadow" />
            <span className="text-white text-sm font-black uppercase tracking-wider">{match.homeTeam.name}</span>
          </div>
          <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {homeLineup.formation}
          </span>
        </div>

        {/* Pitch Layout */}
        <div className="relative w-full aspect-[2/3] bg-emerald-700 overflow-hidden border-y border-slate-700">
        {/* Pitch Lines Background */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          {/* Home Penalty Area (Top) */}
          <div className="absolute top-0 left-1/2 w-48 h-24 border-2 border-t-0 border-white -translate-x-1/2"></div>
          {/* Away Penalty Area (Bottom) */}
          <div className="absolute bottom-0 left-1/2 w-48 h-24 border-2 border-b-0 border-white -translate-x-1/2"></div>
        </div>

        {/* Players on Pitch */}
        <div className="absolute inset-0 flex flex-col justify-between py-4">
          {/* Home Team (Top Half) */}
          <div className="flex-1 flex flex-col justify-around">
            {homeRows.map((row, i) => (
              <div key={`home-row-${i}`} className="flex justify-evenly w-full px-4">
                {row.map(p => renderPlayerNode(p, true))}
              </div>
            ))}
          </div>
          {/* Away Team (Bottom Half) */}
          <div className="flex-1 flex flex-col justify-around">
            {awayRowsReversed.map((row, i) => (
              <div key={`away-row-${i}`} className="flex justify-evenly w-full px-4">
                {row.map(p => renderPlayerNode(p, false))}
              </div>
            ))}
          </div>
        </div>

        </div>
        
        {/* Away Team Banner (Outside Bottom) */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800">
          <div className="flex items-center">
            <img src={getFlagCdnUrl(match.awayTeam.code)} alt="" className="w-6 h-4 object-cover rounded-sm mr-3 shadow" />
            <span className="text-white text-sm font-black uppercase tracking-wider">{match.awayTeam.name}</span>
          </div>
          <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {awayLineup.formation}
          </span>
        </div>
      </div>

      {/* Team Toggle */}
      <div className="flex bg-[#131b2e] p-1 rounded-full border border-slate-800 max-w-md mx-auto">
        <button
          onClick={() => setSelectedTeam("home")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-full transition-all duration-200 ${
            selectedTeam === "home" ? "bg-slate-200 text-[#0f172a]" : "text-slate-400 opacity-50 hover:opacity-100"
          }`}
        >
          <img src={getFlagCdnUrl(match.homeTeam.code)} alt="" className="w-5 h-3 object-cover rounded-sm shadow" />
          <span className="text-xs font-bold">{match.homeTeam.name}</span>
        </button>
        <button
          onClick={() => setSelectedTeam("away")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-full transition-all duration-200 ${
            selectedTeam === "away" ? "bg-slate-200 text-[#0f172a]" : "text-slate-400 opacity-50 hover:opacity-100"
          }`}
        >
          <img src={getFlagCdnUrl(match.awayTeam.code)} alt="" className="w-5 h-3 object-cover rounded-sm shadow" />
          <span className="text-xs font-bold">{match.awayTeam.name}</span>
        </button>
      </div>

      {/* Manager & Substitutes Section */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 max-w-md mx-auto space-y-6">
        {/* Manager */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-inner">
            <span className="text-xl">👔</span>
          </div>
          <div>
            <h4 className="font-extrabold text-white text-sm">
              {selectedTeam === "home" ? "Head Coach (Home)" : "Head Coach (Away)"}
            </h4>
            <span className="text-xs text-indigo-400 font-bold">Coach</span>
          </div>
        </div>

        {/* Subs List */}
        <div>
          <h4 className="text-center font-bold text-sm text-slate-300 mb-4 border-b border-slate-800 pb-2">
            Substitutes
          </h4>
          <div className="space-y-3">
            {(selectedTeam === "home" ? homeLineup.substitutes : awayLineup.substitutes).map(player => {
              const subIn = getSubInEvent(player.name);
              
              return (
                <div key={player.id} className="flex justify-between items-center py-1 border-b border-slate-800/50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-black text-slate-300">
                      {player.number}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-slate-200">{player.name}</div>
                      {subIn && (
                        <div className="text-[10px] text-emerald-400 font-semibold flex items-center mt-0.5">
                          <span className="mr-1">🟢 {subIn.minute}'</span>
                          <span className="text-slate-500">In for {subIn.playerOne}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded bg-slate-950/40 uppercase">
                    {player.position}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
