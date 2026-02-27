// @flow

export type GridRect = {|
  minCol: 0 | 1 | 2,
  maxCol: 0 | 1 | 2,
  minRow: 0 | 1 | 2,
  maxRow: 0 | 1 | 2,
|};

export type GridSelection = {|
  rect: GridRect | null,
  proportional: boolean,
  isAdvanced: boolean,
|};

const colToHorizontalAnchor = ['WindowLeft', 'WindowCenter', 'WindowRight'];
const rowToVerticalAnchor = ['WindowTop', 'WindowCenter', 'WindowBottom'];

const horizontalAnchorToCol: { [string]: number } = {
  WindowLeft: 0,
  WindowCenter: 1,
  WindowRight: 2,
};

const verticalAnchorToRow: { [string]: number } = {
  WindowTop: 0,
  WindowCenter: 1,
  WindowBottom: 2,
};

/**
 * Converts a grid rectangle selection (+ proportional flag) into the 4
 * anchor edge property values that GDevelop understands.
 */
export const gridSelectionToProperties = (
  rect: GridRect | null,
  proportional: boolean
): {|
  leftEdgeAnchor: string,
  rightEdgeAnchor: string,
  topEdgeAnchor: string,
  bottomEdgeAnchor: string,
|} => {
  if (proportional) {
    return {
      leftEdgeAnchor: 'Proportional',
      rightEdgeAnchor: 'Proportional',
      topEdgeAnchor: 'Proportional',
      bottomEdgeAnchor: 'Proportional',
    };
  }

  if (!rect) {
    return {
      leftEdgeAnchor: 'None',
      rightEdgeAnchor: 'None',
      topEdgeAnchor: 'None',
      bottomEdgeAnchor: 'None',
    };
  }

  return {
    leftEdgeAnchor: colToHorizontalAnchor[rect.minCol],
    rightEdgeAnchor: colToHorizontalAnchor[rect.maxCol],
    topEdgeAnchor: rowToVerticalAnchor[rect.minRow],
    bottomEdgeAnchor: rowToVerticalAnchor[rect.maxRow],
  };
};

/**
 * Reads the 4 anchor property values and determines which grid cells
 * should be highlighted, whether proportional mode is on, or whether
 * the state is too complex for the grid (isAdvanced).
 */
export const propertiesToGridSelection = (
  leftEdgeAnchor: string,
  rightEdgeAnchor: string,
  topEdgeAnchor: string,
  bottomEdgeAnchor: string
): GridSelection => {
  // All proportional
  if (
    leftEdgeAnchor === 'Proportional' &&
    rightEdgeAnchor === 'Proportional' &&
    topEdgeAnchor === 'Proportional' &&
    bottomEdgeAnchor === 'Proportional'
  ) {
    return {
      rect: { minCol: 0, maxCol: 2, minRow: 0, maxRow: 2 },
      proportional: true,
      isAdvanced: false,
    };
  }

  // All None
  if (
    leftEdgeAnchor === 'None' &&
    rightEdgeAnchor === 'None' &&
    topEdgeAnchor === 'None' &&
    bottomEdgeAnchor === 'None'
  ) {
    return { rect: null, proportional: false, isAdvanced: false };
  }

  // Try to map each edge to a grid coordinate
  const leftCol = horizontalAnchorToCol[leftEdgeAnchor];
  const rightCol = horizontalAnchorToCol[rightEdgeAnchor];
  const topRow = verticalAnchorToRow[topEdgeAnchor];
  const bottomRow = verticalAnchorToRow[bottomEdgeAnchor];

  // If any edge can't be mapped (None, Proportional in a mixed state, etc.)
  if (
    leftCol === undefined ||
    rightCol === undefined ||
    topRow === undefined ||
    bottomRow === undefined
  ) {
    return { rect: null, proportional: false, isAdvanced: true };
  }

  // Validate: left must be <= right, top must be <= bottom
  if (leftCol > rightCol || topRow > bottomRow) {
    return { rect: null, proportional: false, isAdvanced: true };
  }

  return {
    rect: {
      minCol: (leftCol: any),
      maxCol: (rightCol: any),
      minRow: (topRow: any),
      maxRow: (bottomRow: any),
    },
    proportional: false,
    isAdvanced: false,
  };
};

/**
 * Returns the set of cell keys (e.g. "0,0", "1,0", "2,0") that should
 * be visually highlighted given the current grid rect.
 */
export const getHighlightedCells = (rect: GridRect | null): Set<string> => {
  const cells = new Set<string>();
  if (!rect) return cells;

  for (let col = rect.minCol; col <= rect.maxCol; col++) {
    for (let row = rect.minRow; row <= rect.maxRow; row++) {
      cells.add(`${col},${row}`);
    }
  }
  return cells;
};

/**
 * Returns the set of cell keys that are the "endpoint" corners of the
 * selected rectangle — these get the solid inner square treatment.
 * For a single cell, that cell is the only endpoint.
 * For a range, the two corners (minCol,minRow) and (maxCol,maxRow) are endpoints.
 */
export const getEndpointCells = (rect: GridRect | null): Set<string> => {
  const cells = new Set<string>();
  if (!rect) return cells;

  cells.add(`${rect.minCol},${rect.minRow}`);
  cells.add(`${rect.maxCol},${rect.maxRow}`);
  return cells;
};

/**
 * Handles a cell click and returns the new grid rect.
 *
 * - If nothing selected: select clicked cell.
 * - If one cell selected and user clicks the same cell: deselect (returns null).
 * - If one cell selected and user clicks a different cell: form bounding rect.
 * - If a range is selected: reset to single cell on the clicked cell.
 */
export const handleCellClick = (
  currentRect: GridRect | null,
  clickedCol: 0 | 1 | 2,
  clickedRow: 0 | 1 | 2
): GridRect | null => {
  // Nothing selected → select this cell
  if (!currentRect) {
    return {
      minCol: clickedCol,
      maxCol: clickedCol,
      minRow: clickedRow,
      maxRow: clickedRow,
    };
  }

  const isSingleCell =
    currentRect.minCol === currentRect.maxCol &&
    currentRect.minRow === currentRect.maxRow;

  if (isSingleCell) {
    // Clicking the same cell → deselect
    if (
      currentRect.minCol === clickedCol &&
      currentRect.minRow === clickedRow
    ) {
      return null;
    }

    // Clicking a different cell → form rectangle
    return {
      minCol: (Math.min(currentRect.minCol, clickedCol): any),
      maxCol: (Math.max(currentRect.maxCol, clickedCol): any),
      minRow: (Math.min(currentRect.minRow, clickedRow): any),
      maxRow: (Math.max(currentRect.maxRow, clickedRow): any),
    };
  }

  // Range already selected → reset to single cell
  return {
    minCol: clickedCol,
    maxCol: clickedCol,
    minRow: clickedRow,
    maxRow: clickedRow,
  };
};
