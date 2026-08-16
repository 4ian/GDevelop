// @flow
export const aboveMaterialUiMaxZIndex = 1501; // highest z-index used by MaterialUI is 1500

export const classNameToStillAllowRenderingInstancesEditor =
  'allow-rendering-instances';

export const shouldPreventRenderingInstanceEditors = (): boolean => {
  // Fast check: if no dialog is opened, rendering is not prevented.
  const dialogElement = document.querySelector(
    'body > div[role="presentation"].MuiDialog-root'
  );
  if (!dialogElement) {
    return false;
  }

  // A dialog is opened. Prevent rendering, unless the dialog exceptionally allows it.
  return !dialogElement.classList.contains(
    classNameToStillAllowRenderingInstancesEditor
  );
};

export const isElementADialog = (
  element: Element,
  options?: { isVisible: true }
): true | boolean => {
  const isDialog =
    element.tagName === 'DIV' &&
    element.getAttribute('role') === 'presentation';
  if (!isDialog) return false;
  if (options && options.isVisible) {
    return !element.getAttribute('aria-hidden');
  }
  return true;
};

/**
 * Checks if an input element is a Material UI checkbox.
 */
export const isMuiCheckbox = (element: HTMLElement): boolean => {
  const typeAttribute = element.attributes.getNamedItem('type');
  return (
    typeAttribute &&
    typeAttribute.value === 'checkbox' &&
    'indeterminate' in element.dataset
  );
};

/**
 * Returns the value of a Material UI checkbox.
 * Material UI does not use the value of the input element
 * (See https://v4.mui.com/api/checkbox/#props) so we have to check
 * the classes of the grand parent of the input element.
 */
export const getMuiCheckboxValue = (element: HTMLElement): boolean => {
  const { parentElement } = element;
  if (parentElement) {
    const { parentElement: grandParentElement } = parentElement;
    return grandParentElement
      ? grandParentElement.classList.contains('Mui-checked')
      : false;
  }
  return true;
};

export const doesPathContainDialog = (path: Array<Element>): boolean => {
  // Dialogs root elements are directly placed in the body element.
  // So the path is global > document > html > body > dialog.
  try {
    return isElementADialog(path[path.length - 5], { isVisible: true });
  } catch (error) {
    console.error(
      `An error occurred when determining if path ${
        path && path.join ? path.join(' > ') : '[not serializable]'
      } leads to a dialog`,
      error
    );
    return false;
  }
};

export const isElementAMuiInput = (element: Element): boolean => {
  return element.classList.contains('MuiInputBase-root');
};

/**
 * Returns the element on which the Material UI dialog containing the given
 * element is "trapping" the focus, if any (this is the element that `Dialog`
 * gives to the `TrapFocus` used internally by `Modal`).
 *
 * A dialog gives the focus back to this element as long as the focused element
 * is not one of its children. So anything rendered in a portal outside of it (a
 * `Popper` for example) can never keep the focus: its text fields are then
 * impossible to click on or to type in. Rendering the portal inside this
 * element works around this.
 */
export const getDialogFocusTrapContainer = (element: Element): ?HTMLElement => {
  // The class name is matched by prefix, and not exactly: because themes are
  // nested (see `FullThemeProvider`), Material UI appends a counter to its
  // global class names (`MuiDialog-container-10242` for example).
  // The result is not checked with `instanceof HTMLElement`, as it can come from
  // another window (see `WindowPortal`) where constructors are different.
  return ((element.closest(
    '[class^="MuiDialog-container"], [class*=" MuiDialog-container"]'
  ): any): ?HTMLElement);
};
