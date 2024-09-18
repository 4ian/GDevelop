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

export function flipPolygon(
  vertices: Polygon,
  centerX: number,
  centerY: number,
  flipX: boolean,
  flipY: boolean
): void {
  for (let i = 0, len = vertices.length; i < len; ++i) {
    vertices[i][0] = flipX ? 2 * centerX - vertices[i][0] : vertices[i][0];
    vertices[i][1] = flipY ? 2 * centerY - vertices[i][1] : vertices[i][1];
  }
}
