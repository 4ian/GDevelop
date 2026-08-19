// @ts-check

/**
 * Runs the steps of a test, or a random sequence of them (the "monkey"), and
 * checks after every single manipulation that:
 * - the page did not throw (a dangling C++ wrapper takes the whole editor down
 *   with a "memory access out of bounds" error),
 * - the editor is still there,
 * - what the editor displays is what the edited object contains (when the page
 *   exposes the animations of the object),
 * - the manipulation did what it was supposed to do.
 */

const { actions, describe, click, wait } = require('./SpriteEditorActions');

/** A reproducible pseudo random number generator. */
const makeRandom = seed => {
  let state = seed * 7919 + 13;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
};

const framesOf = (snapshot, position) => {
  const animation = snapshot.animations[position];
  if (!animation) return [];
  return animation.frames;
};

const summarizeAnimation = animation =>
  JSON.stringify({ name: animation.name, directions: animation.directions });

/** A short description of what a manipulation changed in the object. */
const describeEffect = (snapshotBefore, snapshotAfter) => {
  const before = snapshotBefore.animations;
  const after = snapshotAfter.animations;
  if (before.length !== after.length)
    return `${before.length} → ${after.length} animations`;

  const changes = [];
  before.forEach((animation, position) => {
    if (summarizeAnimation(animation) === summarizeAnimation(after[position]))
      return;
    const framesBefore = animation.frames;
    const framesAfter = after[position].frames;
    if (animation.name !== after[position].name)
      changes.push(`#${position} renamed "${after[position].name}"`);
    if (framesBefore.length !== framesAfter.length)
      changes.push(
        `#${position} ${framesBefore.length} → ${framesAfter.length} frames`
      );
    else if (framesBefore.join('|') !== framesAfter.join('|'))
      changes.push(`#${position} frames reordered`);
    else changes.push(`#${position} direction settings changed`);
  });
  return changes.length ? changes.join(', ') : 'nothing changed';
};

/**
 * The animations of the edited object when the page exposes them (Storybook),
 * or what the editor displays otherwise (real editor) - so that a manipulation
 * that did nothing can be told apart from one that worked in both cases.
 */
const takeSnapshot = async page => {
  const model = await page.evaluate(() =>
    window.gdVisualTests.readAnimations()
  );
  if (model)
    return {
      isFromTheObject: true,
      animations: model.map(animation => ({
        name: animation.name,
        frames: animation.directions[0] ? animation.directions[0].frames : [],
        directions: animation.directions,
      })),
    };

  const described = await describe(page);
  return {
    isFromTheObject: false,
    animations: described.rows.map(row => ({
      name: row.name,
      frames: row.frames.map(frame => frame.title),
      directions: [
        {
          frames: row.frames.map(frame => frame.title),
          timeBetweenFrames: Number(row.timeBetweenFrames),
          isLooping: row.isLooping,
        },
      ],
    })),
  };
};

const check = page => page.evaluate(() => window.gdVisualTests.check());

/** Run one manipulation and check everything afterwards. */
const runStep = async ({ page, pageErrors, actionName, args, random }) => {
  const action = actions[actionName];
  if (!action) throw new Error(`Unknown action: ${actionName}`);

  const stateBefore = await describe(page);
  const stepArgs =
    args || (action.pick ? action.pick(stateBefore, random) : {});
  if (!stepArgs) return { skipped: 'not applicable' };

  const description = action.describe(stepArgs);
  const snapshotBefore = await takeSnapshot(page);
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

  const { problems } = await check(page);
  const snapshotAfter = await takeSnapshot(page);
  const effect = describeEffect(snapshotBefore, snapshotAfter);
  const hadNoEffect = effect === 'nothing changed';

  if (action.mustChangeTheObject && hadNoEffect) {
    problems.push('the object was not changed');
  }

  if (expectation && snapshotAfter.isFromTheObject) {
    const framesAfter = framesOf(snapshotAfter, expectation.row);
    const expected = expectation.frames;
    if (expected && framesAfter.join('|') !== expected.join('|')) {
      problems.push(
        `the frames of the animation #${
          expectation.row
        } are [${framesAfter.join(', ')}] but [${expected.join(
          ', '
        )}] was expected`
      );
    }
    const prefix = expectation.framesStartWith;
    if (
      prefix &&
      framesAfter.slice(0, prefix.length).join('|') !== prefix.join('|')
    ) {
      problems.push(
        `the frames of the animation #${
          expectation.row
        } are [${framesAfter.join(
          ', '
        )}] but they should start with [${prefix.join(', ')}]`
      );
    }
    if (
      expectation.framesCount !== undefined &&
      framesAfter.length !== expectation.framesCount
    ) {
      problems.push(
        `the animation #${expectation.row} has ${framesAfter.length} frames ` +
          `but ${expectation.framesCount} were expected`
      );
    }
    const animationAfter = snapshotAfter.animations[expectation.row];
    const directionAfter = animationAfter && animationAfter.directions[0];
    if (
      directionAfter &&
      expectation.timeBetweenFrames !== undefined &&
      Math.abs(
        directionAfter.timeBetweenFrames - expectation.timeBetweenFrames
      ) > 0.0001
    ) {
      problems.push(
        `the animation #${expectation.row} now has ` +
          `${directionAfter.timeBetweenFrames}s between frames instead of ` +
          `${expectation.timeBetweenFrames}s`
      );
    }
    if (
      directionAfter &&
      expectation.isLooping !== undefined &&
      expectation.isLooping !== null &&
      directionAfter.isLooping !== expectation.isLooping
    ) {
      problems.push(
        `the looping of the animation #${expectation.row} became ` +
          `${String(directionAfter.isLooping)}`
      );
    }
  }

  // A change of the animations must not leave frames selected: the selection
  // designates them by their index, which would point at other frames.
  if (action.clearsTheFrameSelection && !hadNoEffect) {
    const stateAfter = await describe(page);
    const stillSelected = stateAfter.rows
      .map(row =>
        row.frames
          .filter(frame => frame.selected)
          .map(frame => `#${row.index} ${frame.title}`)
      )
      .reduce((all, some) => all.concat(some), []);
    if (stillSelected.length) {
      problems.push(
        `${stillSelected.length} frame(s) are still shown as selected after ` +
          `the animations changed: ${stillSelected.join(', ')}`
      );
    }
  }

  if (action.keepsTheFrames) {
    const allFrames = snapshot =>
      snapshot.animations
        .map(animation => animation.frames)
        .reduce((all, frames) => all.concat(frames), [])
        .sort()
        .join('|');
    if (allFrames(snapshotBefore) !== allFrames(snapshotAfter)) {
      problems.push('the frames of the object were not only reordered');
    }
  }

  return {
    description,
    problems,
    effect,
    hadNoEffect,
    isDrop: !!action.mayHaveNoEffect,
  };
};

