// @flow
import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Tracks which document should be used for elementsFromPoint queries
 * during the current event processing cycle.
 *
 * Set to the external window's document in the capture phase of mouse/touch
 * events, and reset back to the main document in the bubble phase, so that
 * the TouchBackend's handleTopMove uses the correct document.
 */
let _activeDocument: Document = document;

/**
 * Custom getDropTargetElementsAtPoint for the TouchBackend.
 * Uses _activeDocument (set by ExternalWindowDragDrop) instead of the
 * module-level `document` reference that the backend hard-codes.
 */
export const getDropTargetElementsAtPoint = (
  x: number,
  y: number,
  // eslint-disable-next-line no-unused-vars
  _dragOverTargetNodes: any
): Array<Element> => {
  const doc = _activeDocument;
  if (doc.elementsFromPoint) {
    // $FlowFixMe[method-unbinding] - elementsFromPoint is called on the correct document
    return Array.from(doc.elementsFromPoint(x, y));
  }
  const el = doc.elementFromPoint(x, y);
  return el ? [el] : [];
};

const mouseAndTouchEvents = [
  'mousedown',
  'mousemove',
  'mouseup',
  'touchstart',
  'touchmove',
  'touchend',
];

type Props = {|
  externalWindow: any,
|};

/**
 * Enables react-dnd drag-and-drop inside an external (popped-out) window.
 *
 * The react-dnd TouchBackend installs its event listeners on the main `window`
 * and hard-codes `document` references. This component fixes that by:
 *
 * 1. Installing the backend's global event handlers on the external window
 *    (so mousedown/mousemove/mouseup/touch events are intercepted).
 * 2. Tracking the "active document" around event processing so that
 *    getDropTargetElementsAtPoint queries the correct document.
 * 3. Patching connectDropTarget to use the correct document.body and
 *    document.elementFromPoint for nodes in the external window.
 *
 * Must be rendered inside the DragAndDropContextProvider's tree (which it is,
 * since React context is preserved through portals).
 */
class ExternalWindowDragDrop extends Component<Props> {
  // Access the react-dnd DragDropManager via legacy context.
  static contextTypes = {
    dragDropManager: PropTypes.object,
  };

  _cleanupFunctions: Array<() => void> = [];

  componentDidMount() {
    this._setupExternalWindow();
  }

  componentWillUnmount() {
    this._cleanup();
  }

  _getTouchBackend(): any {
    const manager = this.context.dragDropManager;
    if (!manager) {
      console.warn(
        'ExternalWindowDragDrop: No dragDropManager found in context.'
      );
      return null;
    }

    const multiBackend = manager.getBackend();
    if (!multiBackend || !multiBackend.backends || !multiBackend.backends[0]) {
      console.warn(
        'ExternalWindowDragDrop: Could not access multi-backend backends.'
      );
      return null;
    }

    return multiBackend.backends[0].instance;
  }

