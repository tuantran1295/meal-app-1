export interface NutritionInfo {
  mealName: string;
  mealType: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  healthScore: number;
  advice: string;
}

export interface Meal extends NutritionInfo {
  id: string;
  timestamp: string;
  imageUrl: string;
}
