import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Check,
  Trash2,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Package,
  Milk,
  Wheat,
  Egg,
  Apple,
  Utensils,
  CupSoda,
} from 'lucide-react';
import { BuyListItem, FoodCategory } from '../types/pantry';

interface BuyListViewProps {
  buyList: BuyListItem[];
  onToggleBought: (id: string) => void;
  onRemoveBuyItem: (id: string) => void;
  onAddBuyItem: (name: string, category: FoodCategory, quantity: number, unit: string) => void;
  onRestockToPantry: (item: BuyListItem) => void;
  onClearBought: () => void;
}

export const BuyListView: React.FC<BuyListViewProps> = ({
  buyList,
  onToggleBought,
  onRemoveBuyItem,
  onAddBuyItem,
  onRestockToPantry,
  onClearBought,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('pantry');
  const [filter, setFilter] = useState<'all' | 'pending' | 'bought'>('all');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) return;

    // Detect category heuristic
    const lower = trimmed.toLowerCase();
    let cat: FoodCategory = selectedCategory;
    if (lower.includes('milk') || lower.includes('yogurt') || lower.includes('cheese') || lower.includes('butter')) {
      cat = 'dairy';
    } else if (lower.includes('bread') || lower.includes('bagel') || lower.includes('toast') || lower.includes('flour')) {
      cat = 'bakery';
    } else if (lower.includes('chicken') || lower.includes('beef') || lower.includes('fish') || lower.includes('salmon')) {
      cat = 'meat';
    } else if (lower.includes('tomato') || lower.includes('apple') || lower.includes('spinach') || lower.includes('onion')) {
      cat = 'produce';
    }

    onAddBuyItem(trimmed, cat, 1, 'item');
    setNewItemName('');
  };

  const filteredItems = buyList.filter((item) => {
    if (filter === 'pending') return !item.isBought;
    if (filter === 'bought') return item.isBought;
    return true;
  });

  const pendingCount = buyList.filter((i) => !i.isBought).length;
  const boughtCount = buyList.filter((i) => i.isBought).length;

  const getCategoryIcon = (category: FoodCategory, name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('milk')) return <Milk className="w-4 h-4" />;
    if (lower.includes('bread')) return <Wheat className="w-4 h-4" />;
    if (lower.includes('egg')) return <Egg className="w-4 h-4" />;
    if (lower.includes('tomato') || lower.includes('apple')) return <Apple className="w-4 h-4" />;
    if (lower.includes('chicken') || lower.includes('meat')) return <Utensils className="w-4 h-4" />;
    if (lower.includes('yogurt')) return <CupSoda className="w-4 h-4" />;

    switch (category) {
      case 'dairy':
        return <Milk className="w-4 h-4" />;
      case 'bakery':
        return <Wheat className="w-4 h-4" />;
      case 'produce':
        return <Apple className="w-4 h-4" />;
      case 'meat':
        return <Utensils className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Header & Quick Stats */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 md:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Smart Grocery & Buy List
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Items marked as used, finished, or expired automatically flow here so you never run out
            </p>
          </div>

          {boughtCount > 0 && (
            <button
              onClick={onClearBought}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 transition cursor-pointer self-start sm:self-center"
            >
              Clear {boughtCount} bought {boughtCount === 1 ? 'item' : 'items'}
            </button>
          )}
        </div>

        {/* Quick Add Bar */}
        <form onSubmit={handleAddSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add grocery item to buy list (e.g. Olive Oil, Garlic, Butter)..."
            className="flex-1 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 px-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
          <button
            type="submit"
            className="h-12 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </form>

        {/* Quick Filter tabs */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setFilter('all')}
            className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white dark:bg-emerald-600'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Items ({buyList.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            To Buy ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('bought')}
            className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'bought'
                ? 'bg-slate-900 text-white dark:bg-slate-800'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Bought ({boughtCount})
          </button>
        </div>
      </div>

      {/* Buy List Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <ShoppingCart className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Your shopping list is clear
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            When pantry items run out or expire, they will automatically appear here. You can also add items manually above.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            return (
              <div
                key={item.id}
                className={`group rounded-2xl border p-3.5 sm:p-4 transition-all duration-150 flex items-center justify-between gap-3 ${
                  item.isBought
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-70'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs'
                }`}
              >
                {/* Left: Checkbox & Item details */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleBought(item.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      item.isBought
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                    }`}
                    title={item.isBought ? 'Mark as not bought' : 'Mark as bought'}
                  >
                    {item.isBought && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                    {getCategoryIcon(item.category, item.name)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-bold break-words ${
                          item.isBought
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.name}
                      </span>

                      {/* Source tag badge */}
                      {item.reason === 'finished' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                          Finished / Used
                        </span>
                      )}
                      {item.reason === 'expired' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                          Expired in Pantry
                        </span>
                      )}
                      {item.reason === 'manual' && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Manual
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 capitalize mt-0.5">
                      {item.quantity} {item.unit} · {item.category}
                    </div>
                  </div>
                </div>

                {/* Right: Restock to Pantry button & Trash */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Restock to Pantry button */}
                  <button
                    type="button"
                    onClick={() => onRestockToPantry(item)}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                    title="Restock this item directly into the active pantry with smart expiry"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Restock to Pantry</span>
                    <span className="sm:hidden">Restock</span>
                  </button>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => onRemoveBuyItem(item.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    title="Remove from list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
