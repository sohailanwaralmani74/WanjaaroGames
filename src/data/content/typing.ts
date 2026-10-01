import { GameExtraContent } from './types';

export const TYPING_CONTENT: Record<string, GameExtraContent> = {
  'typing-speed-words': {
    objective: 'Type words accurately across a continuous 60-second typing sprint to achieve high words per minute.',
    whatItMeasures: 'This test measures net typing speed (WPM) and keystroke accuracy. It benchmarks your bimanual keyboard fluency across common English vocabulary.',
    tips: [
      'Focus on error-free typing first; rhythm and speed naturally follow from high accuracy.',
      'Read one or two words ahead of what your fingers are actively typing.',
      'Keep your wrists elevated slightly above the desk to prevent dragging fatigue.',
      'Use all ten fingers on their standard home-row positions rather than hunting and pecking.',
    ],
    faq: [
      {
        question: 'How is net words per minute (WPM) calculated?',
        answer: 'One word is standardized as five keystrokes. Net WPM is calculated as (Gross Words - Uncorrected Errors) divided by elapsed minutes.',
      },
      {
        question: 'What is considered a good typing speed for general users?',
        answer: 'The average adult types between 40 and 55 WPM, while professional transcriptionists and programmers often reach 80 to 100+ WPM.',
      },
      {
        question: 'Does the test penalize backspacing to correct typos?',
        answer: 'You can backspace to fix errors before pressing space, but fixing mistakes consumes valuable sprint seconds.',
      },
    ],
    benchmark: {
      metric: 'Net words per minute (WPM)',
      average: '40 – 55 WPM',
      elite: '100+ WPM',
      source: 'International typing speed distribution statistics (99th percentile touch typists)',
    },
  },

  'typing-falling-letters': {
    objective: 'Type falling letter raindrops before they touch the ground to protect your defensive baseline.',
    whatItMeasures: 'This game measures peripheral letter recognition and reactive keystroke speed. It evaluates how quickly you translate falling visual glyphs into immediate key actuations.',
    tips: [
      'Prioritize letters closest to the bottom of the arena over newly spawned letters at the top.',
      'Keep both hands anchored on home row so you never have to look down at your keyboard.',
      'Type letters with quick, crisp taps rather than pressing and holding keys.',
      'When multiple letters are close to landing, type them in bottom-to-top order.',
    ],
    faq: [
      {
        question: 'Do capital letters require the Shift key in Falling Letter Rain?',
        answer: 'Standard rounds are case-insensitive, but bonus storms introduce capital letters requiring precise Shift coordination.',
      },
      {
        question: 'How many missed letters are allowed before game over?',
        answer: 'You have three shield lives; each letter that touches the ground absorbs one life shield.',
      },
      {
        question: 'Does letter fall speed increase as you score higher?',
        answer: 'Yes, rain velocity accelerates every 20 cleared letters, demanding faster visual processing.',
      },
    ],
  },

  'typing-anagram-rush': {
    objective: 'Rearrange the scrambled letter tiles to form as many valid dictionary words as possible before the timer runs out.',
    whatItMeasures: 'This word puzzle measures anagram vocabulary parsing and lexical flexibility. It benchmarks your speed at unscrambling letter groups into correct words.',
    tips: [
      'Look for common prefixes (un-, re-, pre-) and suffixes (-ed, -ing, -er) among the scrambled letters.',
      'Rearrange vowels and consonants into alternating patterns to spark word recognition.',
      'Submit shorter 3-letter and 4-letter words early to build momentum and banked time.',
      'Shuffle the letters using the spacebar if you get stuck on a difficult rack.',
    ],
    faq: [
      {
        question: 'What dictionary is used to validate submitted anagrams?',
        answer: 'Submissions are verified against standard Scrabble and tournament word lists (TWL06 / CSW).',
      },
      {
        question: 'Do longer words award bonus points in Anagram Rush?',
        answer: 'Yes, points scale exponentially: a 6-letter word awards four times more points than two 3-letter words.',
      },
      {
        question: 'Can letters be reused more than once per word?',
        answer: 'You can only use each letter tile as many times as it appears in the scrambled rack for that round.',
      },
    ],
  },

  'typing-reverse-echo': {
    objective: 'Read words displayed on screen and type their letters backward in exact reverse order.',
    whatItMeasures: 'This drill measures mental spelling inversion and lexical manipulation. It challenges your ability to break apart a word and reverse its character order before typing.',
    tips: [
      'Read the word from right to left in your mind before striking the first key.',
      'Spell out suffixes first (for example, typing "g-n-i" for words ending in "-ing").',
      'Do not rush; one wrong letter ruins the reverse sequence and requires backspacing.',
      'Whisper the reversed letter sounds to yourself to maintain character order.',
    ],
    faq: [
      {
        question: 'What is an example of Reverse Typist gameplay?',
        answer: 'If the prompt shows "PLANET", you must immediately type "TENALP" followed by the Enter or Space key.',
      },
      {
        question: 'Does word length increase on higher levels?',
        answer: 'Rounds begin with 3-letter words and progressively advance to complex 8-letter vocabulary.',
      },
      {
        question: 'How does Reverse Typist score performance?',
        answer: 'Points are based on words correctly inverted per minute along with accuracy percentages.',
      },
    ],
  },

  'typing-alphabet-sprint': {
    objective: 'Type all 26 letters of the English alphabet from A to Z in consecutive order as fast as humanly possible.',
    whatItMeasures: 'This sprint measures full-keyboard finger travel time and sequential alphabetic motor memory. It records your millisecond execution time across the entire keyboard layout.',
    tips: [
      'Memorize your finger assignments for tricky letters like Q, X, and Z in advance.',
      'Keep your typing pressure light so your hands float effortlessly across keyboard rows.',
      'Practice transitioning smoothly between the left and right hands (e.g. from B to C to D).',
      'Maintain an unbroken rhythmic cadence rather than pausing between letters.',
    ],
    faq: [
      {
        question: 'What is a competitive time for typing the alphabet A to Z?',
        answer: 'Most everyday typists finish in 4 to 6 seconds; elite keyboard sprinters complete the full alphabet in under 2 seconds.',
      },
      {
        question: 'What happens if you type an incorrect letter?',
        answer: 'The timer continues running while the screen flashes red until the correct consecutive letter is entered.',
      },
      {
        question: 'Can you use a mechanical or laptop keyboard?',
        answer: 'Any standard QWERTY, Dvorak, or Colemak physical keyboard is supported, with low-profile keys often enabling faster finger glides.',
      },
    ],
  },

  'typing-code-symbols': {
    objective: 'Type programming syntax, curly brackets, operators, and special symbols quickly and accurately.',
    whatItMeasures: 'This trainer measures special character keyboard navigation and Shift-key coordination. It benchmarks your precision with punctuation keys and programming syntax.',
    tips: [
      'Use your opposite hand to hold down the Shift key when typing uppercase symbols (like $ or &).',
      'Familiarize yourself with the number-row symbol layout without glancing down at your fingers.',
      'Keep your wrists grounded to maintain accurate spatial awareness of brackets and semicolons.',
      'Focus on accuracy over raw speed, as symbol typos require awkward correction keystrokes.',
    ],
    faq: [
      {
        question: 'Which programming languages are featured in Syntax Striker?',
        answer: 'Snippets include common expressions from JavaScript, Python, TypeScript, HTML, and CSS.',
      },
      {
        question: 'Are indentation tabs and spaces tested?',
        answer: 'Standard tabs and spaces are automatically aligned so you can focus strictly on syntax characters.',
      },
      {
        question: 'Why is symbol typing typically slower than plain word typing?',
        answer: 'Symbols require pinky finger stretches and simultaneous Shift key presses that break standard home-row flow.',
      },
    ],
  },

  'typing-word-chain': {
    objective: 'Type a new valid word that begins with the exact ending letter of the previous word before the clock expires.',
    whatItMeasures: 'This game measures vocabulary retrieval speed and associative orthographic recall. It challenges your active vocabulary search under strict time limits.',
    tips: [
      'Think of common ending letters (like -E, -T, -S) and pre-load words that begin with those characters.',
      'Keep words short and punchy (4 to 5 letters) to conserve precious seconds on the countdown.',
      'Avoid ending words with rare letters like X, J, or Q unless you already have a follow-up word ready.',
      'Type and press Enter immediately; do not spend extra time crafting fancy vocabulary.',
    ],
    faq: [
      {
        question: 'Can you repeat a word that was used earlier in the same chain?',
        answer: 'No, every word in a single session must be unique; repeating a previously used word is rejected.',
      },
      {
        question: 'How much time do you get per link in the chain?',
        answer: 'You start with 8 seconds per word, with the timer shaving off half a second every five links.',
      },
      {
        question: 'What constitutes a valid word submission?',
        answer: 'Submissions must be recognized dictionary words of at least three letters, excluding proper nouns and abbreviations.',
      },
    ],
  },

  'typing-pangram-hunt': {
    objective: 'Type out sentences containing every letter of the alphabet to practice comprehensive keyboard coverage.',
    whatItMeasures: 'This benchmark measures complete keyboard layout coverage and typing accuracy across varied sentence structures. It tests how well you transition across rare and common letter pairings.',
    tips: [
      'Pay close attention to rare letters like Z, Q, and X within sentences to avoid sudden hesitation.',
      'Maintain an even typing cadence throughout the entire sentence rather than sprinting then stalling.',
      'Keep your eyes on the upcoming phrase segment to prepare your finger positions in advance.',
      'Review your post-test error heat map to identify which specific key pairs caused slowdowns.',
    ],
    faq: [
      {
        question: 'What is a pangram in the context of typing practice?',
        answer: 'A pangram is a coherent sentence that contains every letter of the alphabet at least once (e.g. "The quick brown fox jumps over the lazy dog").',
      },
      {
        question: 'How long are the pangram sentences in this drill?',
        answer: 'Sentences range from compact 35-letter pangrams up to rich 65-letter descriptive sentences.',
      },
      {
        question: 'How does capitalization and punctuation work?',
        answer: 'Sentences include standard initial capital letters and ending periods to reflect authentic everyday typing conditions.',
      },
    ],
  },
};
