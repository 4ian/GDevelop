// @flow
import * as React from 'react';
import {
  DragSource,
  type DragSourceMonitor,
  type DragSourceConnector,
  type ConnectDragSource,
  DropTarget,
  type DropTargetMonitor,
  type DropTargetConnector,
  type ConnectDropTarget,
  type ConnectDragPreview,
} from 'react-dnd';
import { hapticFeedback, hapticPatterns } from '../../Utils/Haptic';
import {
  canStartDragFromCurrentGesture,
  isCurrentGestureScroll,
  TOUCH_DRAG_START_ATTRIBUTE,
  TOUCH_DRAG_START_DELAY,
  TOUCH_HOLD_TOLERANCE,
  type TouchDragStart,
} from './TouchDragDelay';

type Props<DraggedItemType> = {|
  children: ({|
    connectDragSource: ConnectDragSource,
    connectDropTarget: ConnectDropTarget,
    connectDragPreview: ConnectDragPreview,
    isOver: boolean,
    isOverLazy: boolean,
    canDrop: boolean,
    /**
     * On a touch screen, true once the finger held the item long enough for
     * a drag to start when it moves: show the item as "lifted".
     */
    isReadyToDrag: boolean,
  |}) => ?React.Node,
  beginDrag: () => DraggedItemType,
  canDrag?: (item: DraggedItemType) => boolean,
  canDrop: (item: DraggedItemType) => boolean,
  drop: () => void,
  endDrag?: () => void,
  hover?: (monitor: DropTargetMonitor) => void,
|};

type DragSourceProps = {|
  connectDragSource: ConnectDragSource,
  connectDragPreview: ConnectDragPreview,
  isDragging: boolean,
|};

type DropTargetProps = {|
  connectDropTarget: ConnectDropTarget,
  isOver: boolean,
  isOverLazy: boolean,
  canDrop: boolean,
|};

type InnerDragSourceAndDropTargetProps<DraggedItemType> = {|
  ...Props<DraggedItemType>,
  ...DragSourceProps,
  ...DropTargetProps,
|};

// For some reason, defining this type in the `CustomDragLayer` component
// creates a circular dependency, so we define it here instead.
export type DraggedItem = {|
  name: string,
  thumbnail?: string,
  is3D?: boolean,
|};

type TouchHandler = (event: SyntheticTouchEvent<>) => void;
type TouchHandlers = {|
  +onTouchStart: TouchHandler,
  +onTouchMove: TouchHandler,
  +onTouchEnd: TouchHandler,
  +onTouchCancel: TouchHandler,
|};

const getTouchDistance = (
  touch: { clientX: number, clientY: number },
  from: {| x: number, y: number |}
) => Math.hypot(touch.clientX - from.x, touch.clientY - from.y);

/**
 * Track a finger holding the drag source, mirroring the conditions under
 * which the drag backend will accept to start the drag: the finger stayed
 * (within the tolerance) for the delay, and the drag has not started yet.
 */
const useTouchHold = (
  isDragging: boolean
): {| isHeld: boolean, touchHandlers: TouchHandlers |} => {
  const [isHeld, setIsHeld] = React.useState(false);
  const timeoutRef = React.useRef<?TimeoutID>(null);
  const touchStartPositionRef = React.useRef({ x: 0, y: 0 });
  const documentRef = React.useRef<?Document>(null);

  const clear = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setIsHeld(false);
  }, []);

  React.useEffect(() => clear, [clear]);
  React.useEffect(
    () => {
      if (isDragging) clear();
    },
    [isDragging, clear]
  );

  // The context menu opened by a long press swallows the touchend, so the end
  // of the gesture is also watched on the document.
  React.useEffect(
    () => {
      const documentToWatch = documentRef.current;
      if (!isHeld || !documentToWatch) return;
      documentToWatch.addEventListener('touchend', clear, true);
      documentToWatch.addEventListener('touchcancel', clear, true);
      return () => {
        documentToWatch.removeEventListener('touchend', clear, true);
        documentToWatch.removeEventListener('touchcancel', clear, true);
      };
    },
    [isHeld, clear]
  );

  const touchHandlers = React.useMemo(
    () => ({
      onTouchStart: (event: SyntheticTouchEvent<>) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (event.touches.length !== 1) return;
        const touch = event.touches[0];
        touchStartPositionRef.current = { x: touch.clientX, y: touch.clientY };
        const currentTarget = event.currentTarget;
        documentRef.current =
          currentTarget instanceof Node ? currentTarget.ownerDocument : null;
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          // The finger scrolled the list while pressing: not a hold.
          if (isCurrentGestureScroll()) return;
          if (hapticFeedback) {
            hapticFeedback({ pattern: hapticPatterns.itemReadyToDrag });
          }
          setIsHeld(true);
        }, TOUCH_DRAG_START_DELAY);
      },
      onTouchMove: (event: SyntheticTouchEvent<>) => {
        // Only the moves during the hold matter: once held, a move starts
        // the drag (and a smaller one changes nothing).
        if (!timeoutRef.current) return;
        if (
          event.touches.length !== 1 ||
          getTouchDistance(event.touches[0], touchStartPositionRef.current) >
            TOUCH_HOLD_TOLERANCE
        ) {
          // The finger is scrolling.
          clear();
        }
      },
      onTouchEnd: clear,
      onTouchCancel: clear,
    }),
    [clear]
  );

  return { isHeld, touchHandlers };
};

