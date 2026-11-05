/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header, AppTab } from './components/Header';
import { HeroActionDashboard } from './components/HeroActionDashboard';
import { QuickAddGrid } from './components/QuickAddGrid';
import { PantryListView } from './components/PantryListView';
import { RecipeSimulator } from './components/RecipeSimulator';
import { BuyListView } from './components/BuyListView';
import { ProfileView } from './components/ProfileView';
import { VoiceInputModal } from './components/VoiceInputModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PantryItem, PresetItem, Recipe, FoodCategory, BuyListItem, UserProfile, StreakData } from './types/pantry';
import { PRESET_ITEMS, getInitialPantryItems, getInitialBuyListItems, DEFAULT_USER_PROFILE, DEFAULT_STREAK_DATA } from './data/presetData';
import { getDateWithOffset, getUrgencyLevel, getDaysRemaining } from './utils/dateUtils';
import { ZeroWasteStreakCard } from './components/ZeroWasteStreakCard';
import { Package, ChefHat, Mic, ShoppingCart, User, AlertTriangle } from 'lucide-react';

const STORAGE_KEY_PANTRY = 'smart_pantry_items_v3';
const STORAGE_KEY_BUYLIST = 'smart_pantry_buylist_v3';
const STORAGE_KEY_PROFILE = 'smart_pantry_profile_v3';
const STORAGE_KEY_STREAK = 'smart_pantry_streak_v3';

