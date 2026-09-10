// @ts-check

/**
 * Runs the manipulations of a test - scripted, or a random sequence of them
 * (the "monkey") - and checks after every single one that:
 * - the page did not throw (an uncaught error takes the whole editor down),
 * - the editor still shows what it is editing (`helper.check`),
 * - the manipulation did what it was supposed to do.
 *
 * Everything specific to an editor comes from its helper (see the table in
 * README.md, and `helpers/SpriteEditor.js` for a complete example): the
 * manipulations, how to read what is displayed, and how to check it.
 */

const { closeAnyOverlay } = require('./PageDriver');
const { findKnownIssue } = require('./KnownIssues');

/** A reproducible pseudo random number generator. */
const makeRandom = seed => {
  let state = seed * 7919 + 13;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
};

/**
 * What the manipulations may change, as the helper reads it - so that a
 * manipulation that did nothing can be told apart from one that worked.
 */
const takeSnapshot = async (page, helper) =>
  helper.snapshot ? await helper.snapshot(page) : await helper.describe(page);

/** Run one manipulation and check everything afterwards. */
const runStep = async ({
  page,
  pageErrors,
  helper,
  actionName,
  args,
  random,
}) => {
  const action = helper.actions[actionName];
  if (!action)
    throw new Error(
      `Unknown manipulation "${actionName}" for the ${helper.name} helper.`
    );

  const stateBefore = await helper.describe(page);
  const stepArgs =
    args || (action.pick ? action.pick(stateBefore, random) : {});
  if (!stepArgs) return { skipped: 'not applicable' };

  const description = action.describe(stepArgs);
  const snapshotBefore = await takeSnapshot(page, helper);
  const expectation = action.expect
    ? action.expect(stateBefore, stepArgs)
    : null;

  let problem = null;
  try {
    problem = await action.run(page, stepArgs);
  } catch (error) {
    problem = `the manipulation threw: ${(error.message || String(error)).slice(
      0,
      200
    )}`;
  }
  if (pageErrors.length) return { description, crashed: true };
  if (problem) return { description, skipped: problem };

  const { problems } = await helper.check(page);
  const snapshotAfter = await takeSnapshot(page, helper);
  const hadNoEffect =
    JSON.stringify(snapshotBefore) === JSON.stringify(snapshotAfter);
  const effect = hadNoEffect
    ? 'nothing changed'
    : helper.describeEffect
    ? helper.describeEffect(snapshotBefore, snapshotAfter)
    : 'something changed';

  if (action.mustChangeTheObject && hadNoEffect)
    problems.push('the object was not changed');

  if (expectation && helper.checkExpectation)
    problems.push(...helper.checkExpectation(expectation, snapshotAfter));

  // The invariants the helper declares (see `helper.stepChecks` in README.md):
  // each one is checked after every manipulation flagged with its name.
  const stepChecks = helper.stepChecks || {};
  for (const checkName of Object.keys(stepChecks)) {
    if (!action[checkName]) continue;
    problems.push(
      ...(await stepChecks[checkName]({
        page,
        snapshotBefore,
        snapshotAfter,
        hadNoEffect,
      }))
    );
  }

  return {
    description,
    problems,
    effect,
    hadNoEffect,
    isDrop: !!action.mayHaveNoEffect,
  };
};

/** Report a step that went wrong, as a failure or as a known issue. */
const reportStepResult = ({ reporter, result, prefix, pageErrors }) => {
  if (result.crashed) {
    const message = pageErrors[0] || '';
    const knownIssue = findKnownIssue(message);
    if (knownIssue) {
      reporter.log(
        `   ⚠️ ${prefix}${
          result.description
        }: the editor was taken down by a ` + `known issue (${knownIssue.name})`
      );
      reporter.log(`      ${message.split('\n')[0]}`);
      return { failures: [], knownIssues: [`${knownIssue.name}`] };
    }
    reporter.log(`   💥 ${prefix}${result.description}: THE EDITOR CRASHED`);
    message
      .split('\n')
      .slice(0, 6)
      .forEach(line => reporter.log(`      ${line.trim()}`));
    return {
      failures: [`crash after: ${result.description}`],
      knownIssues: [],
    };
  }
  if (result.problems.length) {
    reporter.log(`   ❌ ${prefix}${result.description}`);
    result.problems.forEach(problem => reporter.log(`      ${problem}`));
    return {
      failures: result.problems.map(
        problem => `${result.description}: ${problem}`
      ),
      knownIssues: [],
    };
  }
  return { failures: [], knownIssues: [] };
};

/** Run the scripted manipulations of a test. */
const runSteps = async ({ page, pageErrors, helper, steps, reporter }) => {
  const random = makeRandom(1);
  const failures = [];
  const knownIssues = [];
  let performed = 0;
  let skipped = 0;
  let drops = 0;
  let effectiveDrops = 0;

  for (const [actionName, args] of steps) {
    const result = await runStep({
      page,
      pageErrors,
      helper,
      actionName,
      args,
      random,
    });
    if (result.skipped) {
      skipped++;
      reporter.log(
        `   • ${result.description || actionName}: skipped (${result.skipped})`
      );
      continue;
    }
    performed++;
    if (result.isDrop) {
      drops++;
      if (!result.hadNoEffect) effectiveDrops++;
    }
    const stepResult = reportStepResult({
      reporter,
      result,
      prefix: '',
      pageErrors,
    });
    failures.push(...stepResult.failures);
    knownIssues.push(...stepResult.knownIssues);
    if (stepResult.failures.length || stepResult.knownIssues.length) break;
    reporter.log(`   ✓ ${result.description} → ${result.effect}`);
  }

  if (drops > 0 && effectiveDrops === 0 && !knownIssues.length) {
    failures.push('none of the drag and drops moved anything');
    reporter.log('   ❌ none of the drag and drops moved anything');
  }
  return { failures, knownIssues, performed, skipped };
};

/** Run a random sequence of manipulations. */
const runMonkey = async ({
  page,
  pageErrors,
  helper,
  seed,
  steps,
  actionNames,
  reporter,
  verbose,
}) => {
  const random = makeRandom(seed);
  const weights = helper.monkeyWeights;
  const weighted = [];
  (actionNames || Object.keys(weights)).forEach(name => {
    for (let index = 0; index < (weights[name] || 1); index++)
      weighted.push(name);
  });

  const failures = [];
  const knownIssues = [];
  let performed = 0;
  let skipped = 0;
  for (
    let step = 0;
    step < steps && !failures.length && !knownIssues.length;
    step++
  ) {
    if (await closeAnyOverlay(page)) continue;

    const actionName = weighted[Math.floor(random() * weighted.length)];
    const result = await runStep({
      page,
      pageErrors,
      helper,
      actionName,
      args: null,
      random,
    });
    if (result.skipped) {
      skipped++;
      continue;
    }
    performed++;
    const stepResult = reportStepResult({
      reporter,
      result,
      prefix: `step ${step + 1}, `,
      pageErrors,
    });
    failures.push(...stepResult.failures);
    knownIssues.push(...stepResult.knownIssues);
    if (stepResult.failures.length || stepResult.knownIssues.length) break;
    if (verbose || step % 10 === 0)
      reporter.log(
        `   ✓ step ${step + 1}: ${result.description} → ${result.effect}`
      );
  }
  return { failures, knownIssues, performed, skipped };
};

module.exports = { makeRandom, runStep, runSteps, runMonkey };
