// @ts-check

/**
 * Smoke tests of the Sprite object editor in the real app, opening a real
 * example game. They are much less precise than the Storybook tests: the
 * animations of the edited object can't be read from the app, so they only
 * check that nothing is badly broken.
 *
 * Anything going through a menu is not tested here: menus are native menus on
 * the desktop app, which can't be driven. Same for anything opening a file
 * picker or an external editor window.
 */

const spriteEditor = require('../helpers/SpriteEditor');
const objectsList = require('../helpers/ObjectsList');

module.exports = [
  {
    name: 'editor/opens-every-object-editor',
    description:
      'The editor of every object of the scene of an example game can be ' +
      'opened and closed.',
    example: 'platformer',
    helpers: [spriteEditor, objectsList],
    run: async ({ page, pageErrors, reporter, screenshot }) => {
      const failures = [];
      let performed = 0;

      const objectNames = await objectsList.waitForTheScene(page);
      reporter.log(`   The scene is opened, with: ${objectNames.join(', ')}.`);
      await screenshot('scene');
      if (!objectNames.length)
        return { failures: ['no object in the scene'], performed, skipped: 0 };

      for (const objectName of objectNames) {
        if (!(await objectsList.openObjectEditor(page, objectName))) {
          failures.push(`the editor of "${objectName}" did not open`);
          break;
        }
        const state = await spriteEditor.describe(page);
        const framesCount = state.rows.reduce(
          (total, row) => total + row.frames.length,
          0
        );
        reporter.log(
          `   ✓ the editor of "${objectName}" is opened` +
            (state.rows.length
              ? ` (${state.rows.length} animations, ${framesCount} frames)`
              : ' (not an animated object)')
        );
        performed++;
        if (!(await objectsList.closeObjectEditor(page))) {
          failures.push(`the editor of "${objectName}" did not close`);
          break;
        }
        if (pageErrors.length) break;
      }

      await screenshot('after-opening-the-object-editors');
      return { failures, performed, skipped: 0 };
    },
  },
  {
    name: 'editor/sprite-editor-manipulations',
    description:
      'Manipulate the animations of a real sprite object: a smoke test of what ' +
      'the Storybook tests cover precisely.',
    example: 'platformer',
    helpers: [spriteEditor, objectsList],
    run: async ({ page, reporter, screenshot, runSteps }) => {
      await objectsList.waitForTheScene(page);
      if (!(await objectsList.openObjectEditor(page, 'Player')))
        return {
          failures: ['the editor of the object "Player" did not open'],
          performed: 0,
          skipped: 0,
        };

      const state = await spriteEditor.describe(page);
      reporter.log(
        `   The object "Player" has ${state.rows.length} animations displayed.`
      );
      await screenshot('sprite-editor');

      const result = await runSteps({
        helper: spriteEditor,
        steps: [
          ['selectFrames', { row: 0, frames: [0] }],
          ['setTimeBetweenFrames', { row: 0, value: '0.2' }],
          ['toggleLoop', { row: 0 }],
          ['openPreview', { row: 0 }],
          ['addAnimation'],
          ['renameAnimation', { row: 0, name: 'Walking to the right' }],
          // Upwards, so that the drop moves it (dropping on the row just
          // after would put it back where it was) - and onto the row just
          // before, so that both rows fit on the small window of the app.
          ['dragAnimation', { from: 1, to: 0 }],
          ['openPointsEditor'],
          ['openCollisionMasksEditor'],
          ['deleteAnimation', { row: 0 }],
          ['scrollList', { delta: 400 }],
          ['scrollList', { delta: -400 }],
        ],
      });
      await screenshot('after-the-manipulations');

      if (!(await objectsList.closeObjectEditor(page)))
        result.failures.push('the object editor did not close');
      return result;
    },
  },
  {
    name: 'editor/sprite-editor-monkey',
    description:
      'Random manipulations of the animations of a real sprite object.',
    example: 'platformer',
    helpers: [spriteEditor, objectsList],
    run: async ({ page, reporter, runMonkey }) => {
      await objectsList.waitForTheScene(page);
      if (!(await objectsList.openObjectEditor(page, 'Player')))
        return {
          failures: ['the editor of the object "Player" did not open'],
          performed: 0,
          skipped: 0,
        };

      const actionNames = spriteEditor.getRealEditorActionNames();
      reporter.log(`   Manipulations used: ${actionNames.join(', ')}.`);
      return await runMonkey({ helper: spriteEditor, actionNames });
    },
  },
];
