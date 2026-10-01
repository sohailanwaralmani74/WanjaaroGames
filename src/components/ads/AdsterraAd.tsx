import React, { useMemo } from 'react';

export type AdsterraSize =
  | '728x90'
  | '468x60'
  | '300x250'
  | '160x600'
  | '160x300'
  | '320x50';

export interface AdsterraAdConfig {
  key: string;
  width: number;
  height: number;
  label: string;
}

export const ADSTERRA_CONFIGS: Record<AdsterraSize, AdsterraAdConfig> = {
  '728x90': {
    key: '49fb7f861b88900800f4aa0964cec1bf',
    width: 728,
    height: 90,
    label: 'Leaderboard (728×90)',
  },
  '468x60': {
    key: 'f33033a8aee8cc9d080f2520e1a345cf',
    width: 468,
    height: 60,
    label: 'Banner (468×60)',
  },
  '300x250': {
    key: 'bb191f17bb8269ac1e94e51bc93a7b48',
    width: 300,
    height: 250,
    label: 'Medium Rectangle (300×250)',
  },
  '160x600': {
    key: '830d5085b52c47187da5de38d29787cd',
    width: 160,
    height: 600,
    label: 'Wide Skyscraper (160×600)',
  },
  '160x300': {
    key: '3fa238068881377f24b1b67fa0787b9d',
    width: 160,
    height: 300,
    label: 'Half Skyscraper (160×300)',
  },
  '320x50': {
    key: '2fd749543930cf9f83e09854bc96de8a',
    width: 320,
    height: 50,
    label: 'Mobile Banner (320×50)',
  },
};

interface AdsterraAdProps {
  size: AdsterraSize;
  className?: string;
}

/**
 * Isolated Adsterra / highrevenueformat unit.
 * Runs inside an isolated sandbox iframe to guarantee:
 * 1. Zero global variable pollution (each atOptions is scoped to its own window).
 * 2. Zero gameplay interference / cannot overlap game controls or canvas.
 * 3. Zero Cumulative Layout Shift (CLS) by reserving exact container dimensions.
 */
export function AdsterraAd({ size, className = '' }: AdsterraAdProps) {
  const config = ADSTERRA_CONFIGS[size];

  const srcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${config.key}',
      'format' : 'iframe',
      'height' : ${config.height},
      'width' : ${config.width},
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highrevenueformat.com/${config.key}/invoke.js"></script>
</body>
</html>`;
  }, [config.key, config.width, config.height]);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden mx-auto select-none rounded-xl bg-neutral-950/80 border border-neutral-850 shadow-inner ${className}`}
      style={{
        width: `${config.width}px`,
        height: `${config.height}px`,
        maxWidth: '100%',
        minHeight: `${config.height}px`,
      }}
      aria-label={`Sponsored Content • ${config.label}`}
    >
      <iframe
        title={`Adsterra ${config.label}`}
        srcDoc={srcDoc}
        width={config.width}
        height={config.height}
        style={{
          width: `${config.width}px`,
          height: `${config.height}px`,
          border: 'none',
          overflow: 'hidden',
          display: 'block',
        }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
        scrolling="no"
        loading="lazy"
      />
    </div>
  );
}
