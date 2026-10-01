import { GameExtraContent } from './types';

export const MATH_CONTENT: Record<string, GameExtraContent> = {
  'math-speed-addition': {
    objective: 'Solve as many mental addition arithmetic problems as possible within a 60-second speed sprint.',
    whatItMeasures: 'This test measures mental arithmetic retrieval speed and numerical fact recall. It evaluates your speed at combining two-digit integers without scratch paper.',
    tips: [
      'Round numbers up to the nearest ten, add them, then subtract the rounding difference (e.g. 28 + 45 = 30 + 45 - 2 = 73).',
      'Use the numeric keypad (numpad) on your keyboard for the fastest single-handed data entry.',
      'Add the tens column first, then add the units column to maintain mental tally clarity.',
      'Do not stall on a tricky sum; enter your best quick estimate to keep the sprint moving.',
    ],
    faq: [
      {
        question: 'What range of numbers appears in Mental Math Sprint?',
        answer: 'Problems begin with single-digit sums and progressively scale to double-digit numbers up to 99.',
      },
      {
        question: 'Is scratch paper or an on-screen calculator permitted?',
        answer: 'No external aids are allowed; this drill tests purely internal working memory calculation.',
      },
      {
        question: 'What is a strong score for a 60-second addition sprint?',
        answer: 'Solving 25 to 35 problems correctly within 60 seconds represents solid fluency; mathletes exceed 45 correct answers.',
      },
    ],
  },

  'math-24-solver': {
    objective: 'Combine four dealt number cards using basic arithmetic (+, -, ×, ÷) to build an equation equal to exactly 24.',
    whatItMeasures: 'This game measures arithmetic factor exploration and flexible algebraic manipulation. It tests your ability to spot factors of 24 (like 3×8, 4×6, 2×12, or 24/1) among arbitrary digit sets.',
    tips: [
      'Look for ways to form classic factors of 24: such as 3 and 8, or 4 and 6, or 2 and 12.',
      'If you have a 3 and an 8, see if your remaining two cards can be combined to form 1 (e.g. 7 - 6 = 1).',
      'Look for fractions that multiply out, such as 8 / (1 - 1/3) = 24 on advanced puzzles.',
      'Try making numbers that subtract or add to 24 (such as 20 + 4, or 27 - 3).',
    ],
    faq: [
      {
        question: 'Must you use all four number cards in your equation?',
        answer: 'Yes, standard 24-game rules require you to use each of the four dealt numbers exactly once.',
      },
      {
        question: 'Are parentheses allowed to control order of operations?',
        answer: 'Yes, interactive parenthesis buttons allow you to nest operations cleanly before evaluating.',
      },
      {
        question: 'Is every dealt hand of four cards guaranteed to have a solution?',
        answer: 'All puzzle sets in this game are pre-filtered and mathematically verified to possess at least one valid solution.',
      },
    ],
  },

  'math-multiply-blitz': {
    objective: 'Answer rapid-fire single and double-digit multiplication facts before the countdown timer expires.',
    whatItMeasures: 'This drill measures multiplication table fluency and direct numerical retrieval. It benchmarks your reaction latency when recalling products from memory.',
    tips: [
      'Master your 9s trick: the sum of digits in the 9-times table always equals 9 (e.g. 9×7 = 63; 6+3 = 9).',
      'For multiplying by 12, multiply by 10 first and add double the original number (e.g. 12×7 = 70 + 14 = 84).',
      'Use the numeric keypad with your dominant hand to enter digits and strike Enter without looking down.',
      'Keep a steady cadence; hesitating on one question ruins your consecutive streak multiplier.',
    ],
    faq: [
      {
        question: 'What multiplication tables are tested in Times Table Blitz?',
        answer: 'Problems cover all times tables from 2×2 up to 15×15 across progressive difficulty tiers.',
      },
      {
        question: 'How much time do you get per multiplication problem?',
        answer: 'Blitz mode gives you 5 seconds per problem, rewarding faster answers with higher combo points.',
      },
      {
        question: 'What happens if you enter a wrong product?',
        answer: 'An incorrect answer resets your combo streak and displays the correct product for 1 second before advancing.',
      },
    ],
  },

  'math-prime-or-composite': {
    objective: 'Classify flashed whole numbers as either Prime or Composite as quickly and accurately as possible.',
    whatItMeasures: 'This math game measures divisibility rule application and number theory categorization. It tests your speed at checking small factor multiples (2, 3, 5, 7, 11).',
    tips: [
      'Any even number greater than 2 is immediately composite.',
      'Use the digit-sum rule for 3: if the sum of all digits is divisible by 3, the number is composite.',
      'Any number ending in 5 or 0 (other than 5 itself) is composite.',
      'Memorize tricky small primes under 100 like 53, 59, 61, 71, 73, 79, 83, 89, and 97.',
    ],
    faq: [
      {
        question: 'Is the number 1 considered a prime number?',
        answer: 'No, in mathematics 1 is neither prime nor composite; it has only one positive divisor.',
      },
      {
        question: 'Is the number 2 a prime number?',
        answer: 'Yes, 2 is the smallest prime number and the only even prime number in existence.',
      },
      {
        question: 'What is the highest number tested in Prime Detective?',
        answer: 'Standard mode tests numbers up to 150, with master stages testing three-digit numbers up to 500.',
      },
    ],
  },

  'math-missing-operator': {
    objective: 'Insert the correct mathematical operator (+, -, ×, ÷) that makes the given arithmetic equation true.',
    whatItMeasures: 'This drill measures arithmetic inverse reasoning and mental operation comparison. It benchmarks how quickly you evaluate which operator satisfies an equation balance.',
    tips: [
      'Compare the size of the result to the operands; a much larger result usually indicates multiplication.',
      'A result smaller than the first operand indicates subtraction or division.',
      'Check division first if the result is a clean integer and the first operand is a multiple of the second.',
      'Use keyboard keys (+, -, *, /) directly for instant submission.',
    ],
    faq: [
      {
        question: 'Are there ever fractions or decimals in Missing Operator Sign?',
        answer: 'Standard equations use clean integers with zero fractional remainders for all division operations.',
      },
      {
        question: 'Can equations feature multiple missing operators?',
        answer: 'Beginner stages feature one missing operator; advanced stages feature dual operators with standard order of operations.',
      },
      {
        question: 'How is your performance scored?',
        answer: 'Points are based on total equations correctly completed within the 60-second session.',
      },
    ],
  },

  'math-fraction-slice': {
    objective: 'Match numerical fractions with their corresponding visual pie chart slices or shaded sector diagrams.',
    whatItMeasures: 'This game measures visual-spatial fraction comprehension and proportional area estimation. It tests your conversion between symbolic fractions and geometric slice areas.',
    tips: [
      'Identify benchmark fractions first: 1/2 (half), 1/4 (quarter), and 3/4 (three-quarters).',
      'Count the total number of equal slices in the pie chart to find the denominator.',
      'Count the shaded slices to determine the numerator before simplifying the fraction.',
      'Look for simplified fractions (such as 2/4 reducing to 1/2 or 3/6 reducing to 1/2).',
    ],
    faq: [
      {
        question: 'Do fractions require reduction to lowest terms in Fraction Visual Matcher?',
        answer: 'Yes, options are presented in standard reduced form (e.g. 4/8 is presented as 1/2).',
      },
      {
        question: 'What shapes are used to represent fractions?',
        answer: 'Fractions are displayed across circular pie charts, horizontal rectangular bars, and segmented geometric grids.',
      },
      {
        question: 'Are improper fractions or mixed numbers included?',
        answer: 'Advanced stages include improper fractions greater than one (such as 5/4 or 1 1/2) using multiple pie charts.',
      },
    ],
  },

  'math-number-sequence': {
    objective: 'Identify the underlying mathematical pattern in the sequence and enter the next correct number.',
    whatItMeasures: 'This puzzle measures inductive sequence extrapolation and series rule detection. It benchmarks your recognition of arithmetic progressions, geometric ratios, and Fibonacci-style patterns.',
    tips: [
      'Calculate the difference between adjacent terms to see if the step is an arithmetic constant (e.g. +3, +5, +7).',
      'Check ratios between terms to see if the sequence is multiplying by a fixed factor (e.g. ×2 or ×3).',
      'Look for alternating patterns where odd and even positions follow two independent series.',
      'Check for squared numbers (1, 4, 9, 16, 25, 36) or Fibonacci sums where each term is the sum of the previous two.',
    ],
    faq: [
      {
        question: 'What types of sequences are generated in Number Sequence Extrapolator?',
        answer: 'Sequences include linear progressions, quadratic step differences, geometric multipliers, and alternating sequences.',
      },
      {
        question: 'How many terms are provided to deduce the pattern?',
        answer: 'Each problem displays between four and six sequential numbers before the missing target blank.',
      },
      {
        question: 'What happens if you enter an incorrect next number?',
        answer: 'A hint button unlocks showing the differences between existing terms, and your time score is penalized.',
      },
    ],
  },

  'math-sum-target': {
    objective: 'Select a subset of numbers from the grid whose combined sum equals the designated target value.',
    whatItMeasures: 'This puzzle measures subset sum combinatorial arithmetic and addition grouping. It tests your ability to filter through number sets to find exact sum combinations under time constraints.',
    tips: [
      'Look for numbers with units digits that add up to the units digit of your target.',
      'Pair large numbers with small numbers to stay close to the target range without overshooting.',
      'Exclude numbers that are strictly larger than the requested target sum immediately.',
      'Look for clean tens pairs (like 3 + 7 = 10, or 4 + 6 = 10) to make mental math faster.',
    ],
    faq: [
      {
        question: 'Can you select any quantity of numbers to reach the sum?',
        answer: 'Yes, unless a stage explicitly specifies a 2-card or 3-card constraint, any combination that equals the target is valid.',
      },
      {
        question: 'What grid size is used in Sum Target Matrix?',
        answer: 'Numbers are arranged on a 3x3 or 4x4 matrix containing values between 1 and 50.',
      },
      {
        question: 'Is there always at least one valid combination on the board?',
        answer: 'Yes, boards are generated with guaranteed valid subsets that equal the target value.',
      },
    ],
  },
};
