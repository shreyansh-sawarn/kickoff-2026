import React, { useState } from "react";
import { getFlagCdnUrl } from "@wc26/utils";
import { HistoricalMatch } from "./archiveData";

interface ArchiveMatchesProps {
  matches: HistoricalMatch[];
}

export function ArchiveMatches({ matches }: ArchiveMatchesProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMatches = matches.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.homeTeam.toLowerCase().includes(q) ||
      m.awayTeam.toLowerCase().includes(q) ||
      (m.group && m.group.toLowerCase().includes(q)) ||
      (m.round && m.round.toLowerCase().includes(q)) ||
      (m.stadium && m.stadium.toLowerCase().includes(q))
    );
  });

  // Group matches by Group or Round
  const groups: Record<string, HistoricalMatch[]> = {};
  filteredMatches.forEach((m) => {
    const key = m.group || m.round || "Other Matches";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(m);
  });

  // Sort matches within each group by match number
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => a.num - b.num);
  });

  const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
    const minA = Math.min(...groups[a].map((m) => m.num));
    const minB = Math.min(...groups[b].map((m) => m.num));
    return minA - minB;
  });

  const renderScorers = (goals?: HistoricalMatch['goals1']) => {
    if (!goals || goals.length === 0) return null;
    const sortedGoals = [...goals].sort((a, b) => {
      const timeA = a.minute + (a.offset || 0);
      const timeB = b.minute + (b.offset || 0);
      return timeA - timeB;
    });
    return (
      <div className="text-[10px] text-slate-400 mt-1 pl-8 flex flex-wrap gap-x-2 gap-y-0.5">
        {sortedGoals.map((g, idx) => {
          const timeText = g.offset ? `${g.minute}+${g.offset}` : `${g.minute}`;
          let text = `${g.name} ${timeText}'`;
          if (g.penalty) text += ' (P)';
          if (g.owngoal) text += ' (OG)';
          return (
            <span key={idx} className="inline-flex items-center text-slate-400 text-[10px]">
              <span className="mr-0.5 opacity-60">⚽</span>
              <span className="truncate max-w-[120px]">{text}</span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#131b2e] border border-slate-800/60 rounded-2xl p-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search teams, groups, or venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-semibold"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-extrabold uppercase bg-slate-900/50 px-3 py-1.5 border border-slate-800/60 rounded-lg">
          Showing {filteredMatches.length} of {matches.length} Matches
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="text-center py-12 bg-[#131b2e] border border-slate-800/60 rounded-2xl">
          <p className="text-slate-450 text-sm font-bold">No matches match your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {sortedGroupKeys.map((groupKey) => (
            <div key={groupKey} className="space-y-3">
              <div 
                id={`archive-section-${groupKey.toLowerCase().replace(/[^a-z0-9]/g, "")}`} 
                className="flex items-center space-x-3"
              >
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                  {groupKey}
                </span>
                <div className="flex-1 h-px bg-slate-800/60" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups[groupKey].map((m) => {
                  const isHomeWinner = m.details?.toLowerCase().includes("pen") 
                    ? m.details.includes(`${m.homeTeam} win`) || m.details.includes(`${m.homeCode} win`)
                    : Number(m.homeScore) > Number(m.awayScore);
                  const isAwayWinner = m.details?.toLowerCase().includes("pen") 
                    ? m.details.includes(`${m.awayTeam} win`) || m.details.includes(`${m.awayCode} win`)
                    : Number(m.awayScore) > Number(m.homeScore);

                  return (
                    <div
                      key={m.num}
                      className="bg-[#131b2e] border border-slate-800/60 rounded-2xl p-4 hover:border-slate-700/60 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Match Header */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-3 border-b border-slate-800/40 pb-2">
                          <span className="bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded text-slate-350">Match {m.num}</span>
                          <span className="text-slate-500">{m.date} {m.time ? `• ${m.time}` : ""}</span>
                        </div>

                        {/* Teams Grid */}
                        <div className="space-y-4 my-2">
                          {/* Home Team */}
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-6 h-4 relative overflow-hidden rounded-sm shadow-sm shrink-0 border border-slate-800/30">
                                  <img src={getFlagCdnUrl(m.homeCode)} alt="" className="w-full h-full object-cover" />
                                </div>
                                <span className={`text-xs font-extrabold transition-all ${isHomeWinner ? 'text-white' : 'text-slate-400 font-bold'}`}>
                                  {m.homeTeam}
                                </span>
                              </div>
                              <span className={`text-xs font-black px-1.5 py-0.5 rounded ${isHomeWinner ? 'text-emerald-450 bg-emerald-500/5' : 'text-slate-450'}`}>
                                {m.homeScore}
                              </span>
                            </div>
                            {renderScorers(m.goals1)}
                          </div>

                          {/* Away Team */}
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2.5">
                                <div className="w-6 h-4 relative overflow-hidden rounded-sm shadow-sm shrink-0 border border-slate-800/30">
                                  <img src={getFlagCdnUrl(m.awayCode)} alt="" className="w-full h-full object-cover" />
                                </div>
                                <span className={`text-xs font-extrabold transition-all ${isAwayWinner ? 'text-white' : 'text-slate-400 font-bold'}`}>
                                  {m.awayTeam}
                                </span>
                              </div>
                              <span className={`text-xs font-black px-1.5 py-0.5 rounded ${isAwayWinner ? 'text-emerald-450 bg-emerald-500/5' : 'text-slate-450'}`}>
                                {m.awayScore}
                              </span>
                            </div>
                            {renderScorers(m.goals2)}
                          </div>
                        </div>
                      </div>

                      {/* Footer Details */}
                      {(m.details || m.stadium) && (
                        <div className="mt-3 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                          <span className="truncate max-w-[190px]">{m.stadium || ""}</span>
                          {m.details && (
                            <span className="text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider">
                              {m.details}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
