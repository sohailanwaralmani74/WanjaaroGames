import { GameExtraContent } from './types';

export const AIM_CONTENT: Record<string, GameExtraContent> = {
  'aim-sniper': {
    objective: 'Acquire and eliminate shrinking target nodes across the arena before they collapse to zero radius.',
    whatItMeasures: 'This trainer measures ballistic cursor flick accuracy and fine cursor deceleration. It benchmarks how quickly and accurately you reposition your crosshair onto variable-sized targets.',
    tips: [
      'Lower your mouse DPI sensitivity if you notice your cursor overshooting past small targets.',
      'Flick your wrist directly toward the target center, then decelerate into a micro-correction.',
      'Target shrinking discs first before they expire to preserve your consecutive streak multiplier.',
      'Keep your arm relaxed and glide your mouse across a consistent, clean mousepad surface.',
    ],
    faq: [
      {
        question: 'Do targets shrink at the same rate throughout the drill?',
        answer: 'Targets shrink faster as your consecutive score streak increases, demanding faster flick timing.',
      },
      {
        question: 'What is the optimal mouse sensitivity for Precision Sniper?',
        answer: 'A medium sensitivity where one comfortable wrist swipe covers approximately half your screen width offers the best balance.',
      },
      {
        question: 'How does miss penalty affect the score?',
        answer: 'Clicking empty arena space deducts accuracy percentage and resets your active combo streak.',
      },
    ],
  },

  'aim-orbit-tap': {
    objective: 'Click the orbiting beacon the precise moment it aligns with the stationary target capture gate.',
    whatItMeasures: 'This drill measures rotational alignment timing and angular trajectory tracking. It records your ability to synchronize motor action with predictable rotational motion.',
    tips: [
      'Track the beacon continuously for at least half a rotation before committing to your click.',
      'Click slightly ahead of the gate opening to compensate for natural finger actuation delay.',
      'Breathe rhythmically with the rotational tempo to build consistent timing.',
      'Watch for direction reversals that occur after every three successful synchronizations.',
    ],
    faq: [
      {
        question: 'Does the beacon orbit speed increase after successful hits?',
        answer: 'Yes, each consecutive successful synchronization increases orbital velocity by five percent.',
      },
      {
        question: 'What is the tolerance window around the target gate?',
        answer: 'The gate accepts hits within approximately twelve angular degrees of the exact alignment point.',
      },
      {
        question: 'Is this game better played with mouse or keyboard spacebar?',
        answer: 'The keyboard spacebar often provides faster down-stroke actuation for pure rotational timing.',
      },
    ],
  },

  'aim-laser-line': {
    objective: 'Rotate optical prism mirrors to route the continuous laser beam through all target receptor crystals.',
    whatItMeasures: 'This puzzle measures geometric ray reflection planning and angle adjustment precision. It tests spatial reasoning along with precise rotational angle controls.',
    tips: [
      'Remember that the angle of incidence always equals the angle of reflection across every mirror face.',
      'Work backwards from the final receptor crystal to determine which mirror must feed into it.',
      'Make tiny rotational tweaks to keep the laser focused on target centers without clipping obstacles.',
      'Clear secondary crystals along the beam path before attempting complex dual-bounce routes.',
    ],
    faq: [
      {
        question: 'Can the laser beam pass through other mirrors from behind?',
        answer: 'No, mirror backings are opaque and will block the laser beam completely if hit from behind.',
      },
      {
        question: 'How many mirrors are provided on each puzzle stage?',
        answer: 'Stages provide between three and eight movable prism mirrors depending on level complexity.',
      },
      {
        question: 'Is there a move limit or time limit in Laser Mirror Align?',
        answer: 'There is no strict timer; scoring is based on total time taken and least adjustments made.',
      },
    ],
  },

  'aim-bullseye-drop': {
    objective: 'Release falling supply crates so they land directly on moving conveyor target carts below.',
    whatItMeasures: 'This game measures vertical gravity lead calculation and intercept trajectory timing. It tests your judgment of falling acceleration against moving horizontal ground targets.',
    tips: [
      'Account for downward gravitational acceleration; crates drop faster the longer they fall.',
      'Release the crate when the target cart is roughly one crate-width before the drop line.',
      'Notice variations in cart speeds and adjust your lead distance accordingly.',
      'Avoid dropping crates when carts are turning around at track edges.',
    ],
    faq: [
      {
        question: 'Does crate weight vary between rounds?',
        answer: 'Standard crates have uniform mass, but later bonus rounds introduce heavy golden containers that fall faster.',
      },
      {
        question: 'How are bullseye accuracy points scored?',
        answer: 'Direct center hits earn 100 points, with partial edge landings awarding 25 to 50 points based on offset distance.',
      },
      {
        question: 'What happens if a crate misses the cart entirely?',
        answer: 'A dropped crate that hits the floor breaks your combo multiplier and loses one life.',
      },
    ],
  },

  'aim-micro-hover': {
    objective: 'Hold your cursor or stylus steadily inside a moving micro-circle without touching its perimeter boundaries.',
    whatItMeasures: 'This test measures fine motor stabilization and low-amplitude tracking accuracy. It records involuntary hand tremor and micro-adjustment control over sustained tracking paths.',
    tips: [
      'Grip your mouse or stylus lightly without clenching your fingers to minimize muscle tremor.',
      'Rest your forearm comfortably on the desk to provide a stable mechanical pivot point.',
      'Track the center point of the circle rather than watching its boundaries.',
      'Use slow, continuous wrist sweeps rather than jerky micro-corrections.',
    ],
    faq: [
      {
        question: 'How does the game track steady holding?',
        answer: 'The engine samples cursor coordinates every millisecond and deducts stability points whenever the pointer leaves the target zone.',
      },
      {
        question: 'Does pointer acceleration interfere with Micro Steady Hand?',
        answer: 'Yes, turning off "Enhance Pointer Precision" in your operating system provides true 1:1 hardware tracking.',
      },
      {
        question: 'How long does each tracking trial last?',
        answer: 'Standard trials run for fifteen seconds of continuous movement across winding paths.',
      },
    ],
  },

  'aim-dart-throw': {
    objective: 'Flick your cursor with precise velocity and release angle to plant darts into the dartboard bullseye.',
    whatItMeasures: 'This game measures gesture flick release speed and angular directional consistency. It benchmarks kinetic gesture control in simulated projectile mechanics.',
    tips: [
      'Swipe straight forward through the center line of the dartboard for optimal directional stability.',
      'Vary your swipe speed rather than distance to control dart trajectory depth.',
      'Release smoothly at the apex of your upward swipe to avoid downward pull.',
      'Practice landing three consecutive darts in the triple-20 ring to build muscle memory.',
    ],
    faq: [
      {
        question: 'How is throwing power measured from the mouse swipe?',
        answer: 'The release velocity is calculated from the pixel distance covered in the final 50 milliseconds of your flick gesture.',
      },
      {
        question: 'Can crosswinds affect the dart path?',
        answer: 'Advanced stages introduce gentle horizontal wind gusts indicated by a directional arrow at the top of the board.',
      },
      {
        question: 'Are standard 501 dart rules supported?',
        answer: 'The primary game mode is an arcade high-score target shootout, with an optional 301 countdown mode available.',
      },
    ],
  },

  'aim-needle-threader': {
    objective: 'Steer a continuous thread line through alternating narrow needle eyes moving in opposite directions.',
    whatItMeasures: 'This game measures horizontal precision tracking and rhythmic clearance timing. It tests your ability to guide a continuous trace through moving spatial bottlenecks.',
    tips: [
      'Focus on the upcoming eye three seconds before your thread reaches its opening.',
      'Make vertical adjustments early so the thread enters horizontally flat rather than at a steep angle.',
      'Do not over-correct if you enter slightly off-center; gentle steering prevents perimeter grazing.',
      'Keep your eyes on the needle eye center rather than looking back at the completed thread path.',
    ],
    faq: [
      {
        question: 'What happens if the thread touches the metal needle eye?',
        answer: 'Grazing the needle edge snaps the thread and ends the round immediately.',
      },
      {
        question: 'Do the needle eyes change in width as you progress?',
        answer: 'Yes, the eye openings narrow progressively as your score crosses milestones at 10, 25, and 50 needles.',
      },
      {
        question: 'Can the thread speed be paused or slowed down?',
        answer: 'Thread forward velocity is constant, requiring real-time steering adjustments without pausing.',
      },
    ],
  },

  'aim-gravity-sling': {
    objective: 'Launch probes through planetary gravitational fields to collect cosmic beacons and hit the destination wormhole.',
    whatItMeasures: 'This simulator measures orbital curve prediction and gravitational vector modulation. It benchmarks intuitive understanding of orbital pull and slingshot physics.',
    tips: [
      'Use the dotted trajectory forecast line to observe how planet gravity wells bend your probe path.',
      'Launch close to a massive planet to achieve a fast slingshot acceleration boost.',
      'Avoid orbits that graze planet surfaces too closely, as atmospheric drag will collapse your probe.',
      'Aim for the outer edge of gravitational wells to achieve gentle curving deflections.',
    ],
    faq: [
      {
        question: 'How does planet mass influence probe trajectory in Gravity Slingshot?',
        answer: 'Larger, denser planets exert stronger gravitational pull, curving your flight path into tighter orbital arcs.',
      },
      {
        question: 'Can you adjust probe trajectory once launched?',
        answer: 'No, launches are ballistic. All angle and thrust settings must be locked in before releasing the launch catapult.',
      },
      {
        question: 'How do you earn three stars on gravity levels?',
        answer: 'Collect all three floating orbital energy crystals before entering the destination wormhole in a single launch.',
      },
    ],
  },
};
