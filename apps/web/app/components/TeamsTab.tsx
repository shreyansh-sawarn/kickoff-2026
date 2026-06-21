import React, { useState, useEffect } from "react";
import { Users, Search, Star, X, Calendar } from "lucide-react";
import { Team, Match } from "@wc26/types";
import { getCountryFlag, formatMatchDate, formatMatchTime, getFlagCdnUrl } from "@wc26/utils";
import { teamProfiles } from "./teamProfilesData";

interface TeamsTabProps {
  teams: Team[];
  matches: Match[];
  favorites: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toggleFavorite: (id: string) => void;
  t: (key: string) => string;
}

function getBadgeColor(code: string, confederation: string): string {
  const c = code.toUpperCase();
  const overrides: Record<string, string> = {
    TUR: "bg-red-500/10 text-red-400 border border-red-500/20",
    FRA: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    BRA: "bg-yellow-500/10 text-yellow-450 border border-yellow-500/20",
    RSA: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    SCO: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    ARG: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    NED: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    ENG: "bg-slate-550/10 text-slate-300 border border-slate-500/20",
    GER: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    ESP: "bg-red-500/10 text-red-400 border border-red-500/20",
    POR: "bg-red-500/10 text-red-400 border border-red-500/20",
    ITA: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    MEX: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    USA: "bg-blue-500/10 text-blue-400 border border-blue-500/20"
  };

  if (overrides[c]) return overrides[c];

  switch (confederation?.toUpperCase()) {
    case "UEFA":
      return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    case "CONMEBOL":
      return "bg-yellow-500/10 text-yellow-450 border border-yellow-500/20";
    case "CONCACAF":
      return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    case "CAF":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    case "AFC":
      return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
    case "OFC":
      return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
  }
}

const MANAGERS: Record<string, string> = {
  USA: "Mauricio Pochettino",
  FRA: "Didier Deschamps",
  CMR: "Marc Brys",
  NZL: "Darren Bazeley",
  MEX: "Javier Aguirre",
  ESP: "Luis de la Fuente",
  NGA: "Finidi George",
  AUS: "Tony Popovic",
  CAN: "Jesse Marsch",
  GER: "Julian Nagelsmann",
  MAR: "Walid Regragui",
  JPN: "Hajime Moriyasu",
  ARG: "Lionel Scaloni",
  ENG: "Thomas Tuchel",
  SEN: "Aliou Cissé",
  KSA: "Roberto Mancini",
  BRA: "Dorival Júnior",
  POR: "Roberto Martínez",
  EGY: "Hossam Hassan",
  KOR: "Hong Myung-bo",
  BEL: "Domenico Tedesco",
  CRO: "Zlatko Dalić",
  URU: "Marcelo Bielsa",
  IRN: "Amir Ghalenoei",
  NED: "Ronald Koeman",
  COL: "Néstor Lorenzo",
  GHA: "Otto Addo",
  IRQ: "Jesús Casas",
  ITA: "Luciano Spalletti",
  DEN: "Brian Riemer",
  ECU: "Sebastián Beccacece",
  QAT: "Tintín Márquez",
  SUI: "Murat Yakin",
  POL: "Michał Probierz",
  TUN: "Faouzi Benzarti",
  UAE: "Paulo Bento",
  AUT: "Ralf Rangnick",
  TUR: "Vincenzo Montella",
  PAR: "Gustavo Alfaro",
  PAN: "Thomas Christiansen",
  UKR: "Serhiy Rebrov",
  PER: "Jorge Fossati",
  JAM: "Steve McClaren",
  ALG: "Vladimir Petković",
  SWE: "Jon Dahl Tomasson",
  CHI: "Ricardo Gareca",
  RSA: "Hugo Broos",
  HON: "Reinaldo Rueda",
  CPV: "Bubista",
  CUW: "Dick Advocaat",
  JOR: "Jamal Sellami"
};

