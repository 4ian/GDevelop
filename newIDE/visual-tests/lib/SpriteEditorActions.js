// @ts-check

/**
 * Every manipulation the Sprite object editor offers, as actions that a test
 * (or the monkey) can run.
 *
 * An action has:
 * - `describe(args)`: what is written in the report.
 * - `run(page, args)`: does it. Returns a string when it could not be done
 *   (the step is then reported as skipped, not as a failure).
 * - `pick(state, random)`: choose arguments at random for the monkey, or null
 *   when the action is not applicable to the current state.
 * - `mustChangeTheObject`: the object must be different afterwards, otherwise
 *   the checks would pass without anything being exercised.
 * - `mayHaveNoEffect`: like above, but a drop can legitimately land on the
 *   position the item already has.
 * - `keepsTheFrames`: no frame may be created or lost, only reordered.
 * - `clearsTheFrameSelection`: changing the animations must not leave frames
 *   selected, as the selection designates them by their index.
 * - `expect(state, args)`: the precise expected outcome, checked afterwards.
 * - `usesNativeMenus`: the action goes through a menu, which is a native menu
 *   on the desktop app - so it can only be run on Storybook.
 */

const wait = durationInMs =>
  new Promise(resolve => setTimeout(resolve, durationInMs));

const describe = page => page.evaluate(() => window.gdVisualTests.describe());
const click = (page, target) =>
  page.evaluate(theTarget => window.gdVisualTests.click(theTarget), target);
const setInputValue = (page, target, value) =>
  page.evaluate(
    (theTarget, theValue) =>
      window.gdVisualTests.setInputValue(theTarget, theValue),
    target,
    value
  );
const rectOf = (page, target, shouldScroll) =>
  page.evaluate(
    (theTarget, scroll) => window.gdVisualTests.rectOf(theTarget, scroll),
    target,
    shouldScroll
  );

/** Drag and drop with real mouse events (the drag backend handles them). */
const dragFromTo = async (page, fromTarget, toTarget, dropAfter) => {
  const from = await rectOf(page, fromTarget, true);
  if (!from) return false;
  const to = await rectOf(page, toTarget, false);
  if (!to) return false;

  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  // More than `touchSlop` (10px) is needed for the drag to start.
  await page.mouse.move(from.x + 16, from.y + 4, { steps: 4 });
  const targetX = dropAfter ? to.x + to.width / 3 : to.x;
  await page.mouse.move(targetX, to.y, { steps: 10 });
  await page.mouse.move(targetX, to.y + 2, { steps: 2 });
  await wait(150);
  await page.mouse.up();
  await wait(400);
  return true;
};

const closeAnyMenu = async page => {
  const state = await describe(page);
  if (!state.openMenuItems.length) return;
  await page.keyboard.press('Escape');
  await wait(300);
};

const rowsWithFrames = state => state.rows.filter(row => row.frames.length > 0);
const rowsWithASpritesList = state =>
  state.rows.filter(row => row.hasSpritesList);
const pickOne = (values, random) =>
  values[Math.floor(random() * values.length)];

/** Names of different lengths: the object is then serialized differently. */
const ANIMATION_NAMES = [
  'Walk',
  'Walk right',
  'Walking to the right',
  'Player walking right',
  'Player walking to the right',
  'Player walking to the right of the screen',
  'Player character walking slowly to the right of the screen',
  '',
];

