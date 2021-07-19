// Strongly inspired from http://www.critterai.org/projects/nmgen_study/

namespace gdjs {
  export class RasterizationCell {
    static NULL_REGION_ID = 0;

    x: integer;
    y: integer;
    distanceToObstacle: integer = Number.MAX_VALUE;
    regionID: integer = RasterizationCell.NULL_REGION_ID;
    distanceToRegionCore: integer = 0;
    contourFlags: integer = 0;

    constructor(x: integer, y: integer) {
      this.x = x;
      this.y = y;
    }

    setObstacle() {
      this.distanceToObstacle = 0;
    }

    isObstacle() {
      return this.distanceToObstacle === 0;
    }

    hasRegion() {
      return this.regionID !== RasterizationCell.NULL_REGION_ID;
    }
  }

  export class RasterizationGrid {
    originX: float;
    originY: float;
    cellSize: float;
    cells: RasterizationCell[][];

    public static neighbor4Deltas = [
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
    ];

    public static neighbor8Deltas = [
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
    ];

    constructor(
      left: float,
      top: float,
      right: float,
      bottom: float,
      cellSize: float
    ) {
      this.cellSize = cellSize;
      this.originX = left - cellSize;
      this.originY = top - cellSize;

      const dimX = 2 + Math.ceil((right - left) / cellSize);
      const dimY = 2 + Math.ceil((bottom - top) / cellSize);
      this.cells = [];
      for (var y = 0; y < dimY; y++) {
        this.cells[y] = [];

        for (var x = 0; x < dimX; x++) {
          this.cells[y][x] = new RasterizationCell(x, y);
        }
      }
    }

    convertToGridBasis(position: Point, gridPosition: Point) {
      gridPosition.x = (position.x - this.originX) / this.cellSize;
      gridPosition.y = (position.y - this.originY) / this.cellSize;
      return gridPosition;
    }

    convertFromGridBasis(gridPosition: Point, position: Point) {
      position.x = gridPosition.x * this.cellSize + this.originX;
      position.y = gridPosition.y * this.cellSize + this.originY;
      return position;
    }

    get(x: integer, y: integer) {
      return this.cells[y][x];
    }

    dimY() {
      return this.cells.length;
    }

    dimX() {
      return this.cells[0].length;
    }

    obstacleDistanceMax() {
      let max = 0;
      for (const cellRow of this.cells) {
        for (const cell of cellRow) {
          if (cell.distanceToObstacle > max) {
            max = cell.distanceToObstacle;
          }
        }
      }
      return max;
    }
  }

  export type ContourPoint = { x: integer; y: integer; region: integer };

