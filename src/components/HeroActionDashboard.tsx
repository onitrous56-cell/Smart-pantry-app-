import React, { useState } from 'react';
import { Mic, Plus, Calendar, Clock, Sparkles } from 'lucide-react';
import { getDateWithOffset, formatCalendarDate } from '../utils/dateUtils';
import { PantryItem, FoodCategory } from '../types/pantry';

interface HeroActionDashboardProps {
  onAddItem: (item: Omit<PantryItem, 'id'>) => void;
  onOpenVoiceModal: () => void;
}

interface DateBadgeOption {
  label: string;
  days: number;
}

const DATE_BADGES: DateBadgeOption[] = [
  { label: '+2 Days', days: 2 },
  { label: '+5 Days', days: 5 },
  { label: '+1 Week', days: 7 },
  { label: '+1 Month', days: 30 },
  { label: '+6 Months', days: 180 },
  { label: '+1 Year', days: 365 },
];

export const HeroActionDashboard: React.FC<HeroActionDashboardProps> = ({
  onAddItem,
  onOpenVoiceModal,
}) => {
  const [itemName, setItemName] = useState('');
  const [selectedDays, setSelectedDays] = useState<number>(5); // default to 5 days
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [customDateValue, setCustomDateValue] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });

  const activeExpiryIso = isCustomDate
    ? new Date(customDateValue + 'T23:59:59').toISOString()
    : getDateWithOffset(selectedDays);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = itemName.trim();
    if (!trimmed) return;

    // Detect category heuristic
    const lower = trimmed.toLowerCase();
    let category: FoodCategory = 'other';
    if (lower.includes('milk') || lower.includes('yogurt') || lower.includes('cheese') || lower.includes('egg') || lower.includes('butter') || lower.includes('cream')) {
      category = 'dairy';
    } else if (lower.includes('bread') || lower.includes('bagel') || lower.includes('toast') || lower.includes('bun') || lower.includes('croissant') || lower.includes('pita')) {
      category = 'bakery';
    } else if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') || lower.includes('salmon') || lower.includes('fish') || lower.includes('steak') || lower.includes('meat') || lower.includes('turkey')) {
      category = 'meat';
    } else if (lower.includes('tomato') || lower.includes('apple') || lower.includes('banana') || lower.includes('salad') || lower.includes('spinach') || lower.includes('onion') || lower.includes('potato') || lower.includes('avocado') || lower.includes('lemon')) {
      category = 'produce';
    } else if (lower.includes('pasta') || lower.includes('rice') || lower.includes('cereal') || lower.includes('bean') || lower.includes('flour') || lower.includes('sugar') || lower.includes('oat')) {
      category = 'pantry';
    }

    onAddItem({
      name: trimmed,
      category,
      addedAt: new Date().toISOString(),
      expiresAt: activeExpiryIso,
      quantity: 1,
      unit: 'item',
    });

    setItemName('');
  };

  const handleSelectBadge = (days: number) => {
    setSelectedDays(days);
    setIsCustomDate(false);
  };

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm border border-slate-200/90 dark:border-slate-800 transition-all">
      {/* Header kicker */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <Sparkles className="w-4 h-4" />
          <span>Quick Entry Dashboard</span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          Target Expiry: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{formatCalendarDate(activeExpiryIso)}</strong>
        </span>
      </div>

      {/* Main Input + Microphone Action Row */}
      <form onSubmit={handleSubmit} className="flex items-stretch gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="What did you buy?"
            className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 px-4 text-base md:text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 dark:focus:border-emerald-500 transition-all"
          />
          {itemName && (
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>

        {/* Large Microphone Icon styled as "Voice Input" button */}
        <button
          type="button"
          onClick={onOpenVoiceModal}
          className="h-14 w-14 min-w-[56px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white flex flex-col items-center justify-center shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer group"
          title="Voice Input (Speech-to-Text)"
          aria-label="Voice Input"
        >
          <Mic className="w-6 h-6 stroke-[2.3] group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-bold uppercase tracking-tight mt-0.5">Voice</span>
        </button>
      </form>

      {/* Quick Date Badges Row */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quick Expiry Badges</span>
          </div>
          {isCustomDate && (
            <button
              type="button"
              onClick={() => setIsCustomDate(false)}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Reset to presets
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {DATE_BADGES.map((badge) => {
            const isSelected = !isCustomDate && selectedDays === badge.days;
            return (
              <button
                key={badge.days}
                type="button"
                onClick={() => handleSelectBadge(badge.days)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80'
                }`}
              >
                <span>{badge.label}</span>
                <span className={`text-[10px] opacity-75 tabular-nums ${isSelected ? 'text-slate-300 dark:text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  ({formatCalendarDate(getDateWithOffset(badge.days))})
                </span>
              </button>
            );
          })}

          {/* Custom Date Selector */}
          <div className="relative">
            <label
              htmlFor="custom-date-input"
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isCustomDate
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Custom Date</span>
            </label>
            <input
              id="custom-date-input"
              type="date"
              value={customDateValue}
              onChange={(e) => {
                if (e.target.value) {
                  setCustomDateValue(e.target.value);
                  setIsCustomDate(true);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
