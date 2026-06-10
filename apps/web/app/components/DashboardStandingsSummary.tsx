import React, { useState } from "react";
import { Group } from "@wc26/types";
import { getFlagCdnUrl } from "@wc26/utils";

interface DashboardStandingsSummaryProps {
  standings: Group[];
  setActiveTab?: (tab: string) => void;
}

export function DashboardStandingsSummary({ standings, setActiveTab }: DashboardStandingsSummaryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentGroup = standings[selectedIndex];

  if (!currentGroup) return null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setActiveTab && setActiveTab("standings")}
            className="flex items-center text-sm font-bold uppercase text-emerald-400 tracking-wider hover:text-emerald-300 transition-colors group cursor-pointer"
          >
            STANDINGS
            <span className="ml-1.5 group-hover:translate-x-1 transition-transform">→</span>
          </button>
          
          <div className="relative group">
            <select 
              className="appearance-none bg-[#131b2e] text-emerald-400 font-extrabold text-xs tracking-wider uppercase rounded-lg border border-slate-700/60 hover:border-emerald-500/40 px-3 py-1.5 pr-8 outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-lg"
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
            >
              {standings.map((g, idx) => (
                <option key={g.name} value={idx}>{g.name}</option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500/70 group-hover:text-emerald-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
        
        <div className="bg-[#131b2e] border border-slate-800/60 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 border-b border-slate-800/80 font-bold">
                <th className="py-3 px-4">Pos</th>
                <th className="py-3 px-2">Team</th>
                <th className="py-3 px-2 text-center font-bold">P</th>
                <th className="py-3 px-2 text-center font-bold">GD</th>
                <th className="py-3 px-4 text-center font-bold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {currentGroup.standings.map((stat, idx) => (
                <tr key={stat.teamId} className="border-b border-slate-800/40 hover:bg-slate-800/20 last:border-0">
                  <td className="py-3 px-4 font-bold text-slate-350">{idx + 1}</td>
                  <td className="py-3 px-2 font-bold text-slate-200 flex items-center space-x-2">
                    <div className="w-6 h-4 relative overflow-hidden rounded-sm shadow-sm shrink-0">
                      <img src={getFlagCdnUrl(stat.teamCode)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="truncate max-w-[70px] sm:max-w-none">{stat.teamName}</span>
                  </td>
                  <td className="py-3 px-2 text-center font-semibold text-slate-300">{stat.played}</td>
                  <td className="py-3 px-2 text-center font-semibold text-slate-300">{stat.goalDifference}</td>
                  <td className="py-3 px-4 text-center font-black text-emerald-400">{stat.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
