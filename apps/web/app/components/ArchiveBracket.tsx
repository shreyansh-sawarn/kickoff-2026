import React, { useState, useEffect, useRef, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Minimize2, Maximize2 } from "lucide-react";
import KnockoutIcon from "./KnockoutIcon";
import { getFlagCdnUrl } from "@wc26/utils";
import { KnockoutMatch } from "./archiveData";

export interface ArchiveBracketProps {
  knockout: { roundName: string; matches: KnockoutMatch[] }[];
}

export function ArchiveBracket({ knockout }: ArchiveBracketProps) {
  const WORLD_W = 2450;
  const WORLD_H = 750;

  const [zoom, setZoom]           = useState(0.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging]     = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const lastSize = useRef({ width: 0, height: 0 });

  const getFitZoom = useCallback(() => {
    if (!viewportRef.current) return 0.5;
    const vw = viewportRef.current.clientWidth;
    if (vw === 0) return 0.5;
    return Math.min(1.0, Math.max(0.15, (vw - 48) / WORLD_W));
  }, []);

  const resetView = useCallback(() => {
    if (!viewportRef.current) return;
    const fitZ = getFitZoom();
    setZoom(fitZ);
    setTimeout(() => {
      if (viewportRef.current) {
        const vw = viewportRef.current.clientWidth;
        const scrollW = WORLD_W * fitZ;
        if (scrollW > vw) {
          viewportRef.current.scrollLeft = (scrollW - vw) / 2;
        } else {
          viewportRef.current.scrollLeft = 0;
        }
        viewportRef.current.scrollTop = 0;
      }
    }, 0);
  }, [getFitZoom]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      if (vw === 0 || vh === 0) return;

      const dw = Math.abs(vw - lastSize.current.width);
      const dh = Math.abs(vh - lastSize.current.height);
      if (dw < 25 && dh < 25 && lastSize.current.width > 0) {
        return;
      }
      
      lastSize.current = { width: vw, height: vh };
      const fitZ = Math.min(1.0, Math.max(0.15, (vw - 48) / WORLD_W));
      setZoom(fitZ);
      
      setTimeout(() => {
        if (el) {
          const scrollW = WORLD_W * fitZ;
          if (scrollW > vw) {
            el.scrollLeft = (scrollW - vw) / 2;
          } else {
            el.scrollLeft = 0;
          }
          el.scrollTop = 0;
        }
      }, 0);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      const rect   = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const prevZ = zoom;
      const nextZ = Math.min(2.5, Math.max(0.12, prevZ * factor));
      if (nextZ === prevZ) return;

      const worldX = (mx + el.scrollLeft) / prevZ;
      const worldY = (my + el.scrollTop) / prevZ;

      setZoom(nextZ);
      
      setTimeout(() => {
        if (el) {
          el.scrollLeft = worldX * nextZ - mx;
          el.scrollTop  = worldY * nextZ - my;
        }
      }, 0);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (!viewportRef.current) return;
    setIsDragging(true);
    dragOrigin.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: viewportRef.current.scrollLeft,
      scrollTop: viewportRef.current.scrollTop
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !viewportRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragOrigin.current.x;
    const dy = e.clientY - dragOrigin.current.y;
    viewportRef.current.scrollLeft = dragOrigin.current.scrollLeft - dx;
    viewportRef.current.scrollTop  = dragOrigin.current.scrollTop - dy;
  };

  const handleMouseUp    = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const zoomBy = (factor: number) => {
    if (!viewportRef.current) return;
    const el = viewportRef.current;
    const cx = el.clientWidth  / 2;
    const cy = el.clientHeight / 2;
    
    const prevZ = zoom;
    const nextZ = Math.min(2.5, Math.max(0.12, prevZ * factor));
    if (nextZ === prevZ) return;

    const worldX = (cx + el.scrollLeft) / prevZ;
    const worldY = (cy + el.scrollTop) / prevZ;

    setZoom(nextZ);
    
    setTimeout(() => {
      if (el) {
        el.scrollLeft = worldX * nextZ - cx;
        el.scrollTop  = worldY * nextZ - cy;
      }
    }, 0);
  };

  const handleDoubleClick = () => resetView();

  const columns = [
    {
      title: "Round of 16",
      key: "r16-left",
      matches: knockout[0]?.matches.slice(0, 4) || [],
    },
    {
      title: "Quarterfinals",
      key: "qf-left",
      matches: knockout[1]?.matches.slice(0, 2) || [],
    },
    {
      title: "Semifinals",
      key: "sf-left",
      matches: knockout[2]?.matches.slice(0, 1) || [],
    },
    {
      title: "Final",
      key: "finals-center",
      matches: knockout[3]?.matches || [],
    },
    {
      title: "Semifinals",
      key: "sf-right",
      matches: knockout[2]?.matches.slice(1, 2) || [],
    },
    {
      title: "Quarterfinals",
      key: "qf-right",
      matches: knockout[1]?.matches.slice(2, 4) || [],
    },
    {
      title: "Round of 16",
      key: "r16-right",
      matches: knockout[0]?.matches.slice(4, 8) || [],
    }
  ];

  const bracketWorld = (
    <div
      style={{
        width: `${WORLD_W * zoom}px`,
        height: `${WORLD_H * zoom}px`,
        overflow: "visible",
        margin: "0 auto",
        position: "relative"
      }}
    >
      <div
        style={{
          width: `${WORLD_W}px`,
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
          transition: isDragging ? "none" : "transform 80ms ease-out",
          willChange: "transform",
        }}
      >
        <div className="flex justify-between items-stretch py-6 px-4 space-x-12" style={{ width: `${WORLD_W}px`, height: `${WORLD_H}px` }}>
          {columns.map((column, colIdx) => {
            const N = column.matches.length;
            return (
              <div key={colIdx} className="flex-1 flex flex-col min-w-[280px]">
                <div className="text-xs font-black uppercase tracking-widest text-slate-300 text-center mb-6 py-2 bg-slate-900/60 border border-slate-800/50 rounded-xl h-10 flex items-center justify-center shrink-0">
                  {column.title}
                </div>
                <div className="relative flex flex-col" style={{ height: "600px" }}>
                  {column.matches.map((item, idx) => {
                    const isHomeWinner     = item.winner === item.homeTeam;
                    const isAwayWinner     = item.winner === item.awayTeam;
                    const isFinalMatch     = colIdx === 3;

                    let cardBorderClass = "border-slate-800/80 hover:border-slate-700/80";
                    let cardBgClass     = "bg-[#131b2e]";
                    if (isFinalMatch) {
                      cardBorderClass = "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-amber-400";
                      cardBgClass     = "bg-[#1c1917]/90";
                    }

                    const lineHighlightClass = "bg-emerald-500/80";
                    const lineHoverClass     = `group-hover:bg-emerald-400/90 ${lineHighlightClass} transition-colors duration-300`;

                    const cardInner = (
                      <div className="flex-1 flex flex-col space-y-1.5 group relative">
                        <div className="px-1 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <span className={isFinalMatch ? "text-amber-400 font-extrabold" : "text-emerald-400"}>
                            Full Time
                          </span>
                        </div>

                        {/* Home team */}
                        <div className={`flex justify-between items-center px-3.5 py-2.5 ${cardBgClass} border ${cardBorderClass} rounded-2xl shadow-sm transition-all duration-300`}>
                          <div className="flex items-center space-x-2.5">
                             <div className="w-6 h-4 relative overflow-hidden rounded-sm shadow-sm shrink-0">
                              <img src={getFlagCdnUrl(item.homeCode)} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className={`text-xs font-semibold ${isHomeWinner ? "text-slate-100 font-extrabold" : "text-slate-400"}`}>{item.homeTeam}</span>
                          </div>
                          <span className={`text-xs font-black ${isHomeWinner ? "text-emerald-400" : "text-slate-500"}`}>{item.homeScore}</span>
                        </div>

                        {/* Left-side connector lines */}
                        {colIdx < 3 && (() => {
                          let vH = 0;
                          const isEven = idx % 2 === 0;
                          if (colIdx === 0) vH = 600 / 8; // 75px
                          else if (colIdx === 1) vH = 600 / 4; // 150px
                          const isSemifinal = colIdx === 2;

                          return (
                            <>
                              <div style={{ right: "-32px", width: isSemifinal ? "64px" : "32px" }} className={`absolute top-1/2 h-[2px] pointer-events-none ${lineHoverClass}`} />
                              {vH > 0 && <div style={{ height: `${vH}px`, top: isEven ? "50%" : "auto", bottom: isEven ? "auto" : "50%", right: "-32px", width: "2px" }} className={`absolute pointer-events-none ${lineHoverClass}`} />}
                              {vH > 0 && isEven && <div style={{ top: `calc(50% + ${vH}px)`, right: "-64px", width: "32px" }} className={`absolute h-[2px] pointer-events-none ${lineHoverClass}`} />}
                            </>
                          );
                        })()}

                        {/* Right-side connector lines */}
                        {colIdx > 3 && (() => {
                          let vH = 0;
                          const isEven = idx % 2 === 0;
                          if (colIdx === 6) vH = 600 / 8; // 75px
                          else if (colIdx === 5) vH = 600 / 4; // 150px
                          const isSemifinal = colIdx === 4;

                          return (
                            <>
                              <div style={{ left: "-32px", width: isSemifinal ? "64px" : "32px" }} className={`absolute top-1/2 h-[2px] pointer-events-none ${lineHoverClass}`} />
                              {vH > 0 && <div style={{ height: `${vH}px`, top: isEven ? "50%" : "auto", bottom: isEven ? "auto" : "50%", left: "-32px", width: "2px" }} className={`absolute pointer-events-none ${lineHoverClass}`} />}
                              {vH > 0 && isEven && <div style={{ top: `calc(50% + ${vH}px)`, left: "-64px", width: "32px" }} className={`absolute h-[2px] pointer-events-none ${lineHoverClass}`} />}
                            </>
                          );
                        })()}

                        {/* Away team */}
                        <div className={`flex justify-between items-center px-3.5 py-2.5 ${cardBgClass} border ${cardBorderClass} rounded-2xl shadow-sm transition-all duration-300`}>
                          <div className="flex items-center space-x-2.5">
                             <div className="w-6 h-4 relative overflow-hidden rounded-sm shadow-sm shrink-0">
                              <img src={getFlagCdnUrl(item.awayCode)} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className={`text-xs font-semibold ${isAwayWinner ? "text-slate-100 font-extrabold" : "text-slate-400"}`}>{item.awayTeam}</span>
                          </div>
                          <span className={`text-xs font-black ${isAwayWinner ? "text-emerald-450" : "text-slate-500"}`}>{item.awayScore}</span>
                        </div>

                        {/* Match details (like Penalties status) */}
                        {item.details && (
                          <div className="mt-1 bg-slate-900/60 border border-slate-800/40 rounded-xl py-1 px-2 text-center text-[9px] font-bold text-slate-400">
                            {item.details}
                          </div>
                        )}
                      </div>
                    );

                    return <div key={idx} className="w-full px-2" style={{ height: `${600 / N}px`, display: 'flex', alignItems: 'center' }}>{cardInner}</div>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const canvas = (
    <div className={`relative bg-[#090d16] border border-slate-800/60 rounded-2xl overflow-hidden ${isFullscreen ? "flex-1" : ""}`} style={{ height: isFullscreen ? undefined : "600px" }}>
      <div
        ref={viewportRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        className={`w-full h-full overflow-auto select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        {bracketWorld}
      </div>

      <div className="absolute right-4 top-4 z-20 flex flex-col space-y-2 pointer-events-auto">
        <button onClick={() => zoomBy(1.2)} className="bg-[#131b2e] border border-slate-800 text-slate-200 rounded-xl p-2.5 hover:bg-slate-800 transition" title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => zoomBy(1 / 1.2)} className="bg-[#131b2e] border border-slate-800 text-slate-200 rounded-xl p-2.5 hover:bg-slate-800 transition" title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={resetView} className="bg-[#131b2e] border border-slate-800 text-slate-200 rounded-xl p-2.5 hover:bg-slate-800 transition" title="Reset View">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute left-4 bottom-4 z-20 text-[10px] font-black text-slate-600 select-none tabular-nums">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );

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
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Historical Bracket</h3>
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
      {canvas}
    </div>
  );
}
