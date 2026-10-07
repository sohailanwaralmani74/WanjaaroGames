import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ARENA_SIZE,
  ArenaFieldLayout,
  BIRD_OF_PREY_PROFILES,
  BURROW_COOLDOWN_SEC,
  BURROW_DURATION_SEC,
  BirdAttack,
  BirdOfPreyType,
  FieldMouse,
  FloatingCallout,
  INITIAL_SEGMENTS,
  INVULNERABLE_DURATION_SEC,
  MAX_SNAKE_SEGMENTS,
  SnakeEscapeMode,
  SnakeEscapeSkinId,
  SnakeSegment,
  TIMED_HUNT_DURATION_SEC,
  WAVE_DURATION_SEC,
  collidesWithObstacle,
  createBirdAttack,
  createSeededRng,
  cryptoRandomFloat,
  distanceBetween,
  generateArenaLayout,
  getTodayDateString,
  isInsideTallGrass,
  isSnakeInsideCircle,
  runSnakeEscapeSelfTest,
  spawnValidPreyItem,
  updateSnakeSegments,
} from './engine';
import {
  SNAKE_ESCAPE_SKINS,
  SnakeEscapeRecords,
  SnakeEscapeSettings,
  SnakeEscapeSkinDef,
  getVerifiedSpeciesFact,
  loadSnakeEscapeRecords,
  loadSnakeEscapeSettings,
  recordCompletedSnakeEscapeRun,
  resetSnakeEscapeRecords,
  saveSnakeEscapeRecords,
  saveSnakeEscapeSettings,
} from './storage';
import { snakeEscapeAudio } from './audio';
import { BirdOfPreySvg, EscapeSkinSvg } from './EscapeSkins';
import { EscapeShareModal } from './EscapeShareModal';
import {
  Heart,
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
  Shield,
  Calendar,
  Flame,
  Eye,
  CheckCircle2,
  Trash2,
  X,
  Lock,
  Zap,
  Compass,
} from 'lucide-react';

type ScreenView = 'title' | 'playing' | 'gameover' | 'skins' | 'records';