/** Close whatever dialog or menu is opened, so that the list is usable again. */
const closeAnyOverlay = async page => {
  const state = await describe(page);
  if (state.openMenuItems.length) {
    await page.keyboard.press('Escape');
    await wait(300);
    return true;
  }
  if (state.openDialogTitles.length) {
    const closed =
      (await click(page, { global: 'exactButton', text: 'Apply' })) ||
      (await click(page, { global: 'exactButton', text: 'Ok' })) ||
      (await click(page, { global: 'exactButton', text: 'Close' })) ||
      (await click(page, { global: 'exactButton', text: 'Cancel' }));
    if (!closed) await page.keyboard.press('Escape');
    await wait(500);
    return true;
  }
  return false;
};

const reportStepResult = ({ reporter, result, prefix, pageErrors }) => {
  if (result.crashed) {
    reporter.log(`   💥 ${prefix}${result.description}: THE EDITOR CRASHED`);
    (pageErrors[0] || '')
      .split('\n')
      .slice(0, 6)
      .forEach(line => reporter.log(`      ${line.trim()}`));
    return [`crash after: ${result.description}`];
  }
  if (result.problems.length) {
    reporter.log(`   ❌ ${prefix}${result.description}`);
    result.problems.forEach(problem => reporter.log(`      ${problem}`));
    return result.problems.map(problem => `${result.description}: ${problem}`);
  }
  return [];
};

/** Run the scripted steps of a test. */
const runSteps = async ({ page, pageErrors, steps, reporter }) => {
  const random = makeRandom(1);
  const failures = [];
  let performed = 0;
  let skipped = 0;
  let drops = 0;
  let effectiveDrops = 0;

  for (const [actionName, args] of steps) {
    const result = await runStep({
      page,
      pageErrors,
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
    const stepFailures = reportStepResult({
      reporter,
      result,
      prefix: '',
      pageErrors,
    });
    if (stepFailures.length) {
      failures.push(...stepFailures);
      break;
    }
    reporter.log(`   ✓ ${result.description} → ${result.effect}`);
  }

  if (drops > 0 && effectiveDrops === 0) {
    failures.push('none of the drag and drops moved anything');
    reporter.log('   ❌ none of the drag and drops moved anything');
  }
  return { failures, performed, skipped, drops, effectiveDrops };
};

/** Run a random sequence of manipulations. */
const runMonkey = async ({
  page,
  pageErrors,
  seed,
  steps,
  actionNames,
  reporter,
  verbose,
}) => {
  const random = makeRandom(seed);
  const weights = require('./SpriteEditorActions').monkeyWeights;
  const weighted = [];
  (actionNames || Object.keys(weights)).forEach(name => {
    for (let index = 0; index < (weights[name] || 1); index++)
      weighted.push(name);
  });

  const failures = [];
  let performed = 0;
  let skipped = 0;
  for (let step = 0; step < steps && !failures.length; step++) {
    if (await closeAnyOverlay(page)) continue;

    const actionName = weighted[Math.floor(random() * weighted.length)];
    const result = await runStep({
      page,
      pageErrors,
      actionName,
      args: null,
      random,
    });
    if (result.skipped) {
      skipped++;
      continue;
    }
    performed++;
    const stepFailures = reportStepResult({
      reporter,
      result,
      prefix: `step ${step + 1}, `,
      pageErrors,
    });
    if (stepFailures.length) {
      failures.push(...stepFailures);
      break;
    }
    if (verbose || step % 10 === 0)
      reporter.log(
        `   ✓ step ${step + 1}: ${result.description} → ${result.effect}`
      );
  }
  return { failures, performed, skipped };
};

module.exports = {
  makeRandom,
  runSteps,
  runMonkey,
  runStep,
  check,
  closeAnyOverlay,
};
