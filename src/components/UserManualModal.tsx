import React from 'react';
import {
  BookOpen,
  X,
  Navigation,
  Shield,
  Sun,
  Umbrella,
  Heart,
  Trees,
  Plus,
  Compass,
  Sparkles,
  Layers,
  Thermometer,
} from 'lucide-react';

interface UserManualModalProps {
  onClose: () => void;
  onOpenRoutes: () => void;
  onOpenPropose: () => void;
  onOpenDemographics: () => void;
  onOpenCover: () => void;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({
  onClose,
  onOpenRoutes,
  onOpenPropose,
  onOpenDemographics,
  onOpenCover,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl max-w-xl w-full my-auto max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-950/80 border border-teal-500/50 text-teal-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Happy Vampire User Manual &amp; Field Guide
              </h3>
              <p className="text-[11px] text-slate-400">
                Interface explanation, symbols guide, and gameplay mechanics
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

        {/* Section 1: Vampire Lore & HP System */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>1. Vampire Health &amp; Solar Sizzling Mechanics</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In Taichung's intense subtropical climate, daytime UV Index regularly surges past 11+. When walking outdoors:
          </p>
          <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
            <li>
              <b className="text-rose-400">Unshaded Direct Sunlight (&lt;50% Shade):</b> Vampire starts sizzling! Red screen vignette pulses and HP drains rapidly.
            </li>
            <li>
              <b className="text-purple-300">Continuous Arcades (騎樓 95% Shade):</b> 100% solar radiation protection. HP slowly regenerates.
            </li>
            <li>
              <b className="text-emerald-300">Tree Canopies (70-90% Shade):</b> Filtered sunlight. Keeps you cool and preserves health.
            </li>
            <li>
              <b className="text-amber-300">Night Safe Walk (Sun Altitude &le; 0°):</b> Once the sun sets, vampire mode is completely safe everywhere!
            </li>
          </ul>
        </div>

        {/* Section 2: Gear Shields */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
            <Shield className="w-4 h-4" />
            <span>2. Vampire Protective Gear &amp; Shields</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Toggle your survival gear at the top or bottom bar to mitigate harsh sunlight when crossing open intersections:
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-center">
              <span className="text-lg block">☂️</span>
              <span className="font-bold text-purple-300 text-[11px]">Parasol</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Blocks 65% UV</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/40 text-center">
              <span className="text-lg block">🛡️</span>
              <span className="font-bold text-rose-300 text-[11px]">SPF 100+</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Blocks 30% UV</span>
            </div>
            <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-800/40 text-center">
              <span className="text-lg block">🦇</span>
              <span className="font-bold text-indigo-300 text-[11px]">Gothic Cloak</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Blocks 20% UV</span>
            </div>
          </div>
        </div>

        {/* Section 3: Navigation Strategies */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Navigation className="w-4 h-4" />
            <span>3. Three Navigation Routing Strategies</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <b className="text-purple-300">Corridor A: Vampire Safe Route (88-95% Shade)</b>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Prioritizes continuous Taiwanese covered shop-house arcades (騎樓) and lush tree canopy greenways. Minimum sunlight exposure.
              </p>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <b className="text-sky-300">Corridor B: Balanced Canopy Way (60-70% Shade)</b>
              <p className="text-[10px] text-slate-400 mt-0.5">
                A middle-ground route utilizing high building shadows and tree-lined neighborhood side streets.
              </p>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <b className="text-rose-400">Corridor C: Direct Blazing Sun Road (&lt;20% Shade)</b>
              <p className="text-[10px] text-slate-400 mt-0.5">
                The shortest geometric distance along wide open arterial asphalt avenues. Causes severe sizzle damage!
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Citizen Science & Community Proposals */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>4. Citizen Science &amp; Starter Kits</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Whenever you discover an unshaded intersection or heat trap during your walks, tap the <b>+ Propose</b> button to submit a shade proposal. You can choose from four sponsored community starter kits:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-slate-300">
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex gap-2.5 items-center">
              <img
                src="/starter_kits/vertical_green.jpg"
                alt="Image 1: Vertical Green"
                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-700"
              />
              <div className="min-w-0">
                <div className="font-bold text-white text-xs text-emerald-400">Image 1: Vertical Green</div>
                <div className="text-[10px] text-slate-400">Climbing vine trellises</div>
                <div className="text-[10px] text-emerald-300 font-bold">-3.8°C • +85% Shade Boost</div>
              </div>
            </div>

            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex gap-2.5 items-center">
              <img
                src="/starter_kits/misting_water.jpg"
                alt="Image 2: Misting & Water"
                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-700"
              />
              <div className="min-w-0">
                <div className="font-bold text-white text-xs text-sky-400">Image 2: Misting &amp; Water</div>
                <div className="text-[10px] text-slate-400">High-pressure cooling misters</div>
                <div className="text-[10px] text-sky-300 font-bold">-5.2°C • Instant Cool Breeze</div>
              </div>
            </div>

            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex gap-2.5 items-center">
              <img
                src="/starter_kits/shade_sail.jpg"
                alt="Image 3: Shade Sail"
                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-700"
              />
              <div className="min-w-0">
                <div className="font-bold text-white text-xs text-amber-400">Image 3: Shade Sail</div>
                <div className="text-[10px] text-slate-400">Tension fabric canopies</div>
                <div className="text-[10px] text-amber-300 font-bold">-4.5°C • 98% UV Block</div>
              </div>
            </div>

            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex gap-2.5 items-center">
              <img
                src="/starter_kits/knitted_canopy.jpg"
                alt="Image 4: Knitted Canopy"
                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-700"
              />
              <div className="min-w-0">
                <div className="font-bold text-white text-xs text-purple-400">Image 4: Knitted Canopy</div>
                <div className="text-[10px] text-slate-400">Community crochet panels</div>
                <div className="text-[10px] text-purple-300 font-bold">-3.2°C • Art &amp; Cool Shade</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRoutes();
            }}
            className="py-2.5 px-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Routes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPropose();
            }}
            className="py-2.5 px-2 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Propose</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDemographics();
            }}
            className="py-2.5 px-2 bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCover();
            }}
            className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Cover Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
