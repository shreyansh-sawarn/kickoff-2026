import React, { useState, useEffect } from "react";
import { getFlagCdnUrl } from "@wc26/utils";
import { 
  HistoricalData, 
  historyDb, 
  yearsList, 
  getHistoricalGroups, 
  getHistoricalKnockout, 
  parseHistoricalData 
} from "./archiveData";
import { ArchiveBracket } from "./ArchiveBracket";
import { ArchiveGroupStandings } from "./ArchiveGroupStandings";
import { ArchiveMatches } from "./ArchiveMatches";

interface ArchiveTabProps {
  t: (key: string) => string;
}

export function ArchiveTab({ t }: ArchiveTabProps) {
  const [selectedYear, setSelectedYear] = useState<string>("2022");
  const [archiveView, setArchiveView] = useState<"knockout" | "standings" | "matches">("knockout");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchedData, setFetchedData] = useState<{ groups: any[]; knockout: any[]; matches: any[] } | null>(null);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const selectedData = historyDb[selectedYear] || historyDb["2022"];

  useEffect(() => {
    setLoading(true);
    // Try fetching from local public assets folder first
    fetch(`/archive/${selectedYear}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Local archive file not found, falling back to GitHub");
        return res.json();
      })
      .catch((err) => {
        console.warn(err.message);
        // Fallback to GitHub endpoint if local file is missing
        return fetch(`https://raw.githubusercontent.com/openfootball/worldcup.json/master/${selectedYear}/worldcup.json`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch historical JSON from GitHub");
            return res.json();
          });
      })
      .then((json) => {
        const parsed = parseHistoricalData(json);
        setFetchedData(parsed);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load historical data:", err);
        // Fallback representation if offline and all fetches fail
        const localGroups = getHistoricalGroups(
          selectedYear, 
          selectedData.championName, 
          selectedData.championCode, 
          selectedData.runnerUp, 
          selectedData.runnerUpCode
        );
        const localKnockout = getHistoricalKnockout(
          selectedYear, 
          selectedData.championName, 
          selectedData.championCode, 
          selectedData.runnerUp, 
          selectedData.runnerUpCode
        );
        setFetchedData({ groups: localGroups, knockout: localKnockout, matches: [] });
        setLoading(false);
      });
  }, [selectedYear]);

  const activeData: HistoricalData = {
    ...selectedData,
    groups: fetchedData?.groups || [],
    knockout: fetchedData?.knockout || [],
    matches: fetchedData?.matches || []
  };

  const handleTimelineStepClick = (stepId: string) => {
    setArchiveView("matches");
    setTimeout(() => {
      const sections = Array.from(document.querySelectorAll('[id^="archive-section-"]'));
      let targetElement: Element | undefined = undefined;

      if (stepId === "group") {
        targetElement = sections.find(
          (el) =>
            el.id.includes("group") ||
            el.id.includes("firstround") ||
            el.id.includes("preliminaryround")
        );
      } else if (stepId === "r16") {
        targetElement = sections.find((el) => el.id.includes("roundof16"));
      } else if (stepId === "qf") {
        targetElement = sections.find((el) => el.id.includes("quarterfinals"));
      } else if (stepId === "sf") {
        targetElement = sections.find((el) => el.id.includes("semifinals"));
      } else if (stepId === "3rd") {
        targetElement = sections.find(
          (el) =>
            el.id.includes("thirdplace") ||
            el.id.includes("matchforthirdplace") ||
            el.id.includes("matchfor3rdplace")
        );
      } else if (stepId === "final") {
        targetElement = sections.find((el) => el.id.includes("final") || el.id.includes("finalround"));
      }

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Premium Year Selector Timeline & Stepper Header */}
      <div className="bg-[#131b2e] border border-slate-800/60 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full"></div>

        <div className="flex items-center space-x-3 mb-6 z-10 relative">
          <img src="/trophy.svg" alt="FIFA Trophy Logo" className="w-10 h-10 object-contain drop-shadow-md" />
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
              <h3 className="text-lg font-black text-white">FIFA World Cup {activeData.year}</h3>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Historical Timeline & Stats</p>
          </div>
        </div>

        {/* Year Pills Row Carousel */}
        <div className="relative z-10 flex items-center mb-6">
          <button 
            onClick={scrollLeft}
            className="mr-2 w-8 h-8 rounded-full bg-slate-900/90 hover:bg-slate-800 hover:text-white text-slate-400 flex items-center justify-center border border-slate-800 shrink-0 shadow-lg transition-all"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div 
            ref={scrollContainerRef}
            className="flex-1 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
          >
            {yearsList.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all shrink-0 ${
                  activeData.year === yr
                    ? "bg-white text-slate-950 shadow-lg"
                    : "bg-slate-900 text-slate-455 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          <button 
            onClick={scrollRight}
            className="ml-2 w-8 h-8 rounded-full bg-slate-900/90 hover:bg-slate-800 hover:text-white text-slate-400 flex items-center justify-center border border-slate-800 shrink-0 shadow-lg transition-all"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Stepper progress indicator matching Google Sports timeline */}
        <div className="relative pt-2 pb-1 z-10">
          <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-emerald-500 via-blue-500 to-amber-400 -translate-y-1/2 rounded-full opacity-60" />
          
          <div className="relative flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
            {[
              { id: "group", label: "Group stage", active: true },
              { id: "r16", label: "R16", active: true },
              { id: "qf", label: "QF", active: true },
              { id: "sf", label: "SF", active: true },
              { id: "3rd", label: "3rd", active: true },
              { id: "final", label: "Final", active: true },
            ].map((step, idx) => (
              <button
                key={idx}
                onClick={() => handleTimelineStepClick(step.id)}
                className="flex flex-col items-center group/step focus:outline-none transition-all"
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 border-[#131b2e] flex items-center justify-center transition-all ${
                  step.active ? "bg-white group-hover/step:bg-emerald-400 group-hover/step:scale-125" : "bg-slate-900"
                }`} />
                <span className="mt-2 font-black tracking-widest bg-[#131b2e] px-1 rounded transition-all text-slate-400 group-hover/step:text-white text-[8px] sm:text-[9px]">
                  {step.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Details layout for selected year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Championship Card */}
        <div className="bg-[#131b2e] border border-slate-800/60 rounded-2xl p-6">
          <h4 className="font-extrabold text-sm text-emerald-400 uppercase tracking-widest mb-4">Champions Showcase</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
              <span className="text-xs text-slate-450">Host Country</span>
              <span className="text-xs font-bold text-white">{activeData.host}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800/50">
              <span className="text-xs text-slate-450">🏆 Winner</span>
              <span className="text-xs font-black text-amber-400 flex items-center space-x-2">
                 <div className="w-6 h-4 relative overflow-hidden rounded-sm shadow-sm inline-block shrink-0 align-middle mr-1.5">
                  <img src={getFlagCdnUrl(activeData.championCode)} alt="" className="w-full h-full object-cover" />
                </div>
                <span>{activeData.championName}</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-450">Runner-up</span>
              <span className="text-xs font-bold text-white flex items-center space-x-2">
                 <div className="w-6 h-4 relative overflow-hidden rounded-sm shadow-sm inline-block shrink-0 align-middle mr-1.5">
                  <img src={getFlagCdnUrl(activeData.runnerUpCode)} alt="" className="w-full h-full object-cover" />
                </div>
                <span>{activeData.runnerUp}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Top Scorer Card */}
        <div className="bg-[#131b2e] border border-slate-800/60 rounded-2xl p-6">
          <h4 className="font-extrabold text-sm text-emerald-400 uppercase tracking-widest mb-4">Golden Boot Winners</h4>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
               <div className="w-10 h-7 relative overflow-hidden rounded shadow-sm shrink-0">
                <img src={getFlagCdnUrl(activeData.topScorerCountry)} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-white">{activeData.topScorerName}</h5>
                <span className="text-xs text-slate-450">{activeData.topScorerCountry} • Striker</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-400 block">{activeData.topScorerGoals}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Goals scored</span>
            </div>
          </div>
        </div>
      </div>

      {/* Standings & Knockouts selector tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setArchiveView("knockout")}
            className={`pb-3 pr-6 text-sm font-bold border-b-2 transition-all ${
              archiveView === "knockout"
                ? "border-emerald-400 text-emerald-400 font-extrabold"
                : "border-transparent text-slate-455 hover:text-slate-200"
            }`}
          >
            Knockout Stage
          </button>
          <button
            onClick={() => setArchiveView("standings")}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
              archiveView === "standings"
                ? "border-emerald-400 text-emerald-400 font-extrabold"
                : "border-transparent text-slate-455 hover:text-slate-200"
            }`}
          >
            Group Standings
          </button>
          <button
            onClick={() => setArchiveView("matches")}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
              archiveView === "matches"
                ? "border-emerald-400 text-emerald-400 font-extrabold"
                : "border-transparent text-slate-455 hover:text-slate-200"
            }`}
          >
            Matches
          </button>
        </div>

        {loading || !fetchedData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-800/30 rounded-2xl border border-slate-700/20"></div>
            ))}
          </div>
        ) : archiveView === "knockout" ? (
          <ArchiveBracket knockout={activeData.knockout} />
        ) : archiveView === "standings" ? (
          <ArchiveGroupStandings groups={activeData.groups} />
        ) : (
          <ArchiveMatches matches={activeData.matches} />
        )}
      </div>
    </div>
  );
}
