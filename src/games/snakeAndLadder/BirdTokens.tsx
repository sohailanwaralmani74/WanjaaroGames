import React from 'react';
import { BirdTokenId } from './engine';

export interface BirdTokenMeta {
  id: BirdTokenId;
  name: string;
  speciesLabel: string;
  primaryColor: string;
  secondaryColor: string;
  badgeBg: string;
  badgeText: string;
  borderHex: string;
}

export const BIRD_TOKENS: Record<BirdTokenId, BirdTokenMeta> = {
  parrot: {
    id: 'parrot',
    name: 'Scarlet Macaw',
    speciesLabel: 'Parrot',
    primaryColor: '#ef4444',
    secondaryColor: '#facc15',
    badgeBg: 'bg-red-500/15',
    badgeText: 'text-red-400',
    borderHex: '#ef4444',
  },
  owl: {
    id: 'owl',
    name: 'Great Horned Owl',
    speciesLabel: 'Owl',
    primaryColor: '#f59e0b',
    secondaryColor: '#78350f',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
    borderHex: '#f59e0b',
  },
  eagle: {
    id: 'eagle',
    name: 'Harpy Eagle',
    speciesLabel: 'Eagle',
    primaryColor: '#0ea5e9',
    secondaryColor: '#f8fafc',
    badgeBg: 'bg-sky-500/15',
    badgeText: 'text-sky-400',
    borderHex: '#0ea5e9',
  },
  penguin: {
    id: 'penguin',
    name: 'Emperor Penguin',
    speciesLabel: 'Penguin',
    primaryColor: '#8b5cf6',
    secondaryColor: '#fb923c',
    badgeBg: 'bg-violet-500/15',
    badgeText: 'text-violet-400',
    borderHex: '#8b5cf6',
  },
};

export const BIRD_TOKEN_LIST: BirdTokenMeta[] = [
  BIRD_TOKENS.parrot,
  BIRD_TOKENS.owl,
  BIRD_TOKENS.eagle,
  BIRD_TOKENS.penguin,
];

interface BirdTokenSvgProps {
  token: BirdTokenId;
  size?: number;
  className?: string;
}

/**
 * Original SVG Bird Tokens with distinct silhouettes, shapes, and high-contrast colors
 * for color-blind accessibility:
 * - Parrot: Tropical crested circle badge with curved hooked beak
 * - Owl: Tufted ear-horn shield silhouette with large binocular eyes
 * - Eagle: Fierce diamond crest silhouette with golden hooked raptor beak
 * - Penguin: Rounded tuxedo oval silhouette with bright orange bill
 */
export const BirdTokenSvg: React.FC<BirdTokenSvgProps> = ({
  token,
  size = 36,
  className = '',
}) => {
  switch (token) {
    case 'parrot':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={className}
          role="img"
          aria-label="Parrot token"
        >
          {/* Outer distinct shape: Circle */}
          <circle cx="32" cy="34" r="24" fill="#dc2626" stroke="#ffffff" strokeWidth="3" />
          {/* Feather crest */}
          <path
            d="M24 12 C24 4, 32 4, 34 11 C38 5, 44 8, 40 15"
            fill="#facc15"
            stroke="#991b1b"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Wing accent */}
          <path d="M14 34 C14 46, 26 52, 34 48 C26 42, 22 36, 14 34 Z" fill="#22c55e" />
          {/* White facial patch */}
          <circle cx="28" cy="30" r="8" fill="#fef2f2" />
          {/* Eye */}
          <circle cx="28" cy="29" r="3.5" fill="#0f172a" />
          <circle cx="27" cy="28" r="1.2" fill="#ffffff" />
          {/* Curved tropical beak */}
          <path
            d="M36 25 C48 25, 52 34, 43 40 C41 34, 38 32, 35 32 Z"
            fill="#facc15"
            stroke="#0f172a"
            strokeWidth="2"
          />
          <path d="M36 32 C41 33, 43 36, 40 41 C36 39, 35 36, 36 32 Z" fill="#1e293b" />
        </svg>
      );

    case 'owl':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={className}
          role="img"
          aria-label="Owl token"
        >
          {/* Outer distinct shape: Hexagonal/Horned Shield */}
          <path
            d="M12 14 L24 20 L40 20 L52 14 L54 38 C54 50, 44 58, 32 58 C20 58, 10 50, 10 38 Z"
            fill="#b45309"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Belly speckles */}
          <ellipse cx="32" cy="46" rx="13" ry="8" fill="#fde68a" />
          <path
            d="M26 44 L28 47 M32 43 L34 46 M38 44 L36 47"
            stroke="#78350f"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Binocular facial discs */}
          <circle cx="23" cy="31" r="9" fill="#fef3c7" stroke="#78350f" strokeWidth="2" />
          <circle cx="41" cy="31" r="9" fill="#fef3c7" stroke="#78350f" strokeWidth="2" />
          {/* Pupils */}
          <circle cx="23" cy="31" r="4.5" fill="#0f172a" />
          <circle cx="41" cy="31" r="4.5" fill="#0f172a" />
          <circle cx="21.5" cy="29.5" r="1.5" fill="#ffffff" />
          <circle cx="39.5" cy="29.5" r="1.5" fill="#ffffff" />
          {/* Diamond beak */}
          <polygon
            points="32,32 28,38 32,43 36,38"
            fill="#f59e0b"
            stroke="#451a03"
            strokeWidth="1.5"
          />
        </svg>
      );

    case 'eagle':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={className}
          role="img"
          aria-label="Eagle token"
        >
          {/* Outer distinct shape: Bold Diamond / Raptor Crest */}
          <polygon
            points="32,6 58,32 32,58 6,32"
            fill="#0284c7"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* White raptor head */}
          <path
            d="M16 32 C16 20, 26 15, 34 15 C42 15, 48 22, 48 32 L42 38 L32 35 L22 39 Z"
            fill="#f8fafc"
          />
          {/* Fierce brow */}
          <path
            d="M21 25 L33 28"
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Eye */}
          <circle cx="27" cy="29" r="3" fill="#0f172a" />
          <circle cx="26" cy="28" r="1" fill="#ffffff" />
          {/* Hooked golden raptor beak */}
          <path
            d="M33 27 C46 26, 52 33, 46 42 C42 39, 38 38, 33 38 Z"
            fill="#fbbf24"
            stroke="#0f172a"
            strokeWidth="2"
          />
        </svg>
      );

    case 'penguin':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          className={className}
          role="img"
          aria-label="Penguin token"
        >
          {/* Outer distinct shape: Rounded Squircle / Dome */}
          <rect
            x="10"
            y="8"
            width="44"
            height="48"
            rx="20"
            fill="#6d28d9"
            stroke="#ffffff"
            strokeWidth="3"
          />
          {/* Tuxedo dark hood */}
          <path
            d="M14 28 C14 14, 22 11, 32 11 C42 11, 50 14, 50 28 L50 46 C50 52, 42 54, 32 54 C22 54, 14 52, 14 46 Z"
            fill="#1e1b4b"
          />
          {/* White belly & face heart */}
          <path
            d="M20 30 C20 22, 26 22, 32 26 C38 22, 44 22, 44 30 L44 46 C44 51, 38 53, 32 53 C26 53, 20 51, 20 46 Z"
            fill="#f8fafc"
          />
          {/* Golden collar */}
          <path
            d="M21 38 Q32 43 43 38"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Eyes */}
          <circle cx="26" cy="29" r="3" fill="#0f172a" />
          <circle cx="38" cy="29" r="3" fill="#0f172a" />
          <circle cx="25" cy="28" r="1" fill="#ffffff" />
          <circle cx="37" cy="28" r="1" fill="#ffffff" />
          {/* Orange bill */}
          <polygon
            points="32,31 26,35 32,39 38,35"
            fill="#fb923c"
            stroke="#0f172a"
            strokeWidth="1.5"
          />
        </svg>
      );
  }
};

