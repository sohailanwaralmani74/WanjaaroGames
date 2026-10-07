import React, { useEffect, useRef, useState } from 'react';
import { BoardSizeOption, SnakeGameMode, SnakeSkinId } from './engine';
import { SNAKE_SKINS, drawSnakeSkinOnCanvas } from './SnakeSkins';
import { Share2, Download, Copy, Check, X, Sparkles } from 'lucide-react';

interface SnakeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  length: number;
  level: number;
  mode: SnakeGameMode;
  boardSize: BoardSizeOption;
  skinId: SnakeSkinId;
  personalBest: number;
  dateStr: string;
}

export const SnakeShareModal: React.FC<SnakeShareModalProps> = ({
  isOpen,
  onClose,
  score,
  length,
  level,
  mode,
  boardSize,
  skinId,
  personalBest,
  dateStr,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [aspect, setAspect] = useState<'square' | 'story'>('square');
  const [copiedText, setCopiedText] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const modeTitle =
    mode === 'daily'
      ? `Daily Challenge ${dateStr}`
      : mode === 'classic'
      ? 'Classic'
      : mode === 'wrap'
      ? 'Wrap-Around'
      : 'Jungle';

  const shareText =
    mode === 'daily'
      ? `Snake Game 🐍 Daily Challenge ${dateStr}: score ${score}, length ${length}. Beat that! reptilebirds.com`
      : `Snake Game 🐍 ${modeTitle}: score ${score}, length ${length}. Beat that! reptilebirds.com`;

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

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#022c22');
    bgGrad.addColorStop(0.5, '#064e3b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.08)';
    ctx.lineWidth = 2;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Outer frame
    const pad = 54;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

    const isStory = aspect === 'story';
    const topY = isStory ? 180 : 115;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#34d399';
    ctx.font = '700 28px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('REPTILEBIRDS · OFFICIAL SCORECARD', width / 2, topY);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 80px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('Snake Game', width / 2, topY + 86);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '600 34px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(
      mode === 'daily'
        ? `Daily Challenge ${dateStr}`
        : `${modeTitle} Mode (${boardSize}×${boardSize}) · ${dateStr}`,
      width / 2,
      topY + 145
    );

    // Draw chosen Snake Skin SVG on canvas
    const skinMeta = SNAKE_SKINS[skinId];
    const tokenY = isStory ? topY + 340 : topY + 255;
    const tokenR = isStory ? 110 : 80;
    drawSnakeSkinOnCanvas(ctx, skinId, width / 2, tokenY, tokenR);

    const afterSkinY = tokenY + tokenR + (isStory ? 70 : 54);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 38px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(`${skinMeta.speciesName} (${skinMeta.scientificName})`, width / 2, afterSkinY);

    // Score Banner
    const bannerY = afterSkinY + (isStory ? 55 : 34);
    const bannerH = isStory ? 165 : 135;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(120, bannerY, width - 240, bannerH, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ecfdf5';
    ctx.font = '800 66px "JetBrains Mono", monospace';
    ctx.fillText(`SCORE: ${score}`, width / 2, bannerY + bannerH * 0.65);

    // 4 Stats Grid
    const gridTop = bannerY + bannerH + (isStory ? 70 : 38);
    const boxW = (width - 280) / 2;
    const boxH = isStory ? 170 : 122;
    const gap = 40;

    const stats = [
      { label: 'Snake Length', value: `${length} cells`, color: '#34d399' },
      { label: 'Level Reached', value: `Level ${level}`, color: '#fbbf24' },
      { label: 'Personal Best', value: `${Math.max(personalBest, score)}`, color: '#38bdf8' },
      { label: 'Mode', value: mode === 'daily' ? 'Daily Seed' : modeTitle, color: '#e2e8f0' },
    ];

    stats.forEach((st, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = 120 + col * (boxW + gap);
      const by = gridTop + row * (boxH + (isStory ? 36 : 22));

      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 26px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(st.label, bx + boxW / 2, by + (isStory ? 58 : 45));

      ctx.fillStyle = st.color;
      ctx.font = '800 42px "JetBrains Mono", monospace';
      ctx.fillText(st.value, bx + boxW / 2, by + (isStory ? 120 : 96));
    });

    const footerY = height - (isStory ? 130 : 88);
    ctx.fillStyle = '#facc15';
    ctx.font = '800 40px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('Play at reptilebirds.com', width / 2, footerY);
  }, [
    isOpen,
    aspect,
    score,
    length,
    level,
    mode,
    modeTitle,
    boardSize,
    skinId,
    personalBest,
    dateStr,
  ]);

  if (!isOpen) return null;

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `snake-game-${dateStr}-${aspect}.png`;
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
        const file = new File([blob], `snake-game-${dateStr}.png`, {
          type: 'image/png',
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Snake Game – ReptileBirds',
            text: shareText,
            files: [file],
          });
          setShareStatus('Shared score card!');
          return;
        }
        await navigator.share({
          title: 'Snake Game – ReptileBirds',
          text: shareText,
          url: 'https://reptilebirds.com/snake-game',
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
      await navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      setShareStatus('Copy manually: ' + shareText);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="snake-share-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 id="snake-share-title" className="text-lg font-bold text-white">
              Share Snake Game Result
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
          {shareText}
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
