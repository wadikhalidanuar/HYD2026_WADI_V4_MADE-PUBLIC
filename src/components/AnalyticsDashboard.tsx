import React from 'react';
import { ShadeProposal } from '../types';
import {
  exportProposalsToCSV,
  exportProposalsToJSON,
  upvoteProposal,
  CATEGORY_LABELS,
} from '../utils/storage';
import {
  BarChart3,
  Download,
  ThumbsUp,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  FileText,
  Trees,
  Thermometer,
} from 'lucide-react';
import {
  downloadXitunBeitunTreeCsv,
  TAICHUNG_TEMP_TIF_METADATA,
  TAICHUNG_HEAT_ISLAND_HOTSPOTS,
} from '../data/taichungXitunBeitunData';

interface AnalyticsDashboardProps {
  proposals: ShadeProposal[];
  onProposalsUpdated: (updated: ShadeProposal[]) => void;
  onClose: () => void;
  onFocusProposal: (proposal: ShadeProposal) => void;
  onOpenConceptPreview?: (proposalId: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  proposals,
  onProposalsUpdated,
  onClose,
  onFocusProposal,
  onOpenConceptPreview,
}) => {
  // Aggregate stats
  const totalCount = proposals.length;
  const criticalCount = proposals.filter((p) => p.urgency === 'critical_burn').length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  proposals.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  // Demographic age group counts
  const ageGroupCounts: Record<string, number> = {};
  proposals.forEach((p) => {
    const age = p.userDemographics?.ageGroup || 'unspecified';
    ageGroupCounts[age] = (ageGroupCounts[age] || 0) + 1;
  });

  // Nationality counts
  const nationalityCounts: Record<string, number> = {};
  proposals.forEach((p) => {
    const nat = p.userDemographics?.nationality || 'Taiwan';
    nationalityCounts[nat] = (nationalityCounts[nat] || 0) + 1;
  });

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = upvoteProposal(id);
    onProposalsUpdated(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl max-w-2xl w-full my-auto max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Taichung Shade Proposals & Demographics
              </h3>
              <p className="text-[11px] text-slate-400">
                Civic Open Data & Heat Vulnerability Analytics
              </p>
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

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Proposals</span>
            <span className="text-2xl font-black text-white">{totalCount}</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Community Pinned</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Critical Sun Gaps</span>
            <span className="text-2xl font-black text-rose-400">{criticalCount}</span>
            <span className="text-[10px] text-rose-300 block mt-0.5">High Sunburn Danger</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Top Requested</span>
            <span className="text-sm font-bold text-purple-300 truncate block mt-1">
              Arcade Roofs & Trees
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Qilou & Banyan canopy</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Export Open Data</span>
            <div className="flex flex-col gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => exportProposalsToCSV(proposals)}
                className="w-full py-1.5 px-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-[11px] font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-400/40 transition active:scale-95"
                title="Download full dataset with GPS coordinates & intersections in Excel (.csv format with UTF-8 BOM)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                <span>Download Excel</span>
              </button>
              <button
                type="button"
                onClick={exportProposalsToJSON}
                className="w-full py-1 px-2 bg-slate-900 hover:bg-purple-950 border border-slate-800 hover:border-purple-600/40 text-purple-300 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                title="Export raw JSON format"
              >
                <FileCode className="w-3 h-3" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Breakdown Charts: Categories & Demographics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Requested Shade Infrastructure Breakdown */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Requested Shade Infrastructure
            </h4>
            <div className="space-y-1.5 text-xs">
              {Object.entries(categoryCounts).map(([catKey, count]) => {
                const info = CATEGORY_LABELS[catKey as keyof typeof CATEGORY_LABELS] || {
                  label: catKey,
                  icon: '☂️',
                };
                const percent = Math.round((count / totalCount) * 100);
                return (
                  <div key={catKey}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-300 truncate max-w-[200px]">
                        {info.icon} {info.label.split('(')[0]}
                      </span>
                      <span className="font-mono text-purple-300 font-semibold">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Demographic Representation Breakdown */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Demographics (Age & Heritage)
            </h4>
            <div className="space-y-1.5 text-xs">
              {Object.entries(ageGroupCounts).map(([ageKey, count]) => {
                const percent = Math.round((count / totalCount) * 100);
                return (
                  <div key={ageKey}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-300 capitalize">
                        Age: {ageKey.replace('_', ' to ')} yrs
                      </span>
                      <span className="font-mono text-rose-300 font-semibold">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Proposals List with Exact GPS, Road Intersections, Upvotes & View on Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>Community Shade Registry</span>
                <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.2 rounded border border-purple-800">
                  {proposals.length} GPS Locations
                </span>
              </h4>
              <span className="text-[10px] text-slate-400">Exact coordinates and intersections for urban infrastructure analysis</span>
            </div>

            <button
              type="button"
              onClick={() => exportProposalsToCSV(proposals)}
              className="py-1 px-2.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
              title="Download this exact registry into an Excel spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Excel (.csv)</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {proposals.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onFocusProposal(item);
                  onClose();
                }}
                className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl transition cursor-pointer flex items-start justify-between gap-3 shadow-md group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm">
                      {CATEGORY_LABELS[item.category]?.icon || '☂️'}
                    </span>
                    <span className="text-xs font-bold text-white">{item.categoryTitle}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        item.urgency === 'critical_burn'
                          ? 'bg-rose-900/80 text-rose-200'
                          : 'bg-amber-900/80 text-amber-200'
                      }`}
                    >
                      {item.urgency === 'critical_burn' ? 'Critical Sun Hazard' : 'High Heat'}
                    </span>
                  </div>

                  {/* Road Name & Intersection Badge */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-800/30 w-fit">
                    <span>🛣️</span>
                    <span className="truncate">{item.addressName}</span>
                  </div>

                  {/* Exact GPS Coordinates Pill */}
                  <div className="flex items-center gap-2 flex-wrap text-[10px]">
                    <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-sky-300 border border-slate-800 flex items-center gap-1">
                      <span>📍 GPS:</span>
                      <span className="font-bold">{item.coords[0].toFixed(6)}°N, {item.coords[1].toFixed(6)}°E</span>
                    </span>

                    <a
                      href={`https://www.google.com/maps?q=${item.coords[0]},${item.coords[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-emerald-300 underline flex items-center gap-0.5"
                      title="Open in Google Maps"
                    >
                      <span>Google Maps ↗</span>
                    </a>
                  </div>

                  <p className="text-[10px] text-slate-300 italic line-clamp-2">"{item.notes}"</p>

                  <div className="flex items-center gap-2 text-[9px] text-slate-400 pt-0.5">
                    <span>
                      👤 {item.userDemographics?.nationality} • {item.userDemographics?.ageGroup?.replace('_', '-')}
                    </span>
                    <span>•</span>
                    <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* AI Preview Button for this proposal */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenConceptPreview?.(item.id);
                      }}
                      className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>View AI Concept Preview (Before vs After)</span>
                    </button>
                  </div>
                </div>

                {/* Upvote button */}
                <button
                  type="button"
                  onClick={(e) => handleUpvote(item.id, e)}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-purple-950 border border-slate-800 hover:border-purple-500 rounded-lg text-xs font-bold text-slate-300 hover:text-purple-300 transition flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Upvote this shade request"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{item.upvotes}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Xitun & Beitun Repository Datasets (Matching Image 3) */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📁</span>
              <div>
                <h4 className="text-xs font-bold text-white">Repository Scientific Datasets</h4>
                <p className="text-[10px] text-slate-400">Integrated microclimate datasets for urban shade planning</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* File 1: Taichung_XitunBeitun_Tree.csv */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Trees className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-white text-[11px] truncate">Taichung_XitunBeitun_Tree.csv</div>
                  <div className="text-[9px] text-slate-400">Tree canopy survey (60+ trees)</div>
                </div>
              </div>
              <button
                type="button"
                onClick={downloadXitunBeitunTreeCsv}
                className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shrink-0 cursor-pointer"
                title="Download CSV"
              >
                <Download className="w-3 h-3" />
                <span>CSV</span>
              </button>
            </div>

            {/* File 2: Taichung Xitun Beitun Temp.tif */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Thermometer className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-white text-[11px] truncate">Taichung Xitun Beitun Temp.tif</div>
                  <div className="text-[9px] text-slate-400">Thermal surface raster (10m GSD)</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800/60 shrink-0">
                6 Heat Traps
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
