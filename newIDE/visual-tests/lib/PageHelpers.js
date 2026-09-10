// @ts-check

/**
 * Generic helpers installed in the page under `window.gdVisualTests`, to find
 * and use the controls of any editor.
 *
 * Elements are designated by a "target", one of:
 * - `{ selector: '#apply-button' }`
 * - `{ button: 'Add a' }` (a button containing this text)
 * - `{ exactButton: 'Apply' }`
 * - `{ dialogButton: 'Apply' }` (in the dialog on top, as several dialogs can
 *   be opened one over the other and have a button with the same label)
 * - `{ menuItem: 'Move to top' }`
 * - `{ tab: 'Behaviors' }`
 * - `{ text: 'Add your first animation' }`
 *
 * An editor with its own way of designating things (a row of a list, a frame...)
 * registers a resolver with `addTargetResolver`, and its targets are then
 * `{ <resolverName>: { ...whatever it needs } }`.
 */
const installPageHelpers = function() {
  const isLeaf = element => element.children.length === 0;
  const textOf = element => (element.textContent || '').trim();

  const findButton = (text, exact, inTopMostDialog) => {
    let root = document;
    if (inTopMostDialog) {
      const dialogs = Array.from(document.querySelectorAll('[role="dialog"]'));
      root = dialogs[dialogs.length - 1];
      if (!root) return null;
    }
    return (
      Array.from(root.querySelectorAll('button')).find(button =>
        exact ? textOf(button) === text : textOf(button).includes(text)
      ) || null
    );
  };

  const findMenuItem = text => {
    const items = Array.from(
      document.querySelectorAll('[role="menuitem"], li')
    );
    const exactItem = items.find(item => textOf(item) === text);
    if (exactItem) return exactItem;

    // A built Storybook does not interpolate the translated labels, so they all
    // show the same placeholder ("Position {index}"): the one to click is then
    // found by its position.
    const match = text.match(/^(.*?)(\d+)$/);
    if (!match) return null;
    const itemsWithAPlaceholder = items.filter(item => {
      const itemText = textOf(item);
      return itemText.startsWith(match[1]) && /\{[a-zA-Z]+\}$/.test(itemText);
    });
    return itemsWithAPlaceholder[Number(match[2]) - 1] || null;
  };

  const findByText = text =>
    Array.from(document.querySelectorAll('*')).find(
      element => isLeaf(element) && textOf(element) === text
    ) || null;

  const findTab = text =>
    Array.from(document.querySelectorAll('[role="tab"], .MuiTab-root')).find(
      tab => textOf(tab).includes(text)
    ) || null;

  /** The outermost scrollable list of the page, or the one containing an element. */
  const getScrollableList = elementInside => {
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
    if (elementInside) {
      const containing = candidates.filter(element =>
        element.contains(elementInside)
      );
      if (containing.length) return containing[0];
    }
    return candidates.length ? candidates[0] : document.body;
  };

  const targetResolvers = {};

  const locate = target => {
    if (!target) return null;
    if (target.selector) return document.querySelector(target.selector);
    if (target.button) return findButton(target.button, false, false);
    if (target.exactButton) return findButton(target.exactButton, true, false);
    if (target.dialogButton) return findButton(target.dialogButton, true, true);
    if (target.menuItem) return findMenuItem(target.menuItem);
    if (target.tab) return findTab(target.tab);
    if (target.text) return findByText(target.text);
    for (const name in targetResolvers) {
      if (target[name]) return targetResolvers[name](target[name]);
    }
    return null;
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

  /** Like a user typing, for the fields reacting to every key stroke. */
  const typeInInput = (target, value) => {
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
    element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    return true;
  };

  /** The position of an element, to press it or drop something on it. */
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
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    // The element must really be there: not scrolled out of its list or
    // behind something else (its rect would still be within the window).
    const elementAtPoint = document.elementFromPoint(x, y);
    if (
      !elementAtPoint ||
      !(element.contains(elementAtPoint) || elementAtPoint.contains(element))
    )
      return null;
    return { x, y, width: rect.width, height: rect.height };
  };

  const openContextMenu = target => {
    const element = locate(target);
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

  const scrollList = (delta, target) => {
    const list = getScrollableList(target ? locate(target) : null);
    const from = list.scrollTop;
    list.scrollTop = from + delta;
    return {
      from,
      to: list.scrollTop,
      max: list.scrollHeight - list.clientHeight,
    };
  };

  /** What is currently opened over the editor, and its texts. */
  const describeOverlays = () => ({
    openDialogTitles: Array.from(
      document.querySelectorAll('[role="dialog"] h1, [role="dialog"] h2')
    ).map(title => textOf(title)),
    openMenuItems: Array.from(
      document.querySelectorAll('[role="menuitem"]')
    ).map(item => textOf(item)),
  });

  window.gdVisualTests = {
    // Used by the editor specific helpers.
    isLeaf,
    textOf,
    getScrollableList,
    addTargetResolver: (name, resolver) => {
      targetResolvers[name] = resolver;
    },
    // Used by the tests.
    locate,
    click,
    setInputValue,
    typeInInput,
    rectOf,
    openContextMenu,
    scrollList,
    describeOverlays,
    exists: target => !!locate(target),
    textsOf: selector =>
      Array.from(document.querySelectorAll(selector)).map(textOf),
  };
};

module.exports = { installPageHelpers };
