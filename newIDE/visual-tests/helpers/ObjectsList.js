// @ts-check

/**
 * The objects list of a scene: how to find its rows, read what it displays
 * (including which rows are shown as selected) and manipulate the selection.
 * Used by the Storybook tests of the multi-selection, and by the tests running
 * on the real app to reach the editor they want to manipulate.
 */

const {
  wait,
  click,
  exists,
  waitFor,
  rectOf,
  typeInInput,
} = require('../lib/PageDriver');

const OBJECT_EDITOR_DIALOG = { selector: '#object-editor-dialog' };

// ------------------------------------------------------- installed in the page

/**
 * Reads the rows of the objects list from their data attributes, and what the
 * story holds (its objects and its selection) from
 * `window.objectsListManipulations` when it exposes it.
 *
 * Targets of this editor are `{ objectsList: { name, part } }` with part one
 * of: row (default), chevron (the expand/collapse arrow of a folder).
 */
const installObjectsListPageHelpers = function() {
  const { addTargetResolver } = window.gdVisualTests;

  const getRows = () =>
    Array.from(
      document.querySelectorAll('[data-object-name], [data-folder-name]')
    ).map(element => ({
      element,
      name:
        element.getAttribute('data-object-name') ||
        element.getAttribute('data-folder-name'),
      isFolder: element.hasAttribute('data-folder-name'),
      isGlobal: element.getAttribute('data-global') === 'true',
      selected: element.getAttribute('aria-selected') === 'true',
    }));

  addTargetResolver('objectsList', target => {
    const row = getRows().find(row => row.name === target.name);
    if (!row) return null;
    // The expand/collapse arrow of a folder is its first (icon) button.
    if (target.part === 'chevron') return row.element.querySelector('button');
    return row.element;
  });
  addTargetResolver(
    'objectsListSearch',
    () => document.querySelector('input[placeholder]') || null
  );

  const readState = () =>
    window.objectsListManipulations
      ? window.objectsListManipulations.readState()
      : null;

  const describe = () => {
    const state = readState();
    return {
      rows: getRows().map(({ name, isFolder, isGlobal, selected }) => ({
        name,
        isFolder,
        isGlobal,
        selected,
      })),
      selectionNames: state ? state.selectionNames : null,
      selectionNotificationsCount: state
        ? state.selectionNotificationsCount
        : null,
      ...window.gdVisualTests.describeOverlays(),
    };
  };

  /** Compare what the list displays with what the app holds. */
  const check = () => {
    const described = describe();
    const problems = [];
    if (!described.rows.length) {
      problems.push('the objects list is not displayed anymore');
      return { problems, described };
    }
    const state = readState();
    if (!state) return { problems, described };

    const allNames = [...state.sceneNames, ...state.globalNames];
    const displayedSelection = [];
    described.rows.forEach(row => {
      if (!allNames.includes(row.name))
        problems.push(
          `the row "${row.name}" is displayed but no object or folder ` +
            `has this name`
        );
      if (row.selected) displayedSelection.push(row.name);
    });
    // The rows shown as selected must be the selection the app holds. Only
    // displayed rows can be compared: a selected row inside a collapsed
    // folder is simply not displayed.
    displayedSelection.forEach(name => {
      if (!state.selectionNames.includes(name))
        problems.push(
          `the row "${name}" is shown as selected but is not in the selection`
        );
    });
    state.selectionNames.forEach(name => {
      const row = described.rows.find(row => row.name === name);
      if (row && !row.selected)
        problems.push(
          `"${name}" is in the selection but its row is not shown as selected`
        );
    });
    return { problems, described };
  };

  window.gdVisualTests.objectsList = { describe, check };
};

// -------------------------------------------------------------- manipulations

const rowTarget = (name, part) => ({ objectsList: { name, part } });

/** A real mouse click (with an optionally held key), so that the row handlers
 * see the modifiers and the focus moves into the tree (for the keyboard). */
const realClick = async (page, target, modifierKey) => {
  const rect = await rectOf(page, target, true);
  if (!rect) return false;
  if (modifierKey) await page.keyboard.down(modifierKey);
  await page.mouse.click(rect.x, rect.y);
  if (modifierKey) await page.keyboard.up(modifierKey);
  return true;
};

const focusTree = page =>
  page.evaluate(() => {
    const tree = document.querySelector('#objects-list [tabindex="0"]');
    if (!tree) return false;
    tree.focus();
    return true;
  });

/** The precise selection (and notification) a manipulation must end on. */
const expectationFromArgs = (state, args) => {
  if (!args.expectedSelection) return null;
  const expectation = { selectedNames: args.expectedSelection };
  if (args.expectNewNotification)
    expectation.minSelectionNotificationsCount =
      state.selectionNotificationsCount + 1;
  return expectation;
};

