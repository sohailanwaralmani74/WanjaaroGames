import React from 'react';
import { X, ShieldCheck, Cookie, HardDrive, Eye } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-850 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 id="privacy-modal-title" className="text-base font-bold text-white">
                Privacy Policy
              </h2>
              <p className="text-xs text-neutral-400">ReptileBirds Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close Privacy Policy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" /> 1. Local Storage
            </h3>
            <p>
              Your local preferences and settings are stored exclusively on your device using your browser's standard <code className="text-amber-400 font-mono text-xs">localStorage</code>. This data never leaves your browser and is not transmitted to our servers.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cookie className="w-4 h-4 text-amber-400" /> 2. Cookies and Third-Party Advertising
            </h3>
            <p>
              ReptileBirds does not require user accounts or logins. However, this website displays third-party advertisements and may utilize analytics tools to measure platform usage. These third-party vendors (such as Google AdSense and analytics partners) may place or read cookies and web beacons on your browser to serve relevant ads based on your prior visits to this website or other sites across the internet.
            </p>
            <p className="text-neutral-400 text-xs">
              You can manage or opt out of personalized advertising by visiting the Network Advertising Initiative opt-out page or adjusting your browser cookie settings.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" /> 3. No Personal Data Collection
            </h3>
            <p>
              We do not collect names, email addresses, passwords, phone numbers, or payment card details. Every feature on ReptileBirds is accessible without registration or financial transactions.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white">4. Managing Your Data</h3>
            <p>
              You can clear your local preferences and cached cookies at any time by clearing your browser data or cache for <code className="text-amber-400 font-mono text-xs">reptilebirds.com</code> in your browser settings.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-mono">Last updated: September 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
