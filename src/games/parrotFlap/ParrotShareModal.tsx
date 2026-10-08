import React, { useEffect, useRef, useState } from 'react';
import { ParrotFlapMode, ParrotMedal, ParrotSkinId, getTodayDateString } from './engine';
import { PARROT_SKINS } from './storage';
import { drawBirdOnCanvas } from './ParrotSkins';
import { Share2, Download, Copy, Check, X } from 'lucide-react';

interface ParrotShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ParrotFlapMode;
  score: number;
  personalBest: number;
  feathersCollected: number;
  medal: ParrotMedal;
  skinId: ParrotSkinId;
  dailyDate?: string;
}

export const MEDAL_META: Record<
  ParrotMedal,
  { name: string; emoji: string; color: string }
> = {
  none: { name: 'Canyon Flyer', emoji: '🦜', color: '#94a3b8' },
  bronze: { name: 'Bronze Medal', emoji: '🥉', color: '#d97706' },
  silver: { name: 'Silver Medal', emoji: '🥈', color: '#cbd5e1' },
  gold: { name: 'Gold Medal', emoji: '🥇', color: '#facc15' },
  platinum: { name: 'Platinum Medal', emoji: '💎', color: '#38bdf8' },
};

export const ParrotShareModal: React.FC<ParrotShareModalProps> = ({
  isOpen,
  onClose,
  mode,
  score,
  personalBest,
  feathersCollected,
  medal,
  skinId,
  dailyDate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cardFormat, setCardFormat] = useState<'square' | 'story'>('square');
  const [copiedText, setCopiedText] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);

  const skinDef = PARROT_SKINS.find((s) => s.id === skinId) || PARROT_SKINS[0];
  const dateLabel = dailyDate || getTodayDateString();
  const medalInfo = MEDAL_META[medal];

  const modeLabel =
    mode === 'daily'
      ? `Daily Challenge ${dateLabel}`
      : mode === 'chill'
      ? 'Chill Mode'
      : 'Classic Mode';

  const shareTextSummary = `Parrot Flap 🦜 ${
    mode === 'daily' ? `Daily ${dateLabel}` : mode === 'chill' ? 'Chill' : 'Classic'
  }: ${score} ${medalInfo.emoji} Beat that! reptilebirds.com`;

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 1080;
    const height = cardFormat === 'square' ? 1080 : 1920;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Warm Sandstone Canyon Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#451a03');
    grad.addColorStop(0.5, '#7c2d12');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Sandstone Mesa Silhouette
    ctx.fillStyle = 'rgba(180, 83, 9, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.72);
    ctx.lineTo(180, height * 0.58);
    ctx.lineTo(420, height * 0.58);
    ctx.lineTo(540, height * 0.72);
    ctx.lineTo(740, height * 0.6);
    ctx.lineTo(960, height * 0.6);
    ctx.lineTo(width, height * 0.72);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Card Frame Border
    const pad = 64;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

    const isStory = cardFormat === 'story';
    const topY = isStory ? 220 : 140;

    // Header
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 30px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('REPTILEBIRDS CANYON FLIGHT', width / 2, topY);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 76px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Parrot Flap', width / 2, topY + 84);

    // Mode & Date Pill
    ctx.fillStyle = '#fed7aa';
    ctx.font = '700 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${modeLabel} · ${dateLabel}`, width / 2, topY + 142);

    // Bird Skin Illustration Medallion
    const medallionY = isStory ? topY + 340 : topY + 255;
    ctx.beginPath();
    ctx.arc(width / 2, medallionY, isStory ? 115 : 88, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = medalInfo.color;
    ctx.stroke();

    drawBirdOnCanvas(
      ctx,
      skinId,
      width / 2 - 6,
      medallionY,
      isStory ? 54 : 42,
      -0.12,
      0.8
    );

    ctx.fillStyle = '#fde68a';
    ctx.font = '700 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `${skinDef.species} (${skinDef.scientificName})`,
      width / 2,
      medallionY + (isStory ? 160 : 128)
    );

    // Big Score Box
    const scoreY = isStory ? medallionY + 310 : medallionY + 245;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 116px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${score}`, width / 2, scoreY);

    ctx.fillStyle = medalInfo.color;
    ctx.font = '800 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `${medalInfo.emoji} ${medalInfo.name.toUpperCase()}`,
      width / 2,
      scoreY + 54
    );

    // Stats Grid (Personal Best & Feathers Collected)
    const gridY = isStory ? scoreY + 150 : scoreY + 100;
    const boxW = 410;
    const boxH = isStory ? 150 : 124;

    const stats = [
      {
        label: 'PERSONAL BEST',
        val: `${Math.max(score, personalBest)} pts`,
        x: width / 2 - boxW - 20,
        y: gridY,
      },
      {
        label: 'FEATHERS COLLECTED',
        val: `${feathersCollected} 🪶`,
        x: width / 2 + 20,
        y: gridY,
      },
    ];

    for (const st of stats) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(st.x, st.y, boxW, boxH, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(st.label, st.x + boxW / 2, st.y + 46);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(st.val, st.x + boxW / 2, st.y + 98);
    }

    // Footer Call-to-action
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Play at reptilebirds.com', width / 2, height - pad - 42);
  }, [
    isOpen,
    cardFormat,
    modeLabel,
    dateLabel,
    skinId,
    skinDef,
    score,
    personalBest,
    feathersCollected,
    medalInfo,
  ]);

  if (!isOpen) return null;

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `parrot-flap-${dateLabel}-${cardFormat}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleWebShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setShareNote(null);

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (blob && navigator.share) {
        const file = new File([blob], `parrot-flap-${dateLabel}.png`, {
          type: 'image/png',
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Parrot Flap Score Card',
            text: shareTextSummary,
            files: [file],
          });
          return;
        }
        await navigator.share({
          title: 'Parrot Flap Score Card',
          text: shareTextSummary,
        });
        return;
      }
      handleDownloadPng();
      setShareNote('Image downloaded! Share it anywhere.');
    } catch {
      setShareNote('Share cancelled or unavailable—use Download PNG or Copy Text.');
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareTextSummary);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2200);
    } catch {
      setShareNote('Could not access clipboard.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-[clamp(0.75rem,2.5vw,1.5rem)] overflow-y-auto">
      <div className="w-[min(92vw,28rem)] max-h-[90dvh] overflow-y-auto bg-slate-900 border border-amber-500/35 rounded-3xl p-[clamp(1rem,2.5vw,1.5rem)] shadow-2xl flex flex-col items-center my-auto">
        <div className="w-full flex items-center justify-between mb-3">
          <h3 className="text-[clamp(1rem,1.8vw,1.2rem)] font-extrabold text-white">
            Share Score Card
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Size Toggle: 1080x1080 Square vs 1080x1920 Story */}
        <div className="flex items-center gap-2 mb-3 w-full">
          <button
            onClick={() => setCardFormat('square')}
            className={`flex-1 py-2 rounded-xl text-[clamp(0.7rem,1.1vw,0.8rem)] font-bold border cursor-pointer ${
              cardFormat === 'square'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            1080×1080 Square
          </button>
          <button
            onClick={() => setCardFormat('story')}
            className={`flex-1 py-2 rounded-xl text-[clamp(0.7rem,1.1vw,0.8rem)] font-bold border cursor-pointer ${
              cardFormat === 'story'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            1080×1920 Story
          </button>
        </div>

        {/* Canvas Preview (scaled with dvh/vw, no fixed px) */}
        <div className="w-full max-h-[46dvh] flex items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-2 mb-3">
          <canvas
            ref={canvasRef}
            className="max-h-[42dvh] max-w-full w-auto object-contain rounded-xl shadow-lg"
          />
        </div>

        {shareNote && (
          <p className="text-[clamp(0.7rem,1vw,0.8rem)] text-amber-300 mb-3 text-center">
            {shareNote}
          </p>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
          <button
            onClick={handleWebShare}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[clamp(0.72rem,1.1vw,0.8rem)] cursor-pointer"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Share</span>
          </button>

          <button
            onClick={handleDownloadPng}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-[clamp(0.72rem,1.1vw,0.8rem)] cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-[clamp(0.72rem,1.1vw,0.8rem)] cursor-pointer"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Copy Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
