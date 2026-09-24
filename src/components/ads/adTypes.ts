import React from 'react';

export type AdSlotType = 'leaderboard' | 'medium-rectangle' | 'skyscraper' | 'mobile-anchor' | 'native-banner';

export interface AdUnitConfig {
  id: string;
  slotType: AdSlotType;
  title?: string;
  description?: string;
  sponsorName?: string;
  sponsorUrl?: string;
  ctaText?: string;
  category?: string;
  colorGradient?: string;
  badge?: string;
}

export const SAMPLE_SPONSORS: AdUnitConfig[] = [
  {
    id: 'sponsor-cloud',
    slotType: 'leaderboard',
    sponsorName: 'HyperSpeed Cloud',
    title: 'Deploy Full-Stack Apps in 10 Seconds',
    description: 'High performance edge compute with zero cold-starts & global CDN.',
    ctaText: 'Start Free Trial',
    badge: 'Sponsored Cloud Hosting',
    colorGradient: 'from-blue-600/20 via-cyan-500/10 to-indigo-600/20',
  },
  {
    id: 'sponsor-dev-tools',
    slotType: 'medium-rectangle',
    sponsorName: 'DevMetrics Pro',
    title: 'Real-time Latency & Performance APM',
    description: 'Track client-side frame rates, input delay, and memory leaks seamlessly.',
    ctaText: 'Inspect Live',
    badge: 'Developer Partner',
    colorGradient: 'from-amber-500/20 via-orange-500/10 to-rose-500/20',
  },
  {
    id: 'sponsor-vpn',
    slotType: 'skyscraper',
    sponsorName: 'CipherShield',
    title: 'Ultra-Fast Private Browsing',
    description: 'Zero logs, 10Gbps bandwidth across 90+ countries worldwide.',
    ctaText: 'Get 70% Off',
    badge: 'Privacy Sponsor',
    colorGradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/20',
  },
  {
    id: 'sponsor-gaming',
    slotType: 'mobile-anchor',
    sponsorName: 'ProGear Gaming',
    title: 'Sub-1ms Wireless Mechanical Keyboards',
    ctaText: 'Explore Gear',
    badge: 'Hardware Partner',
    colorGradient: 'from-violet-500/20 to-fuchsia-500/20',
  },
];
