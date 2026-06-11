import React, { useEffect, useState } from "react";
import { getNews } from "@wc26/api";
import { Sparkles, Calendar, BookOpen, ExternalLink } from "lucide-react";

interface NewsTabProps {
  t: (key: string) => string;
}

export default function NewsTab({ t }: NewsTabProps) {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    getNews(24) // Fetch a rich set of 24 articles for the dedicated news page
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center">
            <BookOpen className="w-6 h-6 mr-3 text-emerald-450" />
            {t("news")}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Stay updated with the latest live reporting, tactical highlights, and team announcements.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-900/40 border border-slate-800/40 rounded-3xl p-5 space-y-4">
              <div className="w-full h-36 bg-slate-800 rounded-2xl"></div>
              <div className="h-4 w-1/4 bg-slate-800 rounded"></div>
              <div className="h-6 w-3/4 bg-slate-800 rounded"></div>
              <div className="h-4 w-5/6 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 text-slate-500 font-bold bg-slate-900/10 border border-slate-800/40 rounded-3xl">
          No spotlight articles available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                onClick={() => window.open(article.link, "_blank")}
                className={`bg-gradient-to-tr from-[#131b2e] to-[#1e293b]/10 border border-slate-800/80 ${borderColors[colorIdx]} rounded-3xl overflow-hidden flex flex-col hover:shadow-2xl transition duration-300 cursor-pointer group`}
              >
                {article.image_url ? (
                  <div className="w-full h-44 overflow-hidden bg-slate-900 border-b border-slate-850 relative">
                    <img
                      src={article.image_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                  </div>
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-slate-900 to-slate-950 border-b border-slate-850 flex items-center justify-center p-6 relative">
                    <Sparkles className="w-10 h-10 text-slate-800" />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${tagColors[colorIdx]}`}>
                        {article.source}
                      </span>
                      <div className="flex items-center text-[10px] text-slate-500 space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(article.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-emerald-400 transition duration-300">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest flex items-center justify-between border-t border-slate-850/60 pt-3.5">
                    <span className="flex items-center">
                      Read Spotlight
                      <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
