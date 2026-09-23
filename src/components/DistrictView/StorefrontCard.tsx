import React from 'react';
import { Star, Clock, Bike, Home, Layers } from 'lucide-react';
import { Restaurant } from '../../types';
import { CUISINES } from '../../data/mockData';

interface StorefrontCardProps {
  restaurant: Restaurant;
  isNightMode: boolean;
  onSelect: (restaurant: Restaurant) => void;
}

export const StorefrontCard: React.FC<StorefrontCardProps> = ({
  restaurant,
  isNightMode,
  onSelect,
}) => {
  const { facade } = restaurant;
  const isMultiCuisine = restaurant.cuisineIds.length > 1;

  return (
    <div
      onClick={() => onSelect(restaurant)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(restaurant)}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ease-out border text-left flex flex-col justify-between ${
        isNightMode
          ? 'bg-[#182238] border-[#2A3756] hover:border-amber-400 hover:shadow-2xl hover:shadow-black/60'
          : 'bg-[#FFFDF9] border-[#E8DEC8] hover:border-[#D95C3F] hover:shadow-2xl hover:shadow-[#D95C3F]/15'
      } hover:-translate-y-2`}
      style={{
        boxShadow: isNightMode
          ? '0 12px 24px -6px rgba(0, 0, 0, 0.4)'
          : '0 8px 24px -4px rgba(60, 35, 20, 0.08), 0 3px 8px -2px rgba(60, 35, 20, 0.04)',
      }}
    >
      {/* Top Architectural Storefront Facade (Roof, Awning, Windows) */}
      <div className="relative w-full">
        {/* Roof Scallop / Parapet */}
        <div
          className="h-7 w-full flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: facade.roofColor }}
        >
          {/* Tile texture dots */}
          <div className="absolute inset-0 opacity-20 bg-repeat" style={{
            backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)',
            backgroundSize: '8px 8px',
          }} />

          {/* Chimney Steam Puff */}
          {facade.chimneySteam && (
            <div className="absolute right-6 -top-2 flex gap-1 pointer-events-none">
              <span className="w-1.5 h-3 bg-white/70 rounded-full animate-steam-rise blur-[0.5px]" />
              <span className="w-2 h-4 bg-white/50 rounded-full animate-steam-rise-delayed blur-[0.5px]" />
            </div>
          )}
        </div>

        {/* Fabric Striped Awning */}
        <div
          className="relative h-9 w-full flex overflow-hidden shadow-md"
          style={{ backgroundColor: facade.awningColor }}
        >
          {/* Awning stripes pattern */}
          {facade.awningStripeColor && (
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, ${facade.awningStripeColor}, ${facade.awningStripeColor} 14px, transparent 14px, transparent 28px)`,
              }}
            />
          )}

          {/* Awning Valance Scallops at the bottom */}
          <div className="absolute -bottom-1 inset-x-0 h-2 flex justify-between overflow-hidden">
            {Array.from({ length: 24 }).map((_, idx) => (
              <div
                key={idx}
                className="w-4 h-3 rounded-b-full shrink-0 -mx-[1px]"
                style={{ backgroundColor: facade.awningColor }}
              />
            ))}
          </div>
        </div>

        {/* Storefront Signboard Plaque */}
        <div className="pt-3 pb-2 px-5 flex items-center justify-between">
          <div className="flex-1 mr-2">
            <span className={`text-[10px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded border inline-block mb-1 ${
              isNightMode ? 'bg-[#22304D] border-[#314268] text-amber-300' : 'bg-[#F2ECE1] border-[#DFD3BE] text-[#78644E]'
            }`}>
              {facade.signboardText}
            </span>
            <h4 className={`font-display font-bold text-xl leading-snug transition-colors ${
              isNightMode ? 'text-white group-hover:text-amber-300' : 'text-[#2C241E] group-hover:text-[#BF482C]'
            }`}>
              {restaurant.name}
            </h4>
          </div>

          {/* Star Rating Badge */}
          <div className={`px-2.5 py-1.5 rounded-2xl flex flex-col items-center justify-center shrink-0 border shadow-sm ${
            restaurant.rating >= 4.5
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-1 font-bold text-sm">
              <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
            <span className="text-[9px] font-mono opacity-80">{restaurant.reviewCount} revs</span>
          </div>
        </div>
      </div>

      {/* Storefront Windows / Showroom Illustration */}
      <div className={`mx-4 my-2 p-3 rounded-2xl border transition-colors ${
        isNightMode 
          ? 'bg-[#12192A] border-[#222E48]' 
          : 'bg-[#FAF6EE] border-[#ECE2D1]'
      }`}>
        <p className={`text-xs line-clamp-2 mb-2.5 ${isNightMode ? 'text-slate-300' : 'text-[#5E5144]'}`}>
          {restaurant.description}
        </p>

        {/* Featured Dish Showcase Plate */}
        <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
          isNightMode 
            ? 'bg-[#1A253C] border-[#2E3F63]' 
            : 'bg-white border-[#E5DAC7]'
        }`}>
          <div className="flex items-center gap-2 truncate pr-2">
            <span className="text-base shrink-0">🍲</span>
            <div className="truncate">
              <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold uppercase">
                House Specialty ({restaurant.featuredDish.cuisine})
              </div>
              <div className={`font-medium truncate ${isNightMode ? 'text-slate-100' : 'text-[#2C241E]'}`}>
                {restaurant.featuredDish.name}
              </div>
            </div>
          </div>
          <span className="font-mono font-bold text-xs shrink-0 text-emerald-700 dark:text-emerald-400">
            ₹{restaurant.featuredDish.price}
          </span>
        </div>
      </div>

      {/* Cuisine Badges (Crucial: Multi-Cuisine Showcase!) */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Offered Cuisines:</span>
          </div>
          {isMultiCuisine && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
              {restaurant.cuisineIds.length} Separate Menus
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {restaurant.cuisineIds.map((cId) => {
            const cuisine = CUISINES[cId];
            return (
              <span
                key={cId}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 border transition-colors ${
                  isNightMode
                    ? 'bg-[#22304D] border-[#314268] text-slate-200'
                    : 'bg-[#F2ECE1] border-[#DFD3BE] text-[#544435]'
                }`}
              >
                <span>{cuisine?.icon || '🍽️'}</span>
                <span>{cuisine?.name || cId}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Delivery Model & Operational Footer */}
      <div className={`mt-3 p-4 border-t flex flex-col gap-2 ${
        isNightMode ? 'border-[#22304D] bg-[#12192A]/50' : 'border-[#EADBCA] bg-[#F7F2E6]/60'
      }`}>
        <div className="flex items-center justify-between text-xs">
          
          {/* Delivery Mode Badge (RULE-03 / RULE-04 Business Model) */}
          <div className={`px-2 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
            restaurant.deliveryType === 'aggregator'
              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
          }`}>
            {restaurant.deliveryType === 'aggregator' ? (
              <>
                <Bike className="w-3.5 h-3.5" />
                <span>Aggregator Fleet</span>
              </>
            ) : (
              <>
                <Home className="w-3.5 h-3.5" />
                <span>Own Staff Delivery</span>
              </>
            )}
          </div>

          {/* Delivery Time & Price Level */}
          <div className="flex items-center gap-3 text-slate-500 text-xs font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{restaurant.deliveryEstimateMinutes}m</span>
            </span>
            <span className="font-bold text-[#D95C3F]">{restaurant.priceLevel}</span>
          </div>

        </div>

        {/* Enter Kitchen Storefront CTA */}
        <button
          className={`w-full py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all duration-200 ${
            isNightMode
              ? 'bg-amber-400 text-slate-950 font-bold hover:bg-amber-300'
              : 'bg-[#D95C3F] text-white hover:bg-[#BF482C]'
          }`}
        >
          <span>Step Inside Storefront</span>
          <span className="text-[10px] font-mono">→</span>
        </button>
      </div>

    </div>
  );
};
