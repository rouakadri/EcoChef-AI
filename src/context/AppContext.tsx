import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  InventoryItem,
  FoodRescueListing,
  ShoppingItem,
  UserSettings,
  AppStats,
  Language,
} from '../types';
import { translations } from '../i18n/translations';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRtl: boolean;
  t: typeof translations['fr'];
  activeTab: string;
  setActiveTab: (tab: string) => void;

  inventory: InventoryItem[];
  stats: AppStats | null;
  shoppingList: ShoppingItem[];
  foodRescue: FoodRescueListing[];
  userSettings: UserSettings | null;
  automationLogs: any[];
  isLoading: boolean;
  toasts: Toast[];

  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  celebrate: () => void;

  refreshData: () => Promise<void>;
  addInventoryItem: (item: any) => Promise<boolean>;
  addBatchInventoryItems: (items: any[]) => Promise<number>;
  updateInventoryItem: (id: string, patch: any) => Promise<boolean>;
  deleteInventoryItem: (id: string) => Promise<boolean>;
  consumeInventoryItem: (id: string, action?: 'cooked' | 'discarded' | 'rescued') => Promise<boolean>;

  addShoppingItem: (item: any) => Promise<boolean>;
  updateShoppingItem: (id: string, patch: any) => Promise<boolean>;
  deleteShoppingItem: (id: string) => Promise<boolean>;
  transferShoppingToInventory: (itemIds?: string[]) => Promise<number>;
  clearCompletedShopping: () => Promise<void>;

  postFoodRescue: (listing: any) => Promise<boolean>;
  reserveFoodRescue: (id: string) => Promise<boolean>;

  updateSettings: (patch: Partial<UserSettings>) => Promise<boolean>;
  testN8nWebhook: (customUrl?: string) => Promise<any>;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [foodRescue, setFoodRescue] = useState<FoodRescueListing[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [automationLogs, setAutomationLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const isRtl = language === 'ar';
  const t = translations[language] || translations['fr'];

  // Keep html dir and lang attribute in sync
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (userSettings) {
      updateSettings({ language: lang });
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const celebrate = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#14532d', '#f59e0b', '#34d399'],
      });
    } catch {
      // ignore
    }
  };

  const refreshData = async () => {
    try {
      const [invRes, statsRes, shopRes, rescueRes, setRes, logsRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/stats'),
        fetch('/api/shopping-list'),
        fetch('/api/food-rescue'),
        fetch('/api/settings'),
        fetch('/api/automation/logs'),
      ]);

      if (invRes.ok) setInventory(await invRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (shopRes.ok) setShoppingList(await shopRes.json());
      if (rescueRes.ok) setFoodRescue(await rescueRes.json());
      if (logsRes.ok) setAutomationLogs(await logsRes.json());
      if (setRes.ok) {
        const u = await setRes.json();
        setUserSettings(u);
        if (u.language && u.language !== language) {
          setLanguageState(u.language);
          document.documentElement.lang = u.language;
          document.documentElement.dir = u.language === 'ar' ? 'rtl' : 'ltr';
        }
      }
    } catch (err) {
      console.error('Error fetching data from EcoChef API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addInventoryItem = async (item: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const created = await res.json();
        setInventory((prev) => [created, ...prev]);
        showToast(
          language === 'ar'
            ? `تمت إضافة ${created.name} إلى المخزون بنجاح`
            : language === 'en'
            ? `Added ${created.name} to pantry`
            : `${created.name} a été ajouté à votre stock`
        );
        refreshData();
        return true;
      }
    } catch (err) {
      showToast('Erreur lors de l\'ajout', 'error');
    }
    return false;
  };

  const addBatchInventoryItems = async (items: any[]): Promise<number> => {
    try {
      const res = await fetch('/api/inventory/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        const data = await res.json();
        celebrate();
        showToast(
          language === 'ar'
            ? `تمت إضافة ${data.count} عناصر بنجاح إلى المخزون!`
            : language === 'en'
            ? `Successfully added ${data.count} items to your pantry!`
            : `${data.count} aliment(s) ajoutés avec succès au stock !`
        );
        refreshData();
        return data.count;
      }
    } catch (err) {
      showToast('Erreur lors de l\'enregistrement groupé', 'error');
    }
    return 0;
  };

  const updateInventoryItem = async (id: string, patch: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const updated = await res.json();
        setInventory((prev) => prev.map((item) => (item.id === id ? updated : item)));
        showToast(language === 'ar' ? 'تم تحديث العنصر' : language === 'en' ? 'Item updated' : 'Aliment mis à jour');
        refreshData();
        return true;
      }
    } catch (err) {
      showToast('Erreur mise à jour', 'error');
    }
    return false;
  };

  const deleteInventoryItem = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInventory((prev) => prev.filter((item) => item.id !== id));
        showToast(language === 'ar' ? 'تم الحذف' : language === 'en' ? 'Item deleted' : 'Aliment supprimé');
        refreshData();
        return true;
      }
    } catch (err) {
      showToast('Erreur de suppression', 'error');
    }
    return false;
  };

  const consumeInventoryItem = async (id: string, action: 'cooked' | 'discarded' | 'rescued' = 'cooked'): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/${id}/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        celebrate();
        showToast(
          language === 'ar'
            ? 'أحسنت! تم إنقاذ هذا المكون وطهيه بنجاح 🌱'
            : language === 'en'
            ? 'Awesome! You saved and cooked this ingredient 🌱'
            : 'Bravo ! Ingrédient sauvé et cuisiné sans gaspillage 🌱'
        );
        refreshData();
        return true;
      }
    } catch (err) {
      showToast('Erreur', 'error');
    }
    return false;
  };

  const addShoppingItem = async (item: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const created = await res.json();
        setShoppingList((prev) => [created, ...prev]);
        showToast(language === 'ar' ? 'تمت الإضافة لقائمة التسوق' : language === 'en' ? 'Added to shopping list' : 'Ajouté à la liste de courses');
        return true;
      }
    } catch (err) {
      showToast('Erreur lors de l\'ajout', 'error');
    }
    return false;
  };

  const updateShoppingItem = async (id: string, patch: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/shopping-list/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const updated = await res.json();
        setShoppingList((prev) => prev.map((item) => (item.id === id ? updated : item)));
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const deleteShoppingItem = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/shopping-list/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setShoppingList((prev) => prev.filter((item) => item.id !== id));
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const transferShoppingToInventory = async (itemIds?: string[]): Promise<number> => {
    try {
      const res = await fetch('/api/shopping-list/transfer-to-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds, defaultLocation: 'fridge', expiryDaysOffset: 7 }),
      });
      if (res.ok) {
        const data = await res.json();
        celebrate();
        showToast(
          language === 'ar'
            ? `تم تحويل ${data.count} عنصر مشتريات إلى المخزون بنجاح!`
            : language === 'en'
            ? `Transferred ${data.count} groceries into your stock!`
            : `${data.count} article(s) transféré(s) dans votre stock avec succès !`
        );
        refreshData();
        return data.count;
      }
    } catch (err) {
      showToast('Erreur transfert', 'error');
    }
    return 0;
  };

  const clearCompletedShopping = async (): Promise<void> => {
    try {
      await fetch('/api/shopping-list/clear-completed', { method: 'POST' });
      setShoppingList((prev) => prev.filter((i) => !i.completed));
    } catch (err) {
      console.error(err);
    }
  };

  const postFoodRescue = async (listing: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/food-rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listing),
      });
      if (res.ok) {
        const created = await res.json();
        setFoodRescue((prev) => [created, ...prev]);
        celebrate();
        showToast(
          language === 'ar'
            ? 'شكراً لك! تم نشر عرض إنقاذ الطعام للجيران بنجاح'
            : language === 'en'
            ? 'Thank you! Your food rescue donation is now published'
            : 'Merci pour ce don ! Votre aliment est proposé à vos voisins'
        );
        return true;
      }
    } catch (err) {
      showToast('Erreur de publication', 'error');
    }
    return false;
  };

  const reserveFoodRescue = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/food-rescue/${id}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservedBy: userSettings?.name || 'Voisin solidaire' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setFoodRescue((prev) => prev.map((item) => (item.id === id ? updated : item)));
        showToast(
          language === 'ar'
            ? 'تم حجز الطعام! يمكنك الآن التواصل مع المانح للاستلام'
            : language === 'en'
            ? 'Reserved! Contact the donor to arrange pickup'
            : 'Aliment réservé ! Vous pouvez contacter le donateur pour la récupération'
        );
        return true;
      }
    } catch (err) {
      showToast('Erreur lors de la réservation', 'error');
    }
    return false;
  };

  const updateSettings = async (patch: Partial<UserSettings>): Promise<boolean> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const updated = await res.json();
        setUserSettings(updated);
        showToast(language === 'ar' ? 'تم حفظ التعديلات' : language === 'en' ? 'Settings saved' : 'Paramètres enregistrés');
        return true;
      }
    } catch (err) {
      showToast('Erreur enregistrement', 'error');
    }
    return false;
  };

  const testN8nWebhook = async (customUrl?: string): Promise<any> => {
    try {
      const res = await fetch('/api/automation/test-n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: customUrl || userSettings?.n8nWebhookUrl }),
      });
      const data = await res.json();
      refreshData();
      return data;
    } catch (err: any) {
      showToast('Erreur webhook n8n', 'error');
      return { success: false, error: err.message };
    }
  };

  const resetAllData = async (): Promise<void> => {
    try {
      await fetch('/api/reset-data', { method: 'POST' });
      await refreshData();
      showToast('Données réinitialisées avec succès');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        isRtl,
        t,
        activeTab,
        setActiveTab,
        inventory,
        stats,
        shoppingList,
        foodRescue,
        userSettings,
        automationLogs,
        isLoading,
        toasts,
        showToast,
        removeToast,
        celebrate,
        refreshData,
        addInventoryItem,
        addBatchInventoryItems,
        updateInventoryItem,
        deleteInventoryItem,
        consumeInventoryItem,
        addShoppingItem,
        updateShoppingItem,
        deleteShoppingItem,
        transferShoppingToInventory,
        clearCompletedShopping,
        postFoodRescue,
        reserveFoodRescue,
        updateSettings,
        testN8nWebhook,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
