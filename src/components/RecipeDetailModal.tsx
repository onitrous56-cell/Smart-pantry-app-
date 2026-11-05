import React from 'react';
import { X, Clock, ChefHat, Check, AlertCircle, Sparkles, Utensils, ShieldAlert, Flame, Dumbbell } from 'lucide-react';
import { Recipe, UserProfile } from '../types/pantry';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  availableTokens: Set<string>;
  onCookRecipe: (recipe: Recipe) => void;
  profile: UserProfile;
  urgentItemNotice?: string | null;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  availableTokens,
  onCookRecipe,
  profile,
  urgentItemNotice,
}) => {
  if (!recipe) return null;

  // Check allergen match against profile allergies
  const allergyNotesLower = (profile.allergiesNotes || '').toLowerCase();
  const matchedAllergen = recipe.potentialAllergens.find((allergen) =>
    allergyNotesLower.includes(allergen.toLowerCase())
  );

  // Daily target comparison
  const dailyProteinTarget = Math.round((profile.weightKg || 65) * 1.6);
  const proteinPercentOfTarget = Math.min(
    100,
    Math.round((recipe.proteinG / dailyProteinTarget) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Recipe Header */}
        <div className="pr-8">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ChefHat className="w-3.5 h-3.5" />
              <span>{recipe.tag}</span>
              <span aria-hidden="true">·</span>
              <span>{recipe.difficulty}</span>
            </span>

            {urgentItemNotice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border border-rose-300">
                <span>🔥 Prevents Waste</span>
              </span>
            )}
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {recipe.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {recipe.subtitle}
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{recipe.prepTime} total time</span>
            </span>
          </div>
        </div>

        {/* Urgent Item Expiry Callout if applicable */}
        {urgentItemNotice && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2.5">
            <span className="text-base">⏰</span>
            <div>
              <strong>Expiry Priority:</strong> {urgentItemNotice}
            </div>
          </div>
        )}

        {/* Allergy Warning if applicable */}
        {matchedAllergen && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Profile Allergy Notice:</strong> Contains <em>{matchedAllergen}</em>.
              <span className="block text-[11px] opacity-80 mt-0.5">
                Omit or swap this ingredient to enjoy safely per your dietary profile.
              </span>
            </div>
          </div>
        )}

        {/* Nutrition & Personal Macro Fit */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Nutritional Facts & Profile Fit ({profile.name || 'User'})
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Calories</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                {recipe.calories}
              </span>
              <span className="text-[9px] text-slate-400 block">kcal</span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Protein</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {recipe.proteinG}g
              </span>
              <span className="text-[9px] text-emerald-600 block">{proteinPercentOfTarget}% goal</span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Carbs</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                {recipe.carbsG}g
              </span>
              <span className="text-[9px] text-slate-400 block">energy</span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Fat</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                {recipe.fatG}g
              </span>
              <span className="text-[9px] text-slate-400 block">healthy</span>
            </div>
          </div>
        </div>

        {/* Ingredients Checklist */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Pantry Ingredients Status
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recipe.displayIngredients.map((ing, idx) => {
              const lower = ing.name.toLowerCase();
              const isAvailable = Array.from(availableTokens).some((t) => lower.includes(t) || t.includes(lower));

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isAvailable
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                      : ing.optional
                      ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isAvailable ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                    ) : ing.optional ? (
                      <span className="text-[10px] text-slate-400 italic shrink-0">opt</span>
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="font-semibold">{ing.name}</span>
                  </div>
                  <span className="text-[11px] opacity-80">{ing.amount}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Step-by-Step Method
          </h4>
          <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {recipe.instructions.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 dark:bg-emerald-600 text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onCookRecipe(recipe);
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Utensils className="w-4 h-4" />
            <span>Cook & Deduct Pantry Items</span>
          </button>
        </div>
      </div>
    </div>
  );
};