const objectsListActions = {
  clickRow: {
    describe: args => `click the row "${args.name}"`,
    expect: expectationFromArgs,
    run: async (page, args) => {
      if (!(await realClick(page, rowTarget(args.name))))
        return `the row "${args.name}" is not visible`;
      await wait(400);
    },
  },

  ctrlClickRow: {
    describe: args => `Ctrl+click the row "${args.name}"`,
    expect: expectationFromArgs,
    run: async (page, args) => {
      if (!(await realClick(page, rowTarget(args.name), 'Control')))
        return `the row "${args.name}" is not visible`;
      await wait(400);
    },
  },

  toggleFolder: {
    describe: args => `expand or collapse the folder "${args.name}"`,
    run: async (page, args) => {
      if (!(await click(page, rowTarget(args.name, 'chevron'))))
        return `the folder "${args.name}" has no expand arrow`;
      await wait(400);
    },
  },

  pressKey: {
    describe: args => `press ${args.key} in the list`,
    expect: expectationFromArgs,
    run: async (page, args) => {
      if (!(await focusTree(page))) return 'the tree cannot be focused';
      await page.keyboard.press(args.key);
      await wait(400);
    },
  },

  selectAll: {
    describe: () => 'press Ctrl+A in the list',
    expect: expectationFromArgs,
    run: async page => {
      if (!(await focusTree(page))) return 'the tree cannot be focused';
      await page.keyboard.down('Control');
      await page.keyboard.press('a');
      await page.keyboard.up('Control');
      await wait(400);
    },
  },

  setSearchText: {
    describe: args => `search for "${args.text}"`,
    expect: (state, args) =>
      args.expectedVisibleRows ? { visibleRowNames: args.expectedVisibleRows } : null,
    run: async (page, args) => {
      if (!(await typeInInput(page, { objectsListSearch: {} }, args.text)))
        return 'there is no search field';
      await wait(600);
    },
  },
};

// ----------------------------------------------- what the runner checks with

const describe = page =>
  page.evaluate(() => window.gdVisualTests.objectsList.describe());

const describeEffect = (snapshotBefore, snapshotAfter) => {
  const changes = [];
  const selectionOf = snapshot => (snapshot.selectionNames || []).join(', ');
  if (selectionOf(snapshotBefore) !== selectionOf(snapshotAfter))
    changes.push(`selection: [${selectionOf(snapshotAfter)}]`);
  if (snapshotBefore.rows.length !== snapshotAfter.rows.length)
    changes.push(
      `${snapshotBefore.rows.length} → ${snapshotAfter.rows.length} rows`
    );
  if (
    snapshotBefore.selectionNotificationsCount !==
    snapshotAfter.selectionNotificationsCount
  )
    changes.push('the app was notified');
  return changes.length ? changes.join(', ') : 'nothing changed';
};

/** Check the precise outcome a manipulation declared with `expect`. */
const checkExpectation = (expectation, snapshotAfter) => {
  const problems = [];
  if (
    expectation.selectedNames &&
    snapshotAfter.selectionNames &&
    expectation.selectedNames.join('|') !== snapshotAfter.selectionNames.join('|')
  )
    problems.push(
      `the selection is [${snapshotAfter.selectionNames.join(', ')}] but ` +
        `[${expectation.selectedNames.join(', ')}] was expected`
    );
  if (
    expectation.minSelectionNotificationsCount !== undefined &&
    snapshotAfter.selectionNotificationsCount <
      expectation.minSelectionNotificationsCount
  )
    problems.push('the app was not notified of the selection again');
  if (expectation.visibleRowNames) {
    const visible = snapshotAfter.rows.map(row => row.name);
    if (expectation.visibleRowNames.join('|') !== visible.join('|'))
      problems.push(
        `the rows displayed are [${visible.join(', ')}] but ` +
          `[${expectation.visibleRowNames.join(', ')}] were expected`
      );
  }
  return problems;
};

// ------------------------------------- used by the tests on the real app too

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
    'newIDE/app/src/UI/TreeView/',
    'newIDE/app/src/stories/componentStories/LayoutEditor/ObjectsList.stories.js',
  ],
  installPageHelpers: installObjectsListPageHelpers,
  actions: objectsListActions,
  describe,
  check: page => page.evaluate(() => window.gdVisualTests.objectsList.check()),
  describeEffect,
  checkExpectation,
  summarize: async page => {
    const described = await describe(page);
    return `${described.rows.length} rows displayed`;
  },
  OBJECT_EDITOR_DIALOG,
  waitForTheScene,
  openObjectEditor,
  closeObjectEditor,
  openObjectEditorTab,
};