/**
 * Helper to draw the player's SVG bird token directly onto an HTML5 2D Canvas
 * for the 1080x1080 and 1080x1920 shareable score cards.
 */
export function drawBirdTokenOnCanvas(
  ctx: CanvasRenderingContext2D,
  token: BirdTokenId,
  centerX: number,
  centerY: number,
  radius: number
): void {
  ctx.save();
  const meta = BIRD_TOKENS[token];

  // Outer glow ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fill();

  // Main token medallion
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = meta.primaryColor;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  if (token === 'parrot') {
    // White cheek patch
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.18, centerY - radius * 0.08, radius * 0.34, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    // Eye
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.18, centerY - radius * 0.1, radius * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    // Golden curved beak
    ctx.beginPath();
    ctx.moveTo(centerX + radius * 0.15, centerY - radius * 0.28);
    ctx.quadraticCurveTo(centerX + radius * 0.75, centerY - radius * 0.1, centerX + radius * 0.42, centerY + radius * 0.35);
    ctx.lineTo(centerX + radius * 0.12, centerY + radius * 0.08);
    ctx.closePath();
    ctx.fillStyle = '#facc15';
    ctx.fill();
  } else if (token === 'owl') {
    // Two large yellow eyes
    [-0.32, 0.32].forEach((offset) => {
      ctx.beginPath();
      ctx.arc(centerX + radius * offset, centerY - radius * 0.05, radius * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = '#fef3c7';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#78350f';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX + radius * offset, centerY - radius * 0.05, radius * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
    });
    // Beak diamond
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + radius * 0.02);
    ctx.lineTo(centerX - radius * 0.15, centerY + radius * 0.25);
    ctx.lineTo(centerX, centerY + radius * 0.46);
    ctx.lineTo(centerX + radius * 0.15, centerY + radius * 0.25);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
  } else if (token === 'eagle') {
    // White crest dome
    ctx.beginPath();
    ctx.arc(centerX, centerY - radius * 0.08, radius * 0.62, Math.PI, 0);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    // Eye
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.2, centerY - radius * 0.12, radius * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    // Raptor golden beak
    ctx.beginPath();
    ctx.moveTo(centerX + radius * 0.05, centerY - radius * 0.2);
    ctx.quadraticCurveTo(centerX + radius * 0.7, centerY - radius * 0.1, centerX + radius * 0.5, centerY + radius * 0.36);
    ctx.lineTo(centerX + radius * 0.05, centerY + radius * 0.18);
    ctx.closePath();
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
  } else {
    // Penguin white face patch
    ctx.beginPath();
    ctx.arc(centerX, centerY + radius * 0.1, radius * 0.58, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    // Eyes
    [-0.24, 0.24].forEach((offset) => {
      ctx.beginPath();
      ctx.arc(centerX + radius * offset, centerY - radius * 0.1, radius * 0.11, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
    });
    // Orange bill
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius * 0.02);
    ctx.lineTo(centerX - radius * 0.22, centerY + radius * 0.16);
    ctx.lineTo(centerX, centerY + radius * 0.32);
    ctx.lineTo(centerX + radius * 0.22, centerY + radius * 0.16);
    ctx.closePath();
    ctx.fillStyle = '#fb923c';
    ctx.fill();
  }

  ctx.restore();
}
