// @flow
import Rectangle from './Rectangle';

export default function transformRect(
  transformPoint: (x: number, y: number) => [number, number],
  rectangle: Rectangle
): Rectangle {
  const startPos = transformPoint(rectangle.left, rectangle.top);
  const endPos = transformPoint(rectangle.right, rectangle.bottom);
  return new Rectangle(startPos[0], startPos[1], endPos[0], endPos[1]);
}
