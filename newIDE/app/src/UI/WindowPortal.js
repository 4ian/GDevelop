// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import ReactDOM from 'react-dom';
import PortalContainerContext from './PortalContainerContext';
import Window from '../Utils/Window';
import useAlertDialog from './Alert/useAlertDialog';

type Props = {|
  /** The title of the new window. */
  title: string,
  /** The content to render in the new window. */
  renderContent: (props: {
    windowSize: { width: number, height: number },
  }) => React.Node,
  /** Called when the external window is closed by the user. */
  onClose: () => void,
  /** Initial width for the new window. */
  initialWidth: number,
  /** Initial height for the new window. */
  initialHeight: number,
  /** Called when the external window is ready (or null when closing). */
  onWindowReady: (externalWindow: any) => void,
|};

/**
 * A component that renders its children into a separate browser window
 * using a React portal. Styles from the parent window are copied over
 * so that Material-UI and GDevelop themes work correctly.
 *
 * It also provides a PortalContainerContext so that Material-UI overlays
 * (Dialog, Menu, Popover, Tooltip, Popper) render inside this window
 * instead of the main window.
 *
 * When the external window is closed, `onClose` is called.
 * When this component unmounts, the external window is closed.
 */
const WindowPortal = ({
  title,
  renderContent,
  onClose,
  initialWidth,
  initialHeight,
  onWindowReady,
}: Props): React.Node => {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const externalWindowRef = React.useRef<any>(null);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;
  const onWindowReadyRef = React.useRef(onWindowReady);
  onWindowReadyRef.current = onWindowReady;
  const closedRef = React.useRef(false);
  const [windowSize, setWindowSize] = React.useState<{
    width: number,
    height: number,
  } | null>(null);
  const { showAlert } = useAlertDialog();

  React.useEffect(() => {
    // Guard against calling onClose multiple times.
    const handleClose = () => {
      if (closedRef.current) return;
      closedRef.current = true;
      onCloseRef.current();
    };

    // Open a new blank window.
    const left = window.screenX + (window.outerWidth - initialWidth) / 2;
    const top = window.screenY + (window.outerHeight - initialHeight) / 2;
    const features = `width=${initialWidth},height=${initialHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`;
    const externalWindow = window.open('', '', features);

    if (!externalWindow) {
      showAlert({
        title: t`Unable to open this window`,
        message: t`Please check if popups are blocked in your browser settings.`,
      });
      handleClose();
      return;
    }

    externalWindowRef.current = externalWindow;

    // Set up the new window's document.
    externalWindow.document.title = title;

    // Set a <base> tag so that relative URLs (e.g. script src for Monaco
    // AMD loader) resolve against the main window's origin, since the
    // popped-out window starts as about:blank.
    const baseTag = externalWindow.document.createElement('base');
    baseTag.href = window.location.href;
    if (externalWindow.document.head)
      externalWindow.document.head.appendChild(baseTag);

    // Add a <meta name="theme-color"> tag so that
    // Window.setWindowBackgroundColor can update it for this window.
    const metaThemeColor = externalWindow.document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    metaThemeColor.content = '#000000';
    if (externalWindow.document.head)
      externalWindow.document.head.appendChild(metaThemeColor);

    // Create a container div in the new window.
    const containerDiv = externalWindow.document.createElement('div');
    containerDiv.id = 'window-portal-root';
    containerDiv.className = 'popped-out-frame';
    externalWindow.document.body.appendChild(containerDiv);

    // Style the body of the new window to match the parent.
    externalWindow.document.body.style.margin = '0';
    externalWindow.document.body.style.padding = '0';
    externalWindow.document.body.style.overflow = 'hidden';

    // Make the container fill the window.
    containerDiv.style.width = '100vw';
    containerDiv.style.height = '100vh';
    containerDiv.style.display = 'flex';
    containerDiv.style.flexDirection = 'column';

    // Copy the body class from the parent (used for GDevelop theme).
    if (document.body) {
      externalWindow.document.body.className = document.body.className;
    }

    // Copy all stylesheets from parent window to the new window.
    // MUI/JSS styles for components rendered in this window are handled
    // separately by a dedicated JSS instance in FullThemeProvider (via
    // portalContainer context), so this mainly copies static CSS files
    // and pre-existing global styles.
    const styleObserver = copyDocumentStyles(document, externalWindow.document);

    // Set up context menu in the new window (works for both Electron and web).
    Window.setUpContextMenu(externalWindow);

    // Listen for the external window being closed.
    const checkClosed: IntervalID = setInterval(() => {
      if (externalWindow.closed) {
        clearInterval(checkClosed);

        // See comment below, taking a safety margin to avoid
        // potential issues on Electron (even if beforeunload should always be fired,
        // so this timeout should be useless).
        setTimeout(() => {
          handleClose();
        }, 150);
      }
    }, 250);

    // Also listen for beforeunload as a faster signal.
    externalWindow.addEventListener('beforeunload', () => {
      // Disconnect as soon as possible to avoid any further interactions with the window.
      if (styleObserver) styleObserver.disconnect();
      if (observer) observer.disconnect();

      // We know the window is closing, but we actually wait for it to be confirmed closed.
      // If we don't wait before calling handleClose, we run into "Uncaught illegal access" errors from V8/Chrome/Electron on Electron,
      // when an extension editor is closed. The unmounting of `EventsFunctionsExtensionEditorContainer`
      // is triggering reloading of extensions, which does fs operations. This seems to interfere
      // with the closing of the window in a non deterministic way (creating 50-200 "Uncaught illegal access" errors)
      // and totally breaking fs callbacks which are never resolved.
      // These "Uncaught illegal access" have no stacktrace, which seems to indicate a problem
      // deep in Electron or related.
      //
      // We can't risk this, so we wait for the window to be confirmed closed.
      const waitForClose: IntervalID = setInterval(() => {
        if (externalWindow.closed) {
          clearInterval(waitForClose);

          // Still wait to avoid "Uncaught illegal access" error to ensure
          // the BrowserWindow is fully closed.
          setTimeout(() => {
            // Window is now fully closed.
            // Proceed as usual from now on.
            clearInterval(checkClosed);
            handleClose();
          }, 150);
        }
      }, 10);
    });

    setContainer(containerDiv);

    // Listen for the size of the container div.
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setWindowSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerDiv);

    onWindowReadyRef.current(externalWindow);

    return () => {
      onWindowReadyRef.current(null);
      clearInterval(checkClosed);
      if (styleObserver) styleObserver.disconnect();
      if (observer) observer.disconnect();
      if (!externalWindow.closed) {
        externalWindow.close();
      }
      externalWindowRef.current = null;
    };
    // We intentionally only run this effect once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update the title if it changes.
  React.useEffect(
    () => {
      if (externalWindowRef.current && !externalWindowRef.current.closed) {
        externalWindowRef.current.document.title = title;
      }
    },
    [title]
  );

  if (!container) return null;

  // Provide the external window's document.body as the portal container
  // for MUI overlay components (Dialog, Menu, Popover, Tooltip, Drawer).
  // Using document.body (rather than the container div) is important because:
  // 1. MUI's Modal/Popover positioning assumes the container is the viewport root.
  // 2. ContextMenu uses anchorReference="anchorPosition" (no anchorEl), so MUI
  //    derives ownerDocument from the container — must be the external window's body.
  // 3. ClickAwayListener (used by InlinePopover) attaches event listeners to
  //    ownerDocument of the portal content — must be the external window's document.
  const portalBody = container.ownerDocument
    ? container.ownerDocument.body
    : container;

  return ReactDOM.createPortal(
    <PortalContainerContext.Provider value={portalBody}>
      {windowSize && renderContent({ windowSize })}
    </PortalContainerContext.Provider>,
    container
  );
};

/**
 * Copy the CSS content of a <style> element to the target document.
 * Handles both textContent-based styles and CSSOM-inserted rules
 * (e.g., from style-loader using insertRule).
 */
function copyStyleElementToDocument(
  sourceStyleEl: HTMLElement,
  targetDocument: Document
) {
  const newStyle = targetDocument.createElement('style');

  // Copy data attributes that MUI/JSS uses to identify style sheets.
  if (sourceStyleEl instanceof HTMLElement) {
    const metaAttr = sourceStyleEl.getAttribute('data-meta');
    if (metaAttr) newStyle.setAttribute('data-meta', metaAttr);
    const jssAttr = sourceStyleEl.getAttribute('data-jss');
    if (jssAttr) newStyle.setAttribute('data-jss', jssAttr);
  }

  // First try textContent (works when style-loader sets text directly).
  if (sourceStyleEl.textContent) {
    newStyle.textContent = sourceStyleEl.textContent;
  } else if (sourceStyleEl instanceof HTMLStyleElement && sourceStyleEl.sheet) {
    // Fallback: copy CSS rules from the CSSOM (handles style-loader's
    // insertRule mode where textContent is empty).
    try {
      const rules = sourceStyleEl.sheet.cssRules;
      let cssText = '';
      for (let i = 0; i < rules.length; i++) {
        cssText += rules[i].cssText + '\n';
      }
      if (cssText) newStyle.textContent = cssText;
    } catch (e) {
      // Cross-origin stylesheets can't be read – skip silently.
    }
  }

  if (targetDocument.head) targetDocument.head.appendChild(newStyle);
}

/**
 * Copy a <link rel="stylesheet"> element to the target document.
 */
function copyLinkElementToDocument(
  sourceLinkEl: HTMLLinkElement,
  targetDocument: Document
) {
  const newLink = targetDocument.createElement('link');
  newLink.rel = 'stylesheet';
  newLink.href = sourceLinkEl.href;
  if (sourceLinkEl.type) newLink.type = sourceLinkEl.type;

  if (targetDocument.head) targetDocument.head.appendChild(newLink);
}

/**
 * Copy all <style> and <link rel="stylesheet"> elements from the
 * source document to the target document. This ensures Material-UI
 * injected styles and CSS files are available in the new window.
 */
function copyDocumentStyles(
  sourceDocument: Document,
  targetDocument: Document
): MutationObserver | null {
  if (!sourceDocument || !targetDocument) return null;

  // Copy <style> elements (Material-UI injects styles this way).
  const styleElements = sourceDocument.querySelectorAll('style');
  styleElements.forEach(styleEl => {
    copyStyleElementToDocument(styleEl, targetDocument);
  });

  // Copy <link rel="stylesheet"> elements.
  const linkElements = sourceDocument.querySelectorAll(
    'link[rel="stylesheet"]'
  );
  linkElements.forEach(linkEl => {
    if (!(linkEl instanceof HTMLLinkElement)) return;
    copyLinkElementToDocument(linkEl, targetDocument);
  });

  // Set up a MutationObserver to copy new <style> and <link> elements as
  // they are added (Material-UI adds styles lazily when components mount,
  // and webpack may add <link> elements for dynamically loaded CSS chunks).
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeName === 'STYLE') {
          copyStyleElementToDocument((node: any), targetDocument);
        } else if (
          node.nodeName === 'LINK' &&
          node instanceof HTMLLinkElement &&
          node.rel === 'stylesheet'
        ) {
          copyLinkElementToDocument(node, targetDocument);
        }
      });
    });
  });
  if (sourceDocument.head)
    observer.observe(sourceDocument.head, { childList: true });
  else console.error('copyDocumentStyles: Source document has no head.');

  return observer;
}

export default WindowPortal;
