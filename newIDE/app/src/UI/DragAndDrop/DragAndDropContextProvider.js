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
      {children}
    </DndProvider>
  );
};

export default DragAndDropContextProvider;
