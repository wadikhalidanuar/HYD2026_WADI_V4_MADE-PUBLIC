import React, { useState } from 'react';
import {
  Github,
  X,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  GitBranch,
  UploadCloud,
  Code,
} from 'lucide-react';

interface GitHubGuideModalProps {
  onClose: () => void;
}

export const GitHubGuideModal: React.FC<GitHubGuideModalProps> = ({ onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const REPO_URL = 'https://github.com/wadikhalidanuar/HYD2026_WADI_V3';

  const commands = [
    {
      title: '1. Check Remote Repository',
      code: 'git remote -v',
    },
    {
      title: '2. Stage All Changes & New Features',
      code: 'git add .',
    },
    {
      title: '3. Commit with Conventional Message',
      code: 'git commit -m "feat: complete Taichung shade navigation, Google Maps UI, and microclimate datasets"',
    },
    {
      title: '4. Push Changes to GitHub Repository',
      code: 'git push origin main',
    },
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl max-w-lg w-full my-auto max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                GitHub Repository Synchronization
              </h3>
              <p className="text-[11px] text-slate-400">
                wadikhalidanuar/HYD2026_WADI_V3
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

        {/* Repository Link Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white">Target Repository</span>
            </div>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-xs font-mono text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800 select-all">
            wadikhalidanuar/HYD2026_WADI_V3
          </p>
        </div>

        {/* Step-by-step CLI Commands */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Git Terminal Commands</span>
          </div>

          {commands.map((cmd, idx) => (
            <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{cmd.title}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(cmd.code, idx)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto border border-slate-800/80">
                {cmd.code}
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Close Guide
        </button>
      </div>
    </div>
  );
};
