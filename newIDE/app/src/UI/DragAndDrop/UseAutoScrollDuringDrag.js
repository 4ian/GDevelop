// @flow
import * as React from 'react';
import { useDragDropManager } from 'react-dnd';

const DEFAULT_EDGE_SIZE = 50; // Distance from an edge, in pixels, at which scrolling starts.
const DEFAULT_MAX_SPEED = 600; // Maximum scrolling speed, in pixels per second.
// Cap the time elapsed between two frames so that a long main thread stall
// does not result in a huge jump.
const MAX_FRAME_DURATION = 0.1;
// Keep scrolling when the pointer slightly leaves the container,
// which easily happens when dragging with a finger.
const POINTER_SLACK = 50;

/**
 * Scrolls a container when a drag is in progress and the pointer is close to
 * one of its edges, so that drop positions currently out of view can be
 * reached. Scrolling is done on both axes (it has no effect on an axis
 * without overflow). react-dnd has no built-in support for this.
 *
 * Call `startAutoScroll` in `beginDrag` and `stopAutoScroll` in `endDrag`.
 */
type AutoScrollOptions = {| edgeSize?: number, maxSpeed?: number |};

export const useAutoScrollDuringDrag = (
  getContainer: () => ?HTMLElement,
  options?: AutoScrollOptions
): {|
  startAutoScroll: () => void,
  stopAutoScroll: () => void,
|} => {
  const dragDropManager = useDragDropManager();
  const edgeSize = (options && options.edgeSize) || DEFAULT_EDGE_SIZE;
  const maxSpeed = (options && options.maxSpeed) || DEFAULT_MAX_SPEED;
  const animationFrameId = React.useRef<AnimationFrameID | null>(null);
  // Keep the returned callbacks stable even if `getContainer` is an inline
  // function, so that they can be used as effect dependencies.
  const getContainerRef = React.useRef(getContainer);
  getContainerRef.current = getContainer;

  const stopAutoScroll = React.useCallback(() => {
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, []);

  const startAutoScroll = React.useCallback(
    () => {
      stopAutoScroll();
      const monitor = dragDropManager.getMonitor();
      let lastFrameTime = null;
      // Fractional pixels not yet scrolled, so that slow speeds still scroll.
      let pendingX = 0;
      let pendingY = 0;
      const scrollIfCloseToAnEdge = (frameTime: number) => {
        const elapsedSeconds =
          lastFrameTime === null
            ? 1 / 60
            : Math.min(MAX_FRAME_DURATION, (frameTime - lastFrameTime) / 1000);
        lastFrameTime = frameTime;

        const container = getContainerRef.current();
        const offset = monitor.getClientOffset();
        if (container && offset) {
          const rect = container.getBoundingClientRect();
          if (
            offset.x > rect.left - POINTER_SLACK &&
            offset.x < rect.right + POINTER_SLACK &&
            offset.y > rect.top - POINTER_SLACK &&
            offset.y < rect.bottom + POINTER_SLACK
          ) {
            // Signed intensity: -1 at (or beyond) the start edge, 1 at the end edge.
            const getIntensity = (
              position: number,
              start: number,
              end: number
            ) => {
              if (position < start + edgeSize)
                return -Math.min(1, (start + edgeSize - position) / edgeSize);
              if (position > end - edgeSize)
                return Math.min(1, (position - (end - edgeSize)) / edgeSize);
              return 0;
            };
            const distance = maxSpeed * elapsedSeconds;
            pendingX +=
              distance * getIntensity(offset.x, rect.left, rect.right);
            pendingY +=
              distance * getIntensity(offset.y, rect.top, rect.bottom);
            const stepX = Math.trunc(pendingX);
            const stepY = Math.trunc(pendingY);
            pendingX -= stepX;
            pendingY -= stepY;
            if (stepX) container.scrollLeft += stepX;
            if (stepY) container.scrollTop += stepY;
          }
        }
        animationFrameId.current = requestAnimationFrame(scrollIfCloseToAnEdge);
      };
      animationFrameId.current = requestAnimationFrame(scrollIfCloseToAnEdge);
    },
    [dragDropManager, stopAutoScroll, edgeSize, maxSpeed]
  );

  // Ensure the loop is stopped if the component is unmounted during a drag.
  React.useEffect(() => stopAutoScroll, [stopAutoScroll]);

  return { startAutoScroll, stopAutoScroll };
};

/**
 * Same as `useAutoScrollDuringDrag`, but for containers where several kinds
 * of items can be dragged (possibly from other components): auto scrolling
 * runs during any drag, without having to call `startAutoScroll` and
 * `stopAutoScroll` from each drag source.
 */
export const useAutoScrollDuringAnyDrag = (
  getContainer: () => ?HTMLElement,
  options?: AutoScrollOptions
) => {
  const dragDropManager = useDragDropManager();
  const { startAutoScroll, stopAutoScroll } = useAutoScrollDuringDrag(
    getContainer,
    options
  );

  React.useEffect(
    () => {
      const monitor = dragDropManager.getMonitor();
      let isAutoScrolling = false;
      const updateAutoScroll = () => {
        if (monitor.isDragging() === isAutoScrolling) return;
        isAutoScrolling = monitor.isDragging();
        if (isAutoScrolling) startAutoScroll();
        else stopAutoScroll();
      };
      // A drag could already be in progress.
      updateAutoScroll();
      const unsubscribe = monitor.subscribeToStateChange(updateAutoScroll);
      return () => {
        unsubscribe();
        stopAutoScroll();
      };
    },
    [dragDropManager, startAutoScroll, stopAutoScroll]
  );
};