const chainHandlers = (
  existingHandler: ?TouchHandler,
  handler: TouchHandler
): TouchHandler => event => {
  if (existingHandler) existingHandler(event);
  handler(event);
};

/**
 * Mark the drag source with how it starts a drag on a touch screen (see
 * TouchDragDelay) and, if it must be held first, make it report the touches
 * it receives to the touch handlers (which track a finger holding it).
 */
const connectMarkedDragSource = (
  connectDragSource: ConnectDragSource,
  touchDragStart: TouchDragStart,
  touchHandlers: ?TouchHandlers
): ConnectDragSource => (element: any, dragSourceOptions) => {
  // Drag sources are always React elements in this codebase.
  if (!touchHandlers) {
    return connectDragSource(
      React.cloneElement(element, {
        [TOUCH_DRAG_START_ATTRIBUTE]: touchDragStart,
      }),
      dragSourceOptions
    );
  }
  const props = element.props || {};
  return connectDragSource(
    React.cloneElement(element, {
      [TOUCH_DRAG_START_ATTRIBUTE]: touchDragStart,
      onTouchStart: chainHandlers(
        props.onTouchStart,
        touchHandlers.onTouchStart
      ),
      onTouchMove: chainHandlers(props.onTouchMove, touchHandlers.onTouchMove),
      onTouchEnd: chainHandlers(props.onTouchEnd, touchHandlers.onTouchEnd),
      onTouchCancel: chainHandlers(
        props.onTouchCancel,
        touchHandlers.onTouchCancel
      ),
    }),
    dragSourceOptions
  );
};

type Options = {|
  /**
   * When a finger touches the drag source, if it starts dragging immediately
   * or only after staying still for a while. Use 'afterHold' for sources
   * filling a row of a scrollable list (a quick move on them is a scroll),
   * and 'immediate' for dedicated drag handles: touching a handle is never
   * an attempt to scroll the list.
   */
  touchDragStart: TouchDragStart,
|};

export const makeDragSourceAndDropTarget = <DraggedItemType>(
  reactDndType: string,
  options: Options
): ((Props<DraggedItemType>) => React.Node) => {
  const dragsImmediatelyOnTouch = options.touchDragStart === 'immediate';
  const sourceSpec = {
    canDrag(props: Props<DraggedItemType>, monitor: DragSourceMonitor) {
      // On a touch screen, a finger that just started pressing a row is
      // scrolling, not dragging (unless the source is a dedicated handle).
      if (!dragsImmediatelyOnTouch && !canStartDragFromCurrentGesture())
        return false;

      const item = monitor.getItem();
      const canDrag = props.canDrag || null;
      if (canDrag) return canDrag(item);
      return true;
    },
    beginDrag(props: InnerDragSourceAndDropTargetProps<DraggedItemType>) {
      if (hapticFeedback) {
        hapticFeedback({ pattern: hapticPatterns.dragStarted });
      }
      return props.beginDrag();
    },
    endDrag(props: Props<DraggedItemType>, monitor: DragSourceMonitor) {
      if (props.endDrag) props.endDrag();
    },
  };

  function sourceCollect(
    connect: DragSourceConnector,
    monitor: DragSourceMonitor
  ): DragSourceProps {
    return {
      connectDragSource: connect.dragSource(),
      connectDragPreview: connect.dragPreview(),
      isDragging: monitor.isDragging(),
    };
  }

  const targetSpec = {
    canDrop(props: Props<DraggedItemType>, monitor: DropTargetMonitor) {
      const item = monitor.getItem();
      return item && props.canDrop(item);
    },
    drop(props: Props<DraggedItemType>, monitor: DropTargetMonitor) {
      if (monitor.didDrop()) {
        return; // Drop already handled by another target
      }
      props.drop();
    },
    hover(props: Props<DraggedItemType>, monitor: DropTargetMonitor) {
      if (props.hover) props.hover(monitor);
    },
  };

  function targetCollect(
    connect: DropTargetConnector,
    monitor: DropTargetMonitor
  ): DropTargetProps {
    return {
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver({ shallow: true }),
      isOverLazy: monitor.isOver({ shallow: false }),
      canDrop: monitor.canDrop(),
    };
  }

  // $FlowFixMe[underconstrained-implicit-instantiation]
  const InnerDragSourceAndDropTarget = DragSource(
    reactDndType,
    // $FlowFixMe[incompatible-variance]
    // $FlowFixMe[incompatible-type]
    sourceSpec,
    sourceCollect
  )(
    // $FlowFixMe[incompatible-variance]
    // $FlowFixMe[incompatible-type]
    DropTarget(reactDndType, targetSpec, targetCollect)(
      // $FlowFixMe[missing-local-annot]
      ({
        children,
        connectDragSource,
        connectDropTarget,
        connectDragPreview,
        isDragging,
        isOver,
        isOverLazy,
        canDrop,
      }) => {
        const { isHeld, touchHandlers } = useTouchHold(isDragging);
        return children({
          connectDragSource: connectMarkedDragSource(
            connectDragSource,
            options.touchDragStart,
            dragsImmediatelyOnTouch ? null : touchHandlers
          ),
          connectDropTarget,
          connectDragPreview,
          isDragging,
          isOver,
          isOverLazy,
          canDrop,
          isReadyToDrag: !dragsImmediatelyOnTouch && isHeld,
        });
      }
    )
  );

  return (props: Props<DraggedItemType>) => (
    <InnerDragSourceAndDropTarget {...props} />
  );
};
