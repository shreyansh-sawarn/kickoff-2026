import React, { useState } from "react";
import { Award, Target, Shield, Clock, AlertTriangle, XOctagon, X } from "lucide-react";
import { Player, PlayerLeaderboards, CleanSheetEntry } from "@wc26/types";
import { getFlagCdnUrl } from "@wc26/utils";
import { teamProfiles } from "./teamProfilesData";

interface PlayersTabProps {
  players: PlayerLeaderboards | null;
  t: (key: string) => string;
}

export function PlayersTab({ players, t }: PlayersTabProps) {
  const [activeModal, setActiveModal] = useState<{
    title: string;
    icon: React.ReactNode;
    items: any[];
    valueKey: string;
    valueLabel: string;
    isCleanSheet: boolean;
  } | null>(null);

  if (!players) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse py-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900/40 rounded-3xl border border-slate-800/60 p-6 space-y-4">
            <div className="h-6 w-32 bg-slate-800 rounded-lg"></div>
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between items-center h-12 bg-slate-800/50 rounded-xl px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                    <div className="w-24 h-4 bg-slate-700 rounded"></div>
                  </div>
                  <div className="w-8 h-4 bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderEmpty = () => (
    <div className="py-8 text-center text-slate-500 text-sm font-medium">
      Stats will appear once the tournament begins
    </div>
  );

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
  }) => {
    return (
      <div className="bg-[#131b2e] border border-slate-800/60 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <h4 className="font-extrabold text-sm text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            {icon} {title}
          </h4>
          <div className="flex-1 divide-y divide-slate-850">
            {items.length === 0 ? renderEmpty() : items.slice(0, 5).map((item, idx) => {
              let gkName = "";
              let gkClub = "";
              if (isCleanSheet) {
                const profile = teamProfiles.find(p => p.team_id === item.teamId.toLowerCase());
                const gkPlayer = profile?.key_players.find(p => p.position === "GK");
                gkName = gkPlayer?.name || "Goalkeeper";
                gkClub = gkPlayer?.club || "National Team";
              }
              return (
                <div key={item.id || item.teamId} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-4">
                    <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="font-bold text-sm text-white truncate max-w-[120px] sm:max-w-[160px] flex items-center gap-1">
                        {isCleanSheet ? gkName : item.name}
                      </h5>
                      <span className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                        <div className="w-4 h-3 relative overflow-hidden rounded-sm shadow-sm inline-block shrink-0 align-middle mr-1">
                          <img src={getFlagCdnUrl(item.teamId.toUpperCase())} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="truncate max-w-[80px]">{isCleanSheet ? item.teamName : (item.teamCode || item.teamName)}</span>
                        {isCleanSheet ? (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[80px]">{gkClub}</span>
                          </>
                        ) : (
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
              );
            })}
          </div>
        </div>
        {items.length > 5 && (
          <button 
            onClick={() => setActiveModal({ title, icon, items, valueKey, valueLabel, isCleanSheet })}
            className="w-full mt-4 pt-4 border-t border-slate-850/60 text-center text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors duration-200"
          >
            View Top 20
          </button>
        )}
      </div>
    );
  };

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
               <div className="ml-4 pl-4 border-l border-slate-800 text-center">
                 <span className="font-black text-2xl text-white">{players.goals[0].tournamentStats.assists}</span>
                 <span className="text-[10px] text-slate-500 uppercase font-bold block">Assists</span>
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

      {/* Row 2 Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/50">
        <h3 className="font-bold text-white">Player Discipline & Workload</h3>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LeaderboardCard 
          title="Most Minutes" 
          icon={<Clock className="w-4 h-4" />} 
          items={players.minutes} 
          valueKey="minutesPlayed" 
          valueLabel="Mins" 
        />
        <LeaderboardCard 
          title="Yellow Cards" 
          icon={<AlertTriangle className="w-4 h-4 text-yellow-400" />} 
          items={players.yellowCards} 
          valueKey="yellowCards" 
          valueLabel="Cards" 
        />
        <LeaderboardCard 
          title="Red Cards" 
          icon={<XOctagon className="w-4 h-4 text-red-500" />} 
          items={players.redCards} 
          valueKey="redCards" 
          valueLabel="Cards" 
        />
      </div>

      {/* Top 20 Modal Popup Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setActiveModal(null)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
          />
          {/* Modal Container */}
          <div className="bg-[#131b2e] border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-800/80 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                {activeModal.icon} Top 20 {activeModal.title}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white bg-slate-800/40 p-1.5 rounded-lg border border-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Modal List - 4 columns of 5 items */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[0, 1, 2, 3].map((colIdx) => {
                  const colItems = activeModal.items.slice(colIdx * 5, (colIdx + 1) * 5);
                  return (
                    <div key={colIdx} className="flex flex-col space-y-3.5">
                      {colItems.map((item, idx) => {
                        const globalIdx = colIdx * 5 + idx;
                        let gkName = "";
                        let gkClub = "";
                        if (activeModal.isCleanSheet) {
                          const profile = teamProfiles.find(p => p.team_id === item.teamId.toLowerCase());
                          const gkPlayer = profile?.key_players.find(p => p.position === "GK");
                          gkName = gkPlayer?.name || "Goalkeeper";
                          gkClub = gkPlayer?.club || "National Team";
                        }
                        return (
                          <div key={item.id || item.teamId} className="flex items-center justify-between py-2 border-b border-slate-850/30 last:border-0">
                            <div className="flex items-center space-x-3 min-w-0">
                              <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                                {globalIdx + 1}
                              </span>
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs text-white truncate max-w-[90px] sm:max-w-[120px]" title={activeModal.isCleanSheet ? gkName : item.name}>
                                  {activeModal.isCleanSheet ? gkName : item.name}
                                </h5>
                                <span className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                                  <div className="w-3.5 h-2.5 relative overflow-hidden rounded-sm shadow-sm inline-block shrink-0 align-middle mr-0.5">
                                    <img src={getFlagCdnUrl(item.teamId.toUpperCase())} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <span className="truncate max-w-[45px]">{activeModal.isCleanSheet ? item.teamName : (item.teamCode || item.teamName)}</span>
                                  <span className="shrink-0">•</span>
                                  <span className="truncate max-w-[45px] text-slate-500" title={activeModal.isCleanSheet ? gkClub : item.club}>{activeModal.isCleanSheet ? gkClub : item.club}</span>
                                </span>
                              </div>
                            </div>
                            <div className="text-center shrink-0 ml-2">
                              <span className="font-black text-emerald-400 text-sm">
                                {activeModal.isCleanSheet ? item[activeModal.valueKey] : item.tournamentStats[activeModal.valueKey]}
                              </span>
                              <span className="text-[8px] text-slate-500 uppercase tracking-wider block font-bold">{activeModal.valueLabel}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
