// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import PortalContainerContext from './PortalContainerContext';

type Props = {|
  /** The title of the new window. */
  title: string,
  /** The content to render in the new window. */
  children: React.Node,
  /** Called when the external window is closed by the user. */
  onClose: () => void,
  /** Optional width for the new window. */
  width?: number,
  /** Optional height for the new window. */
  height?: number,
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
  children,
  onClose,
  width = 800,
  height = 600,
}: Props): React.Node => {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const externalWindowRef = React.useRef<any>(null);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;
  const closedRef = React.useRef(false);

  React.useEffect(() => {
    // Guard against calling onClose multiple times.
    const handleClose = () => {
      if (closedRef.current) return;
      closedRef.current = true;
      onCloseRef.current();
    };

    // Open a new blank window.
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const features = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
    const externalWindow = window.open('', '', features);

    if (!externalWindow) {
      console.error('WindowPortal: Failed to open new window (popup blocked?)');
      handleClose();
      return;
    }

    externalWindowRef.current = externalWindow;

    // Set up the new window's document.
    externalWindow.document.title = title;

    // Create a container div in the new window.
    const containerDiv = externalWindow.document.createElement('div');
    containerDiv.id = 'window-portal-root';
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
    _copyStyles(document, externalWindow.document);

    // Listen for the external window being closed.
    const checkClosed = setInterval(() => {
      if (externalWindow.closed) {
        clearInterval(checkClosed);
        handleClose();
      }
    }, 250);

    // Also listen for beforeunload as a faster signal.
    externalWindow.addEventListener('beforeunload', () => {
      clearInterval(checkClosed);
      // Use setTimeout to avoid calling onClose during React render.
      setTimeout(() => handleClose(), 0);
    });

    setContainer(containerDiv);

    return () => {
      clearInterval(checkClosed);
      if (!externalWindow.closed) {
        externalWindow.close();
      }
      externalWindowRef.current = null;
    };
    // We intentionally only run this effect once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update the title if it changes.
  React.useEffect(() => {
    if (externalWindowRef.current && !externalWindowRef.current.closed) {
      externalWindowRef.current.document.title = title;
    }
  }, [title]);

  if (!container) return null;

  return ReactDOM.createPortal(
    <PortalContainerContext.Provider value={container}>
      {children}
    </PortalContainerContext.Provider>,
    container
  );
};

/**
 * Copy all <style> and <link rel="stylesheet"> elements from the
 * source document to the target document. This ensures Material-UI
 * injected styles and CSS files are available in the new window.
 */
function _copyStyles(
  sourceDocument: Document,
  targetDocument: Document
): void {
  // Copy <style> elements (Material-UI injects styles this way).
  const styleElements = sourceDocument.querySelectorAll('style');
  styleElements.forEach(styleEl => {
    const newStyle = targetDocument.createElement('style');
    newStyle.textContent = styleEl.textContent;
    targetDocument.head.appendChild(newStyle);
  });

  // Copy <link rel="stylesheet"> elements.
  const linkElements = sourceDocument.querySelectorAll(
    'link[rel="stylesheet"]'
  );
  linkElements.forEach(linkEl => {
    const newLink = targetDocument.createElement('link');
    newLink.rel = 'stylesheet';
    newLink.href = linkEl.href;
    if (linkEl.type) newLink.type = linkEl.type;
    targetDocument.head.appendChild(newLink);
  });

  // Set up a MutationObserver to copy new <style> elements as they are
  // added (Material-UI adds styles lazily when components mount).
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'STYLE') {
          const newStyle = targetDocument.createElement('style');
          // $FlowFixMe - textContent exists on style nodes
          newStyle.textContent = node.textContent;
          // Copy data attributes that MUI uses to identify style sheets.
          if (node instanceof HTMLElement) {
            const metaAttr = node.getAttribute('data-meta');
            if (metaAttr) newStyle.setAttribute('data-meta', metaAttr);
            const jssAttr = node.getAttribute('data-jss');
            if (jssAttr) newStyle.setAttribute('data-jss', jssAttr);
          }
          targetDocument.head.appendChild(newStyle);
        }
      });
    });
  });
  observer.observe(sourceDocument.head, { childList: true });
}

export default WindowPortal;
