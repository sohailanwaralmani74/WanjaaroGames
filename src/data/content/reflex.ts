import { GameExtraContent } from './types';

export const REFLEX_CONTENT: Record<string, GameExtraContent> = {
  'reflex-reaction-time': {
    objective: 'Click or tap the screen the moment the red background turns solid green.',
    whatItMeasures: 'This test measures your simple visual response latency in milliseconds. It tracks the time between when the screen color changes and when your input device registers your click.',
    tips: [
      'Rest your finger gently on the mouse button or touchscreen before the light turns green.',
      'Fix your gaze directly on the center of the screen to catch the color shift immediately.',
      'Avoid anticipating the color change, as clicking early counts as a false start.',
      'Take three deep breaths before each trial to keep your forearm muscles relaxed.',
    ],
    faq: [
      {
        question: 'What is considered a normal reaction time on this test?',
        answer: 'Most healthy adults score between 215 and 250 milliseconds using a desktop mouse or responsive touchscreen.',
      },
      {
        question: 'Why does tapping too early reset the round?',
        answer: 'False starts are penalized because true reaction time measures response to a stimulus, not random guessing.',
      },
      {
        question: 'Does screen refresh rate affect my score?',
        answer: 'Yes, displays running at 144Hz or higher update the visual frame faster than older 60Hz screens, reducing input display delay by roughly 10 milliseconds.',
      },
    ],
    benchmark: {
      metric: 'Visual stimulus response latency',
      average: '215ms – 250ms',
      elite: '< 180ms',
      source: 'Human Benchmark aggregate reaction dataset (2020) & Kosinski visual latency norms (2008)',
    },
  },

  'reflex-speed-flash': {
    objective: 'Tap instantly when a white beacon appears, but keep your hand still when a red decoy flashes.',
    whatItMeasures: 'This game measures selective visual response speed and motor inhibition. It evaluates your ability to act quickly on target cues while restraining movement on false cues.',
    tips: [
      'Focus entirely on recognizing the white hue before allowing your finger to press down.',
      'Keep your hand hovering half an inch above the screen to prevent accidental taps on red decoys.',
      'Build a steady rhythm rather than trying to rush every flash.',
      'Remember that a single false tap on red deducts more points than a slightly slower white tap.',
    ],
    faq: [
      {
        question: 'How is the final score calculated in Speed Flash Reflex?',
        answer: 'Your score adds points for quick taps on white targets and subtracts a fixed penalty for every tap on a red decoy.',
      },
      {
        question: 'What happens if I miss a white beacon completely?',
        answer: 'Missing a white beacon breaks your scoring streak and gives zero points for that interval.',
      },
      {
        question: 'Is it better to prioritize accuracy or speed?',
        answer: 'Accuracy is more important because the penalty for clicking a red decoy heavily outweighs small speed bonuses.',
      },
    ],
  },

  'reflex-whack-hex': {
    objective: 'Clear active glowing honeycomb cells across the grid before their timers run down.',
    whatItMeasures: 'This game measures multi-point spatial targeting and rapid hand-eye coordination. It tests how quickly you can locate newly lit targets across a wide area and tap them accurately.',
    tips: [
      'Keep your eyes loosely focused on the grid center so your peripheral vision catches outer lights.',
      'Tap with whichever hand is closest to the active target if you are playing on a touchscreen.',
      'Prioritize older glowing cells that are closest to expiring over newly lit ones.',
      'Use short, light taps to reset your hand position quickly for the next target.',
    ],
    faq: [
      {
        question: 'Does the honeycomb grid speed up over time?',
        answer: 'Yes, the time window for active cells shrinks progressively after every five successful hits.',
      },
      {
        question: 'Can multiple cells light up at the same time?',
        answer: 'As your score climbs, two or more cells can ignite simultaneously, requiring fast sequential taps.',
      },
      {
        question: 'What causes a game over in Hex Whack?',
        answer: 'Allowing three active hexagons to fade completely without being tapped ends the game.',
      },
    ],
  },

  'reflex-dodge-ball': {
    objective: 'Guide your spark continuously through an accelerating storm of blue kinetic particles without getting hit.',
    whatItMeasures: 'This test measures continuous evasion control and spatial trajectory anticipation. It records how many seconds you can sustain collision-free movement under increasing hazard density.',
    tips: [
      'Stay near the central area of the arena to leave yourself escape routes in all directions.',
      'Make small, controlled movements rather than sweeping panicky strokes across the screen.',
      'Avoid backing yourself into corners where converging particles can trap you.',
      'Watch the trajectories of incoming particles several steps ahead rather than staring only at your own spark.',
    ],
    faq: [
      {
        question: 'Do the hazard particles move in random directions?',
        answer: 'Particles bounce off boundaries according to kinetic reflection angles and slowly increase in velocity.',
      },
      {
        question: 'Is mouse control or touch control recommended for Dodge Vector?',
        answer: 'Both work well, but a low-friction mouse on desktop provides precise micro-adjustments with zero hand occlusion.',
      },
      {
        question: 'How is survival time measured?',
        answer: 'Your score tracks exact elapsed time from your first movement until particle contact.',
      },
    ],
  },

  'reflex-audio-snap': {
    objective: 'Press your mouse or spacebar the exact millisecond you hear the acoustic bell chime.',
    whatItMeasures: 'This test measures pure auditory response time. Because auditory processing bypasses visual color interpretation, it benchmarks sound-triggered motor reflexes.',
    tips: [
      'Close your eyes or look away from the screen to eliminate visual distraction while listening.',
      'Use headphones rather than laptop speakers for the clearest and earliest sound detection.',
      'Position your index finger resting directly on the key to eliminate physical travel distance.',
      'Breathe steadily and do not tense up while waiting for the sound cue.',
    ],
    faq: [
      {
        question: 'Why are auditory reaction times generally faster than visual ones?',
        answer: 'Sound signals reach the inner ear and brainstem pathways slightly faster than light waves travel through retinal receptors.',
      },
      {
        question: 'Can background room noise affect my score?',
        answer: 'Yes, a noisy environment creates auditory clutter, so testing in a quiet room or with headphones yields the cleanest scores.',
      },
      {
        question: 'What is an average audio reaction time?',
        answer: 'Typical auditory reaction times range between 170ms and 210ms for healthy adults.',
      },
    ],
  },

  'reflex-color-switch': {
    objective: 'Tap the matching button the moment the displayed color swatch aligns with the central target hue.',
    whatItMeasures: 'This game measures rapid color matching and decision-making under continuous cyclic changes. It benchmarks how quickly you verify color parity before executing a physical tap.',
    tips: [
      'Focus on overall saturation differences rather than reading color names.',
      'Keep a light tap pressure so you can commit immediately when colors match.',
      'Do not guess ahead; wait for visual confirmation of identical hues.',
      'Maintain streaks to unlock higher combo point multipliers.',
    ],
    faq: [
      {
        question: 'How fast do the colors alternate?',
        answer: 'Colors cycle every 400 to 800 milliseconds, giving you a brief window to confirm a match.',
      },
      {
        question: 'What happens if I tap when the colors do not match?',
        answer: 'An incorrect tap resets your current multiplier streak and subtracts a small penalty.',
      },
      {
        question: 'Are the colors calibrated for colorblind players?',
        answer: 'The game uses high-contrast primary swatches with distinct lightness levels to aid visibility.',
      },
    ],
  },

  'reflex-quick-brake': {
    objective: 'Stop the rapidly filling progress needle as close to 100% as possible without crossing into the red zone.',
    whatItMeasures: 'This game measures temporal estimation and precision stopping control. It evaluates your timing when judging speed and decelerating an action right before an overflow limit.',
    tips: [
      'Observe the needle speed during the first 50% of the gauge to gauge acceleration rate.',
      'Aim for the 94% to 98% sweet spot for top tier points.',
      'Never hesitate once the needle passes 90%, as stopping late in the red zone awards zero points.',
      'Keep your clicking finger poised with zero slack on the mouse switch.',
    ],
    faq: [
      {
        question: 'Does the gauge charge at a fixed speed every round?',
        answer: 'No, the needle velocity varies randomly each round to prevent rote rhythmic timing.',
      },
      {
        question: 'What is the penalty for exceeding 100%?',
        answer: 'Crossing 100% is considered an overshot brake and scores 0 points for that specific attempt.',
      },
      {
        question: 'How many brake trials make up one complete session?',
        answer: 'A standard session consists of 5 consecutive stopping trials, with your final score being the average accuracy.',
      },
    ],
  },

  'reflex-trigger-finger': {
    objective: 'Register as many clean, individual finger taps as possible within a strict 5-second sprint.',
    whatItMeasures: 'This game measures single-digit motor firing rate and burst tapping endurance. It benchmarks raw repetitive muscular cycling over a short duration.',
    tips: [
      'Use the tip of your index finger rather than a flat finger pad for crisper tactile rebound.',
      'Keep your wrist grounded on the desk or table to isolate finger movement and reduce arm fatigue.',
      'Tense your forearm slightly to establish a rapid fluttering cadence.',
      'Tap firmly enough to register each switch actuation without bottoming out heavily.',
    ],
    faq: [
      {
        question: 'Does jitter-clicking or butterfly clicking work in Trigger Tap Sprint?',
        answer: 'Yes, advanced gaming clicking techniques are detected and counted accurately by the input listener.',
      },
      {
        question: 'What is a typical score for a 5-second sprint?',
        answer: 'Most players achieve between 30 and 45 taps (6 to 9 taps per second), while competitive clickers exceed 55 taps.',
      },
      {
        question: 'Can I use two alternating fingers on mobile?',
        answer: 'Yes, multi-touch is supported on touchscreens so you can alternate index and middle fingers.',
      },
    ],
  },
};
