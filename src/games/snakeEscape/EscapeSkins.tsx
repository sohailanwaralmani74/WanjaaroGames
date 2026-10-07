import React from 'react';
import { BirdOfPreyType, SnakeEscapeSkinId } from './engine';
import { SNAKE_ESCAPE_SKINS } from './storage';

interface EscapeSkinSvgProps {
  skinId: SnakeEscapeSkinId;
  size?: number;
  className?: string;
}

export const EscapeSkinSvg: React.FC<EscapeSkinSvgProps> = ({
  skinId,
  size = 54,
  className = '',
}) => {
  const skin =
    SNAKE_ESCAPE_SKINS.find((s) => s.id === skinId) || SNAKE_ESCAPE_SKINS[0];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={`${skin.species} snake skin`}
    >
      {/* Coiled S-Body */}
      <path
        d="M 14 48 Q 8 24, 28 24 T 48 42"
        fill="none"
        stroke={skin.primaryColor}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M 14 48 Q 8 24, 28 24 T 48 42"
        fill="none"
        stroke={skin.secondaryColor}
        strokeWidth="6"
        strokeDasharray={skin.pattern === 'stripes' ? '32 2' : '5 7'}
        strokeLinecap="round"
      />
      {skinId === 'king-cobra' && (
        <ellipse
          cx="46"
          cy="41"
          rx="11"
          ry="9"
          fill={skin.primaryColor}
          stroke={skin.secondaryColor}
          strokeWidth="2"
        />
      )}
      <ellipse cx="48" cy="42" rx="8" ry="6.5" fill={skin.primaryColor} />
      <circle cx="46" cy="39" r="1.8" fill={skin.eyeColor} />
      <circle cx="51" cy="40" r="1.8" fill={skin.eyeColor} />
      <path
        d="M 55 43 L 61 44 M 59 43.5 L 62 41.5 M 59 43.5 L 62 46"
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

interface BirdOfPreySvgProps {
  birdType: BirdOfPreyType;
  size?: number;
  className?: string;
}

export const BirdOfPreySvg: React.FC<BirdOfPreySvgProps> = ({
  birdType,
  size = 48,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={`${birdType} bird of prey illustration`}
    >
      {birdType === 'hawk' && (
        <g>
          {/* Red-tailed Hawk silhouette with rust tail */}
          <polygon points="32,48 22,58 42,58" fill="#ea580c" />
          <path d="M6 26 Q20 14 32 28 Q44 14 58 26 Q44 36 32 36 Q20 36 6 26 Z" fill="#78350f" />
          <circle cx="32" cy="22" r="6" fill="#92400e" />
          <polygon points="32,14 29,20 35,20" fill="#facc15" />
        </g>
      )}
      {birdType === 'falcon' && (
        <g>
          {/* Swept-back high-speed Peregrine wings */}
          <path d="M8 36 L26 20 L32 26 L38 20 L56 36 L38 32 L32 48 L26 32 Z" fill="#475569" />
          <circle cx="32" cy="22" r="5" fill="#1e293b" />
          <polygon points="32,14 30,19 34,19" fill="#fbbf24" />
        </g>
      )}
      {birdType === 'eagle' && (
        <g>
          {/* Broad wingspan Bald Eagle with white head & tail */}
          <polygon points="32,44 23,58 41,58" fill="#f8fafc" />
          <path d="M4 26 Q18 18 32 26 Q46 18 60 26 L54 36 L10 36 Z" fill="#451a03" />
          <circle cx="32" cy="20" r="6.5" fill="#f8fafc" />
          <polygon points="32,11 28,18 36,18" fill="#f59e0b" />
        </g>
      )}
      {birdType === 'owl' && (
        <g>
          {/* Nocturnal Barn Owl with heart facial disc */}
          <path d="M6 28 Q18 16 32 26 Q46 16 58 28 Q44 40 32 40 Q20 40 6 28 Z" fill="#d97706" />
          <circle cx="32" cy="25" r="7.5" fill="#fffbeb" stroke="#92400e" strokeWidth="1.5" />
          <circle cx="29" cy="24" r="1.8" fill="#0f172a" />
          <circle cx="35" cy="24" r="1.8" fill="#0f172a" />
        </g>
      )}
    </svg>
  );
};

/**
 * Draws the chosen snake skin directly onto a 2D Canvas for the Shareable Score Card.
 */
export function drawEscapeSkinOnCanvas(
  ctx: CanvasRenderingContext2D,
  skinId: SnakeEscapeSkinId,
  cx: number,
  cy: number,
  scale = 1.6
): void {
  const skin =
    SNAKE_ESCAPE_SKINS.find((s) => s.id === skinId) || SNAKE_ESCAPE_SKINS[0];

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  ctx.beginPath();
  ctx.arc(0, 0, 38, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = skin.secondaryColor;
  ctx.stroke();

  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-22, 14);
  ctx.quadraticCurveTo(-24, -14, 0, -8);
  ctx.quadraticCurveTo(22, -2, 18, 14);
  ctx.strokeStyle = skin.primaryColor;
  ctx.lineWidth = 14;
  ctx.stroke();

  ctx.strokeStyle = skin.secondaryColor;
  ctx.lineWidth = 7;
  ctx.setLineDash(skin.pattern === 'stripes' ? [26, 2] : [6, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = skin.primaryColor;
  ctx.beginPath();
  ctx.ellipse(18, 14, 9, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = skin.eyeColor;
  ctx.beginPath();
  ctx.arc(16, 11, 2.2, 0, Math.PI * 2);
  ctx.arc(21, 12, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
