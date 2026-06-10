import React from "react";
import { Info } from "lucide-react";

interface AboutTabProps {
  t: (key: string) => string;
}

export function AboutTab({ t }: AboutTabProps) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="bg-[#131b2e] border border-slate-800/60 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 blur-3xl rounded-full"></div>

        <div className="flex items-center space-x-4 mb-6 z-10 relative">
          <Info className="w-8 h-8 text-emerald-400 animate-pulse" />
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">{t("about")}</h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">FIFA World Cup 2026 Overview</p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-350 leading-relaxed z-10 relative">
          The FIFA World Cup is the premier professional football competition for men's national teams worldwide, governed by FIFA. The tournament takes place every four years and, starting in 2026, features an expanded format with 48 teams competing for the title. The reigning champion is Argentina, and the team that holds the most titles is Brazil (5 titles). Sofascore tracks live football scores, standings, results, statistics, and top scorers for the World Cup and its qualification rounds.
        </p>
      </div>

      {/* Grid: Formats, Dates, History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Format Card */}
        <div className="bg-[#131b2e] border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <h4 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
            Competition Format
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The 2026 tournament features a record 48 national teams and an unprecedented schedule of 104 matches in total.
          </p>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start">
              <span className="text-emerald-450 mr-2 font-bold">•</span>
              <span>The initial stage is composed of 12 groups of four teams. Every team plays three matches within its group.</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-450 mr-2 font-bold">•</span>
              <span>The top two teams from each group, along with the eight best third-placed teams, advance to a new Round of 32.</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-450 mr-2 font-bold">•</span>
              <span>From there, the competition follows a traditional single-elimination knockout bracket, meaning the two teams that reach the final will have played a total of eight matches.</span>
            </li>
          </ul>
        </div>

        {/* Dates & Venues Card */}
        <div className="bg-[#131b2e] border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <h4 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
            Key Dates & Venues
          </h4>
          <p className="text-xs text-slate-350 leading-relaxed">
            The World Cup 2026 will be jointly hosted by the United States, Canada, and Mexico. The tournament begins on <strong>Thursday, June 11, 2026</strong>, with the opening match held at the <strong>Estadio Azteca</strong> in Mexico City. The final match is scheduled for <strong>Sunday, July 19, 2026</strong>, at the <strong>New York New Jersey Stadium</strong> (MetLife Stadium) in East Rutherford, New Jersey.
          </p>
          <div className="space-y-2 pt-2 border-t border-slate-800/50 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Canada Host Cities:</span>
              <span className="font-bold text-slate-200">Toronto, Vancouver</span>
            </div>
            <div className="flex justify-between">
              <span>Mexico Host Cities:</span>
              <span className="font-bold text-slate-200">Guadalajara, Mexico City, Monterrey</span>
            </div>
            <div className="flex justify-between font-bold text-slate-200">
              <span>United States Host Cities:</span>
              <span>11 Cities (SF, LA, Miami, NY/NJ, Dallas, etc.)</span>
            </div>
            <p className="text-[10px] text-slate-500 italic mt-1">
              The United States will host all games from the Quarter-Finals onwards. The Final Draw took place on Dec 5, 2025.
            </p>
          </div>
        </div>
      </div>

      {/* History and Teams Expanded Row */}
      <div className="bg-[#131b2e] border border-slate-800/60 rounded-2xl p-6 space-y-6">
        <div>
          <h4 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider flex items-center mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
            FIFA World Cup Teams & History
          </h4>
          <p className="text-xs text-slate-355 leading-relaxed mb-4">
            As of March 2026, all nations have completed the qualifiers and secured their spot in the World Cup, including the three host qualifiers: <strong>Canada, Mexico, and the United States</strong>.
          </p>
        </div>

        {/* Dynamic Qualified Teams layout by Confederation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/50 text-[11px] text-slate-450">
          <div className="space-y-1">
            <div className="font-bold text-white text-xs mb-1">CONMEBOL & CONCACAF</div>
            <div>CONMEBOL (6): Argentina, Brazil, Colombia, Ecuador, Paraguay, Uruguay</div>
            <div>CONCACAF (3): Curaçao, Haiti, Panama (plus 3 host qualifiers)</div>
          </div>
          <div className="space-y-1">
            <div className="font-bold text-white text-xs mb-1">UEFA & OFC</div>
            <div>UEFA (16): Austria, Belgium, Bosnia & Herzegovina, Croatia, Czechia, England, France, Germany, Netherlands, Norway, Portugal, Scotland, Spain, Sweden, Switzerland, Türkiye</div>
            <div>OFC (1): New Zealand</div>
          </div>
          <div className="space-y-1">
            <div className="font-bold text-white text-xs mb-1">CAF & AFC</div>
            <div>CAF (10): Algeria, Cape Verde, Congo DR, Côte d'Ivoire, Egypt, Ghana, Morocco, Senegal, South Africa, Tunisia</div>
            <div>AFC (9): Australia, Iraq, Iran, Japan, Jordan, South Korea, Qatar, Saudi Arabia, Uzbekistan</div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/50 text-xs text-slate-300 leading-relaxed">
          The team with the most titles in the FIFA World Cup is <strong>Brazil</strong>, with 5 championships. The first FIFA World Cup, held in 1930, was won by the host nation, <strong>Uruguay</strong>. The current titleholder is <strong>Argentina</strong>, who won the 2022 tournament. The average number of goals per match in the FIFA World Cup 2022 was 2.69.
        </div>
      </div>
    </div>
  );
}
