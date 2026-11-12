namespace gdjs {
  // Below this, finding the triangles touching a tile costs more than
  // giving all of them to Recast, which skips the ones outside the tile.
  const indexedTrianglesCountMin = 64;

  const cubePositions = [
    0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5,
  ];
  const cubeIndices = [
    0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 4, 6, 2, 6, 8, 2, 7, 5, 1, 5, 3, 1, 6,
    7, 8, 7, 1, 8, 2, 3, 4, 3, 5, 4,
  ];

  const isModel3D = (
    object: gdjs.RuntimeObject
  ): object is gdjs.Model3DRuntimeObject => {
    //@ts-ignore We are checking if the methods are present.
    return object._modelResourceName;
  };

  /**
   * The settings of the navigation mesh used to convert obstacles.
   * @category Behaviors > NavMesh pathfinding
   */
  export type NavMeshObstacleGeometrySettings = {
    is3D: boolean;
    cellSize: float;
    inverseSpeedScaleY: float;
  };

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
     * Convert an obstacle to triangles, according to its object and shape.
     */
    static create(
      obstacle: NavMeshObstacleRuntimeBehavior,
      settings: NavMeshObstacleGeometrySettings
    ): gdjs.NavMeshObstacleGeometry {
      const positions: Array<float> = [];
      const indices: Array<integer> = [];
      const object = obstacle.owner;
      // Surfaces are in 3D: they are ignored by 2D navigation meshes.
      const surface = settings.is3D ? object.getSurface() : null;
      if (surface && gdjs.Base3DHandler.is3D(object)) {
        addSurfaceFor(object, surface, settings.cellSize, positions, indices);
      } else if (gdjs.Base3DHandler.is3D(object)) {
        if (isModel3D(object) && obstacle._shape === 'Mesh') {
          addMeshFor(object, obstacle, positions, indices);
        } else {
          addBoxFor(object, positions, indices);
        }
      } else if (!settings.is3D) {
        addPolygonsFor(object, settings, positions, indices);
      }
      if (obstacle._isObstacleOnly) {
        makeTrianglesNotWalkable(positions, indices, 0);
      }
      return new gdjs.NavMeshObstacleGeometry(positions, indices);
    }

    /**
     * Add the triangles of a box, 3 vertices per triangle.
     * @param min The X, Y and Z of the corner with the smallest coordinates.
     * @param max The X, Y and Z of the opposite corner.
     */
    static appendBoxTriangles(
      vertices: Array<float>,
      min: [float, float, float],
      max: [float, float, float]
    ): void {
      for (const vertexIndex of cubeIndices) {
        for (let axis = 0; axis < 3; axis++) {
          vertices.push(
            min[axis] +
              (cubePositions[vertexIndex * 3 + axis] + 0.5) *
                (max[axis] - min[axis])
          );
        }
      }
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

  const addPolygonsFor = (
    object: gdjs.RuntimeObject,
    settings: NavMeshObstacleGeometrySettings,
    positions: Array<float>,
    indices: Array<integer>
  ): void => {
    const { inverseSpeedScaleY } = settings;
    const vertexFlags: Array<boolean> = [];
    for (const hitBox of object.getHitBoxes()) {
      let indicesOffset = Math.round(positions.length / 3);
      const vertices: Array<Point> = hitBox.vertices.map(([x, y]) => ({
        x,
        y,
      }));
      if (
        getSignedAreaX2(
          vertices[0].x,
          vertices[0].y,
          vertices[1].x,
          vertices[1].y,
          vertices[2].x,
          vertices[2].y
        ) > 0
      ) {
        vertices.reverse();
      }
      const zMax = settings.cellSize;
      const zMin = -1;
      triangulate(vertices, vertexFlags, (p1: Point, p2: Point, p3: Point) => {
        // Top
        positions.push(p1.x, zMax, p1.y * inverseSpeedScaleY);
        positions.push(p2.x, zMax, p2.y * inverseSpeedScaleY);
        positions.push(p3.x, zMax, p3.y * inverseSpeedScaleY);
        indices.push(indicesOffset + 0, indicesOffset + 1, indicesOffset + 2);
        // Bottom
        positions.push(p1.x, zMin, p1.y * inverseSpeedScaleY);
        positions.push(p2.x, zMin, p2.y * inverseSpeedScaleY);
        positions.push(p3.x, zMin, p3.y * inverseSpeedScaleY);
        indices.push(indicesOffset + 3, indicesOffset + 5, indicesOffset + 4);
        indicesOffset += 6;
      });
      for (let index = 0; index < vertices.length; index++) {
        const vertex = vertices[index];
        // Side
        positions.push(vertex.x, zMax, vertex.y * inverseSpeedScaleY);
        positions.push(vertex.x, zMin, vertex.y * inverseSpeedScaleY);
        indices.push(indicesOffset + 0, indicesOffset + 1, indicesOffset + 2);
        indices.push(indicesOffset + 3, indicesOffset + 2, indicesOffset + 1);
        indicesOffset += 2;
      }
      const vertex = vertices[0];
      positions.push(vertex.x, zMax, vertex.y * inverseSpeedScaleY);
      positions.push(vertex.x, zMin, vertex.y * inverseSpeedScaleY);
    }
  };

  const addBoxFor = (
    object: gdjs.AbstractRuntimeObject3D,
    positions: Array<float>,
    indices: Array<integer>
  ): void => {
    const point = new THREE.Vector3();
    const euler = new THREE.Euler();
    euler.order = 'ZYX';

    const indicesOffset = Math.round(positions.length / 3);
    for (let index = 0; index + 2 < cubePositions.length; index = index + 3) {
      let x = cubePositions[index];
      let y = cubePositions[index + 2];
      let z = cubePositions[index + 1];

      x *= object.getWidth();
      y *= object.getHeight();
      z *= object.getDepth();

      point.set(x, y, z);
      euler.set(
        gdjs.toRad(object.getRotationX()),
        gdjs.toRad(object.getRotationY()),
        gdjs.toRad(object.getAngle())
      );
      point.applyEuler(euler);

      x = object.getCenterXInScene() + point.x;
      y = object.getCenterYInScene() + point.y;
      z = object.getCenterZInScene() + point.z;

      // Y is the top for Recast
      positions.push(x, z, y);
    }
    for (const vertexIndex of cubeIndices) {
      indices.push(vertexIndex + indicesOffset);
    }
  };

  /**
   * Recast only walks on triangles facing up: flipped to face down, they
   * still block characters but can't be walked on.
   *
   * Surfaces less than a step (`walkableClimb`) above a walkable floor are
   * still merged with it by Recast: they stay walkable. Excluding them
   * would need to mark their volume as not walkable during the build
   * (`markBoxArea` in Recast, or tile cache obstacles).
   */
  const makeTrianglesNotWalkable = (
    positions: Array<float>,
    indices: Array<integer>,
    firstIndex: integer
  ): void => {
    for (let index = firstIndex; index + 2 < indices.length; index += 3) {
      const a = indices[index] * 3;
      const b = indices[index + 1] * 3;
      const c = indices[index + 2] * 3;
      // Y of (b - a) x (c - a), Y being the top for Recast.
      const normalY =
        (positions[b + 2] - positions[a + 2]) * (positions[c] - positions[a]) -
        (positions[b] - positions[a]) * (positions[c + 2] - positions[a + 2]);
      if (normalY > 0) {
        indices[index] = indices[index + 1];
        indices[index + 1] = a / 3;
      }
    }
  };

  const addSurfaceFor = (
    object: gdjs.AbstractRuntimeObject3D,
    surface: gdjs.Surface,
    navMeshCellSize: float,
    positions: Array<float>,
    indices: Array<integer>
  ): void => {
    const heightField = surface.getHeightField();
    const triangles = heightField
      ? getHeightFieldTriangles(object, heightField, navMeshCellSize)
      : surface.getTriangles();
    if (!triangles) {
      addBoxFor(object, positions, indices);
      return;
    }
    const point = new THREE.Vector3();
    // A matrix avoids computing the rotation again for each vertex.
    const rotation = new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler(
        gdjs.toRad(object.getRotationX()),
        gdjs.toRad(object.getRotationY()),
        gdjs.toRad(object.getAngle()),
        'ZYX'
      )
    );
    const width = object.getWidth();
    const height = object.getHeight();
    const depth = object.getDepth();
    const centerX = object.getCenterXInScene();
    const centerY = object.getCenterYInScene();
    const centerZ = object.getCenterZInScene();
    const indicesOffset = Math.round(positions.length / 3);
    const surfacePositions = triangles.positions;
    for (let index = 0; index + 2 < surfacePositions.length; index += 3) {
      // Positions are from 0 to 1 in the object box, rotated around its center.
      point.set(
        (surfacePositions[index] - 0.5) * width,
        (surfacePositions[index + 1] - 0.5) * height,
        (surfacePositions[index + 2] - 0.5) * depth
      );
      point.applyMatrix4(rotation);
      // Y is the top for Recast
      positions.push(centerX + point.x, centerZ + point.z, centerY + point.y);
    }
    const surfaceIndices = triangles.indices;
    for (let index = 0; index + 2 < surfaceIndices.length; index += 3) {
      // Swapping Y and Z mirrors triangles: they are flipped back.
      indices.push(
        indicesOffset + surfaceIndices[index + 1],
        indicesOffset + surfaceIndices[index],
        indicesOffset + surfaceIndices[index + 2]
      );
    }
  };

  /**
   * Recast samples triangles with cells of the navigation mesh: the height
   * field is sampled with the same precision, skipping smaller details.
   */
  const getHeightFieldTriangles = (
    object: gdjs.AbstractRuntimeObject3D,
    heightField: gdjs.SurfaceHeightField,
    navMeshCellSize: float
  ): gdjs.SurfaceTriangles => {
    const { columns, rows, heights } = heightField;
    const cellSize = Math.max(
      object.getWidth() / (columns - 1),
      object.getHeight() / (rows - 1)
    );
    const step = Math.max(1, Math.floor(navMeshCellSize / cellSize));
    const getSampledIndices = (count: integer) => {
      const sampledIndices: Array<integer> = [];
      for (let index = 0; index < count - 1; index += step) {
        sampledIndices.push(index);
      }
      sampledIndices.push(count - 1);
      return sampledIndices;
    };
    const sampledColumns = getSampledIndices(columns);
    const sampledRows = getSampledIndices(rows);
    const rowSize = sampledColumns.length;
    const positions = new Float32Array(rowSize * sampledRows.length * 3);
    for (let j = 0; j < sampledRows.length; j++) {
      const row = sampledRows[j];
      for (let i = 0; i < rowSize; i++) {
        const column = sampledColumns[i];
        const index = (j * rowSize + i) * 3;
        positions[index] = column / (columns - 1);
        positions[index + 1] = row / (rows - 1);
        positions[index + 2] = heights[row * columns + column];
      }
    }
    const cellIndices: Array<integer> = [];
    for (let j = 0; j + 1 < sampledRows.length; j++) {
      for (let i = 0; i + 1 < rowSize; i++) {
        const a = j * rowSize + i;
        const b = a + 1;
        const c = a + rowSize;
        const d = c + 1;
        // Cells with a hole (NaN) are skipped.
        if (
          Number.isNaN(
            positions[a * 3 + 2] +
              positions[b * 3 + 2] +
              positions[c * 3 + 2] +
              positions[d * 3 + 2]
          )
        ) {
          continue;
        }
        cellIndices.push(a, b, c, b, d, c);
      }
    }
    for (let index = 2; index < positions.length; index += 3) {
      if (Number.isNaN(positions[index])) positions[index] = 0;
    }
    return { positions, indices: new Uint32Array(cellIndices) };
  };

  const addMeshFor = (
    model3DRuntimeObject: gdjs.Model3DRuntimeObject,
    obstacle: NavMeshObstacleRuntimeBehavior,
    positions: Array<float>,
    indices: Array<integer>
  ): void => {
    const originalModel = model3DRuntimeObject
      .getInstanceContainer()
      .getGame()
      .getModel3DManager()
      .getModel(
        obstacle._meshShapeResourceName ||
          model3DRuntimeObject._modelResourceName ||
          ''
      );

    const modelInCube = new THREE.Group();
    modelInCube.rotation.order = 'ZYX';
    const root = THREE_ADDONS.SkeletonUtils.clone(originalModel.scene);
    modelInCube.add(root);

    const data = model3DRuntimeObject._data.content;
    model3DRuntimeObject._renderer.stretchModelIntoUnitaryCube(
      modelInCube,
      data.rotationX,
      data.rotationY,
      data.rotationZ
    );

    const threeObject = new THREE.Group();
    threeObject.rotation.order = 'ZYX';
    threeObject.add(modelInCube);
    const object = model3DRuntimeObject;
    const width = object.getWidth();
    const height = object.getHeight();
    const depth = object.getDepth();
    threeObject.scale.set(
      object.isFlippedX() ? -width : width,
      object.isFlippedY() ? -height : height,
      object.isFlippedZ() ? -depth : depth
    );
    threeObject.position.set(
      object.getCenterXInScene(),
      object.getCenterYInScene(),
      object.getCenterZInScene()
    );
    threeObject.rotation.set(
      gdjs.toRad(object.getRotationX()),
      gdjs.toRad(object.getRotationY()),
      gdjs.toRad(object.getAngle())
    );

    threeObject.updateMatrixWorld();

    // For indexed triangles
    const vector3 = new THREE.Vector3();

    threeObject.traverse((object3d) => {
      const mesh = object3d as THREE.Mesh;
      if (!mesh.isMesh) {
        return;
      }
      const indicesOffset = Math.round(positions.length / 3);
      const positionAttribute = mesh.geometry.getAttribute('position');
      object3d.getWorldScale(vector3);
      // Negate it because we swap Y and Z.
      const shouldTrianglesBeFlipped = !(vector3.x * vector3.y * vector3.z < 0);
      const index = mesh.geometry.getIndex();
      if (index) {
        for (let i = 0; i < positionAttribute.count; i++) {
          vector3.fromBufferAttribute(positionAttribute, i);
          object3d.localToWorld(vector3);
          positions.push(vector3.x, vector3.z, vector3.y);
        }
        for (let i = 0; i < index.count; i += 3) {
          indices.push(
            indicesOffset + index.getX(shouldTrianglesBeFlipped ? i + 1 : i),
            indicesOffset + index.getX(shouldTrianglesBeFlipped ? i : i + 1),
            indicesOffset + index.getX(i + 2)
          );
        }
      } else {
        for (let i = 0; i < positionAttribute.count; i += 3) {
          vector3.fromBufferAttribute(positionAttribute, i);
          object3d.localToWorld(vector3);
          positions.push(vector3.x, vector3.z, vector3.y);

          vector3.fromBufferAttribute(positionAttribute, i + 1);
          object3d.localToWorld(vector3);
          positions.push(vector3.x, vector3.z, vector3.y);

          vector3.fromBufferAttribute(positionAttribute, i + 2);
          object3d.localToWorld(vector3);
          positions.push(vector3.x, vector3.z, vector3.y);

          indices.push(
            indicesOffset + (shouldTrianglesBeFlipped ? i + 1 : i),
            indicesOffset + (shouldTrianglesBeFlipped ? i : i + 1),
            indicesOffset + i + 2
          );
        }
      }
    });
  };

  // The following code is inspired from Critterai
  // https://github.com/stevefsp/critterai
  interface Point {
    x: number;
    y: number;
  }

  /**
   * Attempts to triangulate a polygon.
   *
   * @param vertices the polygon to be triangulate.
   * The content is manipulated during the operation
   * and it will be left in an undefined state at the end of
   * the operation.
   * @param vertexFlags only used internally
   * @param outTriangles is called for each triangle derived
   * from the original polygon.
   */
  function triangulate(
    vertices: Array<Point>,
    vertexFlags: Array<boolean>,
    outTriangles: (p1: Point, p2: Point, p3: Point) => void
  ): void {
    // Terminology, concepts and such:
    //
    // This algorithm loops around the edges of a polygon looking for
    // new internal edges to add that will partition the polygon into a
    // new valid triangle internal to the starting polygon. During each
    // iteration the shortest potential new edge is selected to form that
    // iteration's new triangle.
    //
    // Triangles will only be formed if a single new edge will create
    // a triangle. Two new edges will never be added during a single
    // iteration. This means that the triangulated portions of the
    // original polygon will only contain triangles and the only
    // non-triangle polygon will exist in the untriangulated portion
    // of the original polygon.
    //
    // "Partition edge" refers to a potential new edge that will form a
    // new valid triangle.
    //
    // "Center" vertex refers to the vertex in a potential new triangle
    // which, if the triangle is formed, will be external to the
    // remaining untriangulated portion of the polygon. Since it
    // is now external to the polygon, it can't be used to form any
    // new triangles.
    //
    // Some documentation refers to "iPlus2" even though the variable is
    // not in scope or does not exist for that section of code. For
    // documentation purposes, iPlus2 refers to the 2nd vertex after the
    // primary vertex.
    // E.g.: i, iPlus1, and iPlus2.
    //
    // Visualizations: http://www.critterai.org/projects/nmgen_study/polygen.html#triangulation

    // Loop through all vertices, flagging all indices that represent
    // a center vertex of a valid new triangle.
    vertexFlags.length = vertices.length;
    for (let i = 0; i < vertices.length; i++) {
      const iPlus1 = (i + 1) % vertices.length;
      const iPlus2 = (i + 2) % vertices.length;
      // A triangle formed by i, iPlus1, and iPlus2 will result
      // in a valid internal triangle.
      // Flag the center vertex (iPlus1) to indicate a valid triangle
      // location.
      vertexFlags[iPlus1] = isValidPartition(i, iPlus2, vertices);
    }

    // Loop through the vertices creating triangles. When there is only a
    // single triangle left,  the operation is complete.
    //
    // When a valid triangle is formed, remove its center vertex. So for
    // each loop, a single vertex will be removed.
    //
    // At the start of each iteration the indices list is in the following
    // state:
    // - Represents a simple polygon representing the un-triangulated
    //   portion of the original polygon.
    // - All valid center vertices are flagged.
    while (vertices.length > 3) {
      // Find the shortest new valid edge.

      // NOTE: i and iPlus1 are defined in two different scopes in
      // this section. So be careful.

      // Loop through all indices in the remaining polygon.
      let minLengthSq = Number.MAX_VALUE;
      let minLengthSqVertexIndex = -1;
      for (let i = 0; i < vertices.length; i++) {
        if (vertexFlags[(i + 1) % vertices.length]) {
          // Indices i, iPlus1, and iPlus2 are known to form a
          // valid triangle.
          const vert = vertices[i];
          const vertPlus2 = vertices[(i + 2) % vertices.length];

          // Determine the length of the partition edge.
          // (i -> iPlus2)
          const deltaX = vertPlus2.x - vert.x;
          const deltaY = vertPlus2.y - vert.y;
          const lengthSq = deltaX * deltaX + deltaY * deltaY;

          if (lengthSq < minLengthSq) {
            minLengthSq = lengthSq;
            minLengthSqVertexIndex = i;
          }
        }
      }

      if (minLengthSqVertexIndex === -1)
        // Could not find a new triangle. Triangulation failed.
        // This happens if there are three or more vertices
        // left, but none of them are flagged as being a
        // potential center vertex.
        return;

      let i = minLengthSqVertexIndex;
      let iPlus1 = (i + 1) % vertices.length;

      // Add the new triangle to the output.
      outTriangles(
        vertices[i],
        vertices[iPlus1],
        vertices[(i + 2) % vertices.length]
      );

      // iPlus1, the "center" vert in the new triangle, is now external
      // to the untriangulated portion of the polygon. Remove it from
      // the vertices list since it cannot be a member of any new
      // triangles.
      vertices.splice(iPlus1, 1);
      vertexFlags.splice(iPlus1, 1);

      if (iPlus1 === 0 || iPlus1 >= vertices.length) {
        // The vertex removal has invalidated iPlus1 and/or i. So
        // force a wrap, fixing the indices so they reference the
        // correct indices again. This only occurs when the new
        // triangle is formed across the wrap location of the polygon.
        // Case 1: i = 14, iPlus1 = 15, iPlus2 = 0
        // Case 2: i = 15, iPlus1 = 0, iPlus2 = 1;
        i = vertices.length - 1;
        iPlus1 = 0;
      }

      // At this point i and iPlus1 refer to the two indices from a
      // successful triangulation that will be part of another new
      // triangle. We now need to re-check these indices to see if they
      // can now be the center index in a potential new partition.
      vertexFlags[i] = isValidPartition(
        (i - 1 + vertices.length) % vertices.length,
        iPlus1,
        vertices
      );
      vertexFlags[iPlus1] = isValidPartition(
        i,
        (i + 2) % vertices.length,
        vertices
      );
    }

    // Only 3 vertices remain.
    // Add their triangle to the output list.
    outTriangles(vertices[0], vertices[1], vertices[2]);
  }

  /**
   * Check if the line segment formed by vertex A and vertex B will
   * form a valid partition of the polygon.
   *
   * I.e. the line segment AB is internal to the polygon and will not
   * cross existing line segments.
   *
   * Assumptions:
   * - The vertices arguments define a valid simple polygon
   * with vertices wrapped clockwise.
   * - indexA != indexB
   *
   * Behavior is undefined if the arguments to not meet these
   * assumptions
   *
   * @param indexA the index of the vertex that will form the segment AB.
   * @param indexB the index of the vertex that will form the segment AB.
   * @param vertices a polygon wrapped clockwise.
   * @return true if the line segment formed by vertex A and vertex B will
   * form a valid partition of the polygon.
   */
  function isValidPartition(
    indexA: integer,
    indexB: integer,
    vertices: Point[]
  ): boolean {
    //  First check whether the segment AB lies within the internal
    //  angle formed at A (this is the faster check).
    //  If it does, then perform the more costly check.
    return (
      liesWithinInternalAngle(indexA, indexB, vertices) &&
      !hasIllegalEdgeIntersection(indexA, indexB, vertices)
    );
  }

  /**
   * Check if vertex B lies within the internal angle of the polygon
   * at vertex A.
   *
   * Vertex B does not have to be within the polygon border. It just has
   * be be within the area encompassed by the internal angle formed at
   * vertex A.
   *
   * This operation is a fast way of determining whether a line segment
   * can possibly form a valid polygon partition. If this test returns
   * FALSE, then more expensive checks can be skipped.
   *
   * Visualizations: http://www.critterai.org/projects/nmgen_study/polygen.html#anglecheck
   *
   * Special case:
   * FALSE is returned if vertex B lies directly on either of the rays
   * cast from vertex A along its associated polygon edges. So the test
   * on vertex B is exclusive of the polygon edges.
   *
   * Assumptions:
   * - The vertices and indices arguments define a valid simple polygon
   * with vertices wrapped clockwise.
   * -indexA != indexB
   *
   * Behavior is undefined if the arguments to not meet these
   * assumptions
   *
   * @param indexA the index of the vertex that will form the segment AB.
   * @param indexB the index of the vertex that will form the segment AB.
   * @param vertices a polygon wrapped clockwise.
   * @return true if vertex B lies within the internal angle of
   * the polygon at vertex A.
   */
  function liesWithinInternalAngle(
    indexA: integer,
    indexB: integer,
    vertices: Point[]
  ): boolean {
    // Get pointers to the main vertices being tested.
    const vertexA = vertices[indexA];
    const vertexB = vertices[indexB];

    // Get pointers to the vertices just before and just after vertA.
    const vertexAMinus =
      vertices[(indexA - 1 + vertices.length) % vertices.length];
    const vertexAPlus = vertices[(indexA + 1) % vertices.length];

    // First, find which of the two angles formed by the line segments
    //  AMinus->A->APlus is internal to (pointing towards) the polygon.
    // Then test to see if B lies within the area formed by that angle.

    // TRUE if A is left of or on line AMinus->APlus
    if (
      isLeftOrCollinear(
        vertexA.x,
        vertexA.y,
        vertexAMinus.x,
        vertexAMinus.y,
        vertexAPlus.x,
        vertexAPlus.y
      )
    )
      // The angle internal to the polygon is <= 180 degrees
      // (non-reflex angle).
      // Test to see if B lies within this angle.
      return (
        isLeft(
          // TRUE if B is left of line A->AMinus
          vertexB.x,
          vertexB.y,
          vertexA.x,
          vertexA.y,
          vertexAMinus.x,
          vertexAMinus.y
        ) &&
        // TRUE if B is right of line A->APlus
        isRight(
          vertexB.x,
          vertexB.y,
          vertexA.x,
          vertexA.y,
          vertexAPlus.x,
          vertexAPlus.y
        )
      );

    // The angle internal to the polygon is > 180 degrees (reflex angle).
    // Test to see if B lies within the external (<= 180 degree) angle and
    // flip the result. (If B lies within the external angle, it can't
    // lie within the internal angle)
    return !(
      // TRUE if B is left of or on line A->APlus
      (
        isLeftOrCollinear(
          vertexB.x,
          vertexB.y,
          vertexA.x,
          vertexA.y,
          vertexAPlus.x,
          vertexAPlus.y
        ) &&
        // TRUE if B is right of or on line A->AMinus
        isRightOrCollinear(
          vertexB.x,
          vertexB.y,
          vertexA.x,
          vertexA.y,
          vertexAMinus.x,
          vertexAMinus.y
        )
      )
    );
  }

  /**
   * Check if point P is to the left of line AB when looking
   * from A to B.
   * @param px The x-value of the point to test.
   * @param py The y-value of the point to test.
   * @param ax The x-value of the point (ax, ay) that is point A on line AB.
   * @param ay The y-value of the point (ax, ay) that is point A on line AB.
   * @param bx The x-value of the point (bx, by) that is point B on line AB.
   * @param by The y-value of the point (bx, by) that is point B on line AB.
   * @return TRUE if point P is to the left of line AB when looking
   * from A to B.
   */
  function isLeft(
    px: integer,
    py: integer,
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer
  ): boolean {
    return getSignedAreaX2(ax, ay, px, py, bx, by) < 0;
  }

  /**
   * Check if point P is to the left of line AB when looking
   * from A to B or is collinear with line AB.
   * @param px The x-value of the point to test.
   * @param py The y-value of the point to test.
   * @param ax The x-value of the point (ax, ay) that is point A on line AB.
   * @param ay The y-value of the point (ax, ay) that is point A on line AB.
   * @param bx The x-value of the point (bx, by) that is point B on line AB.
   * @param by The y-value of the point (bx, by) that is point B on line AB.
   * @return TRUE if point P is to the left of line AB when looking
   * from A to B, or is collinear with line AB.
   */
  function isLeftOrCollinear(
    px: integer,
    py: integer,
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer
  ): boolean {
    return getSignedAreaX2(ax, ay, px, py, bx, by) <= 0;
  }

  /**
   * Check if point P is to the right of line AB when looking
   * from A to B.
   * @param px The x-value of the point to test.
   * @param py The y-value of the point to test.
   * @param ax The x-value of the point (ax, ay) that is point A on line AB.
   * @param ay The y-value of the point (ax, ay) that is point A on line AB.
   * @param bx The x-value of the point (bx, by) that is point B on line AB.
   * @param by The y-value of the point (bx, by) that is point B on line AB.
   * @return TRUE if point P is to the right of line AB when looking
   * from A to B.
   */
  function isRight(
    px: integer,
    py: integer,
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer
  ): boolean {
    return getSignedAreaX2(ax, ay, px, py, bx, by) > 0;
  }

  /**
   * Check if point P is to the right of or on line AB when looking
   * from A to B.
   * @param px The x-value of the point to test.
   * @param py The y-value of the point to test.
   * @param ax The x-value of the point (ax, ay) that is point A on line AB.
   * @param ay The y-value of the point (ax, ay) that is point A on line AB.
   * @param bx The x-value of the point (bx, by) that is point B on line AB.
   * @param by The y-value of the point (bx, by) that is point B on line AB.
   * @return TRUE if point P is to the right of or on line AB when looking
   * from A to B.
   */
  function isRightOrCollinear(
    px: integer,
    py: integer,
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer
  ): boolean {
    return getSignedAreaX2(ax, ay, px, py, bx, by) >= 0;
  }

  /**
   * The absolute value of the returned value is two times the area of the
   * triangle defined by points (A, B, C).
   *
   * A positive value indicates:
   * - Counterclockwise wrapping of the points.
   * - Point B lies to the right of line AC, looking from A to C.
   *
   * A negative value indicates:
   * - Clockwise wrapping of the points.<
   * - Point B lies to the left of line AC, looking from A to C.
   *
   * A value of zero indicates that all points are collinear or
   * represent the same point.
   *
   * This is a fast operation.
   *
   * @param ax The x-value for point (ax, ay) for vertex A of the triangle.
   * @param ay The y-value for point (ax, ay) for vertex A of the triangle.
   * @param bx The x-value for point (bx, by) for vertex B of the triangle.
   * @param by The y-value for point (bx, by) for vertex B of the triangle.
   * @param cx The x-value for point (cx, cy) for vertex C of the triangle.
   * @param cy The y-value for point (cx, cy) for vertex C of the triangle.
   * @return The signed value of two times the area of the triangle defined
   * by the points (A, B, C).
   */
  function getSignedAreaX2(
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer,
    cx: integer,
    cy: integer
  ): integer {
    // References:
    // http://softsurfer.com/Archive/algorithm_0101/algorithm_0101.htm#Modern%20Triangles
    // http://mathworld.wolfram.com/TriangleArea.html (Search for "signed")
    return (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
  }

  /**
   * Check if the line segment AB intersects any edges not already
   * connected to one of the two vertices.
   *
   * Assumptions:
   * - The vertices and indices arguments define a valid simple polygon
   * with vertices wrapped clockwise.
   * - indexA != indexB
   *
   * Behavior is undefined if the arguments to not meet these
   * assumptions
   *
   * @param indexA the index of the vertex that will form the segment AB.
   * @param indexB the index of the vertex that will form the segment AB.
   * @param vertices a polygon wrapped clockwise.
   * @return true if the line segment AB intersects any edges not already
   * connected to one of the two vertices.
   */
  function hasIllegalEdgeIntersection(
    indexA: integer,
    indexB: integer,
    vertices: Point[]
  ): boolean {
    // Get pointers to the primary vertices being tested.
    const vertexA = vertices[indexA];
    const vertexB = vertices[indexB];

    // Loop through the polygon edges.
    for (
      let edgeBeginIndex = 0;
      edgeBeginIndex < vertices.length;
      edgeBeginIndex++
    ) {
      const edgeEndIndex = (edgeBeginIndex + 1) % vertices.length;
      if (
        edgeBeginIndex === indexA ||
        edgeBeginIndex === indexB ||
        edgeEndIndex === indexA ||
        edgeEndIndex === indexB
      ) {
        continue;
      }
      // Neither of the test indices are endpoints of this edge.
      // Get this edge's vertices.
      const edgeBegin = vertices[edgeBeginIndex];
      const edgeEnd = vertices[edgeEndIndex];
      if (
        (edgeBegin.x === vertexA.x && edgeBegin.y === vertexA.y) ||
        (edgeBegin.x === vertexB.x && edgeBegin.y === vertexB.y) ||
        (edgeEnd.x === vertexA.x && edgeEnd.y === vertexA.y) ||
        (edgeEnd.x === vertexB.x && edgeEnd.y === vertexB.y)
      ) {
        // One of the test vertices is co-located
        // with one of the endpoints of this edge (this is a
        // test of the actual position of the vertices rather than
        // simply the index check performed earlier).
        // Skip this edge.
        continue;
      }
      // This edge is not connected to either of the test vertices.
      // If line segment AB intersects  with this edge, then the
      // intersection is illegal.
      // I.e. New edges cannot cross existing edges.
      if (
        segmentsIntersect(
          vertexA.x,
          vertexA.y,
          vertexB.x,
          vertexB.y,
          edgeBegin.x,
          edgeBegin.y,
          edgeEnd.x,
          edgeEnd.y
        )
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns TRUE if line segment AB intersects with line segment CD in any
   * manner. Either collinear or at a single point.
   * @param ax The x-value for point (ax, ay) in line segment AB.
   * @param ay The y-value for point (ax, ay) in line segment AB.
   * @param bx The x-value for point (bx, by) in line segment AB.
   * @param by The y-value for point (bx, by) in line segment AB.
   * @param cx The x-value for point (cx, cy) in line segment CD.
   * @param cy The y-value for point (cx, cy) in line segment CD.
   * @param dx The x-value for point (dx, dy) in line segment CD.
   * @param dy The y-value for point (dx, dy) in line segment CD.
   * @return TRUE if line segment AB intersects with line segment CD in any
   * manner.
   */
  function segmentsIntersect(
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer,
    cx: integer,
    cy: integer,
    dx: integer,
    dy: integer
  ): boolean {
    // This is modified 2D line-line intersection/segment-segment
    // intersection test.

    const deltaABx = bx - ax;
    const deltaABy = by - ay;
    const deltaCAx = ax - cx;
    const deltaCAy = ay - cy;
    const deltaCDx = dx - cx;
    const deltaCDy = dy - cy;

    const numerator = deltaCAy * deltaCDx - deltaCAx * deltaCDy;
    const denominator = deltaABx * deltaCDy - deltaABy * deltaCDx;

    // Perform early exit tests.
    if (denominator === 0 && numerator !== 0) {
      // If numerator is zero, then the lines are colinear.
      // Since it isn't, then the lines must be parallel.
      return false;
    }

    // Lines intersect. But do the segments intersect?

    // Forcing float division on both of these via casting of the
    // denominator.
    const factorAB = numerator / denominator;
    const factorCD = (deltaCAy * deltaABx - deltaCAx * deltaABy) / denominator;

    // Determine the type of intersection
    if (
      factorAB >= 0.0 &&
      factorAB <= 1.0 &&
      factorCD >= 0.0 &&
      factorCD <= 1.0
    ) {
      return true; // The two segments intersect.
    }

    // The lines intersect, but segments to not.

    return false;
  }
}
