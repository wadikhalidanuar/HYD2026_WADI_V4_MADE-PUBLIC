import React, { useState } from 'react';
import { UserDemographics } from '../types';
import { saveUserDemographics } from '../utils/storage';
import { User, Shield, Sparkles, Check } from 'lucide-react';

interface DemographicsModalProps {
  currentDemographics: UserDemographics;
  onClose: () => void;
  onSave: (updated: UserDemographics) => void;
}

export const DemographicsModal: React.FC<DemographicsModalProps> = ({
  currentDemographics,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserDemographics>({ ...currentDemographics });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserDemographics = {
      ...formData,
      registered: true,
      registeredAt: formData.registeredAt || new Date().toISOString(),
    };
    saveUserDemographics(updated);
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl max-w-md w-full my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <img
              src="/app-logo.png"
              alt="UmbraNav Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-md border border-rose-500/40 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-sm font-bold text-white">Vampire Demographic Registration</h3>
              <p className="text-[11px] text-slate-400">Captures pedestrian profile for Taichung shade analytics</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-10 text-center space-y-2">
            <Check className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Profile Updated Successfully</h4>
            <p className="text-xs text-slate-400">Stored safely in browser storage for Taichung civic research.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 my-3">
            {/* Nickname & Clan */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Walker Nickname
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  placeholder="e.g. ShadowStrider"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Vampire Clan
                </label>
                <select
                  value={formData.vampireClan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vampireClan: e.target.value as UserDemographics['vampireClan'],
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Nosferatu Nightwalker">Nosferatu Nightwalker</option>
                  <option value="Shadowstalker">Shadowstalker</option>
                  <option value="Daywalker">Daywalker (Sun-Tolerant)</option>
                  <option value="Gothic Commuter">Gothic Commuter</option>
                </select>
              </div>
            </div>

            {/* Age Group */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Age Group *
              </label>
              <select
                value={formData.ageGroup}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ageGroup: e.target.value as UserDemographics['ageGroup'],
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="under_18">Under 18</option>
                <option value="18_24">18 - 24 years old (University / Youth)</option>
                <option value="25_34">25 - 34 years old (Young Professional)</option>
                <option value="35_49">35 - 49 years old (Mid Career / Parent)</option>
                <option value="50_64">50 - 64 years old (Senior Commuter)</option>
                <option value="65_plus">65+ years old (Elder / High Sun Risk)</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Gender *
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(['female', 'male', 'non_binary', 'prefer_not_to_say'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`py-1.5 px-1 rounded-xl text-center border capitalize transition cursor-pointer text-[11px] ${
                      formData.gender === g
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {g.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Nationality & Ethnicity */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nationality *
                </label>
                <select
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Taiwan">Taiwan (ROC)</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Japan">Japan</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Ethnicity / Heritage *
                </label>
                <select
                  value={formData.ethnicity}
                  onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Han Chinese">Han Chinese (Taiwanese)</option>
                  <option value="Indigenous Taiwanese">Indigenous Taiwanese (Amis, Atayal, etc.)</option>
                  <option value="Southeast Asian">Southeast Asian (Malay, Indonesian, Filipino, etc.)</option>
                  <option value="East Asian">East Asian (Japanese, Korean)</option>
                  <option value="South Asian">South Asian</option>
                  <option value="Caucasian">Caucasian / European</option>
                  <option value="African / Afro-descendant">African / Afro-descendant</option>
                  <option value="Mixed / Other">Mixed / Other</option>
                </select>
              </div>
            </div>

            {/* Walking Frequency */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Taichung Pedestrian Frequency
              </label>
              <select
                value={formData.walkingFrequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    walkingFrequency: e.target.value as UserDemographics['walkingFrequency'],
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="daily">Daily Commuter (Walk to bus, MRT, train, or work)</option>
                <option value="several_times_week">Several times a week (Shopping, dining, parks)</option>
                <option value="weekly">Weekly Stroller (Weekend markets, Calligraphy Greenway)</option>
                <option value="occasional">Occasional / Tourist in Taichung</option>
              </select>
            </div>

            {/* Heat & Sun Sensitivity */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Sun & Heat Sensitivity (Vampire Vulnerability)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'extreme_vampire', label: '🧛 Vampire Level (Sunburns in 5 mins)' },
                  { id: 'high', label: '🔥 High Heat Sensitivity (Avoids direct sun)' },
                  { id: 'moderate', label: '🌤️ Moderate (Prefers shade when hot)' },
                  { id: 'low', label: '☀️ Sun Seeker (Loves the heat)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        heatSensitivity: item.id as UserDemographics['heatSensitivity'],
                      })
                    }
                    className={`p-2 rounded-xl text-left border transition cursor-pointer text-[10px] leading-tight ${
                      formData.heatSensitivity === item.id
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy note */}
            <p className="text-[10px] text-slate-400">
              * Demographic data is stored locally in your browser and used to analyze which communities in Taichung need urban shade infrastructure most urgently.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950/50 transition cursor-pointer"
              >
                Save Demographics
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
