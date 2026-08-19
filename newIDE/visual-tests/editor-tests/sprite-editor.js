// @ts-check

/**
 * Smoke tests running on a real, packaged version of the editor (the portable
 * Linux build), opening a real example game.
 *
 * They are deliberately much less precise than the Storybook tests: the
 * animations of the edited object can't be read from the app, so these only
 * check that nothing is badly broken - the editors open, the animations are
 * displayed, and manipulating them does not take the editor down.
 *
 * Anything going through a menu is not tested here: menus are native menus on
 * the desktop app, which can't be driven. Same for anything opening a file
 * picker or an external editor window.
 */

const {
  actions,
  getRealEditorActionNames,
  describe,
  click,
  wait
} = require("../lib/SpriteEditorActions");
const { runMonkey, runSteps } = require("../lib/Runner");

const OBJECT_EDITOR_DIALOG_SELECTOR = "#object-editor-dialog";

const waitForScene = async ({ page, reporter }) => {
  await page.waitForSelector("[data-object-name]", { timeout: 180000 });
  await wait(2000);
  const objectNames = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-object-name]")).map(
      element =>
        element.getAttribute("object-name") ||
        element.getAttribute("data-object-name")
    )
  );
  reporter.log(
    `   The scene is opened, with the objects: ${objectNames.join(", ")}.`
  );
  return objectNames;
};

const openObjectEditor = async ({ page, objectName }) => {
  const row = await page.$(`[data-object-name="${objectName}"]`);
  if (!row) return false;
  await row.click({ clickCount: 2, delay: 80 });
  try {
    await page.waitForSelector(OBJECT_EDITOR_DIALOG_SELECTOR, {
      timeout: 20000
    });
  } catch (error) {
    return false;
  }
  await wait(2500);
  return true;
};

const closeObjectEditor = async page => {
  const applyButton = await page.$("#apply-button");
  if (applyButton) await applyButton.click();
  else await page.keyboard.press("Escape");
  await wait(2000);
  return !(await page.$(OBJECT_EDITOR_DIALOG_SELECTOR));
};

module.exports = [
  {
    name: "editor/opens-every-object-editor",
    description:
      "The real editor opens an example game, and the editor of every object " +
      "of its scene can be opened and closed.",
    example: "platformer",
    run: async ({ page, pageErrors, reporter, screenshot }) => {
      const failures = [];
      let performed = 0;
      let skipped = 0;

      const objectNames = await waitForScene({ page, reporter });
      await screenshot("scene");
      if (!objectNames.length) {
        return { failures: ["no object in the scene"], performed, skipped };
      }

      for (const objectName of objectNames) {
        if (!(await openObjectEditor({ page, objectName }))) {
          failures.push(
            `the editor of the object "${objectName}" did not open`
          );
          break;
        }
        const state = await describe(page);
        const animationsCount = state.rows.length;
        reporter.log(
          `   ✓ the editor of "${objectName}" is opened` +
            (animationsCount
              ? ` (${animationsCount} animations, ` +
                `${state.rows.reduce(
                  (total, row) => total + row.frames.length,
                  0
                )} frames displayed)`
              : " (not an animated object)")
        );
        performed++;
        if (!(await closeObjectEditor(page))) {
          failures.push(
            `the editor of the object "${objectName}" did not close`
          );
          break;
        }
        if (pageErrors.length) break;
      }

      await screenshot("after-opening-the-object-editors");
      return { failures, performed, skipped };
    }
  },
  {
    name: "editor/sprite-editor-manipulations",
    description:
      "Manipulate the animations of a real sprite object in the real editor: " +
      "a smoke test of the same manipulations the Storybook tests cover.",
    example: "platformer",
    run: async ({ page, pageErrors, reporter, screenshot, options }) => {
      await waitForScene({ page, reporter });
      if (!(await openObjectEditor({ page, objectName: "Player" }))) {
        return {
          failures: ['the editor of the object "Player" did not open'],
          performed: 0,
          skipped: 0
        };
      }
      const state = await describe(page);
      reporter.log(
        `   The object "Player" has ${state.rows.length} animations displayed.`
      );
      await screenshot("sprite-editor");

      const result = await runSteps({
        page,
        pageErrors,
        steps: [
          ["selectFrames", { row: 0, frames: [0] }],
          ["setTimeBetweenFrames", { row: 0, value: "0.2" }],
          ["toggleLoop", { row: 0 }],
          ["openPreview", { row: 0 }],
          ["addAnimation"],
          ["renameAnimation", { row: 0, name: "Walking to the right" }],
          ["dragAnimation", { from: 0, to: 1 }],
          ["openPointsEditor"],
          ["openCollisionMasksEditor"],
          ["deleteAnimation", { row: 0 }],
          ["scrollList", { delta: 400 }],
          ["scrollList", { delta: -400 }]
        ],
        reporter
      });
      await screenshot("after-the-manipulations");

      if (!(await closeObjectEditor(page))) {
        result.failures.push("the object editor did not close");
      }
      return result;
    }
  },
  {
    name: "editor/sprite-editor-monkey",
    description:
      "Random manipulations of the animations of a real sprite object, in the " +
      "real editor.",
    example: "platformer",
    run: async ({ page, pageErrors, reporter, options }) => {
      await waitForScene({ page, reporter });
      if (!(await openObjectEditor({ page, objectName: "Player" }))) {
        return {
          failures: ['the editor of the object "Player" did not open'],
          performed: 0,
          skipped: 0
        };
      }

      const actionNames = getRealEditorActionNames();
      reporter.log(`   Manipulations used: ${actionNames.join(", ")}.`);
      return await runMonkey({
        page,
        pageErrors,
        seed: 1,
        steps: options.editorMonkeySteps,
        actionNames,
        reporter,
        verbose: options.verbose
      });
    }
  }
];
