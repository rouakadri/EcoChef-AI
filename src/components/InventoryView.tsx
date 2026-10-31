import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Trash2,
  ChefHat,
  HeartHandshake,
  ShoppingCart,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Refrigerator,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category, InventoryItem, LocationType } from '../types';
import AddItemModal from './AddItemModal';

export default function InventoryView() {
  const {
    t,
    inventory,
    deleteInventoryItem,
    consumeInventoryItem,
    addShoppingItem,
    setActiveTab,
    postFoodRescue,
    language,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<'all' | LocationType>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Category>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'urgent' | 'soon' | 'fresh'>('all');
  const [sortBy, setSortBy] = useState<'expiry' | 'name' | 'quantity'>('expiry');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Compute days left helper
  const getDaysLeft = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    return Math.ceil((exp.getTime() - today.getTime()) / 86400000);
  };

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    return inventory
      .filter((item) => {
        // Search
        if (searchQuery.trim() && !item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
          return false;
        }
        // Location
        if (selectedLocation !== 'all' && item.location !== selectedLocation) {
          return false;
        }
        // Category
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }
        // Expiry status
        const days = getDaysLeft(item.expiryDate);
        if (selectedStatus === 'urgent' && days > 2) return false;
        if (selectedStatus === 'soon' && (days <= 2 || days > 5)) return false;
        if (selectedStatus === 'fresh' && days <= 5) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'expiry') {
          return a.expiryDate.localeCompare(b.expiryDate);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return b.quantity - a.quantity;
      });
  }, [inventory, searchQuery, selectedLocation, selectedCategory, selectedStatus, sortBy]);

  // Quick donate action
  const handleQuickDonate = async (item: InventoryItem) => {
    const success = await postFoodRescue({
      title: `${item.name} (${item.quantity} ${item.unit})`,
      category: item.category,
      quantity: `${item.quantity} ${item.unit}`,
      locationNeighborhood: 'Centre-ville (près de chez moi)',
      expiryDate: item.expiryDate,
      description: item.notes || 'Aliment en surplus issu de mon stock, en parfait état à donner !',
    });
    if (success) {
      deleteInventoryItem(item.id);
      setActiveTab('rescue');
    }
  };

  // Quick add to shopping list
  const handleAddToShopping = (item: InventoryItem) => {
    addShoppingItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      priority: 'normal',
      estimatedCost: item.estimatedPrice || 2.0,
      addedFromExpiry: true,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.inventory.title}
          </h2>
          <p className="text-stone-700 text-xs sm:text-sm mt-0.5">
            {t.inventory.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('scanner')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Scanner IA</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-800/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.inventory.addItem}</span>
          </button>
        </div>
      </div>

      {/* Filter and Controls Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-3">
        {/* Search bar & Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.common.search}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-stone-900 text-xs sm:text-sm bg-[#FBF9F5]/60 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-[#FBF9F5]/60 text-xs font-semibold text-stone-700 w-full sm:w-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-stone-800 font-bold focus:outline-hidden text-xs"
              >
                <option value="expiry">Date péremption (urgent)</option>
                <option value="name">Nom alphabétique</option>
                <option value="quantity">Quantité</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-stone-100">
          {[
            { id: 'all', label: t.common.all },
            { id: 'fridge', label: `❄️ ${t.locations.fridge}` },
            { id: 'pantry', label: `🌾 ${t.locations.pantry}` },
            { id: 'freezer', label: `🧊 ${t.locations.freezer}` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedLocation(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedLocation === tab.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <span className="hidden sm:inline-block w-px h-4 bg-stone-200 mx-1"></span>

          {/* Status Pills */}
          {[
            { id: 'all', label: 'Toutes fraîcheurs' },
            { id: 'urgent', label: `🚨 ${t.inventory.statusUrgent}` },
            { id: 'soon', label: `⏳ ${t.inventory.statusSoon}` },
            { id: 'fresh', label: `🌿 ${t.inventory.statusFresh}` },
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setSelectedStatus(status.id as any)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedStatus === status.id
                  ? 'bg-stone-900 text-white font-bold'
                  : 'bg-transparent text-stone-700 hover:bg-stone-100'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-stone-200/80 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center mx-auto mb-3">
            <Refrigerator className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-stone-900 text-base mb-1">
            {t.inventory.empty}
          </h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto mb-4">
            Ajoutez manuellement vos denrées ou prenez une photo de votre réfrigérateur avec l'IA.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              {t.inventory.addItem}
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Scanner avec l'IA
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const daysLeft = getDaysLeft(item.expiryDate);
            const isCritical = daysLeft <= 0;
            const isUrgent = daysLeft > 0 && daysLeft <= 2;
            const isSoon = daysLeft > 2 && daysLeft <= 4;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl bg-white border shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  isCritical
                    ? 'border-rose-300 ring-1 ring-rose-300/50'
                    : isUrgent
                    ? 'border-amber-300 ring-1 ring-amber-300/40'
                    : 'border-stone-200/80 hover:border-emerald-300'
                }`}
              >
                <div>
                  {/* Top line with emoji, title and badge */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 rounded-2xl bg-[#FBF9F5] border border-stone-200/80 group-hover:scale-105 transition-transform">
                        {item.imageEmoji || '🥗'}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold mt-0.5">
                          <span>{item.quantity} {item.unit}</span>
                          <span>•</span>
                          <span className="capitalize text-stone-600">
                            {item.location === 'fridge' ? '❄️ Frigo' : item.location === 'pantry' ? '🌾 Placard' : '🧊 Congélo'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expiry pill */}
                    <div
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold whitespace-nowrap flex items-center gap-1 ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isUrgent
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : isSoon
                          ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        {isCritical
                          ? t.common.today
                          : `${daysLeft} ${t.common.daysLeft}`}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Tips if any */}
                  {item.notes && (
                    <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-xl mt-2 line-clamp-2">
                      💡 {item.notes}
                    </p>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Mark cooked */}
                    <button
                      onClick={() => consumeInventoryItem(item.id, 'cooked')}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Marquer comme cuisiné"
                    >
                      <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.common.cookThis}</span>
                    </button>

                    {/* Quick donate */}
                    <button
                      onClick={() => handleQuickDonate(item)}
                      className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600 hover:text-emerald-700 transition-colors"
                      title={t.common.shareRescue}
                    >
                      <HeartHandshake className="w-4 h-4" />
                    </button>

                    {/* Add to shopping */}
                    <button
                      onClick={() => handleAddToShopping(item)}
                      className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
                      title={t.common.addShopping}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => deleteInventoryItem(item.id)}
                    className="p-1.5 rounded-xl hover:bg-rose-50 text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
