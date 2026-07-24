// @flow

// Helpers to compute the "sticky rows" of a tree view: the chain of ancestors
// of the first visible node, kept displayed at the top of the list when
// scrolling, similarly to VS Code tree sticky scroll.

export type StickyRow = {| index: number, top: number, height: number |};

// The sticky rows may not cover more than this ratio of the list height.
export const STICKY_ROWS_MAX_HEIGHT_RATIO = 0.4;
// Same default as VS Code: in practice, the height ratio above is usually the
// effective limit.
export const STICKY_ROWS_DEFAULT_MAX_COUNT = 7;

/**
 * Compute, for each node, the index of its parent node in the flattened data
 * (-1 for top-level nodes).
 */
export const computeParentIndexes = <Node: { +depth: number, ... }>(
  flattenedData: Node[]
): Array<number> => {
  const parentIndexes: Array<number> = new Array(flattenedData.length);
  const stack: Array<number> = [];
  for (let index = 0; index < flattenedData.length; index++) {
    const { depth } = flattenedData[index];
    while (
      stack.length > 0 &&
      flattenedData[stack[stack.length - 1]].depth >= depth
    ) {
      stack.pop();
    }
    parentIndexes[index] = stack.length > 0 ? stack[stack.length - 1] : -1;
    stack.push(index);
  }
  return parentIndexes;
};

/**
 * Compute the rows to display as sticky at the top of the list.
 * Built iteratively: each new sticky row is one more ancestry level of the
 * node peeking out just below the sticky rows accumulated so far.
 */
export const computeStickyRows = <Node: { +depth: number, ... }>({
  flattenedData,
  parentIndexes,
  scrollOffset,
  listHeight,
  maxCount,
  getRowTop,
  getRowHeight,
  getRowIndexAt,
}: {|
  flattenedData: Node[],
  parentIndexes: Array<number>,
  scrollOffset: number,
  listHeight: number,
  maxCount: number,
  getRowTop: (index: number) => number,
  getRowHeight: (index: number) => number,
  getRowIndexAt: (offset: number) => number,
|}): StickyRow[] => {
  const maxHeight = listHeight * STICKY_ROWS_MAX_HEIGHT_RATIO;
  if (scrollOffset <= 0) return [];

  const stickyRows: Array<StickyRow> = [];
  let stickyRowsHeight = 0;
  let previousStickyIndex = -1;
  while (stickyRows.length < maxCount) {
    const stickyBottom = scrollOffset + stickyRowsHeight;
    const nodeUnderIndex = getRowIndexAt(stickyBottom);
    if (nodeUnderIndex < 0 || nodeUnderIndex >= flattenedData.length) break;

    // Ancestor chain of the node below the sticky rows, root-most first,
    // including the node itself.
    const ancestorChain: Array<number> = [];
    for (
      let index = nodeUnderIndex;
      index !== -1;
      index = parentIndexes[index]
    ) {
      ancestorChain.unshift(index);
    }

    let candidateIndex: number;
    if (previousStickyIndex === -1) {
      candidateIndex = ancestorChain[0];
    } else {
      const previousPosition = ancestorChain.indexOf(previousStickyIndex);
      if (
        previousPosition === -1 ||
        previousPosition === ancestorChain.length - 1
      ) {
        // The node below the sticky rows is not a strict descendant of the
        // last sticky row: no deeper level to add.
        break;
      }
      candidateIndex = ancestorChain[previousPosition + 1];
    }

    if (candidateIndex === nodeUnderIndex) {
      // The node below the sticky rows is itself the candidate: it only
      // becomes sticky if children are displayed below it and it is actually
      // scrolled under the sticky rows (not exactly flush below them).
      const node = flattenedData[candidateIndex];
      const nextNode = flattenedData[candidateIndex + 1];
      const hasVisibleChildren = !!nextNode && nextNode.depth > node.depth;
      if (!hasVisibleChildren) break;
      if (getRowTop(candidateIndex) === stickyBottom) break;
    }

    const rowHeight = getRowHeight(candidateIndex);
    if (stickyRowsHeight + rowHeight > maxHeight) break;

    stickyRows.push({
      index: candidateIndex,
      top: stickyRowsHeight,
      height: rowHeight,
    });
    stickyRowsHeight += rowHeight;
    previousStickyIndex = candidateIndex;
  }

  if (stickyRows.length > 0) {
    // "Push" effect: when the last visible descendant of the deepest sticky
    // row is about to scroll out, the sticky row is pushed up by the next
    // group, clipped by the sticky container.
    const lastStickyRow = stickyRows[stickyRows.length - 1];
    const lastStickyDepth = flattenedData[lastStickyRow.index].depth;
    let lastDescendantIndex = lastStickyRow.index;
    for (
      let index = lastStickyRow.index + 1;
      index < flattenedData.length &&
      flattenedData[index].depth > lastStickyDepth;
      index++
    ) {
      lastDescendantIndex = index;
    }
    const lastDescendantBottom =
      getRowTop(lastDescendantIndex) +
      getRowHeight(lastDescendantIndex) -
      scrollOffset;
    if (
      lastStickyRow.top + lastStickyRow.height > lastDescendantBottom &&
      lastStickyRow.top <= lastDescendantBottom
    ) {
      lastStickyRow.top = lastDescendantBottom - lastStickyRow.height;
    }
  }

  return stickyRows;
};

export const areStickyRowsEqual = (
  stickyRows: StickyRow[],
  otherStickyRows: StickyRow[]
): boolean =>
  stickyRows.length === otherStickyRows.length &&
  stickyRows.every(
    (row, i) =>
      row.index === otherStickyRows[i].index &&
      row.top === otherStickyRows[i].top &&
      row.height === otherStickyRows[i].height
  );

/**
 * The background color of the surface the element is displayed on: the
 * background of the closest ancestor having an opaque background (a panel
 * paper, a dialog...). Used by the sticky rows, which must be opaque as the
 * actual rows scroll beneath them.
 */
export const findSurfaceBackgroundColor = (
  element: ?HTMLElement
): string | null => {
  let currentElement: ?Element = element;
  while (currentElement) {
    const { backgroundColor } = getComputedStyle(currentElement);
    if (
      backgroundColor &&
      backgroundColor !== 'transparent' &&
      backgroundColor !== 'rgba(0, 0, 0, 0)'
    ) {
      return backgroundColor;
    }
    currentElement = currentElement.parentElement;
  }
  return null;
};

/**
 * The height covered by the sticky ancestors of the row at the given index,
 * were the list scrolled so that this row is visible.
 */
export const getStickyAncestorsHeight = ({
  parentIndexes,
  index,
  maxCount,
  listHeight,
  getRowHeight,
}: {|
  parentIndexes: Array<number>,
  index: number,
  maxCount: number,
  listHeight: number,
  getRowHeight: (index: number) => number,
|}): number => {
  const ancestorIndexes: Array<number> = [];
  for (let i = parentIndexes[index]; i !== -1; i = parentIndexes[i]) {
    ancestorIndexes.unshift(i);
  }
  const maxHeight = listHeight * STICKY_ROWS_MAX_HEIGHT_RATIO;
  let stickyRowsHeight = 0;
  for (
    let rank = 0;
    rank < Math.min(ancestorIndexes.length, maxCount);
    rank++
  ) {
    const rowHeight = getRowHeight(ancestorIndexes[rank]);
    if (stickyRowsHeight + rowHeight > maxHeight) break;
    stickyRowsHeight += rowHeight;
  }
  return stickyRowsHeight;
};
