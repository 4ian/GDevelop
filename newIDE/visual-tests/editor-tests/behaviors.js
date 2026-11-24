// @ts-check

/**
 * Adding a behavior coming from an extension of the store to an object of a
 * real game, in the real app - through the two ways the editor offers it: the
 * "Behaviors" tab of the object editor dialog, and the properties panel of the
 * Scene editor.
 */

const objectsList = require('../helpers/ObjectsList');
const behaviorsEditor = require('../helpers/BehaviorsEditor');
const propertiesPanel = require('../helpers/PropertiesPanel');

const FIRE_BULLETS = {
  search: 'Fire bullet',
  behaviorType: 'FireBullet::FireBullet',
  name: 'Fire bullets',
};

const checkANewBehavior = (behaviorsBefore, behaviorsAfter) =>
  behaviorsAfter.some(behavior => !behaviorsBefore.includes(behavior))
    ? null
    : 'the behavior was not added to the object (the list is unchanged)';

module.exports = [
  {
    name: 'editor/add-a-behavior-from-the-store',
    description:
      'In the object editor dialog: search "Fire bullet" in the store, add ' +
      'the "Fire bullets" behavior to an object (its extension is downloaded ' +
      'and installed), and check it is there.',
    example: 'platformer',
    helpers: [objectsList, behaviorsEditor],
    run: async ({ page, reporter, screenshot }) => {
      const failures = [];
      let performed = 0;
      const fail = failure => {
        reporter.log(`   ❌ ${failure}`);
        return { failures: [...failures, failure], performed, skipped: 0 };
      };

      const objectNames = await objectsList.waitForTheScene(page);
      reporter.log(`   The scene is opened, with: ${objectNames.join(', ')}.`);

      if (!(await objectsList.openObjectEditor(page, 'Player')))
        return fail('the editor of the object "Player" did not open');
      performed++;

      if (!(await objectsList.openObjectEditorTab(page, 'Behaviors')))
        return fail('the "Behaviors" tab could not be opened');
      performed++;
      const behaviorsBefore = await behaviorsEditor.listBehaviors(page);
      reporter.log(
        `   ✓ the behaviors of "Player": ${behaviorsBefore.join(', ') ||
          '(none)'}`
      );
      await screenshot('behaviors-before');

      const problem = await behaviorsEditor.addBehavior(page, FIRE_BULLETS);
      if (problem) {
        await screenshot('failed-to-add-the-behavior');
        return fail(problem);
      }
      performed++;

      const behaviorsAfter = await behaviorsEditor.listBehaviors(page);
      reporter.log(
        `   ✓ the behaviors of "Player" are now: ${behaviorsAfter.join(', ')}`
      );
      await screenshot('behaviors-after');
      const missing = checkANewBehavior(behaviorsBefore, behaviorsAfter);
      if (missing) failures.push(missing);

      if (!(await objectsList.closeObjectEditor(page)))
        failures.push('the object editor did not close');
      else performed++;

      return { failures, performed, skipped: 0 };
    },
  },
  {
    name: 'editor/add-a-behavior-from-the-properties-panel',
    description:
      'In the properties panel of the Scene editor (without opening the ' +
      'object editor dialog): select an object, add the "Fire bullets" ' +
      'behavior of the store from its "Behaviors" section, and check it is ' +
      'there.',
    example: 'platformer',
    helpers: [objectsList, propertiesPanel, behaviorsEditor],
    run: async ({ page, reporter, screenshot }) => {
      const failures = [];
      let performed = 0;
      const fail = failure => {
        reporter.log(`   ❌ ${failure}`);
        return { failures: [...failures, failure], performed, skipped: 0 };
      };

      const objectNames = await objectsList.waitForTheScene(page);
      reporter.log(`   The scene is opened, with: ${objectNames.join(', ')}.`);

      if (!(await propertiesPanel.selectObject(page, 'Player')))
        return fail(
          'the properties panel did not show the object "Player" when ' +
            'selected in the objects list'
        );
      performed++;

      const behaviorsBefore = await propertiesPanel.listBehaviors(page);
      reporter.log(
        `   ✓ the panel shows the behaviors of "Player": ` +
          `${behaviorsBefore.join(', ') || '(none)'}`
      );
      await screenshot('panel-before');

      const problem =
        (await propertiesPanel.openAddBehaviorDialog(page)) ||
        (await behaviorsEditor.chooseBehaviorInDialog(page, FIRE_BULLETS));
      if (problem) {
        await screenshot('failed-to-add-the-behavior');
        return fail(problem);
      }
      performed++;

      const behaviorsAfter = await propertiesPanel.listBehaviors(page);
      reporter.log(
        `   ✓ the panel now shows the behaviors: ${behaviorsAfter.join(', ')}`
      );
      await screenshot('panel-after');
      const missing = checkANewBehavior(behaviorsBefore, behaviorsAfter);
      if (missing) failures.push(missing);

      return { failures, performed, skipped: 0 };
    },
  },
];
