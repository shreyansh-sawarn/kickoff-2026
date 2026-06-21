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

  const [zoom, setZoom] = useState(0.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);

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
      const rect = el.getBoundingClientRect();
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
          el.scrollTop = worldY * nextZ - my;
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
    viewportRef.current.scrollTop = dragOrigin.current.scrollTop - dy;
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const zoomBy = (factor: number) => {
    if (!viewportRef.current) return;
    const el = viewportRef.current;
    const cx = el.clientWidth / 2;
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
        el.scrollTop = worldY * nextZ - cy;
      }
    }, 0);
  };

  const handleDoubleClick = () => resetView();

  // Helper to reorder matches based on team progression
  const sortedKnockout = (() => {
    if (!knockout || knockout.length === 0) return [];

    const findRound = (names: string[]) => {
      return knockout.find(r => names.some(name => {
        const rNameNorm = r.roundName.toLowerCase().replace(/[^a-z0-9]/g, "");
        const targetNorm = name.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (targetNorm === "final") {
          return rNameNorm === "final" || (rNameNorm.includes("final") && !rNameNorm.includes("quarter") && !rNameNorm.includes("semi"));
        }
        return rNameNorm.includes(targetNorm);
      }));
    };

    const r16Round = findRound(["roundof16", "r16"]);
    const qfRound = findRound(["quarter", "qf"]);
    const sfRound = findRound(["semi", "sf"]);
    const finalRound = findRound(["final"]);

    const r16 = r16Round?.matches || [];
    const qf = qfRound?.matches || [];
    const sf = sfRound?.matches || [];
    const finalAndThird = finalRound?.matches || [];

    let sortedR16 = [...r16];
    let sortedQF = [...qf];
    let sortedSF = [...sf];

    const matchContainsTeam = (match: KnockoutMatch, teamName: string) => {
      const norm = (s: string) => s.toLowerCase().trim();
      return norm(match.homeTeam) === norm(teamName) || norm(match.awayTeam) === norm(teamName);
    };

    const matchContainsWinner = (match: KnockoutMatch, sourceMatches: KnockoutMatch[]) => {
      return sourceMatches.some(src => src.winner && matchContainsTeam(match, src.winner));
    };

    if (r16.length === 8 && qf.length === 4) {
      // QF 0 (Left 0): winner of R16 0 or R16 1 (Netherlands vs Argentina)
      // QF 1 (Left 1): winner of R16 4 or R16 5 (Croatia vs Brazil)
      // QF 2 (Right 0): winner of R16 2 or R16 3 (England vs France)
      // QF 3 (Right 1): winner of R16 6 or R16 7 (Morocco vs Portugal)
      const qf0 = qf.find(m => matchContainsWinner(m, [r16[0], r16[1]]));
      const qf1 = qf.find(m => matchContainsWinner(m, [r16[4], r16[5]]));
      const qf2 = qf.find(m => matchContainsWinner(m, [r16[2], r16[3]]));
      const qf3 = qf.find(m => matchContainsWinner(m, [r16[6], r16[7]]));

      if (qf0 && qf1 && qf2 && qf3) {
        sortedQF = [qf0, qf1, qf2, qf3];
      }
    }

    if (sortedQF.length === 4 && sf.length === 2) {
      // SF 0 (Left): winner of QF 0 or QF 1 (Argentina vs Croatia)
      // SF 1 (Right): winner of QF 2 or QF 3 (France vs Morocco)
      const sf0 = sf.find(m => matchContainsWinner(m, [sortedQF[0], sortedQF[1]]));
      const sf1 = sf.find(m => matchContainsWinner(m, [sortedQF[2], sortedQF[3]]));

      if (sf0 && sf1) {
        sortedSF = [sf0, sf1];
      }
    } else if (r16.length === 0 && qf.length === 4 && sf.length === 2) {
      const sf0 = sf.find(m => matchContainsWinner(m, [qf[0], qf[1]]));
      const sf1 = sf.find(m => matchContainsWinner(m, [qf[2], qf[3]]));
      if (sf0 && sf1) {
        sortedSF = [sf0, sf1];
      }
    }

    return [
      { roundName: r16Round?.roundName || "Round of 16", matches: sortedR16 },
      { roundName: qfRound?.roundName || "Quarter-finals", matches: sortedQF },
      { roundName: sfRound?.roundName || "Semi-finals", matches: sortedSF },
      { roundName: finalRound?.roundName || "Final", matches: finalAndThird }
    ];
  })();

  const r16Matches = sortedKnockout[0]?.matches || [];
  const qfMatches = sortedKnockout[1]?.matches || [];
  const sfMatches = sortedKnockout[2]?.matches || [];
  const finalMatches = sortedKnockout[3]?.matches || [];

  const leftR16 = r16Matches.length === 8
    ? [r16Matches[0], r16Matches[1], r16Matches[4], r16Matches[5]]
    : r16Matches.slice(0, 4);

  const rightR16 = r16Matches.length === 8
    ? [r16Matches[2], r16Matches[3], r16Matches[6], r16Matches[7]]
    : r16Matches.slice(4, 8);

  const columns = [
    {
      title: "Round of 16",
      key: "r16-left",
      matches: leftR16,
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
      title: "Final",
      key: "finals-center",
      matches: finalMatches,
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
      matches: rightR16,
    }
  ];

  // ── Team path tracing for hover highlighting ──────────────────────
  const teamPath = (() => {
    if (!hoveredTeam) return null;
    const pathMap = new Map<string, 'won' | 'lost' | 'upcoming'>();
    columns.forEach((column, colIdx) => {
      column.matches.forEach((match: any, matchIdx: number) => {
        const isInMatch = match.homeTeam === hoveredTeam || match.awayTeam === hoveredTeam;
        if (!isInMatch) return;
        if (match.winner === hoveredTeam) {
          pathMap.set(`${colIdx}-${matchIdx}`, 'won');
        } else if (match.winner && match.winner !== hoveredTeam) {
          pathMap.set(`${colIdx}-${matchIdx}`, 'lost');
        } else {
          pathMap.set(`${colIdx}-${matchIdx}`, 'upcoming');
        }
      });
    });
    return pathMap;
  })();

  const isConnectorInPath = (colIdx: number, matchIdx: number) => {
    if (!teamPath) return false;
    return teamPath.get(`${colIdx}-${matchIdx}`) === 'won';
  };

  const isFarConnectorInPath = (colIdx: number, evenIdx: number) => {
    if (!teamPath) return false;
    return teamPath.get(`${colIdx}-${evenIdx}`) === 'won' ||
      teamPath.get(`${colIdx}-${evenIdx + 1}`) === 'won';
  };

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
            if (N === 0) {
              return (
                <div key={colIdx} className="flex-1 flex flex-col min-w-[280px] opacity-10">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500 text-center mb-6 py-2 bg-slate-900/30 border border-slate-800/30 rounded-xl h-10 flex items-center justify-center shrink-0">
                    {column.title}
                  </div>
                  <div className="relative flex flex-col justify-center items-center h-[600px] text-[10px] font-bold text-slate-600">
                    Not Played
                  </div>
                </div>
              );
            }

            return (
              <div key={colIdx} className="flex-1 flex flex-col min-w-[280px]">
                <div className="text-xs font-black uppercase tracking-widest text-slate-300 text-center mb-6 py-2 bg-slate-900/60 border border-slate-800/50 rounded-xl h-10 flex items-center justify-center shrink-0">
                  {column.title}
                </div>
                <div className="relative flex flex-col" style={{ height: "600px" }}>
                  {column.matches.map((item, idx) => {
                    const isHomeWinner = item.winner === item.homeTeam;
                    const isAwayWinner = item.winner === item.awayTeam;
                    const isFinalMatch = colIdx === 3;

                    let cardBorderClass = "border-slate-800/80 hover:border-slate-700/80";
                    let cardBgClass = "bg-[#131b2e]";
                    if (isFinalMatch) {
                      cardBorderClass = "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:border-amber-400";
                      cardBgClass = "bg-[#1c1917]/90";
                    }

                    const lineHighlightClass = "bg-slate-700/60";
                    const lineHoverClass = `group-hover:bg-emerald-400/90 ${lineHighlightClass} transition-colors duration-300`;

                    // Calculate connector line vertical height for this column
                    const getVH = () => {
                      if (colIdx === 2 || colIdx === 4) return 600 / 4;
                      return 600 / (N * 2);
                    };
                    const vH = getVH();
                    const isEven = idx % 2 === 0;

                    const hasDetails = !!item.details;
                    // Offset to align connectors with the visual center of the match card
                    const connectorOffset = 10;

                    // ── Path highlighting logic ──────────────────────
                    const matchKey = `${colIdx}-${idx}`;
                    const pathStatus = teamPath?.get(matchKey);
                    const isInPath = !!pathStatus;
                    const isPathWon = pathStatus === 'won';
                    const isPathLost = pathStatus === 'lost';
                    const isDimmed = !!hoveredTeam && !isInPath;

                    // Override card styling for path highlighting
                    if (isPathWon) {
                      cardBorderClass = "border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.3)]";
                      cardBgClass = "bg-[#0d1f1a]";
                    } else if (isPathLost) {
                      cardBorderClass = "border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.3)]";
                      cardBgClass = "bg-[#1f0f0f]";
                    }

                    // Connector class for outgoing horizontal + vertical from this match
                    const pathGlow = "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
                    const pathDim = "bg-slate-800/20";
                    const myConnectorClass = isConnectorInPath(colIdx, idx)
                      ? pathGlow
                      : (hoveredTeam ? pathDim : lineHoverClass);
                    const farConnectorClass = (isEven && isFarConnectorInPath(colIdx, idx))
                      ? pathGlow
                      : (hoveredTeam ? pathDim : lineHoverClass);
                    const sfConnectorClass = isConnectorInPath(colIdx, idx)
                      ? pathGlow
                      : (hoveredTeam ? pathDim : lineHoverClass);

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
                            <span
                              className={`text-xs font-semibold ${isHomeWinner ? "text-slate-100 font-extrabold" : "text-slate-400"} cursor-pointer hover:text-emerald-400 transition-colors duration-200`}
                              onMouseEnter={() => setHoveredTeam(item.homeTeam)}
                              onMouseLeave={() => setHoveredTeam(null)}
                            >
                              {item.homeTeam}
                            </span>
                          </div>
                          <span className={`text-xs font-black ${isHomeWinner ? "text-emerald-400" : "text-slate-500"}`}>{item.homeScore}</span>
                        </div>

                        {/* Away team */}
                        <div className={`flex justify-between items-center px-3.5 py-2.5 ${cardBgClass} border ${cardBorderClass} rounded-2xl shadow-sm transition-all duration-300`}>
                          <div className="flex items-center space-x-2.5">
                            <div className="w-6 h-4 relative overflow-hidden rounded-sm shadow-sm shrink-0">
                              <img src={getFlagCdnUrl(item.awayCode)} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span
                              className={`text-xs font-semibold ${isAwayWinner ? "text-slate-100 font-extrabold" : "text-slate-400"} cursor-pointer hover:text-emerald-400 transition-colors duration-200`}
                              onMouseEnter={() => setHoveredTeam(item.awayTeam)}
                              onMouseLeave={() => setHoveredTeam(null)}
                            >
                              {item.awayTeam}
                            </span>
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

                    if (colIdx < 3) return (
                      <div key={idx} className={`relative w-full transition-opacity duration-300 ${isDimmed ? "opacity-25" : "opacity-100"}`} style={{ height: `${600 / N}px`, flexShrink: 0 }}>
                        <div style={{ position: "absolute", top: 0, bottom: 0, left: "40px", right: 0, display: "flex", alignItems: "center", transform: `translateY(${hasDetails ? '17px' : '4px'})` }}>
                          {cardInner}
                        </div>
                        {colIdx === 2 ? (
                          <>
                            <div style={{ right: "-24px", width: "24px", top: `calc(50% + ${connectorOffset}px)` }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${sfConnectorClass}`} />
                            <div style={{ height: `${vH}px`, bottom: `calc(50% - ${connectorOffset}px)`, right: "-24px", width: "2px" }} className={`absolute pointer-events-none transition-all duration-300 ${sfConnectorClass}`} />
                            <div style={{ top: `calc(50% + ${connectorOffset}px - ${vH}px)`, right: "-56px", width: "32px" }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${sfConnectorClass}`} />
                          </>
                        ) : (
                          <>
                            <div style={{ right: "-44px", width: "44px", top: `calc(50% + ${connectorOffset}px)` }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${myConnectorClass}`} />
                            {vH > 0 && <div style={{ height: `${vH}px`, top: isEven ? `calc(50% + ${connectorOffset}px)` : "auto", bottom: isEven ? "auto" : `calc(50% - ${connectorOffset}px)`, right: "-44px", width: "2px" }} className={`absolute pointer-events-none transition-all duration-300 ${myConnectorClass}`} />}
                            {vH > 0 && isEven && <div style={{ top: `calc(50% + ${connectorOffset}px + ${vH}px)`, right: "-88px", width: "44px" }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${farConnectorClass}`} />}
                          </>
                        )}
                      </div>
                    );

                    if (colIdx > 3) return (
                      <div key={idx} className={`relative w-full transition-opacity duration-300 ${isDimmed ? "opacity-25" : "opacity-100"}`} style={{ height: `${600 / N}px`, flexShrink: 0 }}>
                        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: "40px", display: "flex", alignItems: "center", transform: `translateY(${hasDetails ? '17px' : '4px'})` }}>
                          {cardInner}
                        </div>
                        {colIdx === 4 ? (
                          <>
                            <div style={{ left: "-24px", width: "24px", top: `calc(50% + ${connectorOffset}px)` }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${sfConnectorClass}`} />
                            <div style={{ height: `${vH}px`, bottom: `calc(50% - ${connectorOffset}px)`, left: "-24px", width: "2px" }} className={`absolute pointer-events-none transition-all duration-300 ${sfConnectorClass}`} />
                            <div style={{ top: `calc(50% + ${connectorOffset}px - ${vH}px)`, left: "-56px", width: "32px" }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${sfConnectorClass}`} />
                          </>
                        ) : (
                          <>
                            <div style={{ left: "-44px", width: "44px", top: `calc(50% + ${connectorOffset}px)` }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${myConnectorClass}`} />
                            {vH > 0 && <div style={{ height: `${vH}px`, top: isEven ? `calc(50% + ${connectorOffset}px)` : "auto", bottom: isEven ? "auto" : `calc(50% - ${connectorOffset}px)`, left: "-44px", width: "2px" }} className={`absolute pointer-events-none transition-all duration-300 ${myConnectorClass}`} />}
                            {vH > 0 && isEven && <div style={{ left: "-88px", width: "44px", top: `calc(50% + ${connectorOffset}px + ${vH}px)` }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${farConnectorClass}`} />}
                          </>
                        )}
                      </div>
                    );

                    return (
                      <div key={idx} className={`w-full px-2 transition-opacity duration-300 ${isDimmed ? "opacity-25" : "opacity-100"}`} style={{ height: `${600 / N}px`, flexShrink: 0, display: "flex", alignItems: "center" }}>
                        <div style={{ width: "100%", transform: `translateY(${hasDetails ? '17px' : '4px'})` }}>
                          {cardInner}
                        </div>
                      </div>
                    );
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