export function TeamsTab({
  teams,
  matches,
  favorites,
  searchQuery,
  setSearchQuery,
  toggleFavorite,
  t
}: TeamsTabProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [squadLoading, setSquadLoading] = useState(false);
  const [coachName, setCoachName] = useState("TBD");
  const [dynamicSquad, setDynamicSquad] = useState<any[]>([]);

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const teamMatches = selectedTeam 
    ? matches.filter(m => m.homeTeam.id === selectedTeam.id || m.awayTeam.id === selectedTeam.id)
    : [];

  useEffect(() => {
    if (!selectedTeam) {
      setCoachName("TBD");
      setDynamicSquad([]);
      return;
    }

    setSquadLoading(true);
    fetch(`/api/teams/squad?code=${selectedTeam.code}&id=${selectedTeam.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Squad load failed");
        return res.json();
      })
      .then((data) => {
        setCoachName(data.coach || "TBD");
        setDynamicSquad(data.players || []);
        setSquadLoading(false);
      })
      .catch((err) => {
        console.error(err);
        // Fallback to static data directly if fetch breaks
        const normalizedId = selectedTeam.id === "turkey" || selectedTeam.id === "türkiye" ? "tur" : selectedTeam.id;
        const localProfile = teamProfiles.find((p) => p.team_id === normalizedId);
        setCoachName(localProfile?.coach || "TBD");
        setDynamicSquad(localProfile?.key_players || []);
        setSquadLoading(false);
      });
  }, [selectedTeamId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Users className="w-5 h-5 mr-2 text-emerald-400" /> {t("teams")} ({teams.length})
        </h3>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 flex items-center space-x-2 flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 outline-none text-xs text-white placeholder-slate-500 w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {teams
          .filter(tData => tData.name.toLowerCase().includes(searchQuery.toLowerCase()) || tData.code.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((team) => {
            const isFav = favorites.includes(team.id);
            return (
              <div 
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-5 flex flex-col items-center justify-between text-center hover:border-emerald-500/20 hover:shadow-lg transition-all duration-300 relative group cursor-pointer"
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(team.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-slate-800/80 transition z-10"
                >
                  <Star className={`w-4 h-4 ${isFav ? "fill-amber-400 text-amber-400" : "text-slate-500"}`} />
                </button>

                <div className="w-16 h-10 relative overflow-hidden rounded-lg shadow-md mb-3 group-hover:scale-105 transition duration-300">
                  <img 
                    src={getFlagCdnUrl(team.code)} 
                    alt={team.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-1 w-full">
                  <h4 className="font-extrabold text-sm text-slate-100 mb-2.5 leading-tight group-hover:text-emerald-400 transition-colors" title={team.name}>
                    {team.name}
                  </h4>
                  <div className="flex items-center justify-center space-x-1.5 w-full">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${getBadgeColor(team.code, team.confederation)}`}>
                      {team.code}
                    </span>
                    <span className="text-[10px] text-slate-455 font-bold whitespace-nowrap">
                      Group {team.group}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
        {/* Squad & Matches Detailed Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-slate-800/80 rounded-3xl w-full max-w-4xl h-[80vh] max-h-[750px] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40 shrink-0">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-9 overflow-hidden rounded-lg shadow-md border border-slate-850">
                  <img src={getFlagCdnUrl(selectedTeam.code)} alt={selectedTeam.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black text-white">{selectedTeam.name}</h3>
                    <button 
                      onClick={() => toggleFavorite(selectedTeam.id)}
                      className="p-1 rounded-full hover:bg-slate-800 transition"
                    >
                      <Star className={`w-4 h-4 ${favorites.includes(selectedTeam.id) ? "fill-amber-400 text-amber-400" : "text-slate-500"}`} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5 text-[10px]">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${getBadgeColor(selectedTeam.code, selectedTeam.confederation)}`}>
                      {selectedTeam.code}
                    </span>
                    <span className="text-slate-400 font-bold">Group {selectedTeam.group}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 font-semibold">{selectedTeam.confederation}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTeamId(null)}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 w-full scrollbar-thin">
              
              {/* 1. Squad Roster Section */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-xs text-emerald-450 uppercase tracking-widest border-b border-slate-850 pb-2">
                  Squad Roster
                </h4>
                {squadLoading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between h-12 bg-slate-900/40 border border-slate-800/40 rounded-2xl px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-slate-800"></div>
                          <div className="w-32 h-4 bg-slate-800 rounded"></div>
                        </div>
                        <div className="w-10 h-4 bg-slate-800 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : dynamicSquad.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
                    Squad roster details not announced yet.
                  </div>
                ) : (() => {
                  const gks = dynamicSquad.filter(p => p.position === "GK");
                  const defs = dynamicSquad.filter(p => p.position === "DEF");
                  const mids = dynamicSquad.filter(p => p.position === "MID");
                  const fwds = dynamicSquad.filter(p => p.position === "FWD");

                  const renderPlayerCategory = (title: string, icon: string, players: any[]) => (
                    <div className="bg-[#131b2e]/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                      <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-800/40 pb-2">
                        <span>{icon}</span>
                        <span>{title} ({players.length})</span>
                      </h5>
                      {players.length === 0 ? (
                        <div className="text-slate-500 text-[10px] italic py-2">No players registered.</div>
                      ) : (
                        <div className="divide-y divide-slate-800/20">
                          {players.map((player: any, idx: number) => (
                            <div key={idx} className="py-2 flex items-center justify-between text-[11px] first:pt-0 last:pb-0">
                              <div className="flex items-center space-x-2">
                                <span className="w-4 h-4 rounded bg-slate-950 border border-slate-850 flex items-center justify-center text-[8px] font-black text-slate-500">
                                  {player.number || (idx + 1)}
                                </span>
                                <div className="font-bold text-slate-200">{player.name}</div>
                              </div>
                              <span className="text-[9px] text-slate-500 font-medium truncate max-w-[120px]">{player.club}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderPlayerCategory("Goalkeepers", "🧤", gks)}
                      {renderPlayerCategory("Defenders", "🛡️", defs)}
                      {renderPlayerCategory("Midfielders", "🪄", mids)}
                      {renderPlayerCategory("Forwards", "⚡", fwds)}
                    </div>
                  );
                })()}
              </div>

              {/* 2. Manager/Coach Section */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-xs text-emerald-455 uppercase tracking-widest border-b border-slate-850 pb-2">
                  Team Management
                </h4>
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
                    👔
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Manager</span>
                    <span className="font-black text-sm text-slate-100">{coachName}</span>
                  </div>
                </div>
              </div>

              {/* 3. Fixtures & Results Section */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-xs text-emerald-455 uppercase tracking-widest border-b border-slate-850 pb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5" /> Fixtures & Results
                </h4>
                
                {teamMatches.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {teamMatches.map((match) => {
                      const isUpcoming = match.status === "upcoming";
                      const isLive = match.status === "live";
                      const isHome = match.homeTeam.id === selectedTeam.id;
                      const opponent = isHome ? match.awayTeam : match.homeTeam;

                      return (
                        <div 
                          key={match.id}
                          className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between text-xs hover:border-slate-700/60 transition duration-200 space-y-3"
                        >
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider border-b border-slate-800/40 pb-1.5">
                            <span className="text-emerald-500">{match.group}</span>
                            {isLive ? (
                              <span className="text-rose-405 bg-rose-500/10 px-1.5 py-0.5 rounded animate-pulse">LIVE {match.clock || `${match.minute}'`}</span>
                            ) : isUpcoming ? (
                              <span className="text-slate-500">{formatMatchDate(match.datetime)}</span>
                            ) : (
                              <span className="text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">FT</span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2.5">
                            <div className="w-6 h-4 relative overflow-hidden rounded-sm shadow-sm shrink-0">
                              <img src={getFlagCdnUrl(opponent.code)} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-slate-200 truncate">{opponent.name}</span>
                          </div>

                          <div className="pt-1.5 border-t border-slate-800/30 flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 font-bold">
                              {isUpcoming ? "Match Start" : "Match Result"}
                            </span>
                            {isUpcoming ? (
                              <span className="font-black text-slate-300">{formatMatchTime(match.datetime)}</span>
                            ) : (
                              <span className="font-black text-emerald-450 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                                {match.homeScore ?? 0} : {match.awayScore ?? 0}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-500 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
                    No fixtures confirmed yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
