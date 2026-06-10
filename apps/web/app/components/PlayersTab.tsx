import React, { useState } from "react";
import { Award, Target, Shield, Clock, AlertTriangle, XOctagon } from "lucide-react";
import { Player, PlayerLeaderboards, CleanSheetEntry } from "@wc26/types";
import { getFlagCdnUrl } from "@wc26/utils";

interface PlayersTabProps {
  players: PlayerLeaderboards | null;
  t: (key: string) => string;
}

type PositionFilter = "ALL" | "GK" | "DEF" | "MID" | "FWD";

export function PlayersTab({ players, t }: PlayersTabProps) {
  const [filter, setFilter] = useState<PositionFilter>("ALL");

  if (!players) {
    return <div className="text-center text-slate-400 py-12">Loading player stats...</div>;
  }

  const renderEmpty = () => (
    <div className="py-8 text-center text-slate-500 text-sm font-medium">
      Stats will appear once the tournament begins
    </div>
  );

  const filterPlayers = (list: Player[]) => {
    if (filter === "ALL") return list;
    return list.filter(p => p.position === filter);
  };

  const LeaderboardCard = ({ 
    title, 
    icon, 
    items, 
    valueKey, 
    valueLabel,
    isCleanSheet = false
  }: { 
    title: string; 
    icon: React.ReactNode; 
    items: any[]; 
    valueKey: string; 
    valueLabel: string;
    isCleanSheet?: boolean;
  }) => (
    <div className="bg-[#131b2e] border border-slate-800/60 rounded-2xl p-6 flex flex-col">
      <h4 className="font-extrabold text-sm text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        {icon} {title}
      </h4>
      <div className="flex-1 divide-y divide-slate-850">
        {items.length === 0 ? renderEmpty() : items.slice(0, 5).map((item, idx) => (
          <div key={item.id || item.teamId} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
            <div className="flex items-center space-x-4">
              <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                {idx + 1}
              </span>
              <div>
                <h5 className="font-bold text-sm text-white truncate max-w-[120px] sm:max-w-[160px]">
                  {isCleanSheet ? item.teamName : item.name}
                </h5>
                <span className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                  <div className="w-4 h-3 relative overflow-hidden rounded-sm shadow-sm inline-block shrink-0 align-middle mr-1">
                    <img src={getFlagCdnUrl(item.teamId.toUpperCase())} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="truncate max-w-[80px]">{item.teamCode || item.teamName}</span>
                  {!isCleanSheet && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[80px]">{item.club}</span>
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="text-center shrink-0 ml-2">
              <span className="font-black text-emerald-400 text-lg">{isCleanSheet ? item[valueKey] : item.tournamentStats[valueKey]}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">{valueLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Dynamic Spotlight */}
      <div className="bg-[#131b2e] border border-slate-800/60 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-tr from-emerald-500/20 to-slate-955 p-8 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-6">
          <div>
            <h3 className="font-extrabold text-2xl text-white mb-2">Tournament Leaders</h3>
            <p className="text-slate-400 text-sm">Real-time statistics updated after every match.</p>
          </div>
          {players.goals.length > 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center gap-4">
               <span className="text-4xl">👟</span>
               <div>
                 <h4 className="font-bold text-white text-lg">{players.goals[0].name}</h4>
                 <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">{players.goals[0].teamName}</span>
               </div>
               <div className="ml-4 pl-4 border-l border-slate-800 text-center">
                 <span className="font-black text-2xl text-white">{players.goals[0].tournamentStats.goals}</span>
                 <span className="text-[10px] text-slate-500 uppercase font-bold block">Goals</span>
               </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-4 text-center">
              <span className="text-sm font-bold text-slate-300 block">Tournament kicks off</span>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">June 11, 2026</span>
            </div>
          )}
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LeaderboardCard 
          title="Golden Boot" 
          icon={<Award className="w-4 h-4" />} 
          items={players.goals} 
          valueKey="goals" 
          valueLabel="Goals" 
        />
        <LeaderboardCard 
          title="Assist Kings" 
          icon={<Target className="w-4 h-4" />} 
          items={players.assists} 
          valueKey="assists" 
          valueLabel="Assists" 
        />
        <LeaderboardCard 
          title="Clean Sheets" 
          icon={<Shield className="w-4 h-4" />} 
          items={players.cleanSheets} 
          valueKey="cleanSheets" 
          valueLabel="Clean Sheets" 
          isCleanSheet={true}
        />
      </div>

      {/* Row 2 Header with Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/50">
        <h3 className="font-bold text-white">Player Discipline & Workload</h3>
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 overflow-x-auto w-full sm:w-auto">
          {(["ALL", "GK", "DEF", "MID", "FWD"] as PositionFilter[]).map((pos) => (
            <button
              key={pos}
              onClick={() => setFilter(pos)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                filter === pos 
                  ? "bg-emerald-500 text-slate-950" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LeaderboardCard 
          title="Most Minutes" 
          icon={<Clock className="w-4 h-4" />} 
          items={filterPlayers(players.minutes)} 
          valueKey="minutesPlayed" 
          valueLabel="Mins" 
        />
        <LeaderboardCard 
          title="Yellow Cards" 
          icon={<AlertTriangle className="w-4 h-4 text-yellow-400" />} 
          items={filterPlayers(players.yellowCards)} 
          valueKey="yellowCards" 
          valueLabel="Cards" 
        />
        <LeaderboardCard 
          title="Red Cards" 
          icon={<XOctagon className="w-4 h-4 text-red-500" />} 
          items={filterPlayers(players.redCards)} 
          valueKey="redCards" 
          valueLabel="Cards" 
        />
      </div>
    </div>
  );
}
