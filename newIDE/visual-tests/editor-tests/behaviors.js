// @ts-check

/**
 * Smoke test of a completely different part of the app than the sprite editor:
 * adding a behavior coming from an extension of the store to an object of a
 * real game, in the real app.
 */

const objectsList = require('../helpers/ObjectsList');
const behaviorsEditor = require('../helpers/BehaviorsEditor');

module.exports = [
  {
    name: 'editor/add-a-behavior-from-the-store',
    description:
      'Search "Fire bullet" in the store, add the "Fire bullets" behavior to ' +
      'an object (its extension is downloaded and installed), and check it is ' +
      'there.',
    example: 'platformer',
    helpers: [objectsList, behaviorsEditor],
    run: async ({ page, pageErrors, reporter, screenshot }) => {
      const failures = [];
      let performed = 0;

      const objectNames = await objectsList.waitForTheScene(page);
      reporter.log(`   The scene is opened, with: ${objectNames.join(', ')}.`);

      if (!(await objectsList.openObjectEditor(page, 'Player')))
        return {
          failures: ['the editor of the object "Player" did not open'],
          performed,
          skipped: 0,
        };
      performed++;

      if (!(await objectsList.openObjectEditorTab(page, 'Behaviors')))
        return {
          failures: ['the "Behaviors" tab could not be opened'],
          performed,
          skipped: 0,
        };
      performed++;
      const behaviorsBefore = await behaviorsEditor.listBehaviors(page);
      reporter.log(
        `   ✓ the behaviors of "Player": ${behaviorsBefore.join(', ') ||
          '(none)'}`
      );
      await screenshot('behaviors-before');

      const problem = await behaviorsEditor.addBehavior(page, {
        search: 'Fire bullet',
        behaviorType: 'FireBullet::FireBullet',
        name: 'Fire bullets',
      });
      if (problem) {
        failures.push(problem);
        reporter.log(`   ❌ ${problem}`);
        await screenshot('failed-to-add-the-behavior');
        return { failures, performed, skipped: 0 };
      }
      performed++;

      const behaviorsAfter = await behaviorsEditor.listBehaviors(page);
      reporter.log(
        `   ✓ the behaviors of "Player" are now: ${behaviorsAfter.join(', ')}`
      );
      await screenshot('behaviors-after');

      const addedBehaviors = behaviorsAfter.filter(
        behavior => !behaviorsBefore.includes(behavior)
      );
      if (!addedBehaviors.length)
        failures.push(
          'the behavior was not added to the object (the list is unchanged)'
        );

      if (!(await objectsList.closeObjectEditor(page)))
        failures.push('the object editor did not close');
      else performed++;

      return { failures, performed, skipped: 0 };
    },
  },
];
