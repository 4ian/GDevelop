// @flow

export const roundPosition = (
  pos: number,
  gridSize: number,
  gridOffset: number
) => {
  if (gridSize <= 0) {
    return Math.round(pos);
  }
  return Math.floor((pos - gridOffset) / gridSize) * gridSize + gridOffset;
};
