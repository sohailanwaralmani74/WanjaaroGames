import { GameExtraContent } from './types';

export const VISUAL_CONTENT: Record<string, GameExtraContent> = {
  'visual-shape-rotate': {
    objective: 'Determine whether a rotated 3D polygon is an exact rotation or a mirrored reflection of the target shape.',
    whatItMeasures: 'This test measures mental rotation capability and 3D spatial transformation speed. It benchmarks how accurately you mentally manipulate three-dimensional objects in space.',
    tips: [
      'Pick one distinct protruding feature or colored face and mentally track where it would land after rotation.',
      'Check the handedness of corners: if a point turns clockwise on the original, it must remain clockwise on a true rotation.',
      'Use keyboard shortcut keys (Left for "Mirrored", Right for "Rotated") for fastest response times.',
      'Do not try to rotate the entire object at once; focus on two connected perpendicular edges.',
    ],
    faq: [
      {
        question: 'What is mental rotation in spatial cognitive psychology?',
        answer: 'First quantified by Shepard and Metzler in 1971, mental rotation describes the internal process of rotating 2D or 3D mental representations.',
      },
      {
        question: 'What rotation angles are tested in this challenge?',
        answer: 'Angles range from 45° to 315° across all three rotational axes (yaw, pitch, and roll).',
      },
      {
        question: 'How does response time correlate with rotation angle?',
        answer: 'Response latency typically increases linearly with the degrees of rotation needed to align the shapes.',
      },
    ],
  },

  'visual-symmetry-match': {
    objective: 'Complete the missing half of a symmetrical pixel art grid across a central vertical or horizontal mirror axis.',
    whatItMeasures: 'This game measures bilateral symmetry perception and coordinate mirror reflection. It tests your accuracy in translating coordinates across a reflection axis.',
    tips: [
      'Count outward from the center mirror line rather than counting inward from the outer wall.',
      'Paint pixel blocks in symmetrical pairs: one unit left of center maps to one unit right of center.',
      'Look at overall silhouette outlines before filling internal decorative pixel squares.',
      'Use drag-to-paint to fill continuous symmetrical lines swiftly.',
    ],
    faq: [
      {
        question: 'Can the mirror axis be horizontal as well as vertical?',
        answer: 'Yes, early stages use vertical reflection axes, while advanced levels introduce horizontal and diagonal mirror axes.',
      },
      {
        question: 'What grid sizes are used in Symmetry Mirror Painter?',
        answer: 'Grids scale from 8x8 pixels on casual puzzles up to 16x16 pixels on complex tapestries.',
      },
      {
        question: 'How is painting accuracy scored?',
        answer: 'Scores reflect the percentage of correctly placed mirror pixels minus deductions for misplaced blocks.',
      },
    ],
  },

  'visual-tangled-lines': {
    objective: 'Drag vertex nodes across the canvas until no two connecting line segments cross or intersect each other.',
    whatItMeasures: 'This puzzle measures planar graph untangling and topology visualization. It evaluates your spatial reorganization of intersecting nodes into non-overlapping planar embeddings.',
    tips: [
      'Move nodes with the highest number of connecting edges toward the outside perimeter of the circle.',
      'Place nodes with few connections near the center where they are less likely to cross paths.',
      'Look for triangles or loops of three nodes and spread their corners wide apart.',
      'Work on resolving one intersecting line crossover at a time rather than shifting everything at once.',
    ],
    faq: [
      {
        question: 'Is every graph in Planar Graph Untangler guaranteed to be solvable?',
        answer: 'Yes, all generated graphs are mathematically planar, meaning they can always be untangled with zero line crossings.',
      },
      {
        question: 'How do you know when a line is untangled?',
        answer: 'Intersecting lines glow bright red, while fully cleared non-intersecting lines turn solid emerald green.',
      },
      {
        question: 'What is the Kuratowski theorem related to planar graphs?',
        answer: 'Kuratowski\'s theorem states that a finite graph is planar if and only if it does not contain subdivisions of K5 or K3,3 utility graphs.',
      },
    ],
  },

  'visual-maze-runner': {
    objective: 'Navigate your traveler marker through the labyrinth corridors from start to exit in minimum time without backtracking.',
    whatItMeasures: 'This game measures visual path-finding and dead-end recognition. It benchmarks your forward scanning velocity across complex branching corridor networks.',
    tips: [
      'Trace backward from the exit toward the start to eliminate dead-end branches before moving.',
      'Look two junctions ahead while navigating to avoid entering obvious blind alleys.',
      'Use smooth continuous mouse dragging or directional keys to glide through straight corridors.',
      'Ignore narrow loops that do not advance toward the exit quadrant.',
    ],
    faq: [
      {
        question: 'Are there multiple routes to the exit in Micro Labyrinth Pathfinder?',
        answer: 'Standard mazes are "perfect mazes" with exactly one unique, loop-free path connecting start and exit.',
      },
      {
        question: 'What controls are supported for moving the traveler?',
        answer: 'You can guide your traveler using keyboard arrow keys, WASD, or direct mouse and touch pointer dragging.',
      },
      {
        question: 'Does the game track total steps taken?',
        answer: 'Yes, scores evaluate total transit time along with step efficiency compared to the shortest route.',
      },
    ],
  },

  'visual-color-harmony': {
    objective: 'Arrange scrambled color gradient swatches into a seamless, smoothly transitioning spectrum row.',
    whatItMeasures: 'This visual test measures fine hue graduation perception and tonal transition sensitivity. It benchmarks your discrimination of continuous chrominance gradients (Farnsworth-Munsell style).',
    tips: [
      'Anchor the fixed endpoint swatches first; they serve as your color benchmarks.',
      'Look for the swatch with the closest visual brightness and saturation to the anchor.',
      'Step back slightly from your screen if two adjacent tiles look identical.',
      'Place swatches roughly into three tonal groups (dark, mid, light) before fine-tuning exact order.',
    ],
    faq: [
      {
        question: 'What color spaces are used in Spectrum Hue Sorter?',
        answer: 'Gradients cycle through high-fidelity LCH and Lab color spaces to ensure perceptually uniform step increments.',
      },
      {
        question: 'How is score precision evaluated?',
        answer: 'Your score calculates total placement error distance from the mathematically ideal gradient order.',
      },
      {
        question: 'Is this test similar to the Farnsworth-Munsell 100 Hue Test?',
        answer: 'Yes, it adapts the principles of the Farnsworth-Munsell test into fast, engaging digital sorting rows.',
      },
    ],
  },

  'visual-tangram-fit': {
    objective: 'Rotate and fit all geometric tans into the target silhouette without any pieces overlapping or sticking out.',
    whatItMeasures: 'This geometric puzzle measures shape decomposition and polygon assembly. It tests how you partition a solid silhouette into constituent triangles, squares, and parallelograms.',
    tips: [
      'Place the two largest triangles first; they consume the majority of the silhouette area.',
      'Look for 90-degree corners in the target silhouette to anchor the square and medium triangle.',
      'Remember that the parallelogram can be flipped horizontally to change its slant orientation.',
      'Rotate pieces in 45-degree increments to test fit against straight boundary edges.',
    ],
    faq: [
      {
        question: 'What are the seven traditional tangram pieces (tans)?',
        answer: 'A classic tangram set consists of two large triangles, one medium triangle, two small triangles, one square, and one parallelogram.',
      },
      {
        question: 'Can pieces overlap each other on the board?',
        answer: 'No, all seven pieces must lay flat edge-to-edge within the silhouette with zero overlapping boundaries.',
      },
      {
        question: 'How do you rotate a piece on desktop and mobile?',
        answer: 'Click or tap a selected piece to rotate it in 45-degree steps, or use dedicated rotation buttons on mobile.',
      },
    ],
  },

  'visual-perimeter-guess': {
    objective: 'Compare two irregular geometric polygons and determine which one possesses the longer outer perimeter.',
    whatItMeasures: 'This geometry drill measures contour length estimation and perimeter scaling perception. It evaluates your judgment of total boundary distance across jagged versus smooth shapes.',
    tips: [
      'Remember that jagged shapes with many indentations have longer perimeters than smooth shapes of equal area.',
      'Mentally unfold line segments into straight lines to compare total length.',
      'Do not be fooled by overall surface area; a thin star can have a much larger perimeter than a fat circle.',
      'Count the number of sharp vertices; each indentation adds substantial perimeter distance.',
    ],
    faq: [
      {
        question: 'What is the difference between area and perimeter in this game?',
        answer: 'Area measures the internal surface space, while perimeter measures strictly the continuous outer boundary distance.',
      },
      {
        question: 'Can two shapes have equal perimeters in Perimeter Length Comparer?',
        answer: 'Select bonus rounds feature identical perimeters to test whether you can recognize parity despite unequal areas.',
      },
      {
        question: 'How is performance rated?',
        answer: 'Scores reflect accuracy percentage and average judgment latency across 10 progressive shape pairs.',
      },
    ],
  },

  'visual-mirror-reflection': {
    objective: 'Plot the exact Cartesian coordinates of a point after reflecting it across a diagonal or cardinal mirror line.',
    whatItMeasures: 'This spatial drill measures Cartesian coordinate transformation and reflection geometry. It tests your calculation of mirrored coordinate pairs (x, y) across varying reflection axes.',
    tips: [
      'When reflecting over the vertical y-axis, invert the sign of the x-coordinate: (x, y) becomes (-x, y).',
      'When reflecting over the horizontal x-axis, invert the sign of the y-coordinate: (x, y) becomes (x, -y).',
      'When reflecting over the diagonal line y = x, swap the coordinates completely: (x, y) becomes (y, x).',
      'Measure the perpendicular distance from the point to the mirror line; the reflection lies at the exact same distance on the opposite side.',
    ],
    faq: [
      {
        question: 'What coordinate axes are featured in Mirror Coordinate Plotter?',
        answer: 'Problems feature standard Cartesian grids with reflections across x=0, y=0, y=x, and offset parallel lines.',
      },
      {
        question: 'How do you submit your answer?',
        answer: 'Click directly on the destination grid intersection point, or type the coordinates into the input box.',
      },
      {
        question: 'What happens if you click one grid unit off?',
        answer: 'The system highlights your offset error in red and displays the correct mathematical reflection line.',
      },
    ],
  },
};
