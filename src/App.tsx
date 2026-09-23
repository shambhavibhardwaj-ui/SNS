import React, { useState } from 'react';
import { DISTRICTS, RESTAURANTS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { FoodCityMap } from './components/foodcity/FoodCityMap';
import { DistrictExplorer } from './components/DistrictView/DistrictExplorer';
import { Shield, Cpu, Layers } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentDistrict = selectedDistrictId
    ? DISTRICTS.find((d) => d.id === selectedDistrictId) || null
    : null;

  const currentDistrictRestaurants = selectedDistrictId
    ? RESTAURANTS.filter((r) => r.districtId === selectedDistrictId)
    : [];

  const handleSelectDistrict = (districtId: string | null) => {
    setSelectedDistrictId(districtId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${
      isNightMode ? 'bg-[#0B101D] text-[#E2E8F0]' : 'bg-[#F7F4EB] text-[#2D2724]'
    }`}>
      {/* Top Navigation */}
      <Navbar
        selectedDistrictId={selectedDistrictId}
        onSelectDistrict={handleSelectDistrict}
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode(!isNightMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentDistrict ? (
          <DistrictExplorer
            district={currentDistrict}
            restaurants={currentDistrictRestaurants}
            isNightMode={isNightMode}
            onBackToCity={() => handleSelectDistrict(null)}
          />
        ) : (
          <FoodCityMap
            districts={DISTRICTS}
            restaurants={RESTAURANTS}
            isNightMode={isNightMode}
            onSelectDistrict={(id) => handleSelectDistrict(id)}
            searchQuery={searchQuery}
          />
        )}
      </main>

      {/* College Project Architecture & Computation Model Footer */}
      <footer className={`mt-16 border-t transition-colors duration-500 ${
        isNightMode 
          ? 'bg-[#090D18] border-[#1E2942] text-slate-400' 
          : 'bg-[#EFE9DB] border-[#DFD3BE] text-[#695B4E]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
            
            {/* Project Overview */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-2 font-display font-bold text-base text-[#2C241E] dark:text-white">
                <span className="text-xl">🏘️</span>
                <span>Food City Discovery</span>
              </div>
              <p className="leading-relaxed">
                Customer-facing illustrated village interface for the <strong>RestaurantOnboarding</strong> system. Built with multi-cuisine architectural routing and rule-based evaluation.
              </p>
            </div>

            {/* Model 1: Service-Oriented Computing */}
            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-[#131B2E]/60 border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] uppercase tracking-wider mb-1.5 text-amber-600 dark:text-amber-400">
                <Layers className="w-3.5 h-3.5" />
                <span>1. Service-Oriented</span>
              </div>
              <p className="leading-relaxed">
                Modular architecture split into independent services: Restaurant, Menu & Cuisine, Order, Rating, Performance, and Fee Calculation.
              </p>
            </div>

            {/* Model 2: Rule-Based Computation */}
            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-[#131B2E]/60 border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] uppercase tracking-wider mb-1.5 text-emerald-600 dark:text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                <span>2. Rule-Based Engine</span>
              </div>
              <p className="leading-relaxed">
                Applies client business rules: <code>RULE-01</code> (improvement plans), <code>RULE-02</code> (concessions), and <code>RULE-03/04</code> (fleet delivery fees).
              </p>
            </div>

            {/* Model 3: Generative AI Layer */}
            <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-[#131B2E]/60 border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] uppercase tracking-wider mb-1.5 text-purple-600 dark:text-purple-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>3. Generative AI Layer</span>
              </div>
              <p className="leading-relaxed">
                Drafts improvement plans and personalized order recommendations grounded strictly in verified menu data. Human in the loop.
              </p>
            </div>

          </div>

          <div className="pt-6 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <div>
              <span>RestaurantOnboarding Platform • Phase 1 Customer Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Original Illustrated Food Village Concept</span>
              <span>•</span>
              <span>React 18 + TypeScript + Tailwind</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