  /**
   * Result of {@link ConvexPolygonGenerator.getPolyMergeInfo}
   * 
    * A value of -1 at lengthSq indicates one of the following:
    * - The polygons cannot be merged because they would contain too
    * many vertices.
    * - The polygons do not have a shared edge.
    * - Merging the polygons would result in a concave polygon.
   */
  type PolyMergeResult = {
    /** The lengthSq of the edge shared between the polygons.*/
    lengthSq: integer;
    /** The index of the start of the shared edge in polygon A. */
    polygonAVertexIndex: integer;
    /** The index of the start of the shared edge in polygon B. */
    polygonBVertexIndex: integer;
  };

export class NavMeshGenerator {
  public static buildMesh(
    areaLeftBound: float,
    areaTopBound: float,
    areaRightBound: float,
    areaBottomBound: float,
    cellSize: float,
    obstacles: RuntimeObject[],
    obstacleCellPadding: integer) {
    const grid = new gdjs.RasterizationGrid(
      areaLeftBound,
      areaTopBound,
      areaRightBound,
      areaBottomBound,
      cellSize
    );
    gdjs.ObstacleRasterizer.rasterizeObstacles(grid, obstacles);
    //console.log(
    //  '\n' +
    //    grid.cells
    //      .map((cellRow) =>
    //        cellRow.map((cell) => (cell.isObstacle() ? '#' : '.')).join('')
    //      )
    //      .join('\n') +
    //    '\n'
    //);
    gdjs.RegionGenerator.generateDistanceField(grid);
    gdjs.RegionGenerator.generateRegions(grid, obstacleCellPadding);
    const contours = gdjs.ContourBuilder.buildContours(grid);
    const meshField = gdjs.ConvexPolygonGenerator.splitToConvexPolygons(contours, 16);
    // point can be shared so them must be copied to be scaled.
    const scaledMeshField = meshField.map((polygon) =>
      polygon.map((point) =>
        grid.convertFromGridBasis(point, { x: 0, y: 0 })
      )
    );
    return scaledMeshField;
  }
}

/**
 * Builds convex polygons from the provided polygons.
 * 
 * This implementation is greatly inspired from CritterAI class "PolyMeshFieldBuilder".
 * http://www.critterai.org/projects/nmgen_study/polygen.html
 */
  export class ConvexPolygonGenerator {
    /**
     * Builds convex polygons from the provided polygons.
     * @param concavePolygons The content is manipulated during the operation
     * and it will be left in an undefined state at the end of
     * the operation.
     * @param maxVerticesPerPolygon cap the vertex number in return polygons.
     * @return convex polygons.
     */
    public static splitToConvexPolygons(
      concavePolygons: Point[][],
      maxVerticesPerPolygon: integer
    ): Point[][] {

      // The maximum possible number of polygons assuming that all will
      // be triangles.
      let maxPossiblePolygons = 0;
      // The maximum vertices found in a single contour.
      let maxVerticesPerContour = 0;
      for (const contour of concavePolygons) {
        const count = contour.length;
        maxPossiblePolygons += count - 2;
        maxVerticesPerContour = Math.max(maxVerticesPerContour, count);
      }

      // Each list is initialized to a size that will minimize resizing.

      const convexPolygons = new Array<Point[]>(maxPossiblePolygons);
      convexPolygons.length = 0;

      // Various working variables.
      // (Values are meaningless outside of the iteration.)
      const workingContourFlags = new Array<boolean>(maxVerticesPerContour);
      workingContourFlags.length = 0;
      const workingPolygons = new Array<Point[]>(maxVerticesPerContour + 1);
      workingPolygons.length = 0;
      const workingMergeInfo: PolyMergeResult = {
        lengthSq: -1,
        polygonAVertexIndex: -1,
        polygonBVertexIndex: -1,
      };
      const workingMergedPolygon = new Array<Point>(maxVerticesPerPolygon);
      workingMergedPolygon.length = 0;

      // Split every concave polygon into convex polygons.
      for (const contour of concavePolygons) {
        if (contour.length < 3) {
          // This indicates a problem with contour creation
          // since the contour builder should detect for this.
          console.error(
            'Polygon generation failure: Contour has ' +
              'too few vertices. Bad input data.'
          );
          continue;
        }

        // Initialize the working polygon array.
        workingPolygons.length = 0;

        // Triangulate the contour.
        let foundAnyTriangle = false;
        ConvexPolygonGenerator.triangulate(
          contour,
          workingContourFlags,
          (p1: Point, p2: Point, p3: Point) => {
            const workingPolygon = new Array<Point>(maxVerticesPerPolygon);
            workingPolygon.length = 0;
            workingPolygon.push(p1);
            workingPolygon.push(p2);
            workingPolygon.push(p3);
            workingPolygons.push(workingPolygon);
            foundAnyTriangle = true;
          }
        );

        if (!foundAnyTriangle) {
          /*
           * Failure of the triangulation.
           * This is known to occur if the source polygon is
           * self-intersecting or the source region contains internal
           * holes.  In both cases, the problem is likely due to bad
           * region formation.
           */
          console.error(
            'Polygon generation failure: Could not triangulate contour.'
          );
          continue;
        }

        if (maxVerticesPerPolygon > 3) {
          // Merging of triangles into larger polygons is permitted.
          // Continue until no polygons can be found to merge.
          // http://www.critterai.org/nmgen_polygen#mergepolys
          while (true) {
            let longestMergeEdge = -1;
            let bestPolygonA: Point[] = [];
            let polygonAVertexIndex = -1; // Start of the shared edge.
            let bestPolygonB: Point[] = [];
            let polygonBVertexIndex = -1; // Start of the shared edge.
            let bestPolygonBIndex = - 1;

            // Loop through all but the last polygon looking for the
            // best polygons to merge in this iteration.
            for (let indexA = 0; indexA < workingPolygons.length - 1; indexA++) {
              const polygonA = workingPolygons[indexA];
              for (
                let indexB = indexA + 1;
                indexB < workingPolygons.length;
                indexB++
              ) {
                const polygonB = workingPolygons[indexB];
                // Can polyB merge with polyA?
                ConvexPolygonGenerator.getPolyMergeInfo(
                  polygonA,
                  polygonB,
                  maxVerticesPerPolygon,
                  workingMergeInfo
                );
                if (workingMergeInfo.lengthSq > longestMergeEdge) {
                  // polyB has the longest shared edge with
                  // polyA found so far. Save the merge
                  // information.
                  longestMergeEdge = workingMergeInfo.lengthSq;
                  bestPolygonA = polygonA;
                  polygonAVertexIndex = workingMergeInfo.polygonAVertexIndex;
                  bestPolygonB = polygonB;
                  polygonBVertexIndex = workingMergeInfo.polygonBVertexIndex;
                  bestPolygonBIndex = indexB;
                }
              }
            }

            if (longestMergeEdge <= 0)
              // No valid merges found during this iteration.
              break;

            // Found polygons to merge.  Perform the merge.

            /*
             * Fill the mergedPoly array.
             * Start the vertex at the end of polygon A's shared edge.
             * Add all vertices until looping back to the vertex just
             * before the start of the shared edge. Repeat for
             * polygon B.
             *
             * Duplicate vertices are avoided, while ensuring we get
             * all vertices, since each loop  drops the vertex that
             * starts its polygon's shared edge and:
             *
             * PolyAStartVert == PolyBEndVert and
             * PolyAEndVert == PolyBStartVert.
             */
            const vertCountA = bestPolygonA.length;
            const vertCountB = bestPolygonB.length;
            workingMergedPolygon.length = 0;
            for (let i = 0; i < vertCountA - 1; i++)
              workingMergedPolygon.push(bestPolygonA[(polygonAVertexIndex + 1 + i) % vertCountA]);
            for (let i = 0; i < vertCountB - 1; i++)
              workingMergedPolygon.push(bestPolygonB[(polygonBVertexIndex + 1 + i) % vertCountB]);

            // Copy the merged polygon over the top of polygon A.
            bestPolygonA.length = 0;
            Array.prototype.push.apply(bestPolygonA, workingMergedPolygon);
            // Remove polygon B
            workingPolygons.splice(bestPolygonBIndex, 1);
          }
        }

        // Polygon creation for this contour is complete.
        // Add polygons to the global polygon array
        Array.prototype.push.apply(convexPolygons, workingPolygons);
      }

      // Build polygon adjacency information.
      //TODO migrate buildAdjacencyData(result);
      // or just use the one from the pathfinding lib?

      return convexPolygons;
    }



