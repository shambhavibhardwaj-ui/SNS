import React from 'react';

interface AmbientElementsProps {
  isNightMode: boolean;
}

export const AmbientElements: React.FC<AmbientElementsProps> = ({ isNightMode }) => {
  return (
    <>
      {/* Ambient Moving Delivery Scooter */}
      <div 
        className="absolute top-1/2 left-4 pointer-events-none z-20 animate-scooter-ride hidden sm:block"
        style={{ transform: 'translateY(-50%)' }}
      >
        <div className="relative flex items-center gap-1">
          {/* Scooter graphic */}
          <div className="relative text-2xl filter drop-shadow-md">
            🛵
            {/* Tiny steam / exhaust puff */}
            <div className="absolute -left-2 bottom-1 w-2 h-2 rounded-full bg-slate-300/60 animate-ping" />
          </div>
          {/* Mini thermal delivery box */}
          <div className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight shadow-sm border ${
            isNightMode 
              ? 'bg-amber-400 text-slate-950 border-amber-300' 
              : 'bg-[#D95C3F] text-white border-orange-700'
          }`}>
            HOT FOOD
          </div>
        </div>
      </div>

      {/* Decorative Village Streetlamp Left */}
      <div className="absolute top-[42%] left-[18%] pointer-events-none hidden lg:block z-10">
        <div className="relative flex flex-col items-center">
          {/* Lantern Light Glow Halo */}
          <div className={`absolute -top-3 w-16 h-16 rounded-full transition-opacity duration-700 ${
            isNightMode 
              ? 'bg-amber-300/30 blur-md opacity-100' 
              : 'bg-amber-200/20 blur-sm opacity-40'
          }`} />
          {/* Lantern cap */}
          <div className={`w-3.5 h-1.5 rounded-t-sm ${isNightMode ? 'bg-amber-200' : 'bg-slate-700'}`} />
          <div className={`w-3 h-3 rounded-b-sm border ${
            isNightMode ? 'bg-amber-300 border-amber-400 shadow-lg shadow-amber-300/50' : 'bg-amber-100 border-slate-600'
          }`} />
          {/* Post */}
          <div className="w-1 h-10 bg-gradient-to-b from-slate-700 to-slate-900 rounded-sm" />
          <div className="w-3 h-1 bg-slate-800 rounded-full" />
        </div>
      </div>

      {/* Decorative Village Streetlamp Right */}
      <div className="absolute top-[42%] right-[18%] pointer-events-none hidden lg:block z-10">
        <div className="relative flex flex-col items-center">
          {/* Lantern Light Glow Halo */}
          <div className={`absolute -top-3 w-16 h-16 rounded-full transition-opacity duration-700 ${
            isNightMode 
              ? 'bg-amber-300/30 blur-md opacity-100' 
              : 'bg-amber-200/20 blur-sm opacity-40'
          }`} />
          {/* Lantern cap */}
          <div className={`w-3.5 h-1.5 rounded-t-sm ${isNightMode ? 'bg-amber-200' : 'bg-slate-700'}`} />
          <div className={`w-3 h-3 rounded-b-sm border ${
            isNightMode ? 'bg-amber-300 border-amber-400 shadow-lg shadow-amber-300/50' : 'bg-amber-100 border-slate-600'
          }`} />
          {/* Post */}
          <div className="w-1 h-10 bg-gradient-to-b from-slate-700 to-slate-900 rounded-sm" />
          <div className="w-3 h-1 bg-slate-800 rounded-full" />
        </div>
      </div>

      {/* Central Village Fountain / Greenery Plaza */}
      <div className="col-span-12 my-2 flex items-center justify-center relative z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="h-[2px] w-16 md:w-32 bg-gradient-to-r from-transparent to-[#D6CABA]" />
          
          <div className={`px-4 py-1.5 rounded-full border text-xs font-mono flex items-center gap-2 shadow-sm transition-colors duration-300 ${
            isNightMode 
              ? 'bg-[#1E2942] border-[#334469] text-slate-300' 
              : 'bg-[#F2ECE1] border-[#DFD3BF] text-[#78644E]'
          }`}>
            <span>🌳</span>
            <span className="font-semibold uppercase tracking-wider text-[11px]">Central Culinary Plaza</span>
            <span>⛲</span>
          </div>

          <div className="h-[2px] w-16 md:w-32 bg-gradient-to-l from-transparent to-[#D6CABA]" />
        </div>
      </div>
    </>
  );
};
