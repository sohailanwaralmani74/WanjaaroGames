import { GameExtraContent } from './types';

export const STRATEGY_CONTENT: Record<string, GameExtraContent> = {
  'strategy-tic-tac-toe': {
    objective: 'Place three matching marks in a continuous horizontal, vertical, or diagonal row against an adaptive AI opponent.',
    whatItMeasures: 'This game measures minimax adversarial planning and fork detection. It tests your ability to anticipate opponent responses and block fork opportunities.',
    tips: [
      'Take the center square on your first turn whenever it is available to maximize future winning lines.',
      'If your opponent opens in the center, always play a corner square to prevent immediate traps.',
      'Create "forks"—scenarios with two simultaneous winning lines that your opponent cannot block at once.',
      'Watch opposing moves carefully to block two-in-a-row threats before making aggressive plays.',
    ],
    faq: [
      {
        question: 'Can the Smart AI be beaten on impossible difficulty?',
        answer: 'Under strict minimax play, standard Tic-Tac-Toe is a mathematically solved game where flawless play always results in a draw.',
      },
      {
        question: 'Are there multiple difficulty settings?',
        answer: 'Yes, you can toggle between casual mode (which makes occasional blunders) and master mode (which plays optimal minimax strategy).',
      },
      {
        question: 'Do you play as X or O?',
        answer: 'You play as X by default and move first, with an option to toggle turn order in the match settings.',
      },
    ],
  },

  'strategy-connect-four': {
    objective: 'Drop colored discs into the vertical grid to form an unbroken line of four pieces while preventing your opponent from doing so.',
    whatItMeasures: 'This game measures vertical gravity column planning and parity trap creation. It tests how you control central columns and avoid giving your opponent setup moves.',
    tips: [
      'Control the center column (column 4); central discs participate in the highest number of potential winning lines.',
      'Never drop a disc directly beneath your opponent\'s potential fourth winning square unless forced to.',
      'Build multiple overlapping threats on both horizontal and diagonal planes simultaneously.',
      'Keep track of odd versus even column parity when playing as player one or player two.',
    ],
    faq: [
      {
        question: 'What is the grid size in Four in a Line?',
        answer: 'The standard board contains 7 vertical columns and 6 horizontal rows for a total of 42 playable slots.',
      },
      {
        question: 'Can winning lines be formed diagonally?',
        answer: 'Yes, lines of four can be formed horizontally, vertically, or along either diagonal orientation.',
      },
      {
        question: 'Who moves first in match play?',
        answer: 'Player one moves first with yellow discs, followed by the computer opponent playing red discs.',
      },
    ],
  },

  'strategy-nim-matches': {
    objective: 'Remove matchsticks from any single heap on your turn to force your opponent into taking the final matchstick.',
    whatItMeasures: 'This mathematical game measures binary digital sums (nim-sum XOR calculation) and end-game state control. It benchmarks your application of combinatorial game theory principles.',
    tips: [
      'Calculate the binary XOR sum of heap sizes; an even nim-sum (zero) represents a winning balanced position.',
      'Always leave your opponent in a state with an XOR sum of zero at the end of your turn.',
      'In the endgame with only isolated single matches left, leave an odd number of heaps containing one match.',
      'Force your opponent into 1-1, 2-2, or 1-2-3 symmetrical positions.',
    ],
    faq: [
      {
        question: 'What is the difference between normal play and misère play in Nim?',
        answer: 'In this misère version, the player forced to pick up the very last matchstick loses the game.',
      },
      {
        question: 'Can you take matchsticks from multiple heaps in one turn?',
        answer: 'No, standard Nim rules state you may take as many matches as you wish, but only from one single heap per turn.',
      },
      {
        question: 'How many heaps are used in Game of Nim?',
        answer: 'Standard matches feature three heaps containing 3, 5, and 7 matchsticks respectively.',
      },
    ],
  },

  'strategy-reversi-mini': {
    objective: 'Outflank opposing discs between your own to flip them over, finishing the match with majority board control.',
    whatItMeasures: 'This board game measures boundary stability evaluation and positional sacrifice strategy. It evaluates your control of stable corner anchors versus temporary disc counts.',
    tips: [
      'Capture corner squares at all costs; corner discs can never be flipped over by your opponent.',
      'Avoid playing adjacent to open corners (the "C-squares" and "X-squares") unless you are certain to capture the corner next turn.',
      'Minimize early disc flips; having fewer discs in the mid-game leaves your opponent with fewer legal move options.',
      'Control stable edges that connect directly into secured corners.',
    ],
    faq: [
      {
        question: 'What grid size is used in Mini Reversi?',
        answer: 'This compact version uses a 6x6 grid (36 squares) for faster, high-intensity tactical rounds.',
      },
      {
        question: 'What happens if a player has no legal moves?',
        answer: 'If you have no moves that outflank at least one opposing disc, your turn passes automatically to your opponent.',
      },
      {
        question: 'How does the game end in Mini Reversi?',
        answer: 'The game concludes when all 36 squares are filled or when neither player can make a legal move.',
      },
    ],
  },

  'strategy-rock-paper-scissors': {
    objective: 'Predict your opponent\'s cyclic tendencies and counter their choices across a 15-round strategic match.',
    whatItMeasures: 'This behavioral game measures non-verbal pattern detection and psychological adaptation. It benchmarks your ability to exploit non-random human or AI frequency biases.',
    tips: [
      'People frequently repeat winning throws and cycle forward after losing throws.',
      'Track your opponent\'s past three choices to anticipate whether they play in cyclic (Rock-Paper-Scissors) order.',
      'Break your own predictable rhythms by introducing intentional counter-intuitive choices.',
      'Observe whether the AI shifts strategies after falling two points behind.',
    ],
    faq: [
      {
        question: 'Does the AI use a true random number generator in this game?',
        answer: 'The Predictive Master AI uses a Markov transition model that tracks your history and predicts your next throw based on past habits.',
      },
      {
        question: 'How many rounds make up a complete match?',
        answer: 'Matches are played as best of 15 rounds, displaying live win-loss-tie percentages throughout.',
      },
      {
        question: 'What happens on a tie?',
        answer: 'Ties award zero points to both players and advance the round counter without breaking win streaks.',
      },
    ],
  },

  'strategy-dots-boxes': {
    objective: 'Connect adjacent dots with lines to complete the fourth wall of 1x1 boxes and claim territory.',
    whatItMeasures: 'This grid strategy game measures sacrifice management and chain-capturing tactics. It evaluates your ability to manage long corridors without surrendering control of the initiative.',
    tips: [
      'Avoid placing the third side of any box unless you can immediately capture it on your next move.',
      'Force your opponent into opening up closed corridors containing long runs of claimable boxes.',
      'Use the "double-cross" strategy: sacrifice two boxes at the end of a chain to retain control of the next corridor.',
      'Count the number of long chains on the board to decide whether to play an odd or even endgame.',
    ],
    faq: [
      {
        question: 'Do you get an extra turn when completing a box in Dots and Boxes?',
        answer: 'Yes, completing any box awards one point and grants you an immediate bonus line placement.',
      },
      {
        question: 'What grid dimensions are used in this version?',
        answer: 'Matches use a 4x4 dot grid (creating a 3x3 territory of 9 boxes) for fast tactical decision-making.',
      },
      {
        question: 'How do you claim ownership of a completed box?',
        answer: 'When the fourth boundary is drawn, your player color fills the box interior with your initial.',
      },
    ],
  },

  'strategy-hex-conquer': {
    objective: 'Connect your two opposite board edges with an unbroken chain of adjacent colored hexagonal tiles.',
    whatItMeasures: 'This connection game measures topology connectivity planning and path blocking. It benchmarks your construction of un-blockable virtual connections and bridge templates.',
    tips: [
      'Use two-space "bridge" configurations; if your opponent enters one open gap, you immediately take the other.',
      'Balance offensive path progression with defensive blocking moves across opposing diagonal corridors.',
      'Control central hexagonal tiles early to maximize your branching route choices.',
      'Remember that draws are mathematically impossible in Hex; one player must always form a connection.',
    ],
    faq: [
      {
        question: 'Can a match of Hex ever end in a draw?',
        answer: 'No, John Nash mathematically proved that the game of Hex can never end in a draw; one player will always complete a path.',
      },
      {
        question: 'Which edges belong to which player?',
        answer: 'Player one connects North to South with gold tiles, while player two connects West to East with blue tiles.',
      },
      {
        question: 'What is a "bridge" in Hex strategy?',
        answer: 'A bridge consists of two stones separated by two shared empty hexes, guaranteeing connection because the opponent cannot block both.',
      },
    ],
  },

  'strategy-mini-chess-puzzle': {
    objective: 'Identify and execute the decisive mate-in-one chess move from tactical endgame positions.',
    whatItMeasures: 'This chess trainer measures tactical checkmate pattern recognition and piece interaction calculation. It benchmarks how quickly you spot escape square restrictions and unprotected king lines.',
    tips: [
      'Identify all flight squares around the defending king before calculating checks.',
      'Look for double checks delivered by moving an attacking piece that also unmasks a rear line check.',
      'Check whether the defending king has friendly pieces blocking its potential escape squares.',
      'Ensure the checking piece cannot be captured by any enemy piece on the board.',
    ],
    faq: [
      {
        question: 'What chess rating corresponds to these mate-in-one puzzles?',
        answer: 'Puzzles range from beginner patterns (500–800 Elo) to subtle quiet checkmates (1000–1200 Elo).',
      },
      {
        question: 'What happens if you play a check that is not checkmate?',
        answer: 'Any move that does not deliver immediate mate-in-one is marked incorrect and restarts the puzzle timer.',
      },
      {
        question: 'Can you castle or promote pawns in these puzzles?',
        answer: 'Yes, select endgame positions require pawn promotion to Queen or Knight to deliver checkmate.',
      },
    ],
  },
};
