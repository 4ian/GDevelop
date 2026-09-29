// @ts-check

/**
 * The behaviors of an object: the list shown in the "Behaviors" tab of the
 * object editor, and the dialog to add one - including the behaviors coming
 * from an extension of the store, which is then downloaded and installed.
 */

const {
  click,
  exists,
  typeInInput,
  waitFor,
  wait,
} = require('../lib/PageDriver');

const NEW_BEHAVIOR_DIALOG = { selector: '#new-behavior-dialog' };
const ADD_BEHAVIOR_BUTTON = { selector: '#add-behavior-button' };
const SEARCH_FIELD = { selector: '#extension-search-bar' };

/** The item of the store proposing a behavior, by its type. */
const storeItemOf = behaviorType => ({
  selector: `#behavior-item-${behaviorType.replace(/:/g, '-')}`,
});

/** The names of the behaviors of the edited object. */
const listBehaviors = page =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('[id$="-name-text-field"]')).map(
      element =>
        element.id.replace(/-name-text-field$/, '').replace(/^behavior-/, '')
    )
  );

/** The behaviors the store proposes for the current search. */
const listProposedBehaviors = page =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('[id^="behavior-item-"]')).map(
      element => (element.textContent || '').trim().slice(0, 60)
    )
  );

/**
 * In the already opened "add a behavior" dialog: search a behavior in the
 * store and add it to the edited object. When it comes from an extension, the
 * extension is downloaded and installed. Returns null, or what went wrong.
 */
const chooseBehaviorInDialog = async (page, { search, behaviorType, name }) => {
  if (!(await typeInInput(page, SEARCH_FIELD, search)))
    return 'there is no search field in the dialog';

  // Searching waits for the extensions of the store to be fetched.
  const storeItem = storeItemOf(behaviorType);
  if (!(await waitFor(page, storeItem, 30000)))
    return `"${search}" did not propose the behavior ${behaviorType}`;
  if (name) {
    const itemText = await page.evaluate(
      selector => (document.querySelector(selector).textContent || '').trim(),
      storeItem.selector
    );
    if (!itemText.startsWith(name))
      return `the behavior ${behaviorType} is named "${itemText.slice(
        0,
        40
      )}" instead of "${name}"`;
  }

  if (!(await click(page, storeItem)))
    return `the behavior ${behaviorType} could not be chosen`;

  // Installing the extension of the behavior takes a moment.
  const startedAt = Date.now();
  while (Date.now() - startedAt < 90000) {
    if (!(await exists(page, NEW_BEHAVIOR_DIALOG))) break;
    await wait(1000);
  }
  if (await exists(page, NEW_BEHAVIOR_DIALOG))
    return `the behavior ${behaviorType} was not added (the dialog is still opened)`;
  await wait(2000);
  return null;
};

/**
 * Add a behavior of the store from the "Behaviors" tab of the object editor.
 * Returns null, or what went wrong.
 */
const addBehavior = async (page, behaviorToChoose) => {
  if (!(await click(page, ADD_BEHAVIOR_BUTTON)))
    return 'there is no "Add a behavior" button';
  if (!(await waitFor(page, NEW_BEHAVIOR_DIALOG, 20000)))
    return 'the dialog to add a behavior did not open';
  await wait(1500);
  return await chooseBehaviorInDialog(page, behaviorToChoose);
};

module.exports = {
  name: 'behaviors-editor',
  paths: [
    'newIDE/app/src/BehaviorsEditor/',
    'newIDE/app/src/AssetStore/BehaviorStore/',
  ],
  NEW_BEHAVIOR_DIALOG,
  storeItemOf,
  listBehaviors,
  listProposedBehaviors,
  chooseBehaviorInDialog,
  addBehavior,
};
