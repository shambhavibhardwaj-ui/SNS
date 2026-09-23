import React from 'react';
import { ArrowRight, Utensils, Sparkles } from 'lucide-react';
import { District, Restaurant } from '../../types';

interface DistrictNodeProps {
  district: District;
  restaurants: Restaurant[];
  isNightMode: boolean;
  onSelect: (id: string) => void;
}

export const DistrictNode: React.FC<DistrictNodeProps> = ({
  district,
  restaurants,
  isNightMode,
  onSelect,
}) => {
  const count = restaurants.length;

  return (
    <div
      onClick={() => onSelect(district.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(district.id)}
      className={`group relative rounded-3xl p-5 md:p-6 cursor-pointer transition-all duration-500 ease-out border text-left select-none overflow-hidden ${
        isNightMode
          ? 'bg-gradient-to-b from-[#1C263D] to-[#151D2E] border-[#2A3756] hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/10'
          : 'bg-gradient-to-b from-[#FFFDF9] to-[#F9F5EC] border-[#E8DEC8] hover:border-[#D95C3F] hover:shadow-2xl hover:shadow-[#D95C3F]/15'
      } hover:-translate-y-2`}
      style={{
        boxShadow: isNightMode
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
          : '0 8px 20px -4px rgba(70, 45, 25, 0.08), 0 2px 6px -2px rgba(70, 45, 25, 0.04)',
      }}
    >
      {/* Accent Glow backdrop on hover */}
      <div
        className="absolute -right-16 -top-16 w-36 h-36 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: district.accentColor }}
      />

      {/* Top Street Signboard Bar */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {/* District Signboard */}
        <div className="flex items-center gap-2">
          <span className="text-2xl filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
            {getDistrictLandmarkEmoji(district.id)}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                isNightMode ? 'bg-[#263554] text-amber-300' : district.badgeBg + ' ' + district.badgeText
              }`}>
                {district.streetName}
              </span>
            </div>
            <h3 className={`font-display font-bold text-xl md:text-2xl tracking-tight transition-colors duration-300 ${
              isNightMode ? 'text-white group-hover:text-amber-300' : 'text-[#2C241E] group-hover:text-[#BF482C]'
            }`}>
              {district.name}
            </h3>
          </div>
        </div>

        {/* Restaurant Count Pill */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1 shadow-sm ${
          isNightMode 
            ? 'bg-[#2A3756] text-slate-200 border border-[#3E4F76]' 
            : 'bg-[#F2ECE1] text-[#63513F] border border-[#DFD3BE]'
        }`}>
          <Utensils className="w-3 h-3 text-amber-500" />
          <span>{count} {count === 1 ? 'Kitchen' : 'Kitchens'}</span>
        </div>
      </div>

      {/* Illustrated Miniature Architectural Scene */}
      <div className={`relative w-full h-36 md:h-40 rounded-2xl mb-4 overflow-hidden flex items-end justify-center transition-colors duration-500 border ${
        isNightMode 
          ? 'bg-gradient-to-t from-[#0F1626] to-[#1A253C] border-[#2A3756]' 
          : 'bg-gradient-to-t from-[#EFE8D8] to-[#FAF6EE] border-[#E8DFC8]'
      }`}>
        {/* Architectural Scene Custom to Each District */}
        <DistrictIllustration type={district.id} isNightMode={isNightMode} accentColor={district.accentColor} />

        {/* Animated Steam Plume (Micro-Interaction) */}
        <div className="absolute top-4 left-1/2 -translate-x-4 pointer-events-none flex gap-1.5">
          <div className="w-1.5 h-3 bg-white/60 rounded-full animate-steam-rise blur-[0.5px]" />
          <div className="w-2 h-4 bg-white/50 rounded-full animate-steam-rise-delayed blur-[0.5px]" />
        </div>

        {/* Floating Sensory Atmosphere Pill */}
        <div className={`absolute bottom-2.5 left-3 right-3 px-3 py-1 rounded-xl text-[11px] font-medium backdrop-blur-md flex items-center justify-between border ${
          isNightMode 
            ? 'bg-[#151E32]/80 border-slate-700/60 text-slate-300' 
            : 'bg-white/85 border-[#DFD3BE]/70 text-[#6B5A47]'
        }`}>
          <span className="truncate flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="italic">{district.ambientVibe}</span>
          </span>
          <span className="text-[10px] font-mono uppercase font-bold shrink-0 text-amber-600">
            Open Now
          </span>
        </div>
      </div>

      {/* District Story / Description */}
      <p className={`text-xs leading-relaxed line-clamp-2 mb-3.5 transition-colors ${
        isNightMode ? 'text-slate-400' : 'text-[#6C5D4F]'
      }`}>
        {district.description}
      </p>

      {/* Specialties Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {district.popularSpecialties.slice(0, 3).map((dish) => (
          <span
            key={dish}
            className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
              isNightMode
                ? 'bg-[#222E48] text-slate-300 border border-[#2E3D5E]'
                : 'bg-[#F2ECE0] text-[#5C4D3E] border border-[#E3D6C1]'
            }`}
          >
            {dish}
          </span>
        ))}
        {district.popularSpecialties.length > 3 && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
            isNightMode ? 'text-slate-400' : 'text-[#8C7A67]'
          }`}>
            +{district.popularSpecialties.length - 3} more
          </span>
        )}
      </div>

      {/* District Card Footer CTA */}
      <div className={`pt-3 border-t flex items-center justify-between text-xs font-semibold transition-colors ${
        isNightMode 
          ? 'border-[#263554] text-amber-400 group-hover:text-amber-300' 
          : 'border-[#EADBCA] text-[#BF482C] group-hover:text-[#D95C3F]'
      }`}>
        <span className="flex items-center gap-1">
          <span>Enter District</span>
          <span className="text-[10px] font-normal opacity-80">({count} storefronts)</span>
        </span>
        <div className="flex items-center gap-1 transition-transform duration-300 group-hover:translate-x-1.5">
          <span className="text-xs">Explore</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

    </div>
  );
};

