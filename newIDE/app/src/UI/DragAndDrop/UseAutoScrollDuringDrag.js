// @flow
import * as React from 'react';
import { useDragDropManager } from 'react-dnd';

const EDGE_SIZE = 50; // Distance from an edge, in pixels, at which scrolling starts.
const MAX_SPEED = 10; // Maximum scrolling speed, in pixels per frame.
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
export const useAutoScrollDuringDrag = (
  getContainer: () => ?HTMLElement
): {|
  startAutoScroll: () => void,
  stopAutoScroll: () => void,
|} => {
  const dragDropManager = useDragDropManager();
  const animationFrameId = React.useRef<AnimationFrameID | null>(null);

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
      const scrollIfCloseToAnEdge = () => {
        const container = getContainer();
        const offset = monitor.getClientOffset();
        if (container && offset) {
          const rect = container.getBoundingClientRect();
          if (
            offset.x > rect.left - POINTER_SLACK &&
            offset.x < rect.right + POINTER_SLACK &&
            offset.y > rect.top - POINTER_SLACK &&
            offset.y < rect.bottom + POINTER_SLACK
          ) {
            if (offset.x < rect.left + EDGE_SIZE) {
              const intensity = Math.min(
                1,
                (rect.left + EDGE_SIZE - offset.x) / EDGE_SIZE
              );
              container.scrollLeft -= Math.ceil(MAX_SPEED * intensity);
            } else if (offset.x > rect.right - EDGE_SIZE) {
              const intensity = Math.min(
                1,
                (offset.x - (rect.right - EDGE_SIZE)) / EDGE_SIZE
              );
              container.scrollLeft += Math.ceil(MAX_SPEED * intensity);
            }
            if (offset.y < rect.top + EDGE_SIZE) {
              const intensity = Math.min(
                1,
                (rect.top + EDGE_SIZE - offset.y) / EDGE_SIZE
              );
              container.scrollTop -= Math.ceil(MAX_SPEED * intensity);
            } else if (offset.y > rect.bottom - EDGE_SIZE) {
              const intensity = Math.min(
                1,
                (offset.y - (rect.bottom - EDGE_SIZE)) / EDGE_SIZE
              );
              container.scrollTop += Math.ceil(MAX_SPEED * intensity);
            }
          }
        }
        animationFrameId.current = requestAnimationFrame(scrollIfCloseToAnEdge);
      };
      animationFrameId.current = requestAnimationFrame(scrollIfCloseToAnEdge);
    },
    [getContainer, dragDropManager, stopAutoScroll]
  );

  // Ensure the loop is stopped if the component is unmounted during a drag.
  React.useEffect(() => stopAutoScroll, [stopAutoScroll]);

  return { startAutoScroll, stopAutoScroll };
};
