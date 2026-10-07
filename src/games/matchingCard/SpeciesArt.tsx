import React from 'react';

interface SpeciesArtProps {
  species: string;
  size?: number;
  className?: string;
}

/**
 * 18 Original, recognizable SVG illustrations for the 9 Birds and 9 Reptiles:
 * Birds: Scarlet Macaw, Bald Eagle, Barn Owl, Emperor Penguin, Indian Peafowl,
 *        Greater Flamingo, Peregrine Falcon, Common Kingfisher, Mallard.
 * Reptiles: Ball Python, King Cobra, Komodo Dragon, Nile Crocodile, Green Sea Turtle,
 *           Leopard Gecko, Green Iguana, Panther Chameleon, Central Bearded Dragon.
 */
export const SpeciesArtSvg: React.FC<SpeciesArtProps> = ({
  species,
  size = 54,
  className = '',
}) => {
  const key = species.toLowerCase();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={`${species} illustration`}
    >
      {/* 1. Scarlet Macaw */}
      {key === 'scarlet macaw' && (
        <g>
          <circle cx="32" cy="32" r="26" fill="#dc2626" opacity="0.18" />
          <path d="M18 46 C16 26, 26 14, 38 16 C44 17, 46 28, 40 46 Z" fill="#ef4444" />
          <path d="M18 36 C16 44, 24 52, 34 48 C28 42, 24 38, 18 36 Z" fill="#2563eb" />
          <path d="M20 34 C22 40, 28 42, 34 40" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
          <circle cx="31" cy="24" r="6" fill="#ffffff" />
          <circle cx="31" cy="24" r="2.6" fill="#0f172a" />
          <path d="M36 20 C48 20, 50 29, 41 33 C40 27, 38 25, 36 25 Z" fill="#fef08a" stroke="#0f172a" strokeWidth="1.5" />
        </g>
      )}

      {/* 2. Bald Eagle */}
      {key === 'bald eagle' && (
        <g>
          <circle cx="32" cy="32" r="26" fill="#0ea5e9" opacity="0.18" />
          <path d="M14 50 C16 34, 24 28, 32 28 C40 28, 48 34, 50 50 Z" fill="#451a03" />
          <path d="M18 32 C18 16, 26 12, 33 12 C41 12, 46 18, 45 32 L38 35 L32 32 L25 35 Z" fill="#f8fafc" />
          <path d="M24 22 L33 25" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="28" cy="25" r="2.5" fill="#facc15" />
          <circle cx="28" cy="25" r="1.2" fill="#0f172a" />
          <path d="M34 22 C47 21, 52 28, 45 36 C41 33, 38 32, 34 32 Z" fill="#f59e0b" />
        </g>
      )}

      {/* 3. Barn Owl */}
      {key === 'barn owl' && (
        <g>
          <circle cx="32" cy="32" r="26" fill="#f59e0b" opacity="0.18" />
          <ellipse cx="32" cy="36" rx="16" ry="19" fill="#d97706" />
          {/* Iconic white heart-shaped facial disc */}
          <path
            d="M32 18 C24 12, 16 20, 19 30 C22 37, 28 42, 32 45 C36 42, 42 37, 45 30 C48 20, 40 12, 32 18 Z"
            fill="#fffbeb"
            stroke="#92400e"
            strokeWidth="2"
          />
          <circle cx="26" cy="28" r="3" fill="#0f172a" />
          <circle cx="38" cy="28" r="3" fill="#0f172a" />
          <polygon points="32,30 29,35 32,39 35,35" fill="#fbbf24" />
        </g>
      )}

      {/* 4. Emperor Penguin */}
      {key === 'emperor penguin' && (
        <g>
          <circle cx="32" cy="32" r="26" fill="#38bdf8" opacity="0.18" />
          <ellipse cx="32" cy="35" rx="15" ry="21" fill="#0f172a" />
          <ellipse cx="32" cy="39" rx="10" ry="15" fill="#f8fafc" />
          <path d="M23 28 Q32 34 41 28" fill="none" stroke="#facc15" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="27" cy="22" r="2" fill="#ffffff" />
          <circle cx="37" cy="22" r="2" fill="#ffffff" />
          <polygon points="32,23 27,27 32,31 37,27" fill="#fb923c" />
        </g>
      )}

      {/* 5. Indian Peafowl */}
      {key === 'indian peafowl' && (
        <g>
          {/* Tail fan with eye-spots */}
          <circle cx="32" cy="32" r="24" fill="#059669" />
          <circle cx="20" cy="22" r="3.5" fill="#facc15" />
          <circle cx="32" cy="16" r="3.5" fill="#facc15" />
          <circle cx="44" cy="22" r="3.5" fill="#facc15" />
          <circle cx="16" cy="34" r="3.5" fill="#facc15" />
          <circle cx="48" cy="34" r="3.5" fill="#facc15" />
          <circle cx="20" cy="22" r="1.6" fill="#1d4ed8" />
          <circle cx="32" cy="16" r="1.6" fill="#1d4ed8" />
          <circle cx="44" cy="22" r="1.6" fill="#1d4ed8" />
          {/* Royal blue neck & body */}
          <path d="M26 52 C26 34, 29 24, 32 24 C35 24, 38 34, 38 52 Z" fill="#1d4ed8" />
          <line x1="32" y1="24" x2="32" y2="18" stroke="#60a5fa" strokeWidth="2" />
          <circle cx="32" cy="26" r="1.5" fill="#ffffff" />
          <polygon points="35,26 41,28 35,30" fill="#fbbf24" />
        </g>
      )}

      {/* 6. Greater Flamingo */}
      {key === 'greater flamingo' && (
        <g>
          <circle cx="32" cy="32" r="26" fill="#f472b6" opacity="0.18" />
          {/* Long S-curved pink neck */}
          <path
            d="M28 44 C18 44, 18 32, 28 32 C36 32, 34 16, 26 16"
            fill="none"
            stroke="#f472b6"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <ellipse cx="34" cy="44" rx="12" ry="8" fill="#ec4899" />
          <circle cx="25" cy="16" r="5" fill="#f472b6" />
          <path d="M21 16 C15 17, 14 22, 18 24 L22 19 Z" fill="#0f172a" />
          <circle cx="24" cy="15" r="1.5" fill="#fef08a" />
          <line x1="32" y1="50" x2="32" y2="60" stroke="#f472b6" strokeWidth="2.5" />
          <line x1="37" y1="50" x2="41" y2="57" stroke="#f472b6" strokeWidth="2.5" />
        </g>
      )}

      {/* 7. Peregrine Falcon */}
      {key === 'peregrine falcon' && (
        <g>
          <circle cx="32" cy="32" r="26" fill="#64748b" opacity="0.2" />
          <path d="M16 48 C18 28, 26 16, 36 16 C44 16, 48 26, 46 48 Z" fill="#475569" />
          {/* Barred white chest */}
          <ellipse cx="32" cy="40" rx="10" ry="10" fill="#f1f5f9" />
          <path d="M26 37 H38 M25 41 H39 M27 45 H37" stroke="#334155" strokeWidth="1.8" />
          {/* Dark malar helmet stripe */}
          <path d="M27 22 L27 30" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="29" cy="22" r="2.2" fill="#facc15" />
          <path d="M35 20 C44 20, 46 26, 40 29 Z" fill="#fbbf24" />
        </g>
      )}

      {/* 8. Common Kingfisher */}
      {key === 'common kingfisher' && (
        <g>
          <circle cx="32" cy="32" r="26" fill="#06b6d4" opacity="0.18" />
          {/* Vibrant orange belly & cyan crest */}
          <ellipse cx="30" cy="38" rx="13" ry="12" fill="#ea580c" />
          <path d="M16 38 C16 20, 26 14, 36 18 C40 20, 38 30, 26 36 Z" fill="#0284c7" />
          {/* Long dagger bill */}
          <polygon points="36,22 56,24 36,28" fill="#0f172a" />
          <circle cx="31" cy="22" r="2" fill="#ffffff" />
        </g>
      )}

      {/* 9. Mallard */}
      {key === 'mallard' && (
        <g>
          <circle cx="32" cy="32" r="26" fill="#10b981" opacity="0.18" />
          <ellipse cx="30" cy="44" rx="16" ry="9" fill="#78350f" />
          {/* White neck ring */}
          <path d="M24 34 H36" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          {/* Iridescent emerald head */}
          <circle cx="31" cy="24" r="10" fill="#047857" />
          <circle cx="33" cy="22" r="2" fill="#ffffff" />
          {/* Yellow duck bill */}
          <path d="M39 22 C50 22, 52 27, 40 28 Z" fill="#facc15" />
        </g>
      )}

      {/* 10. Ball Python */}
      {key === 'ball python' && (
        <g>
          <path
            d="M16 46 Q 14 20, 34 22 T 48 42"
            fill="none"
            stroke="#713f12"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M16 46 Q 14 20, 34 22 T 48 42"
            fill="none"
            stroke="#facc15"
            strokeWidth="6"
            strokeDasharray="5 7"
            strokeLinecap="round"
          />
          <ellipse cx="48" cy="42" rx="8" ry="6.5" fill="#a16207" />
          <circle cx="46" cy="39" r="1.8" fill="#fef08a" />
          <circle cx="51" cy="40" r="1.8" fill="#fef08a" />
        </g>
      )}

      {/* 11. King Cobra */}
      {key === 'king cobra' && (
        <g>
          {/* Flared Cobra Hood */}
          <ellipse cx="32" cy="28" rx="18" ry="13" fill="#334155" stroke="#fbbf24" strokeWidth="2.5" />
          <path d="M24 26 Q28 22 26 30 M40 26 Q36 22 38 30" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <path d="M32 28 L32 54" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
          <circle cx="32" cy="24" r="7.5" fill="#475569" />
          <circle cx="29" cy="22" r="1.8" fill="#f87171" />
          <circle cx="35" cy="22" r="1.8" fill="#f87171" />
          <path d="M32 31 L32 38 M32 36 L29 40 M32 36 L35 40" stroke="#ef4444" strokeWidth="1.6" />
        </g>
      )}

      {/* 12. Komodo Dragon */}
      {key === 'komodo dragon' && (
        <g>
          <ellipse cx="28" cy="38" rx="16" ry="9" fill="#57534e" />
          <path d="M12 38 Q6 46 18 50" fill="none" stroke="#57534e" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="44" cy="32" rx="9" ry="6" fill="#78716c" />
          <circle cx="46" cy="30" r="1.8" fill="#facc15" />
          {/* Yellow forked tongue */}
          <path d="M53 32 L60 32 M57 32 L61 29 M57 32 L61 35" stroke="#facc15" strokeWidth="2" />
          <line x1="22" y1="45" x2="20" y2="54" stroke="#44403c" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="35" y1="45" x2="37" y2="54" stroke="#44403c" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}

      {/* 13. Nile Crocodile */}
      {key === 'nile crocodile' && (
        <g>
          {/* Long armored jaws & osteoderm scutes */}
          <path d="M10 36 Q26 24 54 32 L54 38 L26 38 Z" fill="#15803d" />
          <path d="M26 38 L54 38 L52 43 L26 42 Z" fill="#86efac" />
          {/* White interlocking teeth */}
          <path d="M32 38 L34 36 L36 38 L38 36 L40 38 L42 36 L44 38 L46 36 L48 38" stroke="#ffffff" strokeWidth="1.6" fill="none" />
          <circle cx="24" cy="28" r="3.5" fill="#facc15" />
          <circle cx="24" cy="28" r="1.5" fill="#0f172a" />
        </g>
      )}

      {/* 14. Green Sea Turtle */}
      {key === 'green sea turtle' && (
        <g>
          {/* Flippers */}
          <ellipse cx="18" cy="24" rx="8" ry="4" transform="rotate(-35 18 24)" fill="#22c55e" />
          <ellipse cx="46" cy="24" rx="8" ry="4" transform="rotate(35 46 24)" fill="#22c55e" />
          <ellipse cx="20" cy="48" rx="6" ry="3" transform="rotate(30 20 48)" fill="#22c55e" />
          <ellipse cx="44" cy="48" rx="6" ry="3" transform="rotate(-30 44 48)" fill="#22c55e" />
          {/* Hexagonal patterned carapace shell */}
          <ellipse cx="32" cy="36" rx="14" ry="16" fill="#166534" stroke="#86efac" strokeWidth="2" />
          <polygon points="32,26 38,31 38,40 32,45 26,40 26,31" fill="#15803d" stroke="#bbf7d0" strokeWidth="1.5" />
          {/* Head */}
          <circle cx="32" cy="15" r="5.5" fill="#22c55e" />
          <circle cx="30" cy="14" r="1.2" fill="#0f172a" />
          <circle cx="34" cy="14" r="1.2" fill="#0f172a" />
        </g>
      )}

      {/* 15. Leopard Gecko */}
      {key === 'leopard gecko' && (
        <g>
          <path d="M16 46 Q32 36 46 24" stroke="#facc15" strokeWidth="11" strokeLinecap="round" fill="none" />
          {/* Leopard spots */}
          <circle cx="22" cy="42" r="2.2" fill="#1e293b" />
          <circle cx="30" cy="36" r="2.4" fill="#1e293b" />
          <circle cx="36" cy="32" r="2" fill="#1e293b" />
          <circle cx="46" cy="24" r="7" fill="#fde047" />
          <circle cx="44" cy="21" r="1.8" fill="#0f172a" />
          <circle cx="49" cy="25" r="1.8" fill="#0f172a" />
        </g>
      )}

      {/* 16. Green Iguana */}
      {key === 'green iguana' && (
        <g>
          {/* Spiky dorsal crest & dewlap */}
          <path d="M14 40 L20 32 L24 38 L28 30 L32 36 L36 28 L40 34" stroke="#4ade80" strokeWidth="2.5" fill="none" />
          <ellipse cx="30" cy="40" rx="15" ry="8" fill="#16a34a" />
          <circle cx="45" cy="34" r="7.5" fill="#22c55e" />
          {/* Subtympanic scale & dewlap */}
          <path d="M42 40 Q46 50 51 40" fill="#86efac" />
          <circle cx="47" cy="32" r="1.8" fill="#fef08a" />
        </g>
      )}

      {/* 17. Panther Chameleon */}
      {key === 'panther chameleon' && (
        <g>
          {/* Spiraled prehensile tail */}
          <path
            d="M24 44 C12 44, 12 32, 20 32 C24 32, 24 38, 19 38"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Colorful arched body */}
          <path d="M22 42 C22 24, 38 24, 44 36 Z" fill="#10b981" />
          <path d="M28 29 L28 41 M34 28 L34 41" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
          {/* Turret eye */}
          <circle cx="43" cy="33" r="5" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
          <circle cx="44" cy="33" r="1.8" fill="#0f172a" />
        </g>
      )}

      {/* 18. Central Bearded Dragon */}
      {key === 'central bearded dragon' && (
        <g>
          <ellipse cx="32" cy="40" rx="16" ry="9" fill="#d97706" />
          {/* Spiky golden beard */}
          <polygon
            points="22,32 18,38 24,39 22,45 29,43 32,48 35,43 42,45 40,39 46,38 42,32"
            fill="#f59e0b"
            stroke="#78350f"
            strokeWidth="1.5"
          />
          <polygon points="32,16 44,30 20,30" fill="#fbbf24" />
          <circle cx="27" cy="26" r="2" fill="#0f172a" />
          <circle cx="37" cy="26" r="2" fill="#0f172a" />
        </g>
      )}
    </svg>
  );
};

/**
 * Draws a simplified animal badge onto an HTML5 Canvas for the Shareable Score Card.
 */
export function drawAnimalBadgeOnCanvas(
  ctx: CanvasRenderingContext2D,
  species: string,
  animalType: 'bird' | 'reptile',
  cx: number,
  cy: number,
  radius: number
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = animalType === 'bird' ? 'rgba(14, 165, 233, 0.22)' : 'rgba(16, 185, 129, 0.22)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = animalType === 'bird' ? '#38bdf8' : '#34d399';
  ctx.stroke();

  // Stylized animal silhouette inside medallion
  ctx.fillStyle = animalType === 'bird' ? '#bae6fd' : '#a7f3d0';
  ctx.font = `800 ${Math.floor(radius * 0.85)}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initials = species
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  ctx.fillText(initials, cx, cy - 2);
  ctx.restore();
}
