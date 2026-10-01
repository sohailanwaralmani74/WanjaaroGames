import React, { useEffect, useRef } from 'react';

interface DesktopSidebarCpmAdProps {
  className?: string;
}

/**
 * Dedicated Desktop View Sidebar Ad Unit
 * Script: https://pl31111202.profitableratecpmnetwork.com/5ec3c4b0a267d356073051679993785a/invoke.js
 * Container: container-5ec3c4b0a267d356073051679993785a
 */
export function DesktopSidebarCpmAd({ className = '' }: DesktopSidebarCpmAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clear previous children
    el.innerHTML = '';

    // Create the container element expected by the network
    const adContainer = document.createElement('div');
    adContainer.id = 'container-5ec3c4b0a267d356073051679993785a';
    adContainer.style.width = '100%';
    adContainer.style.minHeight = '250px';
    adContainer.style.display = 'flex';
    adContainer.style.justifyContent = 'center';
    adContainer.style.alignItems = 'center';
    el.appendChild(adContainer);

    // Create and append the script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src =
      'https://pl31111202.profitableratecpmnetwork.com/5ec3c4b0a267d356073051679993785a/invoke.js';

    el.appendChild(script);

    return () => {
      if (el) {
        el.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      className={`w-full min-h-[250px] flex items-center justify-center bg-neutral-950/70 border border-neutral-850 rounded-xl overflow-hidden p-2 select-none shadow-inner ${className}`}
    >
      <div ref={containerRef} className="w-full flex justify-center" />
    </div>
  );
}
