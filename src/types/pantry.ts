export type UrgencyLevel = 'critical' | 'warning' | 'fresh';

export type FoodCategory =
  | 'dairy'
  | 'bakery'
  | 'produce'
  | 'meat'
  | 'pantry'
  | 'frozen'
  | 'beverages'
  | 'other';

export interface PantryItem {
  id: string;
  name: string;
  category: FoodCategory;
  addedAt: string; // ISO string
  expiresAt: string; // ISO string
  quantity: number;
  unit: string;
  consumed?: boolean;
}

export interface PresetItem {
  id: string;
  name: string;
  category: FoodCategory;
  defaultDays: number;
  unit: string;
  iconName: string;
  color: string;
  bgTint: string;
}

export interface BuyListItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  reason: 'finished' | 'expired' | 'manual';
  addedAt: string;
  isBought: boolean;
}

export type DietGoal =
  | 'high-protein'
  | 'low-calorie'
  | 'simple'
  | 'balanced'
  | 'low-carb';

export interface UserProfile {
  name: string;
  age: number;
  gender: 'female' | 'male' | 'other';
  heightCm: number;
  weightKg: number;
  dietGoal: DietGoal;
  preferencesNotes: string; // e.g. "No caffeine after 6:00 p.m., prefer warm breakfasts"
  allergiesNotes: string; // e.g. "Allergic to coriander, peanuts"
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Quick';
  requiredIngredients: string[]; // Lowercase search tokens (e.g. ['egg', 'bread'])
  displayIngredients: { name: string; amount: string; optional?: boolean }[];
  instructions: string[];
  tag: string;
  // Nutritional & personalization metadata
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  dietTags: string[]; // e.g. ['high-protein', 'simple', 'low-calorie']
  potentialAllergens: string[]; // e.g. ['coriander', 'dairy', 'gluten', 'egg']
}

export interface StreakData {
  currentStreakDays: number;
  longestStreakDays: number;
  totalItemsSaved: number;
  lastSavedDate: string; // YYYY-MM-DD
  historyDates: string[]; // dates when items were saved in time
  moneySavedEstimate: number; // in $
  co2SavedKg: number; // in kg
}

