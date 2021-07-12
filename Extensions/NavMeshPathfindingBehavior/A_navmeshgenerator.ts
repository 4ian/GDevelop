// Strongly inspired from http://www.critterai.org/projects/nmgen_study/

namespace gdjs {
  export class RasterizationCell {
    static NULL_REGION_ID = 0;

    x: integer;
    y: integer;
    isObstacle: boolean = false;
    distanceToObstacle: integer = Number.MAX_VALUE;
    regionID: integer = RasterizationCell.NULL_REGION_ID;
    distanceToRegionCore: integer = 0;
    contourFlags: integer = 0;

    constructor(x: integer, y: integer) {
      this.x = x;
      this.y = y;
    }

    setObstacle() {
      this.isObstacle = true;
      this.distanceToObstacle = 0;
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

    convertToGridBasis(position: FloatPoint, gridPosition: FloatPoint) {
      gridPosition[0] = (position[0] - this.originX) / this.cellSize;
      gridPosition[1] = (position[1] - this.originY) / this.cellSize;
      return gridPosition;
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
  }

  export type ContourPoint = { x: integer; y: integer; region: integer };

  type PolyMergeResult = {
    lengthSq: integer;
    indexA: integer;
    indexB: integer;
  };

  export type PolyMeshField = { verts: Point[]; polys: integer[][] };

  export class NavMeshGenerator {
    /**
     * Builds a convex polygon mesh from the provided contour set.
     * <p>This build algorithm will fail and return null if the
     * ContourSet contains any single contour with more than
     * 0x0fffffff vertices.
     * @param contours A properly populated contour set.
     * @return The result of the build operation.
     */
    public static buildMesh(
      contours: ContourPoint[][],
      mMaxVertsPerPoly: integer
    ): PolyMeshField {
      // Number of vertices found in the source.
      let sourceVertCount = 0;

      // The maximum possible number of polygons assuming that all will
      // be triangles.
      let maxPossiblePolygons = 0;

      // The maximum vertices found in a single contour.
      let maxVertsPerContour = 0;

      // Loop through all contours.  Determine the values for the
      // variables above.
      for (const contour of contours) {
        const count = contour.length;
        sourceVertCount += count;
        maxPossiblePolygons += count - 2;
        maxVertsPerContour = Math.max(maxVertsPerContour, count);
      }

      /*
       * Holds the unique vertices found during triangulation.
       * This array is sized to hold the maximum possible vertices.
       * The actual number of vertices will be smaller due to duplication
       * in the source contours.
       */
      const globalVerts = new Array<Point>(sourceVertCount);
      globalVerts.length = 0;

      /*
       * Holds polygon indices.
       *
       * The array is sized to hold the maximum possible polygons.
       * The actual number will be significantly smaller once polygons
       * are merged.
       *
       * Where mvpp = maximum vertices per polygon:
       *
       * Each polygon entry is mvpp. The first instance of NULL_INDEX means
       * the end of poly indices.
       *
       * Example: If nvp = 6 and the the polygon has 4 vertices ->
       * (1, 3, 4, 8, NULL_INDEX, NULL_INDEX)
       * then (1, 3, 4, 8) defines the polygon.
       */
      const globalPolys = new Array<integer[]>(maxPossiblePolygons);
      globalPolys.length = 0;

      /*
       * Holds information that allows mapping of contour vertex indices to
       * shared vertex indices.  (i.e. Index of vertex in contour.verts[]
       * to index of vertex in within this operation.)
       *
       * index (key): The original vertex index of the contour.
       * value in array: The vertex index in the shared vertex array.
       *
       * This is a working variable whose content is meaningless between
       * iterations. It will contain cross-iteration trash.  But that is
       * OK because of the way the array is used.  (I.e. Trash data left
       * over from a previous iteration  will never be accessed in the
       * current iteration.)
       */
      const contourToGlobalIndicesMap = new Array<integer>(maxVertsPerContour);

      /*
       * Key = Hash representing a unique vertex location.
       * Value = The index of the vertex in the global vertices array.
       * When a new vertex is found, it is added to the vertices array and
       * its global index stored in this hash table.  If a duplicate is
       * found, the value from this table is used.
       * There will always be duplicate vertices since different contours
       * are connected by these duplicate vertices.
       */
      const vertIndices = new Map<integer, integer>();

      // Each list is initialized to a size that will minimize resizing.
      const workingIndices = new Array<integer>(maxVertsPerContour);
      workingIndices.length = 0;
      const workingIndiceFlags = new Array<boolean>(maxVertsPerContour);
      workingIndiceFlags.length = 0;
      const workingTriangles = new Array<integer>(maxVertsPerContour);
      workingTriangles.length = 0;

      // Various working variables.
      // (Values are meaningless outside of the iteration.)
      const workingPolys = new Array<integer[]>(maxVertsPerContour + 1);
      workingPolys.length = 0;
      const mergeInfo: PolyMergeResult = {
        lengthSq: -1,
        indexA: -1,
        indexB: -1,
      };
      const mergedPoly = new Array<integer>(mMaxVertsPerPoly);
      mergedPoly.length = 0;

      // Process all contours.
      //const contour = contours[0];
      for (const contour of contours)
      {
        if (contour.length < 3) {
          // This indicates a problem with contour creation
          // since the contour builder should detect for this.
          console.error(
            'Polygon generation failure: Contour has ' +
              'too few vertices. Bad input data.'
          );
          //continue;
        }

        // Create working indices for the contour vertices.
        workingIndices.length = 0;
        for (let index = 0; index < contour.length; index++) {
          workingIndices.push(index);
        }

        // Triangulate the contour.
        const triangleCount = NavMeshGenerator.triangulate(
          contour,
          workingIndices,
          workingIndiceFlags,
          workingTriangles
        );

        if (triangleCount <= 0) {
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
          //continue;
        }

        /*
         * Loop through the vertices in this contour.
         * For new vertices (not seen in previous contours) get a new
         * index and add it to the global vertices array.
         */
        for (
          let iContourVert = 0;
          iContourVert < contour.length;
          iContourVert++
        ) {
          const contourVert = contour[iContourVert];
          const vertHash = NavMeshGenerator.getHashCode(contourVert);
          let iGlobalVert = vertIndices.get(vertHash);
          if (iGlobalVert == null) {
            // This is the first time this vertex has been seen.
            // Assign it an index and add it to the vertex array.
            iGlobalVert = globalVerts.length;
            vertIndices.set(vertHash, iGlobalVert);
            globalVerts.push(contourVert);
            console.log("new: " + contourVert.x + " " + contourVert.y);
          }
          else {
            console.log("exist: " + contourVert.x + " " + contourVert.y);
          }
          // Creat the map entry.  Contour vertex index -> global
          // vertex index.
          contourToGlobalIndicesMap[iContourVert] = iGlobalVert;
        }

        // Initialize the working polygon array.
        workingPolys.length = 0;

        // Load the triangles into to the working polygon array, updating
        // indices in the process.
        for (let i = 0; i < triangleCount; i++) {
          /*
           * The working triangles list contains vertex index data
           * from the contour. The working polygon array needs the
           * global vertex index. So the indices mapping array created
           * above is used to do  the conversion.
           */
          const workingPoly = new Array<integer>(mMaxVertsPerPoly);
          workingPoly.length = 0;
          workingPoly.push(contourToGlobalIndicesMap[workingTriangles[i * 3]]);
          workingPoly.push(contourToGlobalIndicesMap[workingTriangles[i * 3 + 1]]);
          workingPoly.push(contourToGlobalIndicesMap[workingTriangles[i * 3 + 2]]);
          workingPolys.push(workingPoly);
        }

        if (mMaxVertsPerPoly > 3) {
          // Merging of triangles into larger polygons is permitted.
          // Continue until no polygons can be found to merge.
          // http://www.critterai.org/nmgen_polygen#mergepolys
          while (true) {
            let longestMergeEdge = -1;
            let pBestPolyA = -1;
            let iPolyAVert = -1; // Start of the shared edge.
            let pBestPolyB = -1;
            let iPolyBVert = -1; // Start of the shared edge.

            // Loop through all but the last polygon looking for the
            // best polygons to merge in this iteration.
            for (let iPolyA = 0; iPolyA < workingPolys.length - 1; iPolyA++) {
              for (
                let iPolyB = iPolyA + 1;
                iPolyB < workingPolys.length;
                iPolyB++
              ) {
                // Can polyB merge with polyA?
                NavMeshGenerator.getPolyMergeInfo(
                  iPolyA,
                  iPolyB,
                  workingPolys,
                  globalVerts,
                  mMaxVertsPerPoly,
                  mergeInfo
                );
                if (mergeInfo.lengthSq > longestMergeEdge) {
                  // polyB has the longest shared edge with
                  // polyA found so far. Save the merge
                  // information.
                  longestMergeEdge = mergeInfo.lengthSq;
                  pBestPolyA = iPolyA;
                  iPolyAVert = mergeInfo.indexA;
                  pBestPolyB = iPolyB;
                  iPolyBVert = mergeInfo.indexB;
                }
              }
            }

            console.log("longestMergeEdge: " + longestMergeEdge);

            if (longestMergeEdge <= 0)
              // No valid merges found during this iteration.
              break;

            // Found polygons to merge.  Perform the merge.

            // Prepare the merged polygon array.
            mergedPoly.length = 0;

            // Get the size of each polygon.
            const vertCountA = workingPolys[pBestPolyA].length;
            const vertCountB = workingPolys[pBestPolyB].length;
            let position = 0;

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
            for (let i = 0; i < vertCountA - 1; i++)
              mergedPoly[position++] =
                workingPolys[pBestPolyA][(iPolyAVert + 1 + i) % vertCountA];
            for (let i = 0; i < vertCountB - 1; i++)
              mergedPoly[position++] =
                workingPolys[pBestPolyB][(iPolyBVert + 1 + i) % vertCountB];

console.log("mergedPoly.length: " + mergedPoly.length);

            // Copy the merged polygon over the top of polygon A.
            workingPolys[pBestPolyA].length = 0;
            Array.prototype.push.apply(workingPolys[pBestPolyA], mergedPoly);
            // Remove polygon B by shifting all information to the
            // left by one polygon,  starting at polygon B.
            workingPolys.splice(pBestPolyB, 1);
          }
        }

        // Polygon creation for this contour is complete.
        // Add polygons to the global polygon array and store region
        // information.
        Array.prototype.push.apply(globalPolys, workingPolys);
      }

      /*
       * Transfer global array information into instance fields.
       * Could have loaded data directly into instance fields and saved this
       * processing cost.  But this method has memory benefits since it is
       * not necessary to oversize the instance arrays.
       */

      // Transfer vertex data.
      const resultVerts = new Array<Point>(globalVerts.length);
      resultVerts.length = 0;
      Array.prototype.push.apply(resultVerts, globalVerts);

      /*
       * Transfer polygon indices data.
       *
       * The global polygon array is half the size of the instance polygon
       * array since the instance polygon array also contains edge adjacency
       * information. So array copy can't be used.
       *
       * Instead, copy the global polygon array over to instance polygon
       * array in blocks and initialize the instance polygon array's
       * adjacency information.
       */
      const resultPolys = new Array<integer[]>(globalPolys.length);
      resultPolys.length = 0;
      Array.prototype.push.apply(resultPolys, globalPolys);

      // Construct the result object.
      const result: PolyMeshField = { verts: resultVerts, polys: resultPolys };

      // Build polygon adjacency information.
      //TODO buildAdjacencyData(result);

      return result;
    }

    /**
     * Provides a hash value unique to the combination of values.
     * @param x  The vertices x-value. (x, y, z)
     * @param y  The vertices y-value. (x, y, z)
     * @param z  The vertices z-value. (x, y, z)
     * @return A hash that is unique to the vertex.
     */
    private static getHashCode(point: Point): integer {
      /*
       * Note: Tried the standard eclipse hash generation method.  But
       * it resulted in non-unique hash values during testing.  Switched
       * to this method.
       * Hex values are arbitrary prime numbers.
       */
      return 0x8da6b343 * point.x + 0xd8163841 * point.y;
    }

    /**
     * Checks two polygons to see if they can be merged.  If a merge is
     * allowed, provides data via the outResult argument.
     * <p>outResult will be an array of size 3 with the following
     * information:</p>
     * <p>0: The lengthSq of the edge shared between the polygons.<br/>
     * 1: The index (not pointer) of the start of the shared edge in
     *    polygon A.<br/>
     * 2: The index (not pointer) of the start of the shared edge in
     *    polygon B.<br/>
     * </p>
     * <p>A value of -1 at index zero indicates one of the following:</p>
     * <ul>
     * <li>The polygons cannot be merged because they would contain too
     * many vertices.</li>
     * <li>The polygons do not have a shared edge.</li>
     * <li>Merging the polygons would result in a concave polygon.</li>
     * </ul>
     * <p>To convert the values at indices 1 and 2 to pointers:
     * (polyPointer + value)</p>
     * @param polyAPointer The pointer to the start of polygon A in the
     * polys argument.
     * @param polyBPointer The pointer to the start of polygon B in the
     * polys argument.
     * @param polys An array of polygons in the form:
     * (vert1, vert2, vert3, ..., vertN, NULL_INDEX).
     * The null index terminates every polygon.  This permits polygons
     * with different vertex counts.
     * @param verts  The vertex data associated with the polygons.
     * @param outResult An array of size three which contains merge information.
     */
    private static getPolyMergeInfo(
      // TODO get ride of the indexes and use Point references directly
      polyAPointer: integer,
      polyBPointer: integer,
      polys: integer[][],
      verts: Point[],
      maxVertsPerPoly: integer,
      outResult: PolyMergeResult
    ): void {
      outResult.lengthSq = -1; // Default to invalid merge
      outResult.indexA = -1;
      outResult.indexB = -1;

      const vertCountA = polys[polyAPointer].length;
      const vertCountB = polys[polyBPointer].length;

      // If the merged polygon would would have to many vertices, do not
      // merge. Subtracting two since to take into account the effect of
      // a merge.
      if (vertCountA + vertCountB - 2 > maxVertsPerPoly) return;

      /*
       * Check if the polygons share an edge.
       *
       * Loop through all of vertices for polygonA and extract its edge.
       * (vertA -> vertANext) Then loop through all vertices for polygonB
       * and check to see if any of its edges use the same vertices as
       * polygonA.
       */
      for (let iPolyVertA = 0; iPolyVertA < vertCountA; iPolyVertA++) {
        // Get the vertex indices for the polygonA edge
        const iVertA = polys[polyAPointer][iPolyVertA];
        const iVertANext = polys[polyAPointer][(iPolyVertA + 1) % vertCountA];
        // Search polygonB for matches.
        for (let iPolyVertB = 0; iPolyVertB < vertCountB; iPolyVertB++) {
          // Get the vertex indices for the polygonB edge.
          const iVertB = polys[polyBPointer][iPolyVertB];
          const iVertBNext = polys[polyBPointer][(iPolyVertB + 1) % vertCountB];
          if (iVertA === iVertBNext && iVertANext === iVertB) {
            // The vertex indices for this edge are the same and
            // sequenced in opposite order.  So the edge is shared.
            outResult.indexA = iPolyVertA;
            outResult.indexB = iPolyVertB;
          }
        }
      }

      if (outResult.indexA == -1)
        // No common edge, cannot merge.
        return;

      /*
       * Check to see if the merged polygon would be convex.
       *
       * Gets the vertices near the section where the merge would occur.
       * Do they form a concave section?  If so, the merge is invalid.
       *
       * Note that the following algorithm is only valid for clockwise
       * wrapped convex polygons.
       */

      let sharedVertMinus =
        verts[
          polys[polyAPointer][(outResult.indexA - 1 + vertCountA) % vertCountA]
        ];
      let sharedVert = verts[polys[polyAPointer][outResult.indexA]];
      let sharedVertPlus =
        verts[polys[polyBPointer][(outResult.indexB + 2) % vertCountB]];
      if (
        !NavMeshGenerator.isLeft(
          sharedVert.x,
          sharedVert.y,
          sharedVertMinus.x,
          sharedVertMinus.y,
          sharedVertPlus.x,
          sharedVertPlus.y
        )
      )
        /*
         * The shared vertex (center) is not to the left of segment
         * vertMinus->vertPlus.  For a clockwise wrapped polygon, this
         * indicates a concave section.  Merged polygon would be concave.
         * Invalid merge.
         */
        return;

      sharedVertMinus =
        verts[
          polys[polyBPointer][(outResult.indexB - 1 + vertCountB) % vertCountB]
        ];
      sharedVert = verts[polys[polyBPointer][outResult.indexB]];
      sharedVertPlus =
        verts[polys[polyAPointer][(outResult.indexA + 2) % vertCountA]];
      if (
        !NavMeshGenerator.isLeft(
          sharedVert.x,
          sharedVert.y,
          sharedVertMinus.x,
          sharedVertMinus.y,
          sharedVertPlus.x,
          sharedVertPlus.y
        )
      )
        /*
         * The shared vertex (center) is not to the left of segment
         * vertMinus->vertPlus.  For a clockwise wrapped polygon, this
         * indicates a concave section.  Merged polygon would be concave.
         * Invalid merge.
         */
        return;

      // Get the vertex indices that form the shared edge.
      sharedVertMinus = verts[polys[polyAPointer][outResult.indexA]];
      sharedVert =
        verts[polys[polyAPointer][(outResult.indexA + 1) % vertCountA]];

      // Store the lengthSq of the shared edge.
      const deltaX = sharedVertMinus.x - sharedVert.x;
      const deltaZ = sharedVertMinus.y - sharedVert.y;
      outResult.lengthSq = deltaX * deltaX + deltaZ * deltaZ;
    }

    /**
     * Attempts to triangluate a polygon.
     * <p>Assumes the verts and indices arguments define a valid simple
     * (concave or convex) polygon
     * with vertices wrapped clockwise. Otherwise behavior is undefined.</p>
     * @param verts The vertices that make up the polygon in the format
     * (x, y, z, id).  The value stored at the id position is not relevant to
     * this operation.
     * @param inoutIndices    A working array of indices that define the
     * polygon to be triangluated.  The content is manipulated during the
     * operation and it will be left in an undefined state at the end of
     * the operation. (I.e. Its content will no longer be of any use.)
     * @param outTriangles  The indices which define the triangles derived
     * from the original polygon in the form
     * (t1a, t1b, t1c, t2a, t2b, t2c, ..., tna, tnb, tnc).  The original
     * content of this argument is discarded prior to use.
     * @return The number of triangles generated.  Or, if triangluation
     * failed, a negative number.
     */
    private static triangulate(
      verts: Point[],
      inoutIndices: Array<integer>,
      inoutIndiceFlags: Array<boolean>,
      outTriangles: Array<integer>
    ): integer {
      outTriangles.length = 0;

      /*
       * Terminology, concepts and such:
       *
       * This algorithm loops around the edges of a polygon looking for
       * new internal edges to add that will partition the polygon into a
       * new valid triangle internal to the starting polygon. During each
       * iteration the shortest potential new edge is selected to form that
       * iteration's new triangle.
       *
       * Triangles will only be formed if a single new edge will create
       * a triangle.  Two new edges will never be added during a single
       * iteration.  This means that the triangulated portions of the
       * original polygon will only contain triangles and the only
       * non-triangle polygon will exist in the untrianglulated portion
       * of the original polygon.
       *
       * "Partition edge" refers to a potential new edge that will form a
       * new valid triangle.
       *
       * "Center" vertex refers to the vertex in a potential new triangle
       * which, if the triangle is formed, will be external to the
       * remaining untriangulated portion of the polygon.  Since it
       * is now external to the polygon, it can't be used to form any
       * new triangles.
       *
       * Some documentation refers to "iPlus2" even though the variable is
       * not in scope or does not exist for that section of code. For
       * documentation purposes, iPlus2 refers to the 2nd vertex after the
       * primary vertex.
       * E.g.: i, iPlus1, and iPlus2.
       *
       * Visualizations: http://www.critterai.org/nmgen_polygen#triangulation
       */

      // Loop through all vertices, flagging all indices that represent
      // a center vertex of a valid new triangle.
      for (let i = 0; i < inoutIndices.length; i++) {
        const iPlus1 = (i + 1) % inoutIndices.length;
        const iPlus2 = (i + 2) % inoutIndices.length;
        // A triangle formed by i, iPlus1, and iPlus2 will result
        // in a valid internal triangle.
        // Flag the center vertex (iPlus1) to indicate a valid triangle
        // location.
        inoutIndiceFlags[iPlus1] = NavMeshGenerator.isValidPartition(
          i,
          iPlus2,
          verts,
          inoutIndices
        );
      }

      /*
       * Loop through the vertices creating triangles. When there is only a
       * single triangle left,  the operation is complete.
       *
       * When a valid triangle is formed, remove its center vertex.  So for
       * each loop, a single vertex will be removed.
       *
       * At the start of each iteration the indices list is in the following
       * state:
       * - Represents a simple polygon representing the un-triangulated
       *   portion of the original polygon.
       * - All valid center vertices are flagged.
       */
      while (inoutIndices.length > 3) {
        // Find the shortest new valid edge.

        // The minimum length found.
        let minLengthSq = Number.MAX_VALUE;
        // The index for the start of the minimum length edge.
        let iMinLengthSqVert = -1;

        // NOTE: i and iPlus1 are defined in two different scopes in
        // this section. So be careful.

        // Loop through all indices in the remaining polygon.
        for (let i = 0; i < inoutIndices.length; i++) {
          if (inoutIndiceFlags[(i + 1) % inoutIndices.length]) {
            // Indices i, iPlus1, and iPlus2 are known to form a
            // valid triangle.
            const vert = inoutIndices[i];
            const vertPlus2 = inoutIndices[(i + 2) % inoutIndices.length];

            // Determine the length of the partition edge.
            // (i -> iPlus2)
            const deltaX = verts[vertPlus2].x - verts[vert].x;
            const deltaZ = verts[vertPlus2].y - verts[vert].y;
            const lengthSq = deltaX * deltaX + deltaZ * deltaZ;

            if (lengthSq < minLengthSq) {
              // This is either the first valid new edge, or an edge
              // that is shorter than others previously found.
              // Select it.
              minLengthSq = lengthSq;
              iMinLengthSqVert = i;
            }
          }
        }

        if (iMinLengthSqVert === -1)
          /*
           * Could not find a new triangle.  Triangulation failed.
           * This happens if there are three or more vertices
           * left, but none of them are flagged as being a
           * potential center vertex.
           */
          return -outTriangles.length / 3;

        let i = iMinLengthSqVert;
        let iPlus1 = (i + 1) % inoutIndices.length;

        // Add the new triangle to the output.
        outTriangles.push(inoutIndices[i]);
        outTriangles.push(inoutIndices[iPlus1]);
        outTriangles.push(inoutIndices[(i + 2) % inoutIndices.length]);

        /*
         * iPlus1, the "center" vert in the new triangle, is now external
         * to the untriangulated portion of the polygon.  Remove it from
         * the indices list since it cannot be a member of any new
         * triangles.
         */
        inoutIndices.splice(iPlus1, 1);

        if (iPlus1 == 0 || iPlus1 >= inoutIndices.length) {
          /*
           * The vertex removal has invalidated iPlus1 and/or i.  So
           * force a wrap, fixing the indices so they reference the
           * correct indices again. This only occurs when the new
           * triangle is formed across the wrap location of the polygon.
           * Case 1: i = 14, iPlus1 = 15, iPlus2 = 0
           * Case 2: i = 15, iPlus1 = 0, iPlus2 = 1;
           */
          i = inoutIndices.length - 1;
          iPlus1 = 0;
        }

        /*
         *  At this point i and iPlus1 refer to the two indices from a
         * successful triangluation that will be part of another new
         * triangle.  We now need to re-check these indices to see if they
         * can now be the center index in a potential new partition.
         */
        inoutIndiceFlags[i] = NavMeshGenerator.isValidPartition(
          (i - 1 + inoutIndices.length) % inoutIndices.length,
          iPlus1,
          verts,
          inoutIndices
        );
        inoutIndiceFlags[iPlus1] = NavMeshGenerator.isValidPartition(
          i,
          (i + 2) % inoutIndices.length,
          verts,
          inoutIndices
        );
      }

      // Only 3 vertices remain.
      // Add their triangle to the output list.
      outTriangles.push(inoutIndices[0]);
      outTriangles.push(inoutIndices[1]);
      outTriangles.push(inoutIndices[2]);

      return outTriangles.length / 3;
    }

    /**
     * Returns TRUE if the line segment formed by vertex A and vertex B will
     * form a valid partition of the polygon.
     * <p>I.e. New line segment AB is internal to the polygon and will not
     * cross existing line segments.</p>
     * <p>The test is only performed on the xz-plane.</p>
     * <p>Assumptions:</p>
     * <ul>
     * <li>The vertices and indices arguments define a valid simple polygon
     * with vertices wrapped clockwise.</li>
     * <li>indexA != indexB</li>
     * </ul>
     * <p>Behavior is undefined if the arguments to not meet these
     * assumptions</p>
     * @param indexA A polygon index of a vertex that will form segment AB.
     * @param indexB A polygon index of a vertex that will form segment AB.
     * @param verts The vertices array in the form (x, y, z, id).  The value
     * stored at the id position is not relevant to this operation.
     * @param indices A simple polygon wrapped clockwise.
     * @return TRUE if the line segment formed by vertex A and vertex B will
     * form a valid partition of the polygon.  Otherwise false.
     */
    private static isValidPartition(
      indexA: integer,
      indexB: integer,
      verts: Point[],
      indices: Array<integer>
    ): boolean {
      /*
       *  First check whether the segment AB lies within the internal
       *  angle formed at A. (This is the faster check.)
       *  If it does, then perform the more costly check.
       */
      return (
        NavMeshGenerator.liesWithinInternalAngle(
          indexA,
          indexB,
          verts,
          indices
        ) &&
        !NavMeshGenerator.hasIllegalEdgeIntersection(
          indexA,
          indexB,
          verts,
          indices
        )
      );
    }

    /**
     * Returns TRUE if vertex B lies within the internal angle of the polygon
     * at vertex A.
     *
     * <p>Vertex B does not have to be within the polygon border.  It just has
     * be be within the area encompassed by the internal angle formed at
     * vertex A.</p>
     *
     * <p>This operation is a fast way of determining whether a line segment
     * can possibly form a valid polygon partition.  If this test returns
     * FALSE, then more expensive checks can be skipped.</p>
     * <a href="http://www.critterai.org/nmgen_polygen#anglecheck"
     * >Visualizations</a>
     * <p>Special case:
     * FALSE is returned if vertex B lies directly on either of the rays
     * cast from vertex A along its associated polygon edges.  So the test
     * on vertex B is exclusive of the polygon edges.</p>
     * <p>The test is only performed on the xz-plane.</p>
     * <p>Assumptions:</p>
     * <ul>
     * <li>The vertices and indices arguments define a valid simple polygon
     * with vertices wrapped clockwise.</li>
     * <li>indexA != indexB</li>
     * </ul>
     * <p>Behavior is undefined if the arguments to not meet these
     * assumptions</p>
     * @param indexA An polygon index of a vertex that will form segment AB.
     * @param indexB An polygon index of a vertex that will form segment AB.
     * @param verts The vertices array in the form (x, y, z, id).  The value
     * stored at the id position is not relevant to this operation.
     * @param indices A simple polygon wrapped clockwise.
     * @return Returns TRUE if vertex B lies within the internal angle of
     * the polygon at vertex A.
     */
    private static liesWithinInternalAngle(
      indexA: integer,
      indexB: integer,
      verts: Point[],
      indices: Array<integer>
    ): boolean {
      // Get pointers to the main vertices being tested.
      const vertA = verts[indices[indexA]];
      const vertB = verts[indices[indexB]];

      // Get pointers to the vertices just before and just after vertA.
      const vertAMinus =
        verts[indices[(indexA - 1 + indices.length) % indices.length]];
      const vertAPlus = verts[indices[(indexA + 1) % indices.length]];

      /*
       * First, find which of the two angles formed by the line segments
       *  AMinus->A->APlus is internal to (pointing towards) the polygon.
       * Then test to see if B lies within the area formed by that angle.
       */

      // TRUE if A is left of or on line AMinus->APlus
      if (
        NavMeshGenerator.isLeftOrCollinear(
          vertA.x,
          vertA.y,
          vertAMinus.x,
          vertAMinus.y,
          vertAPlus.x,
          vertAPlus.y
        )
      )
        // The angle internal to the polygon is <= 180 degrees
        // (non-reflex angle).
        // Test to see if B lies within this angle.
        return (
          NavMeshGenerator.isLeft(
            // TRUE if B is left of line A->AMinus
            vertB.x,
            vertB.y,
            vertA.x,
            vertA.y,
            vertAMinus.x,
            vertAMinus.y
          ) &&
          // TRUE if B is right of line A->APlus
          NavMeshGenerator.isRight(
            vertB.x,
            vertB.y,
            vertA.x,
            vertA.y,
            vertAPlus.x,
            vertAPlus.y
          )
        );

      /*
       * The angle internal to the polygon is > 180 degrees (reflex angle).
       * Test to see if B lies within the external (<= 180 degree) angle and
       * flip the result.  (If B lies within the external angle, it can't
       * lie within the internal angle.)
       */
      return !(
        // TRUE if B is left of or on line A->APlus
        (
          NavMeshGenerator.isLeftOrCollinear(
            vertB.x,
            vertB.y,
            vertA.x,
            vertA.y,
            vertAPlus.x,
            vertAPlus.y
          ) &&
          // TRUE if B is right of or on line A->AMinus
          NavMeshGenerator.isRightOrCollinear(
            vertB.x,
            vertB.y,
            vertA.x,
            vertA.y,
            vertAMinus.x,
            vertAMinus.y
          )
        )
      );
    }

    /**
     * Returns TRUE if the line segment AB intersects any edges not already
     * connected to one of the two vertices.
     * <p>The test is only performed on the xz-plane.</p>
     * <p>Assumptions:</p>
     * <ul>
     * <li>The vertices and indices arguments define a valid simple polygon
     * with vertices wrapped clockwise.</li>
     * <li>indexA != indexB</li>
     * </ul>
     * <p>Behavior is undefined if the arguments to not meet these
     * assumptions</p>
     * @param indexA An polygon index of a vertex that will form segment AB.
     * @param indexB An polygon index of a vertex that will form segment AB.
     * @param verts The vertices array in the form (x, y, z, id).  The value
     * stored at the id position is not relevant to this operation.
     * @param indices A simplpe polygon wrapped clockwise.
     * @return TRUE if the line segment AB intersects any edges not already
     * connected to one of the two vertices.  Otherwise FALSE.
     */
    private static hasIllegalEdgeIntersection(
      indexA: integer,
      indexB: integer,
      verts: Point[],
      indices: Array<integer>
    ): boolean {
      // Get pointers to the primary vertices being tested.
      const vertA = verts[indices[indexA]];
      const vertB = verts[indices[indexB]];

      // Loop through the polygon edges.
      for (
        let iPolyEdgeBegin = 0;
        iPolyEdgeBegin < indices.length;
        iPolyEdgeBegin++
      ) {
        const iPolyEdgeEnd = (iPolyEdgeBegin + 1) % indices.length;
        if (
          !(
            iPolyEdgeBegin === indexA ||
            iPolyEdgeBegin === indexB ||
            iPolyEdgeEnd === indexA ||
            iPolyEdgeEnd === indexB
          )
        ) {
          // Neither of the test indices are endpoints of this edge.
          // Get pointers for this edge's verts.
          const edgeVertBegin = verts[indices[iPolyEdgeBegin]];
          const edgeVertEnd = verts[indices[iPolyEdgeEnd]];
          if (
            (edgeVertBegin.x === vertA.x && edgeVertBegin.y === vertA.y) ||
            (edgeVertBegin.x === vertB.x && edgeVertBegin.y === vertB.y) ||
            (edgeVertEnd.x === vertA.x && edgeVertEnd.y === vertA.y) ||
            (edgeVertEnd.x === vertB.x && edgeVertEnd.y === vertB.y)
          )
            /*
             * One of the test vertices is co-located on the xz plane
             * with one of the endpoints of this edge.  (This is a
             * test of the actual position of the verts rather than
             * simply the index check performed earlier.)
             * Skip this edge.
             */
            continue;

          /*
           * This edge is not connected to either of the test vertices.
           * If line segment AB intersects  with this edge, then the
           * intersection is illegal.
           * I.e. New edges cannot cross existing edges.
           */
          if (
            Geometry.segmentsIntersect(
              vertA.x,
              vertA.y,
              vertB.x,
              vertB.y,
              edgeVertBegin.x,
              edgeVertBegin.y,
              edgeVertEnd.x,
              edgeVertEnd.y
            )
          )
            return true;
        }
      }

      return false;
    }

    /**
     * Returns TRUE if point P is to the left of line AB when looking
     * from A to B.
     * @param px The x-value of the point to test.
     * @param py The y-value of the point to test.
     * @param ax The x-value of the point (ax, ay) that is point A on line AB.
     * @param ay The y-value of the point (ax, ay) that is point A on line AB.
     * @param bx The x-value of the point (bx, by) that is point B on line AB.
     * @param by The y-value of the point (bx, by) that is point B on line AB.
     * @return TRUE if point P is to the left of line AB when looking
     * from A to B.  Otherwise FALSE.
     */
    private static isLeft(
      px: integer,
      py: integer,
      ax: integer,
      ay: integer,
      bx: integer,
      by: integer
    ): boolean {
      return NavMeshGenerator.getSignedAreaX2(ax, ay, px, py, bx, by) < 0;
    }

    /**
     * Returns TRUE if point P is to the left of line AB when looking
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
      return NavMeshGenerator.getSignedAreaX2(ax, ay, px, py, bx, by) <= 0;
    }

    /**
     * Returns TRUE if point P is to the right of line AB when looking
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
      return NavMeshGenerator.getSignedAreaX2(ax, ay, px, py, bx, by) > 0;
    }

    /**
     * Returns TRUE if point P is to the right of or on line AB when looking
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
      return NavMeshGenerator.getSignedAreaX2(ax, ay, px, py, bx, by) >= 0;
    }

    /**
     * The absolute value of the returned value is two times the area of the
     * triangle defined by points (A, B, C).
     * <p>A positive value indicates:</p>
     * <ul>
     * <li>Counterclockwise wrapping of the points.</li>
     * <li>Point B lies to the right of line AC, looking from A to C.</li>
     * </ul>
     * <p>A negative value indicates:</p>
     * <ul>
     * <li>Clockwise wrapping of the points.</li>
     * <li>Point B lies to the left of line AC, looking from A to C.</li>
     * </ul>
     * <p>A value of zero indicates that all points are collinear or
     * represent the same point.</p>
     * <p>This is a fast operation.<p>
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
      /*
       * References:
       *
       * http://softsurfer.com/Archive/algorithm_0101/algorithm_0101.htm
       *                                                  #Modern%20Triangles
       * http://mathworld.wolfram.com/TriangleArea.html (Search for "signed".)
       *
       */
      return (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    }

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
            direction < NavMeshGenerator.neighbor4Deltas.length;
            direction++
          ) {
            const delta = NavMeshGenerator.neighbor4Deltas[direction];

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
          NavMeshGenerator.buildRawContours(
            grid,
            cell,
            startDir,
            workingRawVerts
          );
          console.log(
            workingRawVerts
              .map((point) => '(' + point.x + ' ' + point.y + ')')
              .join(', ')
          );
          // Perform post processing on the contour in order to
          // create the final, simplified contour.
          NavMeshGenerator.generateSimplifiedContour(
            cell.regionID,
            workingRawVerts,
            workingSimplifiedVerts
          );
          console.log(
            workingSimplifiedVerts
              .map((point) => '(' + point.x + ' ' + point.y + ')')
              .join(', ')
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
            NavMeshGenerator.leftVertexOfFacingCellBorderDeltas[direction];

          const neighbor = grid.get(
            cell.x + NavMeshGenerator.neighbor4Deltas[direction].x,
            cell.y + NavMeshGenerator.neighbor4Deltas[direction].y
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
            cell.x + NavMeshGenerator.neighbor4Deltas[direction].x,
            cell.y + NavMeshGenerator.neighbor4Deltas[direction].y
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

      NavMeshGenerator.matchObstacleRegionEdges(sourceVerts, outVerts);

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
            const deviation = NavMeshGenerator.getPointSegmentDistanceSq(
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
    private static getPointSegmentDistanceSq(
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

    static generateRegions(grid: RasterizationGrid) {
      const expandIterations: integer = 4;

      let floodedCells = new Array<RasterizationCell | null>(1024);
      let workingStack = new Array<RasterizationCell>(1024);

      let nextRegionID = 1;

      for (
        let distance = grid.obstacleDistanceMax();
        distance > 0;
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
            NavMeshGenerator.expandRegions(
              grid,
              floodedCells,
              expandIterations
            );
          } else {
            NavMeshGenerator.expandRegions(grid, floodedCells, -1);
          }
        }

        for (const floodedCell of floodedCells) {
          if (!floodedCell || floodedCell.hasRegion()) continue;

          const fillTo = Math.max(distance - 2, 0);
          if (
            NavMeshGenerator.floodNewRegion(
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
      //TODO check if cell without region remains or not
      //TODO check if post processing algorithms are necessary
    }

    private static neighbor4Deltas = [
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
    ];

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
          for (const delta of NavMeshGenerator.neighbor4Deltas) {
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

    private static neighbor8Deltas = [
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
    ];

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
        for (const delta of NavMeshGenerator.neighbor8Deltas) {
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

        for (const delta of NavMeshGenerator.neighbor4Deltas) {
          const neighbor = grid.get(cell.x + delta.x, cell.y + delta.y);

          if (
            neighbor != null &&
            neighbor.distanceToObstacle >= fillToDist &&
            neighbor.regionID == 0
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
        if (!leftCell.isObstacle) {
          grid.get(x, 0).setObstacle();
        }
        const rightCell = grid.get(x, grid.dimY() - 1);
        if (!rightCell.isObstacle) {
          rightCell.setObstacle();
        }
      }
      for (let y = 1; y < grid.dimY() - 1; y++) {
        const topCell = grid.get(0, y);
        if (!topCell.isObstacle) {
          topCell.setObstacle();
        }
        const bottomCell = grid.get(grid.dimX() - 1, y);
        if (!bottomCell.isObstacle) {
          bottomCell.setObstacle();
        }
      }
      // 1st pass
      for (let y = 1; y < grid.dimY() - 1; y++) {
        for (let x = 1; x < grid.dimX() - 1; x++) {
          const cell = grid.get(x, y);
          for (const delta of NavMeshGenerator.firstPassDeltas) {
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
          for (const delta of NavMeshGenerator.secondPassDeltas) {
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

    static rasterizeObstacles(
      grid: RasterizationGrid,
      obstacles: RuntimeObject[]
    ) {
      //TODO check the accuracy. Is a grid alined rectangle overstepped?
      let lineStart: FloatPoint = [0, 0];
      let lineEnd: FloatPoint = [0, 0];
      for (const obstacle of obstacles) {
        for (const polygon of obstacle.getHitBoxes()) {
          lineEnd = grid.convertToGridBasis(polygon.vertices[0], lineEnd);

          // used to fill after outline
          let upperX = Math.round(lineEnd[0]);
          let upperY = Math.round(lineEnd[1]);
          let lowerX = Math.round(lineEnd[0]);
          let lowerY = Math.round(lineEnd[1]);

          // outline the polygon
          for (let index = 1; index < polygon.vertices.length + 1; index++) {
            const swap = lineStart;
            lineStart = lineEnd;
            lineEnd = grid.convertToGridBasis(
              polygon.vertices[index % polygon.vertices.length],
              swap
            );
            const lineStartX = Math.round(lineStart[0]);
            const lineStartY = Math.round(lineStart[1]);
            const lineEndX = Math.round(lineEnd[0]);
            const lineEndY = Math.round(lineEnd[1]);
            NavMeshGenerator.rasterizeLine(
              lineStartX,
              lineStartY,
              lineEndX,
              lineEndY,
              (x: integer, y: integer) => grid.get(x, y).setObstacle()
            );
            if (lineEndY < upperY) {
              upperY = lineEndY;
            }
            if (lineEndY > lowerY) {
              lowerY = lineEndY;
            }
            if (lineEndX > upperX) {
              upperX = lineEndX;
            }
            if (lineEndX < lowerX) {
              lowerX = lineEndX;
            }
          }
          // fill the polygon
          //TODO this is broken, triangulate the polygon
          const middleX = Math.floor((lowerX + upperX) / 2);
          for (let y = upperY + 1; y < lowerY; y++) {
            const cell = grid.get(middleX, y);
            if (cell.isObstacle) continue;
            cell.setObstacle();
            for (let x = middleX - 1; !grid.get(x, y).isObstacle; x--) {
              
                console.log(x + " " + y);
                grid.get(x, y).setObstacle();
            }
            for (let x = middleX + 1; !grid.get(x, y).isObstacle; x++) {
              
                console.log(x + " " + y);
                grid.get(x, y).setObstacle();
            }
          }
        }
      }
    }

    /**
     * https://github.com/madbence/node-bresenham
     * @param x0
     * @param y0
     * @param x1
     * @param y1
     * @param fn
     * @returns
     */
    private static rasterizeLine(
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      fn: (x: number, y: number) => void
    ) {
      console.log(x0 + ' ' + y0 + ' -> ' + x1 + ' ' + y1);
      var dx = x1 - x0;
      var dy = y1 - y0;
      var adx = Math.abs(dx);
      var ady = Math.abs(dy);
      var eps = 0;
      var sx = dx > 0 ? 1 : -1;
      var sy = dy > 0 ? 1 : -1;
      if (adx > ady) {
        for (var x = x0, y = y0; sx < 0 ? x >= x1 : x <= x1; x += sx) {
          fn(x, y);
          eps += ady;
          if (eps << 1 >= adx) {
            y += sy;
            eps -= adx;
          }
        }
      } else {
        for (var x = x0, y = y0; sy < 0 ? y >= y1 : y <= y1; y += sy) {
          fn(x, y);
          eps += adx;
          if (eps << 1 >= ady) {
            x += sx;
            eps -= ady;
          }
        }
      }
    }
  }
}
