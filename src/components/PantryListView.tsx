import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trash2,
  Check,
  Search,
  Filter,
  Plus,
  Minus,
  Sparkles,
  Package,
  ShoppingCart,
  Milk,
  Wheat,
  Egg,
  Apple,
  Utensils,
  CupSoda,
} from 'lucide-react';
import { PantryItem, UrgencyLevel, FoodCategory } from '../types/pantry';
import { getDaysRemaining, getUrgencyLevel, formatExpiryLabel, formatCalendarDate } from '../utils/dateUtils';

interface PantryListViewProps {
  items: PantryItem[];
  onRemoveItem: (id: string) => void;
  onConsumeItem: (id: string) => void;
  onMarkAsUsed: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

export const PantryListView: React.FC<PantryListViewProps> = ({
  items,
  onRemoveItem,
  onConsumeItem,
  onMarkAsUsed,
  onUpdateQuantity,
}) => {
  const [filterType, setFilterType] = useState<'all' | UrgencyLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort automatically with closest expiry dates at the very top
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const daysA = getDaysRemaining(a.expiresAt);
      const daysB = getDaysRemaining(b.expiresAt);
      return daysA - daysB;
    });
  }, [items]);

  // Count by urgency for filter tabs
  const counts = useMemo(() => {
    let critical = 0;
    let warning = 0;
    let fresh = 0;
    sortedItems.forEach((item) => {
      const urgency = getUrgencyLevel(item.expiresAt);
      if (urgency === 'critical') critical++;
      else if (urgency === 'warning') warning++;
      else fresh++;
    });
    return { all: sortedItems.length, critical, warning, fresh };
  }, [sortedItems]);

  // Filter by urgency tab and search input
  const filteredItems = useMemo(() => {
    return sortedItems.filter((item) => {
      if (filterType !== 'all') {
        const urgency = getUrgencyLevel(item.expiresAt);
        if (urgency !== filterType) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [sortedItems, filterType, searchQuery]);

  const getCategoryIcon = (category: FoodCategory, name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('milk')) return <Milk className="w-5 h-5" />;
    if (lower.includes('bread') || lower.includes('toast')) return <Wheat className="w-5 h-5" />;
    if (lower.includes('egg')) return <Egg className="w-5 h-5" />;
    if (lower.includes('tomato') || lower.includes('apple')) return <Apple className="w-5 h-5" />;
    if (lower.includes('chicken') || lower.includes('meat')) return <Utensils className="w-5 h-5" />;
    if (lower.includes('yogurt')) return <CupSoda className="w-5 h-5" />;

    switch (category) {
      case 'dairy':
        return <Milk className="w-5 h-5" />;
      case 'bakery':
        return <Wheat className="w-5 h-5" />;
      case 'produce':
        return <Apple className="w-5 h-5" />;
      case 'meat':
        return <Utensils className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getUrgencyStyles = (urgency: UrgencyLevel, days: number) => {
    switch (urgency) {
      case 'critical':
        return {
          cardBorder: 'border-rose-300 dark:border-rose-900/70',
          badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border-rose-200 dark:border-rose-800',
          iconColor: 'text-rose-600 dark:text-rose-400',
          avatarBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
          highlight: 'bg-rose-50/50 dark:bg-rose-950/20',
          icon: <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />,
        };
      case 'warning':
        return {
          cardBorder: 'border-amber-300 dark:border-amber-900/70',
          badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200 border-amber-200 dark:border-amber-800',
          iconColor: 'text-amber-600 dark:text-amber-400',
          avatarBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
          highlight: 'bg-amber-50/40 dark:bg-amber-950/15',
          icon: <Clock className="w-3.5 h-3.5 stroke-[2.5]" />,
        };
      case 'fresh':
      default:
        return {
          cardBorder: 'border-emerald-200 dark:border-emerald-900/70',
          badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          avatarBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
          highlight: 'bg-white dark:bg-slate-900',
          icon: <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />,
        };
    }
  };

  return (
    <div className="w-full">
      {/* List Header & Summary Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Active Pantry Inventory</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums">
              {items.length} items
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automatically sorted with the closest expiry dates at the very top
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pantry..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs / Segmented Controls */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/70 rounded-xl mb-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            filterType === 'all'
              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>All Items</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 tabular-nums">
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('critical')}
          className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            filterType === 'critical'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>Critical (&le;2d)</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white/20 tabular-nums">
            {counts.critical}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('warning')}
          className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            filterType === 'warning'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span>Warning (3-5d)</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white/20 tabular-nums">
            {counts.warning}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('fresh')}
          className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            filterType === 'fresh'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Fresh (6d+)</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white/20 tabular-nums">
            {counts.fresh}
          </span>
        </button>
      </div>

      {/* Vertical Card List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <Package className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {searchQuery ? 'No matching pantry items found' : 'No items in this filter'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `Try adjusting "${searchQuery}" or clear your search query.`
              : 'Add new groceries using the quick presets above or the voice entry button!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const days = getDaysRemaining(item.expiresAt);
            const urgency = getUrgencyLevel(item.expiresAt);
            const style = getUrgencyStyles(urgency, days);
            const label = formatExpiryLabel(item.expiresAt);

            return (
              <div
                key={item.id}
                className={`group rounded-2xl border p-4 transition-all duration-200 shadow-xs hover:shadow-md ${style.cardBorder} ${style.highlight}`}
              >
                {/* Top Section: Category Icon, Item Name & Urgency Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${style.avatarBg}`}
                    >
                      {getCategoryIcon(item.category, item.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug break-words">
                        {item.name}
                      </h4>

                      {/* Expiry Details Subtitle */}
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {label.headline}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums font-medium">
                          {formatCalendarDate(item.expiresAt)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{item.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top-Right Urgency Badge */}
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border tabular-nums shrink-0 ${style.badgeBg}`}
                  >
                    {style.icon}
                    <span>{label.badgeText}</span>
                  </div>
                </div>

                {/* Bottom Section: Quantity Stepper & Fast Action Buttons */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                  {/* Quantity Stepper with Unit */}
                  <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 py-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                      title="Decrease quantity"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <div className="px-2.5 text-center min-w-[36px]">
                      <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                        {item.quantity}
                      </span>
                      {item.unit && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block -mt-0.5 truncate max-w-[70px]">
                          {item.unit}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                      title="Increase quantity"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Actions: Mark as Used, Consumed, and Trash */}
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    {/* Mark as Used / Finished -> Sends to Need to Buy list */}
                    <button
                      type="button"
                      onClick={() => onMarkAsUsed(item.id)}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                      title="Mark as used / finished (adds to Need to Buy list)"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>Used</span>
                    </button>

                    {/* Mark as Consumed Button */}
                    <button
                      type="button"
                      onClick={() => onConsumeItem(item.id)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                      title="Mark as Consumed"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Consumed</span>
                    </button>

                    {/* Trash Button */}
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove / Trash item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
