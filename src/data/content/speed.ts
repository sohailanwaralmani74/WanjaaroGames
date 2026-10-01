import { GameExtraContent } from './types';

export const SPEED_CONTENT: Record<string, GameExtraContent> = {
  'speed-click-25': {
    objective: 'Locate and click numbers 1 through 25 on the 5x5 matrix in strict ascending numerical order as fast as possible.',
    whatItMeasures: 'This test measures broad visual search speed and numerical scan sequencing. It benchmarks your peripheral visual scanning efficiency across a structured numerical field.',
    tips: [
      'Keep your eyes fixed on the center square (number 13) and use peripheral vision to locate numbers.',
      'Avoid moving your head or tracing your finger across the screen; move only your eyes and mouse.',
      'As you click one number, begin searching for the subsequent number before your hand returns.',
      'Notice where numbers in the next tier (like 6-10 while clicking 1-5) are located to prepare your route.',
    ],
    faq: [
      {
        question: 'What is a Schulte Table?',
        answer: 'Developed by German psychiatrist Walter Schulte, it is a standard psychological test used to measure visual search velocity and attention distribution.',
      },
      {
        question: 'What is considered a fast completion time for a 5x5 Schulte Table?',
        answer: 'The average adult completes a 25-number grid in 32 to 45 seconds; speed readers and trained esports players finish in under 20 seconds.',
      },
      {
        question: 'What happens if you click a number out of order?',
        answer: 'The grid flashes red and refuses to advance until the correct next sequential number is clicked.',
      },
    ],
    benchmark: {
      metric: '25-number ascending visual search duration',
      average: '32s – 45s',
      elite: '< 20s',
      source: 'Schulte Table standardized visual search assessment protocol',
    },
  },

  'speed-clicker-10s': {
    objective: 'Click or tap the big target button as many times as humanly possible within a 10-second endurance sprint.',
    whatItMeasures: 'This benchmark measures clicks per second (CPS) and short-term motor endurance. It tests raw muscular firing velocity and repetitive trigger stamina.',
    tips: [
      'Grip the mouse lightly between your thumb and ring finger while vibrating your index finger over the switch.',
      'Use the jitter-click technique (tensing your forearm to create a controlled tremor) if seeking elite scores.',
      'Ensure your mouse has crisp optical switches with short actuation travel for minimal bounce delay.',
      'Pace yourself slightly to avoid running out of stamina in the final three seconds of the sprint.',
    ],
    faq: [
      {
        question: 'What is an average clicks-per-second (CPS) rating?',
        answer: 'Everyday mouse users click between 6.0 and 7.5 CPS; trained Minecraft PvP players reach 12.0 to 16.0+ CPS.',
      },
      {
        question: 'Can you use auto-clickers or macro scripts in this drill?',
        answer: 'The engine monitors millisecond inter-click variance and flags mathematically uniform mechanical inputs.',
      },
      {
        question: 'Does the test support double-clicking or drag-clicking mice?',
        answer: 'Any hardware click registered by your operating system is recorded directly by the benchmark counter.',
      },
    ],
  },

  'speed-swipe-rush': {
    objective: 'Swipe or press arrow keys in the direction indicated by the flashing directional arrows before the countdown expires.',
    whatItMeasures: 'This game measures directional stimulus-response translation and motor reaction speed. It tests how quickly you translate spatial arrow orientation into the corresponding directional swipe.',
    tips: [
      'Rest your fingers over the four arrow keys or WASD keys rather than dragging with a mouse.',
      'Keep your eyes on the arrow arrowhead rather than looking at the shaft.',
      'Build a continuous rhythm; hesitation ruins your combo multiplier.',
      'Watch for inverted color arrows on higher stages that require swiping in the opposite direction.',
    ],
    faq: [
      {
        question: 'How much time do you get per arrow in Arrow Direction Rush?',
        answer: 'Arrows start with an 800ms response window and accelerate down to 350ms on master rounds.',
      },
      {
        question: 'Can you use keyboard controls instead of touch swipes?',
        answer: 'Yes, keyboard arrow keys and WASD keys provide instant, lag-free directional inputs on desktop workstations.',
      },
      {
        question: 'What happens if you swipe the wrong direction?',
        answer: 'A wrong directional swipe breaks your active combo streak and deducts a time penalty.',
      },
    ],
  },

  'speed-quick-sort': {
    objective: 'Sort falling colored or patterned items into their corresponding left and right sorting bins at high speed.',
    whatItMeasures: 'This game measures rapid visual classification and dual-choice motor execution. It benchmarks your categorization decision speed under continuous arrival rates.',
    tips: [
      'Focus on a single distinguishing attribute (like color or shape) to classify items instantaneously.',
      'Use both hands on keyboard shortcuts (Z for left bin, M for right bin) for the fastest sorting rate.',
      'Anticipate the next item in the conveyor queue while sorting the active item.',
      'Do not guess; misplacing an item into the wrong bin breaks your bonus multiplier.',
    ],
    faq: [
      {
        question: 'How fast do items arrive on the sorting conveyor?',
        answer: 'Item frequency ramps up every ten successful sorts, challenging your visual classification limits.',
      },
      {
        question: 'Can you sort items with touch gestures on mobile?',
        answer: 'Yes, simply swipe items toward the left or right bin, or tap the large on-screen sorting zone buttons.',
      },
      {
        question: 'How long does a standard Bin Sort Rush round last?',
        answer: 'Standard sessions last 45 seconds of continuous sorting action.',
      },
    ],
  },

  'speed-bubble-pop': {
    objective: 'Pop as many floating helium bubbles as possible within 30 seconds before they drift off the top of the screen.',
    whatItMeasures: 'This arcade game measures multi-target visual tracking and rapid spatial pointing accuracy. It evaluates how quickly you acquire and click moving floating targets.',
    tips: [
      'Prioritize bubbles near the top of the screen before they float away and escape.',
      'Target bubble clusters to chain rapid sequential clicks with minimal cursor travel.',
      'Pop golden bonus bubbles immediately for double-point bursts.',
      'Avoid clicking red spiky hazard bubbles that deduct ten points and freeze your cursor momentarily.',
    ],
    faq: [
      {
        question: 'Do bubbles float at different speeds?',
        answer: 'Small bubbles ascend faster than large bubbles, requiring varied tracking lead times.',
      },
      {
        question: 'Can you use multi-touch to pop multiple bubbles at once on mobile?',
        answer: 'Yes, full multi-touch support allows you to tap multiple floating bubbles simultaneously using multiple fingers.',
      },
      {
        question: 'What is a competitive score for a 30-second Bubble Burst run?',
        answer: 'Popping 40 to 50 bubbles is typical for casual players; precision clickers exceed 75 bubbles per session.',
      },
    ],
  },

  'speed-coin-catcher': {
    objective: 'Slide your collection basket horizontally across the arena bottom to catch falling gold coins while dodging falling hazard bombs.',
    whatItMeasures: 'This arcade physics game measures horizontal tracking interception and hazard avoidance reaction. It benchmarks your agility at gathering rewards while steering clear of obstacles.',
    tips: [
      'Keep your eyes on the upper half of the screen to plan your basket positioning early.',
      'Prioritize high-value blue gems (+25 pts) when they fall along clear paths.',
      'Never commit to catching a coin if an anvil bomb is falling directly alongside it; preserving lives is vital.',
      'Use smooth pointer dragging or arrow keys rather than jerky side-to-side swipes.',
    ],
    faq: [
      {
        question: 'How many lives do you start with in Falling Coin Basket?',
        answer: 'You begin with three hearts; catching or touching an anvil bomb deducts one life and flashes the screen red.',
      },
      {
        question: 'How long does a standard coin catching session last?',
        answer: 'Standard arcade rounds last 35 seconds, with falling object density accelerating as the timer runs down.',
      },
      {
        question: 'Can this game be played with keyboard controls?',
        answer: 'Yes, you can slide the basket using Left/Right arrow keys or A/D keys alongside full mouse and touch dragging.',
      },
    ],
  },

  'speed-button-mash': {
    objective: 'Mash two alternating keys (A and B) in perfect sequential cadence to drive the speedometer needle into the maximum zone.',
    whatItMeasures: 'This drill measures reciprocal dual-key motor cadence and endurance stamina. It evaluates your ability to alternate keystrokes rapidly without double-pressing the same key.',
    tips: [
      'Use the index fingers of separate hands (one on A, one on B) for maximum alternating speed.',
      'Establish a strict 1-2-1-2 rhythmic tempo; pressing the same key twice in succession breaks your momentum.',
      'Keep your keyboard switches clean and free of sticky residue for crisp actuation rebound.',
      'Start at a sustainable cadence and accelerate during the final three seconds of the sprint.',
    ],
    faq: [
      {
        question: 'Which keyboard keys are used for Alternating Mash?',
        answer: 'Standard desktop controls use the Left and Right arrow keys or the A and D keys on your keyboard.',
      },
      {
        question: 'What is the penalty for pressing the same key twice?',
        answer: 'Double-pressing the same key locks the gauge for 200 milliseconds, stalling your speedometer needle.',
      },
      {
        question: 'What is a competitive score on this drill?',
        answer: 'Reaching 80 to 100 alternating cycles within 10 seconds places you in the top tier of competitive mashers.',
      },
    ],
  },

  'speed-match-pair': {
    objective: 'Determine whether two rapidly flashed visual symbols or cards are completely identical or subtly different.',
    whatItMeasures: 'This game measures visual comparison latency and symmetry verification. It records how quickly you confirm identical visual features under short presentation windows.',
    tips: [
      'Compare overall shape silhouette first, then examine internal detail markers.',
      'Use keyboard shortcut keys (Left arrow for "Different", Right arrow for "Match") for fastest inputs.',
      'Watch for mirrored reflections, which look similar but are classified as "Different".',
      'Trust your immediate visual impression to maintain high throughput speed.',
    ],
    faq: [
      {
        question: 'How fast do symbol pairs appear and vanish?',
        answer: 'Pairs flash on screen for 600 milliseconds before masking into neutral placeholder cards.',
      },
      {
        question: 'What types of visual symbols are compared in Flash Identical Check?',
        answer: 'Symbols include geometric polygons, abstract runes, icons, and asymmetrical alphanumeric glyphs.',
      },
      {
        question: 'How does accuracy affect your final rating?',
        answer: 'An incorrect answer ends your combo multiplier and deducts a 2-second penalty from the session clock.',
      },
    ],
  },
};
