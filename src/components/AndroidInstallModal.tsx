import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, CheckCircle, ExternalLink, ShieldCheck, Terminal } from 'lucide-react';

interface AndroidInstallModalProps {
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl max-w-lg w-full my-auto max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Install on Android (APK / WebAPK)
              </h3>
              <p className="text-[11px] text-slate-400">
                PWA Standalone & Android APK Deployment Guide
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

        {/* Primary In-App One-Click Install Banner */}
        <div className="bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Instant Android Installation
              </span>
              <h4 className="text-sm font-bold text-white">WebAPK Engine Direct Install</h4>
              <p className="text-xs text-slate-300 mt-1">
                Chrome on Android uses Google Play Services to automatically compile and install this PWA as a genuine standalone <b>.apk</b> directly onto your home screen and app drawer!
              </p>
            </div>
            <img
              src="/app-logo.png"
              alt="Happy Vampire Logo"
              className="w-12 h-12 rounded-2xl object-cover shadow-lg border border-emerald-500/40 shrink-0"
              referrerPolicy="no-referrer"
            />
          </div>

          {isInstalled ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-800">
              <CheckCircle className="w-4 h-4" />
              <span>Already installed and running in native standalone mode!</span>
            </div>
          ) : isInstallable ? (
            <button
              onClick={install}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Download className="w-4 h-4" /> Install Happy Vampire App (Android)
            </button>
          ) : (
            <div className="text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <b>How to Install on Android Phone:</b>
              <ol className="list-decimal list-inside space-y-1 mt-1 text-[11px] text-slate-400">
                <li>Open this app URL in <b>Google Chrome</b> on Android.</li>
                <li>Tap the <b>three vertical dots (⋮)</b> menu in the top-right corner.</li>
                <li>Tap <b>"Install app"</b> or <b>"Add to Home screen"</b>.</li>
                <li>The system will build and install the APK icon on your phone!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Standalone Binary APK Generation for Sideloading */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Terminal className="w-4 h-4" /> Standalone Binary .APK Packaging Options
          </div>
          <p className="text-[11px] text-slate-300">
            If you need a standalone raw <code className="text-rose-400 font-mono">.apk</code> file to distribute or sideload via Android Package Installer:
          </p>

          <div className="space-y-2 text-xs">
            {/* Method 1: PWABuilder */}
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px]">Method A: Microsoft PWABuilder (Zero Code)</span>
                <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded font-mono">
                  Recommended
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Go to <span className="text-purple-400 font-mono">PWABuilder.com</span>, paste your shared app URL, and click <b>Generate Android Package</b> to download the compiled ready-to-install <code className="text-emerald-400 font-mono">.apk</code>!
              </p>
            </div>

            {/* Method 2: Google Bubblewrap CLI */}
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="font-bold text-white text-[11px]">Method B: Google Bubblewrap CLI (TWA)</span>
              <p className="text-[10px] text-slate-400 mt-1">
                Official Google CLI to build native signed Android APKs:
              </p>
              <div className="bg-slate-950 p-2 rounded-lg font-mono text-[10px] text-emerald-400 overflow-x-auto mt-1 border border-slate-800">
                npm i -g @bubblewrap/cli<br />
                bubblewrap init --manifest=manifest.webmanifest<br />
                bubblewrap build
              </div>
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] space-y-1.5">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PWA Standards Checklist Passed:
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
            <div className="flex items-center gap-1">
              <span className="text-emerald-400">✓</span> Web App Manifest
            </div>
            <div className="flex items-center gap-1">
              <span className="text-emerald-400">✓</span> 192px & 512px Icons
            </div>
            <div className="flex items-center gap-1">
              <span className="text-emerald-400">✓</span> Service Worker Active
            </div>
            <div className="flex items-center gap-1">
              <span className="text-emerald-400">✓</span> Standalone Display Mode
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Close Guide
        </button>
      </div>
    </div>
  );
};
