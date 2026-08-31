// @flow
import * as React from 'react';

export type VisibleRowsRange = {|
  /** Index of the first row to render. */
  firstRowIndex: number,
  /** Index *after* the last row to render (so it's an exclusive bound). */
  afterLastRowIndex: number,
|};

const emptyRange: VisibleRowsRange = { firstRowIndex: 0, afterLastRowIndex: 0 };

/**
 * All the ancestors clipping their content, from the closest to the farthest.
 * The ancestors handling a scroll are a subset of these, so intersecting all of
 * them gives the part of the screen where an element can actually be seen -
 * without having to know which ancestor is the one handling the scroll.
 */
const getClippingAncestors = (element: Element): Array<Element> => {
  const clippingAncestors: Array<Element> = [];
  let ancestor = element.parentElement;
  while (ancestor) {
    if (window.getComputedStyle(ancestor).overflowY !== 'visible') {
      clippingAncestors.push(ancestor);
    }
    ancestor = ancestor.parentElement;
  }
  return clippingAncestors;
};

/**
 * The part of `container` that is on screen, in pixels from the top of
 * `container` (so `top` is negative when the container starts above the screen).
 */
const getVisibleBand = (
  container: Element,
  clippingAncestors: Array<Element>
): {| top: number, bottom: number |} => {
  let top = 0;
  let bottom = window.innerHeight;
  for (const clippingAncestor of clippingAncestors) {
    const ancestorRect = clippingAncestor.getBoundingClientRect();
    top = Math.max(top, ancestorRect.top);
    bottom = Math.min(bottom, ancestorRect.bottom);
  }

  const containerTop = container.getBoundingClientRect().top;
  return { top: top - containerTop, bottom: bottom - containerTop };
};

type Props = {|
  /**
   * The element containing all the rows - including the ones that are not
   * rendered (so its height must be `rowCount * rowHeight`).
   */
  containerRef: {| +current: ?Element |},
  rowCount: number,
  rowHeight: number,
  /** Number of rows rendered before and after the ones on screen. */
  overscanRowCount?: number,
|};

/**
 * Compute the range of rows to render, so that only the rows that are on screen
 * (plus a few of them around) have to be rendered.
 *
 * Contrary to most virtualized lists, the scroll is *not* handled by this hook:
 * it can be handled by any ancestor (typically a properties panel scrolling all
 * its sections at once, or a scroll view in a dialog), which is found by
 * inspecting the DOM.
 */
export const useVisibleRowsRange = ({
  containerRef,
  rowCount,
  rowHeight,
  overscanRowCount = 4,
}: Props): {|
  visibleRowsRange: VisibleRowsRange,
  scrollRowIntoView: (rowIndex: number) => void,
|} => {
  const [
    visibleRowsRange,
    setVisibleRowsRange,
  ] = React.useState<VisibleRowsRange>(emptyRange);
  const clippingAncestorsRef = React.useRef<Array<Element>>([]);

  const getRange = React.useCallback(
    (): VisibleRowsRange => {
      const container = containerRef.current;
      if (!container || rowCount === 0) return emptyRange;

      const { top, bottom } = getVisibleBand(
        container,
        clippingAncestorsRef.current
      );
      const firstRowIndex = Math.max(
        0,
        Math.min(rowCount, Math.floor(top / rowHeight) - overscanRowCount)
      );
      return {
        firstRowIndex,
        afterLastRowIndex: Math.max(
          firstRowIndex,
          Math.min(rowCount, Math.ceil(bottom / rowHeight) + overscanRowCount)
        ),
      };
    },
    [containerRef, rowCount, rowHeight, overscanRowCount]
  );

  const updateVisibleRowsRange = React.useCallback(
    () => {
      const newRange = getRange();
      setVisibleRowsRange(range =>
        range.firstRowIndex === newRange.firstRowIndex &&
        range.afterLastRowIndex === newRange.afterLastRowIndex
          ? range
          : newRange
      );
    },
    [getRange]
  );

  React.useLayoutEffect(
    () => {
      const container = containerRef.current;
      if (!container) return;

      // Finding the clipping ancestors reads the computed style of every
      // ancestor: it's done again when the list changes size (a variable added,
      // a search...), which is rare and also picks up a change of the layout
      // around the list.
      clippingAncestorsRef.current = getClippingAncestors(container);
      updateVisibleRowsRange();

      let animationFrameId: AnimationFrameID | null = null;
      const scheduleUpdate = () => {
        if (animationFrameId !== null) return;
        animationFrameId = requestAnimationFrame(() => {
          animationFrameId = null;
          updateVisibleRowsRange();
        });
      };

      // Scroll events don't bubble, but they are dispatched to capturing
      // listeners: this catches the scroll of any ancestor.
      window.addEventListener('scroll', scheduleUpdate, true);
      window.addEventListener('resize', scheduleUpdate);
      const resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(container);
      for (const clippingAncestor of clippingAncestorsRef.current) {
        resizeObserver.observe(clippingAncestor);
      }

      return () => {
        if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
        window.removeEventListener('scroll', scheduleUpdate, true);
        window.removeEventListener('resize', scheduleUpdate);
        resizeObserver.disconnect();
      };
    },
    [containerRef, updateVisibleRowsRange]
  );

  const scrollRowIntoView = React.useCallback(
    (rowIndex: number) => {
      const container = containerRef.current;
      if (!container) return;

      const clippingAncestors = clippingAncestorsRef.current;
      const scrollingAncestor = clippingAncestors.find(
        clippingAncestor =>
          clippingAncestor.scrollHeight > clippingAncestor.clientHeight
      );
      if (!scrollingAncestor) return;

      const { top, bottom } = getVisibleBand(container, clippingAncestors);
      const rowTop = rowIndex * rowHeight;
      const rowBottom = rowTop + rowHeight;
      if (rowTop < top) {
        scrollingAncestor.scrollBy(0, rowTop - top);
      } else if (rowBottom > bottom) {
        scrollingAncestor.scrollBy(0, rowBottom - bottom);
      } else {
        return;
      }

      // Take the new scroll position into account right away, so that the row
      // is rendered without waiting for the scroll event to be handled.
      updateVisibleRowsRange();
    },
    [containerRef, rowHeight, updateVisibleRowsRange]
  );

  return { visibleRowsRange, scrollRowIntoView };
};
