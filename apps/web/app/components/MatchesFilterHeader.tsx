import React from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface MatchesFilterHeaderProps {
  groupBy: "date" | "round" | "group";
  setGroupBy: (mode: "date" | "round" | "group") => void;
  dateFilter: "finished" | "upcoming";
  setDateFilter: (filter: "finished" | "upcoming") => void;
  selectedRound: string;
  setSelectedRound: (rnd: string) => void;
  roundsList: string[];
  selectedGroup: string;
  setSelectedGroup: (grp: string) => void;
  groupsList: string[];
  t: (key: string) => string;
  handlePrevRound: () => void;
  handleNextRound: () => void;
  handlePrevGroup: () => void;
  handleNextGroup: () => void;
}

export function MatchesFilterHeader({
  groupBy,
  setGroupBy,
  dateFilter,
  setDateFilter,
  selectedRound,
  setSelectedRound,
  roundsList,
  selectedGroup,
  setSelectedGroup,
  groupsList,
  t,
  handlePrevRound,
  handleNextRound,
  handlePrevGroup,
  handleNextGroup
}: MatchesFilterHeaderProps) {
  return (
    <div className="flex flex-col border-b border-slate-800/40 pb-4 gap-4">
      {/* Header Row: Title & Capsule buttons */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-emerald-400" /> {t("matches")}
          </h3>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">
            {t("upcomingFixtures")}
          </span>
        </div>

        {/* Capsule Tab Buttons selector */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-full p-1 flex items-center">
          {(["date", "round", "group"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setGroupBy(mode)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                groupBy === mode
                  ? "bg-white text-slate-950 shadow-lg font-black"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode === "date" ? "By date" : mode === "round" ? "By round" : "By group"}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Controls Row: Moved and aligned to the right */}
      <div className="flex items-center justify-between sm:justify-end gap-4 py-1.5">
        {groupBy === "date" && (
          <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-4">
            {/* Finished / Upcoming filters */}
            <div className="bg-[#131b2e] border border-slate-800 rounded-full p-0.5 flex items-center">
              <button
                onClick={() => setDateFilter("finished")}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                  dateFilter === "finished" ? "bg-white text-slate-950 shadow animate-in fade-in" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                Finished
              </button>
              <button
                onClick={() => setDateFilter("upcoming")}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                  dateFilter === "upcoming" ? "bg-white text-slate-950 shadow animate-in fade-in" : "text-slate-500 hover:text-slate-350"
                }`}
              >
                Upcoming
              </button>
            </div>

            {/* Navigation Chevrons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDateFilter(dateFilter === "upcoming" ? "finished" : "upcoming")}
                className="bg-[#131b2e] border border-slate-800 rounded-xl p-2 flex items-center justify-center hover:bg-slate-800 hover:border-slate-700 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
              </button>
              <button
                onClick={() => setDateFilter(dateFilter === "upcoming" ? "finished" : "upcoming")}
                className="bg-[#131b2e] border border-slate-800 rounded-xl p-2 flex items-center justify-center hover:bg-slate-800 hover:border-slate-700 transition"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>
            </div>
          </div>
        )}

        {groupBy === "round" && (
          <div className="flex items-center space-x-2 ml-auto sm:ml-0">
            <button
              onClick={handlePrevRound}
              disabled={selectedRound === roundsList[0]}
              className={`bg-[#131b2e] border border-slate-800 rounded-xl p-2 flex items-center justify-center transition ${
                selectedRound === roundsList[0] ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-800 hover:border-slate-700"
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
            </button>

            <div className="bg-[#131b2e] border border-slate-800 rounded-xl px-3 py-1.5 flex items-center">
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="bg-transparent text-xs text-white font-bold outline-none cursor-pointer pr-2"
              >
                {roundsList.map((rnd) => (
                  <option key={rnd} value={rnd} className="bg-[#131b2e] text-white font-bold">
                    {rnd}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextRound}
              disabled={selectedRound === roundsList[roundsList.length - 1]}
              className={`bg-[#131b2e] border border-slate-800 rounded-xl p-2 flex items-center justify-center transition ${
                selectedRound === roundsList[roundsList.length - 1] ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-800 hover:border-slate-700"
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        )}

        {groupBy === "group" && (
          <div className="flex items-center space-x-2 ml-auto sm:ml-0">
            <button
              onClick={handlePrevGroup}
              disabled={selectedGroup === groupsList[0]}
              className={`bg-[#131b2e] border border-slate-800 rounded-xl p-2 flex items-center justify-center transition ${
                selectedGroup === groupsList[0] ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-800 hover:border-slate-700"
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
            </button>

            <div className="bg-[#131b2e] border border-slate-800 rounded-xl px-3 py-1.5 flex items-center">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="bg-transparent text-xs text-white font-bold outline-none cursor-pointer pr-2"
              >
                {groupsList.map((grp) => (
                  <option key={grp} value={grp} className="bg-[#131b2e] text-white font-bold">
                    {grp}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextGroup}
              disabled={selectedGroup === groupsList[groupsList.length - 1]}
              className={`bg-[#131b2e] border border-slate-800 rounded-xl p-2 flex items-center justify-center transition ${
                selectedGroup === groupsList[groupsList.length - 1] ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-800 hover:border-slate-700"
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
