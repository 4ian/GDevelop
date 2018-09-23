export const gridSnapVal = (
  pos: number,
  gridSize: number,
  gridOffset: number
) => {
  return Math.floor((pos - gridOffset) / gridSize) * gridSize + gridOffset;
};