const actions = {
  addAnimation: {
    mustChangeTheObject: true,
    clearsTheFrameSelection: true,
    describe: () => 'add an animation',
    pick: state => (state.hasEmptyPlaceholder ? null : {}),
    run: async page => {
      if (!(await click(page, { global: 'button', text: 'Add an animation' })))
        return 'there is no "Add an animation" button';
      await wait(500);
    },
  },

  deleteAnimation: {
    mustChangeTheObject: true,
    clearsTheFrameSelection: true,
    describe: args => `delete the animation #${args.row}`,
    pick: (state, random) =>
      state.rows.length
        ? { row: Math.floor(random() * state.rows.length) }
        : null,
    run: async (page, args) => {
      if (!(await click(page, { row: args.row, kind: 'trash' })))
        return 'there is no delete button';
      await wait(600);
      if (!(await click(page, { global: 'dialogButton', text: 'Remove' })))
        return 'the delete confirmation did not show up';
      await wait(700);
    },
  },

  renameAnimation: {
    describe: args => `rename the animation #${args.row} to "${args.name}"`,
    pick: (state, random) =>
      state.rows.length
        ? {
            row: Math.floor(random() * state.rows.length),
            name: pickOne(ANIMATION_NAMES, random),
          }
        : null,
    run: async (page, args) => {
      if (
        !(await setInputValue(page, { row: args.row, kind: 'name' }, args.name))
      )
        return 'there is no name field';
      await wait(600);
    },
  },

  moveAnimationWithMenu: {
    mustChangeTheObject: true,
    keepsTheFrames: true,
    clearsTheFrameSelection: true,
    usesNativeMenus: true,
    describe: args => `move the animation #${args.row} with "${args.item}"`,
    pick: (state, random) => {
      if (state.rows.length < 2) return null;
      const row = Math.floor(random() * state.rows.length);
      // Moving an animation before or after one having the same name and the
      // same frames leaves the object identical, so nothing could be checked.
      const signatureOf = position =>
        `${state.rows[position].name}|${state.rows[position].frames
          .map(frame => frame.title)
          .join(',')}`;
      const isDistinguishableFrom = position =>
        signatureOf(position) !== signatureOf(row);
      // The menu disables the position the animation already has.
      const items = [];
      if (row !== 0 && isDistinguishableFrom(0)) items.push('Move to top');
      const lastRow = state.rows.length - 1;
      if (row !== lastRow && isDistinguishableFrom(lastRow))
        items.push('Move to bottom');
      for (let position = 1; position < lastRow; position++) {
        if (position !== row && isDistinguishableFrom(position))
          items.push(`Move to position ${position}`);
      }
      return items.length ? { row, item: pickOne(items, random) } : null;
    },
    run: async (page, args) => {
      if (!(await click(page, { row: args.row, kind: 'menu' })))
        return 'there is no menu button';
      await wait(500);
      if (!(await click(page, { global: 'menuItem', text: args.item }))) {
        await closeAnyMenu(page);
        return `the menu item "${args.item}" is missing`;
      }
      await wait(700);
    },
  },

  dragAnimation: {
    mayHaveNoEffect: true,
    keepsTheFrames: true,
    clearsTheFrameSelection: true,
    describe: args => `drag the animation #${args.from} onto #${args.to}`,
    pick: (state, random) => {
      if (state.rows.length < 2) return null;
      const from = Math.floor(random() * state.rows.length);
      let to = Math.floor(random() * state.rows.length);
      if (to === from) to = (to + 1) % state.rows.length;
      return { from, to };
    },
    run: async (page, args) => {
      const dragged = await dragFromTo(
        page,
        { row: args.from, kind: 'dragHandle' },
        { row: args.to, kind: 'label' }
      );
      if (!dragged) return 'the two rows were not both visible';
      await wait(400);
    },
  },

  setTimeBetweenFrames: {
    keepsTheFrames: true,
    describe: args => `set ${args.value}s between the frames of #${args.row}`,
    pick: (state, random) => {
      const rows = rowsWithFrames(state);
      if (!rows.length) return null;
      return {
        row: pickOne(rows, random).index,
        value: pickOne(['0.05', '0.2', '1'], random),
      };
    },
    run: async (page, args) => {
      if (
        !(await setInputValue(
          page,
          { row: args.row, kind: 'time' },
          args.value
        ))
      )
        return 'there is no time between frames field';
      await wait(500);
    },
  },

  toggleLoop: {
    mustChangeTheObject: true,
    keepsTheFrames: true,
    describe: args => `toggle the looping of #${args.row}`,
    pick: (state, random) => {
      const rows = rowsWithFrames(state);
      return rows.length ? { row: pickOne(rows, random).index } : null;
    },
    run: async (page, args) => {
      if (!(await click(page, { row: args.row, kind: 'loop' })))
        return 'there is no loop checkbox';
      await wait(400);
    },
  },

  addFrames: {
    mustChangeTheObject: true,
    needsFileDialog: true,
    describe: args => `add frames to the animation #${args.row}`,
    pick: (state, random) => {
      const rows = rowsWithASpritesList(state);
      return rows.length ? { row: pickOne(rows, random).index } : null;
    },
    run: async (page, args) => {
      if (
        !(await click(page, {
          row: args.row,
          kind: 'textButton',
          text: 'Add a sprite',
        }))
      )
        return 'there is no "Add a sprite" button';
      await wait(900);
    },
  },

  importAnimationsInEmptyAnimation: {
    mustChangeTheObject: true,
    usesNativeMenus: true,
    needsFileDialog: true,
    describe: args =>
      `import images named per animation in the empty animation #${args.row}`,
    pick: state => {
      const row = state.rows.find(
        one => one.hasSpritesList && one.frames.length === 0
      );
      return row ? { row: row.index } : null;
    },
    run: async (page, args) => {
      if (!(await click(page, { row: args.row, kind: 'addSpriteSplit' })))
        return 'there is no split menu next to "Add a sprite"';
      await wait(500);
      if (
        !(await click(page, {
          global: 'menuItem',
          text: 'Import fake images named per animation',
        }))
      ) {
        await closeAnyMenu(page);
        return 'the import menu item is missing';
      }
      await wait(1200);
    },
  },

  selectFrames: {
    describe: args =>
      `select the frames ${args.frames.join(', ')} of the animation #${
        args.row
      }`,
    pick: (state, random) => {
      const rows = rowsWithFrames(state);
      if (!rows.length) return null;
      const row = pickOne(rows, random);
      const frames = row.frames
        .map((frame, index) => index)
        .filter(() => random() < 0.5);
      return { row: row.index, frames: frames.length ? frames : [0] };
    },
    run: async (page, args) => {
      for (const frame of args.frames) {
        if (
          !(await click(page, { row: args.row, kind: 'frameCheckbox', frame }))
        )
          return `there is no frame ${frame}`;
        await wait(200);
      }
    },
  },

  frameContextMenuAction: {
    mustChangeTheObject: true,
    usesNativeMenus: true,
    describe: args =>
      `use "${args.item}" on the frames of the animation #${args.row}`,
    pick: (state, random) => {
      const rows = state.rows.filter(row =>
        row.frames.some(frame => frame.selected)
      );
      if (!rows.length) return null;
      const row = pickOne(rows, random);
      const selected = row.frames
        .map((frame, index) => (frame.selected ? index : -1))
        .filter(index => index >= 0);
      // The menu disables the positions the selection already has.
      const isSelectionAtPosition = startIndex =>
        selected.every((index, offset) => index === startIndex + offset);
      const items = ['Delete selection', 'Duplicate selection'];
      if (row.frames.length > 1) {
        const lastStartIndex = row.frames.length - selected.length;
        if (!isSelectionAtPosition(0)) items.push('Move to beginning');
        if (!isSelectionAtPosition(lastStartIndex)) items.push('Move to end');
        for (let position = 1; position < lastStartIndex; position++) {
          if (!isSelectionAtPosition(position))
            items.push(`Position ${position}`);
        }
      }
      const item = pickOne(items, random);
      return {
        row: row.index,
        frame: selected[0],
        item,
        isSubmenuItem: item.startsWith('Position '),
      };
    },
    // What the frames of the animation must be afterwards.
    expect: (state, args) => {
      const row = state.rows[args.row];
      if (!row) return null;
      const frames = row.frames.map(frame => frame.title);
      const selected = row.frames
        .map((frame, index) => (frame.selected ? index : -1))
        .filter(index => index >= 0);
      if (!selected.length) return null;

      if (args.item === 'Delete selection') {
        return {
          row: args.row,
          frames: frames.filter((frame, index) => !selected.includes(index)),
        };
      }
      if (args.item === 'Duplicate selection') {
        const expected = [];
        frames.forEach((frame, index) => {
          if (selected.includes(index)) expected.push(frame, frame);
          else expected.push(frame);
        });
        return { row: args.row, frames: expected };
      }

      const startIndex =
        args.item === 'Move to beginning'
          ? 0
          : args.item === 'Move to end'
          ? frames.length - selected.length
          : Number(args.item.replace('Position ', ''));
      if (isNaN(startIndex)) return null;
      const clampedStartIndex = Math.min(
        startIndex,
        frames.length - selected.length
      );
      const movedFrames = selected.map(index => frames[index]);
      const otherFrames = frames.filter(
        (frame, index) => !selected.includes(index)
      );
      return {
        row: args.row,
        frames: [
          ...otherFrames.slice(0, clampedStartIndex),
          ...movedFrames,
          ...otherFrames.slice(clampedStartIndex),
        ],
      };
    },
    run: async (page, args) => {
      const opened = await page.evaluate(
        (row, frame) => window.gdVisualTests.openFrameContextMenu(row, frame),
        args.row,
        args.frame
      );
      if (!opened) return 'the frame is missing';
      await wait(500);
      if (args.isSubmenuItem) {
        if (
          !(await click(page, { global: 'menuItem', text: 'Move to position' }))
        ) {
          await closeAnyMenu(page);
          return 'there is no "Move to position" submenu';
        }
        await wait(400);
      }
      if (!(await click(page, { global: 'menuItem', text: args.item }))) {
        await closeAnyMenu(page);
        return `the menu item "${args.item}" is missing`;
      }
      await wait(700);
      // Deleting the last frames of an object using a custom collision mask
      // asks for a confirmation.
      await click(page, { global: 'dialogButton', text: 'Remove' });
      await wait(300);
    },
  },

  dragFrame: {
    mayHaveNoEffect: true,
    keepsTheFrames: true,
    describe: args =>
      `drag the frame ${args.from} of the animation #${args.row} onto ${
        args.to
      }`,
    pick: (state, random) => {
      const rows = state.rows.filter(row => row.frames.length > 1);
      if (!rows.length) return null;
      const row = pickOne(rows, random);
      const from = Math.floor(random() * row.frames.length);
      let to = Math.floor(random() * row.frames.length);
      if (to === from) to = (to + 1) % row.frames.length;
      return { row: row.index, from, to };
    },
    run: async (page, args) => {
      const dragged = await dragFromTo(
        page,
        { row: args.row, kind: 'frame', frame: args.from },
        { row: args.row, kind: 'frame', frame: args.to },
        args.to > args.from
      );
      if (!dragged) return 'the two frames were not both visible';
    },
  },

  editWithExternalEditor: {
    mustChangeTheObject: true,
    needsExternalEditorWindow: true,
    describe: args => `edit the animation #${args.row} with the image editor`,
    pick: (state, random) => {
      const rows = state.rows.filter(row =>
        row.textButtons.some(text => text.includes('the fake image editor'))
      );
      return rows.length ? { row: pickOne(rows, random).index } : null;
    },
    // The fake editor gives back the frames it was given, plus a new one, and
    // the settings of the direction must be carried over untouched.
    expect: (state, args) => {
      const row = state.rows[args.row];
      if (!row || !row.hasSpritesList) return null;
      const frames = row.frames.map(frame => frame.title);
      return {
        row: args.row,
        framesStartWith: frames,
        framesCount: frames.length + 1,
        timeBetweenFrames: Number(row.timeBetweenFrames),
        isLooping: row.isLooping,
      };
    },
    run: async (page, args) => {
      if (
        !(await click(page, {
          row: args.row,
          kind: 'textButton',
          text: 'the fake image editor',
        }))
      )
        return 'there is no external editor button';
      // The fake session takes a moment, then the frames are written back.
      await wait(1500);
    },
  },

  openPreview: {
    describe: args => `preview the animation #${args.row}`,
    pick: (state, random) => {
      const rows = rowsWithFrames(state);
      return rows.length ? { row: pickOne(rows, random).index } : null;
    },
    run: async (page, args) => {
      if (
        !(await click(page, {
          row: args.row,
          kind: 'textButton',
          text: 'Preview',
        }))
      )
        return 'there is no Preview button';
      await wait(1200);
      if (!(await click(page, { global: 'dialogButton', text: 'Ok' })))
        return 'the preview dialog did not close';
      await wait(500);
    },
  },

  openPointsEditor: {
    describe: () => 'open and close the points editor',
    pick: state => (rowsWithFrames(state).length ? {} : null),
    run: async page => {
      if (!(await click(page, { global: 'exactButton', text: 'Edit points' })))
        return 'there is no "Edit points" button';
      await wait(1500);
      if (!(await click(page, { global: 'dialogButton', text: 'Apply' })))
        return 'the points editor did not close';
      await wait(600);
    },
  },

  openCollisionMasksEditor: {
    describe: () => 'open and close the collision masks editor',
    pick: state => (rowsWithFrames(state).length ? {} : null),
    run: async page => {
      if (
        !(await click(page, {
          global: 'exactButton',
          text: 'Edit collision masks',
        }))
      )
        return 'there is no "Edit collision masks" button';
      await wait(1500);
      if (!(await click(page, { global: 'dialogButton', text: 'Apply' })))
        return 'the collision masks editor did not close';
      await wait(600);
    },
  },

  openAdvancedOptions: {
    describe: () => 'open and close the advanced options',
    pick: state => (rowsWithFrames(state).length ? {} : null),
    run: async page => {
      if (
        !(await click(page, {
          global: 'exactButton',
          text: 'Advanced options',
        }))
      )
        return 'there is no "Advanced options" button';
      await wait(900);
      if (!(await click(page, { global: 'dialogButton', text: 'Close' })))
        return 'the advanced options did not close';
      await wait(500);
    },
  },

  importImagesFromPlaceholder: {
    mustChangeTheObject: true,
    needsFileDialog: true,
    describe: () => 'import images from the empty placeholder',
    pick: state => (state.hasEmptyPlaceholder ? {} : null),
    run: async page => {
      if (!(await click(page, { global: 'button', text: 'Import images' })))
        return 'there is no "Import images" button';
      await wait(1500);
    },
  },

  serialize: {
    needsStorybook: true,
    describe: () => 'serialize the object (like saving does)',
    pick: () => ({}),
    run: async page => {
      if (!(await click(page, { global: 'exactButton', text: 'Update' })))
        return 'there is no serialization button on this story';
      await wait(500);
    },
  },

  scrollList: {
    describe: args => `scroll the animations list by ${args.delta}px`,
    pick: (state, random) => ({
      delta: (random() < 0.5 ? -1 : 1) * (300 + Math.floor(random() * 900)),
    }),
    run: async (page, args) => {
      await page.evaluate(
        delta => window.gdVisualTests.scrollBy(delta),
        args.delta
      );
      await wait(400);
    },
  },
};

