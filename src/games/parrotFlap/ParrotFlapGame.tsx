import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CANYON_HEIGHT,
  CANYON_WIDTH,
  FLAP_VELOCITY_PX_S,
  FloatingScoreText,
  GRAVITY_PX_S2,
  GROUND_HEIGHT,
  MAX_FALL_SPEED_PX_S,
  PARROT_HITBOX_RADIUS,
  PARROT_START_Y,
  PARROT_X,
  PILLAR_WIDTH,
  PLAYABLE_HEIGHT,
  ParrotFlapMode,
  ParrotMedal,
  ParrotSkinId,
  SPAWN_INTERVAL_SEC,
  SandstonePillarPair,
  checkPillarCollision,
  computeScrollSpeed,
  createSeededRng,
  cryptoRandom,
  generateNextPillarPair,
  getMedalForScore,
  getTodayDateString,
  runParrotFlapSelfTest,
} from './engine';
import {
  PARROT_SKINS,
  ParrotFlapRecords,
  ParrotFlapSettings,
  ParrotSkinDefinition,
  getVerifiedBirdFact,
  loadParrotFlapRecords,
  loadParrotFlapSettings,
  recordParrotFlapRun,
  resetParrotFlapRecords,
  saveParrotFlapRecords,
  saveParrotFlapSettings,
} from './storage';
import { parrotFlapAudio } from './audio';
import { ParrotSkinSvg, drawBirdOnCanvas } from './ParrotSkins';
import { MEDAL_META, ParrotShareModal } from './ParrotShareModal';
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Settings,
  HelpCircle,
  Volume2,
  VolumeX,
  Share2,
  Sparkles,
  Feather,
  Calendar,
  Flame,
  Wind,
  CheckCircle2,
  Trash2,
  X,
  Lock,
  Award,
  Compass,
} from 'lucide-react';

type ScreenState = 'game' | 'skins' | 'records';
type FlightPhase = 'ready' | 'flying' | 'gameover';

