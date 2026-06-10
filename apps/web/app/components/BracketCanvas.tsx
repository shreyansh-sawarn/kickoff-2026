import React, { useState, useEffect, useRef, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { getFlagCdnUrl } from "@wc26/utils";
import { Match } from "@wc26/types";

interface BracketCanvasProps {
  router: { push: (url: string) => void };
  matches?: Match[];
}

export function BracketCanvas({ router, matches = [] }: BracketCanvasProps) {
  const WORLD_W = 3150;
  const WORLD_H = 1300;

  const [zoom, setZoom]           = useState(0.4);
  const [isDragging, setIsDragging]     = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const lastSize = useRef({ width: 0, height: 0 });

  const getFitZoom = useCallback(() => {
    if (!viewportRef.current) return 0.4;
    const vw = viewportRef.current.clientWidth;
    if (vw === 0) return 0.4;
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

  const r32 = matches.filter(m => m.group === "r32");
  const r16 = matches.filter(m => m.group === "r16");
  const qf = matches.filter(m => m.group === "qf");
  const sf = matches.filter(m => m.group === "sf");
  const finals = matches.filter(m => m.group === "final" || m.group === "3rd");

  const buildMatches = (sourceMatches: Match[]) => {
    return sourceMatches.map((m) => {
      // Fix name display for "W. Group A", remove prefix if possible, or just use as is
      const homeName = m.homeTeam.code === "UNK" && m.homeTeam.name ? m.homeTeam.name : m.homeTeam.code;
      const awayName = m.awayTeam.code === "UNK" && m.awayTeam.name ? m.awayTeam.name : m.awayTeam.code;

      let dateStr = "TBD";
      let timeStr = "TBD";
      if (m.kickoffTime) {
        try {
          const d = new Date(m.kickoffTime);
          dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
        } catch(e) {}
      }

      return {
        id: m.id,
        date: dateStr,
        time: timeStr,
        status: m.status,
        home: homeName,
        homeFlag: m.homeTeam.flag || "🏳️",
        away: awayName,
        awayFlag: m.awayTeam.flag || "🏳️",
        score: m.homeScore !== null && m.awayScore !== null ? `${m.homeScore} - ${m.awayScore}` : null,
        winner: m.homeScore !== null && m.awayScore !== null ? (m.homeScore > m.awayScore ? homeName : (m.awayScore > m.homeScore ? awayName : undefined)) : undefined,
        isFinal: m.group === "final",
        isThirdPlace: m.group === "3rd"
      };
    });
  };

  const pad = (arr: any[], length: number) => {
    const padded = [...arr];
    while (padded.length < length) {
      padded.push({
        id: `pad-${padded.length}`,
        date: "TBD",
        time: "TBD",
        status: "upcoming",
        home: "TBD",
        homeFlag: "🏳️",
        away: "TBD",
        awayFlag: "🏳️",
        score: null,
      });
    }
    return padded;
  };

  const r32Matches = pad(buildMatches(r32), 16);
  const r16Matches = pad(buildMatches(r16), 8);
  const qfMatches = pad(buildMatches(qf), 4);
  const sfMatches = pad(buildMatches(sf), 2);
  const finalMatches = pad(buildMatches(finals), 2);

  const columns = [
    {
      title: "Round of 32",
      key: "r32-left",
      matches: r32Matches.slice(0, 8),
    },
    {
      title: "Round of 16",
      key: "r16-left",
      matches: r16Matches.slice(0, 4),
    },
    {
      title: "Quarterfinals",
      key: "qf-left",
      matches: qfMatches.slice(0, 2),
    },
    {
      title: "Semifinals",
      key: "sf-left",
      matches: sfMatches.slice(0, 1),
    },
    {
      title: "Finals",
      key: "finals-center",
      matches: [
        { ...finalMatches[0], label: "Championship Match", isFinal: true },
        { ...finalMatches[1], label: "Third Place Play-off", isThirdPlace: true }
      ]
    },
    {
      title: "Semifinals",
      key: "sf-right",
      matches: sfMatches.slice(1, 2),
    },
    {
      title: "Quarterfinals",
      key: "qf-right",
      matches: qfMatches.slice(2, 4),
    },
    {
      title: "Round of 16",
      key: "r16-right",
      matches: r16Matches.slice(4, 8),
    },
    {
      title: "Round of 32",
      key: "r32-right",
      matches: r32Matches.slice(8, 16),
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
        <div className="flex justify-between items-stretch py-6 px-4 space-x-12" style={{ width: `${WORLD_W}px` }}>
          {columns.map((column, colIdx) => (
            <div key={colIdx} className="flex-1 flex flex-col justify-around min-w-[280px]">
              <div className="text-xs font-black uppercase tracking-widest text-slate-300 text-center mb-6 py-2 bg-slate-900/60 border border-slate-800/50 rounded-xl">
                {column.title}
              </div>
              <div className="flex-1 flex flex-col justify-around space-y-6 py-4">
                {column.matches.map((item, idx) => {
                  const isHomeWinner     = item.winner === item.home;
                  const isAwayWinner     = item.winner === item.away;
                  const isFinalMatch     = "isFinal"      in item && item.isFinal;
                  const isThirdPlaceMatch = "isThirdPlace" in item && item.isThirdPlace;

                  let cardBorderClass = "border-slate-800/80 hover:border-slate-700/80";
                  let cardBgClass     = "bg-[#131b2e]";
                  if (isFinalMatch) {
                    cardBorderClass = "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-amber-400";
                    cardBgClass     = "bg-[#1c1917]/90";
                  } else if (isThirdPlaceMatch) {
                    cardBorderClass = "border-cyan-800/50 hover:border-cyan-700";
                    cardBgClass     = "bg-[#0f172a]/90";
                  }

                  let matchLabel = "";
                  if      (colIdx === 0) matchLabel = `M${73 + idx}`;
                  else if (colIdx === 1) matchLabel = `M${89 + idx}`;
                  else if (colIdx === 2) matchLabel = `M${97 + idx}`;
                  else if (colIdx === 3) matchLabel = "M101";
                  else if (colIdx === 4) matchLabel = isFinalMatch ? "M104" : "M103";
                  else if (colIdx === 5) matchLabel = "M102";
                  else if (colIdx === 6) matchLabel = `M${99 + idx}`;
                  else if (colIdx === 7) matchLabel = `M${93 + idx}`;
                  else if (colIdx === 8) matchLabel = `M${81 + idx}`;

                  const matchStatus        = item.score ? "Full time" : "Upcoming";
                  const hasWinner          = !!item.winner;
                  const lineHighlightClass = hasWinner ? "bg-emerald-500/80" : "bg-slate-700/60";
                  const lineHoverClass     = `group-hover:bg-emerald-400/90 ${lineHighlightClass} transition-colors duration-300`;

                  const cardInner = (
                    <div
                      onClick={() => item.matchId && router.push(`/matches/${item.matchId}`)}
                      className="flex-1 flex flex-col space-y-1.5 cursor-pointer group relative"
                    >
                      <div className="px-1 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span className={isFinalMatch ? "text-amber-400 font-extrabold" : isThirdPlaceMatch ? "text-cyan-400 font-extrabold" : "text-emerald-400"}>
                          {matchStatus}
                        </span>
                        <span>{item.date} • {item.time}</span>
                      </div>

                      {/* Home team */}
                      <div className={`flex justify-between items-center px-3.5 py-2.5 ${cardBgClass} border ${cardBorderClass} rounded-2xl shadow-sm transition-all duration-300`}>
                        <div className="flex items-center space-x-2.5">
                          <span className="w-5 h-5 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-center text-[9px] font-black text-slate-400">{item.homeSeed || ""}</span>
                          <div className="w-6 h-4 relative overflow-hidden rounded-sm shadow-sm shrink-0 flex items-center justify-center text-xs">
                            {item.homeFlag && item.homeFlag !== "🏳️" ? (
                              <img src={getFlagCdnUrl(item.home)} onError={(e) => { e.currentTarget.style.display = 'none' }} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="opacity-50">🏳️</span>
                            )}
                          </div>
                          <span className={`font-bold uppercase tracking-widest text-[13px] ${isHomeWinner ? "text-white" : "text-slate-300"}`}>
                            {item.home}
                          </span>
                        </div>
                        {item.score && (
                          <div className={`text-[13px] font-black ${isHomeWinner ? "text-emerald-400" : "text-slate-500"}`}>
                            {item.score.split(" - ")[0]}
                          </div>
                        )}
                      </div>

                      {/* Left-side connector lines */}
                      {colIdx < 4 && (() => {
                        let vH = 0;
                        if (colIdx === 0 || colIdx === 8) vH = 84;
                        else if (colIdx === 1 || colIdx === 7) vH = 176;
                        else if (colIdx === 2 || colIdx === 6) vH = 356;
                        return (
                          <>
                            <div className={`absolute right-[-16px] top-1/2 w-[16px] h-[2px] pointer-events-none ${colIdx === 3 ? "right-[-32px] w-[32px]" : ""} ${lineHoverClass}`} />
                            {vH > 0 && <div style={{ height: `${vH}px`, top: idx % 2 === 0 ? "50%" : "auto", bottom: idx % 2 === 1 ? "50%" : "auto" }} className={`absolute right-[-16px] w-[2px] pointer-events-none ${lineHoverClass}`} />}
                            {vH > 0 && idx % 2 === 0 && <div style={{ top: `calc(50% + ${vH}px)` }} className={`absolute right-[-32px] w-[16px] h-[2px] pointer-events-none ${lineHoverClass}`} />}
                          </>
                        );
                      })()}

                      {/* Right-side connector lines */}
                      {colIdx > 4 && (() => {
                        let vH = 0;
                        if (colIdx === 0 || colIdx === 8) vH = 84;
                        else if (colIdx === 1 || colIdx === 7) vH = 176;
                        else if (colIdx === 2 || colIdx === 6) vH = 356;
                        return (
                          <>
                            <div className={`absolute left-[-16px] top-1/2 w-[16px] h-[2px] pointer-events-none ${colIdx === 5 ? "left-[-32px] w-[32px]" : ""} ${lineHoverClass}`} />
                            {vH > 0 && <div style={{ height: `${vH}px`, top: idx % 2 === 0 ? "50%" : "auto", bottom: idx % 2 === 1 ? "50%" : "auto" }} className={`absolute left-[-16px] w-[2px] pointer-events-none ${lineHoverClass}`} />}
                            {vH > 0 && idx % 2 === 0 && <div style={{ top: `calc(50% + ${vH}px)` }} className={`absolute left-[-32px] w-[16px] h-[2px] pointer-events-none ${lineHoverClass}`} />}
                          </>
                        );
                      })()}

                      {/* Away team */}
                      <div className={`flex justify-between items-center px-3.5 py-2.5 ${cardBgClass} border ${cardBorderClass} rounded-2xl shadow-sm transition-all duration-300`}>
                        <div className="flex items-center space-x-2.5">
                          <span className="w-5 h-5 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-center text-[9px] font-black text-slate-400">{item.awaySeed || ""}</span>
                          <div className="w-6 h-4 relative overflow-hidden rounded-sm shadow-sm shrink-0 flex items-center justify-center text-xs">
                            {item.awayFlag && item.awayFlag !== "🏳️" ? (
                              <img src={getFlagCdnUrl(item.away)} onError={(e) => { e.currentTarget.style.display = 'none' }} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="opacity-50">🏳️</span>
                            )}
                          </div>
                          <span className={`font-bold uppercase tracking-widest text-[13px] ${isAwayWinner ? "text-white" : "text-slate-300"}`}>
                            {item.away}
                          </span>
                        </div>
                        {item.score && (
                          <div className={`text-[13px] font-black ${isAwayWinner ? "text-emerald-400" : "text-slate-500"}`}>
                            {item.score.split(" - ")[1]}
                          </div>
                        )}
                      </div>

                      {/* Champion banner */}
                      {isFinalMatch && item.winner && (
                        <div className="mt-1 bg-amber-500/10 border border-amber-500/20 rounded-xl py-1.5 px-2 text-center text-[10px] font-bold text-amber-400">
                          🎉 Congratulations {item.winner === "BRA" ? "Brazil" : item.winner}!
                        </div>
                      )}

                      {/* Center column match ID */}
                      {colIdx === 4 && <div className="pt-1 text-center"><span className="text-[9px] font-black text-rose-500 tracking-wider">{matchLabel}</span></div>}
                    </div>
                  );

                  if (colIdx < 4) return (
                    <div key={idx} className="flex items-center space-x-2 w-full">
                      <span className="text-[10px] font-black text-rose-500 w-8 text-right tracking-wider select-none">{matchLabel}</span>
                      {cardInner}
                    </div>
                  );
                  if (colIdx > 4) return (
                    <div key={idx} className="flex items-center space-x-2 w-full">
                      {cardInner}
                      <span className="text-[10px] font-black text-rose-500 w-8 text-left tracking-wider select-none">{matchLabel}</span>
                    </div>
                  );
                  return <div key={idx} className="w-full px-2">{cardInner}</div>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
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
}
