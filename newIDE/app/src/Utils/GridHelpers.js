// @flow

export const roundPosition = (
  pos: [number, number],
  gridWidth: number,
  gridHeight: number,
  gridOffsetX: number,
  gridOffsetY: number,
  gridType: number
) => {
  if (gridType === 'isometric') {
    if (gridWidth <= 0 || gridHeight <= 0) {
      pos[0] = Math.round(pos[0]);
      pos[1] = Math.round([1]);
      return;
    }
    // Why do we need this?
    // Take a 2x2 squares, put a diamond inside each square, there is a 5th diamond in the center
    let cellX = Math.round(((pos[0] - gridOffsetX) * 2) / gridWidth);
    let cellY = Math.round(((pos[1] - gridOffsetY) * 2) / gridHeight);

    if ((((cellX + cellY) % 2) + 2) % 2 == 1) {
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
    pos[0] = (cellX / 2) * gridWidth + gridOffsetX;
    pos[1] = (cellY / 2) * gridHeight + gridOffsetY;
  } else {
    if (gridWidth <= 0) {
      pos[0] = Math.round(pos[0]);
    } else {
      pos[0] =
        Math.floor((pos[0] - gridOffsetX) / gridWidth) * gridWidth +
        gridOffsetX;
    }

    if (gridHeight <= 0) {
      pos[1] = Math.round([1]);
    } else {
      pos[1] =
        Math.floor((pos[1] - gridOffsetY) / gridHeight) * gridHeight +
        gridOffsetY;
    }
  }
};
