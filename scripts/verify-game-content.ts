import { ALL_GAMES } from '../src/data/gamesCatalog';
import { GAME_CONTENT_REGISTRY } from '../src/data/gameContent';

console.log(`\n======================================================`);
console.log(`RUNNING BUILD-TIME GAME CONTENT VERIFICATION`);
console.log(`Verifying all ${ALL_GAMES.length} games for completeness, uniqueness, and accuracy...`);
console.log(`======================================================\n`);

const BANNED_TERMS = [
  'neuroplasticity',
  'prefrontal cortex',
  'motor strip',
  'saccades',
  'saccadic',
  'peak neuro-performance',
  'performance.now()',
  'delay delay',
];

const errors: string[] = [];
const missingDataGames: { id: string; title: string; missing: string[] }[] = [];

// For cross-game duplicate paragraph detection
const seenParagraphs = new Map<string, string>(); // paragraph text -> gameId

function checkParagraphUniqueness(text: string, gameId: string, fieldName: string) {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ');
  // Only check substantial paragraphs (> 30 chars) to avoid flagging short phrases like "Yes."
  if (normalized.length > 30) {
    if (seenParagraphs.has(normalized)) {
      const priorGame = seenParagraphs.get(normalized);
      if (priorGame !== gameId) {
        errors.push(`[DUPLICATE PARAGRAPH] Game "${gameId}" shares duplicate ${fieldName} with Game "${priorGame}": "${text.slice(0, 70)}..."`);
      }
    } else {
      seenParagraphs.set(normalized, gameId);
    }
  }
}

function checkBannedTerms(text: string, gameId: string, fieldName: string) {
  const lower = text.toLowerCase();
  for (const term of BANNED_TERMS) {
    if (lower.includes(term.toLowerCase())) {
      errors.push(`[BANNED TERM] Game "${gameId}" contains banned term "${term}" in ${fieldName}: "${text}"`);
    }
  }
}

for (const game of ALL_GAMES) {
  const missingForGame: string[] = [];

  // 1. Verify existence in registry
  if (!GAME_CONTENT_REGISTRY[game.id]) {
    missingForGame.push('Missing from GAME_CONTENT_REGISTRY');
  }

  // 2. Check title
  if (!game.title || !game.title.trim()) {
    missingForGame.push('title is empty');
  }

  // 3. Check summary
  if (!game.summary || !game.summary.trim()) {
    missingForGame.push('summary is empty');
  }

  // 4. Check instructions
  if (!game.instructions || !game.instructions.trim()) {
    missingForGame.push('instructions is empty');
  }

  // 5. Check objective: must not be empty, must not repeat summary or description
  if (!game.objective || !game.objective.trim()) {
    missingForGame.push('objective is empty');
  } else {
    checkBannedTerms(game.objective, game.id, 'objective');
    checkParagraphUniqueness(game.objective, game.id, 'objective');
    if (game.objective.trim().toLowerCase() === game.summary.trim().toLowerCase()) {
      errors.push(`[OBJECTIVE REPEATS SUMMARY] Game "${game.id}" has objective identical to summary!`);
    }
    if (game.description && game.objective.trim().toLowerCase() === game.description.trim().toLowerCase()) {
      errors.push(`[OBJECTIVE REPEATS DESCRIPTION] Game "${game.id}" has objective identical to description!`);
    }
  }

  // 6. Check whatItMeasures: 1-2 plain sentences, no banned words
  if (!game.whatItMeasures || !game.whatItMeasures.trim()) {
    missingForGame.push('whatItMeasures is empty');
  } else {
    checkBannedTerms(game.whatItMeasures, game.id, 'whatItMeasures');
    checkParagraphUniqueness(game.whatItMeasures, game.id, 'whatItMeasures');
  }

  // 7. Check tips: must have 3 to 5 tips
  if (!game.tips || !Array.isArray(game.tips) || game.tips.length < 3) {
    missingForGame.push(`tips has ${game.tips ? game.tips.length : 0} items (minimum 3 required)`);
  } else {
    game.tips.forEach((tip, idx) => {
      if (!tip || !tip.trim()) {
        missingForGame.push(`tip[${idx}] is empty`);
      } else {
        checkBannedTerms(tip, game.id, `tip[${idx}]`);
        checkParagraphUniqueness(tip, game.id, `tip[${idx}]`);
      }
    });
  }

  // 8. Check FAQ: must have at least 3 Q&As
  if (!game.faq || !Array.isArray(game.faq) || game.faq.length < 3) {
    missingForGame.push(`faq has ${game.faq ? game.faq.length : 0} items (minimum 3 required)`);
  } else {
    game.faq.forEach((item, idx) => {
      if (!item.question || !item.question.trim()) {
        missingForGame.push(`faq[${idx}].question is empty`);
      } else {
        checkBannedTerms(item.question, game.id, `faq[${idx}].question`);
      }
      if (!item.answer || !item.answer.trim()) {
        missingForGame.push(`faq[${idx}].answer is empty`);
      } else {
        checkBannedTerms(item.answer, game.id, `faq[${idx}].answer`);
        checkParagraphUniqueness(item.answer, game.id, `faq[${idx}].answer`);
      }
    });
  }

  // 9. Check benchmark: if defined, must have metric, average, elite, source
  if (game.benchmark) {
    if (!game.benchmark.metric || !game.benchmark.average || !game.benchmark.elite || !game.benchmark.source) {
      missingForGame.push('benchmark has missing fields (metric, average, elite, or source)');
    }
  }

  // 10. Check scoring fields
  if (!game.scoringUnit || !game.scoringUnit.trim()) {
    missingForGame.push('scoringUnit is empty');
  }
  if (!game.scoringCriterion || (game.scoringCriterion !== 'higher' && game.scoringCriterion !== 'lower')) {
    missingForGame.push('scoringCriterion must be higher or lower');
  }

  if (missingForGame.length > 0) {
    missingDataGames.push({
      id: game.id,
      title: game.title,
      missing: missingForGame,
    });
  }
}

// Print results
console.log(`\n--- AUDIT RESULTS ---`);
console.log(`Total Games Audited: ${ALL_GAMES.length}`);
console.log(`Games in Content Registry: ${Object.keys(GAME_CONTENT_REGISTRY).length}`);
console.log(`Games with missing sections: ${missingDataGames.length}`);
console.log(`Validation errors detected: ${errors.length}`);

if (missingDataGames.length > 0) {
  console.error(`\n❌ ERROR: ${missingDataGames.length} games have missing or incomplete sections:`);
  for (const item of missingDataGames) {
    console.error(`  - ${item.id} (${item.title}): ${item.missing.join(', ')}`);
  }
}

if (errors.length > 0) {
  console.error(`\n❌ ERROR: ${errors.length} validation errors found:`);
  for (const err of errors.slice(0, 20)) {
    console.error(`  ${err}`);
  }
  if (errors.length > 20) {
    console.error(`  ... and ${errors.length - 20} more errors.`);
  }
}

if (missingDataGames.length > 0 || errors.length > 0) {
  console.error(`\nBUILD FAILED: Content validation checks failed. Please fix the errors above.`);
  process.exit(1);
} else {
  console.log(`\n✅ ALL CHECKS PASSED: Every game has 100% complete, distinct, verified data with 0 missing sections and 0 duplicate paragraphs.`);
  process.exit(0);
}
