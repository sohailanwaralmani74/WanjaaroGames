import React from 'react';
import { GameProps } from './ReflexGames';
import {
  ReactionTimeGame,
  SpeedFlashGame,
  HexWhackGame,
  DodgeVectorGame,
  SoundReflexGame,
  ChromaSnapGame,
  StoplightPrecisionGame,
  TriggerTapGame,
} from './ReflexGames';
import {
  PrecisionSniperGame,
  OrbitSyncGame,
  LaserMirrorGame,
  BullseyeDropGame,
  SteadyHandGame,
  DartFlickGame,
  NeedleThreaderGame,
  GravitySlingGame,
} from './AimGames';
import {
  SimonChimeGame,
  CardPairsGame,
  SpatialSpanGame,
  DigitSpanGame,
  PaletteRecallGame,
  PathEchoGame,
  MissingObjectGame,
  NBackGame,
} from './MemoryGames';
import {
  SpeedWordsGame,
  FallingLettersGame,
  AnagramRushGame,
  ReverseTypistGame,
  AlphabetSprintGame,
  SyntaxStrikerGame,
  WordChainGame,
  PangramSpeedGame,
} from './TypingGames';
import {
  OddColorGame,
  DotCounterGame,
  StroopTestGame,
  CamouflageGlyphGame,
  SizeIllusionGame,
  AngleEstimatorGame,
  ShadowMatchGame,
  CoherentMotionGame,
} from './PerceptionGames';
import {
  LightsOutGame,
  Sliding8Game,
  TowerHanoiGame,
  WaterJugGame,
  BinaryByteGame,
  PipesFlowGame,
  MiniSokobanGame,
  KnightsTourGame,
} from './LogicGames';
import {
  TicTacToeGame,
  ConnectFourGame,
  NimMatchesGame,
  ReversiMiniGame,
  RPSMasterGame,
  DotsBoxesGame,
  HexConquerGame,
  ChessMatePuzzleGame,
} from './StrategyGames';
import {
  MetronomeTapGame,
  DualHandSyncGame,
  GyroBalanceGame,
  OrbitHopperGame,
  SpiralTracerGame,
  WaveSyncGame,
  AeroPulseGame,
  TwoFingerCrossGame,
} from './CoordinationGames';
import {
  Schulte25Game,
  CPSClickerGame,
  ArrowRushGame,
  BinSortGame,
  BubblePopGame,
  CoinCatcherGame,
  ButtonMashGame,
  SameCheckGame,
} from './SpeedGames';
import {
  MentalMathSprintGame,
  Make24Game,
  MultiplyBlitzGame,
  PrimeDetectiveGame,
  MissingOperatorGame,
  FractionPieGame,
  SequenceNextGame,
  SumTargetGame,
} from './MathGames';
import {
  ShapeRotateGame,
  SymmetryPainterGame,
  TangledLinesGame,
  MazePathfinderGame,
  SpectrumSorterGame,
  TangramFitGame,
  PerimeterGuessGame,
  MirrorCoordGame,
} from './VisualGames';
import {
  RetroSnakeGame,
  BrickBreakerGame,
  SoloPongGame,
  SpaceAsteroidsGame,
  VerticalBouncerGame,
  MiniPinballGame,
  PachinkoDropGame,
  CoinPusherGame,
  SlotReelsGame,
  BubbleCannonGame,
  JewelBlitzGame,
  MiniGolfGame,
} from './CasualGames';

interface GameDispatcherProps extends GameProps {
  gameId: string;
}

