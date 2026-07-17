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
 * Release focus before an operation that can open a Material-UI modal or move
 * the current editor into another window. MUI hides modal siblings before its
 * focus trap runs, and browsers reject aria-hidden when one of those siblings
 * still contains the focused control.
 */
export const blurActiveElementBeforeUiTransition = (): void => {
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement) activeElement.blur();
};

const materialUiOverlayRootSelectors = [
  '.MuiModal-root',
  '.MuiDrawer-modal',
  '.MuiPopover-root',
  '.MuiMenu-root',
  '.MuiDialog-root',
];
const materialUiOverlayRootSelector = materialUiOverlayRootSelectors.join(', ');
const topLevelMaterialUiOverlayRootSelector = materialUiOverlayRootSelectors
  .map(selector => `:scope > ${selector}`)
  .join(', ');
const topLevelMaterialUiCleanupCandidateSelector = [
  topLevelMaterialUiOverlayRootSelector,
  ':scope > .MuiBackdrop-root',
].join(', ');
const materialUiOverlaySurfaceSelector = [
  '.MuiPaper-root',
  '.MuiPopover-paper',
  '.MuiMenu-paper',
  '[role="dialog"]',
  '[role="menu"]',
  '[role="listbox"]',
].join(', ');
const keepMountedTemporarySideMenuPaperSelector = [
  '#project-manager-drawer-paper',
  '#version-history-drawer-paper',
].join(', ');
const staleOverlayAttribute = 'data-gdevelop-stale-overlay';

const getElementClassName = (element: Element): string => {
  const className = (element: any).className;
  return typeof className === 'string' ? className : '';
};

const elementMatchesSelector = (
  element: Element,
  selector: string
): boolean => {
  try {
    return element.matches(selector);
  } catch (error) {
    return false;
  }
};

const isElementVisible = (element: Element): boolean => {
  try {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  } catch (error) {
    return true;
  }
};

const isElementHiddenOrClosed = (element: Element): boolean => {
  return (
    element.getAttribute('aria-hidden') === 'true' || !isElementVisible(element)
  );
};

const elementContainsActiveElement = (element: Element): boolean => {
  const activeElement = document.activeElement;
  try {
    return !!activeElement && element.contains(activeElement);
  } catch (error) {
    return false;
  }
};

const hasVisibleInteractiveOverlayContent = (element: Element): boolean => {
  const surfaces = element.querySelectorAll(materialUiOverlaySurfaceSelector);
  for (let index = 0; index < surfaces.length; index++) {
    if (isElementVisible(surfaces[index])) return true;
  }
  return false;
};

const isKeepMountedTemporarySideMenuOverlay = (element: Element): boolean =>
  !!element.querySelector(keepMountedTemporarySideMenuPaperSelector);

const neutralizeElement = (element: Element): boolean => {
  if (!element.parentNode) return false;

  // Never detach a Material-UI portal node manually. The node is owned by
  // React, even while a transition is closing or a pop-out teardown has left
  // it in an inconsistent state. Removing it here leaves React's fiber tree
  // pointing at a node that is no longer under document.body; the next menu
  // render then crashes in ReactDOM with a removeChild NotFoundError.
  //
  // Making a stale overlay inert fixes the input blocker while keeping the DOM
  // relationship intact so React can safely finish its own unmount. A truly
  // orphaned node can remain until the editor window is reloaded, but it is
  // hidden and cannot intercept input.
  const elementWithStyle: any = element;
  if (elementWithStyle.style) {
    elementWithStyle.style.pointerEvents = 'none';
    elementWithStyle.style.visibility = 'hidden';
  }
  element.setAttribute('aria-hidden', 'true');
  element.setAttribute(staleOverlayAttribute, 'true');
  return true;
};

type InputBlockerReport = {| element: Element, reasons: Array<string> |};

const isElementCoveringMostOfViewport = (element: Element): boolean => {
  const documentElement = document.documentElement;
  const viewportWidth =
    window.innerWidth ||
    (documentElement ? documentElement.clientWidth : 0) ||
    1;
  const viewportHeight =
    window.innerHeight ||
    (documentElement ? documentElement.clientHeight : 0) ||
    1;
  const rect = element.getBoundingClientRect();

  return (
    rect.width >= viewportWidth * 0.8 &&
    rect.height >= viewportHeight * 0.8 &&
    rect.top <= viewportHeight * 0.1 &&
    rect.left <= viewportWidth * 0.1
  );
};

