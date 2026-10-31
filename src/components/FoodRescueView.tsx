import React, { useState } from 'react';
import {
  HeartHandshake,
  Plus,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Share2,
  X,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FoodRescueListing } from '../types';

export default function FoodRescueView() {
  const { t, foodRescue, postFoodRescue, reserveFoodRescue, userSettings, isRtl } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'mine'>('all');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedClaimListing, setSelectedClaimListing] = useState<FoodRescueListing | null>(null);

  // Form states for new donation
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('fruits');
  const [quantity, setQuantity] = useState('');
  const [neighborhood, setNeighborhood] = useState('Mon quartier (500m)');
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState(userSettings?.email || '');

  const filteredListings = foodRescue.filter((item) => {
    if (activeFilter === 'available') return item.status === 'available';
    if (activeFilter === 'mine') return item.userId === 'user_1';
    return true;
  });

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !quantity.trim()) return;

    const success = await postFoodRescue({
      title: title.trim(),
      category,
      quantity: quantity.trim(),
      locationNeighborhood: neighborhood.trim(),
      expiryDate,
      description: description.trim() || 'Aliment en parfait état à donner gratuitement pour éviter le gaspillage.',
      userPhoneOrContact: contact.trim(),
    });

    if (success) {
      setIsPostModalOpen(false);
      setTitle('');
      setQuantity('');
      setDescription('');
    }
  };

  const handleConfirmReservation = async (id: string) => {
    await reserveFoodRescue(id);
    setSelectedClaimListing(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
            <span>Solidarité Anti-Gaspi de Proximité</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t.rescue.title}
          </h2>
          <p className="text-stone-700 text-xs sm:text-sm mt-0.5 max-w-2xl">
            {t.rescue.subtitle}
          </p>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-800/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{t.rescue.postDonation}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        {[
          { id: 'all', label: t.rescue.filterAll },
          { id: 'available', label: t.rescue.filterAvailable },
          { id: 'mine', label: t.rescue.filterMyPosts },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Community Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((listing) => {
          const isAvailable = listing.status === 'available';
          const isReserved = listing.status === 'reserved';
          const isMine = listing.userId === 'user_1';

          return (
            <div
              key={listing.id}
              className={`p-5 rounded-3xl bg-white border shadow-xs transition-all flex flex-col justify-between ${
                isAvailable
                  ? 'border-stone-200/80 hover:border-emerald-300 hover:shadow-md'
                  : 'border-stone-200 bg-stone-50/70 opacity-80'
              }`}
            >
              <div>
                {/* Donor Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={listing.userAvatar}
                      alt={listing.userName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900 block leading-tight">
                        {listing.userName}
                      </span>
                      <span className="text-[10px] text-stone-600">
                        Posté le {listing.createdAt}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : isReserved
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {isAvailable
                      ? t.rescue.availableTag
                      : isReserved
                      ? `${t.rescue.reservedTag} (${listing.reservedBy || ''})`
                      : t.rescue.completedTag}
                  </span>
                </div>

                {/* Listing Details */}
                <h3 className="font-extrabold text-stone-900 text-base mb-1">
                  {listing.title}
                </h3>
                <p className="text-xs font-semibold text-emerald-800 mb-2">
                  Quantité : {listing.quantity}
                </p>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                  {listing.description}
                </p>
              </div>

              {/* Location, Expiry & Claim Button */}
              <div className="pt-3 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span className="flex items-center gap-1 font-semibold text-stone-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate max-w-[150px]">{listing.locationNeighborhood}</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-800">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>À consommer avant {listing.expiryDate}</span>
                  </span>
                </div>

                {isAvailable && !isMine && (
                  <button
                    onClick={() => setSelectedClaimListing(listing)}
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>{t.rescue.reserveBtn}</span>
                  </button>
                )}

                {isMine && (
                  <div className="w-full py-2 rounded-xl bg-stone-100 text-stone-600 text-[11px] font-bold text-center">
                    C'est votre annonce de don
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim / Reserve Modal */}
      {selectedClaimListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white border border-stone-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedClaimListing(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <HeartHandshake className="w-6 h-6" />
            </div>

            <h3 className="text-center font-extrabold text-stone-900 text-lg mb-1">
              Réserver ce don alimentaire
            </h3>
            <p className="text-center text-xs text-stone-600 mb-4">
              Vous allez réserver <strong>{selectedClaimListing.title}</strong> auprès de{' '}
              <strong>{selectedClaimListing.userName}</strong>.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-stone-200/80 text-xs space-y-2 mb-5">
              <div className="flex items-center gap-2 text-stone-700 font-semibold">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{selectedClaimListing.locationNeighborhood}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-700 font-semibold">
                <Mail className="w-4 h-4 text-stone-500" />
                <span>{selectedClaimListing.userPhoneOrContact}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedClaimListing(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => handleConfirmReservation(selectedClaimListing.id)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-800/20"
              >
                Confirmer la réservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Donation Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-stone-200 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-stone-900">
                  {t.rescue.postDonation}
                </h3>
                <p className="text-xs text-stone-600">
                  Partagez un aliment non consommé avec un voisin.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateDonation} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800">
                  Titre de l'aliment à donner *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Caisse de pommes du jardin, 3 yaourts fermés..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-800">
                    Quantité *
                  </label>
                  <input
                    type="text"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Ex: 2 briques de 1L, 1 kg"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-800">
                    {t.common.expiryDate}
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800">
                  Quartier / Lieu de récupération
                </label>
                <input
                  type="text"
                  required
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Ex: Centre-ville, Quartier de la Gare..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs sm:text-sm bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800">
                  Description ou précisions
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Produits neufs jamais ouverts, achetés en trop grand nombre..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800">
                  Contact pour le voisin (téléphone ou email)
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Ex: +33 6 12 34 56 78 ou contact@email.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-900 text-xs bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-md shadow-emerald-800/20 transition-all cursor-pointer"
                >
                  Publier l'annonce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
