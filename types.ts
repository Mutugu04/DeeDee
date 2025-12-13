export enum FlavorProfile {
  SWEET = 'Sweet',
  SOUR = 'Sour',
  SALTY = 'Salty',
}

export interface Ingredient {
  name: string;
  quantity?: string;
}

export interface RecipeStep {
  instruction: string;
  tip?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  flavorProfile: FlavorProfile;
  ingredientsUsed: string[];
  missingIngredients: string[];
  steps: RecipeStep[];
  prepTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  funFact: string;
  dateCooked?: number; // timestamp
}

export interface AnalysisResult {
  identifiedIngredients: string[];
  recipes: Recipe[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface DailyLessonContent {
  title: string;
  content: string;
  emoji: string;
}

export enum AppState {
  HOME = 'HOME',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  COOKING = 'COOKING',
  MY_KITCHEN = 'MY_KITCHEN',
}