const collectPotentialInputBlockers = (): Array<InputBlockerReport> => {
  const suspicious: Array<InputBlockerReport> = [];
  const all = document.body ? document.body.querySelectorAll('*') : [];

  all.forEach(element => {
    const style = window.getComputedStyle(element);
    if (style.pointerEvents === 'none') return;
    if (style.display === 'none' || style.visibility === 'hidden') return;

    const position = style.position;
    if (position !== 'fixed' && position !== 'absolute') return;
    if (!isElementCoveringMostOfViewport(element)) return;

    const rect = element.getBoundingClientRect();
    const zIndex = parseInt(style.zIndex, 10);
    const reasons = [];
    reasons.push(`position:${position}`);
    reasons.push(`zIndex:${style.zIndex}`);
    reasons.push(
      `rect:${Math.round(rect.width)}x${Math.round(rect.height)}@(${Math.round(
        rect.left
      )},${Math.round(rect.top)})`
    );
    if (element.getAttribute('aria-hidden') === 'true')
      reasons.push('aria-hidden');
    if (!Number.isNaN(zIndex) && zIndex >= 1000)
      reasons.push('high-z-index-overlay');

    suspicious.push({ element, reasons });
  });

  return suspicious;
};

const hasOpenMaterialUiOverlay = (body: HTMLElement): boolean => {
  const overlays = body.querySelectorAll(topLevelMaterialUiOverlayRootSelector);
  for (let index = 0; index < overlays.length; index++) {
    const overlay = overlays[index];
    if (
      !isElementHiddenOrClosed(overlay) &&
      hasVisibleInteractiveOverlayContent(overlay)
    ) {
      return true;
    }
  }

  return false;
};

const isMaterialUiOverlayLike = (element: Element): boolean => {
  if (elementMatchesSelector(element, materialUiOverlayRootSelector)) {
    return true;
  }

  const className = getElementClassName(element);
  return /\bMui(Modal|Popover|Menu|Dialog)-root\b|\bMuiDrawer-modal\b|\bMuiBackdrop-root\b/.test(
    className
  );
};

