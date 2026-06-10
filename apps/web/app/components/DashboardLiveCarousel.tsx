import React, { useEffect, useState } from "react";
import { Match } from "@wc26/types";
import { getFlagCdnUrl } from "@wc26/utils";
import { getNews } from "@wc26/api";

interface DashboardLiveCarouselProps {
  liveMatches: Match[];
  upcomingMatches: Match[];
  t: (key: string) => string;
  router: { push: (url: string) => void };
}

export function DashboardLiveCarousel({
  liveMatches,
  upcomingMatches,
  t,
  router
}: DashboardLiveCarouselProps) {
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    getNews().then(setNews);
  }, []);

  return (
    <div className="space-y-8">
      {/* Live Scores Ticker */}
      {liveMatches.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase text-emerald-400 tracking-wider mb-4 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2"></span>
            {t("liveMatches")} ({liveMatches.length})
          </h3>
          <div className={`grid grid-cols-1 ${liveMatches.length === 1 ? '' : 'md:grid-cols-2 lg:grid-cols-2'} gap-6`}>
            {liveMatches.map((match) => (
              <div 
                key={match.id} 
                onClick={() => router.push(`/matches/${match.id}`)}
                className="bg-[#131b2e] border border-emerald-500/30 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative group cursor-pointer"
              >
                <div className="absolute top-3 right-3 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>{match.minute}'</span>
                </div>
                
                <div className="p-6 flex flex-col justify-between h-full">
                  <div className="text-xs text-slate-400 mb-4 font-semibold">{match.group} • {match.stadium}</div>
                  
                  <div className="flex items-center justify-between my-2">
                    {/* Home Team */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-12 h-8 relative overflow-hidden rounded shadow-md mb-1.5">
                        <img src={getFlagCdnUrl(match.homeTeam.code)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-sm text-white text-center line-clamp-1">{match.homeTeam.name}</span>
                    </div>
                    
                    {/* Scoreline */}
                    <div className="flex flex-col items-center px-4">
                      <span className="text-2xl md:text-3xl font-black text-white tracking-widest bg-slate-950/40 px-4 py-2 rounded-xl border border-slate-800">
                        {match.homeScore} : {match.awayScore}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase mt-2 tracking-wider">{t("live")}</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-12 h-8 relative overflow-hidden rounded shadow-md mb-1.5">
                        <img src={getFlagCdnUrl(match.awayTeam.code)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-sm text-white text-center line-clamp-1">{match.awayTeam.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardNewsCarousel() {
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    getNews().then(setNews);
  }, []);

  if (news.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase text-slate-350 tracking-wider">World Cup Spotlights & News</h3>
      <div className="flex space-x-5 overflow-x-auto pb-4 scrollbar-none snap-x">
        {news.map((article, idx) => {
          const borderColors = [
            "hover:border-emerald-500/20",
            "hover:border-amber-500/20",
            "hover:border-blue-500/20",
            "hover:border-purple-500/20",
            "hover:border-rose-500/20"
          ];
          const tagColors = [
            "text-emerald-400 bg-emerald-500/10",
            "text-amber-400 bg-amber-500/10",
            "text-blue-400 bg-blue-500/10",
            "text-purple-400 bg-purple-500/10",
            "text-rose-400 bg-rose-500/10"
          ];
          
          const colorIdx = idx % borderColors.length;
          
          return (
            <div 
              key={idx}
              onClick={() => window.open(article.link, '_blank')}
              className={`flex-none w-80 bg-gradient-to-tr from-[#131b2e] to-[#1e293b]/10 border border-slate-800/80 ${borderColors[colorIdx]} rounded-2xl overflow-hidden snap-start flex flex-col hover:shadow-lg transition duration-300 cursor-pointer group`}
            >
              {article.image_url && (
                <div className="w-full h-32 overflow-hidden bg-slate-900 border-b border-slate-800">
                  <img src={article.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded self-start ${tagColors[colorIdx]}`}>
                    {article.source}
                  </span>
                  <h4 className="font-bold text-sm text-white mt-2 leading-snug">{article.title}</h4>
                  {!article.image_url && (
                     <p className="text-xs text-slate-450 mt-2 line-clamp-3 leading-normal">
                       {article.summary}
                     </p>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between items-center border-t border-slate-850/60 pt-2 mt-4">
                  <span>Read spotlight</span>
                  <span className="font-bold text-slate-400">
                    {new Date(article.published_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
