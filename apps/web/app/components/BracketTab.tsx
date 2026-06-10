import React, { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import KnockoutIcon from "./KnockoutIcon";
import { BracketCanvas } from "./BracketCanvas";

import { Match } from "@wc26/types";

interface BracketTabProps {
  t: (key: string) => string;
  router: { push: (url: string) => void };
  matches: Match[];
}

export function BracketTab({ t, router, matches }: BracketTabProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-[#0b0f19] flex flex-col p-6 overflow-hidden animate-in fade-in duration-200"
          : "flex flex-col space-y-4"
      }
      style={isFullscreen ? { height: "100dvh" } : undefined}
    >
      <div className="flex items-center justify-between border-b border-slate-800/40 pb-4 shrink-0">
        <div className="flex items-center space-x-3">
          <KnockoutIcon className="w-5 h-5 text-emerald-400 overflow-visible" strokeWidth={1.8} />
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">{t("knockout")}</h3>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500 hidden sm:block">Scroll to zoom · Drag to pan · Double-click to reset</span>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 flex items-center justify-center hover:bg-slate-800 transition text-slate-200"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className={`relative bg-[#090d16] border border-slate-800/60 rounded-2xl overflow-hidden ${isFullscreen ? "flex-1" : ""}`} style={{ height: isFullscreen ? undefined : "640px" }}>
        <BracketCanvas router={router} matches={matches} />
      </div>
    </div>
  );
}
