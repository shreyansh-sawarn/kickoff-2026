import React from "react";
import { getFlagCdnUrl } from "@wc26/utils";

interface FlagOrShieldProps {
  code: string;
  className?: string;
  imgClassName?: string;
}

export function FlagOrShield({ code, className = "", imgClassName = "" }: FlagOrShieldProps) {
  const isPlaceholder = !code || 
                        code === "TBD" || 
                        code === "UNK" || 
                        code.toLowerCase().includes("winner_") || 
                        code.toLowerCase().includes("loser_");

  if (isPlaceholder) {
    return (
      <div className={`flex items-center justify-center bg-slate-850/60 border border-slate-700/40 rounded ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-[50%] h-[50%] text-slate-500" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 4.418 3.364 8.535 8 9.9C16.636 20.535 20 16.418 20 12V6l-8-4z" />
        </svg>
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden rounded ${className}`}>
      <img src={getFlagCdnUrl(code)} alt="" className={`w-full h-full ${imgClassName}`} />
    </div>
  );
}
