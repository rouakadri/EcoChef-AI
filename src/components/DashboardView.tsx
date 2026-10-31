import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  Flame,
  Euro,
  Trees,
  ChefHat,
  Camera,
  HeartHandshake,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  PackageCheck,
  Refrigerator,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function DashboardView() {
  const { t, stats, inventory, foodRescue, setActiveTab, consumeInventoryItem, isRtl } = useApp();

  const urgentItems = inventory.filter((item) => {
    const diff = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / 86400000);
    return diff <= 3;
  });

  const availableRescues = foodRescue.filter((r) => r.status === 'available').slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-xl shadow-emerald-900/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-teal-400/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>EcoChef AI • Intelligence Anti-Gaspillage</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {t.dashboard.welcome}
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-6">
            {t.dashboard.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('scanner')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-emerald-900 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all shadow-md shadow-emerald-950/20 hover:scale-[1.02] cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-700" />
              <span>{t.dashboard.scanFood}</span>
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600/60 hover:bg-emerald-600/80 text-white font-bold text-xs sm:text-sm border border-emerald-400/40 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <ChefHat className="w-4 h-4 text-emerald-200" />
              <span>{t.dashboard.generateRecipes}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Impact Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Stock */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              {t.dashboard.totalInStock}
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
              <Refrigerator className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              {stats?.totalItemsInStock ?? inventory.length}
            </span>
            <span className="text-xs font-semibold text-stone-600">articles</span>
          </div>
          <p className="text-[11px] text-stone-600 mt-1">
            Val. estimée ~ {stats?.totalValueInStock || 24} €
          </p>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => setActiveTab('inventory')}
          className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-all cursor-pointer group ${
            (stats?.expiringSoonCount || 0) > 0
              ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300 hover:shadow-md'
              : 'bg-white border-stone-200/80 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              (stats?.expiringSoonCount || 0) > 0 ? 'text-amber-800' : 'text-stone-600'
            }`}>
              {t.dashboard.expiringSoon}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              (stats?.expiringSoonCount || 0) > 0
                ? 'bg-amber-200/70 text-amber-900 group-hover:bg-amber-300'
                : 'bg-stone-100 text-stone-600'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold ${
              (stats?.expiringSoonCount || 0) > 0 ? 'text-amber-900' : 'text-stone-900'
            }`}>
              {stats?.expiringSoonCount ?? urgentItems.length}
            </span>
            <span className="text-xs font-semibold text-stone-600">à surveiller</span>
          </div>
          <p className="text-[11px] text-stone-600 mt-1">
            Priorité anti-gaspillage
          </p>
        </div>

        {/* Money Saved */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              {t.dashboard.moneySaved}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Euro className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
              +{stats?.impact.moneySavedEUR || 78.4}
            </span>
            <span className="text-sm font-bold text-emerald-700">€</span>
          </div>
          <p className="text-[11px] text-emerald-800 font-medium mt-1">
            ~ 22 repas valorisés
          </p>
        </div>

        {/* CO2 Avoided */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              {t.dashboard.co2Saved}
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Trees className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-800">
              +{stats?.impact.co2SavedKg || 37}
            </span>
            <span className="text-xs font-bold text-teal-700">kg CO₂</span>
          </div>
          <p className="text-[11px] text-teal-800 font-medium mt-1">
            Équivalent ~ 180 km en voiture
          </p>
        </div>
      </div>

      {/* Urgent Expiration Alert Strip */}
      {urgentItems.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/80 border border-amber-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-base">
                <Flame className="w-5 h-5 text-amber-600 animate-bounce" />
                <span>{t.dashboard.urgentTitle} ({urgentItems.length})</span>
              </div>
              <p className="text-xs text-amber-800/90 mt-0.5">
                {t.dashboard.urgentSubtitle}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('recipes')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <span>{t.dashboard.generateRecipes}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {urgentItems.slice(0, 3).map((item) => {
              const diffDays = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / 86400000);
              const isToday = diffDays <= 0;
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.imageEmoji || '🥗'}</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900">{item.name}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-600 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span className={`font-bold ${isToday ? 'text-rose-600' : 'text-amber-700'}`}>
                          {isToday ? t.common.today : `${diffDays} ${t.common.daysLeft}`}
                        </span>
                        <span>•</span>
                        <span>{item.quantity} {item.unit}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => consumeInventoryItem(item.id, 'cooked')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-colors cursor-pointer whitespace-nowrap"
                    title="Marquer comme cuisiné"
                  >
                    {t.common.cookThis}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid: Storage Distribution & Chef Tip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Distribution */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-stone-900 tracking-tight">
                {t.dashboard.viewLocations}
              </h3>
              <span className="text-xs text-stone-600 font-medium">
                {inventory.length} total
              </span>
            </div>

            <div className="space-y-4">
              {/* Fridge */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-700 flex items-center gap-1.5">
                    <span>❄️</span> {t.locations.fridge}
                  </span>
                  <span className="text-stone-900 font-bold">
                    {stats?.locationBreakdown.fridge ?? 0}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${inventory.length ? ((stats?.locationBreakdown.fridge || 0) / inventory.length) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Pantry */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-700 flex items-center gap-1.5">
                    <span>🌾</span> {t.locations.pantry}
                  </span>
                  <span className="text-stone-900 font-bold">
                    {stats?.locationBreakdown.pantry ?? 0}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${inventory.length ? ((stats?.locationBreakdown.pantry || 0) / inventory.length) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Freezer */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-700 flex items-center gap-1.5">
                    <span>🧊</span> {t.locations.freezer}
                  </span>
                  <span className="text-stone-900 font-bold">
                    {stats?.locationBreakdown.freezer ?? 0}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${inventory.length ? ((stats?.locationBreakdown.freezer || 0) / inventory.length) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-100">
            <button
              onClick={() => setActiveTab('inventory')}
              className="w-full py-2 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{t.common.viewAll}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Chef Tip & Food Rescue Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chef Tip Card */}
          <div className="p-6 rounded-3xl bg-[#F6F2EA] border border-[#E9E2D5] relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ChefHat className="w-6 h-6 text-emerald-100" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                    {t.dashboard.chefTipTitle}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Pain & Féculents
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed pt-1">
                  {t.dashboard.chefTipText}
                </p>
              </div>
            </div>
          </div>

          {/* Food Rescue Community Feed Preview */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-stone-900 tracking-tight">
                  {t.dashboard.communityTitle}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('rescue')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>{t.common.viewAll}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {availableRescues.map((rescue) => (
                <div
                  key={rescue.id}
                  onClick={() => setActiveTab('rescue')}
                  className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-stone-200/70 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={rescue.userAvatar}
                        alt={rescue.userName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-[11px] font-bold text-stone-700 truncate">
                        {rescue.userName}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-stone-900 line-clamp-1 mb-1">
                      {rescue.title}
                    </h4>
                    <p className="text-[11px] text-stone-600 line-clamp-1">
                      {rescue.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold mt-3 pt-2 border-t border-stone-200/50">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span className="truncate">{rescue.locationNeighborhood}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