export const SnakeEscapeGame: React.FC = () => {
  const [screen, setScreen] = useState<ScreenView>('title');
  const [mode, setMode] = useState<SnakeEscapeMode>('survival');
  const [records, setRecords] = useState<SnakeEscapeRecords>(() =>
    loadSnakeEscapeRecords()
  );
  const [settings, setSettings] = useState<SnakeEscapeSettings>(() =>
    loadSnakeEscapeSettings()
  );

  // Modals
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [confirmResetRecords, setConfirmResetRecords] = useState(false);
  const [selfTestStatus, setSelfTestStatus] = useState<{
    passed: boolean;
    testedCount: number;
    failures: string[];
  } | null>(null);

  // Active Game HUD state
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setLivesOrWave] = useState(1);
  const [miceEaten, setMiceEaten] = useState(0);
  const [nearMisses, setNearMisses] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [burrowCooldownLeft, setBurrowCooldownLeft] = useState(0);
  const [isBurrowed, setIsBurrowed] = useState(false);
  const [speedBoostLeft, setSpeedBoostLeft] = useState(0);
  const [inGrassState, setInGrassState] = useState(false);

  // Wave & Bird intro banners
  const [waveBanner, setWaveBanner] = useState<string | null>(null);
  const [birdToast, setBirdToast] = useState<string | null>(null);

  // End of Run Summary
  const [isNewBest, setIsNewBest] = useState(false);
  const [newlyUnlockedSkins, setNewlyUnlockedSkins] = useState<SnakeEscapeSkinDef[]>([]);

  // Canvas & Game Loop Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Mutable simulation state inside ref for 60fps smooth fixed-timestep updates
  const simRef = useRef<{
    active: boolean;
    paused: boolean;
    mode: SnakeEscapeMode;
    dailyDate: string;
    rng: () => number;
    layout: ArenaFieldLayout;
    segments: SnakeSegment[];
    targetLength: number;
    headingAngle: number;
    targetAngle: number | null;
    pointerTarget: { x: number; y: number } | null;
    keysHeld: Set<string>;
    joystickVector: { dx: number; dy: number } | null;
    mice: FieldMouse[];
    attacks: BirdAttack[];
    callouts: FloatingCallout[];
    score: number;
    lives: number;
    wave: number;
    waveTimerSec: number;
    elapsedSec: number;
    miceEaten: number;
    nearMisses: number;
    invulnerableSec: number;
    burrowActiveSec: number;
    burrowCooldownSec: number;
    speedBoostSec: number;
    attackSpawnTimerSec: number;
    goldenSpawnTimerSec: number;
    eggSpawnTimerSec: number;
    shakeTimerSec: number;
    introducedBirds: Set<BirdOfPreyType>;
    warningTickCooldown: number;
  }>({
    active: false,
    paused: false,
    mode: 'survival',
    dailyDate: getTodayDateString(),
    rng: cryptoRandomFloat,
    layout: { obstacles: [], grassPatches: [] },
    segments: [],
    targetLength: INITIAL_SEGMENTS,
    headingAngle: 0,
    targetAngle: null,
    pointerTarget: null,
    keysHeld: new Set(),
    joystickVector: null,
    mice: [],
    attacks: [],
    callouts: [],
    score: 0,
    lives: 3,
    wave: 1,
    waveTimerSec: 0,
    elapsedSec: 0,
    miceEaten: 0,
    nearMisses: 0,
    invulnerableSec: 0,
    burrowActiveSec: 0,
    burrowCooldownSec: 0,
    speedBoostSec: 0,
    attackSpawnTimerSec: 1.5,
    goldenSpawnTimerSec: 14,
    eggSpawnTimerSec: 28,
    shakeTimerSec: 0,
    introducedBirds: new Set(['hawk']),
    warningTickCooldown: 0,
  });

  // Virtual Joystick Touch State
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [joystickKnob, setJoystickKnob] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const todayDateStr = getTodayDateString();

  // Sync audio mute state with settings
  useEffect(() => {
    snakeEscapeAudio.setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  const updateSetting = <K extends keyof SnakeEscapeSettings>(
    key: K,
    value: SnakeEscapeSettings[K]
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSnakeEscapeSettings(next);
      return next;
    });
  };

  const selectSkin = (skinId: SnakeEscapeSkinId) => {
    const skinDef = SNAKE_ESCAPE_SKINS.find((s) => s.id === skinId);
    if (!skinDef || records.totalMiceEaten < skinDef.unlockMice) return;
    const updated: SnakeEscapeRecords = {
      ...records,
      selectedSkin: skinId,
    };
    setRecords(updated);
    saveSnakeEscapeRecords(updated);
  };

  const triggerBurrow = useCallback(() => {
    const sim = simRef.current;
    if (!sim.active || sim.paused) return;
    if (sim.burrowActiveSec <= 0 && sim.burrowCooldownSec <= 0) {
      sim.burrowActiveSec = BURROW_DURATION_SEC;
      sim.burrowCooldownSec = BURROW_COOLDOWN_SEC;
      setIsBurrowed(true);
      setBurrowCooldownLeft(BURROW_COOLDOWN_SEC);
      snakeEscapeAudio.playBurrow();
      const head = sim.segments[0];
      if (head) {
        sim.callouts.push({
          id: `burrow-${Date.now()}`,
          text: 'BURROWED!',
          x: head.x,
          y: head.y - 20,
          color: '#38bdf8',
          ttl: 0.9,
        });
      }
    }
  }, []);

  const finishGameRun = useCallback(() => {
    const sim = simRef.current;
    sim.active = false;
    snakeEscapeAudio.playGameOver();

    const result = recordCompletedSnakeEscapeRun({
      mode: sim.mode,
      score: sim.score,
      wave: sim.wave,
      miceEaten: sim.miceEaten,
      survivalSec: sim.elapsedSec,
      dailyDate: sim.mode === 'daily' ? sim.dailyDate : undefined,
    });

    setRecords(result.updated);
    setIsNewBest(result.isNewPersonalBest);
    setNewlyUnlockedSkins(result.newlyUnlockedSkins);
    setScreen('gameover');
  }, []);

  const startNewGame = useCallback(
    (chosenMode: SnakeEscapeMode = mode) => {
      const dateStr = getTodayDateString();
      const isDaily = chosenMode === 'daily';
      const rng = isDaily
        ? createSeededRng(`snake-escape-run-${dateStr}`)
        : cryptoRandomFloat;
      const layout = generateArenaLayout(isDaily ? dateStr : undefined);

      // Build initial snake in center (400, 400)
      const initialSegs: SnakeSegment[] = [];
      for (let i = 0; i < INITIAL_SEGMENTS; i++) {
        initialSegs.push({
          x: ARENA_SIZE / 2 - i * 11,
          y: ARENA_SIZE / 2,
        });
      }

      // Spawn 4 initial field mice
      const initialMice: FieldMouse[] = [];
      for (let m = 0; m < 4; m++) {
        initialMice.push(spawnValidPreyItem('normal', layout.obstacles, rng, `init-${m}`));
      }

      simRef.current = {
        active: true,
        paused: false,
        mode: chosenMode,
        dailyDate: dateStr,
        rng,
        layout,
        segments: initialSegs,
        targetLength: INITIAL_SEGMENTS,
        headingAngle: 0,
        targetAngle: null,
        pointerTarget: null,
        keysHeld: new Set(),
        joystickVector: null,
        mice: initialMice,
        attacks: [],
        callouts: [],
        score: 0,
        lives: 3,
        wave: 1,
        waveTimerSec: 0,
        elapsedSec: 0,
        miceEaten: 0,
        nearMisses: 0,
        invulnerableSec: 1.0,
        burrowActiveSec: 0,
        burrowCooldownSec: 0,
        speedBoostSec: 0,
        attackSpawnTimerSec: 1.6,
        goldenSpawnTimerSec: 12 + rng() * 6,
        eggSpawnTimerSec: 25 + rng() * 10,
        shakeTimerSec: 0,
        introducedBirds: new Set(['hawk']),
        warningTickCooldown: 0,
      };

      setMode(chosenMode);
      setScore(0);
      setLives(3);
      setLivesOrWave(1);
      setMiceEaten(0);
      setNearMisses(0);
      setElapsedSec(0);
      setBurrowCooldownLeft(0);
      setIsBurrowed(false);
      setSpeedBoostLeft(0);
      setInGrassState(false);
      setIsPaused(false);
      setIsNewBest(false);
      setNewlyUnlockedSkins([]);

      setWaveBanner('Wave 1');
      setBirdToast(BIRD_OF_PREY_PROFILES.hawk.introToast);
      snakeEscapeAudio.playWaveStart();

      setScreen('playing');
    },
    [mode]
  );

  // Auto-clear wave banner & bird toast
  useEffect(() => {
    if (!waveBanner) return;
    const t = setTimeout(() => setWaveBanner(null), 2200);
    return () => clearTimeout(t);
  }, [waveBanner]);

  useEffect(() => {
    if (!birdToast) return;
    const t = setTimeout(() => setBirdToast(null), 3600);
    return () => clearTimeout(t);
  }, [birdToast]);

  // Auto-pause when tab loses focus
  useEffect(() => {
    const onBlurOrHide = () => {
      if (simRef.current.active && !simRef.current.paused) {
        simRef.current.paused = true;
        setIsPaused(true);
      }
    };
    const onVisibility = () => {
      if (document.hidden) onBlurOrHide();
    };
    window.addEventListener('blur', onBlurOrHide);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('blur', onBlurOrHide);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Keyboard listener for WASD, Arrows, Space (Burrow), P/Escape (Pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'playing') return;
      const key = e.key.toLowerCase();

      if (key === ' ' || e.code === 'Space') {
        e.preventDefault();
        triggerBurrow();
        return;
      }

      if (key === 'p' || key === 'escape') {
        e.preventDefault();
        simRef.current.paused = !simRef.current.paused;
        setIsPaused(simRef.current.paused);
        return;
      }

      if (
        [
          'arrowup',
          'arrowdown',
          'arrowleft',
          'arrowright',
          'w',
          'a',
          's',
          'd',
        ].includes(key)
      ) {
        if (key.startsWith('arrow')) e.preventDefault();
        simRef.current.keysHeld.add(key);
        // Clear pointer steering when keyboard is used
        simRef.current.pointerTarget = null;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      simRef.current.keysHeld.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen, triggerBurrow]);

  // Fixed-timestep Game Loop + 2D Canvas Renderer
  useEffect(() => {
    if (screen !== 'playing') return;

    const FIXED_DT = 1 / 60;
    let lastTime = performance.now();
    let accumulator = 0;
    let hudSyncCounter = 0;

    const stepSimulation = (dt: number) => {
      const sim = simRef.current;
      if (!sim.active || sim.paused) return;

      sim.elapsedSec += dt;
      sim.waveTimerSec += dt;

      // Check Timed Hunt end condition (3 minutes = 180s)
      if (sim.mode === 'timed' && sim.elapsedSec >= TIMED_HUNT_DURATION_SEC) {
        finishGameRun();
        return;
      }

      // Check 30-second wave progression
      if (sim.waveTimerSec >= WAVE_DURATION_SEC) {
        sim.waveTimerSec -= WAVE_DURATION_SEC;
        sim.wave += 1;
        sim.score += 100; // Wave survival bonus +100
        setLivesOrWave(sim.wave);
        setWaveBanner(`Wave ${sim.wave} (+100 pts)`);
        snakeEscapeAudio.playWaveStart();

        const head = sim.segments[0];
        if (head) {
          sim.callouts.push({
            id: `wave-bonus-${sim.wave}`,
            text: `WAVE ${sim.wave} +100`,
            x: head.x,
            y: head.y - 28,
            color: '#fbbf24',
            ttl: 1.2,
          });
        }

        // Introduce new bird of prey if unlocked on this wave
        const unlockedBird = (
          Object.values(BIRD_OF_PREY_PROFILES) as typeof BIRD_OF_PREY_PROFILES[BirdOfPreyType][]
        ).find((b) => b.minWave === sim.wave && !sim.introducedBirds.has(b.id));

        if (unlockedBird) {
          sim.introducedBirds.add(unlockedBird.id);
          setBirdToast(unlockedBird.introToast);
        } else if (sim.wave >= 7 && sim.wave % 2 === 1) {
          setBirdToast('Night Wave: Barn Owls prowl in the dark!');
        }
      }

      // Update timers
      if (sim.invulnerableSec > 0) sim.invulnerableSec = Math.max(0, sim.invulnerableSec - dt);
      if (sim.burrowActiveSec > 0) sim.burrowActiveSec = Math.max(0, sim.burrowActiveSec - dt);
      if (sim.burrowCooldownSec > 0)
        sim.burrowCooldownSec = Math.max(0, sim.burrowCooldownSec - dt);
      if (sim.speedBoostSec > 0) sim.speedBoostSec = Math.max(0, sim.speedBoostSec - dt);
      if (sim.shakeTimerSec > 0) sim.shakeTimerSec = Math.max(0, sim.shakeTimerSec - dt);
      if (sim.warningTickCooldown > 0)
        sim.warningTickCooldown = Math.max(0, sim.warningTickCooldown - dt);

      // Determine steering angle from Keyboard, Virtual Joystick, or Pointer
      const head = sim.segments[0] || { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 };
      let desiredAngle: number | null = null;

      if (sim.joystickVector && (sim.joystickVector.dx !== 0 || sim.joystickVector.dy !== 0)) {
        desiredAngle = Math.atan2(sim.joystickVector.dy, sim.joystickVector.dx);
      } else if (sim.keysHeld.size > 0) {
        let kx = 0;
        let ky = 0;
        if (sim.keysHeld.has('arrowleft') || sim.keysHeld.has('a')) kx -= 1;
        if (sim.keysHeld.has('arrowright') || sim.keysHeld.has('d')) kx += 1;
        if (sim.keysHeld.has('arrowup') || sim.keysHeld.has('w')) ky -= 1;
        if (sim.keysHeld.has('arrowdown') || sim.keysHeld.has('s')) ky += 1;
        if (kx !== 0 || ky !== 0) {
          desiredAngle = Math.atan2(ky, kx);
        }
      } else if (sim.pointerTarget) {
        const distToPtr = distanceBetween(
          head.x,
          head.y,
          sim.pointerTarget.x,
          sim.pointerTarget.y
        );
        if (distToPtr > 10) {
          desiredAngle = Math.atan2(
            sim.pointerTarget.y - head.y,
            sim.pointerTarget.x - head.x
          );
        }
      }

      // Smoothly turn headingAngle toward desiredAngle
      if (desiredAngle !== null) {
        let diff = desiredAngle - sim.headingAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const maxTurn = 6.2 * dt; // Responsive smooth turning
        if (Math.abs(diff) <= maxTurn) {
          sim.headingAngle = desiredAngle;
        } else {
          sim.headingAngle += Math.sign(diff) * maxTurn;
        }
      }

      // Move snake head
      const baseSpeed = 195;
      const currentSpeed = sim.speedBoostSec > 0 ? baseSpeed * 1.42 : baseSpeed;
      let nextX = head.x + Math.cos(sim.headingAngle) * currentSpeed * dt;
      let nextY = head.y + Math.sin(sim.headingAngle) * currentSpeed * dt;

      // Clamp inside arena walls (padding 14px)
      const wallMargin = 14;
      if (nextX < wallMargin) {
        nextX = wallMargin;
      } else if (nextX > ARENA_SIZE - wallMargin) {
        nextX = ARENA_SIZE - wallMargin;
      }
      if (nextY < wallMargin) {
        nextY = wallMargin;
      } else if (nextY > ARENA_SIZE - wallMargin) {
        nextY = ARENA_SIZE - wallMargin;
      }

      // Slide smoothly around solid obstacles (rocks & logs)
      const hitObs = collidesWithObstacle(nextX, nextY, 12, sim.layout.obstacles);
      if (hitObs) {
        const pushAngle = Math.atan2(nextY - hitObs.y, nextX - hitObs.x);
        const minDist = hitObs.radius + 12.5;
        nextX = hitObs.x + Math.cos(pushAngle) * minDist;
        nextY = hitObs.y + Math.sin(pushAngle) * minDist;
      }

      sim.segments = updateSnakeSegments(sim.segments, nextX, nextY, sim.targetLength);
      const updatedHead = sim.segments[0];
      const inTallGrass = isInsideTallGrass(
        updatedHead.x,
        updatedHead.y,
        sim.layout.grassPatches
      );

      // Update field mice movement & check eating (cannot eat while burrowed)
      const remainingMice: FieldMouse[] = [];
      let ateNormalCount = 0;

      for (const m of sim.mice) {
        if (m.ttl !== undefined) {
          m.ttl -= dt;
          if (m.ttl <= 0) continue;
        }

        // Move mouse
        m.changeDirTimer -= dt;
        if (m.changeDirTimer <= 0 && (m.vx !== 0 || m.vy !== 0)) {
          const spd = Math.hypot(m.vx, m.vy);
          const newAng = sim.rng() * Math.PI * 2;
          m.vx = Math.cos(newAng) * spd;
          m.vy = Math.sin(newAng) * spd;
          m.changeDirTimer = 1.0 + sim.rng() * 1.8;
        }

        let mx = m.x + m.vx * dt;
        let my = m.y + m.vy * dt;

        if (mx < 24 || mx > ARENA_SIZE - 24) {
          m.vx = -m.vx;
          mx = Math.max(24, Math.min(ARENA_SIZE - 24, mx));
        }
        if (my < 24 || my > ARENA_SIZE - 24) {
          m.vy = -m.vy;
          my = Math.max(24, Math.min(ARENA_SIZE - 24, my));
        }

        const obsHit = collidesWithObstacle(mx, my, m.radius + 4, sim.layout.obstacles);
        if (obsHit) {
          m.vx = -m.vx;
          m.vy = -m.vy;
        } else {
          m.x = mx;
          m.y = my;
        }

        // Check if snake eats mouse/power-up (only when above ground)
        if (
          sim.burrowActiveSec <= 0 &&
          distanceBetween(updatedHead.x, updatedHead.y, m.x, m.y) <= m.radius + 15
        ) {
          if (m.kind === 'normal') {
            sim.score += 10;
            sim.miceEaten += 1;
            sim.targetLength = Math.min(MAX_SNAKE_SEGMENTS, sim.targetLength + 1);
            ateNormalCount++;
            snakeEscapeAudio.playEat(false);
            sim.callouts.push({
              id: `eat-${Date.now()}-${sim.rng()}`,
              text: '+10',
              x: m.x,
              y: m.y - 10,
              color: '#34d399',
              ttl: 0.75,
            });
          } else if (m.kind === 'golden') {
            sim.score += 30;
            sim.miceEaten += 1;
            sim.speedBoostSec = 4.0;
            snakeEscapeAudio.playEat(true);
            sim.callouts.push({
              id: `gold-${Date.now()}`,
              text: 'GOLDEN MOUSE! +30 & SPEED',
              x: m.x,
              y: m.y - 14,
              color: '#fbbf24',
              ttl: 1.1,
            });
          } else if (m.kind === 'egg') {
            if (sim.lives < 3) {
              sim.lives += 1;
              setLives(sim.lives);
              sim.callouts.push({
                id: `egg-${Date.now()}`,
                text: '+1 HEART!',
                x: m.x,
                y: m.y - 14,
                color: '#f43f5e',
                ttl: 1.1,
              });
            } else {
              sim.score += 50;
              sim.callouts.push({
                id: `egg-${Date.now()}`,
                text: 'NEST EGG +50',
                x: m.x,
                y: m.y - 14,
                color: '#fbbf24',
                ttl: 1.1,
              });
            }
            snakeEscapeAudio.playEat(true);
          }
          continue;
        }

        remainingMice.push(m);
      }

      sim.mice = remainingMice;

      // Replenish normal mice so there are always 4 on the arena
      for (let i = 0; i < ateNormalCount; i++) {
        sim.mice.push(
          spawnValidPreyItem(
            'normal',
            sim.layout.obstacles,
            sim.rng,
            `${sim.miceEaten}-${i}`
          )
        );
      }

      // Golden mouse spawn timer
      sim.goldenSpawnTimerSec -= dt;
      if (sim.goldenSpawnTimerSec <= 0) {
        sim.goldenSpawnTimerSec = 16 + sim.rng() * 8;
        if (!sim.mice.some((m) => m.kind === 'golden')) {
          sim.mice.push(
            spawnValidPreyItem(
              'golden',
              sim.layout.obstacles,
              sim.rng,
              `gold-${Math.floor(sim.elapsedSec)}`
            )
          );
        }
      }

      // Rare Egg spawn timer (restores 1 heart up to 3)
      sim.eggSpawnTimerSec -= dt;
      if (sim.eggSpawnTimerSec <= 0) {
        sim.eggSpawnTimerSec = 26 + sim.rng() * 12;
        if (!sim.mice.some((m) => m.kind === 'egg')) {
          sim.mice.push(
            spawnValidPreyItem(
              'egg',
              sim.layout.obstacles,
              sim.rng,
              `egg-${Math.floor(sim.elapsedSec)}`
            )
          );
        }
      }

      // Spawn Bird of Prey Attacks
      sim.attackSpawnTimerSec -= dt;
      const maxConcurrentAttacks = Math.min(4, 1 + Math.floor((sim.wave - 1) / 2));
      if (
        sim.attackSpawnTimerSec <= 0 &&
        sim.attacks.length < maxConcurrentAttacks
      ) {
        const baseInterval = Math.max(1.15, 2.7 - (sim.wave - 1) * 0.2);
        sim.attackSpawnTimerSec = settings.easyMode ? baseInterval * 1.3 : baseInterval;

        sim.attacks.push(
          createBirdAttack({
            wave: sim.wave,
            snakeHeadX: updatedHead.x,
            snakeHeadY: updatedHead.y,
            inTallGrass,
            easyMode: settings.easyMode,
            rng: sim.rng,
            idSuffix: `${Math.floor(sim.elapsedSec * 10)}-${sim.attacks.length}`,
          })
        );
      }

      // Update Bird Attacks (tracking -> locked -> diving -> impact)
      const activeAttacks: BirdAttack[] = [];
      for (const atk of sim.attacks) {
        atk.elapsedInPhase += dt;
        const profile = BIRD_OF_PREY_PROFILES[atk.birdType];

        if (atk.phase === 'tracking') {
          // If snake enters tall grass, cap tracking time at 1.0s
          const effectiveTrackLimit = inTallGrass
            ? Math.min(1.0, atk.trackingLimitSec)
            : atk.trackingLimitSec;

          // Track toward snake head
          const trackSpeed =
            profile.trackingSpeedPx *
            (inTallGrass ? 0.68 : 1.0) *
            (settings.easyMode ? 0.7 : 1.0);
          const dx = updatedHead.x - atk.x;
          const dy = updatedHead.y - atk.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 2) {
            const step = Math.min(dist, trackSpeed * dt);
            atk.x += (dx / dist) * step;
            atk.y += (dy / dist) * step;
          }

          if (atk.elapsedInPhase >= effectiveTrackLimit) {
            atk.phase = 'locked';
            atk.elapsedInPhase = 0;
            atk.wasInsideDuringLock = isSnakeInsideCircle(
              sim.segments,
              10,
              atk.x,
              atk.y,
              atk.radius
            );
          }
          activeAttacks.push(atk);
        } else if (atk.phase === 'locked') {
          if (
            isSnakeInsideCircle(sim.segments, 10, atk.x, atk.y, atk.radius)
          ) {
            atk.wasInsideDuringLock = true;
          }
          if (sim.warningTickCooldown <= 0) {
            snakeEscapeAudio.playWarningTick();
            sim.warningTickCooldown = 0.22;
          }

          if (atk.elapsedInPhase >= atk.lockDurationSec) {
            atk.phase = 'diving';
            atk.elapsedInPhase = 0;
            snakeEscapeAudio.playDive();
          }
          activeAttacks.push(atk);
        } else if (atk.phase === 'diving') {
          if (atk.elapsedInPhase >= atk.diveDurationSec) {
            atk.phase = 'impact';
            atk.elapsedInPhase = 0;

            // Check impact collision with any part of the snake
            const hitSnake =
              sim.burrowActiveSec <= 0 &&
              isSnakeInsideCircle(sim.segments, 9, atk.x, atk.y, atk.radius);

            if (hitSnake) {
              if (sim.invulnerableSec <= 0) {
                sim.lives -= 1;
                sim.invulnerableSec = INVULNERABLE_DURATION_SEC;
                sim.shakeTimerSec =
                  settings.screenShake && !settings.reducedMotion ? 0.35 : 0;
                setLives(sim.lives);
                snakeEscapeAudio.playHit();
                sim.callouts.push({
                  id: `hit-${Date.now()}`,
                  text: `${profile.displayName.toUpperCase()} STRIKE! -1 HEART`,
                  x: atk.x,
                  y: atk.y - 18,
                  color: '#f43f5e',
                  ttl: 1.2,
                });

                if (sim.lives <= 0) {
                  finishGameRun();
                  return;
                }
              }
            } else if (atk.wasInsideDuringLock && !atk.nearMissAwarded) {
              // Escaped a locked circle right before impact -> Near-miss +25 pts!
              atk.nearMissAwarded = true;
              sim.score += 25;
              sim.nearMisses += 1;
              sim.callouts.push({
                id: `nearmiss-${Date.now()}-${sim.rng()}`,
                text: 'NEAR MISS! +25',
                x: atk.x,
                y: atk.y - 16,
                color: '#38bdf8',
                ttl: 1.0,
              });
            }
          }
          activeAttacks.push(atk);
        } else if (atk.phase === 'impact') {
          if (atk.elapsedInPhase < 0.32) {
            activeAttacks.push(atk);
          }
        }
      }
      sim.attacks = activeAttacks;

      // Update floating callouts
      sim.callouts = sim.callouts
        .map((c) => ({ ...c, y: c.y - 24 * dt, ttl: c.ttl - dt }))
        .filter((c) => c.ttl > 0);

      // Sync React HUD state every 6 frames (~10 times/sec)
      hudSyncCounter++;
      if (hudSyncCounter % 6 === 0) {
        setScore(sim.score);
        setMiceEaten(sim.miceEaten);
        setNearMisses(sim.nearMisses);
        setElapsedSec(sim.elapsedSec);
        setBurrowCooldownLeft(sim.burrowCooldownSec);
        setIsBurrowed(sim.burrowActiveSec > 0);
        setSpeedBoostLeft(sim.speedBoostSec);
        setInGrassState(inTallGrass);
      }
    };

    const renderArena = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const sim = simRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetPx = ARENA_SIZE * dpr;
      if (canvas.width !== targetPx || canvas.height !== targetPx) {
        canvas.width = targetPx;
        canvas.height = targetPx;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Optional screen shake on impact
      if (sim.shakeTimerSec > 0 && settings.screenShake && !settings.reducedMotion) {
        const mag = 6 * (sim.shakeTimerSec / 0.35);
        ctx.translate((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2);
      }

      // 1. Meadow Background
      const isLight = settings.theme === 'light';
      ctx.fillStyle = isLight ? '#d1fae5' : '#052e24';
      ctx.fillRect(0, 0, ARENA_SIZE, ARENA_SIZE);

      // Subtle field grid lines
      ctx.strokeStyle = isLight ? 'rgba(4, 120, 87, 0.12)' : 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1;
      for (let pos = 80; pos < ARENA_SIZE; pos += 80) {
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, ARENA_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(ARENA_SIZE, pos);
        ctx.stroke();
      }

      // 2. Tall Grass Patches (slows bird tracking to 1.0s)
      for (const patch of sim.layout.grassPatches) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(patch.x, patch.y, patch.radius, 0, Math.PI * 2);
        ctx.fillStyle = isLight
          ? 'rgba(16, 185, 129, 0.25)'
          : 'rgba(5, 150, 105, 0.28)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = isLight ? '#059669' : '#10b981';
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw grass blades
        ctx.strokeStyle = isLight ? '#047857' : '#34d399';
        ctx.lineWidth = 2.2;
        for (let b = -2; b <= 2; b++) {
          const bx = patch.x + b * 16;
          const by = patch.y + (b % 2 === 0 ? 8 : -8);
          ctx.beginPath();
          ctx.moveTo(bx, by + 10);
          ctx.quadraticCurveTo(bx - 5, by - 4, bx - 2, by - 12);
          ctx.moveTo(bx, by + 10);
          ctx.quadraticCurveTo(bx + 5, by - 4, bx + 3, by - 11);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. Solid Obstacles (Rocks & Fallen Logs)
      for (const obs of sim.layout.obstacles) {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        if (obs.kind === 'rock') {
          ctx.beginPath();
          ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#475569';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#1e293b';
          ctx.stroke();

          // Rock highlight facet
          ctx.beginPath();
          ctx.arc(-obs.radius * 0.25, -obs.radius * 0.25, obs.radius * 0.45, 0, Math.PI * 2);
          ctx.fillStyle = '#64748b';
          ctx.fill();
        } else {
          ctx.rotate(obs.angle || 0);
          const w = obs.width || 68;
          const h = obs.height || 26;
          ctx.fillStyle = '#78350f';
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(-w / 2, -h / 2, w, h, 10);
          ctx.fill();
          ctx.stroke();

          // Bark grain lines
          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-w * 0.3, -4);
          ctx.lineTo(w * 0.3, -4);
          ctx.moveTo(-w * 0.2, 5);
          ctx.lineTo(w * 0.25, 5);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. Field Mice, Golden Mice, and Nest Eggs
      for (const m of sim.mice) {
        ctx.save();
        ctx.translate(m.x, m.y);
        if (m.kind === 'egg') {
          // Rare Nest Egg (restores 1 heart)
          ctx.beginPath();
          ctx.ellipse(0, 0, 11, 14, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#fef3c7';
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#f59e0b';
          ctx.stroke();
          // Heart icon on egg
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(-3, -2, 3, 0, Math.PI * 2);
          ctx.arc(3, -2, 3, 0, Math.PI * 2);
          ctx.moveTo(-6, -1);
          ctx.lineTo(0, 6);
          ctx.lineTo(6, -1);
          ctx.fill();
        } else {
          const angle = Math.atan2(m.vy, m.vx);
          ctx.rotate(angle);
          const isGold = m.kind === 'golden';

          // Tail
          ctx.strokeStyle = isGold ? '#f59e0b' : '#f472b6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-10, 0);
          ctx.quadraticCurveTo(-18, 5, -22, -2);
          ctx.stroke();

          // Mouse body
          ctx.fillStyle = isGold ? '#fbbf24' : '#cbd5e1';
          ctx.strokeStyle = isGold ? '#b45309' : '#475569';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, 11, 7.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Ears
          ctx.fillStyle = isGold ? '#fde68a' : '#f9a8d4';
          ctx.beginPath();
          ctx.arc(4, -6, 3.5, 0, Math.PI * 2);
          ctx.arc(4, 6, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Eyes
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(7, -2.5, 1.4, 0, Math.PI * 2);
          ctx.arc(7, 2.5, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 5. Snake Continuous Body Trail
      const skinDef =
        SNAKE_ESCAPE_SKINS.find((s) => s.id === records.selectedSkin) ||
        SNAKE_ESCAPE_SKINS[0];

      ctx.save();
      if (sim.burrowActiveSec > 0) {
        // Underground burrow ripple indicator
        const head = sim.segments[0];
        if (head) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(head.x, head.y, 22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.globalAlpha = 0.28;
      } else if (sim.invulnerableSec > 0) {
        // Flash during brief 1.5s invulnerability
        ctx.globalAlpha = Math.floor(sim.invulnerableSec * 10) % 2 === 0 ? 0.45 : 0.95;
      }

      // Draw segments from tail to head
      for (let i = sim.segments.length - 1; i >= 0; i--) {
        const seg = sim.segments[i];
        const t = i / Math.max(1, sim.segments.length - 1);
        const segRadius = i === 0 ? 13 : Math.max(5.5, 11.5 * (1 - t * 0.48));

        ctx.beginPath();
        ctx.arc(seg.x, seg.y, segRadius, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? skinDef.primaryColor : skinDef.secondaryColor;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.65)';
        ctx.stroke();

        // Draw head eyes & forked tongue
        if (i === 0) {
          ctx.save();
          ctx.translate(seg.x, seg.y);
          ctx.rotate(sim.headingAngle);

          // Forked tongue
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(12, 0);
          ctx.lineTo(20, 0);
          ctx.lineTo(24, -4);
          ctx.moveTo(20, 0);
          ctx.lineTo(24, 4);
          ctx.stroke();

          // Eyes
          ctx.fillStyle = skinDef.eyeColor;
          ctx.beginPath();
          ctx.arc(5, -5.5, 2.8, 0, Math.PI * 2);
          ctx.arc(5, 5.5, 2.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.arc(6, -5.5, 1.3, 0, Math.PI * 2);
          ctx.arc(6, 5.5, 1.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();

      // 6. Night Wave Darkness Overlay (from wave 7 when Barn Owl is active or odd night waves)
      const isNightWave =
        sim.wave >= 7 &&
        (sim.wave % 2 === 1 || sim.attacks.some((a) => a.birdType === 'owl'));
      if (isNightWave) {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.56)';
        ctx.fillRect(0, 0, ARENA_SIZE, ARENA_SIZE);
      }

      // 7. Bird of Prey Shadows, Lock Rings, and Diving Raptors
      const highContrast = settings.highContrastWarnings;
      for (const atk of sim.attacks) {
        const profile = BIRD_OF_PREY_PROFILES[atk.birdType];
        ctx.save();

        // Ground shadow circle
        ctx.beginPath();
        ctx.arc(atk.x, atk.y, atk.radius, 0, Math.PI * 2);
        ctx.fillStyle = highContrast
          ? 'rgba(250, 204, 21, 0.22)'
          : 'rgba(2, 6, 23, 0.42)';
        ctx.fill();

        if (atk.phase === 'tracking') {
          const trackProg = Math.min(1, atk.elapsedInPhase / atk.trackingLimitSec);
          ctx.lineWidth = highContrast ? 4 : 2.5;
          ctx.setLineDash([8, 6]);
          ctx.strokeStyle = highContrast ? '#facc15' : '#fbbf24';
          ctx.stroke();
          ctx.setLineDash([]);

          // Inner shrinking crosshair
          ctx.beginPath();
          ctx.arc(
            atk.x,
            atk.y,
            atk.radius * (1 - trackProg * 0.5),
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (atk.phase === 'locked') {
          const lockProg = Math.min(1, atk.elapsedInPhase / atk.lockDurationSec);

          if (profile.isNightPulse) {
            // Barn Owl: warning ring shown as a pulse
            const pulseAlpha = 0.25 + 0.75 * Math.abs(Math.sin(lockProg * Math.PI * 3));
            ctx.lineWidth = highContrast ? 6 : 4;
            ctx.strokeStyle = highContrast
              ? `rgba(250, 204, 21, ${pulseAlpha})`
              : `rgba(244, 63, 94, ${pulseAlpha})`;
            ctx.stroke();
          } else {
            // Standard filling warning ring
            ctx.lineWidth = highContrast ? 6 : 4.5;
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(
              atk.x,
              atk.y,
              atk.radius,
              -Math.PI / 2,
              -Math.PI / 2 + lockProg * Math.PI * 2
            );
            ctx.strokeStyle = highContrast ? '#ffffff' : '#f43f5e';
            ctx.lineWidth = highContrast ? 7 : 5;
            ctx.stroke();
          }
        } else if (atk.phase === 'diving') {
          const diveProg = Math.min(1, atk.elapsedInPhase / atk.diveDurationSec);
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#ef4444';
          ctx.stroke();

          // Draw swooping bird silhouette from arena edge to strike center
          const bx = atk.startEdgeX + (atk.x - atk.startEdgeX) * diveProg;
          const by = atk.startEdgeY + (atk.y - atk.startEdgeY) * diveProg;
          const diveAngle = Math.atan2(atk.y - atk.startEdgeY, atk.x - atk.startEdgeX);

          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(diveAngle);
          ctx.fillStyle = highContrast ? '#facc15' : '#0f172a';
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(22, 0);
          ctx.lineTo(-14, -34);
          ctx.lineTo(-6, 0);
          ctx.lineTo(-14, 34);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        } else if (atk.phase === 'impact') {
          const impProg = Math.min(1, atk.elapsedInPhase / 0.32);
          ctx.lineWidth = 4 * (1 - impProg);
          ctx.strokeStyle = `rgba(244, 63, 94, ${1 - impProg})`;
          ctx.stroke();

          // Talon slash marks
          ctx.strokeStyle = `rgba(254, 202, 202, ${1 - impProg})`;
          ctx.lineWidth = 3;
          for (let s = -1; s <= 1; s++) {
            ctx.beginPath();
            ctx.moveTo(atk.x - 18, atk.y + s * 12 - 14);
            ctx.lineTo(atk.x + 18, atk.y + s * 12 + 14);
            ctx.stroke();
          }
        }

        // Bird label badge on shadow edge
        ctx.fillStyle = highContrast ? '#facc15' : '#f8fafc';
        ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(profile.displayName.toUpperCase(), atk.x, atk.y - atk.radius - 6);

        ctx.restore();
      }

      // 8. Circling Bird Silhouettes along Screen Edge
      const patrolAngle = sim.elapsedSec * 0.45;
      const patrolX = ARENA_SIZE / 2 + Math.cos(patrolAngle) * (ARENA_SIZE * 0.45);
      const patrolY = ARENA_SIZE / 2 + Math.sin(patrolAngle) * (ARENA_SIZE * 0.45);
      ctx.save();
      ctx.translate(patrolX, patrolY);
      ctx.rotate(patrolAngle + Math.PI / 2);
      ctx.fillStyle = 'rgba(2, 6, 23, 0.35)';
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(-10, -24);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-10, 24);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 9. Floating Callouts (+10, NEAR MISS +25, WAVE +100)
      for (const c of sim.callouts) {
        ctx.save();
        ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = c.color;
        ctx.shadowColor = 'rgba(2, 6, 23, 0.9)';
        ctx.shadowBlur = 4;
        ctx.fillText(c.text, c.x, c.y);
        ctx.restore();
      }

      ctx.restore();
    };

    const loop = (now: number) => {
      const frameTime = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      accumulator += frameTime;

      while (accumulator >= FIXED_DT) {
        stepSimulation(FIXED_DT);
        accumulator -= FIXED_DT;
      }

      renderArena();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [screen, finishGameRun, records.selectedSkin, settings]);

  // Canvas pointer/touch steering handlers
  const updateCanvasPointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = ARENA_SIZE / rect.width;
    const scaleY = ARENA_SIZE / rect.height;
    simRef.current.pointerTarget = {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Virtual Joystick Touch Handlers
  const handleJoystickMove = (clientX: number, clientY: number) => {
    const base = joystickBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    const maxR = 34;
    const clampedDist = Math.min(dist, maxR);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;
    setJoystickKnob({ x: kx, y: ky });
    simRef.current.joystickVector = { dx: kx, dy: ky };
  };

  const resetJoystick = () => {
    setJoystickKnob({ x: 0, y: 0 });
    simRef.current.joystickVector = null;
  };

  const formatTime = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${String(rem).padStart(2, '0')}`;
  };

  const selectedSkinObj =
    SNAKE_ESCAPE_SKINS.find((s) => s.id === records.selectedSkin) ||
    SNAKE_ESCAPE_SKINS[0];

  const modeBest = records.byMode[mode]?.bestScore || 0;

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center select-none ${
        settings.theme === 'light'
          ? 'rb-light-theme bg-emerald-50 text-emerald-950'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* MAIN GAME CONTAINER */}
      <div className="w-full max-w-5xl px-3 sm:px-6 py-4 flex flex-col items-center">
        {/* TOP HEADER BAR */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 bg-slate-900/90 border border-emerald-500/20 rounded-2xl px-4 py-2.5 shadow-lg">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                simRef.current.active = false;
                setScreen('title');
              }}
              className="flex items-center gap-2 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <EscapeSkinSvg skinId={records.selectedSkin} size={28} />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  Snake Escape
                </h1>
                <p className="text-[11px] text-emerald-400 font-medium">
                  ReptileBirds Arena Survival
                </p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setScreen('skins')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                screen === 'skins'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skins & Birds</span>
            </button>

            <button
              onClick={() => setScreen('records')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                screen === 'records'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>My Records</span>
            </button>

            <button
              onClick={() => setShowHowToPlay(true)}
              aria-label="How to Play"
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
              aria-label={settings.soundEnabled ? 'Mute sound' : 'Unmute sound'}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              aria-label="Settings"
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1. TITLE & MODE SELECTION SCREEN                          */}
        {/* ========================================================= */}
        {screen === 'title' && (
          <div className="w-full bg-slate-900/90 border border-emerald-500/25 rounded-3xl p-5 sm:p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>TOP-DOWN RAPTOR EVASION ARENA</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
              Slither, Hunt Mice &amp; Dodge Diving Raptors
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mb-6">
              Guide your{' '}
              <span className="text-emerald-300 font-semibold">
                {selectedSkinObj.species}
              </span>{' '}
              through the field. Watch for tracking bird shadows from above, hide in
              tall grass to slow lock-ons, or press{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-sky-300">
                Space
              </kbd>{' '}
              to burrow underground!
            </p>

            {/* MODE CARDS */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
              {(
                [
                  {
                    id: 'survival',
                    title: 'Survival Mode',
                    subtitle: 'Endless 30s Waves',
                    desc: 'Survive escalating raptor waves with Hawks, Peregrine Falcons, Bald Eagles & night Barn Owls.',
                    badge: `Best: ${records.byMode.survival.bestScore} pts (Wave ${records.byMode.survival.bestWave})`,
                    icon: Flame,
                  },
                  {
                    id: 'timed',
                    title: 'Timed Hunt',
                    subtitle: '3-Minute Score Attack',
                    desc: '3 minutes on the clock! Hunt mice, golden mice & chain near-miss dodges (+25 pts) for maximum score.',
                    badge: `Best: ${records.byMode.timed.bestScore} pts`,
                    icon: Zap,
                  },
                  {
                    id: 'daily',
                    title: 'Daily Challenge',
                    subtitle: `Seed: ${todayDateStr}`,
                    desc: 'Identical field layout, obstacle positions & raptor wave schedule for all players today.',
                    badge: records.dailyByDate[todayDateStr]
                      ? `Today's Best: ${records.dailyByDate[todayDateStr].score} pts`
                      : `Streak: ${records.dailyStreak} day${records.dailyStreak === 1 ? '' : 's'}`,
                    icon: Calendar,
                  },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      active
                        ? 'bg-emerald-950/80 border-emerald-400 shadow-lg shadow-emerald-950/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          {m.subtitle}
                        </span>
                        <Icon
                          className={`w-4 h-4 ${
                            active ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        />
                      </div>
                      <h3 className="text-lg font-extrabold text-white mb-1">
                        {m.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {m.desc}
                      </p>
                    </div>
                    <div className="text-[11px] font-bold text-amber-300 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 w-fit">
                      {m.badge}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ACTIVE SKIN & START CTA */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                onClick={() => startNewGame(mode)}
                className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-transform active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>
                  Start{' '}
                  {mode === 'survival'
                    ? 'Survival'
                    : mode === 'timed'
                    ? 'Timed Hunt'
                    : 'Daily Challenge'}
                </span>
              </button>

              <button
                onClick={() => setScreen('skins')}
                className="px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <EscapeSkinSvg skinId={records.selectedSkin} size={24} />
                <span>Skin: {selectedSkinObj.species}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. ACTIVE ARENA GAMEPLAY SCREEN                           */}
        {/* ========================================================= */}
        {screen === 'playing' && (
          <div className="w-full flex flex-col items-center">
            {/* COMPACT HUD BAR */}
            <div className="w-full max-w-[680px] grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2.5 bg-slate-900/95 border border-emerald-500/30 rounded-2xl p-2.5 shadow-md">
              {/* Hearts / Lives */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-950/70 border border-slate-800">
                {[1, 2, 3].map((h) => (
                  <Heart
                    key={h}
                    className={`w-4 h-4 transition-transform ${
                      h <= lives
                        ? 'text-rose-500 fill-rose-500 scale-100'
                        : 'text-slate-700 scale-90'
                    }`}
                  />
                ))}
                {inGrassState && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    GRASS
                  </span>
                )}
              </div>

              {/* Score & Best */}
              <div className="flex flex-col justify-center px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Score (Best {Math.max(score, modeBest)})
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-400">
                  {score.toLocaleString()}
                </span>
              </div>

              {/* Wave & Mice */}
              <div className="flex flex-col justify-center px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Wave · Mice
                </span>
                <span className="text-sm font-extrabold text-amber-300">
                  W{wave} · {miceEaten} 🐁
                </span>
              </div>

              {/* Timer */}
              <div className="flex flex-col justify-center px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  {mode === 'timed' ? 'Time Left' : 'Survived'}
                </span>
                <span className="text-sm font-extrabold text-sky-300">
                  {mode === 'timed'
                    ? formatTime(TIMED_HUNT_DURATION_SEC - elapsedSec)
                    : formatTime(elapsedSec)}
                </span>
              </div>

              {/* Burrow Button + Pause */}
              <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1.5">
                <button
                  onClick={triggerBurrow}
                  disabled={burrowCooldownLeft > 0 || isBurrowed}
                  className={`flex-1 sm:flex-initial px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    isBurrowed
                      ? 'bg-sky-500 text-slate-950 border-sky-300'
                      : burrowCooldownLeft <= 0
                      ? 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border-sky-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>
                    {isBurrowed
                      ? 'Burrowed!'
                      : burrowCooldownLeft <= 0
                      ? 'Burrow'
                      : `${burrowCooldownLeft.toFixed(1)}s`}
                  </span>
                </button>

                <button
                  onClick={() => {
                    simRef.current.paused = !simRef.current.paused;
                    setIsPaused(simRef.current.paused);
                  }}
                  aria-label="Pause Game"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                >
                  {isPaused ? (
                    <Play className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* ARENA CANVAS WRAPPER (800x800 logical, responsive square) */}
            <div className="relative w-full max-w-[min(92vw,640px)] aspect-square rounded-3xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl bg-slate-950">
              <canvas
                ref={canvasRef}
                onPointerDown={(e) => {
                  updateCanvasPointer(e.clientX, e.clientY);
                }}
                onPointerMove={(e) => {
                  if (e.buttons > 0 || e.pointerType === 'mouse') {
                    updateCanvasPointer(e.clientX, e.clientY);
                  }
                }}
                className="w-full h-full block touch-none cursor-crosshair"
              />

              {/* NON-BLOCKING WAVE BANNER */}
              {waveBanner && (
                <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-slate-950/90 border border-amber-400/50 text-amber-300 font-black text-sm sm:text-base shadow-lg">
                  {waveBanner}
                </div>
              )}

              {/* NON-BLOCKING BIRD OF PREY INTRO TOAST */}
              {birdToast && (
                <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-slate-950/90 border border-rose-500/40 text-rose-200 font-bold text-xs sm:text-sm shadow-lg text-center max-w-[90%]">
                  {birdToast}
                </div>
              )}

              {/* SPEED BOOST BADGE */}
              {speedBoostLeft > 0 && (
                <div className="pointer-events-none absolute top-4 right-4 px-3 py-1 rounded-xl bg-amber-500/90 text-slate-950 font-black text-xs shadow">
                  ⚡ SPEED {speedBoostLeft.toFixed(1)}s
                </div>
              )}

              {/* ON-SCREEN VIRTUAL JOYSTICK (when enabled in settings) */}
              {settings.virtualJoystick && !isPaused && (
                <div
                  ref={joystickBaseRef}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    handleJoystickMove(e.clientX, e.clientY);
                  }}
                  onPointerMove={(e) => {
                    if (e.buttons > 0) {
                      e.stopPropagation();
                      handleJoystickMove(e.clientX, e.clientY);
                    }
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    resetJoystick();
                  }}
                  onPointerCancel={resetJoystick}
                  className="absolute bottom-5 left-5 w-24 h-24 rounded-full bg-slate-950/65 border-2 border-emerald-400/40 flex items-center justify-center touch-none"
                >
                  <div
                    style={{
                      transform: `translate(${joystickKnob.x}px, ${joystickKnob.y}px)`,
                    }}
                    className="w-10 h-10 rounded-full bg-emerald-400/80 border border-white shadow-md pointer-events-none"
                  />
                </div>
              )}

              {/* PAUSE OVERLAY */}
              {isPaused && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                  <h3 className="text-2xl font-black text-white mb-2">
                    Game Paused
                  </h3>
                  <p className="text-xs text-slate-300 mb-6 max-w-xs">
                    Steer with your pointer/finger, WASD, or arrow keys. Press Space
                    to burrow underground for 2s before a raptor strikes!
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        simRef.current.paused = false;
                        setIsPaused(false);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Resume</span>
                    </button>
                    <button
                      onClick={() => startNewGame(mode)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm flex items-center gap-2 border border-slate-700 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restart</span>
                    </button>
                    <button
                      onClick={() => {
                        simRef.current.active = false;
                        setScreen('title');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-sm border border-slate-800 cursor-pointer"
                    >
                      Main Menu
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CONTROLS FOOTER HINT */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
              <span>🖱️ Pointer / Touch Steer</span>
              <span>•</span>
              <span>⌨️ WASD / Arrows</span>
              <span>•</span>
              <span>🕳️ Space = Burrow (2s invulnerable, 10s cooldown)</span>
              <span>•</span>
              <button
                onClick={() =>
                  updateSetting('virtualJoystick', !settings.virtualJoystick)
                }
                className="text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                {settings.virtualJoystick
                  ? 'Hide Virtual Joystick'
                  : 'Show Virtual Joystick'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. GAME OVER SUMMARY SCREEN                               */}
        {/* ========================================================= */}
        {screen === 'gameover' && (
          <div className="w-full max-w-xl bg-slate-900/95 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
            {isNewBest && (
              <div className="mb-3 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black tracking-wide uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>New Personal Best!</span>
              </div>
            )}

            <h2 className="text-3xl font-black text-white mb-1">
              {mode === 'timed' && elapsedSec >= TIMED_HUNT_DURATION_SEC
                ? '3-Minute Hunt Complete!'
                : 'Caught by Raptors!'}
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              {mode === 'daily'
                ? `Daily Challenge (${todayDateStr})`
                : mode === 'timed'
                ? 'Timed Hunt (3 Minutes)'
                : 'Endless Survival'}
            </p>

            {/* STATS GRID */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  Final Score
                </div>
                <div className="text-xl font-black text-emerald-400">
                  {score.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  Wave Reached
                </div>
                <div className="text-xl font-black text-amber-300">
                  Wave {wave}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  Mice Eaten
                </div>
                <div className="text-xl font-black text-white">{miceEaten}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  Near Misses
                </div>
                <div className="text-xl font-black text-sky-400">
                  {nearMisses}
                </div>
              </div>
            </div>

            {/* NEWLY UNLOCKED SKINS ALERT */}
            {newlyUnlockedSkins.length > 0 && (
              <div className="w-full mb-5 p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-400/50 text-left flex items-center gap-3">
                <EscapeSkinSvg skinId={newlyUnlockedSkins[0].id} size={42} />
                <div>
                  <div className="text-xs font-extrabold text-emerald-300 uppercase">
                    New Snake Skin Unlocked!
                  </div>
                  <div className="text-sm font-bold text-white">
                    {newlyUnlockedSkins.map((s) => s.species).join(', ')}
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              <button
                onClick={() => startNewGame(mode)}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Result</span>
              </button>

              <button
                onClick={() => setScreen('title')}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 cursor-pointer"
              >
                Mode Select
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. SNAKE SKINS & BIRD OF PREY BESTIARY SCREEN             */}
        {/* ========================================================= */}
        {screen === 'skins' && (
          <div className="w-full bg-slate-900/95 border border-emerald-500/25 rounded-3xl p-5 sm:p-7 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Unlockable Snake Skins &amp; Bird Bestiary
                </h2>
                <p className="text-xs text-slate-300">
                  Total Mice Eaten Across All Runs:{' '}
                  <span className="text-emerald-400 font-extrabold">
                    {records.totalMiceEaten} mice
                  </span>
                </p>
              </div>
              <button
                onClick={() => setScreen('title')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer"
              >
                Back to Game
              </button>
            </div>

            {/* 6 SNAKE SKINS */}
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-400 mb-3">
              6 Snake Species Skins
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-8">
              {SNAKE_ESCAPE_SKINS.map((skin) => {
                const unlocked = records.totalMiceEaten >= skin.unlockMice;
                const isSelected = records.selectedSkin === skin.id;
                const verifiedFact = getVerifiedSpeciesFact(skin.species);

                return (
                  <div
                    key={skin.id}
                    onClick={() => unlocked && selectSkin(skin.id)}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      unlocked ? 'cursor-pointer' : 'opacity-75'
                    } ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-400 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                          <EscapeSkinSvg skinId={skin.id} size={40} />
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
                        <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 mb-2">
                          {verifiedFact.fact}{' '}
                          {verifiedFact.source && (
                            <span className="text-slate-400">
                              ({verifiedFact.source})
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-bold">
                      {unlocked ? (
                        <span
                          className={
                            isSelected ? 'text-emerald-400' : 'text-slate-300'
                          }
                        >
                          {isSelected ? '✓ Equipped' : 'Click to Equip'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Lock className="w-3.5 h-3.5" />
                          <span>
                            Unlock at {skin.unlockMice} mice (
                            {Math.max(0, skin.unlockMice - records.totalMiceEaten)}{' '}
                            more)
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4 BIRDS OF PREY BESTIARY */}
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 mb-3">
              4 Aerial Predators (Birds of Prey)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(
                Object.values(
                  BIRD_OF_PREY_PROFILES
                ) as typeof BIRD_OF_PREY_PROFILES[BirdOfPreyType][]
              ).map((bird) => {
                const verifiedFact = getVerifiedSpeciesFact(bird.speciesKey);
                return (
                  <div
                    key={bird.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      <BirdOfPreySvg birdType={bird.id} size={46} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-sm">
                          {bird.speciesKey}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          From Wave {bird.minWave}
                        </span>
                      </div>
                      <div className="text-xs italic text-slate-400 mb-1.5">
                        {bird.scientificName}
                      </div>
                      <div className="text-xs text-slate-300">
                        Track: {bird.baseTrackingSec}s · Lock: {bird.baseLockSec}s ·
                        Radius: {bird.radius}px
                        {bird.isNightPulse ? ' · Night Pulse Ring' : ''}
                      </div>
                      {verifiedFact && (
                        <p className="mt-2 text-xs text-emerald-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
                          {verifiedFact.fact}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. MY RECORDS & AUTOMATED SELF-TEST SCREEN                */}
        {/* ========================================================= */}
        {screen === 'records' && (
          <div className="w-full bg-slate-900/95 border border-emerald-500/25 rounded-3xl p-5 sm:p-7 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  My Snake Escape Records
                </h2>
                <p className="text-xs text-amber-300 font-semibold">
                  Scores and unlocked skins are saved on this device only
                  (localStorage).
                </p>
              </div>
              <button
                onClick={() => setScreen('title')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer"
              >
                Back to Game
              </button>
            </div>

            {/* LIFETIME TOTALS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  Total Mice Eaten
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  {records.totalMiceEaten}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  Total Games
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
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  Longest Survival
                </div>
                <div className="text-2xl font-black text-sky-400">
                  {formatTime(records.byMode.survival.longestSurvivalSec)}
                </div>
              </div>
            </div>

            {/* PER-MODE BESTS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {(['survival', 'timed', 'daily'] as const).map((m) => {
                const rec = records.byMode[m];
                return (
                  <div
                    key={m}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800"
                  >
                    <div className="text-xs font-extrabold uppercase text-emerald-400 mb-1">
                      {m === 'survival'
                        ? 'Survival Mode'
                        : m === 'timed'
                        ? 'Timed Hunt (3m)'
                        : 'Daily Challenge'}
                    </div>
                    <div className="text-lg font-black text-white">
                      Best Score: {rec.bestScore.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">
                      Highest Wave: Wave {rec.bestWave} · Best Time:{' '}
                      {formatTime(rec.longestSurvivalSec)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RESET & SELF-TEST CONTROLS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelfTestStatus(runSnakeEscapeSelfTest())}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Arena Connectivity &amp; Daily Seed</span>
                </button>
              </div>

              {!confirmResetRecords ? (
                <button
                  onClick={() => setConfirmResetRecords(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset My Records</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-300 font-bold">
                    Erase all local scores?
                  </span>
                  <button
                    onClick={() => {
                      const fresh = resetSnakeEscapeRecords();
                      setRecords(fresh);
                      setConfirmResetRecords(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setConfirmResetRecords(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {selfTestStatus && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs text-emerald-300">
                {selfTestStatus.passed
                  ? `✓ Self-Test Passed (${selfTestStatus.testedCount} arena BFS connectivity & seeded daily checks verified with 0 traps).`
                  : `✗ Failures: ${selfTestStatus.failures.join(', ')}`}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* HOW TO PLAY MODAL                                         */}
        {/* ========================================================= */}
        {showHowToPlay && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white">
                  How to Play Snake Escape
                </h3>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <p>
                  <strong>1. Smooth Steering:</strong> Guide your snake with your
                  mouse/finger, <kbd className="px-1.5 py-0.5 rounded bg-slate-800">WASD</kbd>{' '}
                  / Arrow keys, or toggle the on-screen Virtual Joystick.
                </p>
                <p>
                  <strong>2. Raptor Shadow Warnings:</strong> Birds of prey circle
                  overhead. Their ground shadow tracks you for <strong>1.5s</strong>,
                  locks in place for <strong>0.6s</strong> as the warning ring fills,
                  and then dives! If any segment of your snake is inside the circle at
                  impact, you lose 1 heart.
                </p>
                <p>
                  <strong>3. Tall Grass &amp; Burrow:</strong> Hiding inside green
                  tall grass patches slows all attackers&apos; tracking time down to{' '}
                  <strong>1.0s</strong>. Press{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800">Space</kbd> or
                  tap <strong>Burrow</strong> to dive underground for 2 seconds
                  (10-second cooldown).
                </p>
                <p>
                  <strong>4. Scoring &amp; Near-Misses:</strong> Mouse ={' '}
                  <strong>+10 pts</strong>, Golden Mouse = <strong>+30 pts</strong> +
                  4s speed boost, Wave Survived = <strong>+100 pts</strong>, and
                  escaping a locked strike circle right before impact awards a{' '}
                  <strong>+25 pt Near-Miss bonus</strong>!
                </p>
              </div>

              <button
                onClick={() => setShowHowToPlay(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm cursor-pointer"
              >
                Got It!
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SETTINGS & ACCESSIBILITY MODAL                            */}
        {/* ========================================================= */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white">
                  Game &amp; Accessibility Settings
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  {
                    key: 'soundEnabled' as const,
                    label: 'Synthesized Sound Effects',
                    desc: 'Eat, warning ticks, raptor dives, and wave fanfare',
                  },
                  {
                    key: 'virtualJoystick' as const,
                    label: 'On-Screen Virtual Joystick',
                    desc: 'Show touch thumbstick in the bottom-left corner',
                  },
                  {
                    key: 'highContrastWarnings' as const,
                    label: 'High-Contrast Warning Rings',
                    desc: 'Bright yellow/white raptor strike outlines for visibility',
                  },
                  {
                    key: 'easyMode' as const,
                    label: 'Easy Mode (-30% Attacker Speed)',
                    desc: 'Slows bird tracking speed and extends lock-on warnings',
                  },
                  {
                    key: 'screenShake' as const,
                    label: 'Impact Screen Shake',
                    desc: 'Brief camera shake when hit by a diving bird',
                  },
                  {
                    key: 'reducedMotion' as const,
                    label: 'Reduced Motion',
                    desc: 'Disables screen shake and intense pulsing effects',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800 cursor-pointer"
                  >
                    <div className="pr-3">
                      <div className="font-bold text-white text-xs sm:text-sm">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={(e) => updateSetting(item.key, e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </label>
                ))}

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <span className="font-bold text-white text-xs sm:text-sm">
                    Arena Theme
                  </span>
                  <button
                    onClick={() =>
                      updateSetting(
                        'theme',
                        settings.theme === 'dark' ? 'light' : 'dark'
                      )
                    }
                    className="px-3 py-1 rounded-xl bg-slate-800 text-emerald-300 text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    {settings.theme === 'dark' ? 'Dark Jungle' : 'Daylight Meadow'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm cursor-pointer"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        )}

        {/* SHAREABLE SCORE CARD MODAL */}
        <EscapeShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          mode={mode}
          score={score}
          wave={wave}
          miceEaten={miceEaten}
          survivalSec={elapsedSec}
          skinId={records.selectedSkin}
          dailyDate={mode === 'daily' ? todayDateStr : undefined}
        />

        {/* ========================================================= */}
        {/* SEO & EDUCATIONAL SECTION BELOW THE GAME                  */}
        {/* ========================================================= */}
        <section className="w-full mt-10 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-300 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <span>How to Play Snake Escape</span>
            </h2>
            <p className="text-sm leading-relaxed">
              <strong>Snake Escape</strong> is a fast-paced 2D top-down survival
              game where you control a slithering snake foraging for field mice while
              evading aerial birds of prey. Move smoothly across the 800×800 meadow
              using your mouse cursor, touch finger, keyboard (WASD or Arrow keys),
              or the optional on-screen virtual joystick. Every mouse you catch adds{' '}
              <strong>+10 points</strong> and extends your snake&apos;s trail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-extrabold text-emerald-400 mb-2 flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>Meet the Birds of Prey</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  • <strong>Red-tailed Hawk (Wave 1+):</strong> Standard patrol
                  raptor with a 1.5-second tracking shadow and 0.6-second lock ring.
                </li>
                <li>
                  • <strong>Peregrine Falcon (Wave 3+):</strong> High-speed hunter
                  with rapid tracking and a tight, 0.4-second lock-on circle.
                </li>
                <li>
                  • <strong>Bald Eagle (Wave 5+):</strong> Commands a massive strike
                  zone circle that requires early evasion or a timely burrow.
                </li>
                <li>
                  • <strong>Barn Owl (Wave 7+ Night Waves):</strong> Hunts under
                  darkness with a wide shadow and a pulsing warning ring.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-amber-400 mb-2">
                Survival Tips &amp; Power-Ups
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  • <strong>Use Tall Grass Patches:</strong> Remaining inside tall
                  grass reduces every raptor&apos;s tracking duration to just 1
                  second, forcing them to lock early.
                </li>
                <li>
                  • <strong>Time Your Burrow (Space):</strong> Diving underground
                  makes you completely immune to strikes for 2 seconds. Save it for
                  overlapping Bald Eagle or Falcon lock-ons!
                </li>
                <li>
                  • <strong>Master the Near-Miss (+25 pts):</strong> Bait a raptor
                  into locking onto your position, then slither out of the circle
                  just before impact for bonus points.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
