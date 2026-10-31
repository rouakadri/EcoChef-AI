import React, { useState, useRef, useEffect } from 'react';
import { Leaf, Bell, Globe, Sparkles, AlertTriangle, CheckCircle2, ChevronDown, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';

export default function Header() {
  const { language, setLanguage, t, inventory, stats, setActiveTab, userSettings } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Expiring items (< 3 days)
  const expiringItems = inventory.filter((item) => {
    const diff = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / 86400000);
    return diff <= 3;
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 group-hover:text-emerald-700 transition-colors">
                EcoChef
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                AI
              </span>
            </div>
            <p className="text-[11px] text-stone-700 hidden sm:block font-medium">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Quick Highlights Pills (Desktop) */}
        {stats && (
          <div className="hidden lg:flex items-center gap-2">
            <div
              onClick={() => setActiveTab('inventory')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200/70 text-xs font-semibold text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{stats.totalItemsInStock} {t.dashboard.totalInStock}</span>
            </div>

            {stats.expiringSoonCount > 0 && (
              <div
                onClick={() => setActiveTab('inventory')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 hover:bg-amber-100/70 transition-colors cursor-pointer animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{stats.expiringSoonCount} {t.dashboard.expiringSoon}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>+{stats.impact.savedKgsThisMonth} kg sauvés</span>
            </div>
          </div>
        )}

        {/* Actions Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-all shadow-xs"
              title="Changer de langue"
            >
              <Globe className="w-3.5 h-3.5 text-stone-700" />
              <span className="uppercase font-bold tracking-wider">{language}</span>
              <ChevronDown className="w-3 h-3 text-stone-600" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white border border-stone-200 shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left ${
                      language === l.code ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </span>
                    {language === l.code && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors shadow-xs"
              title="Alertes péremption"
            >
              <Bell className="w-4 h-4 text-stone-600" />
              {expiringItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                  {expiringItems.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-stone-200 shadow-xl p-3 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    {t.automation.channelsTitle}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {expiringItems.length} {t.dashboard.urgentTitle.toLowerCase()}
                  </span>
                </div>

                {expiringItems.length === 0 ? (
                  <div className="py-6 text-center text-xs text-stone-600">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    Tout va bien ! Aucun aliment ne périme sous 72h.
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {expiringItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowNotifications(false);
                          setActiveTab('recipes');
                        }}
                        className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 border border-amber-200/60 hover:bg-amber-100/50 transition-colors cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.imageEmoji || '🥗'}</span>
                          <div>
                            <p className="font-bold text-stone-800">{item.name}</p>
                            <p className="text-[10px] text-amber-800 font-medium">
                              Expire le {item.expiryDate} ({item.quantity} {item.unit})
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200">
                          Cuisiner →
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 mt-2 border-t border-stone-100 flex items-center justify-between text-xs px-1">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setActiveTab('automation');
                    }}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    Configurer n8n & alertes
                  </button>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setActiveTab('recipes');
                    }}
                    className="text-stone-700 hover:text-stone-900 font-medium"
                  >
                    Sauver en cuisine →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold shadow-xs transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline max-w-[100px] truncate">
              {userSettings?.name || 'Mon Foyer'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
