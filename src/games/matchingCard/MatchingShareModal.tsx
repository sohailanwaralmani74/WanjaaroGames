import React, { useEffect, useRef, useState } from 'react';
import {
  DIFFICULTY_CONFIGS,
  MatchingDifficulty,
  MatchingGameMode,
  SpeciesFactEntry,
} from './engine';
import { drawAnimalBadgeOnCanvas } from './SpeciesArt';
import { Share2, Download, Copy, Check, X, Sparkles } from 'lucide-react';

interface MatchingShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  difficulty: MatchingDifficulty;
  mode: MatchingGameMode;
  score: number;
  moves: number;
  elapsedSec: number;
  stars: 1 | 2 | 3;
  personalBestScore: number;
  dateStr: string;
  matchedSpecies: SpeciesFactEntry[];
}

export function formatDurationMmSs(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export const MatchingShareModal: React.FC<MatchingShareModalProps> = ({
  isOpen,
  onClose,
  difficulty,
  mode,
  score,
  moves,
  elapsedSec,
  stars,
  personalBestScore,
  dateStr,
  matchedSpecies,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [aspect, setAspect] = useState<'square' | 'story'>('square');
  const [copiedText, setCopiedText] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const diffCfg = DIFFICULTY_CONFIGS[difficulty];
  const starStr = '⭐'.repeat(stars);
  const timeFormatted = formatDurationMmSs(elapsedSec);
  const modeLabel =
    mode === 'daily'
      ? `Daily Challenge ${dateStr}`
      : mode === 'classic'
      ? 'Classic'
      : mode === 'timed'
      ? 'Timed'
      : 'Two Players';

  const diffCapitalized =
    difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  // Spoiler-free text result (never reveals where cards were)
  const shareTextResult =
    mode === 'daily'
      ? `Matching Card Game 🃏🦜🐍 Daily ${dateStr}: ${diffCfg.pairs} pairs in ${moves} moves, ${timeFormatted} ${starStr} Beat that! reptilebirds.com`
      : `Matching Card Game 🃏🦜🐍 ${diffCapitalized}: ${diffCfg.pairs} pairs in ${moves} moves, ${timeFormatted} ${starStr} Beat that! reptilebirds.com`;

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = aspect === 'square' ? 1080 : 1920;
    canvas.width = width;
    canvas.height = height;

    // Jungle-green gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#022c22');
    bgGrad.addColorStop(0.5, '#064e3b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer frame
    const pad = 54;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

    const isStory = aspect === 'story';
    const topY = isStory ? 180 : 115;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#34d399';
    ctx.font = '700 28px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('REPTILEBIRDS · OFFICIAL SCORECARD', width / 2, topY);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 72px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('Matching Card Game', width / 2, topY + 84);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '600 34px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(
      mode === 'daily'
        ? `Daily Challenge ${dateStr} · ${diffCfg.label}`
        : `${modeLabel} · ${diffCfg.label} · ${dateStr}`,
      width / 2,
      topY + 142
    );

    // Star Rating Row
    const starY = isStory ? topY + 250 : topY + 215;
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 64px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(starStr, width / 2, starY);

    // Score Banner
    const bannerY = starY + (isStory ? 60 : 36);
    const bannerH = isStory ? 165 : 135;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(120, bannerY, width - 240, bannerH, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ecfdf5';
    ctx.font = '800 64px "JetBrains Mono", monospace';
    ctx.fillText(`SCORE: ${score}`, width / 2, bannerY + bannerH * 0.65);

    // Stats Grid (2x2)
    const gridTop = bannerY + bannerH + (isStory ? 65 : 36);
    const boxW = (width - 280) / 2;
    const boxH = isStory ? 165 : 122;
    const gap = 40;

    const stats = [
      { label: 'Total Moves', value: `${moves} moves`, color: '#34d399' },
      { label: 'Time Elapsed', value: timeFormatted, color: '#fbbf24' },
      {
        label: 'Personal Best',
        value: `${Math.max(personalBestScore, score)} pts`,
        color: '#38bdf8',
      },
      { label: 'Pairs Matched', value: `${diffCfg.pairs} pairs`, color: '#e2e8f0' },
    ];

    stats.forEach((st, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = 120 + col * (boxW + gap);
      const by = gridTop + row * (boxH + (isStory ? 34 : 22));

      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 25px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(st.label, bx + boxW / 2, by + (isStory ? 55 : 44));

      ctx.fillStyle = st.color;
      ctx.font = '800 40px "JetBrains Mono", monospace';
      ctx.fillText(st.value, bx + boxW / 2, by + (isStory ? 118 : 94));
    });

    // Row of matched animal icons
    const iconsY = gridTop + boxH * 2 + (isStory ? 150 : 95);
    const previewAnimals = matchedSpecies.slice(0, 8);
    const iconRadius = 32;
    const iconSpacing = 88;
    const startX =
      width / 2 - ((previewAnimals.length - 1) * iconSpacing) / 2;

    previewAnimals.forEach((sp, i) => {
      drawAnimalBadgeOnCanvas(
        ctx,
        sp.species,
        sp.type,
        startX + i * iconSpacing,
        iconsY,
        iconRadius
      );
    });

    const footerY = height - (isStory ? 120 : 82);
    ctx.fillStyle = '#facc15';
    ctx.font = '800 40px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('Play at reptilebirds.com', width / 2, footerY);
  }, [
    isOpen,
    aspect,
    difficulty,
    diffCfg,
    mode,
    modeLabel,
    score,
    moves,
    elapsedSec,
    timeFormatted,
    stars,
    starStr,
    personalBestScore,
    dateStr,
    matchedSpecies,
  ]);

  if (!isOpen) return null;

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `matching-card-game-${dateStr}-${aspect}.png`;
    link.href = dataUrl;
    link.click();
    setShareStatus('Score card PNG downloaded!');
  };

  const handleWebShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setShareStatus(null);

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (blob && navigator.share) {
        const file = new File([blob], `matching-card-game-${dateStr}.png`, {
          type: 'image/png',
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Matching Card Game – ReptileBirds',
            text: shareTextResult,
            files: [file],
          });
          setShareStatus('Shared score card!');
          return;
        }
        await navigator.share({
          title: 'Matching Card Game – ReptileBirds',
          text: shareTextResult,
          url: 'https://reptilebirds.com/matching-card-game',
        });
        setShareStatus('Shared result!');
        return;
      }
    } catch {
      // Fallback below
    }

    handleDownloadPng();
    handleCopyText();
    setShareStatus('Web Share unavailable on this browser — downloaded PNG & copied text!');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareTextResult);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      setShareStatus('Copy manually: ' + shareTextResult);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="matching-share-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 id="matching-share-title" className="text-lg font-bold text-white">
              Share Matching Card Result
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share modal"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setAspect('square')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              aspect === 'square'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Square (1080×1080)
          </button>
          <button
            type="button"
            onClick={() => setAspect('story')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              aspect === 'story'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Story Size (1080×1920)
          </button>
        </div>

        <div className="flex justify-center bg-slate-950/90 border border-slate-800 rounded-xl p-3">
          <canvas
            ref={canvasRef}
            className={`rounded-lg shadow-lg border border-emerald-500/30 ${
              aspect === 'square' ? 'w-60 h-60 sm:w-68 sm:h-68' : 'w-44 h-76 sm:w-48 sm:h-84'
            } object-contain`}
          />
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 font-mono break-words">
          {shareTextResult}
        </div>

        {shareStatus && (
          <p className="text-xs text-emerald-400 text-center font-medium" role="status">
            {shareStatus}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleWebShare}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-xs cursor-pointer"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copy Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
