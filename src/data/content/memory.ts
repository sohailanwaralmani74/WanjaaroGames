import { GameExtraContent } from './types';

export const MEMORY_CONTENT: Record<string, GameExtraContent> = {
  'memory-simon-sequence': {
    objective: 'Watch and memorize the sequence of lighted color pads and tones, then repeat it back in exact order.',
    whatItMeasures: 'This game measures sequential audio-visual pattern retention. It tracks how many consecutive steps of an expanding color and pitch sequence you can reproduce without error.',
    tips: [
      'Assign mental numbers (1 through 4) or names to each color pad to encode sequences verbally.',
      'Listen closely to musical pitch; sound patterns can reinforce visual memories.',
      'Tap your foot or finger to establish a steady rhythm for long sequence replays.',
      'Chunk long patterns into smaller groups of three or four steps.',
    ],
    faq: [
      {
        question: 'Does the playback speed increase on higher rounds?',
        answer: 'Yes, each round increases the pace of the demonstration flashes, demanding quicker encoding.',
      },
      {
        question: 'How long can the sequence become in Chime Sequence Recall?',
        answer: 'There is no upper limit; the sequence grows by one color chime after every successful player reproduction.',
      },
      {
        question: 'What happens if you hit the wrong color pad?',
        answer: 'A single misstep buzzer sounds and concludes the session, recording your highest completed step count.',
      },
    ],
  },

  'memory-card-pairs': {
    objective: 'Flip cards two at a time to uncover and match all matching symbol pairs on the grid in least turns.',
    whatItMeasures: 'This classic puzzle measures spatial grid recall and visual association. It benchmarks how efficiently you store and update coordinate locations of hidden visual cards.',
    tips: [
      'Flip cards systematically in rows to build an organized mental map of the grid.',
      'Never flip a previously unseen card when you already know the location of an open matching pair.',
      'Associate adjacent symbols into small stories or pairs to lock their positions into memory.',
      'Keep track of card corners first, as boundary positions are the easiest coordinates to anchor.',
    ],
    faq: [
      {
        question: 'How does turn efficiency influence the final score?',
        answer: 'Fewer total flips and faster completion times award significantly higher star ratings and leaderboard points.',
      },
      {
        question: 'Are card locations randomized on every replay?',
        answer: 'Yes, the deck is shuffled with a fresh cryptographic seed whenever a new board initializes.',
      },
      {
        question: 'What grid sizes are available in Card Matrix Pairs?',
        answer: 'Play begins on a 4x4 grid (8 pairs) and scales up to 6x6 (18 pairs) in expert mode.',
      },
    ],
  },

  'memory-spatial-span': {
    objective: 'Memorize the positions of flashed numbers across the grid, then click their hidden locations in ascending order (1 to 9).',
    whatItMeasures: 'This test measures working memory capacity under rapid visual masking. It evaluates how many simultaneous spatial coordinates you can encode in a fraction of a second.',
    tips: [
      'Group numbers into geometric shapes like triangles or lines to memorize clusters at once.',
      'Anchor your eyes on numbers 1, 2, and 3 first, as tapping these quickly gives you time to recall later positions.',
      'Do not try to memorize all positions at once; trace an imaginary path from 1 through the highest number.',
      'Breathe steadily and stay calm during the brief flash interval before cards mask into white blocks.',
    ],
    faq: [
      {
        question: 'Why is this challenge named after the chimpanzee Ayumu?',
        answer: 'At Kyoto University, a young chimpanzee named Ayumu routinely recalled all 9 masked numbers accurately in under 0.7 seconds, outperforming human university students.',
      },
      {
        question: 'What is the average human score on the spatial span test?',
        answer: 'Most adults consistently remember 7 to 9 numbers, aligning with standard working memory limits.',
      },
      {
        question: 'Does the flash duration change as levels progress?',
        answer: 'Yes, higher difficulty stages reduce display exposure time from 1000 milliseconds down to 300 milliseconds.',
      },
    ],
    benchmark: {
      metric: 'Instantaneous spatial sequence recall',
      average: '7 – 9 numbers',
      elite: '9 numbers in 0.65s (Ayumu benchmark)',
      source: 'Inoue & Matsuzawa (2007) Kyoto University Primate Research Institute working memory study',
    },
  },

  'memory-number-span': {
    objective: 'Memorize an expanding string of random digits displayed one by one, then type them back accurately.',
    whatItMeasures: 'This test measures forward auditory-verbal working memory span. It records the maximum length of an un-grouped numerical sequence you can hold and reproduce.',
    tips: [
      'Sub-vocalize digits in chunks of three (like phone numbers: 4-8-1, 9-2-5) rather than single digits.',
      'Focus intensely on the final two digits, which fade the fastest from immediate recall.',
      'Type your answer in a steady, unbroken rhythm once the prompt input field unlocks.',
      'Avoid looking away from the screen while digits are flashing in sequence.',
    ],
    faq: [
      {
        question: 'What is the standard benchmark for human digit span?',
        answer: 'In 1956, psychologist George Miller identified that human short-term memory typically holds 7 ± 2 items (5 to 9 digits).',
      },
      {
        question: 'How fast do the digits flash on screen?',
        answer: 'Each digit appears individually for 800 milliseconds followed by a 200 millisecond blank interval.',
      },
      {
        question: 'What is the difference between forward and backward digit span?',
        answer: 'Forward digit span tests raw capacity, while backward digit span requires active mental manipulation before typing.',
      },
    ],
    benchmark: {
      metric: 'Forward digit sequence capacity',
      average: '7 ± 2 digits',
      elite: '12+ digits',
      source: "Miller, G. A. (1956) 'The Magical Number Seven, Plus or Minus Two', Psychological Review",
    },
  },

  'memory-color-order': {
    objective: 'Observe a brief palette of distinct color strips, then arrange the scrambled swatches into their original sequence.',
    whatItMeasures: 'This drill measures visual hue sequence retention. It tests how accurately you store chromatic ordering without verbal digit crutches.',
    tips: [
      'Create a narrative mnemonic linking the colors (for example: red sun, green grass, blue ocean).',
      'Pay special attention to the first and last colors in the spectrum bar.',
      'Note warm versus cool color clusters to reduce sequence complexity.',
      'Double check your assembled spectrum before submitting your final arrangement.',
    ],
    faq: [
      {
        question: 'How many colors appear in the maximum sequence?',
        answer: 'Sequences start with four swatches on stage one and expand up to eight distinct colors on master stages.',
      },
      {
        question: 'Are colors in Palette Spectrum Recall randomly generated?',
        answer: 'Yes, swatches are chosen from calibrated high-contrast color wheels to prevent ambiguous tints.',
      },
      {
        question: 'How does dragging work on mobile screens?',
        answer: 'Touch and slide any color swatch horizontally to reorder positions smoothly with live previews.',
      },
    ],
  },

  'memory-path-memorizer': {
    objective: 'Watch a golden path illuminate through the dark tile maze, then retrace the exact route from memory.',
    whatItMeasures: 'This game measures spatial directional route encoding. It benchmarks how many sequential coordinate steps of a winding labyrinth you can commit to memory and retrace.',
    tips: [
      'Mentally call out directions (up, up, right, down, right) as the path draws across the floor.',
      'Visualize the path as an overall letter or glyph shape instead of isolated individual squares.',
      'Pay close attention to directional turn points rather than straight corridor segments.',
      'Do not rush; pause for a moment to verify your next step before clicking a tile.',
    ],
    faq: [
      {
        question: 'What happens if you step onto a tile off the path?',
        answer: 'Stepping off the route turns the tile red and costs one life out of three total attempts.',
      },
      {
        question: 'Can the path cross over itself?',
        answer: 'No, paths never overlap or cross previous footsteps, maintaining a continuous single thread.',
      },
      {
        question: 'How long do you have to examine the illuminated path before it vanishes?',
        answer: 'The demonstration displays each step for 400 milliseconds, followed by a one-second pause before player control.',
      },
    ],
  },

  'memory-icon-stash': {
    objective: 'Study a table of everyday household icons, then identify which single item was removed or changed.',
    whatItMeasures: 'This test measures change detection and item inventory retention. It assesses your visual scanning speed and sensitivity to visual absences.',
    tips: [
      'Scan the icon board by quadrants (top-left, top-right, bottom-left, bottom-right) during the study phase.',
      'Verbally list the items in clockwise order to establish a secondary memory index.',
      'Look for the empty space or replacement symbol immediately when the second board appears.',
      'Trust your initial intuition if an icon feels missing before second-guessing yourself.',
    ],
    faq: [
      {
        question: 'How long do I get to study the icon set?',
        answer: 'Study time lasts five seconds on early levels and tightens to three seconds on advanced rounds.',
      },
      {
        question: 'How many total icons can be displayed at once?',
        answer: 'Displays range from six icons on beginner rounds up to twenty icons on expert stages.',
      },
      {
        question: 'What is the penalty for clicking the wrong icon?',
        answer: 'Selecting an incorrect icon subtracts 50 points and reveals the true missing item before the next round.',
      },
    ],
  },

  'memory-dual-nback': {
    objective: 'Indicate whenever the current grid position or letter matches the one presented exactly one step earlier.',
    whatItMeasures: 'This game measures continuous working memory updating. It tests your ability to maintain, update, and compare incoming items against recently stored positions in a continuous stream.',
    tips: [
      'Focus strictly on the previous position rather than trying to look back multiple rounds.',
      'Use keyboard shortcut keys for instant match reporting rather than clicking with a mouse.',
      'Mentally drop older items as soon as a new position registers on the matrix.',
      'Stay relaxed; over-thinking causes you to miss rapid 1-back opportunities.',
    ],
    faq: [
      {
        question: 'What does "1-Back" mean in this game mode?',
        answer: '1-Back means you compare the currently flashing cell to the immediately preceding cell shown one turn ago.',
      },
      {
        question: 'How does the scoring system reward performance in 1-Back Matrix Match?',
        answer: 'Points are awarded for correct hits and correct rejections, with deductions for misses and false alarms.',
      },
      {
        question: 'Can the difficulty be adjusted to 2-Back or 3-Back?',
        answer: 'Yes, after achieving an 85% accuracy rate on 1-Back, higher N-Back levels unlock in the settings menu.',
      },
    ],
  },
};
