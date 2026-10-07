import React from 'react';
import { SnakeSkinId } from './engine';

export interface SnakeSkinMeta {
  id: SnakeSkinId;
  speciesName: string;
  scientificName: string;
  requiredMice: number;
  headColor: string;
  bodyPrimary: string;
  bodySecondary: string;
  patternType: 'saddles' | 'diamonds' | 'bands' | 'hood' | 'stripes' | 'emerald';
  eyeColor: string;
}

export const SNAKE_SKINS: Record<SnakeSkinId, SnakeSkinMeta> = {
  'ball-python': {
    id: 'ball-python',
    speciesName: 'Ball Python',
    scientificName: 'Python regius',
    requiredMice: 0,
    headColor: '#a16207',
    bodyPrimary: '#854d0e',
    bodySecondary: '#facc15',
    patternType: 'saddles',
    eyeColor: '#fef08a',
  },
  'green-tree-python': {
    id: 'green-tree-python',
    speciesName: 'Green Tree Python',
    scientificName: 'Morelia viridis',
    requiredMice: 50,
    headColor: '#16a34a',
    bodyPrimary: '#15803d',
    bodySecondary: '#bef264',
    patternType: 'diamonds',
    eyeColor: '#fde047',
  },
  'corn-snake': {
    id: 'corn-snake',
    speciesName: 'Corn Snake',
    scientificName: 'Pantherophis guttatus',
    requiredMice: 150,
    headColor: '#ea580c',
    bodyPrimary: '#c2410c',
    bodySecondary: '#fed7aa',
    patternType: 'bands',
    eyeColor: '#ffffff',
  },
  'king-cobra': {
    id: 'king-cobra',
    speciesName: 'King Cobra',
    scientificName: 'Ophiophagus hannah',
    requiredMice: 300,
    headColor: '#334155',
    bodyPrimary: '#1e293b',
    bodySecondary: '#fbbf24',
    patternType: 'hood',
    eyeColor: '#f87171',
  },
  'garter-snake': {
    id: 'garter-snake',
    speciesName: 'Garter Snake',
    scientificName: 'Thamnophis sirtalis',
    requiredMice: 600,
    headColor: '#0f766e',
    bodyPrimary: '#115e59',
    bodySecondary: '#2dd4bf',
    patternType: 'stripes',
    eyeColor: '#ffffff',
  },
  'emerald-boa': {
    id: 'emerald-boa',
    speciesName: 'Emerald Boa',
    scientificName: 'Corallus caninus',
    requiredMice: 1000,
    headColor: '#059669',
    bodyPrimary: '#047857',
    bodySecondary: '#ecfdf5',
    patternType: 'emerald',
    eyeColor: '#fef08a',
  },
};

export const SNAKE_SKIN_LIST: SnakeSkinMeta[] = [
  SNAKE_SKINS['ball-python'],
  SNAKE_SKINS['green-tree-python'],
  SNAKE_SKINS['corn-snake'],
  SNAKE_SKINS['king-cobra'],
  SNAKE_SKINS['garter-snake'],
  SNAKE_SKINS['emerald-boa'],
];

/**
 * Renders an SVG preview badge of a snake skin showing its head, forked tongue,
 * and species-specific dorsal pattern.
 */
