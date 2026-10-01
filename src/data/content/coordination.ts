import { GameExtraContent } from './types';

export const COORDINATION_CONTENT: Record<string, GameExtraContent> = {
  'coord-rhythm-tap': {
    objective: 'Tap in exact sync with the musical beat marker as it passes through the center alignment target.',
    whatItMeasures: 'This game measures auditory-motor tempo synchronization and millisecond rhythmic pacing. It records your timing delta relative to steady metronome beats.',
    tips: [
      'Internalize the tempo by nodding or tapping your foot slightly ahead of the first hit.',
      'Tap to the audio click rather than relying solely on visual marker position.',
      'Maintain a consistent down-stroke speed rather than hesitating as the beat arrives.',
      'Avoid drifting ahead of the beat (rushing) when tempo increases.',
    ],
    faq: [
      {
        question: 'How is timing precision measured in BPM Metronome Tap?',
        answer: 'Taps within 25 milliseconds of the beat center earn "Perfect" ratings; taps within 50ms score "Good".',
      },
      {
        question: 'Do tempos change mid-song?',
        answer: 'Stages maintain steady BPM tempos ranging from slow 60 BPM ballads to energetic 140 BPM techno tracks.',
      },
      {
        question: 'Can you use the spacebar to tap instead of a mouse click?',
        answer: 'Yes, keyboard spacebar input is supported and recommended for stable tactile rhythm tapping.',
      },
    ],
  },

  'coord-dual-hand-sync': {
    objective: 'Steer two independent orbs along parallel twisting tracks simultaneously using separate controls for each hand.',
    whatItMeasures: 'This test measures bimanual motor coordination and split visual attention. It benchmarks your ability to guide two independent paths without allowing one hand to mirror the other.',
    tips: [
      'Keep your eyes focused between the two tracks rather than staring fixedly at one side.',
      'Use the A/D keys for the left track and Left/Right arrow keys for the right track.',
      'Make gentle, continuous turns rather than sudden jerky steering snaps.',
      'Anticipate sharp turns two track segments ahead to coordinate hand transitions.',
    ],
    faq: [
      {
        question: 'What happens if one orb touches a track border?',
        answer: 'Grazing a track border costs one life out of three shields and temporarily pauses that track for half a second.',
      },
      {
        question: 'Are the left and right tracks identical or mirrored?',
        answer: 'Tracks follow asymmetric curves to prevent simple mirror movements, forcing true dual-hand independence.',
      },
      {
        question: 'Can this game be played with two touch thumbs on mobile?',
        answer: 'Yes, dual on-screen touch steering zones allow intuitive thumb control on phones and tablets.',
      },
    ],
  },

  'coord-ball-balance': {
    objective: 'Keep a rolling metal ball balanced on a tilting platform for as long as possible without letting it fall off.',
    whatItMeasures: 'This simulation measures dynamic equilibrium control and corrective counter-steering. It evaluates how you modulate tilt angles to stabilize a moving rolling mass.',
    tips: [
      'Make tiny, gentle counter-tilts; aggressive movements will cause the ball to pick up uncontrollable speed.',
      'Keep the ball near the center crosshair to give yourself recovery margin in every direction.',
      'When the ball begins rolling fast, tilt gently in the opposite direction before it reaches the outer perimeter.',
      'Breathe steadily and avoid over-reacting to small wobbles.',
    ],
    faq: [
      {
        question: 'Does the game support device gyroscope controls?',
        answer: 'On supported mobile devices, tilting your physical phone directly controls platform inclination via device orientation sensors.',
      },
      {
        question: 'How does ball friction affect rolling speed?',
        answer: 'The platform simulates low-friction polished metal, meaning momentum carries the ball smoothly across tilts.',
      },
      {
        question: 'Are there obstacles or wind gusts on the platform?',
        answer: 'Advanced survival stages introduce gentle platform wind gusts and moving surface bumper pegs.',
      },
    ],
  },

  'coord-orbit-jumper': {
    objective: 'Hop your traveler dot from one rotating planetary ring to another through open alignment windows.',
    whatItMeasures: 'This game measures orbital trajectory release timing and rotational phase coordination. It benchmarks your timing when transferring between spinning reference frames.',
    tips: [
      'Observe the rotation speeds of both the departure ring and destination ring before hopping.',
      'Hop when the rotating gap in your current ring aligns with an open gate on the next ring.',
      'Do not rush; complete a full rotation on your current ring if alignment is not clean.',
      'Account for traveler transit time across the inter-ring gap.',
    ],
    faq: [
      {
        question: 'Do rings rotate in the same direction?',
        answer: 'Adjacent rings alternate between clockwise and counter-clockwise rotations to test adaptive timing.',
      },
      {
        question: 'What happens if you hop into a ring wall instead of a gap?',
        answer: 'Impacting a solid wall deflects your traveler into outer space and ends the run.',
      },
      {
        question: 'How many concentric rings must you clear to complete a stage?',
        answer: 'Standard levels feature five concentric orbital rings, leading to a central destination core.',
      },
    ],
  },

  'coord-spiral-tracer': {
    objective: 'Trace a cursor or stylus continuously along a winding Archimedean spiral without straying outside the boundaries.',
    whatItMeasures: 'This test measures continuous curve tracking speed and fine motor contour tracing. It records spatial path error and deviation under continuous angular travel.',
    tips: [
      'Rest your wrist lightly on the surface to maintain smooth, continuous circular pivoting.',
      'Maintain a moderate, steady tracking speed rather than speeding up then stopping.',
      'Look slightly ahead of your cursor to anticipate the increasing radius of outer spiral loops.',
      'Use a stylus or mouse with a clean optical sensor for optimal continuous path fidelity.',
    ],
    faq: [
      {
        question: 'How is deviation measured in Spiral Curve Tracer?',
        answer: 'The engine records the pixel distance between your cursor and the mathematical center-line of the spiral path.',
      },
      {
        question: 'Does the spiral path widen or narrow as you progress?',
        answer: 'The path corridor narrows from 40 pixels on early loops down to 15 pixels on outer rings.',
      },
      {
        question: 'Is tracing time counted in the final score?',
        answer: 'Yes, your score combines total path completion percentage with elapsed completion time.',
      },
    ],
  },

  'coord-wave-sync': {
    objective: 'Adjust the amplitude and frequency dials of your wave generator to match an oscillating reference waveform.',
    whatItMeasures: 'This simulator measures dual-parameter continuous modulation and visual waveform phase alignment. It tests your simultaneous control of signal height and cycle frequency.',
    tips: [
      'Adjust frequency (wave cycle width) first to align wave peaks with the target reference.',
      'Tune amplitude (wave height) second to match peak and trough elevations.',
      'Observe where the wave crosses the horizontal zero-line to judge phase accuracy.',
      'Make fine dial tweaks once your wave is within 90% congruence.',
    ],
    faq: [
      {
        question: 'What controls are used to adjust the waveform dials?',
        answer: 'You can drag circular knob controls with your mouse/touch, or use left/right arrow keys to tune frequency and up/down for amplitude.',
      },
      {
        question: 'What congruence percentage is required to lock in a match?',
        answer: 'Reaching 95% waveform congruence for two continuous seconds triggers target lock-on and completes the round.',
      },
      {
        question: 'Are complex waveforms like square or sawtooth waves supported?',
        answer: 'Stages begin with fundamental sine waves and introduce square and triangle harmonic waves on advanced levels.',
      },
    ],
  },

  'coord-flappy-dot': {
    objective: 'Tap to flap your aerodynamic pulse upward through narrow gate clearances while gravity pulls you downward.',
    whatItMeasures: 'This arcade game measures vertical impulse frequency modulation and spatial clearance judgment. It benchmarks your ability to sustain level flight through alternating gravity and impulse pulses.',
    tips: [
      'Tap in small, measured pulses rather than letting the dot drop far before double-tapping.',
      'Aim to enter gates near their vertical center to maximize error tolerance on both ceiling and floor.',
      'Tap slightly before reaching a gate if you need to rise through an elevated opening.',
      'Keep a calm, relaxed tapping rhythm to prevent over-flapping into ceiling spikes.',
    ],
    faq: [
      {
        question: 'How does gravity acceleration work in Aero Pulse Flap?',
        answer: 'Gravity pulls downward with constant downward acceleration, while each tap imparts a fixed upward velocity burst.',
      },
      {
        question: 'Do gate openings become narrower as your score increases?',
        answer: 'Gate vertical gaps narrow gradually from 120 pixels down to 75 pixels after score milestones at 10 and 25 gates.',
      },
      {
        question: 'Is there any recovery if you graze a pipe gate?',
        answer: 'Any contact with gate edges or floor boundaries ends the run immediately, recording your highest gate count.',
      },
    ],
  },

  'coord-two-finger-cross': {
    objective: 'Synchronize two fingers to tap alternating left and right screen triggers in precise counter-phase timing.',
    whatItMeasures: 'This drill measures bimanual phase alternation and reciprocal tapping cadence. It benchmarks your ability to maintain a rapid, balanced 180-degree phase shift between two hands.',
    tips: [
      'Think of your fingers as walking legs: left, right, left, right in an unbroken gait.',
      'Tap with equal force on both sides to prevent one hand from dominating the cadence.',
      'Keep your finger lifts low to minimize travel time between alternating strokes.',
      'Focus on the metronome beat indicator to prevent tempo drift.',
    ],
    faq: [
      {
        question: 'Can you use a keyboard for Twin Gate Crossing?',
        answer: 'Yes, keyboard controls use the Z key for left gate and the M key for right gate.',
      },
      {
        question: 'What is a phase error in this game?',
        answer: 'A phase error occurs if both fingers tap simultaneously or if one finger taps twice in succession.',
      },
      {
        question: 'How long does a standard speed trial last?',
        answer: 'Standard sessions run for 20 seconds of continuous alternating tapping.',
      },
    ],
  },
};
