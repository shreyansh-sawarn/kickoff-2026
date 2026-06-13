import React from "react";
import { Star } from "lucide-react";
import { Match } from "@wc26/types";
import { getFlagCdnUrl, formatMatchTime, formatMatchDate } from "@wc26/utils";

interface DashboardFavoritesProps {
  starredMatches: Match[];
  t: (key: string) => string;
  router: { push: (url: string) => void };
}

export function DashboardFavorites({
  starredMatches,
  t,
  router
}: DashboardFavoritesProps) {
  if (starredMatches.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-bold uppercase text-amber-400 tracking-wider mb-4 flex items-center">
        <Star className="w-4 h-4 mr-2 fill-amber-400 text-amber-400" />
        {t("starredFixtures")}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {starredMatches.map((match) => (
          <div 
            key={match.id}
            onClick={() => router.push(`/matches/${match.id}`)}
            className="bg-[#131b2e] border border-amber-400/25 p-4 rounded-xl flex items-center justify-between hover:border-amber-400 transition cursor-pointer"
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-8 h-5 relative overflow-hidden rounded shadow-sm shrink-0">
                <img src={getFlagCdnUrl(match.homeTeam.code)} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-sm text-slate-200 w-28 line-clamp-1">{match.homeTeam.name}</span>
              <span className="text-slate-500 font-bold text-xs">VS</span>
              <span className="font-bold text-sm text-slate-200 w-28 line-clamp-1 text-right">{match.awayTeam.name}</span>
              <div className="w-8 h-5 relative overflow-hidden rounded shadow-sm shrink-0">
                <img src={getFlagCdnUrl(match.awayTeam.code)} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="text-right pl-4 border-l border-slate-800 flex flex-col justify-center">
              {match.status === "upcoming" ? (
                <>
                  <span className="text-emerald-400 font-black text-sm">{formatMatchTime(match.datetime)}</span>
                  <span className="text-[9px] text-slate-400 font-medium">{formatMatchDate(match.datetime)}</span>
                </>
              ) : (
                <>
                  <span className="text-white font-black text-sm">{match.homeScore ?? 0} - {match.awayScore ?? 0}</span>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase">{t(match.status)}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