export default function App() {
  // Pantry inventory state
  const [items, setItems] = useState<PantryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PANTRY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return getInitialPantryItems();
  });

  // Need to Buy list state
  const [buyList, setBuyList] = useState<BuyListItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUYLIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return getInitialBuyListItems();
  });

  // User Profile state
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_USER_PROFILE;
  });

  // Zero-Waste Anti-Expiry Streak state
  const [streak, setStreak] = useState<StreakData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STREAK);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.currentStreakDays === 'number') return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_STREAK_DATA;
  });

  const [activeTab, setActiveTab] = useState<AppTab>('pantry');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Local storage persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PANTRY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUYLIST, JSON.stringify(buyList));
    } catch {
      // ignore
    }
  }, [buyList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(streak));
    } catch {
      // ignore
    }
  }, [streak]);

  const addToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add Item via Hero text or Voice input
  const handleAddItem = (newItem: Omit<PantryItem, 'id'>) => {
    const item: PantryItem = {
      ...newItem,
      id: 'item-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
    };

    setItems((prev) => [item, ...prev]);
    addToast(`Added ${item.name} to pantry`, 'success');
  };

  // 1-Tap Quick Presets Injection
  const handleAddPreset = (preset: PresetItem) => {
    const newItem: PantryItem = {
      id: 'preset-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
      name: preset.name,
      category: preset.category,
      addedAt: new Date().toISOString(),
      expiresAt: getDateWithOffset(preset.defaultDays),
      quantity: 1,
      unit: preset.unit,
    };

    setItems((prev) => [newItem, ...prev]);
    addToast(`Added ${preset.name} (+${preset.defaultDays} days)`, 'success');
  };

  // MARK AS USED / FINISHED -> Directly moves to "Need to Buy" list!
  const handleMarkAsUsed = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    // Remove from active pantry
    setItems((prev) => prev.filter((i) => i.id !== id));

    // Directly add to Need to Buy list
    const buyItem: BuyListItem = {
      id: 'buy-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
      name: target.name,
      category: target.category,
      quantity: 1,
      unit: target.unit || 'item',
      reason: 'finished',
      addedAt: new Date().toISOString(),
      isBought: false,
    };

    setBuyList((prev) => [buyItem, ...prev]);
    handleRecordFoodSaved(target.name);
    addToast(`Marked ${target.name} as used up. Added to Need to Buy list! 🛒`, 'success');
  };

  // Helper to record food saved and advance zero-waste streak
  const handleRecordFoodSaved = (foodName: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setStreak((prev) => {
      const alreadyLoggedToday = prev.historyDates.includes(todayStr);
      const newStreak = alreadyLoggedToday ? prev.currentStreakDays : prev.currentStreakDays + 1;
      const newLongest = Math.max(prev.longestStreakDays, newStreak);
      const newHistory = alreadyLoggedToday ? prev.historyDates : [...prev.historyDates, todayStr];

      return {
        ...prev,
        currentStreakDays: newStreak,
        longestStreakDays: newLongest,
        totalItemsSaved: prev.totalItemsSaved + 1,
        lastSavedDate: todayStr,
        historyDates: newHistory,
        moneySavedEstimate: parseFloat((prev.moneySavedEstimate + 2.85).toFixed(2)),
        co2SavedKg: parseFloat((prev.co2SavedKg + 0.45).toFixed(1)),
      };
    });
  };

  // Mark as Consumed -> Advances streak!
  const handleConsumeItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) => prev.filter((i) => i.id !== id));
    handleRecordFoodSaved(item.name);
    addToast(`Consumed ${item.name}! Saved from waste · 🔥 Streak extended!`, 'success');
  };

  // Remove / Trash item (if expired, resets streak and adds to Need to Buy list)
  const handleRemoveItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const days = getDaysRemaining(item.expiresAt);
    const isExpired = days <= 0;
    const isCritical = days === 1;

    setItems((prev) => prev.filter((i) => i.id !== id));

    if (isExpired) {
      // Break streak because item actually expired!
      setStreak((prev) => ({
        ...prev,
        currentStreakDays: 0,
      }));

      const buyItem: BuyListItem = {
        id: 'buy-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
        name: item.name,
        category: item.category,
        quantity: 1,
        unit: item.unit || 'item',
        reason: 'expired',
        addedAt: new Date().toISOString(),
        isBought: false,
      };
      setBuyList((prev) => [buyItem, ...prev]);
      addToast(`Expired ${item.name} trashed! Zero-waste streak reset. Start fresh today!`, 'warning');
    } else if (isCritical) {
      const buyItem: BuyListItem = {
        id: 'buy-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
        name: item.name,
        category: item.category,
        quantity: 1,
        unit: item.unit || 'item',
        reason: 'expired',
        addedAt: new Date().toISOString(),
        isBought: false,
      };
      setBuyList((prev) => [buyItem, ...prev]);
      addToast(`Removed ${item.name}. Added to Need to Buy list! 🛒`, 'info');
    } else {
      addToast(`Removed ${item.name} from pantry`, 'info');
    }
  };

  // Update item quantity
  const handleUpdateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) {
              // Item finished! Automatically add to buy list
              const buyItem: BuyListItem = {
                id: 'buy-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
                name: item.name,
                category: item.category,
                quantity: 1,
                unit: item.unit || 'item',
                reason: 'finished',
                addedAt: new Date().toISOString(),
                isBought: false,
              };
              setBuyList((b) => [buyItem, ...b]);
              addToast(`${item.name} finished! Added to Need to Buy list.`, 'info');
              return null;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as PantryItem[]
    );
  };

  // Buy List actions
  const handleToggleBought = (id: string) => {
    setBuyList((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isBought: !i.isBought } : i))
    );
  };

  const handleRemoveBuyItem = (id: string) => {
    setBuyList((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddBuyItem = (name: string, category: FoodCategory, quantity: number, unit: string) => {
    const item: BuyListItem = {
      id: 'buy-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
      name,
      category,
      quantity,
      unit,
      reason: 'manual',
      addedAt: new Date().toISOString(),
      isBought: false,
    };
    setBuyList((prev) => [item, ...prev]);
    addToast(`Added ${name} to shopping list`, 'success');
  };

  // Restock bought item directly into the active pantry with smart default expiry offset
  const handleRestockToPantry = (buyItem: BuyListItem) => {
    let offsetDays = 7;
    const lower = buyItem.name.toLowerCase();

    if (lower.includes('bread') || lower.includes('bagel') || lower.includes('toast')) {
      offsetDays = 4;
    } else if (lower.includes('chicken') || lower.includes('fish') || lower.includes('meat')) {
      offsetDays = 2;
    } else if (lower.includes('tomato') || lower.includes('produce') || lower.includes('spinach')) {
      offsetDays = 5;
    } else if (lower.includes('egg')) {
      offsetDays = 14;
    } else if (lower.includes('yogurt')) {
      offsetDays = 10;
    } else if (lower.includes('milk')) {
      offsetDays = 7;
    }

    const newPantryItem: PantryItem = {
      id: 'restock-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
      name: buyItem.name,
      category: buyItem.category,
      addedAt: new Date().toISOString(),
      expiresAt: getDateWithOffset(offsetDays),
      quantity: buyItem.quantity || 1,
      unit: buyItem.unit || 'item',
    };

    setItems((prev) => [newPantryItem, ...prev]);
    setBuyList((prev) => prev.filter((i) => i.id !== buyItem.id));
    addToast(`Restocked ${buyItem.name} into pantry! (+${offsetDays} days)`, 'success');
  };

  const handleClearBought = () => {
    setBuyList((prev) => prev.filter((i) => !i.isBought));
    addToast('Cleared bought items from list', 'info');
  };

  // Cook recipe action: deducts matching ingredients from pantry
  const handleCookRecipe = (recipe: Recipe) => {
    const finishedItems: string[] = [];

    setItems((prev) => {
      const updated = [...prev];
      recipe.requiredIngredients.forEach((req) => {
        const matchIdx = updated.findIndex((it) => {
          const lower = it.name.toLowerCase();
          return lower.includes(req) || req.includes(lower);
        });

        if (matchIdx !== -1) {
          const item = updated[matchIdx];
          if (item.quantity > 1) {
            updated[matchIdx] = { ...item, quantity: item.quantity - 1 };
          } else {
            finishedItems.push(item.name);
            updated.splice(matchIdx, 1);
          }
        }
      });
      return updated;
    });

    // If items were finished during cooking, offer/add them to buy list
    if (finishedItems.length > 0) {
      finishedItems.forEach((name) => {
        const buyItem: BuyListItem = {
          id: 'buy-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
          name,
          category: 'other',
          quantity: 1,
          unit: 'item',
          reason: 'finished',
          addedAt: new Date().toISOString(),
          isBought: false,
        };
        setBuyList((b) => [buyItem, ...b]);
      });
      handleRecordFoodSaved(recipe.title);
      addToast(`Cooked ${recipe.title}! Finished items added to Need to Buy list · 🔥 Streak boosted!`, 'success');
    } else {
      handleRecordFoodSaved(recipe.title);
      addToast(`Cooked ${recipe.title}! Ingredients deducted from pantry · 🔥 Streak boosted!`, 'success');
    }
  };

  // Reset demo
  const handleResetDemoData = () => {
    setItems(getInitialPantryItems());
    setBuyList(getInitialBuyListItems());
    setProfile(DEFAULT_USER_PROFILE);
    setStreak(DEFAULT_STREAK_DATA);
    addToast('Reset to exhibition demo inventory & profile', 'info');
  };

  const criticalCount = useMemo(() => {
    return items.filter((it) => getUrgencyLevel(it.expiresAt) === 'critical').length;
  }, [items]);

  const pendingBuyCount = useMemo(() => {
    return buyList.filter((it) => !it.isBought).length;
  }, [buyList]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col antialiased pb-24 md:pb-12">
      {/* Toast feedback alerts */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Connectivity Banner */}
      <OfflineIndicator />

      {/* Top App Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetDemoData={handleResetDemoData}
        criticalCount={criticalCount}
        pendingBuyCount={pendingBuyCount}
        streakDays={streak.currentStreakDays}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {/* Critical Expiry Alert Banner (if any critical items) */}
        {criticalCount > 0 && activeTab === 'pantry' && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-100">
                  {criticalCount} {criticalCount === 1 ? 'item needs' : 'items need'} immediate attention
                </h3>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                  Items like Fresh Chicken expire soonest! The recipe simulator prioritizes them to prevent food waste.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('recipes')}
              className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:text-rose-900 underline whitespace-nowrap cursor-pointer shrink-0"
            >
              Prioritized Recipes &rarr;
            </button>
          </div>
        )}

        {/* Tab 1: Active Pantry View with Hero Dashboard, Presets & Expiry Tracker */}
        {activeTab === 'pantry' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 1. HERO & ACTION DASHBOARD */}
            <section aria-label="Hero and Action Dashboard">
              <HeroActionDashboard
                onAddItem={handleAddItem}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              />
            </section>

            {/* 2. QUICK-ADD PRESETS GRID */}
            <section aria-label="Quick-Add Presets Grid">
              <QuickAddGrid onAddPreset={handleAddPreset} />
            </section>

            {/* ZERO-WASTE ANTI-EXPIRY STREAK TRACKER */}
            <section aria-label="Zero-Waste Streak Tracker">
              <ZeroWasteStreakCard
                streak={streak}
                items={items}
                onOpenRecipes={() => setActiveTab('recipes')}
              />
            </section>

            {/* 3. ACTIVE PANTRY LIST */}
            <section aria-label="Active Pantry Inventory">
              <PantryListView
                items={items}
                onRemoveItem={handleRemoveItem}
                onConsumeItem={handleConsumeItem}
                onMarkAsUsed={handleMarkAsUsed}
                onUpdateQuantity={handleUpdateQuantity}
              />
            </section>

            {/* Shortcut banner to Cook Simulator */}
            <section aria-label="Culinary Suggestions Preview" className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <RecipeSimulator
                items={items}
                profile={profile}
                onCookRecipe={handleCookRecipe}
              />
            </section>
          </div>
        )}

        {/* Tab 2: Need to Buy / Smart Grocery List */}
        {activeTab === 'buyList' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <BuyListView
              buyList={buyList}
              onToggleBought={handleToggleBought}
              onRemoveBuyItem={handleRemoveBuyItem}
              onAddBuyItem={handleAddBuyItem}
              onRestockToPantry={handleRestockToPantry}
              onClearBought={handleClearBought}
            />
          </div>
        )}

        {/* Tab 3: Dedicated "What Can I Cook?" Simulator */}
        {activeTab === 'recipes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <RecipeSimulator
              items={items}
              profile={profile}
              onCookRecipe={handleCookRecipe}
            />
          </div>
        )}

        {/* Tab 4: User Health & Dietary Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ProfileView
              profile={profile}
              streak={streak}
              onUpdateProfile={setProfile}
              onShowToast={(msg) => addToast(msg, 'success')}
            />
          </div>
        )}
      </main>

      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onAddItem={handleAddItem}
      />

      {/* Mobile Ergonomic Bottom Tab Bar (Pattern 1 from Mobile Touch Design Reference) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe md:hidden">
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {/* 1. Pantry */}
          <button
            type="button"
            onClick={() => setActiveTab('pantry')}
            className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
              activeTab === 'pantry'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Package className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] mt-1 tracking-tight">Pantry ({items.length})</span>
          </button>

          {/* 2. Buy List */}
          <button
            type="button"
            onClick={() => setActiveTab('buyList')}
            className={`flex flex-col items-center justify-center h-full transition-colors relative cursor-pointer ${
              activeTab === 'buyList'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] mt-1 tracking-tight">To Buy</span>
            {pendingBuyCount > 0 && (
              <span className="absolute top-2 right-4 text-[9px] font-bold px-1 rounded-full bg-emerald-600 text-white tabular-nums">
                {pendingBuyCount}
              </span>
            )}
          </button>

          {/* 3. Center Voice Action Button */}
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 group-active:scale-95 transition-transform">
              <Mic className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">Voice</span>
          </button>

          {/* 4. Recipes */}
          <button
            type="button"
            onClick={() => setActiveTab('recipes')}
            className={`flex flex-col items-center justify-center h-full transition-colors relative cursor-pointer ${
              activeTab === 'recipes'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <ChefHat className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] mt-1 tracking-tight">Recipes</span>
            {criticalCount > 0 && (
              <span className="absolute top-2.5 right-4 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* 5. Profile */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center h-full transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <User className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] mt-1 tracking-tight">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
