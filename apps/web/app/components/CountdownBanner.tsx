import React from "react";
import { Trophy, Zap } from "lucide-react";

interface CountdownBannerProps {
  isTournamentOver: boolean;
  countdown: { days: number; hours: number; minutes: number; seconds: number };
}

export default function CountdownBanner({ isTournamentOver, countdown }: CountdownBannerProps) {
  return isTournamentOver ? (
    <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#131b2e] to-slate-900 border border-slate-800/60 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full"></div>
      
      <div className="flex items-center space-x-4 z-10">
        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 hidden sm:block">
          <Trophy className="w-6 h-6 animate-bounce" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">United 2026 Tournament Concluded</h2>
          <p className="text-xs text-slate-400">The historical tournament runs June 11 – July 19, 2026. Standings & Bracket results are permanently saved.</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 bg-slate-950/80 border border-slate-800/60 px-4 py-2.5 rounded-xl z-10">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">🏆 2026 CHAMPION</span>
        <span className="text-sm font-black text-amber-400 uppercase tracking-wider">Argentina</span>
      </div>
    </div>
  ) : (
    <div className="mb-8 p-6 rounded-2xl bg-[#3355ff] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
      <div className="flex items-center space-x-6 z-10">
        <div className="hidden sm:block">
          <img src="/wc26-logo-white.svg" alt="FIFA World Cup 2026 Logo" className="w-16 h-auto drop-shadow-sm" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">FIFA World Cup 2026™</h2>
          <p className="text-sm text-blue-100 font-semibold">11 June - 19 July 2026</p>
        </div>
      </div>

      {/* Ticker values */}
      <div className="flex flex-col items-center z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/80 mb-3">
          Next Match In
        </span>
        <div className="flex space-x-6 sm:space-x-8">
          {[
            { value: countdown.days, label: "days" },
            { value: countdown.hours, label: "hours" },
            { value: countdown.minutes, label: "mins" },
            { value: countdown.seconds, label: "secs" },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-white">
              <div className="text-3xl md:text-4xl font-bold tracking-tight leading-none shadow-sm drop-shadow-sm">
                {String(item.value).padStart(2, "0")}
              </div>
              <span className="text-sm font-semibold lowercase mt-1 text-blue-100">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
