import React from "react";
import { BarChart3 } from "lucide-react";
import { Group } from "@wc26/types";
import { getCountryFlag, getFlagCdnUrl } from "@wc26/utils";

interface StandingsTabProps {
  standings: Group[];
  t: (key: string) => string;
}

export default function StandingsTab({ standings, t }: StandingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-emerald-400" /> {t("groupStage")}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {standings.map((group, groupIdx) => (
          <div key={groupIdx} className="bg-[#131b2e] border border-slate-800/60 rounded-2xl overflow-hidden">
            <div className="bg-slate-950/40 px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-emerald-450 uppercase tracking-widest">{group.name}</h4>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Group Stage</span>
            </div>
            
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/20 text-slate-400 border-b border-slate-800/40 font-bold">
                  <th className="py-3 px-5">Pos</th>
                  <th className="py-3 px-2">Team</th>
                  <th className="py-3 px-2 text-center font-bold">P</th>
                  <th className="py-3 px-2 text-center font-bold">W</th>
                  <th className="py-3 px-2 text-center font-bold">D</th>
                  <th className="py-3 px-2 text-center font-bold">L</th>
                  <th className="py-3 px-2 text-center font-bold">GLS</th>
                  <th className="py-3 px-2 text-center font-bold">GD</th>
                  <th className="py-3 px-5 text-center font-bold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {group.standings.map((stat, idx) => (
                  <tr key={stat.teamId} className="border-b border-slate-800/40 hover:bg-slate-800/10 last:border-0">
                    <td className="py-3 px-5 font-bold text-slate-350">{idx + 1}</td>
                    <td className="py-3 px-2 font-bold text-white flex items-center space-x-2">
                      <div className="w-6 h-4 relative overflow-hidden rounded-sm shadow-sm shrink-0">
                        <img src={getFlagCdnUrl(stat.teamCode)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate">{stat.teamName}</span>
                    </td>
                    <td className="py-3 px-2 text-center text-slate-300">{stat.played}</td>
                    <td className="py-3 px-2 text-center text-slate-400">{stat.won}</td>
                    <td className="py-3 px-2 text-center text-slate-400">{stat.drawn}</td>
                    <td className="py-3 px-2 text-center text-slate-400">{stat.lost}</td>
                    <td className="py-3 px-2 text-center text-slate-400">
                      {stat.goalsFor}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-300">{stat.goalDifference > 0 ? `+${stat.goalDifference}` : stat.goalDifference}</td>
                    <td className="py-3 px-5 text-center font-black text-emerald-455 text-sm">{stat.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Tiebreaker Rules & Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Table Abbreviations Legend */}
        <div className="bg-[#131b2e] border border-slate-800/60 rounded-2xl p-5 md:col-span-1">
          <h4 className="font-extrabold text-sm text-emerald-450 uppercase tracking-widest mb-4">Legend</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-black text-emerald-400 w-6">P</span>
                <span className="text-slate-400">Matches played</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-emerald-400 w-6">W</span>
                <span className="text-slate-400">Wins</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-emerald-400 w-6">D</span>
                <span className="text-slate-400">Draws</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-emerald-400 w-6">L</span>
                <span className="text-slate-400">Losses</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-black text-emerald-400 w-8">GLS</span>
                <span className="text-slate-400">Goals Scored</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-emerald-400 w-8">GD</span>
                <span className="text-slate-400">Goal Difference</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-emerald-400 w-8">Pts</span>
                <span className="text-slate-400">Points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tiebreaker Rules */}
        <div className="bg-[#131b2e] border border-slate-800/60 rounded-2xl p-5 md:col-span-2">
          <h4 className="font-extrabold text-sm text-emerald-450 uppercase tracking-widest mb-4">Playoffs</h4>
          <p className="text-xs text-slate-400 mb-3">
            In the event that two (or more) teams finish with an equal number of points, the following rules break the tie:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-350">
            <div className="space-y-2">
              <div>
                <span className="font-bold text-emerald-400 mr-1.5">1.</span>
                <span>Head-to-head games between the teams concerned</span>
                <div className="pl-4 mt-1 space-y-0.5 text-slate-400 text-[11px]">
                  <div>1a. Points total</div>
                  <div>1b. Goal difference</div>
                  <div>1c. Goals scored</div>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-start">
                <span className="font-bold text-emerald-400 mr-1.5">2.</span>
                <span>Overall goal difference</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-emerald-400 mr-1.5">3.</span>
                <span>Overall number of goals scored</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-emerald-400 mr-1.5">4.</span>
                <span>Disciplinary points</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-emerald-400 mr-1.5">5.</span>
                <span>Higher position in FIFA World Ranking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
