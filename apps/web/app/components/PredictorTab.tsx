import React from "react";
import { Sparkles } from "lucide-react";
import { Match } from "@wc26/types";
import { getCountryFlag, getFlagCdnUrl } from "@wc26/utils";
import { FlagOrShield } from "./FlagOrShield";

interface PredictorTabProps {
  upcomingMatches: Match[];
  predictions: Record<string, { home: number; away: number }>;
  calculatePoints: () => number;
  savePrediction: (matchId: string, team: "home" | "away", val: string) => void;
  t: (key: string) => string;
}

export default function PredictorTab({
  upcomingMatches,
  predictions,
  calculatePoints,
  savePrediction,
  t
}: PredictorTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-emerald-455" /> {t("predictor")}
          </h3>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">{t("points")}</span>
          <span className="font-black text-emerald-455 text-xl">{calculatePoints()} {t("pts")}</span>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {upcomingMatches.map((match) => {
          const pred = predictions[match.id] || { home: 0, away: 0 };
          return (
            <div key={match.id} className="bg-[#131b2e] border border-slate-850 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 flex-1">
                <FlagOrShield code={match.homeTeam.code} className="w-8 h-5 shrink-0" imgClassName="object-cover" />
                <span className="font-bold text-sm text-slate-200 w-28 line-clamp-1">{match.homeTeam.name}</span>
              </div>

              {/* Input Row */}
              <div className="flex items-center space-x-3">
                <input 
                  type="number"
                  min="0"
                  value={pred.home}
                  onChange={(e) => savePrediction(match.id, "home", e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-center font-black text-white text-lg rounded-xl w-14 py-2"
                />
                <span className="text-slate-500 font-black">:</span>
                <input 
                  type="number"
                  min="0"
                  value={pred.away}
                  onChange={(e) => savePrediction(match.id, "away", e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-center font-black text-white text-lg rounded-xl w-14 py-2"
                />
              </div>

              <div className="flex items-center space-x-3 flex-1 justify-end text-right">
                <span className="font-bold text-sm text-slate-200 w-28 line-clamp-1">{match.awayTeam.name}</span>
                <FlagOrShield code={match.awayTeam.code} className="w-8 h-5 shrink-0" imgClassName="object-cover" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