  _setupExternalWindow() {
    const { externalWindow } = this.props;
    if (!externalWindow) return;

    const touchBackend = this._getTouchBackend();
    if (!touchBackend) return;

    const externalDoc = externalWindow.document;

    // --- 1. Track active document around event processing ---
    // Capture phase: set before the backend processes the event.
    // Bubble phase: reset after the backend finishes processing.
    const setActiveDoc = () => {
      _activeDocument = externalDoc;
    };
    const resetActiveDoc = () => {
      _activeDocument = document;
    };

    // Add capture handlers FIRST so they fire before the backend's capture handlers.
    mouseAndTouchEvents.forEach(eventName => {
      externalWindow.addEventListener(eventName, setActiveDoc, true);
    });

    // --- 2. Install the backend's global event handlers on the external window ---
    // These mirror what TouchBackend.setup() does on the main window.
    const topMoveStartHandler = touchBackend.getTopMoveStartHandler();

    touchBackend.addEventListener(
      externalWindow,
      'start',
      touchBackend.handleTopMoveStartCapture,
      true
    );
    touchBackend.addEventListener(
      externalWindow,
      'start',
      topMoveStartHandler
    );
    touchBackend.addEventListener(
      externalWindow,
      'move',
      touchBackend.handleTopMoveCapture,
      true
    );
    touchBackend.addEventListener(
      externalWindow,
      'move',
      touchBackend.handleTopMove
    );
    touchBackend.addEventListener(
      externalWindow,
      'end',
      touchBackend.handleTopMoveEndCapture,
      true
    );

    // Add bubble handlers LAST so they fire after the backend's bubble handlers.
    mouseAndTouchEvents.forEach(eventName => {
      externalWindow.addEventListener(eventName, resetActiveDoc, false);
    });

    this._cleanupFunctions.push(() => {
      mouseAndTouchEvents.forEach(eventName => {
        externalWindow.removeEventListener(eventName, setActiveDoc, true);
        externalWindow.removeEventListener(eventName, resetActiveDoc, false);
      });
      touchBackend.removeEventListener(
        externalWindow,
        'start',
        touchBackend.handleTopMoveStartCapture,
        true
      );
      touchBackend.removeEventListener(
        externalWindow,
        'start',
        topMoveStartHandler
      );
      touchBackend.removeEventListener(
        externalWindow,
        'move',
        touchBackend.handleTopMoveCapture,
        true
      );
      touchBackend.removeEventListener(
        externalWindow,
        'move',
        touchBackend.handleTopMove
      );
      touchBackend.removeEventListener(
        externalWindow,
        'end',
        touchBackend.handleTopMoveEndCapture,
        true
      );
    });

    // --- 3. Also install multi-backend transition listeners ---
    const multiBackend = this.context.dragDropManager.getBackend();
    if (multiBackend && multiBackend.addEventListeners) {
      multiBackend.addEventListeners(externalWindow);
      this._cleanupFunctions.push(() => {
        multiBackend.removeEventListeners(externalWindow);
      });
    }

    // --- 4. Patch connectDropTarget for external window nodes ---
    // The original connectDropTarget hard-codes document.body and
    // document.elementFromPoint. For nodes in external windows, we need
    // to use their ownerDocument instead.
    const originalConnectDropTarget = touchBackend.connectDropTarget.bind(
      touchBackend
    );

    touchBackend.connectDropTarget = function(
      targetId: string,
      node: HTMLElement
    ) {
      const nodeDoc = node && node.ownerDocument;

      if (nodeDoc && nodeDoc !== document) {
        // Node is in an external window – use custom handler.
        const backend = touchBackend;
        const handleMove = function(e: any) {
          if (!backend.monitor.isDragging()) return;

          let coords;
          switch (e.type) {
            case 'mousemove':
              coords = { x: e.clientX, y: e.clientY };
              break;
            case 'touchmove':
              coords = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
              };
              break;
            default:
              return;
          }

          // Use the node's own document for hit-testing.
          const droppedOn = nodeDoc.elementFromPoint(coords.x, coords.y);
          const childMatch = node.contains(droppedOn);
          if (droppedOn === node || childMatch) {
            return backend.handleMove(e, targetId);
          }
        };

        // Attach to the external document's body.
        backend.addEventListener(nodeDoc.body, 'move', handleMove);
        backend.targetNodes[targetId] = node;

        return function() {
          delete backend.targetNodes[targetId];
          backend.removeEventListener(nodeDoc.body, 'move', handleMove);
        };
      }

      // Main window nodes use the original implementation.
      return originalConnectDropTarget(targetId, node);
    };

    this._cleanupFunctions.push(() => {
      // Restore the original connectDropTarget.
      touchBackend.connectDropTarget = originalConnectDropTarget;
    });
  }

  _cleanup() {
    while (this._cleanupFunctions.length > 0) {
      const cleanup = this._cleanupFunctions.pop();
      try {
        cleanup();
      } catch (e) {
        console.warn('ExternalWindowDragDrop cleanup error:', e);
      }
    }
    _activeDocument = document;
  }

  render(): null {
    return null;
  }
}

export default ExternalWindowDragDrop;
