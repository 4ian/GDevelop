// @flow
export type Polygon = Array<[number, number]>;

export function rotatePolygon(
  vertices: Polygon,
  centerX: number,
  centerY: number,
  angle: number
): void {
  //We want a clockwise rotation
  const cosa = Math.cos(-angle);
  const sina = Math.sin(-angle);
  for (let i = 0, len = vertices.length; i < len; ++i) {
    let x = vertices[i][0] - centerX;
    let y = vertices[i][1] - centerY;
    vertices[i][0] = centerX + x * cosa + y * sina;
    vertices[i][1] = centerY - x * sina + y * cosa;
  }
}
