import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  Camera,
  UtensilsCrossed,
  ShoppingCart,
  HeartHandshake,
  Workflow,
  Settings,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navigation() {
  const { activeTab, setActiveTab, t, stats, shoppingList, foodRescue } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      icon: LayoutDashboard,
    },
    {
      id: 'inventory',
      label: t.nav.inventory,
      icon: Boxes,
      badge: stats?.expiringSoonCount ? stats.expiringSoonCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'scanner',
      label: t.nav.scanner,
      icon: Camera,
      highlight: true,
    },
    {
      id: 'recipes',
      label: t.nav.recipes,
      icon: UtensilsCrossed,
    },
    {
      id: 'shopping',
      label: t.nav.shopping,
      icon: ShoppingCart,
      badge: shoppingList.filter((i) => !i.completed).length || null,
      badgeColor: 'bg-stone-500 text-white',
    },
    {
      id: 'rescue',
      label: t.nav.rescue,
      icon: HeartHandshake,
      badge: foodRescue.filter((r) => r.status === 'available').length || null,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'automation',
      label: t.nav.automation,
      icon: Workflow,
    },
    {
      id: 'settings',
      label: t.nav.settings,
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Desktop / Tablet Horizontal Bar or Sidebar Submenu */}
      <nav className="hidden md:block bg-white/70 border-b border-stone-200/80 px-4 py-2 sticky top-[57px] z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2 no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                      : item.highlight
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-700' : 'text-stone-500'}`} />
                  <span>{item.label}</span>

                  {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1.5 shadow-lg">
        <div className="grid grid-cols-5 gap-1 items-center justify-around">
          {[
            navItems[0], // Dashboard
            navItems[1], // Stock
            navItems[2], // Scanner
            navItems[3], // Recettes
            navItems[5], // Rescue
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
                  isActive ? 'text-emerald-700' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.highlight
                      ? 'bg-emerald-50 text-emerald-700'
                      : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="truncate max-w-[62px] text-center mt-0.5">{item.label}</span>
                {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-0 right-2 px-1 rounded-full text-[9px] font-bold bg-amber-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
