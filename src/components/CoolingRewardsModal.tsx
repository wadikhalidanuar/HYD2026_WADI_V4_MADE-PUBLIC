import React, { useState } from 'react';
import {
  X,
  Zap,
  Coins,
  Ticket,
  Store,
  MapPin,
  CheckCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Clock,
  Gift,
  AlertCircle,
} from 'lucide-react';
import {
  TAICHUNG_COOLING_OUTLETS,
  CoolingOutlet,
} from '../data/coolingOutletsData';
import {
  getCoolingTokens,
  redeemCoolingTokens,
  getTokenTransactions,
  TokenTransaction,
} from '../utils/storage';

interface CoolingRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: number;
  onTokensUpdated: (newBalance: number) => void;
  onFlyToOutlet?: (coords: [number, number]) => void;
}

export const CoolingRewardsModal: React.FC<CoolingRewardsModalProps> = ({
  isOpen,
  onClose,
  tokens,
  onTokensUpdated,
  onFlyToOutlet,
}) => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'outlets' | 'history'>('pillars');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [redeemedOutlet, setRedeemedOutlet] = useState<CoolingOutlet | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const transactions = getTokenTransactions();

  const handleRedeem = (outlet: CoolingOutlet) => {
    if (tokens < outlet.tokenCost) {
      setErrorMessage(`You need ${outlet.tokenCost} tokens for this reward. Keep walking shaded streets or reporting hot spots to earn more!`);
      setTimeout(() => setErrorMessage(null), 3500);
      return;
    }

    const success = redeemCoolingTokens(outlet.tokenCost, outlet.id, outlet.offerTitle);
    if (success) {
      const newBal = getCoolingTokens();
      onTokensUpdated(newBal);
      setRedeemedOutlet(outlet);
    }
  };

  const filteredOutlets = categoryFilter === 'all'
    ? TAICHUNG_COOLING_OUTLETS
    : TAICHUNG_COOLING_OUTLETS.filter((o) => o.category === categoryFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 border border-slate-700/80 rounded-[32px] shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 text-white max-h-[92vh] overflow-y-auto my-auto select-none">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer z-10"
          title="Close Rewards"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header from User's Image 1 */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
            <Coins className="w-3.5 h-3.5" />
            <span>Taichung Urban Cooling Incentive Program</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-white to-amber-200 leading-tight">
            Cooling Tokens reward walking, reporting and caretaking
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Earned by walking shaded routes, reporting heat spots, hosting kits and completing verified maintenance checks.
          </p>
        </div>

        {/* Current Balance Banner */}
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/70 border border-emerald-500/40 rounded-2xl p-4 mb-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🪙
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Your Collected Tokens
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  {tokens}
                </span>
                <span className="text-xs font-bold text-slate-300">Cooling Tokens</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
              {tokens >= 150 ? '🌟 Shade Master' : tokens >= 80 ? '🌱 Shade Scout' : '🚶 Walker'}
            </span>
            <div className="text-[10px] text-slate-400 mt-1">
              +50 for each proposal
            </div>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2 animate-bounce">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('pillars')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'pillars'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>4 Reward Pillars</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outlets')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'outlets'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Participating Outlets ({TAICHUNG_COOLING_OUTLETS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Token History</span>
          </button>
        </div>

        {/* TAB 1: PARTICIPATING OUTLETS (HOST BUSINESSES) */}
        {activeTab === 'outlets' && (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                  categoryFilter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All Outlets
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('tea')}
                className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                  categoryFilter === 'tea'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🧋 Boba & Tea
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('ice_dessert')}
                className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                  categoryFilter === 'ice_dessert'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🍨 Ice & Desserts
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('cafe')}
                className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                  categoryFilter === 'cafe'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ☕ Cafes
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('cooling_shelter')}
                className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 ${
                  categoryFilter === 'cooling_shelter'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                💧 Cooling Pavilions
              </button>
            </div>

            {/* Outlets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredOutlets.map((outlet) => {
                const canAfford = tokens >= outlet.tokenCost;
                return (
                  <div
                    key={outlet.id}
                    className="p-4 rounded-2xl bg-slate-850/80 border border-slate-700/70 hover:border-emerald-500/50 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl shrink-0">{outlet.icon}</span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                              {outlet.nameZh}
                            </h4>
                            <div className="text-[10px] text-slate-400">{outlet.name}</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs shrink-0">
                          🪙 {outlet.tokenCost}
                        </span>
                      </div>

                      <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-xs mb-2">
                        <div className="font-bold text-emerald-300">{outlet.offerTitle}</div>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-normal">
                          {outlet.offerDetails}
                        </p>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">{outlet.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {onFlyToOutlet && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onFlyToOutlet(outlet.coords);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Show on map"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Locate</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRedeem(outlet)}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white shadow-md'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-70'
                        }`}
                        title={canAfford ? 'Redeem this voucher' : 'Not enough tokens'}
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>{canAfford ? `Redeem for ${outlet.tokenCost} 🪙` : `Need ${outlet.tokenCost} 🪙`}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: THE 4 REWARD PILLARS (Matching User's Image 1 exactly) */}
        {activeTab === 'pillars' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Pillar 1: Utility offsets */}
              <div className="p-4 rounded-2xl bg-[#edf5e8] text-[#123624] border border-[#d2e5ca] flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#f97316] flex items-center justify-center text-white mb-3 shadow-sm">
                    <Zap className="w-6 h-6 fill-current text-white" />
                  </div>
                  <h4 className="text-base font-black text-[#113524] mb-1">
                    Utility offsets
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    Tokens offset municipal water or electricity bills.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#dce9d4] text-[10px] font-bold text-emerald-800">
                  Taichung City Energy Dept
                </div>
              </div>

              {/* Pillar 2: Local discounts */}
              <div className="p-4 rounded-2xl bg-[#edf5e8] text-[#123624] border border-[#d2e5ca] flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#1e3a2b] flex items-center justify-center text-white mb-3 shadow-sm">
                    <Coins className="w-6 h-6 text-emerald-300" />
                  </div>
                  <h4 className="text-base font-black text-[#113524] mb-1">
                    Local discounts
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    Swap tokens at neighborhood shops and cafes.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#dce9d4] text-[10px] font-bold text-emerald-800">
                  8+ Participating Outlets
                </div>
              </div>

              {/* Pillar 3: Block lotteries */}
              <div className="p-4 rounded-2xl bg-[#edf5e8] text-[#123624] border border-[#d2e5ca] flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#1e3a2b] flex items-center justify-center text-white mb-3 shadow-sm">
                    <Ticket className="w-6 h-6 text-amber-300" />
                  </div>
                  <h4 className="text-base font-black text-[#113524] mb-1">
                    Block lotteries
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    Top blocks enter monthly draws for grants, street art or transit passes.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#dce9d4] text-[10px] font-bold text-emerald-800">
                  Monthly Taichung Draw
                </div>
              </div>

              {/* Pillar 4: Foot traffic */}
              <div className="p-4 rounded-2xl bg-[#edf5e8] text-[#123624] border border-[#d2e5ca] flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#1e3a2b] flex items-center justify-center text-white mb-3 shadow-sm">
                    <Store className="w-6 h-6 text-sky-300" />
                  </div>
                  <h4 className="text-base font-black text-[#113524] mb-1">
                    Foot traffic
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    Host businesses get featured on the route map.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#dce9d4] text-[10px] font-bold text-emerald-800">
                  Mapped pedestrian corridors
                </div>
              </div>
            </div>

            {/* How to Earn More */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>How to Earn More Cooling Tokens:</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">+50 Tokens:</span> Report a sun trap &amp; propose shade kit
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">+10 Tokens:</span> Walk 200m in continuous covered arcade
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">+25 Tokens:</span> Community upvote on your shade proposal
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">+100 Tokens:</span> Host a shade kit or misting station
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTION HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-2.5">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className={tx.type === 'earn' ? 'text-emerald-400' : 'text-amber-400'}>
                      {tx.type === 'earn' ? '▲' : '▼'}
                    </span>
                    <span>{tx.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{tx.description}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </div>

                <div
                  className={`font-mono font-bold text-sm ${
                    tx.type === 'earn' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {tx.type === 'earn' ? `+${tx.amount}` : `-${tx.amount}`} 🪙
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Redemption Success Modal Overlay */}
        {redeemedOutlet && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 max-w-sm w-full text-center space-y-3 shadow-2xl">
              <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-black text-white">Voucher Redeemed!</h3>
              <p className="text-xs text-slate-300">
                Show this digital voucher to the cashier at <b>{redeemedOutlet.nameZh}</b>:
              </p>
              <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/60 font-mono text-emerald-400 font-bold text-sm tracking-wider">
                COOL-{redeemedOutlet.id.slice(0, 4).toUpperCase()}-{Math.floor(1000 + Math.random() * 9000)}
              </div>
              <div className="text-[11px] text-slate-400">{redeemedOutlet.offerTitle}</div>
              <button
                type="button"
                onClick={() => setRedeemedOutlet(null)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
