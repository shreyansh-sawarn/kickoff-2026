import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { Match } from "@wc26/types";
import { formatMatchTime, formatMatchDate, getFlagCdnUrl } from "@wc26/utils";
import { MatchesFilterHeader } from "./MatchesFilterHeader";

/** Renders a country flag, or a shield placeholder for unconfirmed knockout teams */
const FlagOrShield = ({ code, className = "" }: { code: string; className?: string }) => {
  if (!code || code === "TBD") {
    return (
      <div className={`flex items-center justify-center bg-slate-800/60 border border-slate-700/50 rounded ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-slate-500" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 4.418 3.364 8.535 8 9.9C16.636 20.535 20 16.418 20 12V6l-8-4z" />
        </svg>
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden rounded shadow-sm ${className}`}>
      <img src={getFlagCdnUrl(code)} alt="" className="w-full h-full object-cover" />
    </div>
  );
};

interface MatchesTabProps {
  matches: Match[];
  liveMatches: Match[];
  t: (key: string) => string;
  router: { push: (url: string) => void };
}

export default function MatchesTab({
  matches,
  liveMatches,
  t,
  router
}: MatchesTabProps) {
  const [groupBy, setGroupBy] = useState<"date" | "round" | "group">("date");
  const [dateFilter, setDateFilter] = useState<"finished" | "upcoming">("upcoming");

  const [selectedRound, setSelectedRound] = useState<string>("Round 1");
  const roundsList = [
    "Round 1", 
    "Round 2", 
    "Round 3", 
    "Round of 32", 
    "Round of 16", 
    "Quarterfinals", 
    "Semifinals", 
    "Match for 3rd place", 
    "Final"
  ];

  const [selectedGroup, setSelectedGroup] = useState<string>("Group A");
  const groupsList = [
    "Group A", "Group B", "Group C", "Group D", "Group E", "Group F",
    "Group G", "Group H", "Group I", "Group J", "Group K", "Group L"
  ];

  const getMatchRound = (match: Match): string => {
    const g = match.group?.toLowerCase() || "";
    // Knockout stage — detect by group field or id pattern
    if (g === "r32" || g === "round of 32" || match.id.startsWith("r32_")) return "Round of 32";
    if (g === "r16" || g === "round of 16" || match.id.startsWith("r16_")) return "Round of 16";
    if (g === "qf" || g === "quarterfinals" || match.id.startsWith("qf_")) return "Quarterfinals";
    if (g === "sf" || g === "semifinals" || match.id.startsWith("sf_")) return "Semifinals";
    if (g === "3rd" || g === "match for 3rd place" || match.id.startsWith("3rd_")) return "Match for 3rd place";
    if (g === "final" || match.id.startsWith("final_")) return "Final";
    // Group stage — split 3 matchdays by date ordering within each group
    // Use kickoff datetime to assign matchday: earliest 1/3 = R1, middle 1/3 = R2, last 1/3 = R3
    // Simpler: just use the id suffix index within group
    const groupMatches = matches
      .filter(m => m.group === match.group)
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    const idx = groupMatches.findIndex(m => m.id === match.id);
    if (idx <= 1) return "Round 1";
    if (idx <= 3) return "Round 2";
    return "Round 3";
  };

  const handlePrevRound = () => {
    const idx = roundsList.indexOf(selectedRound);
    if (idx > 0) setSelectedRound(roundsList[idx - 1]);
  };

  const handleNextRound = () => {
    const idx = roundsList.indexOf(selectedRound);
    if (idx < roundsList.length - 1) setSelectedRound(roundsList[idx + 1]);
  };

  const handlePrevGroup = () => {
    const idx = groupsList.indexOf(selectedGroup);
    if (idx > 0) setSelectedGroup(groupsList[idx - 1]);
  };

  const handleNextGroup = () => {
    const idx = groupsList.indexOf(selectedGroup);
    if (idx < groupsList.length - 1) setSelectedGroup(groupsList[idx + 1]);
  };

  const getFilteredDateMatches = () => {
    return matches.filter((m) => {
      if (dateFilter === "finished") {
        return m.status === "completed";
      } else {
        return m.status === "upcoming" || m.status === "live";
      }
    });
  };

  const matchesByDate: Record<string, Match[]> = {};
  getFilteredDateMatches().forEach((m) => {
    const dateStr = formatMatchDate(m.datetime);
    if (!matchesByDate[dateStr]) matchesByDate[dateStr] = [];
    matchesByDate[dateStr].push(m);
  });

  const renderMatchRow = (match: Match) => {
    const isUpcoming = match.status === "upcoming";
    const isLive = match.status === "live";

    return (
      <div
        key={match.id}
        onClick={() => router.push(`/matches/${match.id}`)}
        className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between hover:bg-slate-800/10 transition gap-4 cursor-pointer"
      >
        <div className="flex flex-col text-center sm:text-left sm:w-[30%]">
          <span className="text-xs text-slate-400 font-semibold">{match.group}</span>
          <span className="text-[10px] text-slate-500 flex items-center justify-center sm:justify-start mt-0.5 truncate">
            <MapPin className="w-3 h-3 mr-1 shrink-0" /> <span className="truncate">{match.stadium}</span>
          </span>
        </div>

        <div className="flex items-center justify-center space-x-2 sm:space-x-4 sm:w-[45%] max-w-lg">
          <div className="flex items-center space-x-3 flex-1 justify-end min-w-0">
            <span className="font-bold text-slate-200 hidden sm:block w-full text-right leading-tight">{match.homeTeam.name}</span>
            <span className="font-bold text-slate-200 sm:hidden w-full text-right">{match.homeTeam.code}</span>
            <FlagOrShield code={match.homeTeam.code} className="w-8 h-5 shrink-0" />
          </div>

          <div className="w-[80px] sm:w-[100px] flex justify-center shrink-0">
            {isLive ? (
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 animate-pulse whitespace-nowrap">
                LIVE {match.minute}'
              </span>
            ) : isUpcoming ? (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 whitespace-nowrap">
                {formatMatchTime(match.datetime)}
              </span>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <span className="text-base font-extrabold text-white px-3.5 py-1.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-center min-w-[70px]">
                  <span>{match.homeScore}</span>
                  <span className="mx-2">:</span>
                  <span>{match.awayScore}</span>
                </span>
                {match.homePenaltyScore !== undefined && match.awayPenaltyScore !== undefined && (
                  <span className="text-[9px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 uppercase tracking-widest whitespace-nowrap">
                    Pen {match.homePenaltyScore}:{match.awayPenaltyScore}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 flex-1 justify-start min-w-0">
            <FlagOrShield code={match.awayTeam.code} className="w-8 h-5 shrink-0" />
            <span className="font-bold text-slate-200 hidden sm:block w-full text-left leading-tight">{match.awayTeam.name}</span>
            <span className="font-bold text-slate-200 sm:hidden w-full text-left">{match.awayTeam.code}</span>
          </div>
        </div>

        <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-[25%] flex flex-col sm:items-end">
          {isUpcoming ? (
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              {formatMatchDate(match.datetime)}
            </span>
          ) : (
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">
              {isLive ? t("live") : t("final")}
            </span>
          )}
        </div>
      </div>
    );
  };

  const roundFilteredMatches = matches.filter((m) => getMatchRound(m) === selectedRound);
  const groupFilteredMatches = matches.filter((m) => m.group === selectedGroup);

  return (
    <div className="space-y-6">
      <MatchesFilterHeader
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        selectedRound={selectedRound}
        setSelectedRound={setSelectedRound}
        roundsList={roundsList}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        groupsList={groupsList}
        t={t}
        handlePrevRound={handlePrevRound}
        handleNextRound={handleNextRound}
        handlePrevGroup={handlePrevGroup}
        handleNextGroup={handleNextGroup}
      />

      {/* Matches Content List Display */}
      <div className="space-y-6">
        {/* Render Live Block on top (only shown in date view when there are active live matches) */}
        {groupBy === "date" && liveMatches.length > 0 && dateFilter === "upcoming" && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 mr-2 animate-pulse"></span>
              {t("liveMatches")}
            </div>
            <div className={`grid grid-cols-1 ${liveMatches.length === 1 ? '' : 'md:grid-cols-2 lg:grid-cols-2'} gap-4`}>
              {liveMatches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => router.push(`/matches/${match.id}`)}
                  className="bg-[#131b2e] border border-rose-500/20 p-5 rounded-2xl flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-slate-400 font-semibold">{match.group}</span>
                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {t("live")} {match.minute}'
                    </span>
                  </div>
                  <div className="flex items-center justify-between my-2">
                    <div className="flex items-center space-x-3 w-1/3 min-w-0">
                      <div className="w-9 h-6 relative overflow-hidden rounded shadow-sm shrink-0">
                        <img src={getFlagCdnUrl(match.homeTeam.code)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-slate-100 truncate w-full text-left">{match.homeTeam.name}</span>
                    </div>
                    <span className="text-2xl font-black text-white px-4 py-2 rounded-xl bg-slate-950/40 border border-slate-850">
                      {match.homeScore} : {match.awayScore}
                    </span>
                    <div className="flex items-center space-x-3 w-1/3 justify-end text-right min-w-0">
                      <span className="font-bold text-slate-100 truncate w-full text-right">{match.awayTeam.name}</span>
                      <div className="w-9 h-6 relative overflow-hidden rounded shadow-sm shrink-0">
                        <img src={getFlagCdnUrl(match.awayTeam.code)} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4 pt-2 border-t border-slate-800 text-center">
                    {match.stadium}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Round Filtering */}
          {groupBy === "round" && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-450">
                {selectedRound} Matches
              </div>
              {roundFilteredMatches.length > 0 ? (
                <div className="divide-y divide-slate-800 bg-[#131b2e] border border-slate-800/60 rounded-2xl overflow-hidden">
                  {roundFilteredMatches.map(renderMatchRow)}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-505 bg-[#131b2e]/30 border border-slate-800/40 rounded-2xl">
                  No matches scheduled for {selectedRound}
                </div>
              )}
            </div>
          )}

          {/* Group Filtering */}
          {groupBy === "group" && (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-450">
                {selectedGroup} Matches
              </div>
              {groupFilteredMatches.length > 0 ? (
                <div className="divide-y divide-slate-800 bg-[#131b2e] border border-slate-800/60 rounded-2xl overflow-hidden">
                  {groupFilteredMatches.map(renderMatchRow)}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-505 bg-[#131b2e]/30 border border-slate-800/40 rounded-2xl">
                  No matches scheduled for {selectedGroup}
                </div>
              )}
            </div>
          )}

          {/* Date Filtering */}
          {groupBy === "date" && (
            <>
              {Object.keys(matchesByDate).length > 0 ? (
                Object.entries(matchesByDate).map(([date, dateMatches]) => (
                  <div key={date} className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-4">{date}</div>
                    <div className="divide-y divide-slate-800 bg-[#131b2e] border border-slate-800/60 rounded-2xl overflow-hidden">
                      {dateMatches.map(renderMatchRow)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-505 bg-[#131b2e]/30 border border-slate-800/40 rounded-2xl">
                  No {dateFilter} matches found.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
