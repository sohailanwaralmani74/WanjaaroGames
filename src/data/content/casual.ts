import { GameExtraContent } from './types';

export const CASUAL_CONTENT: Record<string, GameExtraContent> = {
  'casual-snake-classic': {
    objective: 'Guide your growing snake to eat food pellets across the grid without colliding with the perimeter walls or your own tail.',
    whatItMeasures: 'This retro arcade game measures directional grid navigation and spatial space management. It evaluates how you coil your snake efficiently to avoid trapping yourself as body length increases.',
    tips: [
      'Travel in continuous zigzag patterns along board edges rather than darting across the center.',
      'Never chase food into a dead-end corridor formed by your own tail coils.',
      'Leave open escape lanes leading toward the center of the grid for emergency turns.',
      'Plan your next two turns before collecting each food pellet to avoid sudden wall crashes.',
    ],
    faq: [
      {
        question: 'Does the snake speed up as it eats more food?',
        answer: 'Yes, movement velocity increases incrementally every five food pellets, requiring faster directional turns.',
      },
      {
        question: 'What controls are supported in Retro Snake Arcade?',
        answer: 'You can steer using keyboard arrow keys, WASD, or on-screen directional swipe pads on touchscreens.',
      },
      {
        question: 'What is the maximum achievable score?',
        answer: 'A perfect score fills the entire grid with snake body segments, achieving maximum theoretical length.',
      },
    ],
  },

  'casual-brick-breaker': {
    objective: 'Deflect the bouncing ball with your paddle to smash all colored bricks on screen while keeping the ball in play.',
    whatItMeasures: 'This arcade physics game measures paddle angle control and ball rebound anticipation. It tests your ability to aim ball deflections based on where the ball strikes your paddle surface.',
    tips: [
      'Hit the ball near the outer edges of your paddle to produce sharp, high-angle ricochet shots.',
      'Strike near the paddle center to return a safe, predictable vertical rebound.',
      'Tunnel the ball behind the top brick layer to let it ricochet repeatedly against the ceiling.',
      'Catch falling power-ups like multi-ball and wide paddle, but steer clear of speed-boost hazards.',
    ],
    faq: [
      {
        question: 'How do paddle hit zones affect ball trajectory in Paddle Brick Buster?',
        answer: 'The paddle is divided into five reflection zones: edge strikes create steep 60° angles, while center strikes reflect vertically.',
      },
      {
        question: 'How many lives do you start with?',
        answer: 'You begin with three paddle lives; losing all lives ends the run, while clearing all bricks advances to the next stage.',
      },
      {
        question: 'Can you control the paddle with both mouse and keyboard?',
        answer: 'Yes, mouse dragging provides smooth analog tracking, while Left/Right arrow keys offer consistent digital stepping.',
      },
    ],
  },

  'casual-pong-solo': {
    objective: 'Rally a high-speed ball against rebounding walls using your moving paddle to sustain the longest unbroken rally.',
    whatItMeasures: 'This arcade game measures reactive deflection tracking and continuous hand-eye coordination. It benchmarks your defensive consistency as ball velocity steadily ramps up.',
    tips: [
      'Position your paddle near the center of the baseline between rallies to minimize transit distance.',
      'Keep your eyes on the ball at all times, especially during fast rebounds off side walls.',
      'Use smooth, controlled movements; rushing your paddle across the screen leads to overshooting.',
      'Adjust your position before the ball crosses the mid-line to lock in your deflection angle early.',
    ],
    faq: [
      {
        question: 'Does the ball accelerate as the rally continues?',
        answer: 'Yes, ball speed increases by two percent on every successful paddle deflection, testing your reflexes at high speeds.',
      },
      {
        question: 'What happens if the ball passes your paddle baseline?',
        answer: 'A missed ball ends the active rally and records your consecutive deflection count as your session score.',
      },
      {
        question: 'Is Solo Pong Rally played with mouse or touch?',
        answer: 'Both inputs are supported: pointer dragging on desktop and vertical thumb sliding on mobile devices.',
      },
    ],
  },

  'casual-space-dodge': {
    objective: 'Pilot your starship through a dense oncoming asteroid field, dodging space rocks and gathering cosmic fuel pods.',
    whatItMeasures: 'This space arcade game measures 2D evasion control and hazard trajectory prediction. It records your survival duration under increasing obstacle density and velocity.',
    tips: [
      'Stay near the vertical center of the arena rather than hugging screen borders where you can be cornered.',
      'Watch for warning flash indicators along screen edges signaling incoming high-speed meteorites.',
      'Gather golden shield orbs to gain temporary collision invulnerability.',
      'Make small vertical adjustments to slide between parallel asteroid trajectories.',
    ],
    faq: [
      {
        question: 'Do asteroids break apart when destroyed?',
        answer: 'Large asteroids shatter into two smaller, faster fragments when blasted with collected plasma torpedoes.',
      },
      {
        question: 'How is your score calculated in Asteroid Field Navigator?',
        answer: 'Your score combines total survival time in seconds with bonus points earned from collected energy fuel cells.',
      },
      {
        question: 'Can you shoot asteroids or only dodge them?',
        answer: 'Core gameplay focuses on evasive steering, with temporary plasma blaster power-ups available in later waves.',
      },
    ],
  },

  'casual-jump-tower': {
    objective: 'Bounce upward through a vertical tower of shifting platforms to climb as high as possible without falling.',
    whatItMeasures: 'This platformer measures vertical jump timing and moving landing precision. It benchmarks your ability to coordinate jumping cadence with laterally sliding platforms.',
    tips: [
      'Time your jumps so you land on platforms as they move toward you, giving you the widest landing window.',
      'Avoid jumping toward platform edges where slight timing variances can cause you to slip off.',
      'Land on spring pads to launch your bouncer multiple stories upward in a single leap.',
      'Watch out for crumbling cracked platforms that break away one second after initial landing.',
    ],
    faq: [
      {
        question: 'What causes a game over in Vertical Platform Bouncer?',
        answer: 'Falling off the bottom of the screen below the active ascending camera ends the climbing run.',
      },
      {
        question: 'Do platforms slide at different speeds?',
        answer: 'Higher tower floors introduce faster moving platforms, disappearing platforms, and bouncy spring pads.',
      },
      {
        question: 'How do you control your bouncer mid-air?',
        answer: 'Use Left/Right arrow keys, A/D, or horizontal screen tilt/touch dragging to steer your bouncer during flight.',
      },
    ],
  },

  'casual-pinball-bounce': {
    objective: 'Operate twin flippers to keep the steel pinball bouncing between bumpers, target banks, and multiplier ramps.',
    whatItMeasures: 'This arcade simulator measures flipper trigger timing and ball trajectory deflection. It tests your reflexes in trapping, cradling, and aiming high-velocity pinball rebounds.',
    tips: [
      'Do not flip both flippers simultaneously; activate only the flipper closest to the descending ball.',
      'Practice cradling: hold the flipper raised to bring the ball to a complete stop before aiming for ramps.',
      'Aim for lit target ramps and bumper clusters to build high combo multipliers before draining.',
      'Use gentle table nudges to deflect balls that are rolling down straight out-lane drains.',
    ],
    faq: [
      {
        question: 'How do you control the left and right flippers?',
        answer: 'On desktop, use the Left and Right Shift keys (or A and L keys); on touchscreens, tap the left and right sides of the screen.',
      },
      {
        question: 'Can the pinball table tilt if nudged too aggressively?',
        answer: 'Yes, three rapid consecutive nudges will trigger a "TILT" penalty, disabling flipper controls for that ball.',
      },
      {
        question: 'How many balls do you get per game?',
        answer: 'Standard arcade games give you three balls, with an extra ball awarded upon achieving major target milestones.',
      },
    ],
  },

  'casual-pachinko-drop': {
    objective: 'Launch metallic balls into a dense field of brass pegs, aiming for high-multiplier jackpot cups at the bottom.',
    whatItMeasures: 'This physics simulator measures launch velocity modulation and probability scatter forecasting. It evaluates your judgment of release trajectories through complex deflection peg fields.',
    tips: [
      'Vary your launch plunger power to find sweet spots that steer balls toward central jackpot chutes.',
      'Launch balls in rapid bursts so colliding balls nudge each other into high-scoring lateral pockets.',
      'Target rotating tulip gates that open up to capture multiple balls simultaneously.',
      'Observe peg bounce patterns to identify reliable entry corridors into high-multiplier buckets.',
    ],
    faq: [
      {
        question: 'How does the launch plunger power gauge work?',
        answer: 'Hold and pull down the launch plunger or spacebar to charge spring tension, then release to launch the ball upward.',
      },
      {
        question: 'What happens when a ball enters a jackpot cup?',
        answer: 'Entering a jackpot cup triggers a celebratory chime and dispenses 10 to 25 bonus balls into your active hopper.',
      },
      {
        question: 'How many starting balls do you receive in Pachinko Peg Drop?',
        answer: 'You start with 50 balls in your tray, with the session continuing as long as you maintain a positive ball balance.',
      },
    ],
  },

  'casual-coin-pusher': {
    objective: 'Drop shiny coins onto the sliding upper deck to push accumulating heaps of coins and prize tokens off the edge.',
    whatItMeasures: 'This arcade physics simulator measures timing drops against sliding ledge cycles and mass momentum management. It tests your strategy in building coin piles without spilling into side gutters.',
    tips: [
      'Drop your coins when the sliding shelf is fully extended backward to maximize forward pushing leverage.',
      'Target clusters with loose coins teetering over the front edge rather than dropping into empty spaces.',
      'Avoid creating coin "cliffs" (bridged overlaps) that absorb pushes without advancing forward.',
      'Aim for heavy prize bars and gem tokens that push large clusters of loose silver off the shelf.',
    ],
    faq: [
      {
        question: 'Do coins that fall into side gutters count toward your score?',
        answer: 'No, side gutters are house drains; only coins and tokens pushed cleanly over the front edge credit your score.',
      },
      {
        question: 'How many coins do you start with in Arcade Coin Pusher?',
        answer: 'You start with 40 coins in your tray, earning one free coin recharge every ten seconds of gameplay.',
      },
      {
        question: 'Can you tilt or shake the coin pusher machine?',
        answer: 'You can tap the machine nudge button up to three times per session, with excess shaking locking the mechanism.',
      },
    ],
  },

  'casual-slot-spinner': {
    objective: 'Time your stops across three spinning fruit reels to align matching symbols along the payline.',
    whatItMeasures: 'This arcade drill measures dynamic visual motion tracking and precision stop timing. It tests your ability to spot recurring symbols on spinning reels and actuate skill-stop buttons on cue.',
    tips: [
      'Track one high-value symbol (like the lucky 7 or red cherry) as it flashes through the reel window.',
      'Stop the first reel on a high-value symbol before attempting to match reels two and three.',
      'Use the nudge buttons when a matching symbol lands one notch above or below the payline.',
      'Time your button presses slightly before the target symbol reaches the center payline.',
    ],
    faq: [
      {
        question: 'Is Lucky Classic Reels a game of pure chance or skill-stop?',
        answer: 'This version features true interactive skill-stop controls, allowing players with sharp timing to halt reels on specific symbols.',
      },
      {
        question: 'What are the highest paying symbol combinations?',
        answer: 'Three Lucky 7s award the 500-point jackpot, followed by triple gold bells (200 pts) and triple cherries (100 pts).',
      },
      {
        question: 'What do reel holds do in this game?',
        answer: 'When hold lights ignite, you can lock in one or two reels to carry matching symbols into your next spin.',
      },
    ],
  },

  'casual-bubble-cannon': {
    objective: 'Aim and fire colored bubbles from your cannon to create clusters of three or more matching bubbles and drop the ceiling.',
    whatItMeasures: 'This puzzle arcade game measures bank-shot reflection trajectory planning and color clustering strategy. It evaluates your angle accuracy and cluster detachment planning.',
    tips: [
      'Use the side walls to bounce bubbles into hard-to-reach ceiling clusters behind blocker bubbles.',
      'Aim high: severing the root connection of a bubble cluster drops all attached bubbles below it instantly.',
      'Check the preview cannon bubble and swap between current and next bubble using the right click or swap button.',
      'Clear ceiling rows early to prevent the descending roof from reaching your cannon baseline.',
    ],
    faq: [
      {
        question: 'How many matching bubbles are required to pop a cluster?',
        answer: 'Connecting three or more bubbles of identical color causes the entire group to burst and drop.',
      },
      {
        question: 'How often does the bubble ceiling lower?',
        answer: 'The ceiling descends one row after every six non-clearing shots, increasing vertical urgency.',
      },
      {
        question: 'Are there special power bubbles in Bubble Cannon Matcher?',
        answer: 'Yes, popping large clusters charges bomb bubbles (which blow up surrounding areas) and rainbow bubbles (which match any color).',
      },
    ],
  },

  'casual-match-three': {
    objective: 'Swap adjacent gems on the grid to create lines of three or more matching jewels, triggering cascade combos.',
    whatItMeasures: 'This casual puzzle measures multi-directional pattern recognition and cascade combo forecasting. It benchmarks your efficiency at spotting high-value match opportunities across dense grids.',
    tips: [
      'Make matches near the bottom of the board to trigger rising cascade reactions that clear upper gems for free.',
      'Create 4-gem lines to forge explosive stripe gems, and 5-gem lines to craft rainbow hyper-cubes.',
      'Combine two special gems together (like a stripe gem plus a bomb gem) for massive screen-clearing blasts.',
      'Scan for vertical matches as well as horizontal ones to prevent single-direction tunnel vision.',
    ],
    faq: [
      {
        question: 'What happens when you match five gems in an L-shape or T-shape?',
        answer: 'Matching five gems in a cross, L, or T shape creates an explosive jewel bomb that detonates a 3x3 radius.',
      },
      {
        question: 'Is there a move limit or time limit in Jewel Blitz Swap?',
        answer: 'You can choose between a 60-second time rush mode and a relaxed 30-move tactical challenge mode.',
      },
      {
        question: 'What happens if no valid moves remain on the board?',
        answer: 'If no legal matches exist, the board automatically shuffles all gems without penalty.',
      },
    ],
  },

  'casual-golf-putt': {
    objective: 'Modulate stroke angle and power to putt the golf ball across turf slopes and into the cup in the fewest strokes.',
    whatItMeasures: 'This sports physics game measures kinetic force modulation and surface slope trajectory estimation. It tests your judgment of ball friction, bank angles, and cup capture speed.',
    tips: [
      'Pull back gently on short putts; hitting the cup with excessive speed will cause the ball to lip out.',
      'Read green contour arrows: aim uphill of the hole to allow natural slope break to steer the ball toward the cup.',
      'Use wooden boundary walls to bank shots around sand traps and water hazards.',
      'Avoid sand bunkers, as landing in sand dramatically deadens ball roll and adds penalty strokes.',
    ],
    faq: [
      {
        question: 'How do you aim and set stroke power in Mini Golf Hole-in-One?',
        answer: 'Drag backward from the golf ball to draw an aiming arrow; pulling farther back increases stroke velocity.',
      },
      {
        question: 'What is par for each hole in Mini Golf?',
        answer: 'Standard holes have a par rating between 2 and 4 strokes, with hole-in-one aces awarding massive bonus points.',
      },
      {
        question: 'Can you putt backwards if you get stuck behind an obstacle?',
        answer: 'Yes, you can aim 360 degrees in any direction to bounce off boundary walls and escape tricky corners.',
      },
    ],
  },

  'solitaire': {
    objective: 'Sort all 52 cards into the four foundation piles by suit from Ace to King, building alternating color tableau runs.',
    whatItMeasures: 'This classic card game measures depth-first sequencing strategy and probabilistic card excavation. It benchmarks your card ordering decisions and tableau column management.',
    tips: [
      'Always prioritize moves that uncover face-down cards in deep tableau columns over drawing from the stock deck.',
      'Keep empty columns open specifically for Kings to unlock long buried card stacks.',
      'Do not rush to transfer cards into foundation piles if they might still be needed to hold tableau sequences.',
      'Examine both red and black placement options before committing cards to tableau columns.',
    ],
    faq: [
      {
        question: 'What percentage of Klondike Solitaire deals are theoretically winnable?',
        answer: 'Mathematical analysis by Stanford researchers (Wolter, 2007) shows that approximately 82% of Klondike deals are solvable with optimal play, though everyday win rates average 33%.',
      },
      {
        question: 'Does this version use Draw 1 or Draw 3 rules?',
        answer: 'Standard casual mode uses Draw 1 for a smooth, solvable experience, with an optional Draw 3 mode available in settings.',
      },
      {
        question: 'What tools are provided on the solitaire board?',
        answer: 'The game features unlimited undo, auto-complete for cleared tableaus, hints, and local score tracking.',
      },
    ],
    benchmark: {
      metric: 'Moves and deal win probability',
      average: '110 – 145 moves (~33% win rate on standard deal)',
      elite: '< 85 moves (> 80% win rate on solvable draws)',
      source: 'Wolter, Y. (2007) Klondike Solitaire probability analysis, Stanford University / Mathematica',
    },
  },

  'mahjong': {
    objective: 'Match and clear open pairs of identical traditional Chinese tiles until the entire layered pyramid board is cleared.',
    whatItMeasures: 'This tile-matching puzzle measures multi-layer visual depth analysis and peripheral edge unblocking. It tests how you prioritize freeing trapped tiles across complex 3D layouts.',
    tips: [
      'Focus on clearing tall vertical stacks and long horizontal rows first, as they trap the highest number of hidden tiles.',
      'Never match a pair immediately if doing so leaves other critical rows blocked; survey all candidate matches.',
      'Remember that Season tiles match with any Season, and Flower tiles match with any Flower.',
      'Keep track of tile quadruplets: if three matching tiles are visible, matching two of them frees the remaining one.',
    ],
    faq: [
      {
        question: 'What makes a tile "free" to match in Mahjong Solitaire?',
        answer: 'A tile is free if: 1) No other tile rests directly on top of it, and 2) Either its left edge or right edge is completely open with no touching neighbor.',
      },
      {
        question: 'How many total tiles are in a classic Mahjong Solitaire set?',
        answer: 'A standard game features 144 tiles: three suits (Dots, Bamboos, Characters) from 1 to 9, four Winds, three Dragons, four Seasons, and four Flowers.',
      },
      {
        question: 'Is every starting Mahjong layout guaranteed solvable?',
        answer: 'Yes, boards generated on Wanjaaro use a reverse-deconstruction algorithm that guarantees every layout has a solvable matching sequence.',
      },
    ],
  },

  'idle-games': {
    objective: 'Excavate cosmic minerals, purchase automated plasma drill rigs, and ascend through prestige tiers for permanent multipliers.',
    whatItMeasures: 'This incremental game measures exponential resource compounding and investment efficiency planning. It benchmarks how effectively you balance active clicking against passive production upgrades.',
    tips: [
      'Invest early mining profits into automated plasma extractors to build sustainable passive ore per second (OPS).',
      'Purchase production multiplier upgrades whenever they cost less than 15 minutes of current passive output.',
      'Save your ascension prestige reset for when your current mineral income slows to a crawl.',
      'Prioritize permanent cosmic prestige perks that boost base extractor output across all future runs.',
    ],
    faq: [
      {
        question: 'How does the Ascension prestige mechanic work in Galactic Ore Miner?',
        answer: 'Ascending resets your current unspent ore and drill equipment in exchange for permanent cosmic shards that multiply all future ore extraction rates.',
      },
      {
        question: 'Does the game continue mining minerals while closed?',
        answer: 'Yes, passive offline progress calculates earned minerals based on your last recorded timestamp upon reopening.',
      },
      {
        question: 'Where is your idle mining progress saved?',
        answer: 'All equipment levels, cosmic shards, total extracted ore, and prestige multipliers are stored in your browser\'s localStorage.',
      },
    ],
  },
};
