// @flow
import * as React from 'react';
import PortalContainerContext from '../PortalContainerContext';

/**
 * Bridges drag-and-drop events from an external browser window (created by
 * WindowPortal / PoppedOutEditorContainerWindow) to the main window where
 * the react-dnd TouchBackend has its event listeners registered.
 *
 * The backend only listens on the main `window`, so mouse/touch events that
 * occur inside an external window are invisible to it. This component
 * forwards those events to the main window and temporarily patches
 * `document.elementFromPoint` / `document.elementsFromPoint` so the backend
 * performs hit-testing against the external window's DOM.
 *
 * The forwarding uses the **bubble** phase on the external window so that
 * drag-source handlers (attached directly to source DOM nodes by the backend
 * via `connectDragSource`) fire first, preserving the ordering the backend
 * expects (source registration → window-level drag start).
 */
const ExternalWindowDndBridge = (): null => {
  const portalContainer = React.useContext(PortalContainerContext);

  React.useEffect(
    () => {
      if (!portalContainer) return;

      const externalDocument = portalContainer.ownerDocument;
      const externalWindow: any = externalDocument.defaultView;
      if (!externalWindow || externalWindow === window) return;

      // Keep references to the original methods so we can restore them
      // after each synchronous forwarding call.
      const origElementFromPoint = document.elementFromPoint;
      const origElementsFromPoint = document.elementsFromPoint;

      const forwardMouseEvent = (e: MouseEvent) => {
        // Patch document hit-testing to look in the external document.
        // This is safe because JS is single-threaded and we restore
        // immediately after the synchronous dispatchEvent call.
        // $FlowFixMe[cannot-write]
        document.elementFromPoint = function(x: number, y: number) {
          return externalDocument.elementFromPoint(x, y);
        };
        if (origElementsFromPoint) {
          // $FlowFixMe[cannot-write]
          document.elementsFromPoint = function(x: number, y: number) {
            return externalDocument.elementsFromPoint(x, y);
          };
        }

        try {
          window.dispatchEvent(new MouseEvent(e.type, e));
        } finally {
          // $FlowFixMe[cannot-write]
          document.elementFromPoint = origElementFromPoint;
          if (origElementsFromPoint) {
            // $FlowFixMe[cannot-write]
            document.elementsFromPoint = origElementsFromPoint;
          }
        }
      };

      // Use the bubble phase (third argument = false) so that drag-source
      // node handlers fire before our forwarding.
      externalWindow.addEventListener('mousedown', forwardMouseEvent, false);
      externalWindow.addEventListener('mousemove', forwardMouseEvent, false);
      externalWindow.addEventListener('mouseup', forwardMouseEvent, false);

      return () => {
        externalWindow.removeEventListener(
          'mousedown',
          forwardMouseEvent,
          false
        );
        externalWindow.removeEventListener(
          'mousemove',
          forwardMouseEvent,
          false
        );
        externalWindow.removeEventListener(
          'mouseup',
          forwardMouseEvent,
          false
        );
      };
    },
    [portalContainer]
  );

  return null;
};

export default ExternalWindowDndBridge;
