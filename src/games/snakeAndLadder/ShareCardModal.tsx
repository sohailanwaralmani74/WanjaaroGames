import React, { useEffect, useRef, useState } from 'react';
import { BirdTokenId, GameMode } from './engine';
import { BIRD_TOKENS, drawBirdTokenOnCanvas } from './BirdTokens';
import { Share2, Download, Copy, Check, X, Sparkles } from 'lucide-react';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerName: string;
  winnerToken: BirdTokenId;
  turnsTaken: number;
  mode: GameMode;
  laddersClimbed: number;
  snakeBites: number;
  personalBestTurns: number | null;
  dateStr: string;
}

type CardAspect = 'square' | 'story';

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  winnerName,
  winnerToken,
  turnsTaken,
  mode,
  laddersClimbed,
  snakeBites,
  personalBestTurns,
  dateStr,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [aspect, setAspect] = useState<CardAspect>('square');
  const [copiedText, setCopiedText] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const modeLabel =
    mode === 'daily'
      ? `Daily Board ${dateStr}`
      : mode === 'solo'
      ? 'Solo Race'
      : mode === 'cpu'
      ? 'Vs Computer'
      : 'Local Multiplayer';

  const shareTextSummary =
    mode === 'daily'
      ? `Snake and Ladder 🐍🪜 Daily ${dateStr}: won in ${turnsTaken} turns. Beat that! reptilebirds.com`
      : `Snake and Ladder 🐍🪜 (${modeLabel}): won in ${turnsTaken} turns! Play free at reptilebirds.com`;

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

    // 1. Rich Jungle Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#064e3b'); // deep emerald jungle
    bgGrad.addColorStop(0.5, '#022c22'); // dark canopy
    bgGrad.addColorStop(1, '#0f172a'); // slate night
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative jungle foliage circles & vine curves
    ctx.save();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.14)';
    ctx.lineWidth = 14;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(width * (0.15 + i * 0.2), height * 0.12, 160 + i * 25, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Inner framed card border
    const pad = 56;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

    const isStory = aspect === 'story';
    const topY = isStory ? 180 : 120;

    // Kicker: REPTILEBIRDS.COM
    ctx.fillStyle = '#34d399';
    ctx.font = '700 28px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('REPTILEBIRDS.COM · OFFICIAL SCORECARD', width / 2, topY);

    // Main Game Title: Snake and Ladder
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 76px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('Snake and Ladder', width / 2, topY + 85);

    // Mode & Date Subtitle
    ctx.fillStyle = '#a7f3d0';
    ctx.font = '600 34px "Plus Jakarta Sans", system-ui, sans-serif';
    const subLine =
      mode === 'daily' ? `Daily Board ${dateStr}` : `${modeLabel} · ${dateStr}`;
    ctx.fillText(subLine, width / 2, topY + 145);

    // Player Bird Token Medallion
    const tokenCenterY = isStory ? topY + 340 : topY + 260;
    const tokenRadius = isStory ? 110 : 82;
    drawBirdTokenOnCanvas(ctx, winnerToken, width / 2, tokenCenterY, tokenRadius);

    // Winner Name & Bird Species
    const tokenMeta = BIRD_TOKENS[winnerToken];
    const afterTokenY = tokenCenterY + tokenRadius + (isStory ? 75 : 58);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 42px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(`${winnerName} (${tokenMeta.speciesLabel})`, width / 2, afterTokenY);

    // Primary Result Banner ("Won in X turns")
    const bannerY = afterTokenY + (isStory ? 60 : 38);
    const bannerH = isStory ? 170 : 140;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(120, bannerY, width - 240, bannerH, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ecfdf5';
    ctx.font = '800 68px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(
      `Won in ${turnsTaken} ${turnsTaken === 1 ? 'turn' : 'turns'}!`,
      width / 2,
      bannerY + bannerH * 0.64
    );

    // Stats Grid (2x2)
    const gridTop = bannerY + bannerH + (isStory ? 70 : 40);
    const boxW = (width - 280) / 2;
    const boxH = isStory ? 170 : 125;
    const gap = 40;

    const stats = [
      { label: 'Vines Climbed', value: String(laddersClimbed), color: '#34d399' },
      { label: 'Snake Bites', value: String(snakeBites), color: '#fbbf24' },
      {
        label: 'Personal Best',
        value: personalBestTurns ? `${personalBestTurns} turns` : `${turnsTaken} turns`,
        color: '#38bdf8',
      },
      { label: 'Board Mode', value: mode === 'daily' ? 'Daily Seed' : modeLabel, color: '#e2e8f0' },
    ];

    stats.forEach((st, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = 120 + col * (boxW + gap);
      const by = gridTop + row * (boxH + (isStory ? 36 : 24));

      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 26px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(st.label, bx + boxW / 2, by + (isStory ? 58 : 46));

      ctx.fillStyle = st.color;
      ctx.font = '800 44px "JetBrains Mono", monospace';
      ctx.fillText(st.value, bx + boxW / 2, by + (isStory ? 122 : 98));
    });

    // Footer Call to Action
    const footerY = height - (isStory ? 130 : 92);
    ctx.fillStyle = '#facc15';
    ctx.font = '800 40px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText('Play at reptilebirds.com', width / 2, footerY);
  }, [
    isOpen,
    aspect,
    winnerName,
    winnerToken,
    turnsTaken,
    mode,
    modeLabel,
    laddersClimbed,
    snakeBites,
    personalBestTurns,
    dateStr,
  ]);

  if (!isOpen) return null;

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `snake-and-ladder-${dateStr}-${aspect}.png`;
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
        const file = new File([blob], `snake-and-ladder-${dateStr}.png`, {
          type: 'image/png',
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Snake and Ladder – ReptileBirds',
            text: shareTextSummary,
            files: [file],
          });
          setShareStatus('Shared score card!');
          return;
        }
        await navigator.share({
          title: 'Snake and Ladder – ReptileBirds',
          text: shareTextSummary,
          url: 'https://reptilebirds.com/snake-and-ladder',
        });
        setShareStatus('Shared result!');
        return;
      }
    } catch {
      // User cancelled or Web Share failed; fall back to download + copy
    }

    handleDownloadPng();
    handleCopyText();
    setShareStatus('Web Share unavailable on this browser — downloaded PNG & copied text!');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareTextSummary);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      setShareStatus('Copy manually: ' + shareTextSummary);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-card-modal-title"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 id="share-card-modal-title" className="text-lg font-bold text-white">
              Shareable Score Card
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close share modal"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Size Toggle: 1080x1080 Square vs 1080x1920 Story */}
        <div className="flex items-center justify-between gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setAspect('square')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
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
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
              aspect === 'story'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Story Size (1080×1920)
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="flex justify-center bg-slate-950/90 border border-slate-800 rounded-xl p-3">
          <canvas
            ref={canvasRef}
            className={`rounded-lg shadow-lg border border-emerald-500/30 ${
              aspect === 'square' ? 'w-64 h-64 sm:w-72 sm:h-72' : 'w-48 h-80 sm:w-52 sm:h-96'
            } object-contain`}
          />
        </div>

        {/* Shareable Text Preview */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono break-words">
          {shareTextSummary}
        </div>

        {shareStatus && (
          <p className="text-xs text-emerald-400 text-center font-medium" role="status">
            {shareStatus}
          </p>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleWebShare}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Image</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
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