const getMaterialUiOverlayRootAncestor = (element: Element): ?Element => {
  let current: ?Element = element;

  while (current && current !== document.body) {
    if (elementMatchesSelector(current, materialUiOverlayRootSelector)) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
};

/**
 * Capture the Material-UI nodes that belong to the pop-out teardown that is
 * starting now. Delayed cleanup passes must only inspect these nodes: a menu
 * or dialog opened by the user after the pop-out closed is live UI, even when
 * it is briefly empty while Material-UI mounts its transition content.
 */
export const captureMaterialUiOverlayCleanupCandidates = (): Array<Element> => {
  const body = document.body;
  if (!body) return [];

  return Array.from(
    body.querySelectorAll(topLevelMaterialUiCleanupCandidateSelector)
  );
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
 * This function neutralizes those leftovers. It keeps real open overlays and the
 * two hidden `keepMounted` temporary side-menu drawers that React must retain
 * so they can be reopened. Other hidden Paper overlays can belong to a
 * destroyed pop-out and are neutralized. A backdrop by itself is not a real open
 * dialog; it is exactly the stale blocker that swallows input. Body styles are
 * cleared only when there is no real open modal left. Safe to call on every
 * popped-out-window close.
 */
export const cleanupLeakedOverlaysAfterPopOutClose = (
  cleanupCandidates?: ?Array<Element>
): void => {
  try {
    const body = document.body;
    if (!body) return;

    const cleanupCandidateSet = cleanupCandidates
      ? new Set(cleanupCandidates)
      : null;
    const overlays: Array<Element> = cleanupCandidates
      ? cleanupCandidates.filter(
          candidate =>
            !!candidate.parentNode &&
            elementMatchesSelector(candidate, materialUiOverlayRootSelector)
        )
      : Array.from(
          body.querySelectorAll(topLevelMaterialUiOverlayRootSelector)
        );

    let neutralizedCount = 0;
    overlays.forEach(overlay => {
      // A genuinely-open GDevelop/MUI overlay contains an interactive surface
      // (Paper/dialog/menu/listbox). A stale root left behind by a destroyed
      // popped-out window is often empty or backdrop-only. The backdrop is the
      // full-window element that swallows all mouse input.
      const hasVisibleInteractiveContent = hasVisibleInteractiveOverlayContent(
        overlay
      );
      const isKeepMountedTemporarySideMenu = isKeepMountedTemporarySideMenuOverlay(
        overlay
      );
      const shouldRemove =
        !elementContainsActiveElement(overlay) &&
        (!overlay.firstElementChild ||
          (!isKeepMountedTemporarySideMenu &&
            (isElementHiddenOrClosed(overlay) ||
              !hasVisibleInteractiveContent)));

      if (shouldRemove && neutralizeElement(overlay)) {
        neutralizedCount++;
      }
    });

    // Defensive second pass: if a body-level MUI/backdrop element is still a
    // full-window input blocker but is not part of a real open overlay, neutralize
    // it. This catches partial MUI teardown states that don't keep the expected
    // root class.
    collectPotentialInputBlockers().forEach(({ element }) => {
      if (!isMaterialUiOverlayLike(element)) return;
      if (elementContainsActiveElement(element)) return;
      const overlayRoot = getMaterialUiOverlayRootAncestor(element);
      if (
        cleanupCandidateSet &&
        !cleanupCandidateSet.has(element) &&
        (!overlayRoot || !cleanupCandidateSet.has(overlayRoot))
      ) {
        return;
      }
      if (
        overlayRoot &&
        overlayRoot.getAttribute(staleOverlayAttribute) === 'true'
      ) {
        return;
      }
      // Keep-mounted side drawers must retain their backdrop even while
      // closed. Removing it manually leaves React believing it is still
      // mounted, so it will not be recreated on the next open.
      if (overlayRoot && isKeepMountedTemporarySideMenuOverlay(overlayRoot)) {
        return;
      }
      if (
        overlayRoot &&
        overlayRoot !== element &&
        !isElementHiddenOrClosed(overlayRoot) &&
        hasVisibleInteractiveOverlayContent(overlayRoot)
      ) {
        return;
      }
      if (hasVisibleInteractiveOverlayContent(element)) return;
      if (neutralizeElement(element)) neutralizedCount++;
    });

    // If, after neutralizing orphans, there is no real open modal/popover left,
    // make sure the editor is not left inert or scroll-locked.
    const hasOverlayOutsideCleanupScope = cleanupCandidateSet
      ? Array.from(
          body.querySelectorAll(topLevelMaterialUiOverlayRootSelector)
        ).some(overlay => !cleanupCandidateSet.has(overlay))
      : false;
    const stillHasOpenOverlay =
      hasOverlayOutsideCleanupScope || hasOpenMaterialUiOverlay(body);
    if (!stillHasOpenOverlay) {
      // Un-hide any nodes MUI's ariaHiddenSiblings left hidden.
      const hiddenNodes = body.querySelectorAll(
        ':scope > [aria-hidden="true"], :scope > [inert]'
      );
      hiddenNodes.forEach(node => {
        if (node.getAttribute(staleOverlayAttribute) === 'true') return;
        // Don't touch nodes that intentionally use aria-hidden for icons etc.
        // Top-level body children that are app roots/portals are what MUI hides.
        node.removeAttribute('aria-hidden');
        node.removeAttribute('inert');
        if ((node: any).inert) (node: any).inert = false;
      });

      // Clear MUI scroll-lock leftovers on the body.
      if (body.style.overflow === 'hidden') {
        body.style.removeProperty('overflow');
      }
      if (body.style.paddingRight) {
        body.style.removeProperty('padding-right');
      }
      if (body.style.pointerEvents === 'none') {
        body.style.removeProperty('pointer-events');
      }
    }

    if (neutralizedCount) {
      console.info(
        `Neutralized ${neutralizedCount} leaked Material-UI overlay(s) in the main window after a popped-out window closed.`
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
  let suspicious: Array<InputBlockerReport> = [];
  try {
    suspicious = collectPotentialInputBlockers();

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
