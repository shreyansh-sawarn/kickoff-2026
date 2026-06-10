import React from "react";
import { getFlagCdnUrl } from "@wc26/utils";
import { HistoricalData } from "./archiveData";

export interface ArchiveGroupStandingsProps {
  groups: HistoricalData["groups"];
}

export function ArchiveGroupStandings({ groups }: ArchiveGroupStandingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group, gIdx) => (
        <div key={gIdx} className="bg-[#131b2e] border border-slate-800/60 rounded-2xl overflow-hidden text-xs">
          <div className="bg-slate-950/40 px-4 py-2.5 border-b border-slate-800/80 font-black text-emerald-450 uppercase tracking-widest">
            {group.name}
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/10 text-slate-450 border-b border-slate-800/40 font-bold">
                <th className="py-2 px-3">Pos</th>
                <th className="py-2 px-2">Team</th>
                <th className="py-2 px-2 text-center font-bold">P</th>
                <th className="py-2 px-2 text-center font-bold">GD</th>
                <th className="py-2 px-3 text-center font-bold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {group.standings.map((stat, idx) => (
                <tr key={stat.teamCode} className="border-b border-slate-850/60 last:border-0 hover:bg-slate-800/10">
                  <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-2 font-bold text-white flex items-center space-x-2">
                     <div className="w-6 h-4 relative overflow-hidden rounded-sm shadow-sm shrink-0">
                      <img src={getFlagCdnUrl(stat.teamCode)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="truncate max-w-[95px]">{stat.teamName}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-350">{stat.played}</td>
                  <td className="py-2.5 px-2 text-center text-slate-300">
                    {stat.goalDifference > 0 ? `+${stat.goalDifference}` : stat.goalDifference}
                  </td>
                  <td className="py-2.5 px-3 text-center font-black text-emerald-450 text-xs">{stat.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
