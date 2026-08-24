// @ts-check

/**
 * Everything specific to the Sprite object editor: how to find its controls,
 * how to read what it displays, and every manipulation it offers.
 *
 * This is the file to look at to add a manipulation of this editor, and the
 * model to follow to make another editor testable.
 */

const {
  wait,
  click,
  setInputValue,
  dragFromTo,
  openContextMenu,
  closeAnyMenu,
} = require('../lib/PageDriver');
const {
  genericActions,
  genericMonkeyWeights,
} = require('../lib/GenericActions');

// ------------------------------------------------------- installed in the page

/**
 * Reads the animations list: it is walked in document order and cut into rows
 * at each "Animation #x" header - or, when the list is locked (like for a child
 * object of a custom object), at the settings of each direction, as there is no
 * header then.
 *
 * Targets of this editor are `{ spriteEditor: { row, kind, frame } }` with kind
 * one of: name, time, loop, trash, menu, label, dragHandle, textButton,
 * addSpriteSplit, frame, frameCheckbox.
 */
const installSpriteEditorPageHelpers = function() {
  const {
    isLeaf,
    textOf,
    getScrollableList,
    addTargetResolver,
  } = window.gdVisualTests;

  // A built Storybook does not interpolate the translated header, which then
  // shows its placeholder instead of the index of the animation (the real app
  // does show it): the rows are numbered by their position in that case.
  const labelRegExp = /^Animation #(\d+|\{animationIndex\})$/;

  const getAnimationLabels = () =>
    Array.from(document.querySelectorAll('*')).filter(
      element => isLeaf(element) && labelRegExp.test(textOf(element))
    );

  const getEmptyPlaceholder = () =>
    Array.from(document.querySelectorAll('*')).find(
      element =>
        isLeaf(element) && textOf(element) === 'Add your first animation'
    ) || null;

  const getAnimationsList = () =>
    getScrollableList(getAnimationLabels()[0] || getEmptyPlaceholder());

  const collectItems = root => {
    const items = [];
    Array.from(root.querySelectorAll('*')).forEach(element => {
      const text = textOf(element);
      if (isLeaf(element) && labelRegExp.test(text)) {
        const index = Number(text.match(labelRegExp)[1]);
        items.push({
          kind: 'label',
          element,
          index: isNaN(index) ? null : index,
        });
      } else if (element.tagName === 'BUTTON') {
        items.push({ kind: 'button', element, text });
      } else if (element.tagName === 'INPUT') {
        items.push({ kind: 'input', element, type: element.type });
      } else if (
        element.hasAttribute('title') &&
        element.querySelector('img')
      ) {
        items.push({
          kind: 'thumbnail',
          element,
          title: element.getAttribute('title'),
        });
      }
    });
    return items;
  };

  const buildRows = () => {
    const items = collectItems(getAnimationsList());
    const hasLabels = items.some(item => item.kind === 'label');
    const startsARow = item =>
      hasLabels
        ? item.kind === 'label'
        : item.kind === 'input' &&
          item.element.id === 'direction-time-between-frames';

    const rows = [];
    let row = null;
    items.forEach(item => {
      if (startsARow(item)) {
        row = {
          index: hasLabels && item.index !== null ? item.index : rows.length,
          labelElement: item.element,
          nameInput: null,
          timeInput: hasLabels ? null : item.element,
          loopCheckbox: null,
          iconButtons: [],
          textButtons: [],
          frames: [],
        };
        rows.push(row);
        return;
      }
      if (!row) return;

      if (item.kind === 'thumbnail') {
        row.frames.push({
          element: item.element,
          title: item.title,
          checkbox: null,
        });
      } else if (item.kind === 'input') {
        if (item.element.id === 'direction-time-between-frames') {
          row.timeInput = item.element;
        } else if (item.type === 'checkbox') {
          const lastFrame = row.frames[row.frames.length - 1];
          if (lastFrame && lastFrame.element.contains(item.element))
            lastFrame.checkbox = item.element;
          else row.loopCheckbox = item.element;
        } else if (!row.nameInput) {
          row.nameInput = item.element;
        }
      } else if (item.kind === 'button') {
        if (item.text)
          row.textButtons.push({ element: item.element, text: item.text });
        else row.iconButtons.push(item.element);
      }
    });
    return rows;
  };

  addTargetResolver('spriteEditor', target => {
    const row = buildRows()[target.row];
    if (!row) return null;
    switch (target.kind) {
      case 'name':
        return row.nameInput;
      case 'time':
        return row.timeInput;
      case 'loop':
        return row.loopCheckbox;
      case 'trash':
        return row.iconButtons[0] || null;
      case 'menu':
        return row.iconButtons[1] || null;
      case 'label':
        return row.labelElement;
      case 'dragHandle': {
        // The drag handle is the icon just before the header, in the same line.
        const line = row.labelElement.parentElement;
        if (!line) return null;
        return (
          Array.from(line.children).find(
            child => child !== row.labelElement && !!child.querySelector('svg')
          ) || null
        );
      }
      case 'textButton': {
        const found = row.textButtons.find(button =>
          button.text.includes(target.text)
        );
        return found ? found.element : null;
      }
      case 'addSpriteSplit': {
        const hasAddASprite = row.textButtons.some(button =>
          button.text.includes('Add a sprite')
        );
        // The split menu arrow is the last icon button of the row.
        return hasAddASprite
          ? row.iconButtons[row.iconButtons.length - 1] || null
          : null;
      }
      case 'frame': {
        const frame = row.frames[target.frame];
        return frame ? frame.element : null;
      }
      case 'frameCheckbox': {
        const frame = row.frames[target.frame];
        return frame ? frame.checkbox : null;
      }
      default:
        return null;
    }
  });

  const describe = () => {
    const rows = buildRows();
    return {
      // When locked, the rows have no header: the mounted sprites lists are
      // then matched with the animations by position.
      isAnimationListLocked: !getAnimationLabels().length && rows.length > 0,
      hasAnimationIndexes: getAnimationLabels().some(label =>
        /^Animation #\d+$/.test(textOf(label))
      ),
      rows: rows.map(row => ({
        index: row.index,
        name: row.nameInput ? row.nameInput.value : null,
        timeBetweenFrames: row.timeInput ? row.timeInput.value : null,
        isLooping: row.loopCheckbox ? row.loopCheckbox.checked : null,
        hasSpritesList: !!row.timeInput,
        frames: row.frames
          .filter(frame => !!frame.checkbox)
          .map(frame => ({
            title: frame.title,
            selected: frame.checkbox.checked,
          })),
        hasEmptyFramePlaceholder: row.frames.some(frame => !frame.checkbox),
        textButtons: row.textButtons.map(button => button.text),
      })),
      hasEmptyPlaceholder: !!getEmptyPlaceholder(),
      imagesCount: document.querySelectorAll('img').length,
      ...window.gdVisualTests.describeOverlays(),
    };
  };

  /**
   * The animations of the edited object, when the page gives them (the stories
   * do). Otherwise, only what the editor displays can be checked.
   */
  const readAnimations = () =>
    window.spriteEditorManipulations &&
    window.spriteEditorManipulations.readAnimations
      ? window.spriteEditorManipulations.readAnimations()
      : null;

  /** Compare what the editor displays with what the edited object contains. */
  const check = () => {
    const described = describe();
    const problems = [];
    const model = readAnimations();

    if (!model) {
      if (
        !described.rows.length &&
        !described.hasEmptyPlaceholder &&
        !described.openDialogTitles.length
      )
        problems.push('the animations list is not displayed anymore');
      return { problems, described, model: null };
    }

    if (model.length === 0) {
      if (!described.hasEmptyPlaceholder && described.rows.length !== 0)
        problems.push(
          `the object has no animation but ${
            described.rows.length
          } rows are displayed`
        );
      return { problems, described, model };
    }

    if (
      described.isAnimationListLocked
        ? described.rows.length > model.length
        : described.rows.length !== model.length
    )
      problems.push(
        `${described.rows.length} animation rows displayed, but the object ` +
          `has ${model.length} animations`
      );

    described.rows.forEach((row, position) => {
      const animation = model[position];
      if (!animation) {
        problems.push(`the row at position ${position} has no animation`);
        return;
      }
      if (
        !described.isAnimationListLocked &&
        described.hasAnimationIndexes &&
        row.index !== position
      )
        problems.push(
          `the row at position ${position} is labelled "Animation #${
            row.index
          }"`
        );
      if (row.name !== null && row.name !== animation.name)
        problems.push(
          `the row #${row.index} shows the name "${row.name}" but the ` +
            `animation is named "${animation.name}"`
        );
      if (!row.hasSpritesList) return;

      const direction = animation.directions[0];
      const modelFrames = direction ? direction.frames : [];
      const displayedFrames = row.frames.map(frame => frame.title);
      if (displayedFrames.join('|') !== modelFrames.join('|'))
        problems.push(
          `the row #${row.index} displays the frames [${displayedFrames.join(
            ', '
          )}] but the animation contains [${modelFrames.join(', ')}]`
        );
      if (modelFrames.length === 0 && !row.hasEmptyFramePlaceholder)
        problems.push(
          `the row #${row.index} has no frame but no empty frame placeholder`
        );
      if (!direction) return;

      if (
        modelFrames.length > 0 &&
        Math.abs(Number(row.timeBetweenFrames) - direction.timeBetweenFrames) >
          0.0001
      )
        problems.push(
          `the row #${row.index} shows ${row.timeBetweenFrames}s between ` +
            `frames but the direction has ${direction.timeBetweenFrames}s`
        );
      if (row.isLooping !== null && row.isLooping !== direction.isLooping)
        problems.push(
          `the row #${row.index} shows looping=${String(row.isLooping)} but ` +
            `the direction has looping=${String(direction.isLooping)}`
        );
    });

    return { problems, described, model };
  };

  window.gdVisualTests.spriteEditor = { describe, check, readAnimations };
};