    /**
     * Checks two polygons to see if they can be merged.  If a merge is
     * allowed, provides data via the outResult argument (see {@link PolyMergeResult}).
     * 
     * @param polygonA The polygon A
     * @param polygonB The polygon B
     * @param maxVerticesPerPolygon cap the vertex number in return polygons.
     * @param outResult contains merge information.
     */
    private static getPolyMergeInfo(
      polygonA: Point[],
      polygonB: Point[],
      maxVerticesPerPolygon: integer,
      outResult: PolyMergeResult
    ): void {
      outResult.lengthSq = -1; // Default to invalid merge
      outResult.polygonAVertexIndex = -1;
      outResult.polygonBVertexIndex = -1;

      const vertexCountA = polygonA.length;
      const vertexCountB = polygonB.length;

      // If the merged polygon would would have to many vertices, do not
      // merge. Subtracting two since to take into account the effect of
      // a merge.
      if (vertexCountA + vertexCountB - 2 > maxVerticesPerPolygon) return;

      // Check if the polygons share an edge.
      for (let indexA = 0; indexA < vertexCountA; indexA++) {
        // Get the vertex indices for the polygonA edge
        const vertexA = polygonA[indexA];
        const nextVertexA = polygonA[(indexA + 1) % vertexCountA];
        // Search polygonB for matches.
        for (let indexB = 0; indexB < vertexCountB; indexB++) {
          // Get the vertex indices for the polygonB edge.
          const vertexB = polygonB[indexB];
          const nextVertexB = polygonB[(indexB + 1) % vertexCountB];
          // === can be used because vertices comme from the same concave polygon.
          if (vertexA === nextVertexB && nextVertexA === vertexB) {
            // The vertex indices for this edge are the same and
            // sequenced in opposite order.  So the edge is shared.
            outResult.polygonAVertexIndex = indexA;
            outResult.polygonBVertexIndex = indexB;
          }
        }
      }

      if (outResult.polygonAVertexIndex === -1)
        // No common edge, cannot merge.
        return;

      // Check to see if the merged polygon would be convex.
      //
      // Gets the vertices near the section where the merge would occur.
      // Do they form a concave section?  If so, the merge is invalid.
      //
      // Note that the following algorithm is only valid for clockwise
      // wrapped convex polygons.
      let sharedVertMinus =
        polygonA[(outResult.polygonAVertexIndex - 1 + vertexCountA) % vertexCountA];
      let sharedVert = polygonA[outResult.polygonAVertexIndex];
      let sharedVertPlus =
        polygonB[(outResult.polygonBVertexIndex + 2) % vertexCountB];
      if (
        !ConvexPolygonGenerator.isLeft(
          sharedVert.x,
          sharedVert.y,
          sharedVertMinus.x,
          sharedVertMinus.y,
          sharedVertPlus.x,
          sharedVertPlus.y
        )
      ) {
        // The shared vertex (center) is not to the left of segment
        // vertMinus->vertPlus. For a clockwise wrapped polygon, this
        // indicates a concave section. Merged polygon would be concave.
        // Invalid merge.
        return;
      }

      sharedVertMinus =
        polygonB[(outResult.polygonBVertexIndex - 1 + vertexCountB) % vertexCountB];
      sharedVert = polygonB[outResult.polygonBVertexIndex];
      sharedVertPlus = polygonA[(outResult.polygonAVertexIndex + 2) % vertexCountA];
      if (
        !ConvexPolygonGenerator.isLeft(
          sharedVert.x,
          sharedVert.y,
          sharedVertMinus.x,
          sharedVertMinus.y,
          sharedVertPlus.x,
          sharedVertPlus.y
        )
      ) {
        // The shared vertex (center) is not to the left of segment
        // vertMinus->vertPlus. For a clockwise wrapped polygon, this
        // indicates a concave section. Merged polygon would be concave.
        // Invalid merge.
        return;
      }

      // Get the vertex indices that form the shared edge.
      sharedVertMinus = polygonA[outResult.polygonAVertexIndex];
      sharedVert = polygonA[(outResult.polygonAVertexIndex + 1) % vertexCountA];

      // Store the lengthSq of the shared edge.
      const deltaX = sharedVertMinus.x - sharedVert.x;
      const deltaZ = sharedVertMinus.y - sharedVert.y;
      outResult.lengthSq = deltaX * deltaX + deltaZ * deltaZ;
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
     * @return The number of triangles generated. Or, if triangulation
     * failed, a negative number.
     */
    private static triangulate(
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
       // remaining untriangulated portion of the polygon.  Since it
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
        vertexFlags[iPlus1] = ConvexPolygonGenerator.isValidPartition(
          i,
          iPlus2,
          vertices
        );
      }

       // Loop through the vertices creating triangles. When there is only a
       // single triangle left,  the operation is complete.
       //
       // When a valid triangle is formed, remove its center vertex.  So for
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
           // Could not find a new triangle.  Triangulation failed.
           // This happens if there are three or more vertices
           // left, but none of them are flagged as being a
           // potential center vertex.
          return;

        let i = minLengthSqVertexIndex;
        let iPlus1 = (i + 1) % vertices.length;

        // Add the new triangle to the output.
        outTriangles(vertices[i], vertices[iPlus1], vertices[(i + 2) % vertices.length]);

         // iPlus1, the "center" vert in the new triangle, is now external
         // to the untriangulated portion of the polygon.  Remove it from
         // the vertices list since it cannot be a member of any new
         // triangles.
        vertices.splice(iPlus1, 1);
        vertexFlags.splice(iPlus1, 1);

        if (iPlus1 === 0 || iPlus1 >= vertices.length) {
           // The vertex removal has invalidated iPlus1 and/or i.  So
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
         // triangle.  We now need to re-check these indices to see if they
         // can now be the center index in a potential new partition.
        vertexFlags[i] = ConvexPolygonGenerator.isValidPartition(
          (i - 1 + vertices.length) % vertices.length,
          iPlus1,
          vertices
        );
        vertexFlags[iPlus1] = ConvexPolygonGenerator.isValidPartition(
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
    private static isValidPartition(
      indexA: integer,
      indexB: integer,
      vertices: Point[]
    ): boolean {
      //  First check whether the segment AB lies within the internal
      //  angle formed at A (this is the faster check).
      //  If it does, then perform the more costly check.
      return (
        ConvexPolygonGenerator.liesWithinInternalAngle(indexA, indexB, vertices) &&
        !ConvexPolygonGenerator.hasIllegalEdgeIntersection(
          indexA,
          indexB,
          vertices
        )
      );
    }

    /**
     * Check if vertex B lies within the internal angle of the polygon
     * at vertex A.
     *
     * Vertex B does not have to be within the polygon border.  It just has
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
    private static liesWithinInternalAngle(
      indexA: integer,
      indexB: integer,
      vertices: Point[]
    ): boolean {
      // Get pointers to the main vertices being tested.
      const vertexA = vertices[indexA];
      const vertexB = vertices[indexB];

      // Get pointers to the vertices just before and just after vertA.
      const vertexAMinus = vertices[(indexA - 1 + vertices.length) % vertices.length];
      const vertexAPlus = vertices[(indexA + 1) % vertices.length];

       // First, find which of the two angles formed by the line segments
       //  AMinus->A->APlus is internal to (pointing towards) the polygon.
       // Then test to see if B lies within the area formed by that angle.

      // TRUE if A is left of or on line AMinus->APlus
      if (
        ConvexPolygonGenerator.isLeftOrCollinear(
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
          ConvexPolygonGenerator.isLeft(
            // TRUE if B is left of line A->AMinus
            vertexB.x,
            vertexB.y,
            vertexA.x,
            vertexA.y,
            vertexAMinus.x,
            vertexAMinus.y
          ) &&
          // TRUE if B is right of line A->APlus
          ConvexPolygonGenerator.isRight(
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
       // flip the result.  (If B lies within the external angle, it can't
       // lie within the internal angle.)
      return !(
        // TRUE if B is left of or on line A->APlus
        (
          ConvexPolygonGenerator.isLeftOrCollinear(
            vertexB.x,
            vertexB.y,
            vertexA.x,
            vertexA.y,
            vertexAPlus.x,
            vertexAPlus.y
          ) &&
          // TRUE if B is right of or on line A->AMinus
          ConvexPolygonGenerator.isRightOrCollinear(
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
     * connected to one of the two vertices.  Otherwise FALSE.
     */
    private static hasIllegalEdgeIntersection(
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
            // with one of the endpoints of this edge. (This is a
            // test of the actual position of the vertices rather than
            // simply the index check performed earlier.)
            // Skip this edge.
          continue;
        }
          // This edge is not connected to either of the test vertices.
          // If line segment AB intersects  with this edge, then the
          // intersection is illegal.
          // I.e. New edges cannot cross existing edges.
        if (
          Geometry.segmentsIntersect(
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
    private static isLeft(
      px: integer,
      py: integer,
      ax: integer,
      ay: integer,
      bx: integer,
      by: integer
    ): boolean {
      return ConvexPolygonGenerator.getSignedAreaX2(ax, ay, px, py, bx, by) < 0;
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
     * from A to B, or is collinear with line AB.  Otherwise FALSE.
     */
    private static isLeftOrCollinear(
      px: integer,
      py: integer,
      ax: integer,
      ay: integer,
      bx: integer,
      by: integer
    ): boolean {
      return (
        ConvexPolygonGenerator.getSignedAreaX2(ax, ay, px, py, bx, by) <= 0
      );
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
    private static isRight(
      px: integer,
      py: integer,
      ax: integer,
      ay: integer,
      bx: integer,
      by: integer
    ): boolean {
      return ConvexPolygonGenerator.getSignedAreaX2(ax, ay, px, py, bx, by) > 0;
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
    private static isRightOrCollinear(
      px: integer,
      py: integer,
      ax: integer,
      ay: integer,
      bx: integer,
      by: integer
    ): boolean {
      return (
        ConvexPolygonGenerator.getSignedAreaX2(ax, ay, px, py, bx, by) >= 0
      );
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
    private static getSignedAreaX2(
      ax: integer,
      ay: integer,
      bx: integer,
      by: integer,
      cx: integer,
      cy: integer
    ): integer {
       // References:
       // http://softsurfer.com/Archive/algorithm_0101/algorithm_0101.htm#Modern%20Triangles
       // http://mathworld.wolfram.com/TriangleArea.html (Search for "signed".)
      return (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    }
  }

  export class ContourBuilder {
    static buildContours(grid: RasterizationGrid): ContourPoint[][] {
      const contours = new Array<ContourPoint[]>();

      for (let y = 1; y < grid.dimY() - 1; y++) {
        for (let x = 1; x < grid.dimX() - 1; x++) {
          const cell = grid.get(x, y);

          cell.contourFlags = 0;
          if (!cell.hasRegion())
            // Don't care about spans in the null region.
            continue;

          for (
            let direction = 0;
            direction < RasterizationGrid.neighbor4Deltas.length;
            direction++
          ) {
            const delta = RasterizationGrid.neighbor4Deltas[direction];

            const neighbor = grid.get(cell.x + delta.x, cell.y + delta.y);
            if (cell.regionID === neighbor.regionID) {
              cell.contourFlags |= 1 << direction;
            }
          }
          cell.contourFlags ^= 0xf;
          if (cell.contourFlags === 0xf) {
            cell.contourFlags = 0;
            console.warn(
              "Discarded contour: Island span. Can't form  a contour. Region: " +
                cell.regionID
            );
          }
        }
      }

      const workingRawVerts = new Array<ContourPoint>();
      const workingSimplifiedVerts = new Array<ContourPoint>();

      for (let y = 1; y < grid.dimY() - 1; y++) {
        for (let x = 1; x < grid.dimX() - 1; x++) {
          const cell = grid.get(x, y);

          if (!cell.hasRegion() || cell.contourFlags === 0) continue;

          workingRawVerts.length = 0;
          workingSimplifiedVerts.length = 0;

          let startDir = 0;
          while ((cell.contourFlags & (1 << startDir)) === 0)
            // This is not an edge direction.  Try the next one.
            startDir++;
          // We now have a span that is part of a contour and a direction
          // that points to a different region (null or real).
          // Build the contour.
          ContourBuilder.buildRawContours(
            grid,
            cell,
            startDir,
            workingRawVerts
          );
          // Perform post processing on the contour in order to
          // create the final, simplified contour.
          ContourBuilder.generateSimplifiedContour(
            cell.regionID,
            workingRawVerts,
            workingSimplifiedVerts
          );

          if (workingSimplifiedVerts.length < 3) {
            console.warn(
              "Discarded contour: Can't form enough valid" +
                'edges from the vertices.' +
                ' Region: ' +
                cell.regionID
            );
          } else {
            contours.push(Array.from(workingSimplifiedVerts));
          }
        }
      }

      //TODO Detect and report anomalies

      return contours;
    }

    private static leftVertexOfFacingCellBorderDeltas = [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
    ];

    private static buildRawContours(
      grid: RasterizationGrid,
      startCell: RasterizationCell,
      startDirection: number,
      outContourVerts: ContourPoint[]
    ) {
      let cell = startCell;
      let direction = startDirection;

      let loopCount = 0;
      do {
        // Note: The design of this loop is such that the span variable
        // will always reference an edge span from the same region as
        // the start span.

        if ((cell.contourFlags & (1 << direction)) != 0) {
          // The current direction is pointing toward an edge.
          // Get this edge's vertex.
          const delta =
            ContourBuilder.leftVertexOfFacingCellBorderDeltas[direction];

          const neighbor = grid.get(
            cell.x + RasterizationGrid.neighbor4Deltas[direction].x,
            cell.y + RasterizationGrid.neighbor4Deltas[direction].y
          );
          outContourVerts.push({
            x: cell.x + delta.x,
            y: cell.y + delta.y,
            region: neighbor.regionID,
          });

          // Remove the flag for this edge.  We never need to consider
          // it again since we have a vertex for this edge.
          cell.contourFlags &= ~(1 << direction);
          direction = (direction + 1) & 0x3; // Rotate in clockwise direction.
        } else {
          /*
           * The current direction does not point to an edge.  So it
           * must point to a neighbor span in the same region as the
           * current span. Move to the neighbor and swing the search
           * direction back one increment (counterclockwise).
           * By moving the direction back one increment we guarantee we
           * don't miss any edges.
           */
          const neighbor = grid.get(
            cell.x + RasterizationGrid.neighbor4Deltas[direction].x,
            cell.y + RasterizationGrid.neighbor4Deltas[direction].y
          );
          cell = neighbor;

          direction = (direction + 3) & 0x3; // Rotate counterclockwise.
        }
      } while (
        !(cell === startCell && direction === startDirection) &&
        ++loopCount < 65535
      );
      return outContourVerts;
    }

    private static generateSimplifiedContour(
      regionID: number,
      sourceVerts: ContourPoint[],
      outVerts: ContourPoint[]
    ) {
      let noConnections = true;
      for (const sourceVert of sourceVerts) {
        if (sourceVert.region != RasterizationCell.NULL_REGION_ID) {
          noConnections = false;
          break;
        }
      }

      // Seed the simplified contour with the mandatory edges.
      // (At least one edge.)
      if (noConnections) {
        /*
         * This contour represents an island region surrounded only by the
         * null region. Seed the simplified contour with the source's
         * lower left (ll) and upper right (ur) vertices.
         */
        let lowerLeftX = sourceVerts[0].x;
        let lowerLeftY = sourceVerts[0].y;
        let lowerLeftIndex = 0;
        let upperRightX = sourceVerts[0].x;
        let upperRightY = sourceVerts[0].y;
        let upperRightIndex = 0;
        for (let index = 0; index < sourceVerts.length; index++) {
          const sourceVert = sourceVerts[index];
          const x = sourceVert.x;
          const y = sourceVert.y;

          if (x < lowerLeftX || (x == lowerLeftX && y < lowerLeftY)) {
            lowerLeftX = x;
            lowerLeftY = y;
            lowerLeftIndex = index;
          }
          if (x >= upperRightX || (x == upperRightX && y > upperRightY)) {
            upperRightX = x;
            upperRightY = y;
            upperRightIndex = index;
          }
        }
        // Seed the simplified contour with this edge.
        outVerts.push({ x: lowerLeftX, y: lowerLeftY, region: lowerLeftIndex });
        outVerts.push({
          x: upperRightX,
          y: upperRightY,
          region: upperRightIndex,
        });
      } else {
        /*
         * The contour shares edges with other non-null regions.
         * Seed the simplified contour with a new vertex for every
         * location where the region connection changes.  These are
         * vertices that are important because they represent portals
         * to other regions.
         */
        for (let index = 0; index < sourceVerts.length; index++) {
          const sourceVert = sourceVerts[index];

          if (
            sourceVert.region !==
            sourceVerts[(index + 1) % sourceVerts.length].region
          ) {
            // The current vertex has a different region than the
            // next vertex.  So there is a change in vertex region.
            outVerts.push({ x: sourceVert.x, y: sourceVert.y, region: index });
          }
        }
      }

      ContourBuilder.matchObstacleRegionEdges(sourceVerts, outVerts);

      //TODO Check if the less than 3 vertices case must be handle.

      // Replace the index pointers in the output list with region IDs.
      for (const outVert of outVerts) {
        outVert.region = sourceVerts[outVert.region].region;
      }
    }

    private static matchObstacleRegionEdges(
      sourceVerts: ContourPoint[],
      inoutResultVerts: ContourPoint[]
    ) {
      /*
       * Loop through all edges in this contour.
       *
       * NOTE: The simplifiedVertCount in the loop condition
       * increases over iterations.  That is what keeps the loop going beyond
       * the initial vertex count.
       */
      let iResultVertA = 0;
      while (iResultVertA < inoutResultVerts.length) {
        const iResultVertB = (iResultVertA + 1) % inoutResultVerts.length;

        // The line segment's beginning vertex.
        const ax = inoutResultVerts[iResultVertA].x;
        const az = inoutResultVerts[iResultVertA].y;
        const iVertASource = inoutResultVerts[iResultVertA].region;

        // The line segment's ending vertex.
        const bx = inoutResultVerts[iResultVertB].x;
        const bz = inoutResultVerts[iResultVertB].y;
        const iVertBSource = inoutResultVerts[iResultVertB].region;

        // The source index of the next vertex to test.  (The vertex just
        // after the current vertex in the source vertex list.)
        let iTestVert = (iVertASource + 1) % sourceVerts.length;
        let maxDeviation = 0;

        // Default to no index.  No new vert to add.
        let iVertToInsert = -1;

        if (
          sourceVerts[iTestVert].region === RasterizationCell.NULL_REGION_ID
        ) {
          /*
           * This test vertex is part of a null region edge.
           * Loop through the source vertices until the end vertex
           * is found, searching for the vertex that is farthest from
           * the line segment formed by the begin/end vertices.
           *
           * Visualizations:
           * http://www.critterai.org/nmgen_contourgen#nulledgesimple
           */
          while (iTestVert !== iVertBSource) {
            const deviation = Geometry.getPointSegmentDistanceSq(
              sourceVerts[iTestVert].x,
              sourceVerts[iTestVert].y,
              ax,
              az,
              bx,
              bz
            );
            if (deviation > maxDeviation) {
              // A new maximum deviation was detected.
              maxDeviation = deviation;
              iVertToInsert = iTestVert;
            }
            // Move to the next vertex.
            iTestVert = (iTestVert + 1) % sourceVerts.length;
          }
        }

        //TODO make mThreshold configurable ?
        const mThreshold = 1;
        if (iVertToInsert !== -1 && maxDeviation > mThreshold * mThreshold) {
          // A vertex was found that is further than allowed from the
          // current edge. Add this vertex to the contour.
          inoutResultVerts.splice(iResultVertA + 1, 0, {
            x: sourceVerts[iVertToInsert].x,
            y: sourceVerts[iVertToInsert].y,
            region: iVertToInsert,
          });
          // Not incrementing the vertex since we need to test the edge
          // formed by vertA  and this this new vertex on the next
          // iteration of the loop.
        }
        // This edge segment does not need to be altered.  Move to
        // the next vertex.
        else iResultVertA++;
      }
    }
  }

  export class RegionGenerator {
    static generateRegions(
      grid: RasterizationGrid,
      obstacleCellPadding: integer
    ) {
      const distanceMin = obstacleCellPadding * 2;
      const expandIterations: integer = 4 + distanceMin * 2;

      let floodedCells = new Array<RasterizationCell | null>(1024);
      let workingStack = new Array<RasterizationCell>(1024);

      let nextRegionID = 1;

      for (
        let distance = grid.obstacleDistanceMax();
        distance > distanceMin;
        distance = Math.max(distance - 2, 0)
      ) {
        floodedCells.length = 0;
        for (let y = 1; y < grid.dimY() - 1; y++) {
          for (let x = 1; x < grid.dimX() - 1; x++) {
            const cell = grid.get(x, y);
            if (!cell.hasRegion() && cell.distanceToObstacle >= distance) {
              floodedCells.push(cell);
            }
          }
        }

        if (nextRegionID > 1) {
          if (distance > 0) {
            RegionGenerator.expandRegions(grid, floodedCells, expandIterations);
          } else {
            RegionGenerator.expandRegions(grid, floodedCells, -1);
          }
        }

        for (const floodedCell of floodedCells) {
          if (!floodedCell || floodedCell.hasRegion()) continue;

          const fillTo = Math.max(distance - 2, distanceMin);
          if (
            RegionGenerator.floodNewRegion(
              grid,
              floodedCell,
              fillTo,
              nextRegionID,
              workingStack
            )
          ) {
            nextRegionID++;
          }
        }
      }

      // Find all spans that haven't been assigned regions by the main loop.
      // (Up to the minimum distance.)
      floodedCells.length = 0;
      for (let y = 1; y < grid.dimY() - 1; y++) {
        for (let x = 1; x < grid.dimX() - 1; x++) {
          const cell = grid.get(x, y);

          if (cell.distanceToObstacle >= distanceMin && !cell.hasRegion()) {
            // Not a border or null region span.  Should be in a region.
            floodedCells.push(cell);
          }
        }
      }

      // Perform a final expansion of existing regions.
      // Allow more iterations than normal for this last expansion.
      if (distanceMin > 0) {
        RegionGenerator.expandRegions(grid, floodedCells, expandIterations * 8);
      } else {
        RegionGenerator.expandRegions(grid, floodedCells, -1);
      }

      //TODO check if post processing algorithms are necessary
    }

    private static expandRegions(
      grid: RasterizationGrid,
      cells: Array<RasterizationCell | null>,
      iterationMax: integer
    ) {
      if (cells.length === 0) return;
      let skipped = 0;
      for (
        let iteration = 0;
        (iteration < iterationMax || iterationMax == -1) &&
        skipped < cells.length;
        iteration++
      ) {
        skipped = 0;

        for (let index = 0; index < cells.length; index++) {
          const cell = cells[index];
          if (cell === null) {
            skipped++;
            continue;
          }
          let cellRegion = RasterizationCell.NULL_REGION_ID;
          let regionCenterDist = Number.MAX_VALUE;
          for (const delta of RasterizationGrid.neighbor4Deltas) {
            const neighbor = grid.get(cell.x + delta.x, cell.y + delta.y);
            if (neighbor.hasRegion()) {
              if (neighbor.distanceToObstacle + 2 < regionCenterDist) {
                //TODO check if conservative expansion is needed
                cellRegion = neighbor.regionID;
                regionCenterDist = neighbor.distanceToObstacle + 2;
              }
            }
          }
          if (cellRegion !== RasterizationCell.NULL_REGION_ID) {
            cells[index] = null;
            cell.regionID = cellRegion;
            cell.distanceToObstacle = regionCenterDist;
          } else {
            skipped++;
          }
        }
      }
    }

    private static floodNewRegion(
      grid: RasterizationGrid,
      rootCell: RasterizationCell,
      fillToDist: integer,
      regionID: integer,
      workingStack: Array<RasterizationCell>
    ) {
      workingStack.length = 0;
      workingStack.push(rootCell);
      rootCell.regionID = regionID;
      rootCell.distanceToRegionCore = 0;

      let regionSize = 0;
      let cell: RasterizationCell | undefined;
      while ((cell = workingStack.pop())) {
        let isOnRegionBorder = false;
        for (const delta of RasterizationGrid.neighbor8Deltas) {
          const neighbor = grid.get(cell.x + delta.x, cell.y + delta.y);
          isOnRegionBorder =
            neighbor.regionID !== RasterizationCell.NULL_REGION_ID &&
            neighbor.regionID !== regionID;
          if (isOnRegionBorder) break;
        }
        if (isOnRegionBorder) {
          cell.regionID = RasterizationCell.NULL_REGION_ID;
          continue;
        }
        regionSize++;

        for (const delta of RasterizationGrid.neighbor4Deltas) {
          const neighbor = grid.get(cell.x + delta.x, cell.y + delta.y);

          if (
            neighbor != null &&
            neighbor.distanceToObstacle >= fillToDist &&
            neighbor.regionID === 0
          ) {
            neighbor.regionID = regionID;
            neighbor.distanceToRegionCore = 0;
            workingStack.push(neighbor);
          }
        }
      }
      return regionSize > 0;
    }

    private static firstPassDeltas = [
      { x: -1, y: 0, distance: 2 },
      { x: -1, y: -1, distance: 3 },
      { x: 0, y: -1, distance: 2 },
      { x: 1, y: -1, distance: 3 },
    ];
    private static secondPassDeltas = [
      { x: 1, y: 0, distance: 2 },
      { x: 1, y: 1, distance: 3 },
      { x: 0, y: 1, distance: 2 },
      { x: -1, y: 1, distance: 3 },
    ];

    //TODO implement the smoothing pass on the distance field?
    static generateDistanceField(grid: RasterizationGrid) {
      // close borders
      for (let x = 0; x < grid.dimX(); x++) {
        const leftCell = grid.get(x, 0);
        if (!leftCell.isObstacle()) {
          grid.get(x, 0).setObstacle();
        }
        const rightCell = grid.get(x, grid.dimY() - 1);
        if (!rightCell.isObstacle()) {
          rightCell.setObstacle();
        }
      }
      for (let y = 1; y < grid.dimY() - 1; y++) {
        const topCell = grid.get(0, y);
        if (!topCell.isObstacle()) {
          topCell.setObstacle();
        }
        const bottomCell = grid.get(grid.dimX() - 1, y);
        if (!bottomCell.isObstacle()) {
          bottomCell.setObstacle();
        }
      }
      // 1st pass
      for (let y = 1; y < grid.dimY() - 1; y++) {
        for (let x = 1; x < grid.dimX() - 1; x++) {
          const cell = grid.get(x, y);
          for (const delta of RegionGenerator.firstPassDeltas) {
            const distanceByNeighbor =
              grid.get(x + delta.x, y + delta.y).distanceToObstacle +
              delta.distance;
            if (cell.distanceToObstacle > distanceByNeighbor) {
              cell.distanceToObstacle = distanceByNeighbor;
            }
          }
        }
      }
      // 2nd pass
      for (let y = grid.dimY() - 2; y >= 1; y--) {
        for (let x = grid.dimX() - 2; x >= 1; x--) {
          const cell = grid.get(x, y);
          for (const delta of RegionGenerator.secondPassDeltas) {
            const distanceByNeighbor =
              grid.get(x + delta.x, y + delta.y).distanceToObstacle +
              delta.distance;
            if (cell.distanceToObstacle > distanceByNeighbor) {
              cell.distanceToObstacle = distanceByNeighbor;
            }
          }
        }
      }
    }
  }

  export class ObstacleRasterizer {
    static rasterizeObstacles(
      grid: RasterizationGrid,
      obstacles: RuntimeObject[]
    ) {
      const workingNodes: number[] = [];
      //TODO check the accuracy. Is a grid alined rectangle overstepped?
      for (const obstacle of obstacles) {
        for (const polygon of obstacle.getHitBoxes()) {
          const vertices = polygon.vertices.map((vertex) => {
            const point = { x: vertex[0], y: vertex[1] };
            grid.convertToGridBasis(point, point);
            return point;
          });
          let minX = Number.MAX_VALUE;
          let maxX = -Number.MAX_VALUE;
          let minY = Number.MAX_VALUE;
          let maxY = -Number.MAX_VALUE;
          for (const vertex of vertices) {
            minX = Math.min(minX, vertex.x);
            maxX = Math.max(maxX, vertex.x);
            minY = Math.min(minY, vertex.y);
            maxY = Math.max(maxY, vertex.y);
          }
          minX = Math.max(minX, 0);
          maxX = Math.min(maxX, grid.dimX());
          minY = Math.max(minY, 0);
          maxY = Math.min(maxY, grid.dimY());
          ObstacleRasterizer.fillPolygon(
            vertices,
            minX,
            maxX,
            minY,
            maxY,
            workingNodes,
            (x: integer, y: integer) => grid.get(x, y).setObstacle()
          );
        }
      }
    }

    private static fillPolygon(
      vertices: Point[],
      mixX: integer,
      maxX: integer,
      minY: integer,
      maxY: integer,
      workingNodes: number[],
      fill: (x: number, y: number) => void
    ) {
      // Scan-line polygon fill algorithm
      // strongly inspired from:
      // http://alienryderflex.com/polygon_fill/

      //  Loop through the rows of the image.
      for (let pixelY = minY; pixelY < maxY; pixelY++) {
        //  Build a list of nodes.
        workingNodes.length = 0;
        let j = vertices.length - 1;
        for (let i = 0; i < vertices.length; i++) {
          if (
            (vertices[i].y < pixelY && vertices[j].y >= pixelY) ||
            (vertices[j].y < pixelY && vertices[i].y >= pixelY)
          ) {
            workingNodes.push(
              Math.floor(
                vertices[i].x +
                  ((pixelY - vertices[i].y) / (vertices[j].y - vertices[i].y)) *
                    (vertices[j].x - vertices[i].x)
              )
            );
          }
          j = i;
        }

        //  Sort the nodes, via a simple “Bubble” sort.
        {
          let i = 0;
          while (i < workingNodes.length - 1) {
            if (workingNodes[i] > workingNodes[i + 1]) {
              const swap = workingNodes[i];
              workingNodes[i] = workingNodes[i + 1];
              workingNodes[i + 1] = swap;
              if (i > 0) i--;
            } else {
              i++;
            }
          }
        }

        //  Fill the pixels between node pairs.
        for (let i = 0; i < workingNodes.length; i += 2) {
          if (workingNodes[i] >= maxX) break;
          if (workingNodes[i + 1] > mixX) {
            if (workingNodes[i] < mixX) {
              workingNodes[i] = mixX;
            }
            if (workingNodes[i + 1] > maxX) {
              workingNodes[i + 1] = maxX;
            }
            for (
              let pixelX = workingNodes[i];
              pixelX < workingNodes[i + 1];
              pixelX++
            )
              fill(Math.floor(pixelX), Math.floor(pixelY));
          }
        }
      }
    }
  }

  class Geometry {
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
    public static segmentsIntersect(
      ax: integer,
      ay: integer,
      bx: integer,
      by: integer,
      cx: integer,
      cy: integer,
      dx: integer,
      dy: integer
    ): boolean {
      /*
       * This is modified 2D line-line intersection/segment-segment
       * intersection test.
       */

      const deltaABx = bx - ax;
      const deltaABy = by - ay;
      const deltaCAx = ax - cx;
      const deltaCAy = ay - cy;
      const deltaCDx = dx - cx;
      const deltaCDy = dy - cy;

      const numerator = deltaCAy * deltaCDx - deltaCAx * deltaCDy;
      const denominator = deltaABx * deltaCDy - deltaABy * deltaCDx;

      // Perform early exit tests.
      if (denominator == 0 && numerator != 0) {
        // If numerator is zero, then the lines are colinear.
        // Since it isn't, then the lines must be parallel.
        return false;
      }

      // Lines intersect.  But do the segments intersect?

      // Forcing float division on both of these via casting of the
      // denominator.
      const factorAB = numerator / denominator;
      const factorCD =
        (deltaCAy * deltaABx - deltaCAx * deltaABy) / denominator;

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

    /**
     * Returns the distance squared from the point to the line segment.
     * <p>Behavior is undefined if the the closest distance is outside the
     * line segment.</p>
     * @param px The x-value of point (px, py).
     * @param py The y-value of point (px, py)
     * @param ax The x-value of the line segment's vertex A.
     * @param ay The y-value of the line segment's vertex A.
     * @param bx The x-value of the line segment's vertex B.
     * @param by The y-value of the line segment's vertex B.
     * @return The distance squared from the point (px, py) to line segment AB.
     */
    public static getPointSegmentDistanceSq(
      px: float,
      py: float,
      ax: float,
      ay: float,
      bx: float,
      by: float
    ): float {
      /*
       * Reference: http://local.wasp.uwa.edu.au/~pbourke/geometry/pointline/
       *
       * The goal of the algorithm is to find the point on line segment AB
       * that is closest to P and then calculate the distance between P
       * and that point.
       */

      const deltaABx = bx - ax;
      const deltaABy = by - ay;
      const deltaAPx = px - ax;
      const deltaAPy = py - ay;

      const segmentABLengthSq = deltaABx * deltaABx + deltaABy * deltaABy;

      if (segmentABLengthSq == 0)
        // AB is not a line segment.  So just return
        // distanceSq from P to A
        return deltaAPx * deltaAPx + deltaAPy * deltaAPy;

      const u = (deltaAPx * deltaABx + deltaAPy * deltaABy) / segmentABLengthSq;

      if (u < 0)
        // Closest point on line AB is outside outside segment AB and
        // closer to A. So return distanceSq from P to A.
        return deltaAPx * deltaAPx + deltaAPy * deltaAPy;
      else if (u > 1)
        // Closest point on line AB is outside segment AB and closer to B.
        // So return distanceSq from P to B.
        return (px - bx) * (px - bx) + (py - by) * (py - by);

      // Closest point on lineAB is inside segment AB.  So find the exact
      // point on AB and calculate the distanceSq from it to P.

      // The calculation in parenthesis is the location of the point on
      // the line segment.
      const deltaX = ax + u * deltaABx - px;
      const deltaY = ay + u * deltaABy - py;

      return deltaX * deltaX + deltaY * deltaY;
    }
  }
}