function getDistrictLandmarkEmoji(id: string): string {
  switch (id) {
    case 'indian-market': return '🏺';
    case 'asian-street': return '🏮';
    case 'little-italy': return '🏛️';
    case 'mexican-plaza': return '🌵';
    case 'dessert-lane': return '🧁';
    case 'burger-avenue': return '🍔';
    default: return '🏬';
  }
}

// Custom SVG-based architectural facades for each district
const DistrictIllustration: React.FC<{ type: string; isNightMode: boolean; accentColor: string }> = ({
  type,
  isNightMode,
  accentColor,
}) => {
  switch (type) {
    case 'indian-market':
      return (
        <svg viewBox="0 0 240 120" className="w-full h-full max-h-36 drop-shadow-sm select-none" fill="none">
          <rect x="0" y="105" width="240" height="15" fill={isNightMode ? "#162035" : "#D9CEBC"} />
          <rect x="40" y="45" width="160" height="60" rx="4" fill={isNightMode ? "#34221D" : "#F7E6D0"} stroke={isNightMode ? "#54332B" : "#C4A687"} strokeWidth="2" />
          <path d="M 60 45 Q 120 10 180 45 Z" fill={accentColor} />
          <circle cx="120" cy="10" r="5" fill="#F3A228" />
          <path d="M 120 5 L 120 0" stroke="#F3A228" strokeWidth="2" />
          <line x1="45" y1="45" x2="195" y2="45" stroke="#94331C" strokeWidth="3" />
          <circle cx="80" cy="50" r="3" fill="#F3A228" />
          <circle cx="120" cy="50" r="3" fill="#F3A228" />
          <circle cx="160" cy="50" r="3" fill="#F3A228" />
          <path d="M 70 105 L 70 70 Q 90 60 110 70 L 110 105 Z" fill={isNightMode ? "#1E1210" : "#D95C3F"} />
          <path d="M 130 105 L 130 70 Q 150 60 170 70 L 170 105 Z" fill={isNightMode ? "#1E1210" : "#F3A228"} />
          <ellipse cx="90" cy="98" rx="8" ry="4" fill="#FFA500" />
          <ellipse cx="90" cy="98" rx="4" ry="2" fill="#FFE082" />
          <ellipse cx="28" cy="100" rx="10" ry="7" fill="#C2593F" />
          <ellipse cx="212" cy="100" rx="10" ry="7" fill="#E5A93C" />
        </svg>
      );

    case 'asian-street':
      return (
        <svg viewBox="0 0 240 120" className="w-full h-full max-h-36 drop-shadow-sm select-none" fill="none">
          <rect x="0" y="105" width="240" height="15" fill={isNightMode ? "#162035" : "#D9CEBC"} />
          <rect x="50" y="52" width="140" height="53" rx="3" fill={isNightMode ? "#281D1F" : "#F8EBD9"} stroke={isNightMode ? "#482F33" : "#BFA38A"} strokeWidth="2" />
          <path d="M 25 52 Q 120 30 215 52 L 200 42 Q 120 22 40 42 Z" fill="#991B1B" />
          <path d="M 45 35 Q 120 18 195 35 L 180 25 Q 120 10 60 25 Z" fill="#7F1D1D" />
          <g>
            <circle cx="48" cy="65" r="7" fill="#DC2626" />
            <line x1="48" y1="52" x2="48" y2="58" stroke="#FDE047" strokeWidth="2" />
            <line x1="48" y1="72" x2="48" y2="78" stroke="#FDE047" strokeWidth="1.5" />
            {isNightMode && <circle cx="48" cy="65" r="12" fill="#F87171" opacity="0.3" />}
          </g>
          <g>
            <circle cx="192" cy="65" r="7" fill="#DC2626" />
            <line x1="192" y1="52" x2="192" y2="58" stroke="#FDE047" strokeWidth="2" />
            <line x1="192" y1="72" x2="192" y2="78" stroke="#FDE047" strokeWidth="1.5" />
            {isNightMode && <circle cx="192" cy="65" r="12" fill="#F87171" opacity="0.3" />}
          </g>
          <rect x="95" y="70" width="50" height="35" fill={isNightMode ? "#3D2B22" : "#FFF7ED"} stroke="#78350F" strokeWidth="2" />
          <line x1="120" y1="70" x2="120" y2="105" stroke="#78350F" strokeWidth="1.5" />
          <line x1="95" y1="87" x2="145" y2="87" stroke="#78350F" strokeWidth="1" />
          <rect x="100" y="56" width="40" height="10" rx="2" fill="#B45309" />
          <text x="120" y="64" textAnchor="middle" fill="#FEF3C7" fontSize="7" fontWeight="bold" fontFamily="monospace">RAMEN</text>
        </svg>
      );

    case 'little-italy':
      return (
        <svg viewBox="0 0 240 120" className="w-full h-full max-h-36 drop-shadow-sm select-none" fill="none">
          <rect x="0" y="105" width="240" height="15" fill={isNightMode ? "#162035" : "#D9CEBC"} />
          <rect x="45" y="40" width="150" height="65" rx="3" fill={isNightMode ? "#2C2B22" : "#FFFBEB"} stroke={isNightMode ? "#484334" : "#D1BCA0"} strokeWidth="2" />
          <polygon points="35,40 120,15 205,40" fill="#C86D51" stroke="#9C442B" strokeWidth="2" />
          <path d="M 65 65 L 175 65 L 170 78 L 70 78 Z" fill="#15803D" />
          <path d="M 80 65 L 90 65 L 87 78 L 77 78 Z" fill="#F8FAFC" />
          <path d="M 105 65 L 115 65 L 112 78 L 102 78 Z" fill="#F8FAFC" />
          <path d="M 130 65 L 140 65 L 137 78 L 127 78 Z" fill="#F8FAFC" />
          <path d="M 155 65 L 165 65 L 162 78 L 152 78 Z" fill="#F8FAFC" />
          <path d="M 75 92 Q 75 84 82 84 Q 90 84 90 92 L 90 105 L 75 105 Z" fill={isNightMode ? "#FEF08A" : "#FDE047"} fillOpacity={isNightMode ? "0.9" : "0.5"} />
          <path d="M 150 92 Q 150 84 157 84 Q 165 84 165 92 L 165 105 L 150 105 Z" fill={isNightMode ? "#FEF08A" : "#FDE047"} fillOpacity={isNightMode ? "0.9" : "0.5"} />
          <rect x="105" y="80" width="30" height="25" rx="1" fill="#78350F" />
          <ellipse cx="25" cy="85" rx="12" ry="18" fill="#166534" />
          <rect x="23" y="98" width="4" height="8" fill="#5A3A22" />
          <rect x="210" y="93" width="14" height="12" rx="2" fill="#854D0E" />
        </svg>
      );

    case 'mexican-plaza':
      return (
        <svg viewBox="0 0 240 120" className="w-full h-full max-h-36 drop-shadow-sm select-none" fill="none">
          <rect x="0" y="105" width="240" height="15" fill={isNightMode ? "#162035" : "#D9CEBC"} />
          <rect x="50" y="42" width="140" height="63" rx="5" fill={isNightMode ? "#33221C" : "#FDE68A"} stroke={isNightMode ? "#533328" : "#D97706"} strokeWidth="2" />
          <path d="M 45 42 L 80 42 L 80 32 L 160 32 L 160 42 L 195 42" stroke="#EA580C" strokeWidth="4" />
          <path d="M 40 30 Q 120 40 200 30" stroke="#0D9488" strokeWidth="1" strokeDasharray="3 2" />
          <polygon points="65,33 75,34 70,43" fill="#E11D48" />
          <polygon points="95,35 105,35 100,45" fill="#F59E0B" />
          <polygon points="125,35 135,35 130,45" fill="#10B981" />
          <polygon points="155,34 165,33 160,43" fill="#3B82F6" />
          <path d="M 95 105 L 95 72 Q 120 58 145 72 L 145 105 Z" fill={isNightMode ? "#1E1410" : "#7C2D12"} />
          <path d="M 25 105 L 25 75 Q 25 70 29 70 Q 33 70 33 75 L 33 105" fill="#059669" stroke="#065F46" strokeWidth="1.5" />
          <path d="M 20 85 L 25 85" stroke="#065F46" strokeWidth="2" />
          <path d="M 33 80 L 38 80" stroke="#065F46" strokeWidth="2" />
          <circle cx="120" cy="50" r="6" fill="#F59E0B" />
        </svg>
      );

    case 'dessert-lane':
      return (
        <svg viewBox="0 0 240 120" className="w-full h-full max-h-36 drop-shadow-sm select-none" fill="none">
          <rect x="0" y="105" width="240" height="15" fill={isNightMode ? "#162035" : "#D9CEBC"} />
          <rect x="50" y="45" width="140" height="60" rx="6" fill={isNightMode ? "#2E1C28" : "#FDF2F8"} stroke={isNightMode ? "#542D45" : "#F472B6"} strokeWidth="2" />
          <path d="M 40 45 Q 120 18 200 45 Z" fill="#F472B6" />
          <circle cx="120" cy="22" r="5" fill="#FB7185" />
          <path d="M 60 62 L 180 62 L 175 75 L 65 75 Z" fill="#FBCFE8" />
          <path d="M 75 62 L 90 62 L 87 75 L 72 75 Z" fill="#A7F3D0" />
          <path d="M 110 62 L 125 62 L 122 75 L 107 75 Z" fill="#A7F3D0" />
          <path d="M 145 62 L 160 62 L 157 75 L 142 75 Z" fill="#A7F3D0" />
          <rect x="68" y="80" width="45" height="25" rx="3" fill={isNightMode ? "#4A2B3D" : "#FFF"} stroke="#F472B6" strokeWidth="1.5" />
          <circle cx="82" cy="94" r="5" fill="#F43F5E" />
          <circle cx="98" cy="94" r="5" fill="#38BDF8" />
          <rect x="130" y="75" width="30" height="30" rx="2" fill={isNightMode ? "#3B2232" : "#FCE7F3"} stroke="#DB2777" strokeWidth="1.5" />
          <g>
            <ellipse cx="28" cy="100" rx="8" ry="3" fill="#F472B6" />
            <ellipse cx="28" cy="95" rx="7" ry="3" fill="#A7F3D0" />
            <ellipse cx="28" cy="90" rx="6" ry="3" fill="#FDE047" />
          </g>
        </svg>
      );

    case 'burger-avenue':
      return (
        <svg viewBox="0 0 240 120" className="w-full h-full max-h-36 drop-shadow-sm select-none" fill="none">
          <rect x="0" y="105" width="240" height="15" fill={isNightMode ? "#162035" : "#D9CEBC"} />
          <rect x="45" y="48" width="150" height="57" rx="8" fill={isNightMode ? "#282B33" : "#F3F4F6"} stroke={isNightMode ? "#454B57" : "#9CA3AF"} strokeWidth="2" />
          <rect x="80" y="24" width="80" height="22" rx="4" fill="#B91C1C" stroke="#FBBF24" strokeWidth="2" />
          <text x="120" y="38" textAnchor="middle" fill="#FEF08A" fontSize="9" fontWeight="800" fontFamily="sans-serif">
            DINER ★ 66
          </text>
          <rect x="45" y="65" width="150" height="6" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1" />
          <rect x="58" y="75" width="70" height="24" rx="3" fill={isNightMode ? "#FEF08A" : "#DBEAFE"} fillOpacity={isNightMode ? "0.8" : "0.7"} stroke="#9CA3AF" strokeWidth="1.5" />
          <line x1="82" y1="75" x2="82" y2="99" stroke="#9CA3AF" strokeWidth="1" />
          <line x1="104" y1="75" x2="104" y2="99" stroke="#9CA3AF" strokeWidth="1" />
          <rect x="142" y="73" width="32" height="32" rx="2" fill={isNightMode ? "#333A48" : "#E5E7EB"} stroke="#6B7280" strokeWidth="1.5" />
          <ellipse cx="215" cy="85" rx="6" ry="12" fill="#EC4899" />
          <line x1="215" y1="70" x2="222" y2="60" stroke="#FDE047" strokeWidth="2" />
        </svg>
      );

    default:
      return null;
  }
};
