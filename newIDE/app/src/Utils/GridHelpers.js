// @flow

export const roundPosition = (
  pos: [number, number],
  gridWidth: number,
  gridHeight: number,
  gridOffsetX: number,
  gridOffsetY: number,
  gridType: string
) => {
  if (gridType === 'isometric') {
    if (gridWidth <= 0 || gridHeight <= 0) {
      pos[0] = Math.round(pos[0]);
      pos[1] = Math.round(pos[1]);
      return;
    }
    // Why do we need this?
    // Take a 2x2 squares, put a diamond inside each square,
    // there is a 5th diamond in the center
    // So, half cells are needed, but some are not to be used.
    // It makes a pattern in diagonal like this:
    // o-o-o-
    // -o-o-o
    // o-o-o-
    let cellX = Math.round(((pos[0] - gridOffsetX) * 2) / gridWidth);
    let cellY = Math.round(((pos[1] - gridOffsetY) * 2) / gridHeight);

    if ((((cellX + cellY) % 2) + 2) % 2 === 1) {
      // This cell should not be used, find the nearest one
      const deltaX =
        (pos[0] - ((cellX / 2) * gridWidth + gridOffsetX)) / gridWidth;
      const deltaY =
        (pos[1] - ((cellY / 2) * gridHeight + gridOffsetY)) / gridHeight;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          cellX++;
        } else {
          cellX--;
        }
      } else {
        if (deltaY > 0) {
          cellY++;
        } else {
          cellY--;
        }
      }
    }
    // magnet to the half cell
    pos[0] = (cellX / 2) * gridWidth + gridOffsetX;
    pos[1] = (cellY / 2) * gridHeight + gridOffsetY;
  } else {
    if (gridWidth <= 0) {
      pos[0] = Math.round(pos[0]);
    } else {
      pos[0] =
        Math.round((pos[0] - gridOffsetX) / gridWidth) * gridWidth +
        gridOffsetX;
    }

    if (gridHeight <= 0) {
      pos[1] = Math.round(pos[1]);
    } else {
      pos[1] =
        Math.round((pos[1] - gridOffsetY) / gridHeight) * gridHeight +
        gridOffsetY;
    }
  }
};

export const roundPositionForResizing = (
  pos: [number, number],
  gridWidth: number,
  gridHeight: number,
  gridOffsetX: number,
  gridOffsetY: number,
  gridType: string
) => {
  if (gridType === 'isometric') {
    // There is no point to align on the isometric grid when resizing.
    // Use half cells to give a bit more of freedom than for positioning.
    return roundPosition(
      pos,
      gridWidth / 2,
      gridHeight / 2,
      gridOffsetX,
      gridOffsetY,
      'rectangular'
    );
  }
  return roundPosition(
    pos,
    gridWidth,
    gridHeight,
    gridOffsetX,
    gridOffsetY,
    gridType
  );
};