/** How often the monkey picks each action. */
const monkeyWeights = {
  addAnimation: 3,
  deleteAnimation: 2,
  renameAnimation: 2,
  moveAnimationWithMenu: 3,
  dragAnimation: 2,
  setTimeBetweenFrames: 1,
  toggleLoop: 1,
  addFrames: 3,
  importAnimationsInEmptyAnimation: 1,
  importImagesFromPlaceholder: 2,
  selectFrames: 4,
  frameContextMenuAction: 4,
  dragFrame: 3,
  editWithExternalEditor: 2,
  openPreview: 1,
  openPointsEditor: 1,
  openCollisionMasksEditor: 1,
  openAdvancedOptions: 1,
  serialize: 2,
  scrollList: 2,
};

/**
 * The manipulations that can be done on the real app: not the ones going
 * through a menu (native menus can't be driven), opening a file picker or an
 * external editor window, or only existing on a story.
 */
const getRealEditorActionNames = () =>
  Object.keys(actions).filter(name => {
    const action = actions[name];
    return (
      !action.usesNativeMenus &&
      !action.needsFileDialog &&
      !action.needsExternalEditorWindow &&
      !action.needsStorybook
    );
  });

module.exports = {
  actions,
  monkeyWeights,
  getRealEditorActionNames,
  describe,
  click,
  setInputValue,
  rectOf,
  dragFromTo,
  wait,
};