function lerpNumber(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function lerpHexColor(hexA: string, hexB: string, t: number): string {
  const cleanA = hexA.replace('#', '');
  const cleanB = hexB.replace('#', '');
  const rA = parseInt(cleanA.substring(0, 2), 16);
  const gA = parseInt(cleanA.substring(2, 4), 16);
  const bA = parseInt(cleanA.substring(4, 6), 16);

  const rB = parseInt(cleanB.substring(0, 2), 16);
  const gB = parseInt(cleanB.substring(2, 4), 16);
  const bB = parseInt(cleanB.substring(4, 6), 16);

  const r = Math.round(lerpNumber(rA, rB, t));
  const g = Math.round(lerpNumber(gA, gB, t));
  const b = Math.round(lerpNumber(bA, bB, t));
  return `rgb(${r}, ${g}, ${b})`;
}

export const ParrotFlapGame: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('game');
  const [flightPhase, setFlightPhase] = useState<FlightPhase>('ready');
  const [mode, setMode] = useState<ParrotFlapMode>('classic');

  const [records, setRecords] = useState<ParrotFlapRecords>(() =>
    loadParrotFlapRecords()
  );
  const [settings, setSettings] = useState<ParrotFlapSettings>(() =>
    loadParrotFlapSettings()
  );

  // Active Run HUD State
  const [score, setScore] = useState(0);
  const [feathersRun, setFeathersRun] = useState(0);
  const [pillarsRun, setPillarsRun] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // End-of-Run Summary State
  const [isNewBest, setIsNewBest] = useState(false);
  const [dailyPracticeNote, setDailyPracticeNote] = useState(false);
  const [newlyUnlockedSkins, setNewlyUnlockedSkins] = useState<
    ParrotSkinDefinition[]
  >([]);

  // Modals & Self-Test
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [selfTestResult, setSelfTestResult] = useState<{
    passed: boolean;
    testedPillars: number;
    failures: string[];
  } | null>(null);

  // Screen-reader live announcement
  const [srAnnouncement, setSrAnnouncement] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const todayDateStr = getTodayDateString();

  // Simulation mutable state ref for 60Hz fixed timestep
  const simRef = useRef<{
    phase: FlightPhase;
    paused: boolean;
    mode: ParrotFlapMode;
    dailyDate: string;
    rng: () => number;
    parrotY: number;
    parrotVy: number;
    flapAnimTimer: number;
    bobTime: number;
    pillars: SandstonePillarPair[];
    nextPillarId: number;
    prevGapCenterY: number;
    spawnTimerSec: number;
    score: number;
    feathersCollected: number;
    pillarsPassed: number;
    parallaxOffset: number;
    dayNightMix: number; // 0 = Canyon Day, 1 = Canyon Starry Night
    shakeTimerSec: number;
    floatingTexts: FloatingScoreText[];
    viewWidth: number;
  }>({
    phase: 'ready',
    paused: false,
    mode: 'classic',
    dailyDate: todayDateStr,
    rng: cryptoRandom,
    parrotY: PARROT_START_Y,
    parrotVy: 0,
    flapAnimTimer: 0,
    bobTime: 0,
    pillars: [],
    nextPillarId: 1,
    prevGapCenterY: PARROT_START_Y,
    spawnTimerSec: 0.4,
    score: 0,
    feathersCollected: 0,
    pillarsPassed: 0,
    parallaxOffset: 0,
    dayNightMix: 0,
    shakeTimerSec: 0,
    floatingTexts: [],
    viewWidth: CANYON_WIDTH,
  });

  // Sync audio mute state
  useEffect(() => {
    parrotFlapAudio.setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  const updateSetting = <K extends keyof ParrotFlapSettings>(
    key: K,
    val: ParrotFlapSettings[K]
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: val };
      saveParrotFlapSettings(next);
      return next;
    });
  };

  const selectSkin = (skinId: ParrotSkinId) => {
    const def = PARROT_SKINS.find((s) => s.id === skinId);
    if (!def || records.totalFeathers < def.unlockFeathers) return;
    const updated: ParrotFlapRecords = {
      ...records,
      selectedSkin: skinId,
    };
    setRecords(updated);
    saveParrotFlapRecords(updated);
  };

  const resetToReadyState = useCallback(
    (chosenMode: ParrotFlapMode = mode) => {
      const dateStr = getTodayDateString();
      const rng =
        chosenMode === 'daily'
          ? createSeededRng(`parrot-flap-daily-${dateStr}`)
          : cryptoRandom;

      simRef.current = {
        phase: 'ready',
        paused: false,
        mode: chosenMode,
        dailyDate: dateStr,
        rng,
        parrotY: PARROT_START_Y,
        parrotVy: 0,
        flapAnimTimer: 0,
        bobTime: 0,
        pillars: [],
        nextPillarId: 1,
        prevGapCenterY: PARROT_START_Y,
        spawnTimerSec: 0.35,
        score: 0,
        feathersCollected: 0,
        pillarsPassed: 0,
        parallaxOffset: 0,
        dayNightMix: 0,
        shakeTimerSec: 0,
        floatingTexts: [],
        viewWidth: simRef.current.viewWidth || CANYON_WIDTH,
      };

      setMode(chosenMode);
      setFlightPhase('ready');
      setScore(0);
      setFeathersRun(0);
      setPillarsRun(0);
      setIsPaused(false);
      setIsNewBest(false);
      setDailyPracticeNote(false);
      setNewlyUnlockedSkins([]);
      setScreen('game');
    },
    [mode]
  );

  const handleGameOver = useCallback(() => {
    const sim = simRef.current;
    if (sim.phase === 'gameover') return;
    sim.phase = 'gameover';
    sim.shakeTimerSec = settings.reducedMotion ? 0 : 0.3;

    parrotFlapAudio.playHit();
    const earnedMedal = getMedalForScore(sim.score);
    if (earnedMedal !== 'none') {
      setTimeout(() => parrotFlapAudio.playMedal(), 260);
    }

    const res = recordParrotFlapRun({
      mode: sim.mode,
      score: sim.score,
      feathersCollected: sim.feathersCollected,
      pillarsPassed: sim.pillarsPassed,
      dailyDate: sim.mode === 'daily' ? sim.dailyDate : undefined,
    });

    setRecords(res.updated);
    setIsNewBest(res.isNewPersonalBest);
    setDailyPracticeNote(res.dailyAlreadyPlayedToday);
    setNewlyUnlockedSkins(res.newlyUnlockedSkins);
    setFlightPhase('gameover');
    setSrAnnouncement(
      `Game Over! Final score ${sim.score}, feathers collected ${sim.feathersCollected}.`
    );
  }, [settings.reducedMotion]);

  /**
   * Single-Input Flap Action (Tap, Click, Space, or Arrow Up).
   * If on the "Tap to start" ready screen, the first flap begins the run immediately!
   */
  const triggerFlap = useCallback(() => {
    const sim = simRef.current;
    if (screen !== 'game' || sim.paused) return;

    if (sim.phase === 'ready') {
      sim.phase = 'flying';
      sim.parrotVy = FLAP_VELOCITY_PX_S;
      sim.flapAnimTimer = 0.28;
      setFlightPhase('flying');
      parrotFlapAudio.playFlap();
      return;
    }

    if (sim.phase === 'flying') {
      sim.parrotVy = FLAP_VELOCITY_PX_S;
      sim.flapAnimTimer = 0.28;
      parrotFlapAudio.playFlap();
    }
  }, [screen]);

  // Auto-pause when tab loses focus
  useEffect(() => {
    const onBlur = () => {
      if (simRef.current.phase === 'flying' && !simRef.current.paused) {
        simRef.current.paused = true;
        setIsPaused(true);
      }
    };
    const onVisChange = () => {
      if (document.hidden) onBlur();
    };
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisChange);
    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);

  // Keyboard listener for Space, ArrowUp, P/Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'game') return;
      if (showHowToPlay || showSettingsModal || showShareModal) return;

      if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (simRef.current.phase === 'gameover') {
          resetToReadyState(mode);
        } else {
          triggerFlap();
        }
        return;
      }

      if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
        if (simRef.current.phase === 'flying') {
          e.preventDefault();
          simRef.current.paused = !simRef.current.paused;
          setIsPaused(simRef.current.paused);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    screen,
    mode,
    showHowToPlay,
    showSettingsModal,
    showShareModal,
    triggerFlap,
    resetToReadyState,
  ]);

  // Fixed-timestep 60Hz Loop & Canyon Canvas Renderer
  useEffect(() => {
    if (screen !== 'game') return;

    const FIXED_DT = 1 / 60;
    let lastTime = performance.now();
    let accumulator = 0;

    const stepPhysics = (dt: number) => {
      const sim = simRef.current;
      if (sim.paused) return;

      if (sim.shakeTimerSec > 0) {
        sim.shakeTimerSec = Math.max(0, sim.shakeTimerSec - dt);
      }

      // Smoothly transition Day/Night cycle every 25 points
      const isNightTarget = Math.floor(sim.score / 25) % 2 === 1 ? 1 : 0;
      const mixSpeed = settings.reducedMotion ? 10 : 0.85;
      if (sim.dayNightMix < isNightTarget) {
        sim.dayNightMix = Math.min(1, sim.dayNightMix + dt * mixSpeed);
      } else if (sim.dayNightMix > isNightTarget) {
        sim.dayNightMix = Math.max(0, sim.dayNightMix - dt * mixSpeed);
      }

      // Ready state: gentle bobbing animation
      if (sim.phase === 'ready') {
        sim.bobTime += dt;
        sim.parrotY = PARROT_START_Y + Math.sin(sim.bobTime * 4.2) * 9;
        if (!settings.reducedMotion) {
          sim.parallaxOffset += 60 * dt;
        }
        return;
      }

      if (sim.phase !== 'flying') return;

      // Update wing flap animation timer
      if (sim.flapAnimTimer > 0) {
        sim.flapAnimTimer = Math.max(0, sim.flapAnimTimer - dt);
      }

      // Apply gravity (1500 px/s^2) and cap fall speed (700 px/s)
      sim.parrotVy = Math.min(
        MAX_FALL_SPEED_PX_S,
        sim.parrotVy + GRAVITY_PX_S2 * dt
      );
      sim.parrotY += sim.parrotVy * dt;

      // Ceiling collision check (Chill mode has no game over from ceiling)
      if (sim.parrotY - PARROT_HITBOX_RADIUS <= 0) {
        if (sim.mode === 'chill') {
          sim.parrotY = PARROT_HITBOX_RADIUS;
          if (sim.parrotVy < 0) sim.parrotVy = 0;
        } else {
          sim.parrotY = PARROT_HITBOX_RADIUS;
          handleGameOver();
          return;
        }
      }

      // Canyon floor collision check
      if (sim.parrotY + PARROT_HITBOX_RADIUS >= PLAYABLE_HEIGHT) {
        sim.parrotY = PLAYABLE_HEIGHT - PARROT_HITBOX_RADIUS;
        handleGameOver();
        return;
      }

      // Scroll speed & parallax
      const scrollSpeed = computeScrollSpeed(sim.mode, sim.pillarsPassed);
      if (!settings.reducedMotion) {
        sim.parallaxOffset += scrollSpeed * dt;
      }

      // Spawn sandstone pillar pairs every 1.5s
      sim.spawnTimerSec -= dt;
      if (sim.spawnTimerSec <= 0) {
        sim.spawnTimerSec += SPAWN_INTERVAL_SEC;
        // Assist Mode is disabled in Daily Challenge so daily courses remain identical for all players
        const assistActive = sim.mode === 'daily' ? false : settings.assistMode;
        const newPair = generateNextPillarPair({
          id: sim.nextPillarId++,
          spawnX: (sim.viewWidth || CANYON_WIDTH) + 24,
          prevGapCenterY: sim.prevGapCenterY,
          mode: sim.mode,
          pillarsPassed: sim.pillarsPassed,
          assistMode: assistActive,
          rng: sim.rng,
        });
        sim.prevGapCenterY = newPair.gapCenterY;
        sim.pillars.push(newPair);
      }

      // Update pillars, feather collection, scoring, and collision
      const remainingPillars: SandstonePillarPair[] = [];
      for (const pillar of sim.pillars) {
        pillar.x -= scrollSpeed * dt;
        pillar.featherBobOffset += dt * 4.5;

        // Forgiving collision check
        if (
          checkPillarCollision(
            PARROT_X,
            sim.parrotY,
            PARROT_HITBOX_RADIUS,
            pillar
          )
        ) {
          handleGameOver();
          return;
        }

        // Check collectible feather in the middle of the gap (+2 points)
        if (pillar.hasFeather && !pillar.featherCollected) {
          const featherX = pillar.x + PILLAR_WIDTH / 2;
          const featherY =
            pillar.gapCenterY + Math.sin(pillar.featherBobOffset) * 8;
          const distToFeather = Math.hypot(
            PARROT_X - featherX,
            sim.parrotY - featherY
          );
          if (distToFeather <= PARROT_HITBOX_RADIUS + 14) {
            pillar.featherCollected = true;
            sim.score += 2;
            sim.feathersCollected += 1;
            setScore(sim.score);
            setFeathersRun(sim.feathersCollected);
            parrotFlapAudio.playFeather();
            sim.floatingTexts.push({
              id: `feather-${pillar.id}`,
              text: '+2 🪶',
              x: featherX,
              y: featherY - 12,
              color: '#38bdf8',
              ttl: 0.85,
            });
          }
        }

        // Check passing pillar pair (+1 point)
        if (!pillar.passed && pillar.x + PILLAR_WIDTH < PARROT_X) {
          pillar.passed = true;
          sim.score += 1;
          sim.pillarsPassed += 1;
          setScore(sim.score);
          setPillarsRun(sim.pillarsPassed);
          parrotFlapAudio.playScore();

          if (sim.score % 10 === 0) {
            setSrAnnouncement(`Score milestone: ${sim.score} points!`);
          }
        }

        if (pillar.x + PILLAR_WIDTH > -40) {
          remainingPillars.push(pillar);
        }
      }
      sim.pillars = remainingPillars;

      // Update floating score texts
      sim.floatingTexts = sim.floatingTexts
        .map((ft) => ({ ...ft, y: ft.y - 30 * dt, ttl: ft.ttl - dt }))
        .filter((ft) => ft.ttl > 0);
    };

    const renderCanyon = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const sim = simRef.current;
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      const viewW =
        cw > 0 && ch > 0
          ? Math.max(360, Math.min(1100, Math.round(CANYON_HEIGHT * (cw / ch))))
          : CANYON_WIDTH;
      sim.viewWidth = viewW;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = viewW * dpr;
      const targetH = CANYON_HEIGHT * dpr;
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      if (sim.shakeTimerSec > 0 && !settings.reducedMotion) {
        const mag = 6 * (sim.shakeTimerSec / 0.3);
        ctx.translate(
          (Math.random() - 0.5) * mag * 2,
          (Math.random() - 0.5) * mag * 2
        );
      }

      // 1. Canyon Sky Gradient with Smooth Day/Night Cycle every 25 points
      const mix = sim.dayNightMix;
      const skyTop = lerpHexColor('#38bdf8', '#090d16', mix);
      const skyMid = lerpHexColor('#fdba74', '#1e1b4b', mix);
      const skyBottom = lerpHexColor('#fed7aa', '#31102f', mix);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, PLAYABLE_HEIGHT);
      skyGrad.addColorStop(0, skyTop);
      skyGrad.addColorStop(0.58, skyMid);
      skyGrad.addColorStop(1, skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, viewW, PLAYABLE_HEIGHT);

      // Sun / Crescent Moon
      ctx.save();
      const sunY = 95 + mix * 25;
      ctx.beginPath();
      ctx.arc(Math.max(240, viewW - 90), sunY, 28, 0, Math.PI * 2);
      ctx.fillStyle = mix > 0.5 ? '#fef08a' : '#fffbeb';
      ctx.globalAlpha = 0.88;
      ctx.fill();
      ctx.restore();

      // Twinkling stars during night phase
      const tileCount = Math.ceil(viewW / CANYON_WIDTH) + 1;
      if (mix > 0.2) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${(mix - 0.2) * 0.9})`;
        const starCoords = [
          [45, 50],
          [125, 38],
          [210, 68],
          [85, 115],
          [265, 44],
          [355, 80],
          [165, 95],
        ];
        for (let r = 0; r < tileCount; r++) {
          for (const [sx, sy] of starCoords) {
            ctx.beginPath();
            ctx.arc(sx + r * CANYON_WIDTH, sy, 1.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // 2. Parallax Layer 1: Clouds (slowest scroll)
      const cloudScroll = (sim.parallaxOffset * 0.15) % CANYON_WIDTH;
      ctx.fillStyle =
        mix > 0.5 ? 'rgba(148, 163, 184, 0.16)' : 'rgba(255, 255, 255, 0.55)';
      for (let repeat = 0; repeat < tileCount; repeat++) {
        const baseX = -cloudScroll + repeat * CANYON_WIDTH;
        ctx.beginPath();
        ctx.ellipse(baseX + 90, 125, 38, 13, 0, 0, Math.PI * 2);
        ctx.ellipse(baseX + 115, 120, 26, 15, 0, 0, Math.PI * 2);
        ctx.ellipse(baseX + 280, 165, 44, 14, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Parallax Layer 2: Distant Sandstone Mesas (medium scroll)
      const mesaScroll = (sim.parallaxOffset * 0.3) % CANYON_WIDTH;
      ctx.fillStyle = lerpHexColor('#c2410c', '#3b1d38', mix);
      for (let repeat = 0; repeat < tileCount; repeat++) {
        const bx = -mesaScroll + repeat * CANYON_WIDTH;
        ctx.beginPath();
        ctx.moveTo(bx, PLAYABLE_HEIGHT);
        ctx.lineTo(bx + 35, PLAYABLE_HEIGHT - 165);
        ctx.lineTo(bx + 125, PLAYABLE_HEIGHT - 165);
        ctx.lineTo(bx + 165, PLAYABLE_HEIGHT - 95);
        ctx.lineTo(bx + 235, PLAYABLE_HEIGHT - 190);
        ctx.lineTo(bx + 330, PLAYABLE_HEIGHT - 190);
        ctx.lineTo(bx + 380, PLAYABLE_HEIGHT - 110);
        ctx.lineTo(bx + CANYON_WIDTH, PLAYABLE_HEIGHT);
        ctx.closePath();
        ctx.fill();
      }

      // 4. Parallax Layer 3: Closer Canyon Rock Ridges (faster scroll)
      const ridgeScroll = (sim.parallaxOffset * 0.55) % CANYON_WIDTH;
      ctx.fillStyle = lerpHexColor('#9a3412', '#1f122b', mix);
      for (let repeat = 0; repeat < tileCount; repeat++) {
        const rx = -ridgeScroll + repeat * CANYON_WIDTH;
        ctx.beginPath();
        ctx.moveTo(rx, PLAYABLE_HEIGHT);
        ctx.lineTo(rx + 60, PLAYABLE_HEIGHT - 85);
        ctx.lineTo(rx + 150, PLAYABLE_HEIGHT - 65);
        ctx.lineTo(rx + 220, PLAYABLE_HEIGHT - 105);
        ctx.lineTo(rx + 310, PLAYABLE_HEIGHT - 90);
        ctx.lineTo(rx + CANYON_WIDTH, PLAYABLE_HEIGHT);
        ctx.closePath();
        ctx.fill();
      }

      // 5. Sandstone Pillars (Warm orange-brown with geological stripes, NEVER green pipes)
      const highContrast = settings.highContrastPillars;
      for (const pillar of sim.pillars) {
        const gapTop = pillar.gapCenterY - pillar.gapHeight / 2;
        const gapBottom = pillar.gapCenterY + pillar.gapHeight / 2;

        const drawSandstoneColumn = (
          x: number,
          y: number,
          w: number,
          h: number,
          isTop: boolean
        ) => {
          if (h <= 0) return;
          ctx.save();

          // Base sandstone body
          ctx.fillStyle = highContrast ? '#f59e0b' : '#b45309';
          ctx.strokeStyle = highContrast ? '#ffffff' : '#451a03';
          ctx.lineWidth = highContrast ? 3.5 : 2.5;
          ctx.fillRect(x, y, w, h);

          // Warm sunlit left highlight
          ctx.fillStyle = highContrast
            ? 'rgba(254, 243, 199, 0.35)'
            : 'rgba(251, 146, 60, 0.35)';
          ctx.fillRect(x + 4, y, 12, h);

          // Horizontal sandstone sedimentary stripes
          ctx.fillStyle = highContrast
            ? 'rgba(120, 53, 15, 0.55)'
            : 'rgba(124, 45, 18, 0.65)';
          for (let sy = y + 18; sy < y + h - 18; sy += 26) {
            ctx.fillRect(x + 2, sy, w - 4, 6);
          }

          ctx.strokeRect(x, y, w, h);

          // Carved sandstone ledge cap near the gap opening
          const capH = Math.min(18, h);
          const capY = isTop ? y + h - capH : y;
          ctx.fillStyle = highContrast ? '#fbbf24' : '#d97706';
          ctx.fillRect(x - 4, capY, w + 8, capH);
          ctx.strokeRect(x - 4, capY, w + 8, capH);

          ctx.restore();
        };

        // Top Sandstone Pillar
        drawSandstoneColumn(pillar.x, 0, PILLAR_WIDTH, gapTop, true);
        // Bottom Sandstone Pillar
        drawSandstoneColumn(
          pillar.x,
          gapBottom,
          PILLAR_WIDTH,
          PLAYABLE_HEIGHT - gapBottom,
          false
        );

        // Collectible Feather floating in the middle of the gap
        if (pillar.hasFeather && !pillar.featherCollected) {
          const fx = pillar.x + PILLAR_WIDTH / 2;
          const fy =
            pillar.gapCenterY + Math.sin(pillar.featherBobOffset) * 8;

          ctx.save();
          ctx.translate(fx, fy);
          ctx.rotate(-0.35);

          // Glowing aura
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.24)';
          ctx.fill();

          // Feather vane
          ctx.fillStyle = '#38bdf8';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(0, -2, 5.5, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.ellipse(0, -5, 3, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Quill shaft
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(0, 12);
          ctx.lineTo(0, -11);
          ctx.stroke();

          ctx.restore();
        }
      }

      // 6. Canyon Sandstone Floor
      const floorScroll = (sim.parallaxOffset * 1.0) % 40;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, PLAYABLE_HEIGHT, viewW, GROUND_HEIGHT);

      // Top canyon rim border
      ctx.fillStyle = '#d97706';
      ctx.fillRect(0, PLAYABLE_HEIGHT, viewW, 10);

      // Diagonal sandstone floor striations
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      for (let gx = -floorScroll; gx < viewW + 40; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, PLAYABLE_HEIGHT + 10);
        ctx.lineTo(gx - 18, CANYON_HEIGHT);
        ctx.stroke();
      }

      // 7. Parrot / Bird Sprite with Wing Animation & Velocity Rotation
      const rotationRad =
        sim.phase === 'ready'
          ? 0
          : Math.max(-0.48, Math.min(0.85, (sim.parrotVy / 600) * 0.75));
      const flapPhase =
        sim.phase === 'ready'
          ? sim.bobTime * 8
          : sim.flapAnimTimer > 0
          ? (0.28 - sim.flapAnimTimer) * 26
          : 0.2;

      drawBirdOnCanvas(
        ctx,
        records.selectedSkin,
        PARROT_X,
        sim.parrotY,
        15,
        rotationRad,
        flapPhase
      );

      // 8. Floating Score Popups (+2 Feather)
      for (const ft of sim.floatingTexts) {
        ctx.save();
        ctx.font = '800 15px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = '#020617';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // 9. Ready Screen Overlay ("Tap to start")
      if (sim.phase === 'ready') {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
        ctx.lineWidth = 2;
        const boxW = Math.min(310, viewW - 44);
        ctx.beginPath();
        ctx.roundRect((viewW - boxW) / 2, 420, boxW, 86, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Tap to start', viewW / 2, 456);

        ctx.fillStyle = '#fde68a';
        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(
          'Tap, Click, Space, or Arrow Up to flap',
          viewW / 2,
          482
        );
        ctx.restore();
      }

      ctx.restore();
    };

    const tick = (now: number) => {
      const elapsed = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      accumulator += elapsed;

      while (accumulator >= FIXED_DT) {
        stepPhysics(FIXED_DT);
        accumulator -= FIXED_DT;
      }

      renderCanyon();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [
    screen,
    handleGameOver,
    records.selectedSkin,
    settings.assistMode,
    settings.highContrastPillars,
    settings.reducedMotion,
  ]);

  const selectedSkinObj =
    PARROT_SKINS.find((s) => s.id === records.selectedSkin) || PARROT_SKINS[0];
  const modeBestScore = records.bestByMode[mode] || 0;
  const earnedMedal = getMedalForScore(score);
  const medalInfo = MEDAL_META[earnedMedal];

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center select-none ${
        settings.theme === 'light'
          ? 'rb-light-theme bg-amber-50 text-slate-900'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Screen-reader live region for score milestones and game over */}
      <div className="sr-only" aria-live="polite">
        {srAnnouncement}
      </div>

      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-1.5 flex flex-col items-center">
        {/* ========================================================= */}
        {/* 1. CANYON FLIGHT SCREEN (Ready, Flying & Game Over)       */}
        {/* ========================================================= */}
        {screen === 'game' && (
          <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-3">
            {/* ===================================================== */}
            {/* DESKTOP LEFT STACKED PANEL (lg: visible, mobile hidden) */}
            {/* Score, Best & Statistics in stacked style on the left */}
            {/* ===================================================== */}
            <aside className="hidden lg:flex lg:flex-col gap-2.5 w-[14.5rem] shrink-0">
              {/* Stacked Score, Best & Statistics Card */}
              <div className="bg-slate-900/95 border border-amber-500/35 rounded-2xl p-3 shadow-lg flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                    Live Statistics
                  </span>
                  {flightPhase === 'flying' && (
                    <button
                      onClick={() => {
                        simRef.current.paused = !simRef.current.paused;
                        setIsPaused(simRef.current.paused);
                      }}
                      aria-label="Pause Game"
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-3 h-3 text-emerald-400" />
                          <span>Resume</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Stacked Stat Rows */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/25">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Score
                    </span>
                    <span className="text-lg font-black text-amber-400 tabular-nums leading-none">
                      {score}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Best ({mode})
                    </span>
                    <span className="text-base font-black text-white tabular-nums leading-none">
                      {Math.max(score, modeBestScore)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Feathers
                    </span>
                    <span className="text-sm font-black text-sky-400 tabular-nums leading-none">
                      +{feathersRun} 🪶
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 font-semibold">Saved Bank</span>
                    <span className="font-extrabold text-sky-300 tabular-nums">
                      {records.totalFeathers} 🪶
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 font-semibold">Daily Streak</span>
                    <span className="font-extrabold text-emerald-400 tabular-nums">
                      {records.dailyStreak}d 🔥
                    </span>
                  </div>
                </div>
              </div>

              {/* Small Stacked Flight Mode Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Flight Mode
                </div>
                <div className="flex flex-col gap-1">
                  {(
                    [
                      {
                        id: 'classic',
                        name: 'Classic Canyon',
                        desc: 'Standard gap & speed',
                        icon: Flame,
                      },
                      {
                        id: 'chill',
                        name: 'Chill Mode',
                        desc: 'Wider gap · Safe ceiling',
                        icon: Wind,
                      },
                      {
                        id: 'daily',
                        name: `Daily (${todayDateStr})`,
                        desc: 'Seeded course today',
                        icon: Calendar,
                      },
                    ] as const
                  ).map((m) => {
                    const Icon = m.icon;
                    const active = mode === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => resetToReadyState(m.id)}
                        className={`w-full px-2 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          active
                            ? 'bg-amber-500/15 border-amber-400 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            active ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-extrabold truncate leading-tight">
                            {m.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate leading-tight">
                            {m.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Small Active Bird & Medals Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                      <ParrotSkinSvg skinId={records.selectedSkin} size={24} wingUp />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold text-white truncate">
                        {selectedSkinObj.species}
                      </div>
                      <div className="text-[10px] italic text-slate-400 truncate">
                        {selectedSkinObj.scientificName}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setScreen('skins')}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold border border-slate-700 cursor-pointer shrink-0"
                  >
                    Birds
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-slate-800/80">
                  <div className="px-1.5 py-0.5 rounded bg-slate-950/70 border border-slate-800">
                    🥉 <strong>10</strong>
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-slate-950/70 border border-slate-800">
                    🥈 <strong>25</strong>
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-slate-950/70 border border-slate-800">
                    🥇 <strong>50</strong>
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-slate-950/70 border border-slate-800">
                    💎 <strong>100</strong>
                  </div>
                </div>
              </div>

              {/* Compact Game Tools Row */}
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => setScreen('records')}
                  title="Records"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 flex items-center justify-center cursor-pointer"
                >
                  <Trophy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowHowToPlay(true)}
                  title="How to Play"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center justify-center cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                  title={settings.soundEnabled ? 'Mute sound' : 'Unmute sound'}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center justify-center cursor-pointer"
                >
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  title="Settings"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center justify-center cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </aside>

            {/* ===================================================== */}
            {/* MAIN GAME PREVIEW COLUMN                              */}
            {/* Mobile: Stats on TOP + 94vw x 74dvh Canvas            */}
            {/* Desktop: 3:4 Arcade Cabinet Canvas (84dvh height)     */}
            {/* ===================================================== */}
            <div className="w-[94vw] max-w-[26rem] lg:w-[min(52vw,calc(84dvh*0.75))] lg:max-w-none flex flex-col items-center">
              {/* MOBILE TOP STATS & CONTROLS BAR (Visible on Mobile/Tablet, Hidden on Desktop lg:) */}
              <div className="w-full lg:hidden flex flex-col gap-1.5 mb-1.5">
                {/* Row 1: Score, Best, Feathers on Top */}
                <div className="w-full grid grid-cols-3 gap-1.5">
                  <div className="bg-slate-900/95 border border-amber-500/35 rounded-xl px-2.5 py-1 shadow flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Score
                    </span>
                    <span className="text-sm font-black text-amber-400 leading-none tabular-nums">
                      {score}
                    </span>
                  </div>

                  <div className="bg-slate-900/95 border border-slate-800 rounded-xl px-2.5 py-1 shadow flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Best
                    </span>
                    <span className="text-sm font-black text-white leading-none tabular-nums">
                      {Math.max(score, modeBestScore)}
                    </span>
                  </div>

                  <div className="bg-slate-900/95 border border-slate-800 rounded-xl px-2.5 py-1 shadow flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      🪶
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-sky-400 leading-none tabular-nums">
                        +{feathersRun}
                      </span>
                      {flightPhase === 'flying' && (
                        <button
                          onClick={() => {
                            simRef.current.paused = !simRef.current.paused;
                            setIsPaused(simRef.current.paused);
                          }}
                          aria-label="Pause Game"
                          className="p-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
                        >
                          {isPaused ? (
                            <Play className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Pause className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Compact Mode Switcher & Quick Action Icons on Mobile */}
                <div className="w-full flex items-center justify-between gap-1 bg-slate-900/90 border border-slate-800 rounded-xl px-2 py-1">
                  <div className="flex items-center gap-1">
                    {(['classic', 'chill', 'daily'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => resetToReadyState(m)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold capitalize cursor-pointer transition-colors ${
                          mode === m
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setScreen('skins')}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 text-amber-300 text-[10px] font-bold border border-slate-700 cursor-pointer"
                    >
                      Birds ({records.totalFeathers}🪶)
                    </button>
                    <button
                      onClick={() => setScreen('records')}
                      aria-label="Records"
                      className="p-1 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700 cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setShowHowToPlay(true)}
                      aria-label="How to Play"
                      className="p-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        updateSetting('soundEnabled', !settings.soundEnabled)
                      }
                      aria-label="Toggle Sound"
                      className="p-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
                    >
                      {settings.soundEnabled ? (
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      aria-label="Settings"
                      className="p-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* CANYON GAME PREVIEW SCREEN: 94vw x 74dvh on Mobile, 3:4 x 84dvh on Desktop */}
              <div className="relative w-full h-[74dvh] lg:h-[84dvh] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-500/45 shadow-2xl bg-slate-950">
                <canvas
                  ref={canvasRef}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    triggerFlap();
                  }}
                  className="w-full h-full block touch-none cursor-pointer"
                />

                {/* Assist Mode Indicator Badge */}
                {settings.assistMode && mode !== 'daily' && (
                  <div className="pointer-events-none absolute top-[2%] left-[3%] px-2 py-0.5 rounded-full bg-emerald-500/90 text-slate-950 font-extrabold text-[10px] shadow">
                    ASSIST MODE (+20% GAP)
                  </div>
                )}

                {/* PAUSE OVERLAY */}
                {isPaused && flightPhase === 'flying' && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-[6%] text-center z-20">
                    <h3 className="text-lg sm:text-xl font-black text-white mb-1.5">
                      Flight Paused
                    </h3>
                    <p className="text-xs text-slate-300 mb-4 max-w-[85%]">
                      Tap, click, or press Space / Arrow Up to flap through the
                      sandstone canyon gaps.
                    </p>
                    <div className="flex flex-col gap-2 w-[70%] max-w-[13rem]">
                      <button
                        onClick={() => {
                          simRef.current.paused = false;
                          setIsPaused(false);
                        }}
                        className="py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer"
                      >
                        Resume Flight
                      </button>
                      <button
                        onClick={() => resetToReadyState(mode)}
                        className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer"
                      >
                        Restart
                      </button>
                    </div>
                  </div>
                )}

                {/* GAME OVER OVERLAY */}
                {flightPhase === 'gameover' && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-[5%] text-center z-20 overflow-y-auto">
                    <div className="w-full max-w-[20rem] flex flex-col items-center">
                      {isNewBest && (
                        <div className="mb-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-black uppercase flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>New Personal Best!</span>
                        </div>
                      )}

                      <h3 className="text-lg sm:text-xl font-black text-white mb-0.5">
                        Canyon Run Complete
                      </h3>

                      {dailyPracticeNote && (
                        <p className="text-[11px] text-amber-300 mb-1.5">
                          Practice run (first Daily run today is saved as official
                          record).
                        </p>
                      )}

                      {/* Medal Display */}
                      <div className="my-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-amber-500/35 flex items-center gap-2">
                        <span className="text-lg">{medalInfo.emoji}</span>
                        <div className="text-left">
                          <div className="text-[9px] uppercase font-bold text-slate-400">
                            Medal Awarded
                          </div>
                          <div
                            className="text-xs font-black"
                            style={{ color: medalInfo.color }}
                          >
                            {medalInfo.name}
                          </div>
                        </div>
                      </div>

                      {/* Score & Stats */}
                      <div className="w-full grid grid-cols-3 gap-1.5 my-2">
                        <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="text-[9px] text-slate-400 font-bold uppercase">
                            Score
                          </div>
                          <div className="text-sm font-black text-amber-400 tabular-nums">
                            {score}
                          </div>
                        </div>
                        <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="text-[9px] text-slate-400 font-bold uppercase">
                            Best
                          </div>
                          <div className="text-sm font-black text-white tabular-nums">
                            {Math.max(score, modeBestScore)}
                          </div>
                        </div>
                        <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="text-[9px] text-slate-400 font-bold uppercase">
                            Feathers
                          </div>
                          <div className="text-sm font-black text-sky-400 tabular-nums">
                            +{feathersRun}
                          </div>
                        </div>
                      </div>

                      {newlyUnlockedSkins.length > 0 && (
                        <div className="w-full mb-2 p-1.5 rounded-xl bg-emerald-950/80 border border-emerald-400/50 text-[11px] text-emerald-200 font-bold">
                          🎉 Unlocked:{' '}
                          {newlyUnlockedSkins.map((s) => s.species).join(', ')}!
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5 w-full mt-1">
                        <button
                          onClick={() => resetToReadyState(mode)}
                          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Fly Again (Space / Tap)</span>
                        </button>

                        <button
                          onClick={() => setShowShareModal(true)}
                          className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share Result Score Card</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. BIRD SKIN SELECT SCREEN (5 Unlockable SVG Birds)       */}
        {/* ========================================================= */}
        {screen === 'skins' && (
          <div className="w-full bg-slate-900/95 border border-amber-500/25 rounded-3xl p-5 sm:p-7 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Unlockable Bird Skins
                </h2>
                <p className="text-xs text-slate-300">
                  Collect floating feathers inside canyon gaps (+2 pts each) to
                  unlock new birds. Total Feathers:{' '}
                  <span className="text-sky-400 font-extrabold">
                    {records.totalFeathers} 🪶
                  </span>
                </p>
              </div>
              <button
                onClick={() => setScreen('game')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer"
              >
                Back to Canyon
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PARROT_SKINS.map((skin) => {
                const unlocked = records.totalFeathers >= skin.unlockFeathers;
                const isSelected = records.selectedSkin === skin.id;
                const verifiedFact = getVerifiedBirdFact(skin.species);

                return (
                  <div
                    key={skin.id}
                    onClick={() => unlocked && selectSkin(skin.id)}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      unlocked ? 'cursor-pointer' : 'opacity-75'
                    } ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-400 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                          <ParrotSkinSvg skinId={skin.id} size={46} wingUp />
                        </div>
                        <div>
                          <div className="font-extrabold text-white text-sm">
                            {skin.species}
                          </div>
                          <div className="text-xs italic text-slate-400">
                            {skin.scientificName}
                          </div>
                        </div>
                      </div>

                      {verifiedFact && (
                        <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 mb-3">
                          {verifiedFact.fact}{' '}
                          {verifiedFact.source && (
                            <span className="text-slate-400">
                              ({verifiedFact.source})
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-800 text-xs font-bold">
                      {unlocked ? (
                        <span
                          className={
                            isSelected ? 'text-amber-400' : 'text-emerald-400'
                          }
                        >
                          {isSelected ? '✓ Active Flyer' : 'Click to Select'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Lock className="w-3.5 h-3.5" />
                          <span>
                            Unlock at {skin.unlockFeathers} 🪶 (
                            {Math.max(
                              0,
                              skin.unlockFeathers - records.totalFeathers
                            )}{' '}
                            more)
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. MY RECORDS & AUTOMATED SELF-TEST SCREEN                */}
        {/* ========================================================= */}
        {screen === 'records' && (
          <div className="w-full bg-slate-900/95 border border-amber-500/25 rounded-3xl p-5 sm:p-7 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  My Parrot Flap Records
                </h2>
                <p className="text-xs text-amber-300 font-semibold">
                  Scores and unlocked birds are saved on this device only
                  (localStorage).
                </p>
              </div>
              <button
                onClick={() => setScreen('game')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer"
              >
                Back to Game
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  Total Feathers
                </div>
                <div className="text-2xl font-black text-sky-400">
                  {records.totalFeathers} 🪶
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  Pillars Passed
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  {records.totalPillarsPassed}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  Total Flights
                </div>
                <div className="text-2xl font-black text-white">
                  {records.totalGames}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  Daily Streak
                </div>
                <div className="text-2xl font-black text-amber-400">
                  {records.dailyStreak} 🔥
                </div>
              </div>
            </div>

            {/* Best Score by Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {(['classic', 'chill', 'daily'] as const).map((m) => {
                const best = records.bestByMode[m] || 0;
                const med = MEDAL_META[getMedalForScore(best)];
                return (
                  <div
                    key={m}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-extrabold uppercase text-amber-400">
                        {m === 'classic'
                          ? 'Classic Mode'
                          : m === 'chill'
                          ? 'Chill Mode'
                          : 'Daily Challenge'}
                      </div>
                      <div className="text-xl font-black text-white">
                        {best} pts
                      </div>
                    </div>
                    <div className="text-2xl" title={med.name}>
                      {med.emoji}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Self-Test & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelfTestResult(runParrotFlapSelfTest())}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Gap Reachability &amp; Daily Course Seed</span>
              </button>

              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset My Records</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-300 font-bold">
                    Reset all local scores?
                  </span>
                  <button
                    onClick={() => {
                      const fresh = resetParrotFlapRecords();
                      setRecords(fresh);
                      setConfirmReset(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {selfTestResult && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs text-emerald-300">
                {selfTestResult.passed
                  ? `✓ Self-Test Passed (${selfTestResult.testedPillars} consecutive pillar gaps verified 100% reachable under gravity=1500, flap=-480, and Daily Challenge course determinism confirmed).`
                  : `✗ Failures: ${selfTestResult.failures.join(', ')}`}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* HOW TO PLAY MODAL                                         */}
        {/* ========================================================= */}
        {showHowToPlay && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-[clamp(0.75rem,3vw,1.5rem)] overflow-y-auto">
            <div className="w-[min(92vw,34rem)] max-h-[88dvh] overflow-y-auto bg-slate-900 border border-amber-500/30 rounded-3xl p-[clamp(1rem,3vw,1.75rem)] shadow-2xl my-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[clamp(1.1rem,2vw,1.35rem)] font-black text-white">
                  How to Play Parrot Flap
                </h3>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-[clamp(0.78rem,1.2vw,0.92rem)] text-slate-200 leading-relaxed">
                <p>
                  <strong>1. One-Tap Flight:</strong> Tap the screen, click your
                  mouse, or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800">Space</kbd>{' '}
                  / <kbd className="px-1.5 py-0.5 rounded bg-slate-800">Arrow Up</kbd> to
                  give your bird an upward wing impulse.
                </p>
                <p>
                  <strong>2. Sandstone Pillars &amp; Feathers:</strong> Fly cleanly
                  through each sandstone canyon gap for <strong>+1 point</strong>.
                  Catch floating feathers inside gaps for <strong>+2 bonus points</strong>{' '}
                  and progress toward unlocking all 5 bird skins.
                </p>
                <p>
                  <strong>3. Modes &amp; Medals:</strong> Play <strong>Classic</strong>,{' '}
                  <strong>Chill</strong> (wider gaps and safe ceiling), or the
                  date-seeded <strong>Daily Challenge</strong>. Earn Bronze (10),
                  Silver (25), Gold (50), and Platinum (100) medals!
                </p>
              </div>

              <button
                onClick={() => setShowHowToPlay(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-[clamp(0.8rem,1.2vw,0.95rem)] cursor-pointer"
              >
                Ready to Fly!
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SETTINGS & ACCESSIBILITY MODAL                            */}
        {/* ========================================================= */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-[clamp(0.75rem,3vw,1.5rem)] overflow-y-auto">
            <div className="w-[min(92vw,30rem)] max-h-[88dvh] overflow-y-auto bg-slate-900 border border-amber-500/30 rounded-3xl p-[clamp(1rem,3vw,1.75rem)] shadow-2xl my-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[clamp(1.05rem,2vw,1.3rem)] font-black text-white">
                  Flight &amp; Accessibility Settings
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-[clamp(0.78rem,1.2vw,0.9rem)]">
                {[
                  {
                    key: 'soundEnabled' as const,
                    label: 'Web Audio Sound Effects',
                    desc: 'Wing flaps, score chimes, feather pickup, and medals',
                  },
                  {
                    key: 'assistMode' as const,
                    label: 'Assist Mode (+20% Wider Gaps)',
                    desc: 'Widens sandstone pillar openings in Classic & Chill modes',
                  },
                  {
                    key: 'highContrastPillars' as const,
                    label: 'High-Contrast Sandstone Pillars',
                    desc: 'Bright gold pillars with crisp white outlines',
                  },
                  {
                    key: 'reducedMotion' as const,
                    label: 'Reduced Motion',
                    desc: 'Turns off canyon parallax scrolling and impact shake',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-[clamp(0.65rem,1.5vw,0.9rem)] rounded-2xl bg-slate-950/70 border border-slate-800 cursor-pointer gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-white text-[clamp(0.78rem,1.1vw,0.9rem)]">
                        {item.label}
                      </div>
                      <div className="text-[clamp(0.68rem,0.95vw,0.78rem)] text-slate-400">
                        {item.desc}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={(e) => updateSetting(item.key, e.target.checked)}
                      className="w-5 h-5 accent-amber-500 cursor-pointer shrink-0"
                    />
                  </label>
                ))}

                <div className="flex items-center justify-between p-[clamp(0.65rem,1.5vw,0.9rem)] rounded-2xl bg-slate-950/70 border border-slate-800 gap-3">
                  <span className="font-bold text-white text-[clamp(0.78rem,1.1vw,0.9rem)]">
                    UI Chrome Theme
                  </span>
                  <button
                    onClick={() =>
                      updateSetting(
                        'theme',
                        settings.theme === 'dark' ? 'light' : 'dark'
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-amber-300 text-[clamp(0.7rem,1vw,0.8rem)] font-bold border border-slate-700 cursor-pointer shrink-0"
                  >
                    {settings.theme === 'dark' ? 'Dark Canyon' : 'Light Sandstone'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-[clamp(0.8rem,1.2vw,0.95rem)] cursor-pointer"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        )}

        {/* SHAREABLE SCORE CARD MODAL */}
        <ParrotShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          mode={mode}
          score={score}
          personalBest={modeBestScore}
          feathersCollected={feathersRun}
          medal={earnedMedal}
          skinId={records.selectedSkin}
          dailyDate={mode === 'daily' ? todayDateStr : undefined}
        />

        {/* ========================================================= */}
        {/* SEO & FAQ CONTENT SECTION BELOW THE GAME                  */}
        {/* ========================================================= */}
        <section className="w-full mt-10 bg-slate-900/85 border border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-300 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <span>How to Play Parrot Flap – Free Tap to Fly Bird Game</span>
            </h2>
            <p className="text-sm leading-relaxed">
              <strong>Parrot Flap</strong> is an original <strong>one-tap game</strong>{' '}
              and <strong>bird game</strong> set inside a sun-drenched sandstone
              canyon on ReptileBirds. Using a single input—tap on mobile, left-click
              on desktop, or press Space / Arrow Up—you control a Scarlet Macaw (or
              4 other unlockable bird species) gliding between layered canyon pillars.
              Every pillar pair you clear adds <strong>+1 point</strong>, while
              shimmering canyon feathers floating inside the gap award{' '}
              <strong>+2 points</strong> and unlock new avian flyers. Every 25 points,
              the canyon sky smoothly transitions between golden daylight and a
              starlit desert night.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Frequently Asked Questions (FAQ)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-bold text-amber-300 mb-1">
                  1. How does the reachability guarantee work in this tap to fly game?
                </h4>
                <p className="text-slate-300">
                  Every new sandstone pillar gap is mathematically bounded based on the
                  previous gap&apos;s height, scroll speed (180 px/s), gravity (1500
                  px/s²), and flap impulse (-480 px/s) so every single opening is
                  100% reachable.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-bold text-amber-300 mb-1">
                  2. What is the difference between Classic, Chill, and Daily Challenge?
                </h4>
                <p className="text-slate-300">
                  Classic mode starts with a 170 px gap that narrows toward 130 px as
                  your score climbs. Chill mode features a wide 220 px gap, slower
                  scrolling, and a forgiving ceiling. Daily Challenge uses today&apos;s
                  date (YYYY-MM-DD) so every player flies the exact same canyon course.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-bold text-amber-300 mb-1">
                  3. How do I unlock all 5 bird skins in this bird game?
                </h4>
                <p className="text-slate-300">
                  Collect floating feathers inside pillar gaps across any mode: Scarlet
                  Macaw (0), Common Kingfisher (20 feathers), Barn Owl (60 feathers),
                  Ruby-throated Hummingbird (120 feathers), and Indian Peafowl (250
                  feathers). All skins share identical physics.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-bold text-amber-300 mb-1">
                  4. What medals can I earn in Parrot Flap?
                </h4>
                <p className="text-slate-300">
                  Scoring 10 points awards the Bronze Medal, 25 points awards the
                  Silver Medal, 50 points awards the Gold Medal, and reaching 100
                  points awards the Platinum Medal—all featured on your downloadable
                  1080×1080 or 1080×1920 score card.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 md:col-span-2">
                <h4 className="font-bold text-amber-300 mb-1">
                  5. Does Assist Mode help beginners in this one-tap game?
                </h4>
                <p className="text-slate-300">
                  Yes! Enabling Assist Mode in Settings widens all sandstone pillar
                  openings by 20 percent in Classic and Chill modes, making it ideal
                  for accessibility or warming up your timing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
