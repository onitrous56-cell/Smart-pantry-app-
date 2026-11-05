import React, { useState } from 'react';
import {
  User,
  Heart,
  Scale,
  Ruler,
  Calendar,
  Sparkles,
  AlertCircle,
  Flame,
  Dumbbell,
  Clock,
  ShieldAlert,
  Check,
  Save,
} from 'lucide-react';
import { UserProfile, DietGoal, StreakData } from '../types/pantry';

interface ProfileViewProps {
  profile: UserProfile;
  streak: StreakData;
  onUpdateProfile: (updated: UserProfile) => void;
  onShowToast: (msg: string) => void;
}

const DIET_GOALS: { id: DietGoal; label: string; desc: string; icon: string }[] = [
  {
    id: 'high-protein',
    label: 'High Protein',
    desc: 'Prioritizes chicken, eggs, yogurt & high protein density',
    icon: '🥩',
  },
  {
    id: 'low-calorie',
    label: 'Low Calorie',
    desc: 'Light, nutrient-rich meals under 350 kcal',
    icon: '🥗',
  },
  {
    id: 'simple',
    label: 'Simple Meals',
    desc: 'Minimal ingredients, under 10 minutes prep time',
    icon: '⚡',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    desc: 'Wholesome ratio of carbs, proteins and healthy fats',
    icon: '⚖️',
  },
  {
    id: 'low-carb',
    label: 'Low Carb',
    desc: 'High healthy fats and protein with low sugars/grains',
    icon: '🥑',
  },
];

const COMMON_ALLERGIES = [
  'Coriander',
  'Dairy / Lactose',
  'Gluten',
  'Eggs',
  'Peanuts',
  'Raw Onions',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  streak,
  onUpdateProfile,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsSaved(true);
    onShowToast('Profile & dietary preferences saved!');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleToggleAllergyTag = (tag: string) => {
    const current = formData.allergiesNotes.toLowerCase();
    const tagLower = tag.toLowerCase();
    let newNotes = formData.allergiesNotes;

    if (current.includes(tagLower)) {
      // Remove it
      const regex = new RegExp(`\\b${tagLower}\\b[,;\\s]*`, 'gi');
      newNotes = newNotes.replace(regex, '').trim().replace(/,\s*$/, '');
    } else {
      // Add it
      newNotes = newNotes ? `${newNotes}, ${tag}` : tag;
    }

    handleChange('allergiesNotes', newNotes);
  };

  // Health metric calculations: BMI & BMR estimate
  const heightM = (formData.heightCm || 170) / 100;
  const bmi = heightM > 0 ? (formData.weightKg / (heightM * heightM)).toFixed(1) : '22.0';
  
  // Basal Metabolic Rate (Mifflin-St Jeor formula)
  const bmr = Math.round(
    10 * (formData.weightKg || 65) +
    6.25 * (formData.heightCm || 170) -
    5 * (formData.age || 28) +
    (formData.gender === 'female' ? -161 : 5)
  );

  // Recommended protein target based on weight (1.6g per kg)
  const proteinTargetG = Math.round((formData.weightKg || 65) * 1.6);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card Header */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 md:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-emerald-600/30">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Personal Health & Meal Profile
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customizes culinary recipe recommendations, calorie targets, and allergy safety
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Saved' : 'Save Changes'}</span>
            </button>
          </div>

          {/* Core Vitals: Name, Age, Height, Weight */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Alex"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {/* Age */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Age (years)</span>
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={formData.age}
                onChange={(e) => handleChange('age', parseInt(e.target.value, 10) || 0)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 tabular-nums"
              />
            </div>

            {/* Height */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-slate-400" />
                <span>Height (cm)</span>
              </label>
              <input
                type="number"
                min="100"
                max="250"
                value={formData.heightCm}
                onChange={(e) => handleChange('heightCm', parseInt(e.target.value, 10) || 0)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 tabular-nums"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                <span>Weight (kg)</span>
              </label>
              <input
                type="number"
                min="30"
                max="300"
                value={formData.weightKg}
                onChange={(e) => handleChange('weightKg', parseInt(e.target.value, 10) || 0)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 tabular-nums"
              />
            </div>
          </div>

          {/* Real-time Health Telemetry Indicators */}
          <div className="mt-4 grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">BMI Score</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                {bmi}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                {parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Healthy Range' : 'Above Baseline'}
              </span>
            </div>

            <div className="text-center border-x border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Daily Est. Calories</span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                ~{bmr} kcal
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                Basal Metabolism
              </span>
            </div>

            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Daily Protein Target</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {proteinTargetG}g / day
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                1.6g / kg goal
              </span>
            </div>
          </div>
        </div>

        {/* PREFERENCES COLUMN RIGHT UNDER WEIGHT & HEIGHT */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 md:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Lifestyle Preferences & Restrictions</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Specify your schedule boundaries (e.g. no caffeine after 6pm) and food sensitivities
            </p>
          </div>

          {/* Preferences Text Area */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Custom Dietary Preferences & Rules
            </label>
            <input
              type="text"
              value={formData.preferencesNotes}
              onChange={(e) => handleChange('preferencesNotes', e.target.value)}
              placeholder="e.g. No caffeine after 6:00 p.m., prefer warm breakfasts, avoid heavy late-night dinners"
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Recipes will honor your timing rules and meal temperature preferences.
            </p>
          </div>

          {/* Allergies & Intolerances */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Allergies & Ingredient Exclusions</span>
            </label>
            <input
              type="text"
              value={formData.allergiesNotes}
              onChange={(e) => handleChange('allergiesNotes', e.target.value)}
              placeholder="e.g. Allergic to coriander, peanuts, shell fish, lactose intolerant"
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />

            {/* Quick Allergy Tags */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Quick Toggle:
              </span>
              {COMMON_ALLERGIES.map((tag) => {
                const isActive = formData.allergiesNotes.toLowerCase().includes(tag.toLowerCase());
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleAllergyTag(tag)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    {isActive ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>
            {formData.allergiesNotes.toLowerCase().includes('coriander') && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Coriander allergy detected:</strong> Recipes with fresh herbs or coriander (such as skewers or garnishes) will display caution badges and omission recommendations!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* DIET STYLE PREFERENCE */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 md:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-600" />
              <span>Target Diet Style & Nutritional Goal</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose your primary meal focus to tailor recipe ranking and macro suggestions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DIET_GOALS.map((goal) => {
              const isSelected = formData.dietGoal === goal.id;
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => handleChange('dietGoal', goal.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 dark:bg-emerald-950/40 dark:border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{goal.icon}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {goal.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      {goal.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ZERO-WASTE STREAK & IMPACT SUMMARY */}
        <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-amber-950/40 dark:via-emerald-950/40 dark:to-teal-950/30 p-5 md:p-6 border border-amber-200/90 dark:border-amber-800/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Flame className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Zero-Waste Kitchen Streak</span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">🔥 {streak.currentStreakDays} Days</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your kitchen's anti-expiry track record and environmental impact
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300">
              Best: {streak.longestStreakDays}d
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Streak</span>
              <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                {streak.currentStreakDays} Days
              </span>
              <span className="text-[10px] text-slate-500 block">Zero waste</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Longest Record</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                {streak.longestStreakDays} Days
              </span>
              <span className="text-[10px] text-emerald-600 block">Personal best</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Food Rescued</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {streak.totalItemsSaved} items
              </span>
              <span className="text-[10px] text-slate-500 block">Eaten in time</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Money Saved</span>
              <span className="text-base font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
                ${streak.moneySavedEstimate.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block">Pocket savings</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
