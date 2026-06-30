import { Trophy, Calendar, Users, BarChart3, Sparkles, RefreshCw, MapPin, History, Award, Info } from "lucide-react";
import KnockoutIcon from "./KnockoutIcon";
import { TabType, SupportedLang } from "../hooks/useDashboard";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  moreMenuOpen: boolean;
  setMoreMenuOpen: (open: boolean) => void;
  loading: boolean;
  handleRefresh: () => void;
  t: (key: string) => string;
}

export default function Header({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  moreMenuOpen,
  setMoreMenuOpen,
  loading,
  handleRefresh,
  t
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0f19]/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-400 p-[2px]">
            <div className="w-full h-full bg-[#131b2e] rounded-[10px] flex items-center justify-center font-bold text-lg text-emerald-400">
              <img src="/logo.png" alt="FIFA 2026 World Cup" className="w-7 h-7 object-contain" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">
              KICKOFF 2026
            </span>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 relative">
          {([
            { id: "dashboard", label: t("dashboard"), icon: Trophy },
            { id: "matches", label: t("matches"), icon: Calendar },
            { id: "standings", label: t("standings"), icon: BarChart3 },
            { id: "knockout", label: t("knockout"), icon: KnockoutIcon },
            { id: "players", label: t("players"), icon: Users },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMoreMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center w-14 sm:w-16 h-12 rounded-xl transition-all relative ${
                  isActive
                    ? "text-emerald-400 font-bold bg-emerald-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-5 h-5 mb-1 overflow-visible" strokeWidth={1.8} />
                <span className="text-[9px] uppercase tracking-wide truncate max-w-full">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-6 h-[2px] bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full" />
                )}
              </button>
            );
          })}

          {/* More Tab */}
          <div className="relative">
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`flex flex-col items-center justify-center w-14 sm:w-16 h-12 rounded-xl transition-all ${
                ["news", "stadiums", "archive", "predictions", "about", "teams"].includes(activeTab)
                  ? "text-emerald-400 font-bold bg-emerald-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Sparkles className="w-5 h-5 mb-1 animate-pulse" />
              <span className="text-[9px] uppercase tracking-wide">
                {["news", "stadiums", "archive", "predictions", "about", "teams"].includes(activeTab)
                  ? activeTab === "news"
                    ? t("news")
                    : activeTab === "stadiums"
                      ? t("stadiums")
                      : activeTab === "archive"
                        ? t("archive")
                        : activeTab === "predictions"
                          ? t("predictions")
                          : activeTab === "teams"
                            ? t("teams")
                            : t("about")
                  : t("more")}
              </span>
            </button>

            {/* Dropdown Menu */}
            {moreMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-1">
                {([
                  { id: "teams", label: t("teams"), icon: Users },
                  { id: "news", label: t("news"), icon: Award },
                  { id: "stadiums", label: t("stadiums"), icon: MapPin },
                  { id: "archive", label: t("archive"), icon: History },
                  { id: "predictions", label: t("predictions"), icon: Trophy },
                  { id: "about", label: t("about"), icon: Info },
                ] as const).map((subTab) => {
                  const SubIcon = subTab.icon;
                  const isSubActive = activeTab === subTab.id;
                  return (
                    <button
                      key={subTab.id}
                      onClick={() => {
                        setActiveTab(subTab.id);
                        setMoreMenuOpen(false);
                      }}
                      className={`flex items-center w-full px-3 py-2 text-xs rounded-lg transition-all ${
                        isSubActive
                          ? "text-emerald-400 font-bold bg-emerald-500/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <SubIcon className="w-4 h-4 mr-2" />
                      {subTab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center space-x-2">
          {/* Language Selector Dropdown */}
          <select
            value={lang}
            onChange={(e) => {
              const selectedLang = e.target.value as SupportedLang;
              setLang(selectedLang);
              localStorage.setItem("wc26-lang", selectedLang);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none font-bold cursor-pointer hover:border-slate-700"
          >
            <option value="en">🇺🇸 English</option>
            <option value="es">🇲🇽 Español</option>
            <option value="pt">🇧🇷 Português</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="ja">🇯🇵 日本語</option>
            <option value="ko">🇰🇷 한국어</option>
          </select>

          <button 
            onClick={handleRefresh}
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-lg transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-emerald-450" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
