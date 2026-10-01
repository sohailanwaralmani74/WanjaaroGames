import { GameExtraContent } from './types';

export const LOGIC_CONTENT: Record<string, GameExtraContent> = {
  'logic-lights-out': {
    objective: 'Toggle grid cells until every single light in the matrix is completely turned off.',
    whatItMeasures: 'This puzzle measures binary state logic and modular matrix arithmetic. It tests your ability to plan orthogonal toggle cascades where clicking one light flips its four immediate neighbors.',
    tips: [
      'Remember that clicking any cell twice cancels itself out; each light should be toggled at most once.',
      'Work systematically from the top row downward, chasing lit cells to the bottom row.',
      'Study bottom-row residue patterns to determine which top-row cells need adjustment to solve the grid.',
      'Keep track of corner cells, as they affect only three neighboring lights rather than five.',
    ],
    faq: [
      {
        question: 'Is every starting Lights Out board solvable?',
        answer: 'All puzzle configurations generated on Wanjaaro are guaranteed mathematically solvable from their starting state.',
      },
      {
        question: 'What is the "chasing lights" strategy?',
        answer: 'Chasing lights involves toggling the cell directly underneath any illuminated light row by row until all lights reach the bottom row.',
      },
      {
        question: 'How is performance rated in Lights Out Matrix?',
        answer: 'Puzzles are scored based on the total number of moves taken compared to the mathematical minimum move count.',
      },
    ],
  },

  'logic-sliding-15': {
    objective: 'Slide numbered tiles one space at a time into the empty slot to arrange numbers 1 through 8 or 15 in numerical order.',
    whatItMeasures: 'This puzzle measures combinatorial state manipulation and sequential spatial planning. It benchmarks your efficiency at navigating physical grid constraints to assemble an ordered layout.',
    tips: [
      'Solve the top row first from left to right, locking numbers in their final positions.',
      'Solve the left-most column next, reducing the remaining puzzle into a smaller sub-grid.',
      'To insert the final two numbers in a row, line them up vertically then rotate them into place together.',
      'Never move completed top-row numbers once they are anchored in position.',
    ],
    faq: [
      {
        question: 'Are all sliding tile shuffles solvable?',
        answer: 'Only permutations with an even parity of inversions are solvable; all boards generated here are verified solvable.',
      },
      {
        question: 'What is the difference between the 8-puzzle and 15-puzzle?',
        answer: 'The 8-puzzle uses a 3x3 grid (8 tiles), while the 15-puzzle uses a 4x4 grid (15 tiles) requiring more planning steps.',
      },
      {
        question: 'Can you slide multiple tiles at once in a line?',
        answer: 'Yes, clicking a tile in the same row or column as the open slot pushes all intermediate tiles in a single stroke.',
      },
    ],
  },

  'logic-tower-hanoi': {
    objective: 'Transfer the entire stack of graduated discs from the first peg to the third peg without ever placing a larger disc on a smaller one.',
    whatItMeasures: 'This mathematical puzzle measures recursive problem-solving and hierarchical state planning. It tests your ability to decompose a large objective into nested sub-goals.',
    tips: [
      'For an odd number of discs, make your very first move directly to the destination peg.',
      'For an even number of discs, make your very first move to the middle auxiliary peg.',
      'Alternate between moving the smallest disc and the only other legally movable disc.',
      'The smallest disc should always circulate in one consistent direction across the three pegs.',
    ],
    faq: [
      {
        question: 'What is the minimum number of moves to solve Tower of Hanoi?',
        answer: 'The theoretical minimum is 2^n - 1 moves, where n is the number of discs (e.g. 7 moves for 3 discs, 31 moves for 5 discs).',
      },
      {
        question: 'Can you place a larger disc on top of a smaller disc?',
        answer: 'No, placing a larger disc onto a smaller one is an illegal move and rejected by the game engine.',
      },
      {
        question: 'How many discs can be selected in this version?',
        answer: 'You can choose between 3 discs (beginner), 4 discs (intermediate), and 5 or 6 discs (advanced challenge).',
      },
    ],
  },

  'logic-water-pour': {
    objective: 'Fill, empty, and pour water between two un-marked jugs to measure out an exact requested target volume.',
    whatItMeasures: 'This classic riddle measures Euclidean state-space search and arithmetic transfer logic. It evaluates how you combine container capacities to reach an exact numerical difference.',
    tips: [
      'Repeatedly fill the larger jug, pour into the smaller jug until full, and empty the smaller jug when full.',
      'Observe the greatest common divisor between the two jug sizes to understand step progression.',
      'Work forwards from empty containers or backwards from the target volume.',
      'Keep track of how much remaining capacity is left in the destination jug before pouring.',
    ],
    faq: [
      {
        question: 'Can you partially fill a jug by guessing?',
        answer: 'No, jugs have no measurement marks. You can only fill a jug completely, empty it completely, or pour until the recipient is full.',
      },
      {
        question: 'What is a famous example of this puzzle?',
        answer: 'The 3-gallon and 5-gallon jug puzzle was famously featured in the film Die Hard with a Vengeance to measure exactly 4 gallons.',
      },
      {
        question: 'How is efficiency scored in Water Jug Riddle?',
        answer: 'Scores reflect the least total pour, fill, and empty actions needed to produce the target volume.',
      },
    ],
  },

  'logic-binary-flip': {
    objective: 'Toggle individual bit switches (0 and 1) along the byte row to match the requested decimal integer target.',
    whatItMeasures: 'This drill measures binary-to-decimal base conversion and powers-of-two mental arithmetic. It tests your fluency with binary place values (128, 64, 32, 16, 8, 4, 2, 1).',
    tips: [
      'Compare your target number to 128; if greater or equal, toggle the 128 bit on and subtract 128 from your running sum.',
      'Continue down the powers of two (64, 32, 16, etc.), toggling bits that fit into your remaining balance.',
      'Remember that odd decimal numbers always require the final 1-bit to be turned on.',
      'Familiarize yourself with power-of-two additions to calculate 8-bit bytes rapidly.',
    ],
    faq: [
      {
        question: 'What is the maximum decimal number you can build with an 8-bit byte?',
        answer: 'An 8-bit byte with all bits toggled to 1 equals 255 (128 + 64 + 32 + 16 + 8 + 4 + 2 + 1).',
      },
      {
        question: 'Does the game support reverse mode (binary to decimal)?',
        answer: 'Yes, an alternating mode displays active binary switches and asks you to enter the equivalent decimal sum.',
      },
      {
        question: 'How much time do you get per conversion problem?',
        answer: 'Sprint mode gives you 15 seconds per conversion, with speed bonuses for answers submitted under 5 seconds.',
      },
    ],
  },

  'logic-pipes-connect': {
    objective: 'Rotate pipe segments across the grid to establish an unbroken, leak-free conduit from source valve to drain exit.',
    whatItMeasures: 'This puzzle measures network topology visualization and path continuity planning. It evaluates how you align rotational connections so flow travels without dead ends.',
    tips: [
      'Start connecting from the fixed source valve and the fixed destination drain first.',
      'Examine corner pipes along outer grid walls, as their orientations are strictly limited by boundaries.',
      'Ensure every branch of T-junctions feeds into a valid connector rather than hitting a blank wall.',
      'Double check all loop closures before turning the master water valve on.',
    ],
    faq: [
      {
        question: 'What happens when water is released into the pipe network?',
        answer: 'Water flows through all valid connected segments. If it reaches an open end, it leaks and docks points.',
      },
      {
        question: 'Can there be unused pipe segments left over on the grid?',
        answer: 'Some complex puzzle levels include decorative dead-end pipe tiles that do not need to connect to the main line.',
      },
      {
        question: 'How do you rotate a pipe segment?',
        answer: 'Click or tap any pipe tile to rotate it 90 degrees clockwise; double-click rotates 180 degrees.',
      },
    ],
  },

  'logic-mini-sokoban': {
    objective: 'Push all cargo crates onto their designated diamond storage goal pads in the warehouse in minimum steps.',
    whatItMeasures: 'This puzzle measures spatial constraint navigation and non-reversible move planning. Because crates can only be pushed and never pulled, it tests forward move consequence analysis.',
    tips: [
      'Never push a crate into a wall corner unless that corner is an actual designated goal pad.',
      'Avoid pushing two crates side-by-side against a flat wall, which locks both crates permanently.',
      'Plan your worker clearance routes so you can access the pushing side of every crate.',
      'Fill the furthest storage pads first so already-stored crates do not block remaining pathways.',
    ],
    faq: [
      {
        question: 'Can you pull a crate backward if you make a mistake?',
        answer: 'Crates can only be pushed forward. However, you can use the Undo button to step backward move by move.',
      },
      {
        question: 'What happens if a crate becomes stuck against a wall?',
        answer: 'If a crate cannot be legally moved onto a goal, the puzzle enters a deadlock and must be undone or restarted.',
      },
      {
        question: 'What controls are supported in Crate Pusher Sokoban?',
        answer: 'You can navigate your warehouse worker using keyboard arrow keys, WASD, or on-screen directional touch pads.',
      },
    ],
  },

  'logic-knights-tour': {
    objective: 'Guide the chess knight to visit as many squares on the board as possible without landing on any square twice.',
    whatItMeasures: 'This classic chess problem measures graph traversal and constraint satisfaction. It tests your application of Warnsdorff heuristic rules across L-shaped knight moves.',
    tips: [
      'Apply Warnsdorff rule: always move the knight to the square with the fewest remaining legal exits.',
      'Tour outer board perimeter squares and corners early, as they are the hardest to reach later.',
      'Avoid jumping toward the board center early, as central squares provide vital transit routes for the endgame.',
      'Look two moves ahead to ensure your destination square does not leave your knight completely stranded.',
    ],
    faq: [
      {
        question: 'What is a full Knight Tour?',
        answer: 'A full tour visits every single square on the board (e.g. all 64 squares on an 8x8 board) exactly once.',
      },
      {
        question: 'How does the chess knight move?',
        answer: 'The knight moves in an "L-shape": two squares in one cardinal direction followed by one square perpendicular.',
      },
      {
        question: 'What grid sizes are available in Knight Leap Puzzle?',
        answer: 'You can start on a smaller 5x5 board (25 squares) to learn the heuristic before graduating to a full 8x8 chessboard.',
      },
    ],
  },

  'sudoku': {
    objective: 'Fill the 9x9 grid so every row, column, and 3x3 subgrid contains digits 1 through 9 with zero repeats.',
    whatItMeasures: 'This number puzzle measures deductive constraint satisfaction and logical candidate elimination. It benchmarks systematic elimination reasoning without guessing.',
    tips: [
      'Scan for "naked singles"—cells where eight other digits are already present in that row, column, or 3x3 block.',
      'Use pencil candidate notes in cells that have only two or three possibilities.',
      'Look for "hidden singles"—a digit that only has one legal location remaining inside an entire 3x3 box.',
      'Identify "naked pairs" sharing identical candidates in a line to eliminate those numbers from neighboring cells.',
    ],
    faq: [
      {
        question: 'Do you ever need to guess to solve a Sudoku puzzle on Wanjaaro?',
        answer: 'No, every puzzle on Wanjaaro is handcrafted to possess a unique solution reachable through pure logical deduction.',
      },
      {
        question: 'What is the benchmark time for solving a medium 9x9 Sudoku grid?',
        answer: 'Recreational solvers typically complete a standard grid in 12 to 18 minutes; competitive tournament solvers finish in under 5 minutes.',
      },
      {
        question: 'What tools are built into the game board?',
        answer: 'The board includes pencil note mode, conflict highlighting, undo/redo history, and digit completion indicators.',
      },
    ],
    benchmark: {
      metric: 'Single-digit deduction completion time',
      average: '12 – 18 minutes (Standard 9x9)',
      elite: '< 5 minutes',
      source: 'World Puzzle Federation (WPF) World Sudoku Championship scoring standard for medium 9x9 grids',
    },
  },

  'nonogram': {
    objective: 'Use row and column numerical run clues to deduce which cells to fill and which to cross out, revealing a pixel illustration.',
    whatItMeasures: 'This Japanese picture puzzle measures cross-referencing logic and binary grid deduction. It evaluates how you intersect row and column line run constraints.',
    tips: [
      'Begin by solving rows or columns where the clue sum plus intervening spaces equals the full grid length.',
      'Use overlap logic: when a single run is greater than half the line length, the middle squares must always be filled.',
      'Always mark guaranteed empty cells with an X to prevent accidental fills and narrow down remaining options.',
      'Cross-check row markings against column clues immediately after filling any square.',
    ],
    faq: [
      {
        question: 'What does a clue of "3 2" mean in a Nonogram puzzle?',
        answer: 'It indicates a run of 3 consecutive filled cells, followed by at least one empty space, followed by a run of 2 filled cells.',
      },
      {
        question: 'Can you make mistakes without losing the game?',
        answer: 'Mistake checking mode gives you up to three penalty strikes for incorrectly filled squares before round end.',
      },
      {
        question: 'What sizes of picture grids are available?',
        answer: 'Puzzles start with beginner 5x5 grids and expand up to detailed 15x15 pixel art pictures.',
      },
    ],
  },

  'daily-puzzle': {
    objective: 'Group 16 related words into four secret thematic quartets within four allowable mistake lives.',
    whatItMeasures: 'This daily challenge measures semantic categorization and associative reasoning. It benchmarks your ability to identify shared conceptual themes while resisting deceptive overlap traps.',
    tips: [
      'Watch out for words that seem to fit into two distinct categories; find unambiguous groups first.',
      'Check for wordplay themes like compound words, homophones, rhymes, or missing prefixes.',
      'Do not guess randomly; if you are unsure, look for an anchor word that can only belong to one domain.',
      'Submit groups in order of confidence to preserve your four mistake lives for tricky remaining words.',
    ],
    faq: [
      {
        question: 'When does the Daily Mind Puzzle reset with a new board?',
        answer: 'A new handcrafted 16-word board unlocks every single midnight based on your local device calendar date.',
      },
      {
        question: 'Can you share your daily result with friends?',
        answer: 'Yes, after solving or completing the board, you can copy formatted emoji color tiles to share your solve streak.',
      },
      {
        question: 'How are the four secret categories color-coded?',
        answer: 'Categories range in difficulty from yellow (straightforward) and green, to blue, and purple (tricky wordplay or trivia).',
      },
    ],
  },
};
