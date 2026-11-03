namespace gdjs {
  // Below this, finding the triangles touching a tile costs more than
  // giving all of them to Recast, which skips the ones outside the tile.
  const indexedTrianglesCountMin = 64;

  /**
   * The triangles of an obstacle, in the coordinates of Recast (Y is up).
   * They are kept until the obstacle changes, so that they are only
   * computed once for all the tiles it touches.
   * @category Behaviors > NavMesh pathfinding
   */
  export class NavMeshObstacleGeometry {
    private readonly positions: Float32Array;
    private readonly indices: Uint32Array;
    readonly area: NavMeshArea;
    private trianglesByTile: Map<integer, Array<integer>> | null = null;
    private trianglesByTileBuilder: NavMeshTileBuilder | null = null;

    constructor(positions: Array<float>, indices: Array<integer>) {
      this.positions = new Float32Array(positions);
      this.indices = new Uint32Array(indices);
      let minX = Number.POSITIVE_INFINITY;
      let minZ = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let maxZ = Number.NEGATIVE_INFINITY;
      for (let index = 0; index + 2 < positions.length; index += 3) {
        minX = Math.min(minX, positions[index]);
        maxX = Math.max(maxX, positions[index]);
        minZ = Math.min(minZ, positions[index + 2]);
        maxZ = Math.max(maxZ, positions[index + 2]);
      }
      this.area = { minX, minZ, maxX, maxZ };
    }

    /**
     * The biggest width or length of the triangles, along the X and Z axis.
     */
    getTriangleSizeMax(): float {
      const { positions, indices } = this;
      let triangleSizeMax = 0;
      for (let index = 0; index + 2 < indices.length; index += 3) {
        const a = indices[index] * 3;
        const b = indices[index + 1] * 3;
        const c = indices[index + 2] * 3;
        triangleSizeMax = Math.max(
          triangleSizeMax,
          Math.max(positions[a], positions[b], positions[c]) -
            Math.min(positions[a], positions[b], positions[c]),
          Math.max(positions[a + 2], positions[b + 2], positions[c + 2]) -
            Math.min(positions[a + 2], positions[b + 2], positions[c + 2])
        );
      }
      return triangleSizeMax;
    }

    isEmpty(): boolean {
      return this.indices.length === 0;
    }

    overlaps(area: NavMeshArea): boolean {
      return (
        !this.isEmpty() &&
        this.area.minX <= area.maxX &&
        this.area.maxX >= area.minX &&
        this.area.minZ <= area.maxZ &&
        this.area.maxZ >= area.minZ
      );
    }

    /**
     * Add the vertices of the triangles touching a tile, 3 per triangle.
     */
    appendTileTriangles(
      tileBuilder: NavMeshTileBuilder,
      tileX: integer,
      tileY: integer,
      vertices: Array<float>
    ): void {
      const triangleCount = this.indices.length / 3;
      if (triangleCount < indexedTrianglesCountMin) {
        for (let triangle = 0; triangle < triangleCount; triangle++) {
          this.appendTriangle(triangle, vertices);
        }
        return;
      }
      const tileTriangles = this.getTrianglesByTile(tileBuilder).get(
        tileBuilder.getTileKey(tileX, tileY)
      );
      if (!tileTriangles) {
        return;
      }
      for (const triangle of tileTriangles) {
        this.appendTriangle(triangle, vertices);
      }
    }

    private appendTriangle(triangle: integer, vertices: Array<float>): void {
      const { positions, indices } = this;
      for (let corner = 0; corner < 3; corner++) {
        const positionIndex = indices[triangle * 3 + corner] * 3;
        vertices.push(
          positions[positionIndex],
          positions[positionIndex + 1],
          positions[positionIndex + 2]
        );
      }
    }

    private getTrianglesByTile(
      tileBuilder: NavMeshTileBuilder
    ): Map<integer, Array<integer>> {
      if (this.trianglesByTile && this.trianglesByTileBuilder === tileBuilder) {
        return this.trianglesByTile;
      }
      const trianglesByTile = new Map<integer, Array<integer>>();
      const { positions, indices } = this;
      const { borderWidth } = tileBuilder;
      for (let triangle = 0; triangle * 3 < indices.length; triangle++) {
        const a = indices[triangle * 3] * 3;
        const b = indices[triangle * 3 + 1] * 3;
        const c = indices[triangle * 3 + 2] * 3;
        // The tiles whose border is touched by the triangle use it too.
        const minTileX = tileBuilder.getTileX(
          Math.min(positions[a], positions[b], positions[c]) - borderWidth
        );
        const maxTileX = tileBuilder.getTileX(
          Math.max(positions[a], positions[b], positions[c]) + borderWidth
        );
        const minTileY = tileBuilder.getTileY(
          Math.min(positions[a + 2], positions[b + 2], positions[c + 2]) -
            borderWidth
        );
        const maxTileY = tileBuilder.getTileY(
          Math.max(positions[a + 2], positions[b + 2], positions[c + 2]) +
            borderWidth
        );
        for (let tileY = minTileY; tileY <= maxTileY; tileY++) {
          for (let tileX = minTileX; tileX <= maxTileX; tileX++) {
            const tileKey = tileBuilder.getTileKey(tileX, tileY);
            const tileTriangles = trianglesByTile.get(tileKey);
            if (tileTriangles) {
              tileTriangles.push(triangle);
            } else {
              trianglesByTile.set(tileKey, [triangle]);
            }
          }
        }
      }
      this.trianglesByTile = trianglesByTile;
      this.trianglesByTileBuilder = tileBuilder;
      return trianglesByTile;
    }
  }
}
