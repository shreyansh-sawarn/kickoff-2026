import React from "react";
import { Map, MapPin } from "lucide-react";
import { Stadium } from "@wc26/types";

interface StadiumsTabProps {
  stadiums: Stadium[];
  t: (key: string) => string;
}

export function StadiumsTab({ stadiums, t }: StadiumsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Map className="w-5 h-5 mr-2 text-emerald-400" /> {t("stadiums")}
        </h3>
        <span className="text-xs text-slate-400 font-bold">16 World Cup stadiums across USA, Mexico, and Canada</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stadiums.map((stadium) => (
          <div key={stadium.id} className="bg-[#131b2e] border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-emerald-500/20 transition-all duration-300">
            <div className="p-6">
              <span className="text-xs font-bold text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10 self-start uppercase tracking-wider">
                {stadium.country}
              </span>
              <h4 className="font-extrabold text-lg text-white mt-3">{stadium.name}</h4>
              <p className="text-xs text-slate-400 flex items-center mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" /> {stadium.city}
              </p>
            </div>
            
            <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-850/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">{t("stadiumsCapacity")}</span>
              <span className="font-extrabold text-white">{stadium.capacity.toLocaleString()} seats</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
