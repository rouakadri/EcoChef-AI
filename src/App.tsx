import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import DashboardView from './components/DashboardView';
import VisionScannerView from './components/VisionScannerView';
import InventoryView from './components/InventoryView';
import RecipeGeneratorView from './components/RecipeGeneratorView';
import ShoppingListView from './components/ShoppingListView';
import FoodRescueView from './components/FoodRescueView';
import AutomationN8nView from './components/AutomationN8nView';
import SettingsView from './components/SettingsView';
import NotificationToast from './components/NotificationToast';

function AppContent() {
  const { activeTab, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center animate-pulse mb-3 shadow-lg">
          <span className="text-xl">🌱</span>
        </div>
        <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">
          Chargement d'EcoChef AI...
        </p>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'inventory':
        return <InventoryView />;
      case 'scanner':
        return <VisionScannerView />;
      case 'recipes':
        return <RecipeGeneratorView />;
      case 'shopping':
        return <ShoppingListView />;
      case 'rescue':
        return <FoodRescueView />;
      case 'automation':
        return <AutomationN8nView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-stone-900 pb-20 md:pb-12">
      <Header />
      <Navigation />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {renderCurrentView()}
      </main>
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
