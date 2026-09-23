import React, { useState } from 'react';
import { X, Star, Layers, CheckCircle2, Sparkles } from 'lucide-react';
import { Restaurant } from '../../types';
import { CUISINES } from '../../data/mockData';

interface RestaurantPreviewModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  isNightMode: boolean;
}

export const RestaurantPreviewModal: React.FC<RestaurantPreviewModalProps> = ({
  restaurant,
  onClose,
  isNightMode,
}) => {
  if (!restaurant) return null;

  const [activeCuisineTab, setActiveCuisineTab] = useState<string>(restaurant.cuisineIds[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 ${
          isNightMode 
            ? 'bg-[#151E32] border-[#2A3756] text-slate-100' 
            : 'bg-[#FFFDF9] border-[#E8DEC8] text-[#2C241E]'
        }`}
      >
        {/* Storefront Roof Header */}
        <div 
          className="relative px-6 pt-6 pb-4"
          style={{ backgroundColor: restaurant.facade.roofColor }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-white/80 font-mono text-[11px] uppercase tracking-wider font-semibold">
            Storefront Inspection
          </div>
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight mt-0.5">
            {restaurant.name}
          </h3>
          <p className="text-white/90 text-xs sm:text-sm mt-1">
            {restaurant.tagline}
          </p>
        </div>

        {/* Awning Valance */}
        <div 
          className="h-3 w-full"
          style={{ backgroundColor: restaurant.facade.awningColor }}
        />

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          
          {/* Rating & Delivery Info Bar */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl mb-5 border text-center text-xs font-mono"
            style={{
              backgroundColor: isNightMode ? '#1C2640' : '#F6F0E4',
              borderColor: isNightMode ? '#2B395B' : '#E5DAC7',
            }}
          >
            <div>
              <span className="block text-[10px] text-slate-400">RATING</span>
              <span className="font-bold text-amber-500 text-sm flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                {restaurant.rating}
              </span>
            </div>

            <div className="border-x border-slate-300 dark:border-slate-700">
              <span className="block text-[10px] text-slate-400">DELIVERY FLEET</span>
              <span className="font-bold text-xs">
                {restaurant.deliveryType === 'aggregator' ? '🛵 Aggregator' : '🏠 Own Staff'}
              </span>
            </div>

            <div>
              <span className="block text-[10px] text-slate-400">PREP & RIDE</span>
              <span className="font-bold text-xs">{restaurant.deliveryEstimateMinutes} mins</span>
            </div>
          </div>

          {/* Multi-Cuisine Architecture Demonstration */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-display font-bold text-sm">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Multi-Cuisine Architecture</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {restaurant.cuisineIds.length} Independent Menus
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Per business requirements, this restaurant does NOT lump all foods into one mixed menu. Customers toggle between separate dedicated cuisine menus:
            </p>

            {/* Cuisine Selector Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[#EFE8D8] dark:bg-[#1C2640] border border-[#E0D4C0] dark:border-slate-700">
              {restaurant.cuisineIds.map((cId) => {
                const cuisine = CUISINES[cId];
                const isActive = activeCuisineTab === cId;
                return (
                  <button
                    key={cId}
                    onClick={() => setActiveCuisineTab(cId)}
                    className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isActive
                        ? isNightMode
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'bg-[#D95C3F] text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{cuisine?.icon}</span>
                    <span>{cuisine?.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Cuisine Menu Preview */}
            <div className={`mt-3 p-4 rounded-2xl border text-xs ${
              isNightMode ? 'bg-[#18233C] border-[#2C3B5E]' : 'bg-[#FAF6EE] border-[#ECE2D1]'
            }`}>
              <div className="font-mono text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold mb-1">
                Active Menu: {CUISINES[activeCuisineTab]?.name}
              </div>
              <div className="font-medium text-sm mb-1">
                {restaurant.featuredDish.cuisine === CUISINES[activeCuisineTab]?.name 
                  ? restaurant.featuredDish.name 
                  : `${CUISINES[activeCuisineTab]?.name} Chef Selection`}
              </div>
              <p className="text-slate-500 text-xs">
                {CUISINES[activeCuisineTab]?.description}
              </p>
            </div>
          </div>

          {/* Specialties Overview */}
          <div className="mb-5">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-500 mb-2">
              Kitchen Specialties
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {restaurant.specialties.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EFE8D8] dark:bg-[#202C48] text-slate-700 dark:text-slate-200 border border-[#DFD3BF] dark:border-slate-700 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Phase 1 Notice Banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isNightMode 
              ? 'bg-amber-400/10 border-amber-400/20 text-amber-200' 
              : 'bg-[#FFF8E7] border-[#EEDBBA] text-[#784D1A]'
          }`}>
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong>Phase 1 Customer Discovery Milestone:</strong> You are viewing the live illustrated storefront discovery interface. The full interactive menu browser, category filters, cart, and mock checkout will be connected in Phase 2!
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-end gap-3 ${
          isNightMode ? 'border-slate-800 bg-[#101726]' : 'border-[#EADBCA] bg-[#F7F2E6]'
        }`}>
          <button
            onClick={onClose}
            className={`w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isNightMode 
                ? 'bg-[#1C2640] border-[#2C3B5E] text-slate-200 hover:bg-[#263558]' 
                : 'bg-[#EFE8D8] border-[#DFD3BF] text-[#554332] hover:bg-[#E5DAC7]'
            }`}
          >
            Return to Street View
          </button>
        </div>

      </div>
    </div>
  );
};