// -------------------------------------------------------------- manipulations

const inRow = (row, kind, extra) => ({
  spriteEditor: { row, kind, ...extra },
});

const rowsWithFrames = state => state.rows.filter(row => row.frames.length > 0);
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

/** What the frames become when the selected ones are moved to `startIndex`. */
const framesAfterMovingSelection = (frames, selected, startIndex) => {
  const clampedStartIndex = Math.min(
    startIndex,
    frames.length - selected.length
  );
  const movedFrames = selected.map(index => frames[index]);
  const otherFrames = frames.filter(
    (frame, index) => !selected.includes(index)
  );
  return [
    ...otherFrames.slice(0, clampedStartIndex),
    ...movedFrames,
    ...otherFrames.slice(clampedStartIndex),
  ];
};

const spriteEditorActions = {
  addAnimation: {
    mustChangeTheObject: true,
    clearsTheFrameSelection: true,
    describe: () => 'add an animation',
    pick: state => (state.hasEmptyPlaceholder ? null : {}),
    run: async page => {
      if (!(await click(page, { button: 'Add an animation' })))
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
      if (!(await click(page, inRow(args.row, 'trash'))))
        return 'there is no delete button';
      await wait(600);
      if (!(await click(page, { dialogButton: 'Remove' })))
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
      if (!(await setInputValue(page, inRow(args.row, 'name'), args.name)))
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
      if (!(await click(page, inRow(args.row, 'menu'))))
        return 'there is no menu button';
      await wait(500);
      if (!(await click(page, { menuItem: args.item }))) {
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
        inRow(args.from, 'dragHandle'),
        inRow(args.to, 'label')
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
      if (!(await setInputValue(page, inRow(args.row, 'time'), args.value)))
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
      if (!(await click(page, inRow(args.row, 'loop'))))
        return 'there is no loop checkbox';
      await wait(400);
    },
  },

  addFrames: {
    mustChangeTheObject: true,
    needsFileDialog: true,
    describe: args => `add frames to the animation #${args.row}`,
    pick: (state, random) => {
      const rows = state.rows.filter(row => row.hasSpritesList);
      return rows.length ? { row: pickOne(rows, random).index } : null;
    },
    run: async (page, args) => {
      if (
        !(await click(
          page,
          inRow(args.row, 'textButton', { text: 'Add a sprite' })
        ))
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
      if (!(await click(page, inRow(args.row, 'addSpriteSplit'))))
        return 'there is no split menu next to "Add a sprite"';
      await wait(500);
      if (
        !(await click(page, {
          menuItem: 'Import fake images named per animation',
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
        if (!(await click(page, inRow(args.row, 'frameCheckbox', { frame }))))
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
      const frames = row.frames.map(frame => frame.title);
      const isMoveObservable = startIndex =>
        !isSelectionAtPosition(startIndex) &&
        framesAfterMovingSelection(frames, selected, startIndex).join('|') !==
          frames.join('|');
      const items = ['Delete selection', 'Duplicate selection'];
      if (row.frames.length > 1) {
        const lastStartIndex = row.frames.length - selected.length;
        if (isMoveObservable(0)) items.push('Move to beginning');
        if (isMoveObservable(lastStartIndex)) items.push('Move to end');
        for (let position = 1; position < lastStartIndex; position++) {
          if (isMoveObservable(position)) items.push(`Position ${position}`);
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

      if (args.item === 'Delete selection')
        return {
          row: args.row,
          frames: frames.filter((frame, index) => !selected.includes(index)),
        };
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
      return {
        row: args.row,
        frames: framesAfterMovingSelection(frames, selected, startIndex),
      };
    },
    run: async (page, args) => {
      if (
        !(await openContextMenu(
          page,
          inRow(args.row, 'frame', { frame: args.frame })
        ))
      )
        return 'the frame is missing';
      await wait(500);
      if (args.isSubmenuItem) {
        if (!(await click(page, { menuItem: 'Move to position' }))) {
          await closeAnyMenu(page);
          return 'there is no "Move to position" submenu';
        }
        await wait(400);
      }
      if (!(await click(page, { menuItem: args.item }))) {
        await closeAnyMenu(page);
        return `the menu item "${args.item}" is missing`;
      }
      await wait(700);
      // Deleting the last frames of an object using a custom collision mask
      // asks for a confirmation.
      await click(page, { dialogButton: 'Remove' });
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
        inRow(args.row, 'frame', { frame: args.from }),
        inRow(args.row, 'frame', { frame: args.to }),
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
        !(await click(
          page,
          inRow(args.row, 'textButton', { text: 'the fake image editor' })
        ))
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
        !(await click(page, inRow(args.row, 'textButton', { text: 'Preview' })))
      )
        return 'there is no Preview button';
      await wait(1200);
      if (!(await click(page, { dialogButton: 'Ok' })))
        return 'the preview dialog did not close';
      await wait(500);
    },
  },

  openPointsEditor: {
    describe: () => 'open and close the points editor',
    pick: state => (rowsWithFrames(state).length ? {} : null),
    run: async page => {
      if (!(await click(page, { exactButton: 'Edit points' })))
        return 'there is no "Edit points" button';
      await wait(1500);
      if (!(await click(page, { dialogButton: 'Apply' })))
        return 'the points editor did not close';
      await wait(600);
    },
  },

  openCollisionMasksEditor: {
    describe: () => 'open and close the collision masks editor',
    pick: state => (rowsWithFrames(state).length ? {} : null),
    run: async page => {
      if (!(await click(page, { exactButton: 'Edit collision masks' })))
        return 'there is no "Edit collision masks" button';
      await wait(1500);
      if (!(await click(page, { dialogButton: 'Apply' })))
        return 'the collision masks editor did not close';
      await wait(600);
    },
  },

  openAdvancedOptions: {
    describe: () => 'open and close the advanced options',
    pick: state => (rowsWithFrames(state).length ? {} : null),
    run: async page => {
      if (!(await click(page, { exactButton: 'Advanced options' })))
        return 'there is no "Advanced options" button';
      await wait(900);
      if (!(await click(page, { dialogButton: 'Close' })))
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
      if (!(await click(page, { button: 'Import images' })))
        return 'there is no "Import images" button';
      await wait(1500);
    },
  },

  serialize: {
    needsStorybook: true,
    describe: () => 'serialize the object (like saving does)',
    pick: () => ({}),
    run: async page => {
      if (!(await click(page, { exactButton: 'Update' })))
        return 'there is no serialization button on this story';
      await wait(500);
    },
  },
};

const actions = { ...genericActions, ...spriteEditorActions };

const monkeyWeights = {
  ...genericMonkeyWeights,
  addAnimation: 3,
  deleteAnimation: 2,
  renameAnimation: 2,
  moveAnimationWithMenu: 3,
  dragAnimation: 2,
  setTimeBetweenFrames: 1,
  toggleLoop: 1,
  addFrames: 3,
  importAnimationsInEmptyAnimation: 1,
  importImagesFromPlaceholder: 8,
  selectFrames: 4,
  frameContextMenuAction: 4,
  dragFrame: 3,
  editWithExternalEditor: 2,
  openPreview: 1,
  openPointsEditor: 1,
  openCollisionMasksEditor: 1,
  openAdvancedOptions: 1,
  serialize: 2,
};

/**
 * The manipulations that can be done on the real app: not the ones going
 * through a menu (native menus can't be driven there), opening a file picker or
 * an external editor window, or only existing on a story.
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

// ----------------------------------------------- what the runner checks with

const describe = page =>
  page.evaluate(() => window.gdVisualTests.spriteEditor.describe());

/**
 * The animations as the edited object contains them when the page gives it
 * (the stories do), or as the editor displays them otherwise - in the same
 * shape, so that the runner can compare two snapshots either way.
 */
const snapshot = page =>
  page.evaluate(() => {
    const { spriteEditor } = window.gdVisualTests;
    const editedObject = spriteEditor.readAnimations();
    if (editedObject)
      return {
        isFromTheObject: true,
        animations: editedObject.map(animation => ({
          name: animation.name,
          frames: animation.directions[0] ? animation.directions[0].frames : [],
          directions: animation.directions,
        })),
      };

    const described = spriteEditor.describe();
    return {
      isFromTheObject: false,
      animations: (described.rows || []).map(row => ({
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
  });

const summarizeAnimation = animation =>
  JSON.stringify({ name: animation.name, directions: animation.directions });

/** A short description of what a manipulation changed. */
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

const framesOf = (snapshot, position) => {
  const animation = snapshot.animations[position];
  return animation ? animation.frames : [];
};

/** Check the precise outcome a manipulation declared with `expect`. */
const checkExpectation = (expectation, snapshotAfter) => {
  // Only the object itself is precise enough to be checked against.
  if (!snapshotAfter.isFromTheObject) return [];

  const problems = [];
  const framesAfter = framesOf(snapshotAfter, expectation.row);
  const expected = expectation.frames;
  if (expected && framesAfter.join('|') !== expected.join('|'))
    problems.push(
      `the frames of the animation #${expectation.row} are [${framesAfter.join(
        ', '
      )}] but [${expected.join(', ')}] was expected`
    );

  const prefix = expectation.framesStartWith;
  if (
    prefix &&
    framesAfter.slice(0, prefix.length).join('|') !== prefix.join('|')
  )
    problems.push(
      `the frames of the animation #${expectation.row} are [${framesAfter.join(
        ', '
      )}] but they should start with [${prefix.join(', ')}]`
    );

  if (
    expectation.framesCount !== undefined &&
    framesAfter.length !== expectation.framesCount
  )
    problems.push(
      `the animation #${expectation.row} has ${
        framesAfter.length
      } frames but ` + `${expectation.framesCount} were expected`
    );

  const animationAfter = snapshotAfter.animations[expectation.row];
  const directionAfter = animationAfter && animationAfter.directions[0];
  if (
    directionAfter &&
    expectation.timeBetweenFrames !== undefined &&
    Math.abs(directionAfter.timeBetweenFrames - expectation.timeBetweenFrames) >
      0.0001
  )
    problems.push(
      `the animation #${expectation.row} now has ` +
        `${directionAfter.timeBetweenFrames}s between frames instead of ` +
        `${expectation.timeBetweenFrames}s`
    );
  if (
    directionAfter &&
    expectation.isLooping !== undefined &&
    expectation.isLooping !== null &&
    directionAfter.isLooping !== expectation.isLooping
  )
    problems.push(
      `the looping of the animation #${expectation.row} became ` +
        `${String(directionAfter.isLooping)}`
    );
  return problems;
};

/** The invariants checked after every manipulation flagged with their name. */
const stepChecks = {
  // A change of the animations must not leave frames selected: the selection
  // designates them by their index, which would point at other frames.
  clearsTheFrameSelection: async ({ page, hadNoEffect }) => {
    if (hadNoEffect) return [];
    const stateAfter = await describe(page);
    const stillSelected = (stateAfter.rows || [])
      .map(row =>
        row.frames
          .filter(frame => frame.selected)
          .map(frame => `#${row.index} ${frame.title}`)
      )
      .reduce((all, some) => all.concat(some), []);
    if (!stillSelected.length) return [];
    return [
      `${stillSelected.length} frame(s) are still shown as selected after ` +
        `the animations changed: ${stillSelected.join(', ')}`,
    ];
  },

  // Only reordering never creates or loses anything.
  keepsTheFrames: ({ snapshotBefore, snapshotAfter }) => {
    const allFrames = snapshot =>
      snapshot.animations
        .map(animation => animation.frames)
        .reduce((all, frames) => all.concat(frames), [])
        .sort()
        .join('|');
    if (allFrames(snapshotBefore) === allFrames(snapshotAfter)) return [];
    return ['the frames of the object were not only reordered'];
  },
};

module.exports = {
  name: 'sprite-editor',
  // The tests using this helper are only run when one of these changed.
  paths: [
    'newIDE/app/src/ObjectEditor/Editors/SpriteEditor/',
    'newIDE/app/src/ObjectEditor/ObjectEditorDialog.js',
    'newIDE/app/src/ResourcesList/ResourceThumbnail/',
    'newIDE/app/src/UI/DragAndDrop/',
    'newIDE/app/src/UI/MountOnFirstVisible.js',
    'newIDE/app/src/stories/componentStories/ObjectEditor/SpriteEditorManipulations.stories.js',
  ],
  installPageHelpers: installSpriteEditorPageHelpers,
  actions,
  monkeyWeights,
  getRealEditorActionNames,
  describe,
  check: page => page.evaluate(() => window.gdVisualTests.spriteEditor.check()),
  snapshot,
  describeEffect,
  checkExpectation,
  stepChecks,
  summarize: async page => {
    const described = await describe(page);
    return `${described.rows.length} animations, ${
      described.imagesCount
    } thumbnails displayed`;
  },
};
