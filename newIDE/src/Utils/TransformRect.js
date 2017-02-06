export default function transformRect(transformPoint, {x, y, width, height}) {
  const startPos = transformPoint(x, y);
  const endPos = transformPoint(x + width, y + height);
  return {
    x: startPos[0],
    y: startPos[1],
    width: endPos[0] - startPos[0],
    height: endPos[1] - startPos[1],
  }
}
