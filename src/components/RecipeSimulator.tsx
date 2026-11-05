import React, { useState, useMemo } from 'react';
import { ChefHat, Sparkles, Clock, Check, ArrowRight, Utensils, AlertCircle, Flame, Dumbbell, ShieldAlert } from 'lucide-react';
import { PantryItem, Recipe, UserProfile } from '../types/pantry';
import { RECIPES_CATALOG } from '../data/presetData';
import { getDaysRemaining } from '../utils/dateUtils';
import { RecipeDetailModal } from './RecipeDetailModal';

interface RecipeSimulatorProps {
  items: PantryItem[];
  profile: UserProfile;
  onCookRecipe: (recipe: Recipe) => void;
}

export const RecipeSimulator: React.FC<RecipeSimulatorProps> = ({
  items,
  profile,
  onCookRecipe,
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'ready' | 'goal'>('all');

  // Extract all unexpired, in-stock ingredient tokens and their urgency
  const unexpiredItems = useMemo(() => {
    return items.filter((item) => getDaysRemaining(item.expiresAt) >= 0 && item.quantity > 0);
  }, [items]);

  // Map ingredient tokens to minimum days remaining in pantry
  const tokenUrgencyMap = useMemo(() => {
    const map = new Map<string, { days: number; itemName: string }>();

    unexpiredItems.forEach((item) => {
      const days = getDaysRemaining(item.expiresAt);
      const lower = item.name.toLowerCase();

      const tokens: string[] = [];
      if (lower.includes('chicken') || lower.includes('poultry')) tokens.push('chicken');
      if (lower.includes('bread') || lower.includes('toast')) tokens.push('bread');
      if (lower.includes('egg')) tokens.push('egg');
      if (lower.includes('tomato')) tokens.push('tomato');
      if (lower.includes('milk')) tokens.push('milk');
      if (lower.includes('yogurt')) tokens.push('yogurt');

      lower.split(/\s+/).forEach((w) => {
        if (w.length > 2) tokens.push(w);
      });

      tokens.forEach((t) => {
        const existing = map.get(t);
        if (!existing || days < existing.days) {
          map.set(t, { days, itemName: item.name });
        }
      });
    });

    return map;
  }, [unexpiredItems]);

  const availableTokens = useMemo(() => {
    return new Set(tokenUrgencyMap.keys());
  }, [tokenUrgencyMap]);

  // Compute recipe matching scores with PRIORITY TO EXPIRING ITEMS and USER PROFILE
  const scoredRecipes = useMemo(() => {
    const allergyNotesLower = (profile.allergiesNotes || '').toLowerCase();

    return RECIPES_CATALOG.map((recipe) => {
      let matchedCount = 0;
      let minExpiryDays = 999;
      let urgentItemName = '';
      const matchedIngredients: string[] = [];
      const missingIngredients: string[] = [];

      recipe.requiredIngredients.forEach((req) => {
        let matched = false;
        for (const [token, info] of tokenUrgencyMap.entries()) {
          if (token.includes(req) || req.includes(token)) {
            matched = true;
            matchedCount++;
            matchedIngredients.push(req);
            if (info.days < minExpiryDays) {
              minExpiryDays = info.days;
              urgentItemName = info.itemName;
            }
            break;
          }
        }
        if (!matched) {
          missingIngredients.push(req);
        }
      });

      const totalRequired = recipe.requiredIngredients.length;
      const matchPercent = Math.round((matchedCount / totalRequired) * 100);
      const isComplete = matchPercent === 100;

      // Calculate priority score:
      // Base score is match percent
      let score = matchPercent * 10;

      // Expiry priority boost: items expiring in 1 day get huge boost (+2000), 2 days (+1000), 3-5 days (+400)
      const hasUrgentItem = minExpiryDays <= 2 && minExpiryDays >= 0;
      if (minExpiryDays <= 1) {
        score += 2500;
      } else if (minExpiryDays <= 2) {
        score += 1500;
      } else if (minExpiryDays <= 5) {
        score += 500;
      }

      // Profile Diet Goal Boost
      let goalMatch = false;
      if (profile.dietGoal === 'high-protein' && recipe.proteinG >= 30) {
        score += 400;
        goalMatch = true;
      } else if (profile.dietGoal === 'low-calorie' && recipe.calories <= 300) {
        score += 400;
        goalMatch = true;
      } else if (profile.dietGoal === 'simple' && (recipe.difficulty === 'Quick' || recipe.dietTags.includes('simple'))) {
        score += 400;
        goalMatch = true;
      } else if (profile.dietGoal === 'low-carb' && recipe.carbsG <= 20) {
        score += 400;
        goalMatch = true;
      } else if (profile.dietGoal === 'balanced') {
        score += 200;
        goalMatch = true;
      }

      // Check allergy conflict
      const hasAllergyConflict = recipe.potentialAllergens.some((a) =>
        allergyNotesLower.includes(a.toLowerCase())
      );
      if (hasAllergyConflict) {
        score -= 100; // soft downrank but still show with clear warning
      }

      return {
        recipe,
        matchedCount,
        totalRequired,
        matchPercent,
        isComplete,
        minExpiryDays,
        urgentItemName,
        hasUrgentItem,
        goalMatch,
        hasAllergyConflict,
        score,
        matchedIngredients,
        missingIngredients,
      };
    }).sort((a, b) => b.score - a.score);
  }, [tokenUrgencyMap, profile]);

  const readyCount = useMemo(() => {
    return scoredRecipes.filter((r) => r.isComplete).length;
  }, [scoredRecipes]);

  const urgentCount = useMemo(() => {
    return scoredRecipes.filter((r) => r.hasUrgentItem).length;
  }, [scoredRecipes]);

  const filteredRecipes = useMemo(() => {
    return scoredRecipes.filter((item) => {
      if (activeFilter === 'urgent') return item.hasUrgentItem;
      if (activeFilter === 'ready') return item.isComplete;
      if (activeFilter === 'goal') return item.goalMatch;
      return true;
    });
  }, [scoredRecipes, activeFilter]);

  const selectedRecipeUrgencyNotice = useMemo(() => {
    if (!selectedRecipe) return null;
    const scored = scoredRecipes.find((s) => s.recipe.id === selectedRecipe.id);
    if (scored && scored.hasUrgentItem) {
      return `Uses ${scored.urgentItemName} (Expires in ${scored.minExpiryDays === 0 ? 'today' : scored.minExpiryDays === 1 ? '1 day' : `${scored.minExpiryDays} days`})!`;
    }
    return null;
  }, [selectedRecipe, scoredRecipes]);

  return (
    <div className="w-full space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-emerald-600" />
              <span>Smart Recipe Prioritizer</span>
            </h2>
            {urgentCount > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                🔥 Expiring items prioritized!
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Prioritizes recipes using ingredients closest to expiry (e.g. Chicken in 1d) & tailored to your health profile ({profile.dietGoal})
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800/70 rounded-xl shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('urgent')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'urgent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <span>🔥 Expiring ({urgentCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('ready')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'ready'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <span>Ready ({readyCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('goal')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap capitalize ${
              activeFilter === 'goal'
                ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {profile.dietGoal.replace('-', ' ')}
          </button>
        </div>
      </div>

      {/* Suggested Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <ChefHat className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">
            No recipes matching this filter
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Add items like Chicken, Bread, Eggs, or Tomatoes to unlock recipes!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredRecipes.map((item) => {
            const {
              recipe,
              matchPercent,
              isComplete,
              hasUrgentItem,
              urgentItemName,
              minExpiryDays,
              goalMatch,
              hasAllergyConflict,
              missingIngredients,
            } = item;

            return (
              <div
                key={recipe.id}
                className={`rounded-2xl border p-4.5 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-hidden ${
                  hasUrgentItem
                    ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/30 dark:bg-rose-950/20'
                    : isComplete
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top Status Strip */}
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    {/* Urgency Highlight: Expiring soonest */}
                    {hasUrgentItem ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-xs">
                        <Flame className="w-3.5 h-3.5 fill-white stroke-[2]" />
                        <span>Use {urgentItemName.split(' ')[0]} ({minExpiryDays <= 1 ? '1d left' : `${minExpiryDays}d`})</span>
                      </span>
                    ) : isComplete ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>100% Ready</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <span>{matchPercent}% in pantry</span>
                      </span>
                    )}

                    {/* Goal match badge */}
                    {goalMatch && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        ✓ {profile.dietGoal.replace('-', ' ')}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {recipe.subtitle}
                  </p>

                  {/* Macros: Calories & Protein */}
                  <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                      {recipe.calories} kcal
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {recipe.proteinG}g protein
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{recipe.prepTime}</span>
                    </span>
                  </div>

                  {/* Allergy Notice if applicable */}
                  {hasAllergyConflict && (
                    <div className="mt-2 p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[10px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-medium">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Contains profile allergen (coriander/ingredient)</span>
                    </div>
                  )}

                  {/* Ingredients Availability Chips */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Required Ingredients
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.requiredIngredients.map((req, i) => {
                        const inPantry = Array.from(availableTokens).some(
                          (tok) => tok.includes(req) || req.includes(tok)
                        );
                        return (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                              inPantry
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {inPantry ? (
                              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                            ) : (
                              <span className="text-[9px] text-slate-400">need</span>
                            )}
                            <span>{req}</span>
                          </span>
                        );
                      })}
                    </div>

                    {!isComplete && missingIngredients.length > 0 && (
                      <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Missing: {missingIngredients.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRecipe(recipe)}
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
                  >
                    View Recipe
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isComplete) {
                        onCookRecipe(recipe);
                      } else {
                        setSelectedRecipe(recipe);
                      }
                    }}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isComplete
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>{isComplete ? 'Cook Meal' : 'Inspect'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Step-by-Step Recipe Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        availableTokens={availableTokens}
        onCookRecipe={onCookRecipe}
        profile={profile}
        urgentItemNotice={selectedRecipeUrgencyNotice}
      />
    </div>
  );
};
