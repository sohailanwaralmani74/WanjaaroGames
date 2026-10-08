import React from 'react';
import { ParrotSkinId } from './engine';
import { PARROT_SKINS } from './storage';

interface ParrotSkinSvgProps {
  skinId: ParrotSkinId;
  size?: number;
  wingUp?: boolean;
  className?: string;
}

/**
 * 5 Original SVG Bird Illustrations for Parrot Flap:
 * - Scarlet Macaw (Ara macao)
 * - Common Kingfisher (Alcedo atthis)
 * - Barn Owl (Tyto alba)
 * - Ruby-throated Hummingbird (Archilochus colubris)
 * - Indian Peafowl (Pavo cristatus)
 */
export const ParrotSkinSvg: React.FC<ParrotSkinSvgProps> = ({
  skinId,
  size = 48,
  wingUp = false,
  className = '',
}) => {
  const skin = PARROT_SKINS.find((s) => s.id === skinId) || PARROT_SKINS[0];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={skin.species}
    >
      {/* Tail feathers */}
      {skinId === 'indian-peafowl' ? (
        <g>
          <path
            d="M6 34 L20 28 L18 42 Z"
            fill="#059669"
            stroke="#022c22"
            strokeWidth="1.5"
          />
          <circle cx="10" cy="34" r="3.5" fill="#facc15" />
          <circle cx="10" cy="34" r="1.8" fill="#1d4ed8" />
        </g>
      ) : (
        <path
          d="M8 36 L22 29 L20 41 Z"
          fill={skin.accentColor}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
      )}

      {/* Main Bird Body (streamlined avian silhouette, never a round yellow ball) */}
      <ellipse
        cx="34"
        cy="34"
        rx="16"
        ry="11"
        fill={skin.bodyColor}
        stroke="#0f172a"
        strokeWidth="2"
      />

      {/* Belly Patch */}
      <path
        d="M24 36 Q34 45 46 35 Q38 43 24 36 Z"
        fill={skin.bellyColor}
      />

      {/* Ruby throat badge for Hummingbird */}
      {skinId === 'ruby-hummingbird' && (
        <ellipse cx="45" cy="34" rx="4.5" ry="3" fill="#f43f5e" />
      )}

      {/* Crown crest for Indian Peafowl */}
      {skinId === 'indian-peafowl' && (
        <g stroke="#fbbf24" strokeWidth="1.5">
          <line x1="38" y1="22" x2="35" y2="14" />
          <line x1="41" y1="22" x2="41" y2="13" />
          <circle cx="35" cy="13" r="1.5" fill="#38bdf8" />
          <circle cx="41" cy="12" r="1.5" fill="#38bdf8" />
        </g>
      )}

      {/* Distinctive Beak */}
      {skinId === 'ruby-hummingbird' || skinId === 'common-kingfisher' ? (
        <polygon
          points="48,30 62,33 48,36"
          fill={skin.beakColor}
          stroke="#0f172a"
          strokeWidth="1.2"
        />
      ) : (
        /* Curved Macaw / Owl / Peafowl beak */
        <path
          d="M48 28 Q58 29 56 38 Q51 36 48 35 Z"
          fill={skin.beakColor}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
      )}

      {/* Facial eye patch */}
      <circle
        cx="43"
        cy="29"
        r={skinId === 'barn-owl' ? '5' : '3.8'}
        fill="#f8fafc"
        stroke="#0f172a"
        strokeWidth="1.2"
      />
      <circle cx="44" cy="29" r="2" fill="#0f172a" />
      <circle cx="44.6" cy="28.3" r="0.7" fill="#ffffff" />

      {/* Animated Wing */}
      {wingUp ? (
        <path
          d="M25 33 Q31 14 42 24 Q36 33 25 33 Z"
          fill={skin.wingColor}
          stroke="#0f172a"
          strokeWidth="1.8"
        />
      ) : (
        <path
          d="M24 33 Q33 46 42 36 Q35 31 24 33 Z"
          fill={skin.wingColor}
          stroke="#0f172a"
          strokeWidth="1.8"
        />
      )}
    </svg>
  );
};

/**
 * Draws the selected bird directly onto a 2D canvas (used for the active game & shareable score card).
 */
export function drawBirdOnCanvas(
  ctx: CanvasRenderingContext2D,
  skinId: ParrotSkinId,
  cx: number,
  cy: number,
  radius: number,
  rotationRad: number,
  flapPhase: number
): void {
  const skin = PARROT_SKINS.find((s) => s.id === skinId) || PARROT_SKINS[0];
  const scale = (radius / 15) * skin.cosmeticScale;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotationRad);
  ctx.scale(scale, scale);

  // Tail feathers
  ctx.fillStyle = skin.accentColor;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-22, 2);
  ctx.lineTo(-10, -5);
  ctx.lineTo(-11, 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (skinId === 'indian-peafowl') {
    ctx.beginPath();
    ctx.arc(-18, 1, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.fill();
  }

  // Streamlined bird body
  ctx.fillStyle = skin.bodyColor;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Belly highlight
  ctx.fillStyle = skin.bellyColor;
  ctx.beginPath();
  ctx.ellipse(2, 4, 11, 5, 0, 0, Math.PI);
  ctx.fill();

  // Ruby throat patch for Hummingbird
  if (skinId === 'ruby-hummingbird') {
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(11, 1, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Peafowl crest
  if (skinId === 'indian-peafowl') {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(4, -10);
    ctx.lineTo(1, -18);
    ctx.moveTo(7, -10);
    ctx.lineTo(7, -19);
    ctx.stroke();
  }

  // Beak
  ctx.fillStyle = skin.beakColor;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  if (skinId === 'ruby-hummingbird' || skinId === 'common-kingfisher') {
    ctx.moveTo(14, -3);
    ctx.lineTo(28, 0);
    ctx.lineTo(14, 3);
  } else {
    ctx.moveTo(14, -5);
    ctx.quadraticCurveTo(24, -4, 21, 5);
    ctx.lineTo(14, 2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(9, -4, skinId === 'barn-owl' ? 4.5 : 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(10, -4, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Wing flap animation tied to flapPhase
  const wingOffsetY = Math.sin(flapPhase) * 9;
  ctx.fillStyle = skin.wingColor;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.quadraticCurveTo(-1, -10 - wingOffsetY, 8, -2 - wingOffsetY * 0.5);
  ctx.quadraticCurveTo(1, 6, -8, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
