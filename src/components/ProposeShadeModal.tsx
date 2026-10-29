import React, { useState } from 'react';
import {
  ShadeProposal,
  ShadeProposalCategory,
  UserDemographics,
} from '../types';
import {
  saveShadeProposal,
  CATEGORY_LABELS,
  addCoolingTokens,
} from '../utils/storage';
import {
  SPONSORED_STARTER_KITS,
  StarterKitOption,
} from '../assets/starterKits';
import {
  Plus,
  X,
  Sparkles,
  MapPin,
  CheckCircle,
  AlertTriangle,
  User,
  Shield,
  Layers,
} from 'lucide-react';

interface ProposeShadeModalProps {
  coords: [number, number];
  userDemographics: UserDemographics;
  onClose: () => void;
  onProposalCreated: (newProposal: ShadeProposal) => void;
  onOpenDemographics: () => void;
  onOpenConceptPreview?: (kitId: string) => void;
}

export const ProposeShadeModal: React.FC<ProposeShadeModalProps> = ({
  coords,
  userDemographics,
  onClose,
  onProposalCreated,
  onOpenDemographics,
  onOpenConceptPreview,
}) => {
  const [category, setCategory] = useState<ShadeProposalCategory>('vertical_green');
  const [addressName, setAddressName] = useState<string>('Taichung Pedestrian Crossing');
  const [urgency, setUrgency] = useState<'critical_burn' | 'high_heat' | 'moderate'>('critical_burn');
  const [notes, setNotes] = useState<string>(
    'Harsh midday sunlight causes extreme heat here. Requesting shaded corridor for pedestrians.'
  );
  const [submitted, setSubmitted] = useState<boolean>(false);

  const starterKitKeys: ShadeProposalCategory[] = [
    'vertical_green',
    'misting_water',
    'shade_sail',
    'knitted_canopy',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const catLabel = CATEGORY_LABELS[category]?.label || category;
    const newProposal: ShadeProposal = {
      id: 'prop-' + Date.now(),
      userId: userDemographics.userId,
      userDemographics: {
        ageGroup: userDemographics.ageGroup,
        gender: userDemographics.gender,
        nationality: userDemographics.nationality,
        ethnicity: userDemographics.ethnicity,
      },
      coords,
      addressName: addressName.trim() || 'Taichung Street',
      category,
      categoryTitle: catLabel,
      notes: notes.trim(),
      urgency,
      upvotes: 1,
      hasPhoto: true,
      photoUrl: `/starter_kits/${category}.jpg`,
      createdAt: new Date().toISOString(),
      status: 'community_reviewed',
    };

    saveShadeProposal(newProposal);
    onProposalCreated(newProposal);

    // Award +50 Cooling Tokens for submitting heat spot proposal
    addCoolingTokens(50, 'Reported Heat Spot & Proposed Shade', addressName.trim() || 'Taichung Street');

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl max-w-lg w-full my-auto max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Propose New Urban Shade Infrastructure
              </h3>
              <p className="text-[11px] text-slate-400">
                Pin an unshaded sun trap and request community shade kits
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-500/60 flex items-center justify-center mx-auto text-3xl shadow-[0_0_25px_rgba(245,158,11,0.4)] animate-bounce">
              🪙
            </div>
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-950/90 border border-amber-500/60 text-amber-300 font-black text-xs tracking-wide">
                +50 COOLING TOKENS EARNED!
              </span>
              <h4 className="text-lg font-black text-white">Shade Proposal Submitted!</h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Thank you for contributing to cooler streets. Your +50 Cooling Tokens have been added to your balance, redeemable for partner cafe discounts, utility offsets, and community lotteries!
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 my-2">
            {/* Location Coordinate Badge */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-mono text-[11px]">
                  Pinned at: {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Taichung Map
              </span>
            </div>

            {/* Street / Location Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Street / Intersection Name *
              </label>
              <input
                type="text"
                value={addressName}
                onChange={(e) => setAddressName(e.target.value)}
                placeholder="e.g. Taiwan Blvd & Huizhong Rd intersection..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                required
              />
            </div>

            {/* Sponsored Starter Kits Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-300">
                  Select Shade Solution Kit *
                </label>
                <span className="text-[10px] text-purple-400 font-semibold">
                  Sponsored Starter Kits
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {starterKitKeys.map((key, index) => {
                  const kit = SPONSORED_STARTER_KITS[key];
                  const isSelected = category === key;
                  const imageSrc =
                    key === 'vertical_green'
                      ? '/starter_kits/vertical_green.jpg'
                      : key === 'misting_water'
                      ? '/starter_kits/misting_water.jpg'
                      : key === 'shade_sail'
                      ? '/starter_kits/shade_sail.jpg'
                      : '/starter_kits/knitted_canopy.jpg';

                  const imageLabel = `Image ${index + 1}: ${kit?.title || key}`;

                  return (
                    <div
                      key={key}
                      onClick={() => setCategory(key)}
                      className={`rounded-2xl border transition overflow-hidden cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-950/90 border-purple-400 shadow-lg shadow-purple-950/60 ring-2 ring-purple-500/40'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      {/* Literal Starter Kit Photo Thumbnail */}
                      <div className="relative w-full h-24 overflow-hidden bg-slate-900">
                        <img
                          src={imageSrc}
                          alt={imageLabel}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-300 border border-amber-400/30">
                          {imageLabel}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-purple-600 text-white p-1 rounded-full shadow-md">
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-1.5 right-1.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                          {kit?.coolingImpact}
                        </div>
                      </div>

                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-white text-xs flex items-center justify-between">
                            <span>{kit?.title || key}</span>
                            <span className="text-[10px] text-emerald-400 font-semibold">{kit?.shadeRatioBoost}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            {kit?.titleZh}
                          </div>
                          <div className="text-[10px] text-slate-300/80 mt-1 line-clamp-2">
                            {kit?.description}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/80">
                          <span className="text-slate-400 text-[9px]">{kit?.estimatedCost}</span>
                          {onOpenConceptPreview && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenConceptPreview(key);
                              }}
                              className="text-purple-300 hover:text-white flex items-center gap-1 font-semibold underline cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-amber-300" />
                              <span>AI Preview</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Other Traditional Shade Options */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Or Traditional / Municipal Shade Options
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ShadeProposalCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.icon} {v.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Solar Danger Level
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'critical_burn', label: '🔥 Critical Burn (40°C+)', color: 'border-rose-500 text-rose-300 bg-rose-950/80' },
                  { id: 'high_heat', label: '☀️ High Heat Trap', color: 'border-amber-500 text-amber-300 bg-amber-950/80' },
                  { id: 'moderate', label: '🌤️ Moderate Gap', color: 'border-slate-700 text-slate-300 bg-slate-950' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setUrgency(item.id as any)}
                    className={`p-2 rounded-xl border text-center font-bold text-[10px] transition cursor-pointer ${
                      urgency === item.id ? item.color : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes & Description */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Citizen Observation &amp; Details
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Describe pedestrian conditions, sunlight intensity, or why shade is needed..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition resize-none"
              />
            </div>

            {/* Demographics Attribution Badge */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  Proposing as: <b>{userDemographics.nationality}</b> ({userDemographics.ageGroup.replace('_', '-')})
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenDemographics}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
              >
                Change Profile
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 via-rose-600 to-purple-700 hover:from-purple-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-xl shadow-purple-950/60 transition cursor-pointer active:scale-95"
              >
                Submit Proposal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
