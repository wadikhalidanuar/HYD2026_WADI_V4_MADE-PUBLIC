import React from 'react';
import {
  X,
  Sparkles,
  MapPin,
  Leaf,
  Shield,
  Compass,
  Trees,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface CoverPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExploring: () => void;
  onOpenManual?: () => void;
  onOpenAnalytics?: () => void;
  onOpenDemographics?: () => void;
  onOpenAndroidInstall?: () => void;
  onReportHotSpot?: () => void;
  onOpenProjects?: () => void;
  onOpenRewards?: () => void;
  coolingTokens?: number;
  isInstallable?: boolean;
  onInstallPWA?: () => void;
}

export const CoverPageModal: React.FC<CoverPageModalProps> = ({
  isOpen,
  onClose,
  onStartExploring,
  onOpenManual,
  onOpenAnalytics,
  onOpenDemographics,
  onOpenAndroidInstall,
  onReportHotSpot,
  onOpenProjects,
  onOpenRewards,
  coolingTokens = 85,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Mobile-Proportioned App Screen Container matching Image 2 */}
      <div className="relative w-full max-w-[420px] bg-[#fbfdf8] text-[#123624] rounded-[36px] shadow-[0_25px_70px_rgba(0,0,0,0.85)] border-4 border-[#e6eee1] overflow-hidden flex flex-col p-5 sm:p-6 my-auto select-none">
        {/* Subtle Close Button Top-Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer z-10"
          title="Close Cover Page"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Header: Cute Vampire Icon + happy vampire + TAICHUNG pill */}
        <div className="flex items-center gap-2.5 mb-5 pt-1">
          {/* Vampire Avatar Icon */}
          <div className="w-9 h-9 rounded-full bg-[#eef5e9] border border-[#d2e5ca] flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-8 h-8">
              {/* Ears */}
              <polygon points="18,48 4,32 26,38" fill="#e2f0d9" stroke="#1b4332" strokeWidth="3" />
              <polygon points="82,48 96,32 74,38" fill="#e2f0d9" stroke="#1b4332" strokeWidth="3" />
              {/* Head */}
              <circle cx="50" cy="50" r="34" fill="#ffffff" stroke="#1b4332" strokeWidth="3.5" />
              {/* Hair Crest */}
              <path d="M32 30 C 42 16, 58 16, 68 30 C 58 26, 42 26, 32 30 Z" fill="#1b4332" />
              {/* Cheeks */}
              <circle cx="36" cy="56" r="4.5" fill="#fbcfe8" opacity="0.8" />
              <circle cx="64" cy="56" r="4.5" fill="#fbcfe8" opacity="0.8" />
              {/* Eyes */}
              <path d="M34 46 Q 38 42 42 46" stroke="#1b4332" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M58 46 Q 62 42 66 46" stroke="#1b4332" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              {/* Smile & Fangs */}
              <path d="M42 58 Q 50 67 58 58" stroke="#1b4332" strokeWidth="3" fill="none" strokeLinecap="round" />
              <polygon points="45,58 47,63 49,58" fill="#ffffff" stroke="#1b4332" strokeWidth="1.5" />
              <polygon points="51,58 53,63 55,58" fill="#ffffff" stroke="#1b4332" strokeWidth="1.5" />
            </svg>
          </div>

          <span className="font-black text-xl tracking-tight text-[#143827]">
            happy vampire
          </span>

          <span className="px-2.5 py-0.5 rounded-full bg-[#dbe8d2] text-[#275338] text-[11px] font-black tracking-wider uppercase">
            TAICHUNG
          </span>
        </div>

        {/* 2. Hero Headline matching Image 2 */}
        <div className="mb-4">
          <h1 className="text-[34px] sm:text-[38px] font-black leading-[1.08] tracking-tight text-[#113524]">
            Find shade.
            <br />
            Shape your street.
          </h1>
          <p className="text-[15px] sm:text-[16px] text-slate-500 font-medium mt-2">
            Your cooler walk starts here.
          </p>
        </div>

        {/* 3. Banner Card: Small steps. Cooler streets. */}
        <div className="bg-[#dcead4] rounded-2xl p-3.5 mb-4 flex items-center justify-between border border-[#cbe0c1] shadow-sm">
          <div className="flex items-center gap-3">
            {/* Cute Vampire with Leaf */}
            <div className="w-12 h-12 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Cloak */}
                <path d="M25 75 Q 50 95 75 75 L 70 55 L 30 55 Z" fill="#1b4332" />
                <circle cx="50" cy="62" r="4.5" fill="#eab308" />
                {/* Head */}
                <circle cx="50" cy="40" r="22" fill="#ffffff" stroke="#1b4332" strokeWidth="3" />
                <polygon points="28,40 18,30 34,32" fill="#ffffff" stroke="#1b4332" strokeWidth="2.5" />
                <polygon points="72,40 82,30 66,32" fill="#ffffff" stroke="#1b4332" strokeWidth="2.5" />
                {/* Hair */}
                <path d="M38 25 C 45 15, 55 15, 62 25 Z" fill="#1b4332" />
                {/* Happy Face */}
                <path d="M41 38 Q 44 34 47 38" stroke="#1b4332" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M53 38 Q 56 34 59 38" stroke="#1b4332" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M45 47 Q 50 53 55 47" stroke="#1b4332" strokeWidth="2" fill="none" strokeLinecap="round" />
                <polygon points="47,47 48.5,50 50,47" fill="#ffffff" />
                <polygon points="50,47 51.5,50 53,47" fill="#ffffff" />
                {/* Leaf in hand */}
                <path d="M68 45 C 80 30, 92 40, 75 56 C 70 54, 65 48, 68 45 Z" fill="#52b788" stroke="#1b4332" strokeWidth="2" />
                <path d="M70 50 L 80 40" stroke="#1b4332" strokeWidth="1.5" />
                {/* Sparkles */}
                <line x1="88" y1="28" x2="94" y2="24" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="92" y1="35" x2="98" y2="33" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-[15px] text-[#113524] leading-tight">
                Small steps.
              </div>
              <div className="font-extrabold text-[15px] text-[#113524] leading-tight">
                Cooler streets.
              </div>
            </div>
          </div>
          <div className="text-[#386641] pr-1">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#40916c]">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>
        </div>

        {/* 4. The 2x2 Interactive Action Cards Grid matching Image 2 */}
        <div className="grid grid-cols-2 gap-3.5 mb-5">
          {/* Card 1: Walk in Shade */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartExploring();
            }}
            className="group bg-[#edf5e8] hover:bg-[#e4efe0] active:scale-[0.98] transition-all rounded-[24px] p-3.5 text-left border border-[#d6e8ce] shadow-sm flex flex-col justify-between cursor-pointer"
          >
            {/* Illustration */}
            <div className="w-full h-24 rounded-2xl bg-[#f4f9f0] mb-2.5 flex items-center justify-center overflow-hidden border border-[#e0ecd9]">
              <svg viewBox="0 0 140 100" className="w-full h-full">
                {/* Background Sky & Buildings */}
                <rect x="0" y="0" width="140" height="100" fill="#f4f9f0" />
                <rect x="90" y="25" width="22" height="45" fill="#cadbc2" rx="2" />
                <rect x="115" y="35" width="18" height="35" fill="#bfd3b7" rx="2" />
                {/* Tree Canopy */}
                <path d="M5 25 C 20 10, 50 10, 65 25 C 80 15, 100 25, 95 45 C 95 60, 65 65, 45 60 C 25 65, 5 50, 5 25 Z" fill="#52b788" />
                <path d="M15 35 C 30 20, 55 20, 70 35 C 80 30, 90 40, 85 52 C 80 60, 55 58, 40 55 C 25 58, 15 48, 15 35 Z" fill="#74c69d" />
                {/* Tree Trunk */}
                <rect x="32" y="45" width="10" height="35" fill="#785942" rx="3" />
                {/* Sidewalk */}
                <rect x="0" y="70" width="140" height="30" fill="#e8ede4" />
                <line x1="0" y1="71" x2="140" y2="71" stroke="#cbd5c5" strokeWidth="2" />
                <line x1="45" y1="71" x2="35" y2="100" stroke="#cbd5c5" strokeWidth="1.5" />
                <line x1="95" y1="71" x2="85" y2="100" stroke="#cbd5c5" strokeWidth="1.5" />
                {/* Walking Vampire */}
                <g transform="translate(42, 36)">
                  {/* Yellow Backpack */}
                  <rect x="8" y="24" width="12" height="16" rx="4" fill="#facc15" stroke="#1b4332" strokeWidth="2" />
                  {/* Dark Cape / Body */}
                  <path d="M16 26 L 36 26 L 38 48 L 14 48 Z" fill="#1b4332" />
                  <circle cx="26" cy="30" r="3" fill="#facc15" />
                  {/* Legs Walking */}
                  <line x1="20" y1="48" x2="16" y2="58" stroke="#1b4332" strokeWidth="3" strokeLinecap="round" />
                  <line x1="30" y1="48" x2="36" y2="58" stroke="#1b4332" strokeWidth="3" strokeLinecap="round" />
                  {/* Head */}
                  <circle cx="28" cy="16" r="14" fill="#ffffff" stroke="#1b4332" strokeWidth="2.5" />
                  <polygon points="14,16 6,8 18,10" fill="#ffffff" stroke="#1b4332" strokeWidth="2" />
                  <polygon points="40,16 48,8 36,10" fill="#ffffff" stroke="#1b4332" strokeWidth="2" />
                  <path d="M22 6 C 26 0, 32 0, 36 6 Z" fill="#1b4332" />
                  <circle cx="24" cy="16" r="2.5" fill="#1b4332" />
                  <circle cx="34" cy="16" r="2.5" fill="#1b4332" />
                  <path d="M27 21 Q 30 25 33 21" stroke="#1b4332" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  {/* Joy Sparkle */}
                  <line x1="44" y1="6" x2="48" y2="2" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                  <line x1="46" y1="12" x2="50" y2="10" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                </g>
              </svg>
            </div>
            <div>
              <div className="font-black text-[16px] text-[#113524] group-hover:text-emerald-800 transition">
                Walk in Shade
              </div>
              <div className="text-[12px] text-slate-500 font-medium mt-0.5">
                Find a cooler route
              </div>
            </div>
          </button>

          {/* Card 2: Report a Hot Spot */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onReportHotSpot) {
                onReportHotSpot();
              } else {
                onStartExploring();
              }
            }}
            className="group bg-[#edf5e8] hover:bg-[#e4efe0] active:scale-[0.98] transition-all rounded-[24px] p-3.5 text-left border border-[#d6e8ce] shadow-sm flex flex-col justify-between cursor-pointer"
          >
            {/* Illustration */}
            <div className="w-full h-24 rounded-2xl bg-[#f4f9f0] mb-2.5 flex items-center justify-center overflow-hidden border border-[#e0ecd9]">
              <svg viewBox="0 0 140 100" className="w-full h-full">
                {/* Big Green Map Pin */}
                <g transform="translate(42, 6)">
                  <path
                    d="M28 0 C 12.5 0, 0 12.5, 0 28 C 0 46, 28 78, 28 78 C 28 78, 56 46, 56 28 C 56 12.5, 43.5 0, 28 0 Z"
                    fill="#1b4332"
                  />
                  {/* Vampire Inside Pin */}
                  <circle cx="28" cy="27" r="18" fill="#ffffff" />
                  <circle cx="28" cy="27" r="18" fill="none" stroke="#1b4332" strokeWidth="2" />
                  {/* Vampire Face */}
                  <path d="M22 25 Q 24 22 26 25" stroke="#1b4332" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M30 25 Q 32 22 34 25" stroke="#1b4332" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M25 33 Q 28 38 31 33" stroke="#1b4332" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <polygon points="26,33 27,35 28,33" fill="#ffffff" />
                  <polygon points="29,33 30,35 31,33" fill="#ffffff" />
                </g>
                {/* Warning Exclamation Badge */}
                <g transform="translate(86, 38)">
                  <circle cx="16" cy="16" r="14" fill="#facc15" stroke="#eab308" strokeWidth="2" />
                  <text x="16" y="22" textAnchor="middle" fontSize="18" fontWeight="900" fill="#1b4332" fontFamily="sans-serif">
                    !
                  </text>
                </g>
                {/* Ray Sparkles */}
                <line x1="88" y1="20" x2="94" y2="16" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="94" y1="26" x2="100" y2="24" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="font-black text-[16px] text-[#113524] group-hover:text-emerald-800 transition">
                Report a Hot Spot
              </div>
              <div className="text-[12px] text-slate-500 font-medium mt-0.5">
                Tell us where shade is missing
              </div>
            </div>
          </button>

          {/* Card 3: Projects */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenProjects) {
                onOpenProjects();
              } else if (onOpenManual) {
                onOpenManual();
              }
            }}
            className="group bg-[#edf5e8] hover:bg-[#e4efe0] active:scale-[0.98] transition-all rounded-[24px] p-3.5 text-left border border-[#d6e8ce] shadow-sm flex flex-col justify-between cursor-pointer"
          >
            {/* Illustration */}
            <div className="w-full h-24 rounded-2xl bg-[#f4f9f0] mb-2.5 flex items-center justify-center overflow-hidden border border-[#e0ecd9]">
              <svg viewBox="0 0 140 100" className="w-full h-full">
                {/* Vampire Holding Plant */}
                <g transform="translate(24, 18)">
                  {/* Cape */}
                  <path d="M15 50 Q 40 70 65 50 L 58 35 L 22 35 Z" fill="#1b4332" />
                  {/* Head */}
                  <circle cx="40" cy="24" r="18" fill="#ffffff" stroke="#1b4332" strokeWidth="2.5" />
                  <polygon points="22,24 14,14 28,16" fill="#ffffff" stroke="#1b4332" strokeWidth="2" />
                  <polygon points="58,24 66,14 52,16" fill="#ffffff" stroke="#1b4332" strokeWidth="2" />
                  <path d="M32 10 C 37 3, 44 3, 48 10 Z" fill="#1b4332" />
                  {/* Face */}
                  <circle cx="33" cy="24" r="2.5" fill="#1b4332" />
                  <circle cx="47" cy="24" r="2.5" fill="#1b4332" />
                  <path d="M37 31 Q 40 35 43 31" stroke="#1b4332" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  {/* Flower Pot */}
                  <polygon points="55,54 75,54 71,70 59,70" fill="#9a3412" stroke="#7c2d12" strokeWidth="1.5" />
                  {/* Sprout Plant */}
                  <path d="M65 54 Q 65 42 63 36" stroke="#2d6a4f" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M63 38 C 55 34, 55 44, 63 44 Z" fill="#52b788" />
                  <path d="M64 36 C 72 30, 75 40, 64 42 Z" fill="#74c69d" />
                  {/* Speech Bubble with Leaf */}
                  <g transform="translate(62, -4)">
                    <rect x="0" y="0" width="30" height="22" rx="8" fill="#ffffff" stroke="#d2e5ca" strokeWidth="1.5" />
                    <polygon points="6,22 12,22 6,28" fill="#ffffff" stroke="#d2e5ca" strokeWidth="1.5" />
                    {/* Tiny leaf in bubble */}
                    <path d="M12 12 C 16 6, 22 8, 20 15 C 16 16, 12 14, 12 12 Z" fill="#40916c" />
                  </g>
                </g>
              </svg>
            </div>
            <div>
              <div className="font-black text-[16px] text-[#113524] group-hover:text-emerald-800 transition">
                Projects
              </div>
              <div className="text-[12px] text-slate-500 font-medium mt-0.5">
                Imagine and build together
              </div>
            </div>
          </button>

          {/* Card 4: My Contributions & Rewards */}
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenRewards) {
                onOpenRewards();
              } else if (onOpenDemographics) {
                onOpenDemographics();
              } else if (onOpenAnalytics) {
                onOpenAnalytics();
              }
            }}
            className="group bg-[#edf5e8] hover:bg-[#e4efe0] active:scale-[0.98] transition-all rounded-[24px] p-3.5 text-left border border-[#d6e8ce] shadow-sm flex flex-col justify-between cursor-pointer"
          >
            {/* Illustration */}
            <div className="w-full h-24 rounded-2xl bg-[#f4f9f0] mb-2.5 flex items-center justify-center overflow-hidden border border-[#e0ecd9] relative">
              <svg viewBox="0 0 140 100" className="w-full h-full">
                {/* Vampire Holding Gold Checkmark Coin */}
                <g transform="translate(26, 18)">
                  {/* Cape */}
                  <path d="M15 50 Q 40 70 65 50 L 58 35 L 22 35 Z" fill="#1b4332" />
                  {/* Head */}
                  <circle cx="40" cy="24" r="18" fill="#ffffff" stroke="#1b4332" strokeWidth="2.5" />
                  <polygon points="22,24 14,14 28,16" fill="#ffffff" stroke="#1b4332" strokeWidth="2" />
                  <polygon points="58,24 66,14 52,16" fill="#ffffff" stroke="#1b4332" strokeWidth="2" />
                  <path d="M32 10 C 37 3, 44 3, 48 10 Z" fill="#1b4332" />
                  {/* Face */}
                  <circle cx="33" cy="24" r="2.5" fill="#1b4332" />
                  <circle cx="47" cy="24" r="2.5" fill="#1b4332" />
                  <path d="M37 31 Q 40 35 43 31" stroke="#1b4332" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  {/* Big Gold Coin with Checkmark */}
                  <g transform="translate(48, 26)">
                    <circle cx="18" cy="18" r="17" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
                    <path
                      d="M11 18 L 16 23 L 26 12"
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </g>
              </svg>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-400 border border-amber-500 text-slate-950 font-black text-[10px] shadow-sm flex items-center gap-0.5">
                <span>🪙</span>
                <span>{coolingTokens}</span>
              </div>
            </div>
            <div>
              <div className="font-black text-[16px] text-[#113524] group-hover:text-emerald-800 transition">
                Contributions &amp; Tokens
              </div>
              <div className="text-[12px] text-slate-500 font-medium mt-0.5">
                Track impact &amp; redeem rewards
              </div>
            </div>
          </button>
        </div>

        {/* 5. Footer matching Image 2 */}
        <div className="text-center pt-2 pb-1 border-t border-[#e2ebd8]">
          <p className="text-[12.5px] font-bold text-[#2d573c] flex items-center justify-center gap-1.5">
            <span>🍃</span>
            <span>Find shade today. Create shade for tomorrow.</span>
            <span>🍃</span>
          </p>
        </div>

        {/* Mobile Home Swipe Bar Indicator */}
        <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto mt-3" />
      </div>
    </div>
  );
};
