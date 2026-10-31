import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Check,
  Trash2,
  PackageCheck,
  Sparkles,
  ArrowRight,
  Euro,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category } from '../types';

export default function ShoppingListView() {
  const {
    t,
    shoppingList,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    transferShoppingToInventory,
    clearCompletedShopping,
    inventory,
    isRtl,
  } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('vegetables');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pieces');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [estimatedCost, setEstimatedCost] = useState(2.5);

  const completedCount = shoppingList.filter((i) => i.completed).length;
  const totalCost = shoppingList.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addShoppingItem({
      name: name.trim(),
      category,
      quantity: Number(quantity),
      unit,
      priority,
      estimatedCost: Number(estimatedCost),
    });

    setName('');
  };

  // Group items by category
  const groupedItems = shoppingList.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as { [key: string]: typeof shoppingList });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.shopping.title}
          </h2>
          <p className="text-stone-700 text-xs sm:text-sm mt-0.5">
            {t.shopping.subtitle}
          </p>
        </div>

        {completedCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => transferShoppingToInventory()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-800/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <PackageCheck className="w-4 h-4 text-emerald-200" />
              <span>{t.shopping.transferBought} ({completedCount})</span>
            </button>
            <button
              onClick={clearCompletedShopping}
              className="p-2.5 rounded-xl border border-stone-300 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              title={t.shopping.clearCompleted}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Add New Shopping Item Card */}
      <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs">
        <form onSubmit={handleAddItem} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Oeufs bio, Huile d'olive, Farine..."
              className="flex-1 w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-xs sm:text-sm bg-[#FBF9F5]/60 focus:ring-2 focus:ring-emerald-500"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="px-3 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-xs sm:text-sm bg-[#FBF9F5]/60 focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
            >
              <option value="vegetables">{t.categories.vegetables}</option>
              <option value="fruits">{t.categories.fruits}</option>
              <option value="dairy">{t.categories.dairy}</option>
              <option value="meat_fish">{t.categories.meat_fish}</option>
              <option value="grains">{t.categories.grains}</option>
              <option value="canned">{t.categories.canned}</option>
              <option value="condiments">{t.categories.condiments}</option>
              <option value="bakery">{t.categories.bakery}</option>
              <option value="beverages">{t.categories.beverages}</option>
              <option value="other">{t.categories.other}</option>
            </select>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-16 px-2.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-xs sm:text-sm bg-[#FBF9F5]/60 text-center"
              />

              <button
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{t.common.add}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Shopping List Items */}
      {shoppingList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-stone-200/80 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center mx-auto mb-3">
            <ShoppingCart className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-stone-900 text-base mb-1">
            {t.shopping.empty}
          </h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto">
            Ajoutez les ingrédients manquants pour vos prochaines recettes anti-gaspi.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([catKey, items]) => (
            <div key={catKey} className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-600 mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-stone-500" />
                <span>{(t.categories as any)[catKey] || catKey}</span>
                <span className="text-stone-600 font-normal">({items.length})</span>
              </h3>

              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      item.completed
                        ? 'bg-stone-50/70 border-stone-200 opacity-60'
                        : 'bg-[#FBF9F5]/70 border-stone-200/80 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateShoppingItem(item.id, { completed: !item.completed })}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                          item.completed
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-stone-300 hover:border-emerald-500 bg-white'
                        }`}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <span
                          className={`text-xs sm:text-sm font-bold block ${
                            item.completed ? 'line-through text-stone-600' : 'text-stone-900'
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="text-[11px] text-stone-600 font-medium">
                          {item.quantity} {item.unit}
                          {item.addedFromExpiry && ' • Renouvellement suggéré'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-600">
                        ~ {item.estimatedCost.toFixed(2)} €
                      </span>
                      <button
                        onClick={() => deleteShoppingItem(item.id)}
                        className="p-1.5 text-stone-600 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Cart Cost Estimate Summary */}
          <div className="p-4 rounded-2xl bg-[#F6F2EA] border border-[#E9E2D5] flex items-center justify-between text-xs sm:text-sm">
            <span className="font-bold text-stone-700">{t.shopping.estimatedTotal} :</span>
            <span className="font-extrabold text-stone-900 text-base">
              ~ {totalCost.toFixed(2)} €
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
