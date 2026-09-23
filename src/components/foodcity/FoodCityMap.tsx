import React from 'react';
import { District, Restaurant } from '../../types';
import { DistrictNode } from './DistrictNode';
import { AmbientElements } from './AmbientElements';
import { Compass, Search } from 'lucide-react';

interface FoodCityMapProps {
  districts: District[];
  restaurants: Restaurant[];
  isNightMode: boolean;
  onSelectDistrict: (districtId: string) => void;
  searchQuery: string;
}

export const FoodCityMap: React.FC<FoodCityMapProps> = ({
  districts,
  restaurants,
  isNightMode,
  onSelectDistrict,
  searchQuery,
}) => {
  // Filter districts and restaurants if there is a search query
  const query = searchQuery.trim().toLowerCase();

  const isDistrictMatched = (district: District): boolean => {
    if (!query) return true;
    
    // Check district name, headline, specialties
    if (district.name.toLowerCase().includes(query)) return true;
    if (district.headline.toLowerCase().includes(query)) return true;
    if (district.popularSpecialties.some(s => s.toLowerCase().includes(query))) return true;

    // Check restaurants in this district
    const districtRestaurants = restaurants.filter(r => r.districtId === district.id);
    return districtRestaurants.some(r => 
      r.name.toLowerCase().includes(query) ||
      r.specialties.some(s => s.toLowerCase().includes(query)) ||
      r.cuisineIds.some(c => c.toLowerCase().includes(query))
    );
  };

  const matchedCount = districts.filter(isDistrictMatched).length;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Village Intro Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold mb-3 border ${
          isNightMode 
            ? 'bg-[#1E2942] border-[#314268] text-amber-300' 
            : 'bg-[#F2E8D5] border-[#D9C7AD] text-[#7A4B1A]'
        }`}>
          <span className="animate-spin text-sm">✨</span>
          <span>DISCOVER THE LIVING CULINARY NEIGHBOURHOOD</span>
        </div>

        <h1 className={`font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 transition-colors ${
          isNightMode ? 'text-white' : 'text-[#2C241E]'
        }`}>
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D95C3F] via-[#F3A228] to-[#2D936C]">Food City</span>
        </h1>

        <p className={`text-sm sm:text-base leading-relaxed transition-colors ${
          isNightMode ? 'text-slate-300' : 'text-[#695B4E]'
        }`}>
          Stroll through hand-crafted cuisine quarters, explore local storefronts, and discover authentic multi-cuisine menus. Click any quarter below to step inside.
        </p>

        {query && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <Search className="w-3.5 h-3.5" />
            <span>Found {matchedCount} districts matching &ldquo;{query}&rdquo;</span>
          </div>
        )}
      </div>

      {/* Illustrated Village Grid Canvas */}
      <div className={`relative rounded-3xl p-4 sm:p-8 lg:p-10 border transition-all duration-700 overflow-hidden ${
        isNightMode
          ? 'bg-[#0E1524] border-[#22304D] shadow-2xl shadow-black/60'
          : 'bg-[#FAF6EC] border-[#E8DFC8] shadow-cozy-lg'
      }`}>

        {/* Ambient Decorative Village Street Grid / Roads Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: isNightMode
              ? 'radial-gradient(#273656 1.5px, transparent 1.5px), radial-gradient(#273656 1.5px, #0E1524 1.5px)'
              : 'radial-gradient(#D8CCBA 1.5px, transparent 1.5px), radial-gradient(#D8CCBA 1.5px, #FAF6EC 1.5px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        {/* Ambient Moving Elements (Scooter, streetlamps, plaza) */}
        <AmbientElements isNightMode={isNightMode} />

        {/* Village District Quarters Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {districts.map((district) => {
            const districtRestaurants = restaurants.filter((r) => r.districtId === district.id);
            const isMatch = isDistrictMatched(district);

            return (
              <div 
                key={district.id}
                className={`transition-all duration-300 ${
                  isMatch ? 'opacity-100 scale-100' : 'opacity-35 grayscale-[50%] scale-[0.98]'
                }`}
              >
                <DistrictNode
                  district={district}
                  restaurants={districtRestaurants}
                  isNightMode={isNightMode}
                  onSelect={onSelectDistrict}
                />
              </div>
            );
          })}
        </div>

        {/* Subtle Map Compass Indicator */}
        <div className="mt-8 pt-4 border-t border-dashed border-[#DFD3BF] dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Interactive Village Map: 6 Districts • {restaurants.length} Registered Kitchens</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Open Storefronts</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Multi-Cuisine Enabled</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
