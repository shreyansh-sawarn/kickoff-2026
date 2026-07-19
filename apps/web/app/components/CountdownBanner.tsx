import React from "react";
import { Trophy, Zap } from "lucide-react";
import { FlagOrShield } from "./FlagOrShield";

interface CountdownBannerProps {
  isTournamentOver: boolean;
  countdown: { days: number; hours: number; minutes: number; seconds: number };
  isNextMatchFinal?: boolean;
  champion?: any;
}

export default function CountdownBanner({ isTournamentOver, countdown, isNextMatchFinal, champion }: CountdownBannerProps) {
  return isTournamentOver ? (
    <div className="mb-8 p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-700/20 blur-3xl rounded-full"></div>
      
      <div className="flex items-center space-x-4 sm:space-x-6 z-10">
        <div className="shrink-0">
          <img src="/wc26-logo-white.svg" alt="FIFA World Cup 2026 Logo" className="w-12 sm:w-16 h-auto drop-shadow-sm" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">FIFA World Cup 2026™</h2>
          <p className="text-sm font-semibold text-amber-100">11 June - 19 July 2026</p>
        </div>
      </div>

      <div className="flex flex-col items-center sm:items-end z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-amber-100 drop-shadow-sm flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5" /> 2026 World Champions
        </span>
        <div className="flex items-center space-x-3 mt-1">
          {champion && (
            <>
              <FlagOrShield code={champion.code} className="w-8 h-6 shrink-0 rounded shadow-sm" imgClassName="object-cover" />
              <span className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider drop-shadow-sm">{champion.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className={`mb-8 p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border ${isNextMatchFinal ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-[#3355ff] border-transparent'}`}>
      {isNextMatchFinal && <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 blur-3xl rounded-full"></div>}
      {isNextMatchFinal && <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-700/20 blur-3xl rounded-full"></div>}
      <div className="flex items-center space-x-4 sm:space-x-6 z-10">
        <div className="shrink-0">
          <img src="/wc26-logo-white.svg" alt="FIFA World Cup 2026 Logo" className="w-12 sm:w-16 h-auto drop-shadow-sm" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">FIFA World Cup 2026™</h2>
          <p className={`text-sm font-semibold ${isNextMatchFinal ? 'text-amber-100' : 'text-blue-100'}`}>11 June - 19 July 2026</p>
        </div>
      </div>

      {/* Ticker values */}
      <div className="flex flex-col items-center z-10">
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isNextMatchFinal ? 'text-amber-100 drop-shadow-sm' : 'text-blue-200/80'}`}>
          {isNextMatchFinal ? "The Final Kicks Off In" : "Next Match In"}
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
              <span className={`text-sm font-semibold lowercase mt-1 ${isNextMatchFinal ? 'text-amber-100' : 'text-blue-100'}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
