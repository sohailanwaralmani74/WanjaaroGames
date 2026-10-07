import React, { useState } from 'react';
import {
  Brain,
  Zap,
  Globe2,
  Lock,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export function WanjaaroSEOSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What is ReptileBirds and how does it work?',
      a: 'ReptileBirds is an open client-side web platform engineered with TypeScript and modern web standards. Everything executes directly in your web browser with zero network latency, no software downloads, and no mandatory registration.',
    },
    {
      q: 'Where are my preferences and settings stored?',
      a: 'All preferences and local settings are stored directly in your browser\'s localStorage on your personal phone, tablet, or computer. The site may use cookies for advertisements and analytics as described in the Privacy Policy.',
    },
    {
      q: 'Is ReptileBirds completely free to use?',
      a: 'Yes, 100% free. There are no paywalls, subscriptions, or locked tiers. You can access the platform immediately without creating an account.',
    },
  ];

  return (
    <section aria-labelledby="seo-heading" className="space-y-12 pt-10 border-t border-neutral-850">
      {/* Editorial Overview: About ReptileBirds */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Official Web Platform
          </div>
          <h2 id="seo-heading" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            About ReptileBirds
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            ReptileBirds is a fast, lightweight client-side web platform accessible directly inside any modern browser across desktop, tablet, and mobile devices.
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-neutral-950/80 border border-neutral-800/80 p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Instant Response</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Native client-side execution runs directly on your hardware with zero server latency.
            </p>
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800/80 p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Clean Architecture</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Streamlined, accessible interface designed for clarity and speed on any screen size.
            </p>
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800/80 p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Global Access</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Lightweight static architecture loads rapidly worldwide without region locks or logins.
            </p>
          </div>

          <div className="bg-neutral-950/80 border border-neutral-800/80 p-5 rounded-2xl space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Client-Side Privacy</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Local preferences remain in your browser's localStorage with zero mandatory accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Semantic FAQ Section */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 sm:p-10 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Answers about the ReptileBirds platform and privacy.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-neutral-800 bg-neutral-950/60 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-neutral-200 hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-850 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
