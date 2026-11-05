import React from 'react';
import { Package, RotateCcw, ShoppingCart, ChefHat, User, Flame } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export type AppTab = 'pantry' | 'buyList' | 'recipes' | 'profile';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onResetDemoData: () => void;
  criticalCount: number;
  pendingBuyCount: number;
  streakDays: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onResetDemoData,
  criticalCount,
  pendingBuyCount,
  streakDays,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single Wordmark */}
        <div
          onClick={() => setActiveTab('pantry')}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
            <Package className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Smart Pantry
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
              Expiry & Waste Tracker
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line controls) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab('pantry')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-600 cursor-pointer ${
              activeTab === 'pantry' ? 'text-emerald-600 dark:text-emerald-400' : ''
            }`}
          >
            Pantry Inventory
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('buyList')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-600 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'buyList' ? 'text-emerald-600 dark:text-emerald-400' : ''
            }`}
          >
            <span>Need to Buy</span>
            {pendingBuyCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 tabular-nums">
                {pendingBuyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recipes')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-600 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'recipes' ? 'text-emerald-600 dark:text-emerald-400' : ''
            }`}
          >
            <span>Cook Simulator</span>
            {criticalCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-emerald-600 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'text-emerald-600 dark:text-emerald-400' : ''
            }`}
          >
            <User className="w-4 h-4" />
            <span>Health & Profile</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Zero-waste streak badge, PWA install & demo reset) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Flame Anti-Expiry Streak Counter */}
          <div
            onClick={() => setActiveTab('pantry')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40 transition shrink-0"
            title="Zero-Waste Streak (Days without expired items)"
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span className="tabular-nums font-black">{streakDays}d</span>
            <span className="hidden sm:inline font-semibold text-[11px] text-amber-700 dark:text-amber-400">Streak</span>
          </div>

          <button
            type="button"
            onClick={onResetDemoData}
            className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to Initial Demo State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </button>

          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
