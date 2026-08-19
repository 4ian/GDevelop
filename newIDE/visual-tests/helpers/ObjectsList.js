// @ts-check

/**
 * The objects list of a scene, and the dialog editing one object. Used by the
 * tests running on the real app to reach the editor they want to manipulate.
 */

const { click, exists, waitFor, wait } = require('../lib/PageDriver');

const OBJECT_EDITOR_DIALOG = { selector: '#object-editor-dialog' };

/** Wait for the scene to be opened and return the names of its objects. */
const waitForTheScene = async (page, timeoutInMs = 180000) => {
  await page.waitForSelector('[data-object-name]', { timeout: timeoutInMs });
  await wait(2000);
  return await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-object-name]')).map(element =>
      element.getAttribute('data-object-name')
    )
  );
};

/** Open the editor of an object by double clicking it in the objects list. */
const openObjectEditor = async (page, objectName) => {
  const row = await page.$(`[data-object-name="${objectName}"]`);
  if (!row) return false;
  await row.click({ clickCount: 2, delay: 80 });
  if (!(await waitFor(page, OBJECT_EDITOR_DIALOG, 20000))) return false;
  await wait(2500);
  return true;
};

const closeObjectEditor = async page => {
  if (!(await click(page, { selector: '#apply-button' })))
    await page.keyboard.press('Escape');
  await wait(2000);
  return !(await exists(page, OBJECT_EDITOR_DIALOG));
};

/** Show one of the tabs of the object editor ("Behaviors", "Variables"...). */
const openObjectEditorTab = async (page, tabName) => {
  if (!(await click(page, { tab: tabName }))) return false;
  await wait(1500);
  return true;
};

module.exports = {
  name: 'objects-list',
  paths: [
    'newIDE/app/src/ObjectsList/',
    'newIDE/app/src/ObjectEditor/ObjectEditorDialog.js',
  ],
  OBJECT_EDITOR_DIALOG,
  waitForTheScene,
  openObjectEditor,
  closeObjectEditor,
  openObjectEditorTab,
};
