import React from 'react';
import { ShieldCheck, HardDrive, Cookie, Eye, ArrowLeft, CheckCircle } from 'lucide-react';
import { CATEGORIES } from '../data/gamesCatalog';

interface PrivacyViewProps {
  onNavigateHome: () => void;
  onNavigateCategory: (categoryId: string) => void;
}

export function PrivacyView({ onNavigateHome, onNavigateCategory }: PrivacyViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-400">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome();
          }}
          className="hover:text-amber-400 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Platform Home
        </a>
        <span>/</span>
        <span className="text-neutral-200 font-medium">Privacy Policy</span>
      </nav>

      {/* Header Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Transparency &amp; Local Storage Commitment</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            ReptileBirds Privacy Policy
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl">
            100% free client-side experience. We believe in high-performance web browsing without intrusive account walls, mandatory logins, or server tracking.
          </p>
        </div>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome();
          }}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-xl text-xs font-medium border border-neutral-700 self-start md:self-center transition-colors"
        >
          ← Back to Home
        </a>
      </div>

      {/* Policy Details */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-8 text-sm text-neutral-300 leading-relaxed shadow-lg">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            1. Local Storage &amp; Preferences
          </h2>
          <p>
            Your preferences and local settings are stored strictly on your device using HTML5 <code className="text-amber-400 font-mono text-xs bg-neutral-950 px-1.5 py-0.5 rounded">localStorage</code>. This data never leaves your browser and is not collected, stored, or processed on our backend servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Cookie className="w-5 h-5 text-amber-400" />
            2. Cookies and Advertising Partners
          </h2>
          <p>
            ReptileBirds does not require user accounts or logins. However, to keep this platform free and accessible to everyone worldwide, we display third-party advertisements and may utilize analytics tools to measure platform performance.
          </p>
          <p className="text-neutral-400 text-xs">
            Third-party advertising networks (including Google AdSense, CPM networks, and programmatic partners) may place or read cookies and web beacons on your browser to serve non-intrusive advertisements based on your visits to this website and other sites across the internet. You can manage or disable advertising cookies at any time via your browser settings or opt-out programs like the Network Advertising Initiative.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            3. Zero Personal Data Collection
          </h2>
          <p>
            We do not collect names, email addresses, passwords, phone numbers, or payment card information. All resources on ReptileBirds are immediately accessible without registration or subscription fees.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            4. Managing or Clearing Your Data
          </h2>
          <p>
            Because your local data is stored exclusively in your browser, you can delete all your records at any time by clearing your browser cache or site data for <code className="text-amber-400 font-mono text-xs bg-neutral-950 px-1.5 py-0.5 rounded">reptilebirds.com</code>.
          </p>
        </section>

        {/* Quick Links to All Categories */}
        <div className="pt-6 border-t border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Explore All Skill Categories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={`/${cat.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateCategory(cat.id);
                }}
                className="p-2.5 rounded-xl bg-neutral-950/70 hover:bg-neutral-800 border border-neutral-800/80 hover:border-neutral-700 transition-colors flex items-center gap-2 text-xs text-neutral-300 hover:text-amber-400"
              >
                <span>{cat.icon}</span>
                <span className="truncate font-medium">{cat.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
