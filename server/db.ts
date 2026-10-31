import fs from 'fs';
import path from 'path';

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  category: 'fruits' | 'vegetables' | 'dairy' | 'meat_fish' | 'grains' | 'canned' | 'beverages' | 'condiments' | 'bakery' | 'other';
  quantity: number;
  unit: 'g' | 'kg' | 'ml' | 'l' | 'pieces' | 'packs' | 'slices';
  location: 'fridge' | 'pantry' | 'freezer';
  purchaseDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  notes?: string;
  estimatedPrice: number; // in EUR
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
  language: 'fr' | 'ar' | 'en';
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

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'ecochef_db.json');

interface DatabaseSchema {
  users: UserSettings[];
  inventory: InventoryItem[];
  foodRescue: FoodRescueListing[];
  shoppingList: ShoppingItem[];
  automationLogs: AutomationLog[];
}

function getInitialData(): DatabaseSchema {
  const today = new Date();
  const formatDay = (daysOffset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  return {
    users: [
      {
        userId: 'user_1',
        name: 'Camille & Alex',
        email: 'camille.alex@ecochef.local',
        language: 'fr',
        dietaryPreference: 'none',
        householdSize: 2,
        n8nWebhookUrl: 'https://n8n.webhook.office/ecochef-alerts',
        n8nEnabled: true,
        alertDaysBefore: 3,
        alertChannels: {
          email: true,
          n8nWebhook: true,
          browserPush: true,
        },
      },
    ],
    inventory: [
      {
        id: 'inv_1',
        userId: 'user_1',
        name: 'Yaourts nature bio',
        category: 'dairy',
        quantity: 4,
        unit: 'pieces',
        location: 'fridge',
        purchaseDate: formatDay(-7),
        expiryDate: formatDay(1), // Tomorrow! Urgent
        notes: 'Pack de 4, à consommer rapidement ou en gâteau au yaourt',
        estimatedPrice: 2.8,
        imageEmoji: '🥛',
      },
      {
        id: 'inv_2',
        userId: 'user_1',
        name: 'Tomates grappe',
        category: 'vegetables',
        quantity: 500,
        unit: 'g',
        location: 'fridge',
        purchaseDate: formatDay(-5),
        expiryDate: formatDay(2), // 2 days left
        notes: 'Très mûres, parfaites pour coulis, shakshuka ou tarte',
        estimatedPrice: 2.5,
        imageEmoji: '🍅',
      },
      {
        id: 'inv_3',
        userId: 'user_1',
        name: 'Filet de saumon frais',
        category: 'meat_fish',
        quantity: 2,
        unit: 'slices',
        location: 'fridge',
        purchaseDate: formatDay(-2),
        expiryDate: formatDay(0), // Today!
        notes: 'Pêche durable, à cuire ce soir impérativement',
        estimatedPrice: 7.9,
        imageEmoji: '🐟',
      },
      {
        id: 'inv_4',
        userId: 'user_1',
        name: 'Épinards frais en branches',
        category: 'vegetables',
        quantity: 300,
        unit: 'g',
        location: 'fridge',
        purchaseDate: formatDay(-4),
        expiryDate: formatDay(2),
        notes: 'Légèrement flétris, délicieux poêlés avec ail et crème',
        estimatedPrice: 1.9,
        imageEmoji: '🥬',
      },
      {
        id: 'inv_5',
        userId: 'user_1',
        name: 'Courgettes',
        category: 'vegetables',
        quantity: 3,
        unit: 'pieces',
        location: 'fridge',
        purchaseDate: formatDay(-3),
        expiryDate: formatDay(5),
        notes: 'Excellentes en gratin ou velouté',
        estimatedPrice: 2.1,
        imageEmoji: '🥒',
      },
      {
        id: 'inv_6',
        userId: 'user_1',
        name: 'Pâtes Penne Rigate',
        category: 'grains',
        quantity: 1,
        unit: 'packs',
        location: 'pantry',
        purchaseDate: formatDay(-20),
        expiryDate: formatDay(180),
        notes: 'Garde-manger sec',
        estimatedPrice: 1.6,
        imageEmoji: '🍝',
      },
      {
        id: 'inv_7',
        userId: 'user_1',
        name: 'Bananes mûres',
        category: 'fruits',
        quantity: 4,
        unit: 'pieces',
        location: 'pantry',
        purchaseDate: formatDay(-6),
        expiryDate: formatDay(1), // Urgent!
        notes: 'Idéal banana bread, pancakes ou smoothie',
        estimatedPrice: 1.8,
        imageEmoji: '🍌',
      },
      {
        id: 'inv_8',
        userId: 'user_1',
        name: 'Crème fraîche épaisse 30%',
        category: 'dairy',
        quantity: 200,
        unit: 'ml',
        location: 'fridge',
        purchaseDate: formatDay(-6),
        expiryDate: formatDay(3),
        notes: 'Ouvert il y a 2 jours',
        estimatedPrice: 1.4,
        imageEmoji: '🥣',
      },
      {
        id: 'inv_9',
        userId: 'user_1',
        name: 'Pain de campagne artisanal',
        category: 'bakery',
        quantity: 1,
        unit: 'pieces',
        location: 'pantry',
        purchaseDate: formatDay(-3),
        expiryDate: formatDay(1),
        notes: 'Commence à durcir, parfait pour du pain perdu ou croûtons à soupe',
        estimatedPrice: 2.2,
        imageEmoji: '🥖',
      },
      {
        id: 'inv_10',
        userId: 'user_1',
        name: 'Petits pois surgelés',
        category: 'vegetables',
        quantity: 600,
        unit: 'g',
        location: 'freezer',
        purchaseDate: formatDay(-30),
        expiryDate: formatDay(120),
        notes: 'Très bonne conservation',
        estimatedPrice: 2.0,
        imageEmoji: '🟢',
      },
    ],
    foodRescue: [
      {
        id: 'rescue_1',
        userId: 'user_neighbour_1',
        userName: 'Sarah M.',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        userPhoneOrContact: '+33 6 12 34 56 78',
        title: 'Caisse de pommes bio du verger',
        category: 'fruits',
        quantity: 'Env. 3 kg',
        locationNeighborhood: 'Quartier des Arts (à 450 m)',
        expiryDate: formatDay(6),
        description: 'Trop de pommes récoltées chez mes grands-parents en Normandie. Variété Boskoop et Reine des Reinettes, idéales à croquer ou en compote !',
        status: 'available',
        createdAt: formatDay(-1),
      },
      {
        id: 'rescue_2',
        userId: 'user_neighbour_2',
        userName: 'Youssef B.',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        userPhoneOrContact: 'youssef.b@email.com',
        title: 'Lot de 2 briques de lait végétal avoine',
        category: 'beverages',
        quantity: '2 x 1L non ouvertes',
        locationNeighborhood: 'Centre-ville / Place de la République (à 800 m)',
        expiryDate: formatDay(25),
        description: 'Erreur de commande en drive, je ne consomme que du lait d\'amande. Neuves scellées.',
        status: 'available',
        createdAt: formatDay(0),
      },
      {
        id: 'rescue_3',
        userId: 'user_neighbour_3',
        userName: 'Léa & Thomas',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        userPhoneOrContact: '+33 6 98 76 54 32',
        title: 'Baguettes et viennoiseries du matin',
        category: 'bakery',
        quantity: '3 baguettes + 2 croissants',
        locationNeighborhood: 'Quartier Floral (à 1.2 km)',
        expiryDate: formatDay(1),
        description: 'Reste d\'un petit-déjeuner d\'équipe au bureau. Tout frais de la boulangerie artisanale.',
        status: 'reserved',
        createdAt: formatDay(0),
        reservedBy: 'Camille & Alex',
        reservedAt: formatDay(0),
      },
    ],
    shoppingList: [
      {
        id: 'shop_1',
        userId: 'user_1',
        name: 'Huile d\'olive extra vierge',
        category: 'condiments',
        quantity: 1,
        unit: 'l',
        completed: false,
        priority: 'normal',
        estimatedCost: 8.5,
      },
      {
        id: 'shop_2',
        userId: 'user_1',
        name: 'Gousses d\'ail',
        category: 'vegetables',
        quantity: 1,
        unit: 'packs',
        completed: false,
        priority: 'urgent',
        estimatedCost: 1.5,
      },
      {
        id: 'shop_3',
        userId: 'user_1',
        name: 'Oeufs plein air Label Rouge',
        category: 'dairy',
        quantity: 6,
        unit: 'pieces',
        completed: true,
        priority: 'normal',
        estimatedCost: 2.8,
      },
    ],
    automationLogs: [
      {
        id: 'log_1',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        event: 'Alerte Péremption Quotidienne',
        status: 'success',
        targetUrl: 'https://n8n.webhook.office/ecochef-alerts',
        itemsNotified: 3,
        summary: '3 articles détectés à échéance ≤ 48h (Saumon, Bananes, Yaourts). Déclenchement n8n et envoi récapitulatif.',
      },
      {
        id: 'log_2',
        timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
        event: 'Scan Anti-Gaspi & Suggestion Recettes',
        status: 'success',
        targetUrl: 'https://n8n.webhook.office/ecochef-alerts',
        itemsNotified: 2,
        summary: 'Génération de 2 recettes anti-gaspi basée sur les stocks et notification Telegram.',
      },
    ],
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.warn('Could not read existing db file, initializing seed data:', err);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save data to db file:', err);
    }
  }

  // --- Users & Settings ---
  getUserSettings(userId: string = 'user_1'): UserSettings {
    const user = this.data.users.find((u) => u.userId === userId);
    if (!user) {
      const defaultUser = getInitialData().users[0];
      this.data.users.push(defaultUser);
      this.saveData();
      return defaultUser;
    }
    return user;
  }

  updateUserSettings(userId: string = 'user_1', patch: Partial<UserSettings>): UserSettings {
    const idx = this.data.users.findIndex((u) => u.userId === userId);
    if (idx >= 0) {
      this.data.users[idx] = { ...this.data.users[idx], ...patch };
    } else {
      const newUser = { ...getInitialData().users[0], ...patch, userId };
      this.data.users.push(newUser);
    }
    this.saveData();
    return this.getUserSettings(userId);
  }

  // --- Inventory ---
  getInventory(userId: string = 'user_1'): InventoryItem[] {
    return this.data.inventory.filter((item) => item.userId === userId && !item.isCookedOrDiscarded);
  }

  addInventoryItem(userId: string = 'user_1', item: Omit<InventoryItem, 'id' | 'userId'>): InventoryItem {
    const newItem: InventoryItem = {
      ...item,
      id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId,
    };
    this.data.inventory.unshift(newItem);
    this.saveData();
    return newItem;
  }

  addMultipleInventoryItems(userId: string = 'user_1', items: Array<Omit<InventoryItem, 'id' | 'userId'>>): InventoryItem[] {
    const created: InventoryItem[] = [];
    for (const item of items) {
      const newItem: InventoryItem = {
        ...item,
        id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        userId,
      };
      this.data.inventory.unshift(newItem);
      created.push(newItem);
    }
    this.saveData();
    return created;
  }

  updateInventoryItem(id: string, patch: Partial<InventoryItem>): InventoryItem | null {
    const idx = this.data.inventory.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    this.data.inventory[idx] = { ...this.data.inventory[idx], ...patch };
    this.saveData();
    return this.data.inventory[idx];
  }

  deleteInventoryItem(id: string): boolean {
    const initialLen = this.data.inventory.length;
    this.data.inventory = this.data.inventory.filter((item) => item.id !== id);
    if (this.data.inventory.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  consumeInventoryItem(id: string, action: 'cooked' | 'discarded' | 'rescued' = 'cooked'): InventoryItem | null {
    const item = this.updateInventoryItem(id, { isCookedOrDiscarded: true });
    return item;
  }

  // --- Food Rescue ---
  getFoodRescueListings(): FoodRescueListing[] {
    return this.data.foodRescue;
  }

  createFoodRescueListing(listing: Omit<FoodRescueListing, 'id' | 'createdAt' | 'status'>): FoodRescueListing {
    const newListing: FoodRescueListing = {
      ...listing,
      id: 'rescue_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      status: 'available',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.data.foodRescue.unshift(newListing);
    this.saveData();
    return newListing;
  }

  updateFoodRescueStatus(id: string, status: 'available' | 'reserved' | 'completed', reservedBy?: string): FoodRescueListing | null {
    const idx = this.data.foodRescue.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    this.data.foodRescue[idx] = {
      ...this.data.foodRescue[idx],
      status,
      reservedBy: status === 'reserved' ? reservedBy || 'Utilisateur' : this.data.foodRescue[idx].reservedBy,
      reservedAt: status === 'reserved' ? new Date().toISOString().split('T')[0] : this.data.foodRescue[idx].reservedAt,
    };
    this.saveData();
    return this.data.foodRescue[idx];
  }

  // --- Shopping List ---
  getShoppingList(userId: string = 'user_1'): ShoppingItem[] {
    return this.data.shoppingList.filter((item) => item.userId === userId);
  }

  addShoppingItem(userId: string = 'user_1', item: Omit<ShoppingItem, 'id' | 'userId'>): ShoppingItem {
    const newItem: ShoppingItem = {
      ...item,
      id: 'shop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId,
    };
    this.data.shoppingList.unshift(newItem);
    this.saveData();
    return newItem;
  }

  updateShoppingItem(id: string, patch: Partial<ShoppingItem>): ShoppingItem | null {
    const idx = this.data.shoppingList.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    this.data.shoppingList[idx] = { ...this.data.shoppingList[idx], ...patch };
    this.saveData();
    return this.data.shoppingList[idx];
  }

  deleteShoppingItem(id: string): boolean {
    const initialLen = this.data.shoppingList.length;
    this.data.shoppingList = this.data.shoppingList.filter((item) => item.id !== id);
    if (this.data.shoppingList.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  clearCompletedShoppingItems(userId: string = 'user_1'): void {
    this.data.shoppingList = this.data.shoppingList.filter((item) => item.userId !== userId || !item.completed);
    this.saveData();
  }

  // --- Automation Logs ---
  getAutomationLogs(): AutomationLog[] {
    return this.data.automationLogs;
  }

  addAutomationLog(log: Omit<AutomationLog, 'id' | 'timestamp'>): AutomationLog {
    const newLog: AutomationLog = {
      ...log,
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    this.data.automationLogs.unshift(newLog);
    // Keep max 50 logs
    if (this.data.automationLogs.length > 50) {
      this.data.automationLogs = this.data.automationLogs.slice(0, 50);
    }
    this.saveData();
    return newLog;
  }

  // Reset database to seed data
  resetDatabase() {
    this.data = getInitialData();
    this.saveData();
    return this.data;
  }
}

export const db = new Database();
