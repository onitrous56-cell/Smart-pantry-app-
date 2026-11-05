import React, { useState } from 'react';
import { Flame, Trophy, ShieldCheck, DollarSign, Leaf, Sparkles, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { StreakData, PantryItem } from '../types/pantry';
import { getDaysRemaining } from '../utils/dateUtils';

interface ZeroWasteStreakCardProps {
  streak: StreakData;
  items: PantryItem[];
  onOpenRecipes: () => void;
}

export const ZeroWasteStreakCard: React.FC<ZeroWasteStreakCardProps> = ({
  streak,
  items,
  onOpenRecipes,
}) => {
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);

  // Check for critical items (<= 1 day left) that put the streak at risk
  const criticalItem = items.find((item) => {
    const days = getDaysRemaining(item.expiresAt);
    return days <= 1 && days >= 0;
  });

  // Next milestone calculation
  const nextMilestoneDays = streak.currentStreakDays < 7 ? 7 : streak.currentStreakDays < 14 ? 14 : streak.currentStreakDays < 30 ? 30 : 50;
  const progressPercent = Math.min(100, Math.round((streak.currentStreakDays / nextMilestoneDays) * 100));

  // Past 7 days day letters
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <>
      <div className="w-full rounded-3xl bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-amber-950/30 dark:via-emerald-950/30 dark:to-teal-950/20 border border-amber-200/80 dark:border-amber-800/60 p-4 sm:p-5 shadow-xs relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          {/* Left: Flame Icon & Streak Headline */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0 animate-in zoom-in">
              <Flame className="w-7 h-7 fill-white stroke-[2]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  <span className="tabular-nums">{streak.currentStreakDays} Days</span> Zero-Waste Streak!
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300">
                  Best: {streak.longestStreakDays}d
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                No food has expired in {streak.currentStreakDays} days · {streak.totalItemsSaved} groceries rescued in time
              </p>
            </div>
          </div>

          {/* Right: Quick impact summary & View Milestones */}
          <div className="flex items-center gap-2 sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setShowMilestonesModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white text-slate-800 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Milestones</span>
            </button>
          </div>
        </div>

        {/* Impact strip */}
        <div className="mt-3.5 pt-3 border-t border-amber-200/60 dark:border-amber-800/50 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Estimated Saved</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              ${streak.moneySavedEstimate.toFixed(2)}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Items Rescued</span>
            <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
              {streak.totalItemsSaved} items
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">CO₂ Kept Out</span>
            <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
              {streak.co2SavedKg} kg
            </span>
          </div>
        </div>

        {/* Streak Alert or Motivation */}
        {criticalItem ? (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-300 dark:border-rose-900/80 flex items-center justify-between gap-2 text-xs text-rose-800 dark:text-rose-200">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate">
                <strong>Protect your streak:</strong> {criticalItem.name} expires soon!
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenRecipes}
              className="text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Cook Now</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Next goal: {nextMilestoneDays}-Day Zero-Waste Master ({streak.currentStreakDays}/{nextMilestoneDays} days)</span>
            </span>
            <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Milestones & Achievements Modal */}
      {showMilestonesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setShowMilestonesModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Zero-Waste Badges
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track your anti-expiry achievements
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
                streak.currentStreakDays >= 3
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 opacity-60'
              }`}>
                <span className="text-2xl">🌱</span>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">3-Day Habit Starter</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">No expired items for 3 consecutive days</p>
                </div>
                {streak.currentStreakDays >= 3 && <span className="text-xs font-bold text-emerald-600">Unlocked!</span>}
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
                streak.currentStreakDays >= 7
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 opacity-70'
              }`}>
                <span className="text-2xl">🔥</span>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">7-Day Zero-Waste Champion</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Full week of 100% consumed groceries</p>
                </div>
                {streak.currentStreakDays >= 7 ? (
                  <span className="text-xs font-bold text-emerald-600">Unlocked!</span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-600">{streak.currentStreakDays}/7 days</span>
                )}
              </div>

              <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
                streak.currentStreakDays >= 14
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 opacity-50'
              }`}>
                <span className="text-2xl">👑</span>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Fortnight Kitchen Master</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">14 straight days without letting food expire</p>
                </div>
                {streak.currentStreakDays >= 14 ? (
                  <span className="text-xs font-bold text-emerald-600">Unlocked!</span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400">{streak.currentStreakDays}/14</span>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowMilestonesModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
            >
              Keep Saving Food
            </button>
          </div>
        </div>
      )}
    </>
  );
};
