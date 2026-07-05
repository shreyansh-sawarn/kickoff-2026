import React, { useState, useRef } from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
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
  const [zoom, setZoom] = useState(0.4);
  const canvasRef = useRef<any>(null);

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
          <span className="text-xs text-slate-500 hidden md:block">Scroll to zoom · Drag to pan · Double-click to reset</span>
          
          <div className="flex items-center bg-[#131b2e] border border-slate-800 rounded-xl p-1 space-x-1">
            <button
              onClick={() => canvasRef.current?.zoomOut()}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-300 min-w-[36px] text-center select-none tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => canvasRef.current?.zoomIn()}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-800 mx-1" />
            <button
              onClick={() => canvasRef.current?.resetView()}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

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
        <BracketCanvas ref={canvasRef} router={router} matches={matches} onZoomChange={setZoom} />
      </div>
    </div>
  );
}
