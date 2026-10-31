export type Language = 'fr' | 'ar' | 'en';

export type Category =
  | 'fruits'
  | 'vegetables'
  | 'dairy'
  | 'meat_fish'
  | 'grains'
  | 'canned'
  | 'beverages'
  | 'condiments'
  | 'bakery'
  | 'other';

export type LocationType = 'fridge' | 'pantry' | 'freezer';

export type UnitType = 'g' | 'kg' | 'ml' | 'l' | 'pieces' | 'packs' | 'slices';

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  category: Category;
  quantity: number;
  unit: UnitType;
  location: LocationType;
  purchaseDate: string;
  expiryDate: string;
  notes?: string;
  estimatedPrice: number;
  imageEmoji?: string;
  isCookedOrDiscarded?: boolean;
}

export interface FoodRescueListing {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userPhoneOrContact: string;
  title: string;
  category: string;
  quantity: string;
  locationNeighborhood: string;
  expiryDate: string;
  description: string;
  status: 'available' | 'reserved' | 'completed';
  createdAt: string;
  reservedBy?: string;
  reservedAt?: string;
}

export interface ShoppingItem {
  id: string;
  userId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  completed: boolean;
  priority: 'normal' | 'urgent';
  estimatedCost: number;
  addedFromExpiry?: boolean;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  event: string;
  status: 'success' | 'failed' | 'simulated';
  targetUrl: string;
  itemsNotified: number;
  summary: string;
}

export interface UserSettings {
  userId: string;
  name: string;
  email: string;
  language: Language;
  dietaryPreference: 'none' | 'vegetarian' | 'vegan' | 'gluten_free' | 'halal' | 'quick';
  householdSize: number;
  n8nWebhookUrl: string;
  n8nEnabled: boolean;
  alertDaysBefore: number;
  alertChannels: {
    email: boolean;
    n8nWebhook: boolean;
    browserPush: boolean;
  };
}

export interface AppStats {
  totalItemsInStock: number;
  expiringSoonCount: number;
  criticalCount: number;
  freshCount: number;
  totalValueInStock: number;
  locationBreakdown: {
    fridge: number;
    pantry: number;
    freezer: number;
  };
  impact: {
    savedKgsThisMonth: number;
    co2SavedKg: number;
    moneySavedEUR: number;
    mealsRescuedCount: number;
  };
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'facile' | 'moyen' | 'expert';
  savedIngredients: string[];
  additionalIngredients: string[];
  instructions: string[];
  chefTip: string;
  ecoScore: string;
  estimatedSavings: number;
}
