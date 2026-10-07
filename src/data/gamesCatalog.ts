import { CategoryInfo, GameMeta, BaseGameMeta } from '../types/game';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'casual-arcade',
    name: 'Board & Family Classics',
    shortDesc: 'Classic 100% client-side board games with fair cryptographic dice.',
    description:
      'Play traditional board games online in your browser with zero accounts and local personal records.',
    iconName: 'Gamepad2',
    gameCount: 1,
  },
];

export const ALL_GAMES: GameMeta[] = [
  {
    id: 'snake-and-ladder',
    title: 'Snake and Ladder',
    category: 'casual-arcade',
    summary:
      'Play Snake and Ladder (Snakes and Ladders) online free on a 10x10 jungle board with 8 climbing vines, 8 real snake species, and 4 modes.',
    description:
      'Experience the classic 10x10 Snake and Ladder board game at reptilebirds.com. Choose from 4 original SVG bird tokens (Parrot, Owl, Eagle, Penguin) and play Solo Race, Daily Board, Vs Computer, or Local Pass-and-Play Multiplayer.',
    instructions:
      'Roll the six-sided die using touch, mouse, or Space/Enter. Climb green vines from bottom to top, avoid snake heads that slide you down to their tails, and land on square 100 with an exact roll.',
    mechanic: '10x10 boustrophedon board with cryptographic dice and seeded daily boards',
    controls: 'all',
    skillsTested: ['Probability', 'Turn Strategy', 'Pattern Recognition'],
    difficulty: 'Easy',
    scoringUnit: 'turns',
    scoringCriterion: 'lower',
    tags: ['snake and ladder', 'snakes and ladders', 'board game', 'dice game', 'daily board'],
    objective:
      'Reach square 100 in the fewest turns possible by climbing jungle vines and avoiding reptile snake heads.',
    whatItMeasures:
      'Tracks total turns taken to reach square 100, longest vine climb, and total snake bites per match.',
    tips: [
      'Enable Bonus Roll on 6 to chain extra turns, but remember three consecutive 6s cancel the third bonus roll.',
      'Play the Daily Board mode to compete on a deterministic date-seeded layout identical for all players that day.',
      'Near square 100, remember you need an exact die roll to land on 100—overshooting keeps your bird token on its current square.',
    ],
    faq: [
      {
        question: 'What is the difference between Snake and Ladder and Snakes and Ladders?',
        answer:
          'Both titles refer to the exact same traditional 10x10 numbered board game from ancient India where players climb ladders and slide down snakes on the path to square 100.',
      },
      {
        question: 'How is the Daily Board generated?',
        answer:
          'Daily Board mode uses the current date (YYYY-MM-DD) as a deterministic seed to place 8 ladders and 8 snakes obeying all placement rules.',
      },
      {
        question: 'Are my Snake and Ladder scores private?',
        answer:
          'Yes, all personal best turn records and game counts are stored only on your device in localStorage and never leave your browser.',
      },
    ],
    benchmark: {
      metric: 'Turns to Reach Square 100',
      average: '28 turns',
      elite: '14 turns',
      source: 'Markov Chain Exact-100 Snakes and Ladders Distribution',
    },
  },
];

export const GAMES_CATALOG: (BaseGameMeta & Partial<GameMeta>)[] = ALL_GAMES;
