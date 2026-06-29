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
 * Heal the main window after a popped-out window (see WindowPortal) closes.
 *
 * A popped-out window (e.g. the debugger) shares the SAME JS context and the
 * SAME Material-UI global ModalManager as the main window. When such a window
 * is destroyed by Electron — especially abruptly, or while a Menu/Select/Popover
 * was open inside it — MUI's teardown can run against the now-dead external
 * document and fail to clean up. This leaves the MAIN window in a broken state:
 *
 *  - An orphaned MUI overlay root (`.MuiModal-root` / `.MuiPopover-root` /
 *    `.MuiMenu-root` / `.MuiPopover-root`) left in `document.body`. These are
 *    `position: fixed; inset: 0; z-index: 1300`, so even when visually empty
 *    they sit on top of the whole editor and swallow every click — the
 *    "UI not responding / can't click anything" symptom.
 *  - `aria-hidden="true"` left on the editor's root nodes (siblings of the
 *    modal mount node), which can make the app inert to assistive tech and,
 *    combined with the orphan above, leaves the UI unusable.
 *  - `overflow: hidden` / `padding-right` left on `document.body` from the MUI
 *    scroll-lock.
 *
 * This function removes those leftovers. It only touches overlay roots that
 * have NO visible/open content (so it never closes a legitimately-open dialog
 * in the main window), and only clears body styles when there is no longer any
 * open modal. Safe to call on every popped-out-window close.
 */
export const cleanupLeakedOverlaysAfterPopOutClose = (): void => {
  try {
    const body = document.body;
    if (!body) return;

    const overlaySelector =
      '.MuiModal-root, .MuiPopover-root, .MuiMenu-root, .MuiDialog-root';
    const overlays = body.querySelectorAll(`:scope > ${overlaySelector}`);

    let removedAny = false;
    overlays.forEach(overlay => {
      // A genuinely-open MUI overlay contains a Paper/Backdrop child. An
      // orphaned/leaked root left by a destroyed window is empty (its React
      // subtree lived in the dead window and never mounted children here), or
      // its only content is an already-hidden (aria-hidden) presentation node.
      const hasVisibleContent = !!overlay.querySelector(
        '.MuiBackdrop-root, .MuiPaper-root, .MuiPopover-paper, .MuiMenu-paper'
      );
      if (!hasVisibleContent) {
        overlay.parentNode && overlay.parentNode.removeChild(overlay);
        removedAny = true;
      }
    });

    // If, after removing orphans, there is no real open modal/popover left,
    // make sure the editor is not left inert or scroll-locked.
    const stillHasOpenOverlay = !!body.querySelector(
      `:scope > ${overlaySelector}`
    );
    if (!stillHasOpenOverlay) {
      // Un-hide any nodes MUI's ariaHiddenSiblings left hidden.
      const hiddenNodes = body.querySelectorAll(
        ':scope > [aria-hidden="true"]'
      );
      hiddenNodes.forEach(node => {
        // Don't touch nodes that intentionally use aria-hidden for icons etc.
        // Top-level body children that are app roots/portals are what MUI hides.
        node.removeAttribute('aria-hidden');
      });

      // Clear MUI scroll-lock leftovers on the body.
      if (body.style.overflow === 'hidden') {
        body.style.removeProperty('overflow');
      }
      if (body.style.paddingRight) {
        body.style.removeProperty('padding-right');
      }
    }

    if (removedAny) {
      console.info(
        'Cleaned up leaked Material-UI overlay(s) from the main window after a popped-out window closed.'
      );
    }
  } catch (error) {
    console.warn(
      'Error while cleaning up leaked overlays after popped-out window close:',
      error
    );
  }
};

/**
 * Diagnostic: report any element that is currently capable of blocking pointer
 * input across (most of) the main window. Call this from the console — or it is
 * called automatically after a popped-out window closes — to identify what is
 * making the editor unresponsive. Logs each suspicious element with the reason.
 *
 * Returns the list of suspicious elements (also stored on
 * `window.__gdBlockingOverlays` for inspection).
 */
export const reportPotentialInputBlockers = (): Array<Element> => {
  const suspicious: Array<{| element: Element, reasons: Array<string> |}> = [];
  try {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const all = document.body ? document.body.querySelectorAll('*') : [];

    all.forEach(element => {
      const style = window.getComputedStyle(element);
      if (style.pointerEvents === 'none') return;
      if (style.display === 'none' || style.visibility === 'hidden') return;

      const position = style.position;
      if (position !== 'fixed' && position !== 'absolute') return;

      const rect = element.getBoundingClientRect();
      // Does it cover most of the viewport?
      const coversMost =
        rect.width >= viewportWidth * 0.8 &&
        rect.height >= viewportHeight * 0.8 &&
        rect.top <= viewportHeight * 0.1 &&
        rect.left <= viewportWidth * 0.1;
      if (!coversMost) return;

      const zIndex = parseInt(style.zIndex, 10);
      const reasons = [];
      reasons.push(`position:${position}`);
      reasons.push(`zIndex:${style.zIndex}`);
      reasons.push(
        `rect:${Math.round(rect.width)}x${Math.round(
          rect.height
        )}@(${Math.round(rect.left)},${Math.round(rect.top)})`
      );
      if (element.getAttribute('aria-hidden') === 'true')
        reasons.push('aria-hidden');
      if (!Number.isNaN(zIndex) && zIndex >= 1000)
        reasons.push('high-z-index-overlay');

      suspicious.push({ element, reasons });
    });

    // Also flag body-level inert/scroll-lock state.
    const body = document.body;
    if (body) {
      const bodyStyle = window.getComputedStyle(body);
      if (bodyStyle.pointerEvents === 'none')
        console.warn('document.body has pointer-events:none!');
      if (body.getAttribute('aria-hidden') === 'true')
        console.warn('document.body has aria-hidden=true!');
      // $FlowFixMe[prop-missing]
      if (body.inert) console.warn('document.body is inert!');
    }

    if (suspicious.length) {
      console.warn(
        `[InputBlockerReport] Found ${
          suspicious.length
        } element(s) potentially covering the editor:`
      );
      suspicious.forEach(({ element, reasons }, index) => {
        console.warn(
          `  #${index}`,
          element,
          element.className ? `class="${element.className}"` : '',
          reasons.join(', ')
        );
      });
    } else {
      console.info(
        '[InputBlockerReport] No full-viewport overlay found covering the editor.'
      );
    }
  } catch (error) {
    console.warn('[InputBlockerReport] error:', error);
  }

  const elements = suspicious.map(s => s.element);
  // $FlowFixMe[prop-missing] - debug handle.
  window.__gdBlockingOverlays = elements;
  return elements;
};