export const SnakeSkinPreviewSvg: React.FC<{
  skinId: SnakeSkinId;
  size?: number;
  className?: string;
}> = ({ skinId, size = 56, className = '' }) => {
  const skin = SNAKE_SKINS[skinId];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      role="img"
      aria-label={`${skin.speciesName} skin preview`}
    >
      {/* Coiled body segments */}
      <path
        d="M 16 58 Q 16 28, 40 28 T 64 46"
        fill="none"
        stroke={skin.bodyPrimary}
        strokeWidth="15"
        strokeLinecap="round"
      />
      {/* Dorsal markings based on species */}
      {skin.patternType === 'saddles' && (
        <path
          d="M 16 58 Q 16 28, 40 28 T 64 46"
          fill="none"
          stroke={skin.bodySecondary}
          strokeWidth="8"
          strokeDasharray="6 8"
          strokeLinecap="round"
        />
      )}
      {skin.patternType === 'diamonds' && (
        <path
          d="M 16 58 Q 16 28, 40 28 T 64 46"
          fill="none"
          stroke={skin.bodySecondary}
          strokeWidth="5"
          strokeDasharray="3 6"
        />
      )}
      {skin.patternType === 'bands' && (
        <path
          d="M 16 58 Q 16 28, 40 28 T 64 46"
          fill="none"
          stroke={skin.bodySecondary}
          strokeWidth="11"
          strokeDasharray="3 7"
        />
      )}
      {skin.patternType === 'hood' && (
        <>
          <ellipse
            cx="58"
            cy="44"
            rx="14"
            ry="10"
            fill={skin.bodyPrimary}
            stroke={skin.bodySecondary}
            strokeWidth="2.5"
          />
          <path
            d="M 16 58 Q 16 28, 40 28 T 60 44"
            fill="none"
            stroke={skin.bodySecondary}
            strokeWidth="4"
            strokeDasharray="2 7"
          />
        </>
      )}
      {skin.patternType === 'stripes' && (
        <path
          d="M 16 58 Q 16 28, 40 28 T 64 46"
          fill="none"
          stroke={skin.bodySecondary}
          strokeWidth="3.5"
        />
      )}
      {skin.patternType === 'emerald' && (
        <path
          d="M 16 58 Q 16 28, 40 28 T 64 46"
          fill="none"
          stroke={skin.bodySecondary}
          strokeWidth="6"
          strokeDasharray="2 6"
          strokeLinecap="square"
        />
      )}

      {/* Forked red tongue */}
      <path
        d="M 66 52 L 73 58 M 70 55 L 75 53 M 70 55 L 71 60"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Snake Head */}
      <ellipse
        cx="62"
        cy="46"
        rx="10"
        ry="8.5"
        fill={skin.headColor}
        stroke="#ffffff"
        strokeWidth="1.5"
      />
      {/* Eyes */}
      <circle cx="60" cy="42" r="2.2" fill={skin.eyeColor} />
      <circle cx="66" cy="44" r="2.2" fill={skin.eyeColor} />
      <circle cx="60" cy="42" r="1" fill="#0f172a" />
      <circle cx="66" cy="44" r="1" fill="#0f172a" />
    </svg>
  );
};

/**
 * Draws the selected snake skin onto a 2D HTML5 Canvas for the Shareable Score Card.
 */
export function drawSnakeSkinOnCanvas(
  ctx: CanvasRenderingContext2D,
  skinId: SnakeSkinId,
  centerX: number,
  centerY: number,
  radius: number
): void {
  const skin = SNAKE_SKINS[skinId];
  ctx.save();

  // Medallion backdrop
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = skin.bodySecondary;
  ctx.stroke();

  // S-shaped coiled snake body inside medallion
  ctx.beginPath();
  ctx.moveTo(centerX - radius * 0.55, centerY + radius * 0.35);
  ctx.bezierCurveTo(
    centerX - radius * 0.6,
    centerY - radius * 0.65,
    centerX + radius * 0.4,
    centerY - radius * 0.55,
    centerX + radius * 0.42,
    centerY + radius * 0.15
  );
  ctx.lineCap = 'round';
  ctx.lineWidth = radius * 0.36;
  ctx.strokeStyle = skin.bodyPrimary;
  ctx.stroke();

  // Pattern overlay
  ctx.setLineDash([radius * 0.12, radius * 0.14]);
  ctx.lineWidth = radius * 0.18;
  ctx.strokeStyle = skin.bodySecondary;
  ctx.stroke();
  ctx.setLineDash([]);

  // Snake head at end of curve
  const hx = centerX + radius * 0.42;
  const hy = centerY + radius * 0.18;
  ctx.beginPath();
  ctx.arc(hx, hy, radius * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = skin.headColor;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Eyes
  [-0.08, 0.08].forEach((ox) => {
    ctx.beginPath();
    ctx.arc(hx + radius * ox, hy - radius * 0.04, radius * 0.055, 0, Math.PI * 2);
    ctx.fillStyle = skin.eyeColor;
    ctx.fill();
  });

  ctx.restore();
}
