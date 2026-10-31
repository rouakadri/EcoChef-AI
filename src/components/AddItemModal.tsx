import React, { useState } from 'react';
import { X, Plus, Sparkles, Refrigerator } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category, LocationType, UnitType } from '../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: {
    name?: string;
    category?: Category;
    quantity?: number;
    unit?: UnitType;
    location?: LocationType;
    expiryDays?: number;
    estimatedPrice?: number;
    notes?: string;
    imageEmoji?: string;
  };
}

export default function AddItemModal({ isOpen, onClose, initialValues }: AddItemModalProps) {
  const { t, addInventoryItem } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultExpiryStr = new Date(Date.now() + 86400000 * (initialValues?.expiryDays || 5))
    .toISOString()
    .split('T')[0];

  const [name, setName] = useState(initialValues?.name || '');
  const [category, setCategory] = useState<Category>(initialValues?.category || 'vegetables');
  const [quantity, setQuantity] = useState(initialValues?.quantity || 1);
  const [unit, setUnit] = useState<UnitType>(initialValues?.unit || 'pieces');
  const [location, setLocation] = useState<LocationType>(initialValues?.location || 'fridge');
  const [purchaseDate, setPurchaseDate] = useState(todayStr);
  const [expiryDate, setExpiryDate] = useState(defaultExpiryStr);
  const [estimatedPrice, setEstimatedPrice] = useState(initialValues?.estimatedPrice || 2.5);
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [imageEmoji, setImageEmoji] = useState(initialValues?.imageEmoji || '🥗');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const emojiPresets = ['🥦', '🍅', '🥕', '🍎', '🍌', '🥛', '🧀', '🥩', '🐟', '🥖', '🍝', '🥚', '🥫', '🍋', '🥑'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const success = await addInventoryItem({
      name: name.trim(),
      category,
      quantity: Number(quantity),
      unit,
      location,
      purchaseDate,
      expiryDate,
      estimatedPrice: Number(estimatedPrice),
      notes: notes.trim(),
      imageEmoji,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-stone-200 shadow-2xl p-6 sm:p-7 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Refrigerator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-stone-900">
              {t.inventory.addItem}
            </h3>
            <p className="text-xs text-stone-600">
              Ajoutez une denrée pour suivre sa fraîcheur.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Emoji */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-800">
              Nom de l'aliment *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Avocats mûrs, Yaourts bio..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
              />
              <div className="w-11 h-11 flex items-center justify-center text-2xl border border-stone-300 rounded-xl bg-stone-50 shrink-0">
                {imageEmoji}
              </div>
            </div>
            {/* Quick emoji selection */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
              {emojiPresets.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setImageEmoji(emoji)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center hover:bg-stone-100 transition-colors ${
                    imageEmoji === emoji ? 'bg-emerald-100 border border-emerald-300' : 'border border-stone-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800">
                {t.common.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="vegetables">{t.categories.vegetables}</option>
                <option value="fruits">{t.categories.fruits}</option>
                <option value="dairy">{t.categories.dairy}</option>
                <option value="meat_fish">{t.categories.meat_fish}</option>
                <option value="grains">{t.categories.grains}</option>
                <option value="canned">{t.categories.canned}</option>
                <option value="beverages">{t.categories.beverages}</option>
                <option value="condiments">{t.categories.condiments}</option>
                <option value="bakery">{t.categories.bakery}</option>
                <option value="other">{t.categories.other}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800">
                {t.common.location}
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as LocationType)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="fridge">❄️ {t.locations.fridge}</option>
                <option value="pantry">🌾 {t.locations.pantry}</option>
                <option value="freezer">🧊 {t.locations.freezer}</option>
              </select>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800">
                {t.common.quantity}
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800">
                Unité
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="pieces">Pièces (unités)</option>
                <option value="g">Grammes (g)</option>
                <option value="kg">Kilogrammes (kg)</option>
                <option value="ml">Millilitres (ml)</option>
                <option value="l">Litres (L)</option>
                <option value="packs">Paquets / Boîtes</option>
                <option value="slices">Tranches</option>
              </select>
            </div>
          </div>

          {/* Expiration Date & Estimated Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800">
                {t.common.expiryDate} *
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800">
                Prix estimé (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Notes & tips */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-800">
              Conseils ou notes (optionnel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Déjà ouvert, à consommer rapidement..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-md shadow-emerald-800/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? t.common.loading : t.common.add}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
