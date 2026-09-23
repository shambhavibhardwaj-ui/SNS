import React from 'react';
import { Search, Moon, Sun, Compass, Sparkles } from 'lucide-react';
import { DISTRICTS } from '../data/mockData';

interface NavbarProps {
  selectedDistrictId: string | null;
  onSelectDistrict: (id: string | null) => void;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedDistrictId,
  onSelectDistrict,
  isNightMode,
  onToggleNightMode,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 border-b ${
      isNightMode 
        ? 'bg-[#141C2E]/95 border-[#2A3756] text-[#F1F5F9] backdrop-blur-md' 
        : 'bg-[#FDFBF7]/95 border-[#E8DEC8] text-[#2C2825] backdrop-blur-md'
    }`}>
      {/* Top Banner Notice */}
      <div className={`text-xs py-1.5 px-4 text-center font-medium border-b flex items-center justify-center gap-2 ${
        isNightMode ? 'bg-[#1E2942] border-[#2A3756] text-amber-300' : 'bg-[#FFF8E7] border-[#EEDBBA] text-[#8C5815]'
      }`}>
        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        <span>Welcome to <strong>Food City</strong> — Explore cuisine districts & discover multi-cuisine restaurant storefronts</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => onSelectDistrict(null)}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105 ${
              isNightMode 
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-orange-950/40' 
                : 'bg-gradient-to-br from-[#D95C3F] to-[#E76F51] text-white shadow-orange-900/15'
            }`}>
              <span className="text-xl">🏘️</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-xl tracking-tight">Food City</span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-semibold tracking-wider ${
                  isNightMode ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-[#EBDDC9] text-[#70482B]'
                }`}>
                  Village
                </span>
              </div>
              <p className={`text-[11px] leading-tight transition-colors ${
                isNightMode ? 'text-slate-400' : 'text-[#8A7968]'
              }`}>
                Restaurant Onboarding Platform
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                isNightMode ? 'text-slate-400' : 'text-[#9C8B7A]'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search districts, restaurants, or cuisines..."
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-full transition-all outline-none border ${
                  isNightMode
                    ? 'bg-[#1E2942] border-[#2E3C5C] text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20'
                    : 'bg-[#F5EFE3] border-[#DFD3BE] text-[#2C2825] placeholder:text-[#9C8B7A] focus:bg-white focus:border-[#D95C3F] focus:ring-2 focus:ring-[#D95C3F]/20'
                }`}
              />
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-3">
            {/* View Overview Pill */}
            {selectedDistrictId && (
              <button
                onClick={() => onSelectDistrict(null)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all border ${
                  isNightMode
                    ? 'bg-[#1E2942] hover:bg-[#283756] border-[#374870] text-amber-300'
                    : 'bg-[#F2E8D5] hover:bg-[#EBDDC9] border-[#D9C7AD] text-[#694420]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Full Map</span>
              </button>
            )}

            {/* Night / Twilight Ambiance Toggle */}
            <button
              onClick={onToggleNightMode}
              title={isNightMode ? "Switch to Cozy Daylight" : "Switch to Evening Lanterns"}
              className={`p-2 rounded-xl transition-all border flex items-center gap-1.5 text-xs font-medium ${
                isNightMode
                  ? 'bg-[#1E2942] hover:bg-[#283756] border-[#374870] text-amber-300'
                  : 'bg-[#F5EFE3] hover:bg-[#EBDDC9] border-[#DFD3BE] text-[#6B5A47]'
              }`}
            >
              {isNightMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Day</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-700" />
                  <span className="hidden sm:inline">Night</span>
                </>
              )}
            </button>

            {/* User Profile Avatar */}
            <div className={`flex items-center gap-2 pl-2 border-l ${
              isNightMode ? 'border-slate-700' : 'border-[#E0D4C0]'
            }`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                SB
              </div>
            </div>

          </div>

        </div>

        {/* District Quick-Filter Bar */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => onSelectDistrict(null)}
            className={`whitespace-nowrap px-3 py-1 rounded-full font-medium transition-all ${
              selectedDistrictId === null
                ? isNightMode 
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'bg-[#D95C3F] text-white font-semibold shadow-sm'
                : isNightMode
                  ? 'bg-[#1E2942] text-slate-300 hover:bg-[#283756]'
                  : 'bg-[#EFE7D8] text-[#635343] hover:bg-[#E5DBC7]'
            }`}
          >
            🗺️ Entire Village
          </button>

          {DISTRICTS.map((district) => {
            const isSelected = selectedDistrictId === district.id;
            return (
              <button
                key={district.id}
                onClick={() => onSelectDistrict(district.id)}
                className={`whitespace-nowrap px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? isNightMode
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'bg-[#2D2724] text-white font-semibold shadow-sm'
                    : isNightMode
                      ? 'bg-[#1E2942] text-slate-300 hover:bg-[#283756]'
                      : 'bg-[#EFE7D8] text-[#635343] hover:bg-[#E5DBC7]'
                }`}
              >
                <span>{getDistrictEmoji(district.id)}</span>
                <span>{district.name}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};

function getDistrictEmoji(id: string): string {
  switch (id) {
    case 'indian-market': return '🍛';
    case 'asian-street': return '🍜';
    case 'little-italy': return '🍕';
    case 'mexican-plaza': return '🌮';
    case 'dessert-lane': return '🍰';
    case 'burger-avenue': return '🍔';
    default: return '🏬';
  }
}
