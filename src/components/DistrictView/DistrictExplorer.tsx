import React, { useState } from 'react';
import { ArrowLeft, Filter, Sparkles, Bike, Home, Layers } from 'lucide-react';
import { District, Restaurant } from '../../types';
import { CUISINES } from '../../data/mockData';
import { StorefrontCard } from './StorefrontCard';
import { RestaurantPreviewModal } from './RestaurantPreviewModal';

interface DistrictExplorerProps {
  district: District;
  restaurants: Restaurant[];
  isNightMode: boolean;
  onBackToCity: () => void;
}

export const DistrictExplorer: React.FC<DistrictExplorerProps> = ({
  district,
  restaurants,
  isNightMode,
  onBackToCity,
}) => {
  const [selectedCuisineFilter, setSelectedCuisineFilter] = useState<string>('all');
  const [selectedDeliveryFilter, setSelectedDeliveryFilter] = useState<'all' | 'aggregator' | 'own_staff'>('all');
  const [inspectedRestaurant, setInspectedRestaurant] = useState<Restaurant | null>(null);

  // Collect distinct cuisine IDs present in this district's restaurants
  const availableCuisineIds = Array.from(
    new Set(restaurants.flatMap((r) => r.cuisineIds))
  );

  // Filter restaurants by cuisine and delivery choice
  const filteredRestaurants = restaurants.filter((r) => {
    if (selectedCuisineFilter !== 'all' && !r.cuisineIds.includes(selectedCuisineFilter)) {
      return false;
    }
    if (selectedDeliveryFilter !== 'all' && r.deliveryType !== selectedDeliveryFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Breadcrumb & Return Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={onBackToCity}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold border transition-all duration-200 group shadow-sm ${
            isNightMode
              ? 'bg-[#18233C] border-[#2A3756] text-amber-300 hover:bg-[#22304F]'
              : 'bg-[#FFFDF9] border-[#DFD3BF] text-[#70482B] hover:bg-[#F5ECE0]'
          }`}
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>← Back to Food City Village</span>
        </button>

        <div className={`px-3 py-1 rounded-full text-xs font-mono border flex items-center gap-2 ${
          isNightMode 
            ? 'bg-[#18233C] border-[#2A3756] text-slate-300' 
            : 'bg-[#F2ECE1] border-[#DFD3BE] text-[#695744]'
        }`}>
          <span>📍 District Landmark:</span>
          <span className="font-bold text-amber-600 dark:text-amber-400">{district.streetName}</span>
        </div>
      </div>

      {/* District Hero Landmark Banner */}
      <div 
        className="relative rounded-3xl p-6 sm:p-8 lg:p-10 mb-8 border overflow-hidden shadow-cozy-lg text-white"
        style={{
          background: isNightMode
            ? `linear-gradient(135deg, ${district.accentColor}cc 0%, #111827 100%)`
            : `linear-gradient(135deg, ${district.accentColor} 0%, #3C2218 100%)`,
        }}
      >
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, white 1.5px, transparent 1.5px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/20 backdrop-blur-md mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="uppercase tracking-wider">Cuisine Quarter</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-2 text-white">
            {district.name}
          </h2>

          <p className="text-amber-100 font-medium text-sm sm:text-base mb-3">
            {district.headline}
          </p>

          <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-4">
            {district.description}
          </p>

          {/* District Highlights */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/20 text-xs">
            <span className="text-white/70 font-mono">Popular in this quarter:</span>
            {district.popularSpecialties.map((s) => (
              <span key={s} className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className={`p-4 sm:p-5 rounded-2xl mb-8 border shadow-sm transition-colors ${
        isNightMode ? 'bg-[#151E32] border-[#2A3756]' : 'bg-[#FFFDF9] border-[#E8DEC8]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Cuisine Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-mono font-semibold uppercase text-slate-500 shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Cuisine:</span>
            </span>

            <button
              onClick={() => setSelectedCuisineFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCuisineFilter === 'all'
                  ? isNightMode 
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-[#D95C3F] text-white shadow-sm'
                  : isNightMode
                    ? 'bg-[#1E2942] text-slate-300 hover:bg-[#283756]'
                    : 'bg-[#F2ECE1] text-[#695744] hover:bg-[#EADBCA]'
              }`}
            >
              All Cuisines ({restaurants.length})
            </button>

            {availableCuisineIds.map((cId) => {
              const cuisine = CUISINES[cId];
              const isSelected = selectedCuisineFilter === cId;
              return (
                <button
                  key={cId}
                  onClick={() => setSelectedCuisineFilter(cId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? isNightMode
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                        : 'bg-[#D95C3F] text-white shadow-sm'
                      : isNightMode
                        ? 'bg-[#1E2942] text-slate-300 hover:bg-[#283756]'
                        : 'bg-[#F2ECE1] text-[#695744] hover:bg-[#EADBCA]'
                  }`}
                >
                  <span>{cuisine?.icon}</span>
                  <span>{cuisine?.name}</span>
                </button>
              );
            })}
          </div>

          {/* Delivery Model Filter (Demonstrating RULE-03 / RULE-04) */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-semibold uppercase text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span>Delivery Fleet:</span>
            </span>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F0E9DA] dark:bg-[#1C2640] border border-[#DFD3BF] dark:border-slate-700 text-xs">
              <button
                onClick={() => setSelectedDeliveryFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedDeliveryFilter === 'all'
                    ? isNightMode ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-[#D95C3F] text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedDeliveryFilter('aggregator')}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
                  selectedDeliveryFilter === 'aggregator'
                    ? isNightMode ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-[#D95C3F] text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
                title="Aggregator fleet delivery"
              >
                <Bike className="w-3 h-3" />
                <span>Aggregator</span>
              </button>
              <button
                onClick={() => setSelectedDeliveryFilter('own_staff')}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all ${
                  selectedDeliveryFilter === 'own_staff'
                    ? isNightMode ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-[#D95C3F] text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
                title="Restaurant's own delivery staff"
              >
                <Home className="w-3 h-3" />
                <span>Own Staff</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Illustrated Storefronts Grid */}
      {filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredRestaurants.map((restaurant) => (
            <StorefrontCard
              key={restaurant.id}
              restaurant={restaurant}
              isNightMode={isNightMode}
              onSelect={(r) => setInspectedRestaurant(r)}
            />
          ))}
        </div>
      ) : (
        <div className={`p-12 text-center rounded-3xl border ${
          isNightMode ? 'bg-[#18233C] border-[#2A3756]' : 'bg-[#FFFDF9] border-[#E8DEC8]'
        }`}>
          <div className="text-4xl mb-3">🍽️</div>
          <h3 className="font-display font-bold text-lg mb-1">No Storefronts Match Current Filter</h3>
          <p className="text-xs text-slate-500 mb-4">
            Try resetting the cuisine or delivery fleet filter to see all restaurants in this district.
          </p>
          <button
            onClick={() => {
              setSelectedCuisineFilter('all');
              setSelectedDeliveryFilter('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#D95C3F] text-white hover:bg-[#BF482C]"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Restaurant Storefront Inspection Modal */}
      <RestaurantPreviewModal
        restaurant={inspectedRestaurant}
        onClose={() => setInspectedRestaurant(null)}
        isNightMode={isNightMode}
      />

    </div>
  );
};
