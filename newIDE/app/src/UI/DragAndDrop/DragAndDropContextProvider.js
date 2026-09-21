// @flow
import * as React from 'react';
import { DndProvider, useDragDropManager } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import {
  trackTouchGesturesForDrag,
  getCurrentDragSlop,
} from './TouchDragDelay';

const makeTouchBackendOptions = (rootElement: ?Document) => ({
  // No delay before a drag can start: a touch move happening during this delay
  // would cancel the drag for the whole gesture, and a finger always moves a
  // bit while pressing. Instead, drags coming from a finger are delayed by
  // `canDrag` (see TouchDragDelay), which leaves lists scrollable.
  delayTouchStart: 0,
  // Also handle mouse events so that Android Chrome's compatibility mouse
  // events (fired after touch events) can trigger drags with no delay,
  // making dragging feel instant on Android.
  enableMouseEvents: true,
  // The backend reads the slop at each pointer move: it's larger while a
  // finger holds an item before dragging it (see TouchDragDelay).
  get touchSlop(): number {
    return getCurrentDragSlop();
  },
  rootElement,
});

/**
 * End the drag in progress when the system interrupts the touch gesture
 * (a notification, a second finger, the app going to the background...).
 * react-dnd-touch-backend only listens to touchend: without this, the drag
 * would stay active and the item be dropped wherever the next gesture ends.
 */
const EndDragOnTouchCancel = ({
  documentToWatch,
}: {|
  documentToWatch: Document,
|}) => {
  const dragDropManager = useDragDropManager();
  React.useEffect(
    () => {
      const handleTouchCancel = () => {
        if (dragDropManager.getMonitor().isDragging()) {
          dragDropManager.getActions().endDrag();
        }
      };
      documentToWatch.addEventListener('touchcancel', handleTouchCancel, true);
      return () => {
        documentToWatch.removeEventListener(
          'touchcancel',
          handleTouchCancel,
          true
        );
      };
    },
    [dragDropManager, documentToWatch]
  );
  return null;
};

/**
 * Touch events are always dispatched to the element the finger first touched.
 * If this element is removed from the document during a drag (a virtualized
 * list unmounts the dragged row once auto scrolling moved it out of view),
 * the events don't reach the drag backend anymore: the drag can't be updated
 * or ended, and auto scrolling never stops. Keep this element in the document
 * until the drag ends (the backend only handles the removal of the drag
 * source itself, not of one of its ancestors).
 */
const KeepTouchedElementConnectedDuringDrag = ({
  documentToWatch,
}: {|
  documentToWatch: Document,
|}) => {
  const dragDropManager = useDragDropManager();
  React.useEffect(
    () => {
      let touchedElement: ?Element = null;
      let observer: ?MutationObserver = null;
      let hiddenContainer: ?HTMLElement = null;

      const onTouchStart = (event: TouchEvent) => {
        touchedElement = event.target instanceof Element ? event.target : null;
      };
      const onTouchEnd = () => {
        touchedElement = null;
      };
      const stopWatching = () => {
        if (observer) observer.disconnect();
        observer = null;
        if (hiddenContainer) hiddenContainer.remove();
        hiddenContainer = null;
      };
      const reconnectTouchedElement = () => {
        const element = touchedElement;
        if (!element || element.isConnected) return;
        let detachedRoot: Node = element;
        while (detachedRoot.parentNode) detachedRoot = detachedRoot.parentNode;
        if (!hiddenContainer) {
          const container = documentToWatch.createElement('div');
          container.style.display = 'none';
          documentToWatch.body && documentToWatch.body.appendChild(container);
          hiddenContainer = container;
        }
        hiddenContainer.appendChild(detachedRoot);
      };

      const monitor = dragDropManager.getMonitor();
      const onStateChange = () => {
        if (!monitor.isDragging()) {
          stopWatching();
          return;
        }
        // Not a touch drag, or already watching.
        if (observer || !touchedElement || !touchedElement.isConnected) return;
        observer = new MutationObserver(reconnectTouchedElement);
        observer.observe(documentToWatch, { childList: true, subtree: true });
      };

      documentToWatch.addEventListener('touchstart', onTouchStart, true);
      documentToWatch.addEventListener('touchend', onTouchEnd, true);
      documentToWatch.addEventListener('touchcancel', onTouchEnd, true);
      const unsubscribe = monitor.subscribeToStateChange(onStateChange);
      return () => {
        documentToWatch.removeEventListener('touchstart', onTouchStart, true);
        documentToWatch.removeEventListener('touchend', onTouchEnd, true);
        documentToWatch.removeEventListener('touchcancel', onTouchEnd, true);
        unsubscribe();
        stopWatching();
      };
    },
    [dragDropManager, documentToWatch]
  );
  return null;
};

type Props = {|
  children: React.Node,

  /**
   * Specify the window when this provider is used in a popped-out window.
   */
  window?: ?any,
|};

/**
 * A react-dnd provider using react-dnd-touch-backend which supports
 * both touch and mouse events (with enableMouseEvents: true).
 *
 * HTML5 backend was removed because it doesn't work with the iframe
 * showing the embedded game.
 */
const DragAndDropContextProvider = ({
  children,
  window,
}: Props): React.Node => {
  const backendContext = React.useMemo(
    () => (window ? { window, document: window.document } : undefined),
    [window]
  );
  // The root element must be the document of the window
  // (can't be the body, the drag'n'drop events would not work).
  const rootElement = React.useMemo(
    () => (window ? window.document : undefined),
    [window]
  );

  React.useEffect(
    () => trackTouchGesturesForDrag(window ? window.document : document),
    [window]
  );

  const backendOptions = React.useMemo(
    () => makeTouchBackendOptions(rootElement),
    [rootElement]
  );

  return (
    <DndProvider
      backend={TouchBackend}
      options={backendOptions}
      context={backendContext}
    >
      <EndDragOnTouchCancel
        documentToWatch={window ? window.document : document}
      />
      <KeepTouchedElementConnectedDuringDrag
        documentToWatch={window ? window.document : document}
      />
      {children}
    </DndProvider>
  );
};

export default DragAndDropContextProvider;
