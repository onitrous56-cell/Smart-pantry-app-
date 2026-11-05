import React, { useState } from 'react';
import { Milk, Wheat, Egg, Apple, Utensils, CupSoda, Plus, Zap, Check } from 'lucide-react';
import { PRESET_ITEMS } from '../data/presetData';
import { PresetItem } from '../types/pantry';

interface QuickAddGridProps {
  onAddPreset: (preset: PresetItem) => void;
}

export const QuickAddGrid: React.FC<QuickAddGridProps> = ({ onAddPreset }) => {
  const [recentlyTappedId, setRecentlyTappedId] = useState<string | null>(null);

  const handleTap = (preset: PresetItem) => {
    setRecentlyTappedId(preset.id);
    onAddPreset(preset);
    setTimeout(() => {
      setRecentlyTappedId((prev) => (prev === preset.id ? null : prev));
    }, 700);
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Milk':
        return <Milk className="w-6 h-6 stroke-[2]" />;
      case 'Wheat':
        return <Wheat className="w-6 h-6 stroke-[2]" />;
      case 'Egg':
        return <Egg className="w-6 h-6 stroke-[2]" />;
      case 'Apple':
        return <Apple className="w-6 h-6 stroke-[2]" />;
      case 'Utensils':
        return <Utensils className="w-6 h-6 stroke-[2]" />;
      case 'CupSoda':
        return <CupSoda className="w-6 h-6 stroke-[2]" />;
      default:
        return <Zap className="w-6 h-6 stroke-[2]" />;
    }
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>1-Tap Quick Presets</span>
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Tapping any card instantly logs the item with automated smart expiry
          </p>
        </div>
        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 hidden sm:inline-block">
          Auto Expiry Calculated
        </span>
      </div>

      {/* Grid of 6 common household essentials */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {PRESET_ITEMS.map((preset) => {
          const isJustAdded = recentlyTappedId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleTap(preset)}
              className={`group relative text-left p-3.5 rounded-2xl border transition-all duration-150 active:scale-95 cursor-pointer flex flex-col justify-between min-h-[105px] overflow-hidden ${
                isJustAdded
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[0.98]'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-sm'
              }`}
            >
              {/* Top Row: Icon + Smart Offset */}
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isJustAdded
                      ? 'bg-white/20 text-white'
                      : `${preset.bgTint} ${preset.color}`
                  }`}
                >
                  {isJustAdded ? (
                    <Check className="w-5 h-5 stroke-[3] animate-in zoom-in" />
                  ) : (
                    getPresetIcon(preset.iconName)
                  )}
                </div>

                {/* Expiry offset pill */}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md tabular-nums ${
                    isJustAdded
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  +{preset.defaultDays}d
                </span>
              </div>

              {/* Bottom Row: Name + tap cue */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold truncate ${isJustAdded ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {preset.name}
                  </span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform ${
                    isJustAdded ? 'bg-white text-emerald-700' : 'text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5'
                  }`}>
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
                <span className={`text-[10px] truncate block ${isJustAdded ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                  {isJustAdded ? 'Added to pantry!' : preset.unit}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
