import React, { useState } from 'react';
import {
  Settings,
  User,
  Globe,
  Utensils,
  Users,
  RotateCcw,
  CheckCircle2,
  Save,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';

export default function SettingsView() {
  const { t, language, setLanguage, userSettings, updateSettings, resetAllData, showToast } = useApp();

  const [name, setName] = useState(userSettings?.name || 'Camille & Alex');
  const [email, setEmail] = useState(userSettings?.email || 'camille.alex@ecochef.local');
  const [householdSize, setHouseholdSize] = useState(userSettings?.householdSize || 2);
  const [dietary, setDietary] = useState(userSettings?.dietaryPreference || 'none');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSettings({
      name: name.trim(),
      email: email.trim(),
      householdSize: Number(householdSize),
      dietaryPreference: dietary as any,
    });
    setIsSaving(false);
  };

  const handleResetData = async () => {
    if (confirm('Voulez-vous restaurer les données initiales de démonstration ?')) {
      await resetAllData();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {t.settings.title}
        </h2>
        <p className="text-stone-700 text-xs sm:text-sm mt-0.5">
          {t.settings.subtitle}
        </p>
      </div>

      {/* Profile & Household Settings Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200/80 shadow-md">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Language selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>{t.settings.language}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'fr' as Language, label: 'Français', flag: '🇫🇷' },
                { code: 'ar' as Language, label: 'العربية (RTL)', flag: '🇸🇦' },
                { code: 'en' as Language, label: 'English', flag: '🇬🇧' },
              ].map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    language === lang.code
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 bg-[#FBF9F5] text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800">
                {t.settings.name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800">
                {t.settings.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800">
                {t.settings.household}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800">
                {t.settings.dietary}
              </label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="none">Aucun (Tout)</option>
                <option value="vegetarian">Végétarien</option>
                <option value="vegan">Végan</option>
                <option value="gluten_free">Sans gluten</option>
                <option value="halal">Halal</option>
                <option value="quick">Repas rapides (&lt; 20 min)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-800/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? t.common.loading : t.common.save}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-200/80 flex items-center justify-between gap-4">
        <div>
          <h4 className="font-extrabold text-xs text-rose-900">
            {t.common.resetData}
          </h4>
          <p className="text-[11px] text-rose-700/80 mt-0.5">
            Réinitialise le stock, les annonces Food Rescue et les simulations d'automatisation.
          </p>
        </div>
        <button
          onClick={handleResetData}
          className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser</span>
        </button>
      </div>
    </div>
  );
}
