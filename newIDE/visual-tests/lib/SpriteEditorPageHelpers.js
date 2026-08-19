// @ts-check

/**
 * Installed in the page (both a Storybook story and the real editor) to find
 * the controls of the Sprite object editor and to describe what it displays.
 *
 * Everything is exposed on `window.gdVisualTests`.
 *
 * The animations list is read by walking the elements of the scrollable list in
 * document order and cutting it into rows at each "Animation #x" header (or, if
 * the list is locked - like for a child object of a custom object - at the
 * settings of each direction, as there is no header then).
 */
const installSpriteEditorHelpers = function() {
  // In a built Storybook, the translated header of a row is not interpolated
  // and shows its placeholder instead of the index of the animation (the real
  // app does show the index): the index is then taken from the position of the
  // row.
  const labelRegExp = /^Animation #(\d+|\{animationIndex\})$/;

  const isLeaf = element => element.children.length === 0;
  const textOf = element => (element.textContent || '').trim();

  const getAnimationLabels = () =>
    Array.from(document.querySelectorAll('*')).filter(
      element => isLeaf(element) && labelRegExp.test(textOf(element))
    );

  const getEmptyPlaceholder = () =>
    Array.from(document.querySelectorAll('*')).find(
      element =>
        isLeaf(element) && textOf(element) === 'Add your first animation'
    ) || null;

  const getScrollView = () => {
    const candidates = Array.from(document.querySelectorAll('div')).filter(
      element => {
        const { overflowY } = window.getComputedStyle(element);
        return (
          (overflowY === 'auto' || overflowY === 'scroll') &&
          // Storybook and the editor have hidden scrollable wrappers.
          element.scrollHeight > 0
        );
      }
    );
    const content = getAnimationLabels()[0] || getEmptyPlaceholder();
    if (content) {
      const containing = candidates.filter(element =>
        element.contains(content)
      );
      // The animations list is the outermost one containing the animations.
      if (containing.length) return containing[0];
    }
    return candidates.length ? candidates[0] : document.body;
  };

  /** All the elements of interest of the animations list, in document order. */
  const collectItems = root => {
    const items = [];
    Array.from(root.querySelectorAll('*')).forEach(element => {
      const text = textOf(element);
      if (isLeaf(element) && labelRegExp.test(text)) {
        items.push({
          kind: 'label',
          element,
          index: Number(text.match(labelRegExp)[1]),
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
    const items = collectItems(getScrollView());
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
          index:
            hasLabels && item.index !== null && item.index !== undefined
              ? item.index
              : rows.length,
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
          if (lastFrame && lastFrame.element.contains(item.element)) {
            lastFrame.checkbox = item.element;
          } else {
            row.loopCheckbox = item.element;
          }
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

  const findButton = (text, exact) =>
    Array.from(document.querySelectorAll('button')).find(button =>
      exact ? textOf(button) === text : textOf(button).includes(text)
    ) || null;

  const findDialogButton = text => {
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"]'));
    const topMostDialog = dialogs[dialogs.length - 1];
    if (!topMostDialog) return null;
    return (
      Array.from(topMostDialog.querySelectorAll('button')).find(
        button => textOf(button) === text
      ) || null
    );
  };

  const findMenuItem = text => {
    const items = Array.from(
      document.querySelectorAll('[role="menuitem"], li')
    );
    const exactItem = items.find(item => textOf(item) === text);
    if (exactItem) return exactItem;

    // In a built Storybook, the labels are not interpolated and show their
    // placeholder ("Position {index}"), so they are all identical: the one to
    // click is found by its position instead.
    const match = text.match(/^(.*?)(\d+)$/);
    if (!match) return null;
    const itemsWithAPlaceholder = items.filter(item => {
      const itemText = textOf(item);
      return itemText.startsWith(match[1]) && /\{[a-zA-Z]+\}$/.test(itemText);
    });
    return itemsWithAPlaceholder[Number(match[2]) - 1] || null;
  };

  /**
   * Find the element designated by a target, which is either global
   * (`{ global: 'button' | 'exactButton' | 'menuItem', text }`) or in a row of
   * the animations list (`{ row, kind, frame }`).
   */
  const locate = target => {
    if (target.global) {
      if (target.global === 'menuItem') return findMenuItem(target.text);
      if (target.global === 'dialogButton')
        return findDialogButton(target.text);
      return findButton(target.text, target.global === 'exactButton');
    }
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
        // The drag handle is the icon just before the "Animation #x" header.
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
  };

  const describe = () => {
    const rows = buildRows();
    return {
      // When locked, the rows have no header: the mounted sprites lists are
      // then matched with the animations by position.
      isAnimationListLocked: !getAnimationLabels().length && rows.length > 0,
      // False in a built Storybook, where the headers show their placeholder
      // instead of the index of their animation.
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
      openDialogTitles: Array.from(
        document.querySelectorAll('[role="dialog"] h1, [role="dialog"] h2')
      ).map(title => textOf(title)),
      openMenuItems: Array.from(
        document.querySelectorAll('[role="menuitem"]')
      ).map(item => textOf(item)),
      imagesCount: document.querySelectorAll('img').length,
    };
  };

  /**
   * The animations of the edited object, as plain JavaScript - only available
   * when the page exposes them (the Storybook stories do).
   */
  const readAnimations = () =>
    window.spriteEditorManipulations &&
    window.spriteEditorManipulations.readAnimations
      ? window.spriteEditorManipulations.readAnimations()
      : null;

  /**
   * Compare what the editor displays with what the edited object contains.
   * Without the animations of the object (real editor), only what can be
   * checked on the page is checked.
   */
  const check = () => {
    const described = describe();
    const problems = [];
    const model = readAnimations();

    if (!model) {
      // The editor must at least still be displaying something.
      if (
        !described.rows.length &&
        !described.hasEmptyPlaceholder &&
        !described.openDialogTitles.length
      ) {
        problems.push('the animations list is not displayed anymore');
      }
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
    ) {
      problems.push(
        `${described.rows.length} animation rows displayed, but the object ` +
          `has ${model.length} animations`
      );
    }

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
      ) {
        problems.push(
          `the row at position ${position} is labelled "Animation #${
            row.index
          }"`
        );
      }
      if (row.name !== null && row.name !== animation.name) {
        problems.push(
          `the row #${row.index} shows the name "${row.name}" but the ` +
            `animation is named "${animation.name}"`
        );
      }
      if (!row.hasSpritesList) return;

      const direction = animation.directions[0];
      const modelFrames = direction ? direction.frames : [];
      const displayedFrames = row.frames.map(frame => frame.title);
      if (displayedFrames.join('|') !== modelFrames.join('|')) {
        problems.push(
          `the row #${row.index} displays the frames [${displayedFrames.join(
            ', '
          )}] but the animation contains [${modelFrames.join(', ')}]`
        );
      }
      if (modelFrames.length === 0 && !row.hasEmptyFramePlaceholder) {
        problems.push(
          `the row #${row.index} has no frame but no empty frame placeholder`
        );
      }
      if (!direction) return;

      if (
        modelFrames.length > 0 &&
        Math.abs(Number(row.timeBetweenFrames) - direction.timeBetweenFrames) >
          0.0001
      ) {
        problems.push(
          `the row #${row.index} shows ${row.timeBetweenFrames}s between ` +
            `frames but the direction has ${direction.timeBetweenFrames}s`
        );
      }
      if (row.isLooping !== null && row.isLooping !== direction.isLooping) {
        problems.push(
          `the row #${row.index} shows looping=${String(row.isLooping)} but ` +
            `the direction has looping=${String(direction.isLooping)}`
        );
      }
    });

    return { problems, described, model };
  };

  const rectOf = (target, shouldScroll) => {
    const element = locate(target);
    if (!element) return null;
    if (shouldScroll !== false) element.scrollIntoView({ block: 'center' });
    const rect = element.getBoundingClientRect();
    if (
      rect.width === 0 ||
      rect.height === 0 ||
      rect.top < 0 ||
      rect.bottom > window.innerHeight ||
      rect.left < 0 ||
      rect.right > window.innerWidth
    )
      return null;
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };
  };

  const click = target => {
    const element = locate(target);
    if (!element) return false;
    element.scrollIntoView({ block: 'center' });
    element.click();
    return true;
  };

  const setInputValue = (target, value) => {
    const element = locate(target);
    if (!element) return false;
    const setValue = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set;
    element.scrollIntoView({ block: 'center' });
    element.focus();
    setValue.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.blur();
    return true;
  };

  const openFrameContextMenu = (row, frame) => {
    const element = locate({ row, kind: 'frame', frame });
    if (!element) return false;
    element.scrollIntoView({ block: 'center' });
    const rect = element.getBoundingClientRect();
    element.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        clientX: rect.left + 10,
        clientY: rect.top + 10,
      })
    );
    return true;
  };

  const scrollBy = delta => {
    const scrollView = getScrollView();
    const from = scrollView.scrollTop;
    scrollView.scrollTop = from + delta;
    return {
      from,
      to: scrollView.scrollTop,
      max: scrollView.scrollHeight - scrollView.clientHeight,
    };
  };

  window.gdVisualTests = {
    describe,
    check,
    readAnimations,
    click,
    rectOf,
    setInputValue,
    openFrameContextMenu,
    scrollBy,
  };
};

module.exports = { installSpriteEditorHelpers };
