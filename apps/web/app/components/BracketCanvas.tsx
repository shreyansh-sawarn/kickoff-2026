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
  const [hoveredTeam, setHoveredTeam]   = useState<string | null>(null);

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
      if (m.datetime) {
        try {
          const d = new Date(m.datetime);
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
        score: m.homeScore !== undefined && m.homeScore !== null && m.awayScore !== undefined && m.awayScore !== null ? `${m.homeScore} - ${m.awayScore}` : null,
        homePenaltyScore: m.homePenaltyScore,
        awayPenaltyScore: m.awayPenaltyScore,
        winner: (() => {
          if (m.homeScore === undefined || m.homeScore === null || m.awayScore === undefined || m.awayScore === null) return undefined;
          if (m.homeScore > m.awayScore) return homeName;
          if (m.awayScore > m.homeScore) return awayName;
          // Tied after extra time — check penalty shootout
          if (m.homePenaltyScore !== undefined && m.awayPenaltyScore !== undefined) {
            if (m.homePenaltyScore > m.awayPenaltyScore) return homeName;
            if (m.awayPenaltyScore > m.homePenaltyScore) return awayName;
          }
          return undefined;
        })(),
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
        { ...finalMatches[0], label: "Championship Match", isFinal: true, isThirdPlace: false },
        { ...finalMatches[1], label: "Third Place Play-off", isThirdPlace: true, isFinal: false }
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

  // ── Team path tracing for hover highlighting ──────────────────────
  const teamPath = (() => {
    if (!hoveredTeam) return null;
    const pathMap = new Map<string, 'won' | 'lost' | 'upcoming'>();
    columns.forEach((column, colIdx) => {
      column.matches.forEach((match: any, matchIdx: number) => {
        const isInMatch = match.home === hoveredTeam || match.away === hoveredTeam;
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

  // Does the hovered team win this match (outgoing connector should glow)?
  const isConnectorInPath = (colIdx: number, matchIdx: number) => {
    if (!teamPath) return false;
    return teamPath.get(`${colIdx}-${matchIdx}`) === 'won';
  };

  // Does the hovered team progress through this pair's far connector?
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
            return (
              <div key={colIdx} className="flex-1 flex flex-col min-w-[280px]">
                <div className="text-xs font-black uppercase tracking-widest text-slate-300 text-center mb-6 py-2 bg-slate-900/60 border border-slate-800/50 rounded-xl h-10 flex items-center justify-center shrink-0">
                  {column.title}
                </div>
                <div className="relative flex flex-col" style={{ height: "1120px" }}>
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
                    else if (colIdx === 4) matchLabel = idx === 0 ? "M104" : "M103";
                    else if (colIdx === 5) matchLabel = "M102";
                    else if (colIdx === 6) matchLabel = `M${99 + idx}`;
                    else if (colIdx === 7) matchLabel = `M${93 + idx}`;
                    else if (colIdx === 8) matchLabel = `M${81 + idx}`;

                    const matchStatus        = item.score ? "Full time" : "Upcoming";
                    const hasWinner          = !!item.winner;
                    const lineHighlightClass = hasWinner ? "bg-emerald-500/80" : "bg-slate-700/60";
                    const lineHoverClass     = `group-hover:bg-emerald-400/90 ${lineHighlightClass} transition-colors duration-300`;

                    // Calculate connector line vertical height for this column
                    const getVH = () => {
                      if (colIdx === 3 || colIdx === 5) return 1120 / 4;
                      return 1120 / (N * 2);
                    };
                    const vH = getVH();
                    const isEven = idx % 2 === 0;

                    // Offset to align connectors/labels with the visual center of the
                    // match card (midpoint between the two team rows) instead of the
                    // geometric center which includes the status header.
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
                    const pathDim  = "bg-slate-800/20";
                    const myConnectorClass = isConnectorInPath(colIdx, idx)
                      ? pathGlow
                      : (hoveredTeam ? pathDim : lineHoverClass);
                    // Far horizontal connector (even matches, connects pair → next round)
                    const farConnectorClass = (isEven && isFarConnectorInPath(colIdx, idx))
                      ? pathGlow
                      : (hoveredTeam ? pathDim : lineHoverClass);
                    // SF connector class (all three parts are one path segment)
                    const sfConnectorClass = isConnectorInPath(colIdx, idx)
                      ? pathGlow
                      : (hoveredTeam ? pathDim : lineHoverClass);

                    const cardInner = (
                      <div
                        onClick={() => item.matchId && router.push(`/matches/${item.matchId}`)}
                        className="flex-1 flex flex-col cursor-pointer group"
                      >
                        <div className="px-1 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">
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
                            <span
                              className={`font-bold uppercase tracking-widest text-[13px] ${isHomeWinner ? "text-white" : "text-slate-300"} ${item.home !== "TBD" ? "cursor-pointer hover:text-emerald-400 transition-colors duration-200" : ""}`}
                              onMouseEnter={() => item.home !== "TBD" && setHoveredTeam(item.home)}
                              onMouseLeave={() => setHoveredTeam(null)}
                            >
                              {item.home}
                            </span>
                          </div>
                          {item.score && (
                            <div className={`text-[13px] font-black ${isHomeWinner ? "text-emerald-400" : "text-slate-500"}`}>
                              {item.score.split(" - ")[0]}
                            </div>
                          )}
                        </div>

                        <div className="h-1.5" />

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
                            <span
                              className={`font-bold uppercase tracking-widest text-[13px] ${isAwayWinner ? "text-white" : "text-slate-300"} ${item.away !== "TBD" ? "cursor-pointer hover:text-emerald-400 transition-colors duration-200" : ""}`}
                              onMouseEnter={() => item.away !== "TBD" && setHoveredTeam(item.away)}
                              onMouseLeave={() => setHoveredTeam(null)}
                            >
                              {item.away}
                            </span>
                          </div>
                          {item.score && (
                            <div className={`text-[13px] font-black ${isAwayWinner ? "text-emerald-400" : "text-slate-500"}`}>
                              {item.score.split(" - ")[1]}
                            </div>
                          )}
                        </div>

                        {/* Penalty badge */}
                        {item.homePenaltyScore !== undefined && item.awayPenaltyScore !== undefined && (
                          <div className="mt-1 flex justify-center">
                            <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-0.5 tracking-widest uppercase">
                              Pen {item.homePenaltyScore}:{item.awayPenaltyScore}
                            </span>
                          </div>
                        )}

                        {/* Champion banner */}
                        {isFinalMatch && item.winner && (
                          <div className="mt-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl py-1.5 px-2 text-center text-[10px] font-bold text-amber-400">
                            🎉 Congratulations {item.winner === "BRA" ? "Brazil" : item.winner}!
                          </div>
                        )}

                        {/* Center column match ID */}
                        {colIdx === 4 && <div className="pt-1 text-center"><span className="text-[9px] font-black text-rose-500 tracking-wider">{matchLabel}</span></div>}
                      </div>
                    );

                    if (colIdx < 4) return (
                      // Row slot: full fixed height, position:relative so absolute children reference it
                      <div key={idx} className={`relative w-full transition-opacity duration-300 ${isDimmed ? "opacity-25" : "opacity-100"}`} style={{ height: `${1120 / N}px`, flexShrink: 0 }}>
                        {/* Card content centered inside the row slot */}
                        <div style={{ position: "absolute", top: 0, bottom: 0, left: "40px", right: 0, display: "flex", alignItems: "center" }}>
                          {cardInner}
                        </div>
                        {/* Match label — pinned to row slot's true vertical center */}
                        <span className="text-[10px] font-black text-rose-500 w-8 text-right tracking-wider select-none" style={{ position: "absolute", left: 0, top: `calc(50% + ${connectorOffset}px)`, transform: "translateY(-50%)" }}>{matchLabel}</span>
                        {/* Left-side connector lines — children of row slot */}
                        {colIdx === 3 ? (
                          <>
                            <div style={{ right: "-24px", width: "24px", top: `calc(50% + ${connectorOffset}px)` }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${sfConnectorClass}`} />
                            <div style={{ height: `${vH}px`, bottom: `calc(50% - ${connectorOffset}px)`, right: "-24px", width: "2px" }} className={`absolute pointer-events-none transition-all duration-300 ${sfConnectorClass}`} />
                            <div style={{ top: `calc(50% + ${connectorOffset}px - ${vH}px)`, right: "-56px", width: "32px" }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${sfConnectorClass}`} />
                          </>
                        ) : (
                          <>
                            <div style={{ right: "-44px", width: "44px", top: `calc(50% + ${connectorOffset}px)` }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${myConnectorClass}`} />
                            <div style={{ height: `${vH}px`, top: isEven ? `calc(50% + ${connectorOffset}px)` : "auto", bottom: isEven ? "auto" : `calc(50% - ${connectorOffset}px)`, right: "-44px", width: "2px" }} className={`absolute pointer-events-none transition-all duration-300 ${myConnectorClass}`} />
                            {isEven && <div style={{ top: `calc(50% + ${connectorOffset}px + ${vH}px)`, right: "-88px", width: "44px" }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${farConnectorClass}`} />}
                          </>
                        )}
                      </div>
                    );
                    if (colIdx > 4) return (
                      // Row slot: full fixed height, position:relative so absolute children reference it
                      <div key={idx} className={`relative w-full transition-opacity duration-300 ${isDimmed ? "opacity-25" : "opacity-100"}`} style={{ height: `${1120 / N}px`, flexShrink: 0 }}>
                        {/* Card content centered inside the row slot */}
                        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: "40px", display: "flex", alignItems: "center" }}>
                          {cardInner}
                        </div>
                        {/* Match label — pinned to row slot's true vertical center */}
                        <span className="text-[10px] font-black text-rose-500 w-8 text-left tracking-wider select-none" style={{ position: "absolute", right: 0, top: `calc(50% + ${connectorOffset}px)`, transform: "translateY(-50%)" }}>{matchLabel}</span>
                        {/* Right-side connector lines — children of row slot */}
                        {colIdx === 5 ? (
                          <>
                            <div style={{ left: "-24px", width: "24px", top: `calc(50% + ${connectorOffset}px)` }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${sfConnectorClass}`} />
                            <div style={{ height: `${vH}px`, bottom: `calc(50% - ${connectorOffset}px)`, left: "-24px", width: "2px" }} className={`absolute pointer-events-none transition-all duration-300 ${sfConnectorClass}`} />
                            <div style={{ top: `calc(50% + ${connectorOffset}px - ${vH}px)`, left: "-56px", width: "32px" }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${sfConnectorClass}`} />
                          </>
                        ) : (
                          <>
                            <div style={{ left: "-44px", width: "44px", top: `calc(50% + ${connectorOffset}px)` }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${myConnectorClass}`} />
                            <div style={{ height: `${vH}px`, top: isEven ? `calc(50% + ${connectorOffset}px)` : "auto", bottom: isEven ? "auto" : `calc(50% - ${connectorOffset}px)`, left: "-44px", width: "2px" }} className={`absolute pointer-events-none transition-all duration-300 ${myConnectorClass}`} />
                            {isEven && <div style={{ top: `calc(50% + ${connectorOffset}px + ${vH}px)`, left: "-88px", width: "44px" }} className={`absolute h-[2px] pointer-events-none transition-all duration-300 ${farConnectorClass}`} />}
                          </>
                        )}
                      </div>
                    );
                    return <div key={idx} className={`w-full px-2 transition-opacity duration-300 ${isDimmed ? "opacity-25" : "opacity-100"}`} style={{ height: `${1120 / N}px`, flexShrink: 0, display: "flex", alignItems: "center" }}>{cardInner}</div>;
                  })}
                </div>
              </div>
            );
          })}
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
