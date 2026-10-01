import { GameExtraContent } from './types';

export const PERCEPTION_CONTENT: Record<string, GameExtraContent> = {
  'perception-odd-color': {
    objective: 'Locate and tap the single tile with a slightly different shade or brightness in the color matrix.',
    whatItMeasures: 'This test measures subtle chrominance and luminance discrimination. It benchmarks your visual sensitivity to minor color hue variances across dense grids.',
    tips: [
      'Unfocus your eyes slightly; the outlier tile often pops out in your peripheral vision.',
      'Calibrate your display brightness to a moderate level to avoid washing out subtle tints.',
      'Scan diagonally across the grid rather than reading row by row.',
      'Work quickly on early rounds to bank extra seconds for high-density 8x8 grids.',
    ],
    faq: [
      {
        question: 'Does the grid get larger as you progress in Odd Hue Spotter?',
        answer: 'Yes, the board begins as a simple 2x2 grid and expands up to 9x9 with increasingly minute color deltas.',
      },
      {
        question: 'How small do the color differences become on higher levels?',
        answer: 'On master stages, color variance drops to less than 2% in RGB delta values, challenging monitor color accuracy.',
      },
      {
        question: 'Does screen angle affect gameplay?',
        answer: 'Viewing your screen directly straight-on is recommended because off-axis viewing can distort subtle color shades on some panels.',
      },
    ],
  },

  'perception-dot-counter': {
    objective: 'Estimate or count the total number of dots flashed on screen for a split second before entering your count.',
    whatItMeasures: 'This test measures rapid visual subitizing and spatial quantity estimation. It benchmarks your capacity to perceive small group quantities instantly without counting one by one.',
    tips: [
      'For quantities under 5, rely on instant pattern recognition (subitizing) rather than counting.',
      'For larger clusters, divide the screen mentally into halves and estimate the two portions.',
      'Trust your immediate impression instead of second-guessing after the dots vanish.',
      'Notice geometric groupings like triangles or clusters of three to speed up mental tallying.',
    ],
    faq: [
      {
        question: 'What is "subitizing" in visual perception?',
        answer: 'Subitizing is the rapid, accurate, and confident judgment of numbers performed instantly for small quantities (typically 1 to 4 items).',
      },
      {
        question: 'How long do the dots stay visible on screen?',
        answer: 'Dots are displayed for 300 to 500 milliseconds before turning blank to prevent manual finger counting.',
      },
      {
        question: 'Is partial credit given for near guesses?',
        answer: 'Exact matches award full points, with partial points granted if your estimate is within plus-or-minus one dot.',
      },
    ],
  },

  'perception-stroop-test': {
    objective: 'Select the color of the ink the word is printed in, completely ignoring what the written word says.',
    whatItMeasures: 'This benchmark measures cognitive conflict resolution and selective attention. It records the millisecond reaction delay caused when the semantic meaning of a word clashes with its visual font color.',
    tips: [
      'Look at the physical font color and speak the color name in your mind before reading the letters.',
      'Squint slightly if you find the written word distracting, which blurs the text while keeping the color obvious.',
      'Use the keyboard colored shortcut buttons to bypass cursor travel time.',
      'Stay consistent; hesitating on conflict words costs significant latency points.',
    ],
    faq: [
      {
        question: 'What is the classic Stroop effect?',
        answer: 'Discovered by J. Ridley Stroop in 1935, it demonstrates that humans read words automatically, creating a noticeable delay when asked to report the ink color instead of the word itself.',
      },
      {
        question: 'What is a typical interference delay on the Stroop test?',
        answer: 'Most people experience an interference slowdown between 120ms and 180ms when ink color contradicts word meaning.',
      },
      {
        question: 'Do congruent words appear during the test?',
        answer: 'Yes, baseline congruent trials (e.g. the word "RED" printed in red ink) are mixed in to measure your baseline reading speed.',
      },
    ],
    benchmark: {
      metric: 'Semantic color-word interference delay',
      average: '120ms – 180ms delay',
      elite: '< 60ms delay',
      source: "Stroop, J. R. (1935) 'Studies of interference in serial verbal reactions', Journal of Experimental Psychology",
    },
  },

  'perception-hidden-symbol': {
    objective: 'Spot and click the hidden target glyph concealed within a noisy background texture or pattern.',
    whatItMeasures: 'This test measures visual figure-ground segregation and pattern extraction. It benchmarks how quickly you isolate a target shape embedded inside visual noise.',
    tips: [
      'Scan along horizontal bands across the texture rather than wandering randomly.',
      'Look for unnatural line intersections or continuous curves that disrupt the background grain.',
      'Adjust your distance from the monitor slightly; sitting back often makes embedded shapes stand out.',
      'Notice symmetry clues, as target glyphs usually possess geometric balance absent in the noise.',
    ],
    faq: [
      {
        question: 'Does the background camouflage change each round?',
        answer: 'Yes, patterns alternate between geometric hatches, organic noise grains, and stippled dot fields.',
      },
      {
        question: 'What happens if you click the wrong area of the camouflage?',
        answer: 'Misclicks incur a five-second penalty added to your total search time for that stage.',
      },
      {
        question: 'Is there a hint button if a glyph is impossible to find?',
        answer: 'A hint button is available after 15 seconds, highlighting the general quadrant of the hidden symbol at the cost of score stars.',
      },
    ],
  },

  'perception-size-illusion': {
    objective: 'Judge which of two central circles is physically larger despite distracting surrounding circle rings.',
    whatItMeasures: 'This test measures susceptibility to contextual visual size illusions (Ebbinghaus and Ponzo effects). It evaluates your ability to perceive true dimensions independent of surrounding relative scale cues.',
    tips: [
      'Block out the surrounding outer circles mentally and compare only the inner boundaries.',
      'Measure the inner circle diameter against a stationary finger or cursor edge if allowed in practice mode.',
      'Remember that large surrounding circles make an inner disc appear artificially smaller than it truly is.',
      'Trust measured geometry rather than immediate contextual impressions.',
    ],
    faq: [
      {
        question: 'What causes the Ebbinghaus size illusion?',
        answer: 'The human visual system naturally estimates object size relative to surrounding visual context rather than in absolute terms.',
      },
      {
        question: 'Can the two central circles ever be exactly identical in size?',
        answer: 'Yes, select trials feature identical circles to test whether you can recognize parity despite unequal surrounding rings.',
      },
      {
        question: 'How does the game score optical illusion resistance?',
        answer: 'Scores are calculated from your error percentage across 10 progressive illusion pairs with decreasing size disparities.',
      },
    ],
  },

  'perception-angle-guess': {
    objective: 'Estimate the degree angle of the displayed geometric vertex and dial in your closest guess (0° to 180°).',
    whatItMeasures: 'This game measures geometric angle estimation and spatial slope perception. It benchmarks your precision at gauging angular degrees without physical measurement tools.',
    tips: [
      'Anchor your estimate against standard landmarks: 45° (half right), 90° (perpendicular), and 135°.',
      'Visualize a full 90-degree square corner in the vertex to see whether the angle is acute or obtuse.',
      'Use the circular slider smoothly to fine-tune your degree guess before hitting submit.',
      'Look at the arc between the two rays rather than focusing on ray lengths.',
    ],
    faq: [
      {
        question: 'How close does my estimate need to be for a perfect score?',
        answer: 'Guesses within plus-or-minus two degrees receive a 100% precision rating and maximum bonus points.',
      },
      {
        question: 'Do ray lengths vary between problems?',
        answer: 'Yes, rays have unequal lengths and orientations to ensure you judge angle slope rather than line endpoints.',
      },
      {
        question: 'Can angles exceed 180 degrees in this drill?',
        answer: 'Standard mode focuses on interior angles between 5° and 175°, with an advanced mode testing reflex angles up to 355°.',
      },
    ],
  },

  'perception-shadow-match': {
    objective: 'Match the 3D rendered item with its exact corresponding 2D silhouette cast on the wall.',
    whatItMeasures: 'This puzzle measures dimensional projection analysis and silhouette contour matching. It evaluates how accurately you project a complex object outline onto a flat 2D shadow profile.',
    tips: [
      'Identify unique protruding features (like handles, spikes, or corners) and search for them on the silhouette.',
      'Check negative space openings inside the object that should appear as cutouts in the shadow.',
      'Beware of decoy silhouettes that differ only by a single reversed handle or flipped orientation.',
      'Rotate the 3D model with your mouse if needed to align it with the shadow casting angle.',
    ],
    faq: [
      {
        question: 'Can silhouettes be rotated relative to the original model?',
        answer: 'Silhouettes reflect light cast from a fixed point source, maintaining a consistent projection angle.',
      },
      {
        question: 'How many shadow choices are provided per challenge?',
        answer: 'Each round presents four silhouette candidates, with three containing subtle structural distortions.',
      },
      {
        question: 'What is the best technique for complex organic shapes?',
        answer: 'Count the number of major bumps or contours along the outer perimeter to quickly eliminate false shadows.',
      },
    ],
  },

  'perception-motion-detect': {
    objective: 'Identify the prevailing directional flow of coherent dots within a swarm of random background noise.',
    whatItMeasures: 'This test measures coherent visual motion detection and signal-to-noise perceptual threshold. It records the minimum percentage of aligned moving dots required for you to correctly identify overall direction.',
    tips: [
      'Gaze at the overall field rather than trying to track single isolated dots.',
      'Allow your eyes to perceive the global flow drift (up, down, left, or right) across the entire patch.',
      'Look through the display center; global motion signals emerge most clearly across a broad visual field.',
      'Take your time; dots circulate for several seconds to allow the coherent direction to resolve.',
    ],
    faq: [
      {
        question: 'What percentage of dots move in the target direction?',
        answer: 'Coherence begins at 50% on early levels and scales down to a challenging 10% on expert stages.',
      },
      {
        question: 'What are the four possible directions in Coherent Motion Spotter?',
        answer: 'Dots flow along cardinal axes: Up, Down, Left, or Right, selected randomly each round.',
      },
      {
        question: 'How is motion coherence used in scientific research?',
        answer: 'Random dot kinematograms are widely used in vision science to test how the visual system integrates fragmented motion signals.',
      },
    ],
  },
};
