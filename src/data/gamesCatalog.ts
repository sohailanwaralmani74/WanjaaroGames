import { CategoryInfo, GameMeta, BaseGameMeta } from '../types/game';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'casual-arcade',
    name: 'Reptile & Bird Arcade Classics',
    shortDesc: '100% client-side reptile and bird games with local personal records.',
    description:
      'Play original reptile and bird browser games on ReptileBirds with zero accounts and local high scores.',
    iconName: 'Gamepad2',
    gameCount: 5,
  },
];

export const ALL_GAMES: GameMeta[] = [
  {
    id: 'parrot-flap',
    title: 'Parrot Flap',
    category: 'casual-arcade',
    summary:
      'Play Parrot Flap online free on ReptileBirds. Tap to fly a Scarlet Macaw through sandstone canyon pillars, collect feathers, unlock 5 SVG birds, and earn Platinum medals.',
    description:
      'An original one-tap bird game set in a multi-layered sandstone canyon with a 25-point day/night cycle. Includes Classic, Chill, and Daily Challenge modes plus 5 unlockable bird species skins.',
    instructions:
      'Tap, click, or press Space / Arrow Up to flap upward against gravity. Fly cleanly through sandstone pillar gaps (+1 pt) and collect floating canyon feathers (+2 pts).',
    mechanic: 'Fixed-timestep one-tap vertical flight with reachability-bounded sandstone canyon pillars',
    controls: 'all',
    skillsTested: ['Rhythm Timing', 'Vertical Trajectory Control', 'Precision Reflexes'],
    difficulty: 'Medium',
    scoringUnit: 'points',
    scoringCriterion: 'higher',
    tags: ['parrot flap', 'tap to fly game', 'bird game', 'one-tap game', 'daily challenge'],
    objective:
      'Fly through sandstone canyon pillar gaps and collect floating feathers to achieve the highest score and unlock all 5 bird skins.',
    whatItMeasures:
      'Measures tap-impulse timing, vertical velocity estimation, and sustained focus.',
    tips: [
      'Use small, rhythmic taps just below the center of the next sandstone opening so your upward impulse never clips the top ledge.',
      'Collect floating feathers inside gaps (+2 points each) to unlock Common Kingfisher, Barn Owl, Ruby-throated Hummingbird, and Indian Peafowl.',
      'Try Chill Mode (220px wide gaps and safe ceiling) or toggle Assist Mode (+20% wider gaps) in Settings to practice.',
    ],
    faq: [
      {
        question: 'How does the reachability check work in this tap to fly game?',
        answer:
          'Every sandstone pillar gap is mathematically bounded relative to the previous gap under the 1500 px/s² gravity and -480 px/s flap impulse constants so every course is 100% passable.',
      },
      {
        question: 'What are the 3 modes in Parrot Flap?',
        answer:
          'Classic (standard 170px to 130px narrowing gaps), Chill (wider 220px gaps, slower speed, and no ceiling game over), and Daily Challenge (date-seeded YYYY-MM-DD course identical for everyone that day).',
      },
      {
        question: 'What medals can I earn in Parrot Flap?',
        answer:
          'You earn Bronze at 10 points, Silver at 25 points, Gold at 50 points, and Platinum at 100 points.',
      },
    ],
    benchmark: {
      metric: 'Classic Canyon Score',
      average: '18 pts',
      elite: '65 pts',
      source: 'ReptileBirds One-Tap Canyon Flight Distribution',
    },
  },
  {
    id: 'snake-escape',
    title: 'Snake Escape',
    category: 'casual-arcade',
    summary:
      'Play Snake Escape online free on ReptileBirds. Slither through an 800x800 field eating mice while dodging diving Hawks, Peregrine Falcons, Bald Eagles, and Barn Owls.',
    description:
      'Control a continuous-trail snake foraging for mice in a top-down meadow arena while birds of prey hunt from above. Use tall grass patches to slow raptor tracking, burrow underground with Space, and unlock 6 real snake skins.',
    instructions:
      'Steer with pointer/touch, WASD, Arrow keys, or the virtual joystick. Escape circular bird shadows before the 0.6s lock ring fills and impacts, or press Space to burrow underground for 2 seconds.',
    mechanic: 'Continuous 2D top-down arena evasion with multi-phase raptor lock-on and burrow cooldowns',
    controls: 'all',
    skillsTested: ['Spatial Evasion', 'Cooldown Timing', 'Threat Prioritization'],
    difficulty: 'Medium',
    scoringUnit: 'points',
    scoringCriterion: 'higher',
    tags: ['snake escape', 'bird of prey game', 'snake survival', 'daily challenge', 'arcade'],
    objective:
      'Eat field mice and golden mice, survive 30-second waves of diving raptors, and chain +25 point near-miss dodges before losing all 3 hearts.',
    whatItMeasures:
      'Measures real-time trajectory control, peripheral threat tracking, and defensive cooldown timing.',
    tips: [
      'Duck into green tall grass patches to cut every bird of prey’s tracking phase down to 1.0 second.',
      'Leave a locked strike ring right before the bird dives to earn a +25 point Near-Miss bonus.',
      'Save your 2-second Burrow (Space) for overlapping Bald Eagle or night-wave Barn Owl lock-ons.',
    ],
    faq: [
      {
        question: 'How do Bird of Prey attacks work in Snake Escape?',
        answer:
          'Each raptor casts a circular ground shadow that tracks your snake for up to 1.5 seconds, locks in place for 0.6 seconds as the warning ring fills (0.4s for Peregrine Falcons), and then dives. If any segment of your snake is inside the circle at impact, you lose a heart.',
      },
      {
        question: 'What are the 4 Birds of Prey in Snake Escape?',
        answer:
          'Red-tailed Hawk (Wave 1, standard dive), Peregrine Falcon (Wave 3, fast tracking & 0.4s lock), Bald Eagle (Wave 5, massive strike circle), and Barn Owl (Wave 7 night waves, darkened field & pulsing warning ring).',
      },
      {
        question: 'How do I unlock the 6 Snake Escape skins?',
        answer:
          'Skins unlock automatically by cumulative mice eaten across all modes: Ball Python (0), Green Tree Python (50), Corn Snake (150), King Cobra (300), Garter Snake (600), and Emerald Boa (1,000).',
      },
    ],
    benchmark: {
      metric: 'Survival Mode Score',
      average: '650 pts',
      elite: '2,200 pts',
      source: 'ReptileBirds Arena Survival Distribution',
    },
  },
  {
    id: 'matching-card-game',
    title: 'Matching Card Game',
    category: 'casual-arcade',
    summary:
      'Play Matching Card Game (Memory Match) online free on ReptileBirds. Flip cards to match pairs of 9 birds and 9 reptiles across Easy, Medium, Hard, and Expert grids.',
    description:
      'Flip cards to find matching pairs of 18 real bird and reptile species drawn with original SVG art. Includes Classic, Timed, Daily Challenge, and Two-Player pass-and-play modes.',
    instructions:
      'Click, tap, or use Arrow keys + Enter/Space to flip two cards per turn. Matching pairs stay face-up and build your combo streak; non-matching pairs flip back after 900 ms.',
    mechanic: 'Grid memory pair matching with seeded daily boards and streak combo multipliers',
    controls: 'all',
    skillsTested: ['Visual Memory', 'Spatial Recall', 'Pattern Recognition'],
    difficulty: 'Medium',
    scoringUnit: 'points',
    scoringCriterion: 'higher',
    tags: ['matching card game', 'memory game', 'concentration', 'find the pairs', 'daily challenge'],
    objective:
      'Match all bird and reptile card pairs in the fewest moves and fastest time while chaining consecutive match combos.',
    whatItMeasures:
      'Measures short-term spatial recall, pair location retention, and move efficiency.',
    tips: [
      'Chain consecutive matches without a miss to earn up to +300 combo bonus points per pair.',
      'Earn a 3-star rating by finishing the board in moves less than or equal to 1.5 times the number of pairs.',
      'Play Daily Challenge mode to compete on a date-seeded 4x4 Medium board identical for every player that day.',
    ],
    faq: [
      {
        question: 'What is the difference between Matching Card Game, Memory Game, and Concentration?',
        answer:
          'All three names refer to the classic pair-matching card game where players flip two face-down cards per turn to recall and match identical pairs.',
      },
      {
        question: 'How are stars and combo points calculated in Matching Card Game?',
        answer:
          'Each match awards 100 base points plus +50 per consecutive streak step (up to +300). Finishing in <= 1.5x pairs moves earns 3 stars; <= 2.5x pairs earns 2 stars.',
      },
      {
        question: 'How does the Daily Challenge work?',
        answer:
          'Daily Challenge uses today’s date (YYYY-MM-DD) as a deterministic seed to pick 8 balanced bird and reptile pairs on a 4x4 grid so everyone plays the exact same layout.',
      },
    ],
    benchmark: {
      metric: 'Medium 4x4 Score',
      average: '950 pts',
      elite: '1,850 pts',
      source: 'ReptileBirds Memory Match Standard Distribution',
    },
  },
  {
    id: 'snake-game',
    title: 'Snake Game',
    category: 'casual-arcade',
    summary:
      'Play Snake Game online free on ReptileBirds. Hunt mice across 15x15, 20x20, or 25x25 grids, unlock 6 real snake species skins, and master Classic, Wrap-Around, Jungle, and Daily Challenge modes.',
    description:
      'Guide a real-species-inspired python hunting mice on a customizable grid. Features a 2-turn input buffer, bonus golden eggs, speed multipliers up to x3, and 6 unlockable SVG snake skins.',
    instructions:
      'Steer your snake with Arrow keys, WASD, touch swipes, or the on-screen D-pad. Eat mice (+10 pts × speed multiplier) and bonus golden eggs (+50 pts) while avoiding walls, obstacles, and your own body.',
    mechanic: 'Fixed-timestep grid pursuit with BFS-verified obstacle generation and seeded daily runs',
    controls: 'all',
    skillsTested: ['Spatial Planning', 'Reaction Speed', 'Pathfinding'],
    difficulty: 'Medium',
    scoringUnit: 'points',
    scoringCriterion: 'higher',
    tags: ['snake game', 'python game', 'classic snake', 'daily challenge', 'arcade'],
    objective:
      'Grow the longest snake and achieve the highest score by hunting mice and bonus eggs without colliding with walls, obstacles, or your own tail.',
    whatItMeasures:
      'Measures spatial path planning, turn timing under increasing tick speeds, and obstacle avoidance.',
    tips: [
      'Use rapid double-key inputs freely—the 2-input direction queue guarantees fast corner turns are never dropped.',
      'Watch the shrinking timer ring on the bonus golden egg that spawns every 5 mice for an instant +50 point boost.',
      'In Jungle mode, keep near the outer perimeter lanes as obstacle density rises with each level.',
    ],
    faq: [
      {
        question: 'What are the 4 modes in Snake Game on ReptileBirds?',
        answer:
          'You can play Classic (deadly walls), Wrap-Around (pass through borders to the opposite side), Jungle (rocks and logs that scale with level), and Daily Challenge (deterministic date-seeded run).',
      },
      {
        question: 'How do I unlock the 6 snake skins?',
        answer:
          'Skins unlock automatically based on cumulative mice eaten across all runs: Ball Python (0), Green Tree Python (50), Corn Snake (150), King Cobra (300), Garter Snake (600), and Emerald Boa (1,000).',
      },
      {
        question: 'Can Jungle obstacles ever trap my snake or block food?',
        answer:
          'No. Every obstacle layout and food spawn is verified with a Breadth-First Search reachability check so no dead-end pockets or unreachable mice ever occur.',
      },
    ],
    benchmark: {
      metric: 'Classic 20x20 Score',
      average: '240 pts',
      elite: '850 pts',
      source: 'ReptileBirds Standard Grid Arcade Distribution',
    },
  },
  {
    id: 'snake-and-ladder',
    title: 'Snake and Ladder',
    category: 'casual-arcade',
    summary:
      'Play Snake and Ladder (Snakes and Ladders) online free on a 10x10 jungle board with 8 climbing vines, 8 real snake species, and 4 modes.',
    description:
      'Experience the classic 10x10 Snake and Ladder board game on ReptileBirds. Choose from 4 original SVG bird tokens (Parrot, Owl, Eagle, Penguin) and play Solo Race, Daily Board, Vs Computer, or Local Pass-and-Play Multiplayer.',
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