export function GameDispatcher({ gameId, onFinish }: GameDispatcherProps) {
  switch (gameId) {
    // 1-8 Reflex & Reaction
    case 'reflex-reaction-time':
      return <ReactionTimeGame onFinish={onFinish} />;
    case 'reflex-speed-flash':
      return <SpeedFlashGame onFinish={onFinish} />;
    case 'reflex-whack-hex':
    case 'reflex-hex-whack':
      return <HexWhackGame onFinish={onFinish} />;
    case 'reflex-dodge-ball':
    case 'reflex-dodge-vector':
      return <DodgeVectorGame onFinish={onFinish} />;
    case 'reflex-audio-snap':
    case 'reflex-sound-cue':
      return <SoundReflexGame onFinish={onFinish} />;
    case 'reflex-color-switch':
    case 'reflex-chroma-snap':
      return <ChromaSnapGame onFinish={onFinish} />;
    case 'reflex-quick-brake':
    case 'reflex-stoplight':
      return <StoplightPrecisionGame onFinish={onFinish} />;
    case 'reflex-trigger-finger':
    case 'reflex-trigger-tap':
      return <TriggerTapGame onFinish={onFinish} />;

    // 9-16 Aim & Precision
    case 'aim-sniper':
      return <PrecisionSniperGame onFinish={onFinish} />;
    case 'aim-orbit-tap':
      return <OrbitSyncGame onFinish={onFinish} />;
    case 'aim-laser-line':
      return <LaserMirrorGame onFinish={onFinish} />;
    case 'aim-bullseye-drop':
      return <BullseyeDropGame onFinish={onFinish} />;
    case 'aim-micro-hover':
      return <SteadyHandGame onFinish={onFinish} />;
    case 'aim-dart-throw':
      return <DartFlickGame onFinish={onFinish} />;
    case 'aim-needle-threader':
      return <NeedleThreaderGame onFinish={onFinish} />;
    case 'aim-gravity-sling':
      return <GravitySlingGame onFinish={onFinish} />;

    // 17-24 Memory & Recall
    case 'memory-simon-sequence':
      return <SimonChimeGame onFinish={onFinish} />;
    case 'memory-card-pairs':
      return <CardPairsGame onFinish={onFinish} />;
    case 'memory-spatial-span':
      return <SpatialSpanGame onFinish={onFinish} />;
    case 'memory-number-span':
      return <DigitSpanGame onFinish={onFinish} />;
    case 'memory-color-order':
      return <PaletteRecallGame onFinish={onFinish} />;
    case 'memory-path-memorizer':
      return <PathEchoGame onFinish={onFinish} />;
    case 'memory-icon-stash':
      return <MissingObjectGame onFinish={onFinish} />;
    case 'memory-dual-nback':
      return <NBackGame onFinish={onFinish} />;

    // 25-32 Typing & Words
    case 'typing-speed-words':
      return <SpeedWordsGame onFinish={onFinish} />;
    case 'typing-falling-letters':
      return <FallingLettersGame onFinish={onFinish} />;
    case 'typing-anagram-rush':
      return <AnagramRushGame onFinish={onFinish} />;
    case 'typing-reverse-echo':
      return <ReverseTypistGame onFinish={onFinish} />;
    case 'typing-alphabet-sprint':
      return <AlphabetSprintGame onFinish={onFinish} />;
    case 'typing-code-symbols':
      return <SyntaxStrikerGame onFinish={onFinish} />;
    case 'typing-word-chain':
      return <WordChainGame onFinish={onFinish} />;
    case 'typing-pangram-hunt':
      return <PangramSpeedGame onFinish={onFinish} />;

    // 33-40 Perception & Vision
    case 'perception-odd-color':
      return <OddColorGame onFinish={onFinish} />;
    case 'perception-dot-counter':
      return <DotCounterGame onFinish={onFinish} />;
    case 'perception-stroop-test':
      return <StroopTestGame onFinish={onFinish} />;
    case 'perception-hidden-symbol':
      return <CamouflageGlyphGame onFinish={onFinish} />;
    case 'perception-size-illusion':
      return <SizeIllusionGame onFinish={onFinish} />;
    case 'perception-angle-guess':
      return <AngleEstimatorGame onFinish={onFinish} />;
    case 'perception-shadow-match':
      return <ShadowMatchGame onFinish={onFinish} />;
    case 'perception-motion-detect':
      return <CoherentMotionGame onFinish={onFinish} />;

    // 41-48 Logic & Puzzles
    case 'logic-lights-out':
      return <LightsOutGame onFinish={onFinish} />;
    case 'logic-sliding-15':
    case 'logic-sliding-8':
      return <Sliding8Game onFinish={onFinish} />;
    case 'logic-tower-hanoi':
      return <TowerHanoiGame onFinish={onFinish} />;
    case 'logic-water-pour':
    case 'logic-water-jugs':
      return <WaterJugGame onFinish={onFinish} />;
    case 'logic-binary-flip':
    case 'logic-binary-byte':
      return <BinaryByteGame onFinish={onFinish} />;
    case 'logic-pipes-connect':
    case 'logic-pipes-flow':
      return <PipesFlowGame onFinish={onFinish} />;
    case 'logic-mini-sokoban':
      return <MiniSokobanGame onFinish={onFinish} />;
    case 'logic-knights-tour':
      return <KnightsTourGame onFinish={onFinish} />;

    // 49-56 Strategy & Tactics
    case 'strategy-tic-tac-toe':
    case 'strategy-tictactoe':
      return <TicTacToeGame onFinish={onFinish} />;
    case 'strategy-connect-four':
      return <ConnectFourGame onFinish={onFinish} />;
    case 'strategy-nim-matches':
      return <NimMatchesGame onFinish={onFinish} />;
    case 'strategy-reversi-mini':
      return <ReversiMiniGame onFinish={onFinish} />;
    case 'strategy-rock-paper-scissors':
      return <RPSMasterGame onFinish={onFinish} />;
    case 'strategy-dots-boxes':
      return <DotsBoxesGame onFinish={onFinish} />;
    case 'strategy-hex-conquer':
      return <HexConquerGame onFinish={onFinish} />;
    case 'strategy-mini-chess-puzzle':
    case 'strategy-chess-puzzle':
      return <ChessMatePuzzleGame onFinish={onFinish} />;

    // 57-64 Coordination & Rhythm
    case 'coord-rhythm-tap':
    case 'coord-metronome-sync':
      return <MetronomeTapGame onFinish={onFinish} />;
    case 'coord-dual-hand-sync':
    case 'coord-dual-runner':
      return <DualHandSyncGame onFinish={onFinish} />;
    case 'coord-ball-balance':
    case 'coord-gyro-balance':
      return <GyroBalanceGame onFinish={onFinish} />;
    case 'coord-orbit-jumper':
    case 'coord-orbit-hopper':
      return <OrbitHopperGame onFinish={onFinish} />;
    case 'coord-spiral-tracer':
      return <SpiralTracerGame onFinish={onFinish} />;
    case 'coord-wave-sync':
      return <WaveSyncGame onFinish={onFinish} />;
    case 'coord-flappy-dot':
    case 'coord-aero-pulse':
      return <AeroPulseGame onFinish={onFinish} />;
    case 'coord-two-finger-cross':
      return <TwoFingerCrossGame onFinish={onFinish} />;

    // 65-72 Speed & Accuracy
    case 'speed-click-25':
    case 'speed-schulte-25':
      return <Schulte25Game onFinish={onFinish} />;
    case 'speed-clicker-10s':
    case 'speed-cps-clicker':
      return <CPSClickerGame onFinish={onFinish} />;
    case 'speed-swipe-rush':
    case 'speed-arrow-rush':
      return <ArrowRushGame onFinish={onFinish} />;
    case 'speed-quick-sort':
    case 'speed-color-bins':
      return <BinSortGame onFinish={onFinish} />;
    case 'speed-bubble-pop':
      return <BubblePopGame onFinish={onFinish} />;
    case 'speed-coin-catcher':
      return <CoinCatcherGame onFinish={onFinish} />;
    case 'speed-button-mash':
      return <ButtonMashGame onFinish={onFinish} />;
    case 'speed-match-pair':
    case 'speed-same-different':
      return <SameCheckGame onFinish={onFinish} />;

    // 73-80 Math & Calculation
    case 'math-speed-addition':
    case 'math-rapid-arithmetic':
      return <MentalMathSprintGame onFinish={onFinish} />;
    case 'math-24-solver':
    case 'math-make-24':
      return <Make24Game onFinish={onFinish} />;
    case 'math-multiply-blitz':
    case 'math-multiplication-rush':
      return <MultiplyBlitzGame onFinish={onFinish} />;
    case 'math-prime-or-composite':
      return <PrimeDetectiveGame onFinish={onFinish} />;
    case 'math-missing-operator':
      return <MissingOperatorGame onFinish={onFinish} />;
    case 'math-fraction-slice':
    case 'math-fraction-slices':
      return <FractionPieGame onFinish={onFinish} />;
    case 'math-number-sequence':
    case 'math-sequence-extrapolator':
      return <SequenceNextGame onFinish={onFinish} />;
    case 'math-sum-target':
    case 'math-sum-matrix':
      return <SumTargetGame onFinish={onFinish} />;

    // 81-88 Visual & Geometry
    case 'visual-shape-rotate':
    case 'visual-shape-rotation':
      return <ShapeRotateGame onFinish={onFinish} />;
    case 'visual-symmetry-match':
    case 'visual-symmetry-painter':
      return <SymmetryPainterGame onFinish={onFinish} />;
    case 'visual-tangled-lines':
      return <TangledLinesGame onFinish={onFinish} />;
    case 'visual-maze-runner':
    case 'visual-maze-path':
      return <MazePathfinderGame onFinish={onFinish} />;
    case 'visual-color-harmony':
    case 'visual-spectrum-sorter':
      return <SpectrumSorterGame onFinish={onFinish} />;
    case 'visual-tangram-fit':
      return <TangramFitGame onFinish={onFinish} />;
    case 'visual-perimeter-guess':
    case 'visual-perimeter-compare':
      return <PerimeterGuessGame onFinish={onFinish} />;
    case 'visual-mirror-reflection':
    case 'visual-mirror-coordinate':
      return <MirrorCoordGame onFinish={onFinish} />;

    // 89-100 Casual & Arcade
    case 'casual-snake-classic':
    case 'casual-retro-snake':
      return <RetroSnakeGame onFinish={onFinish} />;
    case 'casual-brick-breaker':
      return <BrickBreakerGame onFinish={onFinish} />;
    case 'casual-pong-solo':
    case 'casual-solo-pong':
      return <SoloPongGame onFinish={onFinish} />;
    case 'casual-space-dodge':
    case 'casual-space-asteroids':
      return <SpaceAsteroidsGame onFinish={onFinish} />;
    case 'casual-jump-tower':
    case 'casual-vertical-bouncer':
      return <VerticalBouncerGame onFinish={onFinish} />;
    case 'casual-pinball-bounce':
    case 'casual-mini-pinball':
      return <MiniPinballGame onFinish={onFinish} />;
    case 'casual-pachinko-drop':
      return <PachinkoDropGame onFinish={onFinish} />;
    case 'casual-coin-pusher':
      return <CoinPusherGame onFinish={onFinish} />;
    case 'casual-slot-spinner':
    case 'casual-slot-reels':
      return <SlotReelsGame onFinish={onFinish} />;
    case 'casual-bubble-cannon':
      return <BubbleCannonGame onFinish={onFinish} />;
    case 'casual-match-three':
    case 'casual-jewel-blitz':
      return <JewelBlitzGame onFinish={onFinish} />;
    case 'casual-golf-putt':
    case 'casual-mini-golf':
      return <MiniGolfGame onFinish={onFinish} />;

    default:
      return (
        <div className="p-8 text-center text-neutral-400">
          <p>Game engine initializing...</p>
        </div>
      );
  }
}
