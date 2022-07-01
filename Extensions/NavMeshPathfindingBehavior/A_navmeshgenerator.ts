// This is generated from this library:
// https://github.com/D8H/NavMeshGenerator
//
// You can run this script to generate it:
// git clone git@github.com:D8H/NavMeshGenerator.git
// cd src
// cat CommonTypes.ts NavMeshGenerator.ts ContourPoint.ts RasterizationCell.ts RasterizationGrid.ts GridCoordinateConverter.ts ConvexPolygonGenerator.ts ContourBuilder.ts RegionGenerator.ts Geometry.ts ObstacleRasterizer.ts | grep -v "^import .* from \".*\";" > A_navmeshgenerator.ts
//
// Then, copy-paste the content of the produced file inside the namespaces.

namespace gdjs {
  export namespace NavMeshPathfinding {
    export declare type integer = number;
    export declare type float = number;
    export interface Point {
      x: number;
      y: number;
    }
    export type VertexArray = Point[];

    // This implementation is strongly inspired from a Java one
    // by Stephen A. Pratt:
    // http://www.critterai.org/projects/nmgen_study/
    //
    // Most of the comments were written by him and were adapted to fit this implementation.
    // This implementation differs a bit from the original:
    // - it's only 2D instead of 3D
    // - it has less features (see TODO) and might have lesser performance
    // - it uses objects for points instead of pointer-like in arrays of numbers
    // - the rasterization comes from other sources because of the 2d focus
    // - partialFloodRegion was rewritten to fix an issue
    // - filterNonObstacleVertices was added
    //
    // The Java implementation was also inspired from Recast that can be found here:
    // https://github.com/recastnavigation/recastnavigation

    export class NavMeshGenerator {
      private grid: RasterizationGrid;
      private isometricRatio: float;
      private obstacleRasterizer: ObstacleRasterizer;
      private regionGenerator: RegionGenerator;
      private contourBuilder: ContourBuilder;
      private convexPolygonGenerator: ConvexPolygonGenerator;
      private gridCoordinateConverter: GridCoordinateConverter;

      constructor(
        areaLeftBound: float,
        areaTopBound: float,
        areaRightBound: float,
        areaBottomBound: float,
        rasterizationCellSize: float,
        isometricRatio: float = 1
      ) {
        this.grid = new RasterizationGrid(
          areaLeftBound,
          areaTopBound,
          areaRightBound,
          areaBottomBound,
          rasterizationCellSize,
          // make cells square in the world
          rasterizationCellSize / isometricRatio
        );
        this.isometricRatio = isometricRatio;
        this.obstacleRasterizer = new ObstacleRasterizer();
        this.regionGenerator = new RegionGenerator();
        this.contourBuilder = new ContourBuilder();
        this.convexPolygonGenerator = new ConvexPolygonGenerator();
        this.gridCoordinateConverter = new GridCoordinateConverter();
      }

      buildNavMesh(
        obstacles: Iterable<Iterable<Point>>,
        obstacleCellPadding: integer
      ): VertexArray[] {
        this.grid.clear();
        this.obstacleRasterizer.rasterizeObstacles(this.grid, obstacles);
        this.regionGenerator.generateDistanceField(this.grid);
        this.regionGenerator.generateRegions(this.grid, obstacleCellPadding);
        // It's probably not a good idea to expose the vectorization threshold.
        // As stated in the parameter documentation, the value 1 gives good
        // results in any situations.
        const threshold = 1;
        const contours = this.contourBuilder.buildContours(
          this.grid,
          threshold
        );
        const meshField = this.convexPolygonGenerator.splitToConvexPolygons(
          contours,
          16
        );
        const scaledMeshField = this.gridCoordinateConverter.convertFromGridBasis(
          this.grid,
          meshField
        );
        if (this.isometricRatio != 1) {
          // Rescale the mesh to have the same unit length on the 2 axis for the pathfinding.
          scaledMeshField.forEach((polygon) =>
            polygon.forEach((point) => {
              point.y *= this.isometricRatio;
            })
          );
        }
        return scaledMeshField;
      }
    }

    export type ContourPoint = {
      x: integer;
      y: integer;
      /** Neighbor region */
      region: integer;
    };

    /**
     * A cell that holds data needed by the 1st steps of the NavMesh generation.
     */
    export class RasterizationCell {
      /** A cell that has not been assigned to any region yet */
      static NULL_REGION_ID = 0;
      /**
       * A cell that contains an obstacle.
       *
       * The value is the same as NULL_REGION_ID because the cells that are
       * not assigned to any region at the end of the flooding algorithm are
       * the obstacle cells.
       */
      static OBSTACLE_REGION_ID = 0;

      x: integer;
      y: integer;
      /**
       * 0 means there is an obstacle in the cell.
       * See {@link RegionGenerator}
       */
      distanceToObstacle: integer = Number.MAX_VALUE;
      regionID: integer = RasterizationCell.NULL_REGION_ID;
      distanceToRegionCore: integer = 0;
      /**
       * If a cell is connected to one or more external regions then the
       *  flag will be a 4 bit value where connections are recorded as
       *  follows:
       *  - bit1 = neighbor0
       *  - bit2 = neighbor1
       *  - bit3 = neighbor2
       *  - bit4 = neighbor3
       *  With the meaning of the bits as follows:
       *  - 0 = neighbor in same region.
       *  - 1 = neighbor not in same region (neighbor may be the obstacle
       *    region or a real region).
       *
       * See {@link ContourBuilder}
       */
      contourFlags: integer = 0;

      constructor(x: integer, y: integer) {
        this.x = x;
        this.y = y;
        this.clear();
      }

      clear() {
        this.distanceToObstacle = Number.MAX_VALUE;
        this.regionID = RasterizationCell.NULL_REGION_ID;
        this.distanceToRegionCore = 0;
        this.contourFlags = 0;
      }
    }

    export class RasterizationGrid {
      originX: float;
      originY: float;
      cellWidth: float;
      cellHeight: float;
      cells: RasterizationCell[][];
      regionCount: integer = 0;

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
        cellWidth: float,
        cellHeight: float
      ) {
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.originX = left - cellWidth;
        this.originY = top - cellHeight;

        const dimX = 2 + Math.ceil((right - left) / cellWidth);
        const dimY = 2 + Math.ceil((bottom - top) / cellHeight);
        this.cells = [];
        for (var y = 0; y < dimY; y++) {
          this.cells[y] = [];

          for (var x = 0; x < dimX; x++) {
            this.cells[y][x] = new RasterizationCell(x, y);
          }
        }
      }

      clear() {
        for (const row of this.cells) {
          for (const cell of row) {
            cell.clear();
          }
        }
        this.regionCount = 0;
      }

      /**
       *
       * @param position the position on the scene
       * @param gridPosition the position on the grid
       * @returns the position on the grid
       */
      convertToGridBasis(position: Point, gridPosition: Point) {
        gridPosition.x = (position.x - this.originX) / this.cellWidth;
        gridPosition.y = (position.y - this.originY) / this.cellHeight;
        return gridPosition;
      }

      /**
       *
       * @param gridPosition the position on the grid
       * @param position the position on the scene
       * @returns the position on the scene
       */
      convertFromGridBasis(gridPosition: Point, position: Point) {
        position.x = gridPosition.x * this.cellWidth + this.originX;
        position.y = gridPosition.y * this.cellHeight + this.originY;
        return position;
      }

      get(x: integer, y: integer) {
        return this.cells[y][x];
      }

      getNeighbor(cell: RasterizationCell, direction: integer) {
        const delta = RasterizationGrid.neighbor8Deltas[direction];
        return this.cells[cell.y + delta.y][cell.x + delta.x];
      }

      dimY() {
        return this.cells.length;
      }

      dimX() {
        const firstColumn = this.cells[0];
        return firstColumn ? firstColumn.length : 0;
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

    export class GridCoordinateConverter {
      /**
       *
       * @param gridPosition the position on the grid
       * @param position the position on the scene
       * @param scaleY for isometry
       * @returns the position on the scene
       */
      public convertFromGridBasis(
        grid: RasterizationGrid,
        polygons: Point[][]
      ): Point[][] {
        // point can be shared so them must be copied to be scaled.
        return polygons.map((polygon) =>
          polygon.map((point) =>
            grid.convertFromGridBasis(point, { x: 0, y: 0 })
          )
        );
      }
    }

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

    /**
     * Builds convex polygons from the provided polygons.
     *
     * This implementation is strongly inspired from CritterAI class "PolyMeshFieldBuilder".
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
      public splitToConvexPolygons(
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
        // (Values are meaningless outside of the iteration)
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
            // CritterAI logged an error here, but we rely on this to filtered
            // polygons that became useless
            continue;
          }

          // Initialize the working polygon array.
          workingPolygons.length = 0;

          // Triangulate the contour.
          let foundAnyTriangle = false;
          this.triangulate(
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
             * holes. In both cases, the problem is likely due to bad
             * region formation.
             */
            console.error(
              'Polygon generation failure: Could not triangulate contour.'
            );
            console.error(
              'contour:' +
                contour.map((point) => point.x + ' ' + point.y).join(' ; ')
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
              let bestPolygonBIndex = -1;

              // Loop through all but the last polygon looking for the
              // best polygons to merge in this iteration.
              for (
                let indexA = 0;
                indexA < workingPolygons.length - 1;
                indexA++
              ) {
                const polygonA = workingPolygons[indexA];
                for (
                  let indexB = indexA + 1;
                  indexB < workingPolygons.length;
                  indexB++
                ) {
                  const polygonB = workingPolygons[indexB];
                  // Can polyB merge with polyA?
                  this.getPolyMergeInfo(
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

              // Found polygons to merge. Perform the merge.

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
                workingMergedPolygon.push(
                  bestPolygonA[(polygonAVertexIndex + 1 + i) % vertCountA]
                );
              for (let i = 0; i < vertCountB - 1; i++)
                workingMergedPolygon.push(
                  bestPolygonB[(polygonBVertexIndex + 1 + i) % vertCountB]
                );

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

        // The original implementation builds polygon adjacency information.
        // but the library for the pathfinding already does it.

        return convexPolygons;
      }

      /**
       * Checks two polygons to see if they can be merged. If a merge is
       * allowed, provides data via the outResult argument (see {@link PolyMergeResult}).
       *
       * @param polygonA The polygon A
       * @param polygonB The polygon B
       * @param maxVerticesPerPolygon cap the vertex number in return polygons.
       * @param outResult contains merge information.
       */
      private getPolyMergeInfo(
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
              // sequenced in opposite order. So the edge is shared.
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
          polygonA[
            (outResult.polygonAVertexIndex - 1 + vertexCountA) % vertexCountA
          ];
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
          polygonB[
            (outResult.polygonBVertexIndex - 1 + vertexCountB) % vertexCountB
          ];
        sharedVert = polygonB[outResult.polygonBVertexIndex];
        sharedVertPlus =
          polygonA[(outResult.polygonAVertexIndex + 2) % vertexCountA];
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
        sharedVert =
          polygonA[(outResult.polygonAVertexIndex + 1) % vertexCountA];

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
      private triangulate(
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
          vertexFlags[iPlus1] = ConvexPolygonGenerator.isValidPartition(
            i,
            iPlus2,
            vertices
          );
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
          ConvexPolygonGenerator.liesWithinInternalAngle(
            indexA,
            indexB,
            vertices
          ) &&
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
      private static liesWithinInternalAngle(
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
        // flip the result. (If B lies within the external angle, it can't
        // lie within the internal angle)
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
       * connected to one of the two vertices.
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
        return (
          ConvexPolygonGenerator.getSignedAreaX2(ax, ay, px, py, bx, by) < 0
        );
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
        return (
          ConvexPolygonGenerator.getSignedAreaX2(ax, ay, px, py, bx, by) > 0
        );
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
        // http://mathworld.wolfram.com/TriangleArea.html (Search for "signed")
        return (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
      }
    }

    /**
     * Builds a set of contours from the region information contained in
     * {@link RasterizationCell}. It does this by locating and "walking" the edges.
     *
     * This implementation is strongly inspired from CritterAI class "ContourSetBuilder".
     * http://www.critterai.org/projects/nmgen_study/contourgen.html
     */
    export class ContourBuilder {
      private workingRawVertices: ContourPoint[];
      private workingSimplifiedVertices: ContourPoint[];

      constructor() {
        // These are working lists whose content changes with each iteration
        // of the up coming loop. They represent the detailed and simple
        // contour vertices.
        // Initial sizing is arbitrary.
        this.workingRawVertices = new Array<ContourPoint>(256);
        this.workingSimplifiedVertices = new Array<ContourPoint>(64);
      }

      /**
       * Generates a contour set from the provided {@link RasterizationGrid}
       *
       * The provided field is expected to contain region information.
       * Behavior is undefined if the provided field is malformed or incomplete.
       *
       * This operation overwrites the flag fields for all cells in the
       * provided field. So the flags must be saved and restored if they are
       * important.
       *
       * @param grid A fully generated field.
       * @param threshold The maximum distance (in cells) the edge of the contour
       * may deviate from the source geometry when the rastered obstacles are
       * vectorized.
       *
       * Setting it to:
       * - 1 ensure that an aliased edge won't be split to more edges.
       * - more that 1 will reduce the number of edges but the obstacles edges
       *   will be followed with less accuracy.
       * - less that 1 might be more accurate but it may try to follow the
       *   aliasing and be a lot less accurate.
       *
       * Values under 1 can be useful in specific cases:
       * - when edges are horizontal or vertical, there is no aliasing so value
       *   near 0 can do better results.
       * - when edges are 45° multiples, aliased vertex won't be farther than
       *   sqrt(2)/2 so values over 0.71 should give good results but not
       *   necessarily better than 1.
       *
       * @return The contours generated from the field.
       */
      buildContours(
        grid: RasterizationGrid,
        threshold: float
      ): ContourPoint[][] {
        const contours = new Array<ContourPoint[]>(grid.regionCount);
        contours.length = 0;
        const contoursByRegion = new Array<ContourPoint[]>(grid.regionCount);

        let discardedContours = 0;

        //  Set the flags on all cells in non-obstacle regions to indicate which
        //  edges are connected to external regions.
        //
        //  Reference: Neighbor search and nomenclature.
        //  http://www.critterai.org/projects/nmgen_study/heightfields.html#nsearch
        //
        //  If a cell has no connections to external regions or is
        //  completely surrounded by other regions (a single cell island),
        //  its flag will be zero.
        //
        //  If a cell is connected to one or more external regions then the
        //  flag will be a 4 bit value where connections are recorded as
        //  follows:
        //      bit1 = neighbor0
        //      bit2 = neighbor1
        //      bit3 = neighbor2
        //      bit4 = neighbor3
        //  With the meaning of the bits as follows:
        //      0 = neighbor in same region.
        //      1 = neighbor not in same region (neighbor may be the obstacle
        //      region or a real region).
        for (let y = 1; y < grid.dimY() - 1; y++) {
          for (let x = 1; x < grid.dimX() - 1; x++) {
            const cell = grid.get(x, y);

            // Note:  This algorithm first sets the flag bits such that
            // 1 = "neighbor is in the same region". At the end it inverts
            // the bits so flags are as expected.

            // Default to "not connected to any external region".
            cell.contourFlags = 0;
            if (cell.regionID === RasterizationCell.OBSTACLE_REGION_ID)
              // Don't care about cells in the obstacle region.
              continue;

            for (
              let direction = 0;
              direction < RasterizationGrid.neighbor4Deltas.length;
              direction++
            ) {
              const delta = RasterizationGrid.neighbor4Deltas[direction];

              const neighbor = grid.get(cell.x + delta.x, cell.y + delta.y);
              if (cell.regionID === neighbor.regionID) {
                // Neighbor is in same region as this cell.
                // Set the bit for this neighbor to 1 (Will be inverted later).
                cell.contourFlags |= 1 << direction;
              }
            }
            // Invert the bits so a bit value of 1 indicates neighbor NOT in
            // same region.
            cell.contourFlags ^= 0xf;
            if (cell.contourFlags === 0xf) {
              // This is an island cell (All neighbors are from other regions)
              // Get rid of flags.
              cell.contourFlags = 0;
              console.warn(
                "Discarded contour: Island cell. Can't form  a contour. Region: " +
                  cell.regionID
              );
              discardedContours++;
            }
          }
        }

        // Loop through all cells looking for cells on the edge of a region.
        //
        // At this point, only cells with flags != 0 are edge cells that
        // are part of a region contour.
        //
        // The process of building a contour will clear the flags on all cells
        // that make up the contour to ensure they are only processed once.
        for (let y = 1; y < grid.dimY() - 1; y++) {
          for (let x = 1; x < grid.dimX() - 1; x++) {
            const cell = grid.get(x, y);

            if (
              cell.regionID === RasterizationCell.OBSTACLE_REGION_ID ||
              cell.contourFlags === 0
            ) {
              // cell is either: Part of the obstacle region, does not
              // represent an edge cell, or was already processed during
              // an earlier iteration.
              continue;
            }

            this.workingRawVertices.length = 0;
            this.workingSimplifiedVertices.length = 0;

            // The cell is part of an unprocessed region's contour.
            // Locate a direction of the cell's edge which points toward
            // another region (there is at least one).
            let startDirection = 0;
            while ((cell.contourFlags & (1 << startDirection)) === 0) {
              startDirection++;
            }
            // We now have a cell that is part of a contour and a direction
            // that points to a different region (obstacle or real).
            // Build the contour.
            this.buildRawContours(
              grid,
              cell,
              startDirection,
              this.workingRawVertices
            );
            // Perform post processing on the contour in order to
            // create the final, simplified contour.
            this.generateSimplifiedContour(
              cell.regionID,
              this.workingRawVertices,
              this.workingSimplifiedVertices,
              threshold
            );

            // The CritterAI implementation filters polygons with less than
            // 3 vertices, but they are needed to filter vertices in the middle
            // (not on an obstacle region border).
            const contour = Array.from(this.workingSimplifiedVertices);
            contours.push(contour);
            contoursByRegion[cell.regionID] = contour;
          }
        }

        if (contours.length + discardedContours !== grid.regionCount - 1) {
          // The only valid state is one contour per region.
          //
          // The only time this should occur is if an invalid contour
          // was formed or if a region resulted in multiple
          // contours (bad region data).
          //
          // IMPORTANT: While a mismatch may not be a fatal error,
          // it should be addressed since it can result in odd,
          // hard to spot anomalies later in the pipeline.
          //
          // A known cause is if a region fully encompasses another
          // region. In such a case, two contours will be formed.
          // The normal outer contour and an inner contour.
          // The CleanNullRegionBorders algorithm protects
          // against internal encompassed obstacle regions.
          console.error(
            'Contour generation failed: Detected contours does' +
              ' not match the number of regions. Regions: ' +
              (grid.regionCount - 1) +
              ', Detected contours: ' +
              (contours.length + discardedContours) +
              ' (Actual: ' +
              contours.length +
              ', Discarded: ' +
              discardedContours +
              ')'
          );
          // The CritterAI implementation has more detailed logs.
          // They can be interesting for debugging.
        }

        this.filterNonObstacleVertices(contours, contoursByRegion);

        return contours;
      }

      /**
       * Search vertices that are not shared with the obstacle region and
       * remove them.
       *
       * Some contours will have no vertex left.
       *
       * @param contours
       * @param contoursByRegion Some regions may have been discarded
       * so contours index can't be used.
       */
      private filterNonObstacleVertices(
        contours: Array<ContourPoint[]>,
        contoursByRegion: Array<ContourPoint[]>
      ): void {
        // This was not part of the CritterAI implementation.

        // The removed vertex is merged on the nearest of the edges other extremity
        // that is on an obstacle border.
        const commonVertexContours = new Array<ContourPoint[]>(5);
        const commonVertexIndexes = new Array<integer>(5);
        // Each pass only filter vertex that have an edge other extremity on an obstacle.
        // Vertex depth (in number of edges to reach an obstacle) is reduces by
        // at least one by each pass.
        let movedAnyVertex = false;
        do {
          movedAnyVertex = false;
          for (const contour of contours) {
            for (
              let vertexIndex = 0;
              vertexIndex < contour.length;
              vertexIndex++
            ) {
              const vertex = contour[vertexIndex];
              const nextVertex = contour[(vertexIndex + 1) % contour.length];
              if (
                vertex.region !== RasterizationCell.OBSTACLE_REGION_ID &&
                nextVertex.region !== RasterizationCell.OBSTACLE_REGION_ID
              ) {
                // This is a vertex in the middle. It must be removed.

                // Search the contours around the vertex.
                //
                // Typically a contour point to its neighbor and it form a cycle.
                //
                //   \ C /
                //    \ /
                //  A  |  B
                //     |
                //
                // C -> B -> A -> C
                //
                // There can be more than 3 contours even if it's rare.
                commonVertexContours.length = 0;
                commonVertexIndexes.length = 0;
                commonVertexContours.push(contour);
                commonVertexIndexes.push(vertexIndex);
                let errorFound = false;
                let commonVertex = vertex;
                do {
                  const neighborContour = contoursByRegion[commonVertex.region];
                  if (!neighborContour) {
                    errorFound = true;
                    if (
                      commonVertex.region !==
                      RasterizationCell.OBSTACLE_REGION_ID
                    ) {
                      console.warn(
                        'contour already discarded: ' + commonVertex.region
                      );
                    }
                    break;
                  }

                  let foundVertex = false;
                  for (
                    let neighborVertexIndex = 0;
                    neighborVertexIndex < neighborContour.length;
                    neighborVertexIndex++
                  ) {
                    const neighborVertex = neighborContour[neighborVertexIndex];
                    if (
                      neighborVertex.x === commonVertex.x &&
                      neighborVertex.y === commonVertex.y
                    ) {
                      commonVertexContours.push(neighborContour);
                      commonVertexIndexes.push(neighborVertexIndex);
                      commonVertex = neighborVertex;
                      foundVertex = true;
                      break;
                    }
                  }
                  if (!foundVertex) {
                    errorFound = true;
                    console.error(
                      "Can't find a common vertex with a neighbor contour. There is probably a superposition."
                    );
                    break;
                  }
                } while (commonVertex !== vertex);
                if (errorFound) {
                  continue;
                }
                if (commonVertexContours.length < 3) {
                  console.error(
                    `The vertex is shared by only ${commonVertexContours.length} regions.`
                  );
                }

                let shorterEdgeContourIndex = -1;
                let edgeLengthMin = Number.MAX_VALUE;
                for (
                  let index = 0;
                  index < commonVertexContours.length;
                  index++
                ) {
                  const vertexContour = commonVertexContours[index];
                  const vertexIndex = commonVertexIndexes[index];

                  const previousVertex =
                    vertexContour[
                      (vertexIndex - 1 + vertexContour.length) %
                        vertexContour.length
                    ];
                  if (
                    previousVertex.region ===
                    RasterizationCell.OBSTACLE_REGION_ID
                  ) {
                    const deltaX = previousVertex.x - vertex.x;
                    const deltaY = previousVertex.y - vertex.y;
                    const lengthSq = deltaX * deltaX + deltaY * deltaY;
                    if (lengthSq < edgeLengthMin) {
                      edgeLengthMin = lengthSq;

                      shorterEdgeContourIndex = index;
                    }
                  }
                }
                if (shorterEdgeContourIndex === -1) {
                  // A vertex has no neighbor on an obstacle.
                  // It will be solved in next iterations.
                  continue;
                }

                // Merge the vertex on the other extremity of the smallest of the 3 edges.
                //
                //   \ C /
                //    \ /
                //  A  |  B
                //     |
                //
                // - the shortest edge is between A and B
                // - the Y will become a V
                // - vertices are store clockwise
                // - there can be more than one C (it's rare)

                // This is B
                const shorterEdgeContour =
                  commonVertexContours[shorterEdgeContourIndex];
                const shorterEdgeVertexIndex =
                  commonVertexIndexes[shorterEdgeContourIndex];

                const shorterEdgeExtremityVertex =
                  shorterEdgeContour[
                    (shorterEdgeVertexIndex - 1 + shorterEdgeContour.length) %
                      shorterEdgeContour.length
                  ];

                // This is A
                const shorterEdgeOtherContourIndex =
                  (shorterEdgeContourIndex + 1) % commonVertexContours.length;
                const shorterEdgeOtherContour =
                  commonVertexContours[shorterEdgeOtherContourIndex];
                const shorterEdgeOtherVertexIndex =
                  commonVertexIndexes[shorterEdgeOtherContourIndex];

                for (
                  let index = 0;
                  index < commonVertexContours.length;
                  index++
                ) {
                  if (
                    index === shorterEdgeContourIndex ||
                    index === shorterEdgeOtherContourIndex
                  ) {
                    continue;
                  }
                  // These are C
                  const commonVertexContour = commonVertexContours[index];
                  const commonVertexIndex = commonVertexIndexes[index];

                  // Move the vertex to an obstacle border
                  const movedVertex = commonVertexContour[commonVertexIndex];
                  movedVertex.x = shorterEdgeExtremityVertex.x;
                  movedVertex.y = shorterEdgeExtremityVertex.y;
                  movedVertex.region = RasterizationCell.NULL_REGION_ID;
                }

                // There is no more border between A and B,
                // update the region from B to C.
                shorterEdgeOtherContour[
                  (shorterEdgeOtherVertexIndex + 1) %
                    shorterEdgeOtherContour.length
                ].region =
                  shorterEdgeOtherContour[shorterEdgeOtherVertexIndex].region;

                // Remove in A and B the vertex that's been move in C.
                shorterEdgeContour.splice(shorterEdgeVertexIndex, 1);
                shorterEdgeOtherContour.splice(shorterEdgeOtherVertexIndex, 1);

                movedAnyVertex = true;
              }
            }
          }
        } while (movedAnyVertex);

        // Clean the polygons from identical vertices.
        //
        // This can happen with 2 vertices regions.
        // 2 edges are superposed and there extremity is the same.
        // One is move over the other.
        // I could observe this with a region between 2 regions
        // where one of one of these 2 regions were also encompassed.
        // A bit like a rainbow, 2 big regions: the land, the sky
        // and 2 regions for the colors.
        //
        // The vertex can't be removed during the process because
        // they hold data used by other merging.
        //
        // Some contour will have no vertex left.
        // It more efficient to let the next step ignore them.
        for (const contour of contours) {
          for (
            let vertexIndex = 0;
            vertexIndex < contour.length;
            vertexIndex++
          ) {
            const vertex = contour[vertexIndex];
            const nextVertexIndex = (vertexIndex + 1) % contour.length;
            const nextVertex = contour[nextVertexIndex];
            if (vertex.x === nextVertex.x && vertex.y === nextVertex.y) {
              contour.splice(nextVertexIndex, 1);
              vertexIndex--;
            }
          }
        }
      }

      private static leftVertexOfFacingCellBorderDeltas = [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
      ];

      /**
       * Walk around the edge of this cell's region gathering vertices that
       * represent the corners of each cell on the sides that are external facing.
       *
       * There will be two or three vertices for each edge cell:
       * Two for cells that don't represent a change in edge direction. Three
       * for cells that represent a change in edge direction.
       *
       * The output array will contain vertices ordered as follows:
       * (x, y, z, regionID) where regionID is the region (obstacle or real) that
       * this vertex is considered to be connected to.
       *
       * WARNING: Only run this operation on cells that are already known
       * to be on a region edge. The direction must also be pointing to a
       * valid edge. Otherwise behavior will be undefined.
       *
       * @param grid the grid of cells
       * @param startCell A cell that is known to be on the edge of a region
       * (part of a region contour).
       * @param startDirection The direction of the edge of the cell that is
       * known to point
       * across the region edge.
       * @param outContourVertices The list of vertices that represent the edge
       * of the region.
       */
      private buildRawContours(
        grid: RasterizationGrid,
        startCell: RasterizationCell,
        startDirection: number,
        outContourVertices: ContourPoint[]
      ) {
        // Flaw in Algorithm:
        //
        // This method of contour generation can result in an inappropriate
        // impassable seam between two adjacent regions in the following case:
        //
        // 1. One region connects to another region on two sides in an
        // uninterrupted manner (visualize one region wrapping in an L
        // shape around the corner of another).
        // 2. At the corner shared by the two regions, a change in height
        // occurs.
        //
        // In this case, the two regions should share a corner vertex
        // (an obtuse corner vertex for one region and an acute corner
        // vertex for the other region).
        //
        // In reality, though this algorithm will select the same (x, z)
        // coordinates for each region's corner vertex, the vertex heights
        // may differ, eventually resulting in an impassable seam.

        // It is a bit hard to describe the stepping portion of this algorithm.
        // One way to visualize it is to think of a robot sitting on the
        // floor facing a known wall. It then does the following to skirt
        // the wall:
        // 1. If there is a wall in front of it, turn clockwise in 90 degrees
        //    increments until it finds the wall is gone.
        // 2. Move forward one step.
        // 3. Turn counter-clockwise by 90 degrees.
        // 4. Repeat from step 1 until it finds itself at its original
        //    location facing its original direction.
        //
        // See also: http://www.critterai.org/projects/nmgen_study/contourgen.html#robotwalk

        let cell = startCell;
        let direction = startDirection;

        let loopCount = 0;
        do {
          // Note: The design of this loop is such that the cell variable
          // will always reference an edge cell from the same region as
          // the start cell.

          if ((cell.contourFlags & (1 << direction)) !== 0) {
            // The current direction is pointing toward an edge.
            // Get this edge's vertex.
            const delta =
              ContourBuilder.leftVertexOfFacingCellBorderDeltas[direction];

            const neighbor = grid.get(
              cell.x + RasterizationGrid.neighbor4Deltas[direction].x,
              cell.y + RasterizationGrid.neighbor4Deltas[direction].y
            );
            outContourVertices.push({
              x: cell.x + delta.x,
              y: cell.y + delta.y,
              region: neighbor.regionID,
            });

            // Remove the flag for this edge. We never need to consider
            // it again since we have a vertex for this edge.
            cell.contourFlags &= ~(1 << direction);
            // Rotate in clockwise direction.
            direction = (direction + 1) & 0x3;
          } else {
            // The current direction does not point to an edge. So it
            // must point to a neighbor cell in the same region as the
            // current cell. Move to the neighbor and swing the search
            // direction back one increment (counterclockwise).
            // By moving the direction back one increment we guarantee we
            // don't miss any edges.
            const neighbor = grid.get(
              cell.x + RasterizationGrid.neighbor4Deltas[direction].x,
              cell.y + RasterizationGrid.neighbor4Deltas[direction].y
            );
            cell = neighbor;

            direction = (direction + 3) & 0x3; // Rotate counterclockwise.
          }

          // The loop limit is arbitrary. It exists only to guarantee that
          // bad input data doesn't result in an infinite loop.
          // The only down side of this loop limit is that it limits the
          // number of detectable edge vertices (the longer the region edge
          // and the higher the number of "turns" in a region's edge, the less
          // edge vertices can be detected for that region).
        } while (
          !(cell === startCell && direction === startDirection) &&
          ++loopCount < 65535
        );
        return outContourVertices;
      }

      /**
       * Takes a group of vertices that represent a region contour and changes
       * it in the following manner:
       * - For any edges that connect to non-obstacle regions, remove all
       * vertices except the start and end vertices for that edge (this
       * smooths the edges between non-obstacle regions into a straight line).
       * - Runs an algorithm's against the contour to follow the edge more closely.
       *
       * @param regionID The region the contour was derived from.
       * @param sourceVertices  The source vertices that represent the complex
       * contour.
       * @param outVertices The simplified contour vertices.
       * @param threshold The maximum distance the edge of the contour may deviate
       * from the source geometry.
       */
      private generateSimplifiedContour(
        regionID: number,
        sourceVertices: ContourPoint[],
        outVertices: ContourPoint[],
        threshold: float
      ) {
        let noConnections = true;
        for (const sourceVertex of sourceVertices) {
          if (sourceVertex.region !== RasterizationCell.OBSTACLE_REGION_ID) {
            noConnections = false;
            break;
          }
        }

        // Seed the simplified contour with the mandatory edges
        // (At least one edge).
        if (noConnections) {
          // This contour represents an island region surrounded only by the
          // obstacle region. Seed the simplified contour with the source's
          // lower left (ll) and upper right (ur) vertices.
          let lowerLeftX = sourceVertices[0].x;
          let lowerLeftY = sourceVertices[0].y;
          let lowerLeftIndex = 0;
          let upperRightX = sourceVertices[0].x;
          let upperRightY = sourceVertices[0].y;
          let upperRightIndex = 0;
          for (let index = 0; index < sourceVertices.length; index++) {
            const sourceVertex = sourceVertices[index];
            const x = sourceVertex.x;
            const y = sourceVertex.y;

            if (x < lowerLeftX || (x === lowerLeftX && y < lowerLeftY)) {
              lowerLeftX = x;
              lowerLeftY = y;
              lowerLeftIndex = index;
            }
            if (x >= upperRightX || (x === upperRightX && y > upperRightY)) {
              upperRightX = x;
              upperRightY = y;
              upperRightIndex = index;
            }
          }
          // The region attribute is used to store an index locally in this function.
          // TODO Maybe there is a way to do this cleanly and keep no memory footprint.

          // Seed the simplified contour with this edge.
          outVertices.push({
            x: lowerLeftX,
            y: lowerLeftY,
            region: lowerLeftIndex,
          });
          outVertices.push({
            x: upperRightX,
            y: upperRightY,
            region: upperRightIndex,
          });
        } else {
          // The contour shares edges with other non-obstacle regions.
          // Seed the simplified contour with a new vertex for every
          // location where the region connection changes. These are
          // vertices that are important because they represent portals
          // to other regions.
          for (let index = 0; index < sourceVertices.length; index++) {
            const sourceVert = sourceVertices[index];

            if (
              sourceVert.region !==
              sourceVertices[(index + 1) % sourceVertices.length].region
            ) {
              // The current vertex has a different region than the
              // next vertex. So there is a change in vertex region.
              outVertices.push({
                x: sourceVert.x,
                y: sourceVert.y,
                region: index,
              });
            }
          }
        }

        this.matchObstacleRegionEdges(sourceVertices, outVertices, threshold);

        if (outVertices.length < 2) {
          // It will be ignored by the triangulation.
          // It should be rare enough not to handle it now.
          console.warn(
            'A region is encompassed in another region. It will be ignored.'
          );
        }
        // There can be polygons with only 2 vertices when a region is between
        // 2 non-obstacles regions. It's still a useful information to filter
        // vertices in the middle (not on an obstacle region border).
        // In this case, the CritterAI implementation adds a 3rd point to avoid
        // invisible polygons, but it makes it difficult to filter it later.

        // Replace the index pointers in the output list with region IDs.
        for (const outVertex of outVertices) {
          outVertex.region = sourceVertices[outVertex.region].region;
        }
      }

      /**
       * Applies an algorithm to contours which results in obstacle-region edges
       * following the original detail source geometry edge more closely.
       * http://www.critterai.org/projects/nmgen_study/contourgen.html#nulledgesimple
       *
       * Adds vertices from the source list to the result list such that
       * if any obstacle region vertices are compared against the result list,
       * none of the vertices will be further from the obstacle region edges than
       * the allowed threshold.
       *
       * Only obstacle-region edges are operated on. All other edges are
       * ignored.
       *
       * The result vertices is expected to be seeded with at least two
       * source vertices.
       *
       * @param sourceVertices
       * @param inoutResultVertices
       * @param threshold The maximum distance the edge of the contour may deviate
       * from the source geometry.
       */
      private matchObstacleRegionEdges(
        sourceVertices: ContourPoint[],
        inoutResultVertices: ContourPoint[],
        threshold: float
      ) {
        // This implementation is strongly inspired from CritterAI class "MatchNullRegionEdges".

        // Loop through all edges in this contour.
        //
        // NOTE: The simplifiedVertCount in the loop condition
        // increases over iterations. That is what keeps the loop going beyond
        // the initial vertex count.
        let resultIndexA = 0;
        while (resultIndexA < inoutResultVertices.length) {
          const resultIndexB = (resultIndexA + 1) % inoutResultVertices.length;

          // The line segment's beginning vertex.
          const ax = inoutResultVertices[resultIndexA].x;
          const az = inoutResultVertices[resultIndexA].y;
          const sourceIndexA = inoutResultVertices[resultIndexA].region;

          // The line segment's ending vertex.
          const bx = inoutResultVertices[resultIndexB].x;
          const bz = inoutResultVertices[resultIndexB].y;
          const sourceIndexB = inoutResultVertices[resultIndexB].region;

          // The source index of the next vertex to test (the vertex just
          // after the current vertex in the source vertex list).
          let testedSourceIndex = (sourceIndexA + 1) % sourceVertices.length;
          let maxDeviation = 0;

          // Default to no index. No new vert to add.
          let toInsertSourceIndex = -1;

          if (
            sourceVertices[testedSourceIndex].region ===
            RasterizationCell.OBSTACLE_REGION_ID
          ) {
            // This test vertex is part of a obstacle region edge.
            // Loop through the source vertices until the end vertex
            // is found, searching for the vertex that is farthest from
            // the line segment formed by the begin/end vertices.
            //
            // Visualizations:
            // http://www.critterai.org/projects/nmgen_study/contourgen.html#nulledgesimple
            while (testedSourceIndex !== sourceIndexB) {
              const deviation = Geometry.getPointSegmentDistanceSq(
                sourceVertices[testedSourceIndex].x,
                sourceVertices[testedSourceIndex].y,
                ax,
                az,
                bx,
                bz
              );
              if (deviation > maxDeviation) {
                // A new maximum deviation was detected.
                maxDeviation = deviation;
                toInsertSourceIndex = testedSourceIndex;
              }
              // Move to the next vertex.
              testedSourceIndex =
                (testedSourceIndex + 1) % sourceVertices.length;
            }
          }

          if (
            toInsertSourceIndex !== -1 &&
            maxDeviation > threshold * threshold
          ) {
            // A vertex was found that is further than allowed from the
            // current edge. Add this vertex to the contour.
            inoutResultVertices.splice(resultIndexA + 1, 0, {
              x: sourceVertices[toInsertSourceIndex].x,
              y: sourceVertices[toInsertSourceIndex].y,
              region: toInsertSourceIndex,
            });
            // Not incrementing the vertex since we need to test the edge
            // formed by vertA  and this this new vertex on the next
            // iteration of the loop.
          }
          // This edge segment does not need to be altered. Move to
          // the next vertex.
          else resultIndexA++;
        }
      }
    }

    /**
     * Build cohesive regions from the non-obstacle space. It uses the data
     * from the obstacles rasterization {@link ObstacleRasterizer}.
     *
     * This implementation is strongly inspired from CritterAI class "OpenHeightfieldBuilder".
     *
     * Introduction to Height Fields: http://www.critterai.org/projects/nmgen_study/heightfields.html
     *
     * Region Generation: http://www.critterai.org/projects/nmgen_study/regiongen.html
     */
    export class RegionGenerator {
      obstacleRegionBordersCleaner: ObstacleRegionBordersCleaner;
      /**
       * Contains a list of cells that are considered to be flooded and
       * therefore are ready to be processed. This list may contain nulls
       * at certain points in the process. Nulls indicate cells that were
       * initially in the list but have been successfully added to a region.
       * The initial size is arbitrary.
       */
      floodedCells: Array<RasterizationCell | null>;
      /**
       * A predefined stack for use in the flood operation. Its content
       * has no meaning outside the new region flooding operation.
       */
      workingStack: Array<RasterizationCell>;

      constructor() {
        this.obstacleRegionBordersCleaner = new ObstacleRegionBordersCleaner();
        this.floodedCells = new Array<RasterizationCell | null>(1024);
        this.workingStack = new Array<RasterizationCell>(1024);
      }

      //TODO implement the smoothing pass on the distance field?
      /**
       * Groups cells into cohesive regions using an watershed based algorithm.
       *
       * This operation depends on neighbor and distance field information.
       * So {@link RegionGenerator.generateDistanceField} operations must be
       * run before this operation.
       *
       * @param grid A field with cell distance information fully generated.
       * @param obstacleCellPadding a padding in cells to apply around the
       * obstacles.
       */
      generateRegions(grid: RasterizationGrid, obstacleCellPadding: integer) {
        // Watershed Algorithm
        //
        // Reference: http://en.wikipedia.org/wiki/Watershed_%28algorithm%29
        // A good visualization:
        // http://artis.imag.fr/Publications/2003/HDS03/ (PDF)
        //
        // Summary:
        //
        // This algorithm utilizes the cell.distanceToObstacle value, which
        // is generated by the generateDistanceField() operation.
        //
        // Using the watershed analogy, the cells which are furthest from
        // a border (highest distance to border) represent the lowest points
        // in the watershed. A border cell represents the highest possible
        // water level.
        //
        // The main loop iterates, starting at the lowest point in the
        // watershed, then incrementing with each loop until the highest
        // allowed water level is reached. This slowly "floods" the cells
        // starting at the lowest points.
        //
        // During each iteration of the loop, cells that are below the
        // current water level are located and an attempt is made to either
        // add them to exiting regions or create new regions from them.
        //
        // During the region expansion phase, if a newly flooded cell
        // borders on an existing region, it is usually added to the region.
        //
        // Any newly flooded cell that survives the region expansion phase
        // is used as a seed for a new region.
        //
        // At the end of the main loop, a final region expansion is
        // performed which should catch any stray cells that escaped region
        // assignment during the main loop.

        // Represents the minimum distance to an obstacle that is considered
        // traversable. I.e. Can't traverse cells closer than this distance
        // to a border. This provides a way of artificially capping the
        // height to which watershed flooding can occur.
        // I.e. Don't let the algorithm flood all the way to the actual border.
        //
        // We add the minimum border distance to take into account the
        // blurring algorithm which can result in a border cell having a
        // border distance > 0.
        const distanceMin = obstacleCellPadding * 2;

        // TODO: EVAL: Figure out why this iteration limit is needed
        // (todo from the CritterAI sources).
        const expandIterations: integer = 4 + distanceMin * 2;

        // Zero is reserved for the obstacle-region. So initializing to 1.
        let nextRegionID = 1;

        const floodedCells = this.floodedCells;

        // Search until the current distance reaches the minimum allowed
        // distance.
        //
        // Note: This loop will not necessarily complete all region
        // assignments. This is OK since a final region assignment step
        // occurs after the loop iteration is complete.
        for (
          // This value represents the current distance from the border which
          // is to be searched. The search starts at the maximum distance then
          // moves toward zero (toward borders).
          //
          // This number will always be divisible by 2.
          let distance = grid.obstacleDistanceMax() & ~1;
          distance > distanceMin;
          distance = Math.max(distance - 2, 0)
        ) {
          // Find all cells that are at or below the current "water level"
          // and are not already assigned to a region. Add these cells to
          // the flooded cell list for processing.
          floodedCells.length = 0;
          for (let y = 1; y < grid.dimY() - 1; y++) {
            for (let x = 1; x < grid.dimX() - 1; x++) {
              const cell = grid.get(x, y);
              if (
                cell.regionID === RasterizationCell.NULL_REGION_ID &&
                cell.distanceToObstacle >= distance
              ) {
                // The cell is not already assigned a region and is
                // below the current "water level". So the cell can be
                // considered for region assignment.
                floodedCells.push(cell);
              }
            }
          }
          if (nextRegionID > 1) {
            // At least one region has already been created, so first
            // try to  put the newly flooded cells into existing regions.
            if (distance > 0) {
              this.expandRegions(grid, floodedCells, expandIterations);
            } else {
              this.expandRegions(grid, floodedCells, -1);
            }
          }

          // Create new regions for all cells that could not be added to
          // existing regions.
          for (const floodedCell of floodedCells) {
            if (
              !floodedCell ||
              floodedCell.regionID !== RasterizationCell.NULL_REGION_ID
            ) {
              // This cell was assigned to a newly created region
              // during an earlier iteration of this loop.
              // So it can be skipped.
              continue;
            }

            // Fill to slightly more than the current "water level".
            // This improves efficiency of the algorithm.
            // And it is necessary with the conservative expansion to ensure that
            // more than one cell is added initially to a new regions otherwise
            // no cell could be added to it later because of the conservative
            // constraint.
            const fillTo = Math.max(distance - 2, distanceMin + 1, 1);
            if (this.floodNewRegion(grid, floodedCell, fillTo, nextRegionID)) {
              nextRegionID++;
            }
          }
        }

        // Find all cells that haven't been assigned regions by the main loop
        // (up to the minimum distance).
        floodedCells.length = 0;
        for (let y = 1; y < grid.dimY() - 1; y++) {
          for (let x = 1; x < grid.dimX() - 1; x++) {
            const cell = grid.get(x, y);

            if (
              cell.distanceToObstacle > distanceMin &&
              cell.regionID === RasterizationCell.NULL_REGION_ID
            ) {
              // Not a border or obstacle region cell. Should be in a region.
              floodedCells.push(cell);
            }
          }
        }

        // Perform a final expansion of existing regions.
        // Allow more iterations than normal for this last expansion.
        if (distanceMin > 0) {
          this.expandRegions(grid, floodedCells, expandIterations * 8);
        } else {
          this.expandRegions(grid, floodedCells, -1);
        }

        grid.regionCount = nextRegionID;

        this.obstacleRegionBordersCleaner.fixObstacleRegion(grid);
        //TODO Also port FilterOutSmallRegions?
        // The algorithm to remove vertices in the middle (added at the end of
        // ContourBuilder.buildContours) may already filter them and contour are
        // faster to process than cells.
      }

      /**
       * Attempts to find the most appropriate regions to attach cells to.
       *
       * Any cells successfully attached to a region will have their list
       * entry set to null. So any non-null entries in the list will be cells
       * for which a region could not be determined.
       *
       * @param grid
       * @param inoutCells As input, the list of cells available for formation
       * of new regions. As output, the cells that could not be assigned
       * to new regions.
       * @param maxIterations If set to -1, will iterate through completion.
       */
      private expandRegions(
        grid: RasterizationGrid,
        inoutCells: Array<RasterizationCell | null>,
        iterationMax: integer
      ) {
        if (inoutCells.length === 0) return;
        let skipped = 0;
        for (
          let iteration = 0;
          (iteration < iterationMax || iterationMax === -1) &&
          // All cells have either been processed or could not be
          // processed during the last cycle.
          skipped < inoutCells.length;
          iteration++
        ) {
          // The number of cells in the working list that have been
          // successfully processed or could not be processed successfully
          // for some reason.
          // This value controls when iteration ends.
          skipped = 0;

          for (let index = 0; index < inoutCells.length; index++) {
            const cell = inoutCells[index];
            if (cell === null) {
              // The cell originally at this index location has
              // already been successfully assigned a region. Nothing
              // else to do with it.
              skipped++;
              continue;
            }
            // Default to unassigned.
            let cellRegion = RasterizationCell.NULL_REGION_ID;
            let regionCenterDist = Number.MAX_VALUE;
            for (const delta of RasterizationGrid.neighbor4Deltas) {
              const neighbor = grid.get(cell.x + delta.x, cell.y + delta.y);
              if (neighbor.regionID !== RasterizationCell.NULL_REGION_ID) {
                if (neighbor.distanceToRegionCore + 2 < regionCenterDist) {
                  // This neighbor is closer to its region core
                  // than previously detected neighbors.

                  // Conservative expansion constraint:
                  // Check to ensure that this neighbor has
                  // at least two other neighbors in its region.
                  // This makes sure that adding this cell to
                  // this neighbor's  region will not result
                  // in a single width line of cells.
                  let sameRegionCount = 0;
                  for (
                    let neighborDirection = 0;
                    neighborDirection < 4;
                    neighborDirection++
                  ) {
                    const nnCell = grid.getNeighbor(
                      neighbor,
                      neighborDirection
                    );
                    // There is a diagonal-neighbor
                    if (nnCell.regionID === neighbor.regionID) {
                      // This neighbor has a neighbor in
                      // the same region.
                      sameRegionCount++;
                    }
                  }
                  if (sameRegionCount > 1) {
                    cellRegion = neighbor.regionID;
                    regionCenterDist = neighbor.distanceToRegionCore + 2;
                  }
                }
              }
            }
            if (cellRegion !== RasterizationCell.NULL_REGION_ID) {
              // Found a suitable region for this cell to belong to.
              // Mark this index as having been processed.
              inoutCells[index] = null;
              cell.regionID = cellRegion;
              cell.distanceToRegionCore = regionCenterDist;
            } else {
              // Could not find an existing region for this cell.
              skipped++;
            }
          }
        }
      }

      /**
       * Creates a new region surrounding a cell, adding neighbor cells to the
       * new region as appropriate.
       *
       * The new region creation will fail if the root cell is on the
       * border of an existing region.
       *
       * All cells added to the new region as part of this process become
       * "core" cells with a distance to region core of zero.
       *
       * @param grid
       * @param rootCell The cell used to seed the new region.
       * @param fillToDist The watershed distance to flood to.
       * @param regionID The region ID to use for the new region
       * (if creation is successful).
       * @return true if a new region was created.
       */
      private floodNewRegion(
        grid: RasterizationGrid,
        rootCell: RasterizationCell,
        fillToDist: integer,
        regionID: integer
      ) {
        const workingStack = this.workingStack;
        workingStack.length = 0;
        workingStack.push(rootCell);
        rootCell.regionID = regionID;
        rootCell.distanceToRegionCore = 0;

        let regionSize = 0;
        let cell: RasterizationCell | undefined;
        while ((cell = workingStack.pop())) {
          // Check regions of neighbor cells.
          //
          // If any neighbor is found to have a region assigned, then
          // the current cell can't be in the new region
          // (want standard flooding algorithm to handle deciding which
          // region this cell should go in).
          //
          // Up to 8 neighbors are checked.
          //
          // Neighbor searches:
          // http://www.critterai.org/projects/nmgen_study/heightfields.html#nsearch
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

          // If got this far, we know the current cell is part of the new
          // region. Now check its neighbors to see if they should be
          // assigned to this new region.
          for (const delta of RasterizationGrid.neighbor4Deltas) {
            const neighbor = grid.get(cell.x + delta.x, cell.y + delta.y);

            if (
              neighbor.distanceToObstacle >= fillToDist &&
              neighbor.regionID === RasterizationCell.NULL_REGION_ID
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

      /**
       * Generates distance field information.
       * The {@link RasterizationCell.distanceToObstacle} information is generated
       * for all cells in the field.
       *
       * All distance values are relative and do not represent explicit
       * distance values (such as grid unit distance). The algorithm which is
       * used results in an approximation only. It is not exhaustive.
       *
       * The data generated by this operation is required by
       * {@link RegionGenerator.generateRegions}.
       *
       * @param grid A field with cells obstacle information already generated.
       */
      generateDistanceField(grid: RasterizationGrid) {
        // close borders
        for (let x = 0; x < grid.dimX(); x++) {
          const leftCell = grid.get(x, 0);
          leftCell.distanceToObstacle = 0;
          const rightCell = grid.get(x, grid.dimY() - 1);
          rightCell.distanceToObstacle = 0;
        }
        for (let y = 1; y < grid.dimY() - 1; y++) {
          const topCell = grid.get(0, y);
          topCell.distanceToObstacle = 0;
          const bottomCell = grid.get(grid.dimX() - 1, y);
          bottomCell.distanceToObstacle = 0;
        }
        // The next two phases basically check the neighbors of a cell and
        // set the cell's distance field to be slightly greater than the
        // neighbor with the lowest border distance. Distance is increased
        // slightly more for diagonal-neighbors than for axis-neighbors.

        // 1st pass
        // During this pass, the following neighbors are checked:
        // (-1, 0) (-1, -1) (0, -1) (1, -1)
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
        // During this pass, the following neighbors are checked:
        //   (1, 0) (1, 1) (0, 1) (-1, 1)
        //
        // Besides checking different neighbors, this pass performs its
        // grid search in reverse order.
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

    /**
     * Implements three algorithms that clean up issues that can
     * develop around obstacle region boarders.
     *
     * - Detect and fix encompassed obstacle regions:
     *
     * If a obstacle region is found that is fully encompassed by a single
     * region, then the region will be split into two regions at the
     * obstacle region border.
     *
     * - Detect and fix "short wrapping" of obstacle regions:
     *
     * Regions can sometimes wrap slightly around the corner of a obstacle region
     * in a manner that eventually results in the formation of self-intersecting
     * polygons.
     *
     * Example: Before the algorithm is applied:
     * http://www.critterai.org/projects/nmgen_study/media/images/ohfg_08_cornerwrapbefore.jpg"
     *
     * Example: After the algorithm is applied:
     * http://www.critterai.org/projects/nmgen_study/media/images/ohfg_09_cornerwrapafter.jpg
     *
     * - Detect and fix incomplete obstacle region connections:
     *
     * If a region touches obstacle region only diagonally, then contour detection
     * algorithms may not properly detect the obstacle region connection. This can
     * adversely effect other algorithms in the pipeline.
     *
     * Example: Before algorithm is applied:
     *
     *     b b a a a a
     *     b b a a a a
     *     a a x x x x
     *     a a x x x x
     *
     * Example: After algorithm is applied:
     *
     *     b b a a a a
     *     b b b a a a <-- Cell transferred to region B.
     *     a a x x x x
     *     a a x x x x
     *
     *
     * Region Generation: http://www.critterai.org/projects/nmgen_study/regiongen.html
     */
    class ObstacleRegionBordersCleaner {
      private workingUpLeftOpenCells: RasterizationCell[];
      private workingDownRightOpenCells: RasterizationCell[];
      private workingOpenCells: RasterizationCell[];

      constructor() {
        this.workingUpLeftOpenCells = new Array<RasterizationCell>(512);
        this.workingDownRightOpenCells = new Array<RasterizationCell>(512);
        this.workingOpenCells = new Array<RasterizationCell>(512);
      }

      /**
       * This operation utilizes {@link RasterizationCell.contourFlags}. It
       * expects the value to be zero on entry, and re-zero's the value
       * on exit.
       *
       * @param grid a grid with fully built regions.
       */
      public fixObstacleRegion(grid: RasterizationGrid) {
        const workingUpLeftOpenCells = this.workingUpLeftOpenCells;
        workingUpLeftOpenCells.length = 0;
        const workingDownRightOpenCells = this.workingDownRightOpenCells;
        workingDownRightOpenCells.length = 0;
        const workingOpenCells = this.workingOpenCells;
        workingOpenCells.length = 0;
        const extremeCells: [
          RasterizationCell | null,
          RasterizationCell | null
        ] = [null, null];

        let nextRegionID = grid.regionCount;

        // Iterate over the cells, trying to find obstacle region borders.
        for (let y = 1; y < grid.dimY() - 1; y++) {
          for (let x = 1; x < grid.dimX() - 1; x++) {
            const cell = grid.get(x, y);

            if (cell.contourFlags !== 0)
              // Cell was processed in a previous iteration.
              // Ignore it.
              continue;

            cell.contourFlags = 1;

            let workingCell: RasterizationCell | null = null;
            let edgeDirection = -1;

            if (cell.regionID !== RasterizationCell.OBSTACLE_REGION_ID) {
              // Not interested in this cell.
              continue;
            }
            // This is a obstacle region cell. See if it
            // connects to a cell in a non-obstacle region.
            edgeDirection = this.getNonNullBorderDirection(grid, cell);
            if (edgeDirection === -1)
              // This cell is not a border cell. Ignore it.
              continue;

            // This is a border cell. Step into the non-null
            // region and swing the direction around 180 degrees.
            workingCell = grid.getNeighbor(cell, edgeDirection);
            edgeDirection = (edgeDirection + 2) & 0x3;

            // Process the obstacle region contour. Detect and fix
            // local issues. Determine if the region is
            // fully encompassed by a single non-obstacle region.
            const isEncompassedNullRegion = this.processNullRegion(
              grid,
              workingCell,
              edgeDirection,
              extremeCells
            );

            if (isEncompassedNullRegion) {
              // This cell is part of a group of obstacle region cells
              // that is encompassed within a single non-obstacle region.
              // This is not permitted. Need to fix it.
              this.partialFloodRegion(
                grid,
                extremeCells[0]!,
                extremeCells[1]!,
                nextRegionID
              );
              nextRegionID++;
            }
          }
        }

        grid.regionCount = nextRegionID;

        // Clear all flags.
        for (let y = 1; y < grid.dimY() - 1; y++) {
          for (let x = 1; x < grid.dimX() - 1; x++) {
            const cell = grid.get(x, y);
            cell.contourFlags = 0;
          }
        }
      }

      /**
       * Partially flood a region away from the specified direction.
       *
       * {@link RasterizationCell.contourFlags}
       * is set to zero for all flooded cells.
       *
       * @param grid
       * @param startCell The cell to start the flood from.
       * @param borderDirection  The hard border for flooding. No
       * cells in this direction from the startCell will be flooded.
       * @param newRegionID The region id to assign the flooded
       * cells to.
       */
      private partialFloodRegion(
        grid: RasterizationGrid,
        upLeftCell: RasterizationCell,
        downRightCell: RasterizationCell,
        newRegionID: integer
      ): void {
        let upLeftOpenCells = this.workingUpLeftOpenCells;
        let downRightOpenCells = this.workingDownRightOpenCells;
        let workingOpenCells = this.workingOpenCells;
        // The implementation differs from CritterAI to avoid non-contiguous
        // sections. Instead of brushing in one direction, it floods from
        // 2 extremities of the encompassed obstacle region.

        const regionID = upLeftCell.regionID;

        if (regionID === newRegionID) {
          // avoid infinity loop
          console.error(
            "Can't create a new region with an ID that already exist."
          );
          return;
        }

        // The 1st flooding set a new the regionID
        upLeftCell.regionID = newRegionID;
        upLeftCell.distanceToRegionCore = 0; // This information is lost.
        upLeftOpenCells.length = 0;
        upLeftOpenCells.push(upLeftCell);

        // The 2nd flooding keep the regionID and mark the cell as visited.
        downRightCell.contourFlags = 2;
        downRightCell.distanceToRegionCore = 0; // This information is lost.
        downRightOpenCells.length = 0;
        downRightOpenCells.push(downRightCell);

        let swap: RasterizationCell[];
        workingOpenCells.length = 0;

        while (
          upLeftOpenCells.length !== 0 ||
          downRightOpenCells.length !== 0
        ) {
          for (const cell of upLeftOpenCells) {
            for (let direction = 0; direction < 4; direction++) {
              const neighbor = grid.getNeighbor(cell, direction);
              if (
                neighbor.regionID !== regionID ||
                neighbor.contourFlags === 2
              ) {
                continue;
              }

              // Transfer the neighbor to the new region.
              neighbor.regionID = newRegionID;
              neighbor.distanceToRegionCore = 0; // This information is lost.

              workingOpenCells.push(neighbor);
            }
          }

          // This allows to flood the nearest cells first without needing lifo queue.
          // But a queue would take less memory.
          swap = upLeftOpenCells;
          upLeftOpenCells = workingOpenCells;
          workingOpenCells = swap;
          workingOpenCells.length = 0;

          for (const cell of downRightOpenCells) {
            for (let direction = 0; direction < 4; direction++) {
              const neighbor = grid.getNeighbor(cell, direction);
              if (
                neighbor.regionID !== regionID ||
                neighbor.contourFlags === 2
              ) {
                continue;
              }

              // Keep the neighbor to the current region.
              neighbor.contourFlags = 2;
              neighbor.distanceToRegionCore = 0; // This information is lost.

              workingOpenCells.push(neighbor);
            }
          }

          swap = downRightOpenCells;
          downRightOpenCells = workingOpenCells;
          workingOpenCells = swap;
          workingOpenCells.length = 0;
        }
      }

      /**
       * Detects and fixes bad cell configurations in the vicinity of a
       * obstacle region contour (See class description for details).
       * @param grid
       * @param startCell A cell in a non-obstacle region that borders a null
       * region.
       * @param startDirection The direction of the obstacle region border.
       * @return TRUE if the start cell's region completely encompasses
       * the obstacle region.
       */
      private processNullRegion(
        grid: RasterizationGrid,
        startCell: RasterizationCell,
        startDirection: integer,
        extremeCells: [RasterizationCell | null, RasterizationCell | null]
      ): boolean {
        // This algorithm traverses the contour. As it does so, it detects
        // and fixes various known dangerous cell configurations.
        //
        // Traversing the contour:  A good way to  visualize it is to think
        // of a robot sitting on the floor facing  a known wall. It then
        // does the following to skirt the wall:
        // 1. If there is a wall in front of it, turn clockwise in 90 degrees
        //    increments until it finds the wall is gone.
        // 2. Move forward one step.
        // 3. Turn counter-clockwise by 90 degrees.
        // 4. Repeat from step 1 until it finds itself at its original
        //    location facing its original direction.
        //
        // See also: http://www.critterai.org/projects/nmgen_study/regiongen.html#robotwalk
        //
        // As the traversal occurs, the number of acute (90 degree) and
        // obtuse (270 degree) corners are monitored. If a complete contour is
        // detected and (obtuse corners > acute corners), then the null
        // region is inside the contour. Otherwise the obstacle region is
        // outside the contour, which we don't care about.

        const borderRegionID = startCell.regionID;

        // Prepare for loop.
        let cell = startCell;
        let neighbor: RasterizationCell | null = null;
        let direction = startDirection;

        let upLeftCell = cell;
        let downRightCell = cell;

        // Initialize monitoring variables.
        let loopCount = 0;
        let acuteCornerCount = 0;
        let obtuseCornerCount = 0;
        let stepsWithoutBorder = 0;
        let borderSeenLastLoop = false;
        let isBorder = true; // Initial value doesn't matter.

        // Assume a single region is connected to the obstacle region
        // until proven otherwise.
        let hasSingleConnection = true;

        // The loop limit exists for the sole reason of preventing
        // an infinite loop in case of bad input data.
        // It is set to a very high value because there is no way of
        // definitively determining a safe smaller value. Setting
        // the value too low can result in rescanning a contour
        // multiple times, killing performance.
        while (++loopCount < 1 << 30) {
          // Get the cell across the border.
          neighbor = grid.getNeighbor(cell, direction);

          // Detect which type of edge this direction points across.
          if (neighbor === null) {
            // It points across a obstacle region border edge.
            isBorder = true;
          } else {
            // We never need to perform contour detection
            // on this cell again. So mark it as processed.
            neighbor.contourFlags = 1;
            if (neighbor.regionID === RasterizationCell.OBSTACLE_REGION_ID) {
              // It points across a obstacle region border edge.
              isBorder = true;
            } else {
              // This isn't a obstacle region border.
              isBorder = false;
              if (neighbor.regionID !== borderRegionID)
                // It points across a border to a non-obstacle region.
                // This means the current contour can't
                // represent a fully encompassed obstacle region.
                hasSingleConnection = false;
            }
          }

          // Process the border.
          if (isBorder) {
            // It is a border edge.
            if (borderSeenLastLoop) {
              // A border was detected during the last loop as well.
              // Two detections in a row indicates we passed an acute
              // (inner) corner.
              //
              //     a x
              //     x x
              acuteCornerCount++;
            } else if (stepsWithoutBorder > 1) {
              // We have moved at least two cells before detecting
              // a border. This indicates we passed an obtuse
              // (outer) corner.
              //
              //     a a
              //     a x
              obtuseCornerCount++;
              stepsWithoutBorder = 0;
              // Detect and fix cell configuration issue around this
              // corner.
              if (this.processOuterCorner(grid, cell, direction))
                // A change was made and it resulted in the
                // corner area having multiple region connections.
                hasSingleConnection = false;
            }
            direction = (direction + 1) & 0x3; // Rotate in clockwise direction.
            borderSeenLastLoop = true;
            stepsWithoutBorder = 0;
          } else {
            // Not a obstacle region border.
            // Move to the neighbor and swing the search direction back
            // one increment (counterclockwise). By moving the direction
            // back one increment we guarantee we don't miss any edges.
            cell = neighbor;
            direction = (direction + 3) & 0x3; // Rotate counterclockwise direction.
            borderSeenLastLoop = false;
            stepsWithoutBorder++;

            if (
              cell.x < upLeftCell.x ||
              (cell.x === upLeftCell.x && cell.y < upLeftCell.y)
            ) {
              upLeftCell = cell;
            }
            if (
              cell.x > downRightCell.x ||
              (cell.x === downRightCell.x && cell.y > downRightCell.y)
            ) {
              downRightCell = cell;
            }
          }

          if (startCell === cell && startDirection === direction) {
            extremeCells[0] = upLeftCell;
            extremeCells[1] = downRightCell;
            // Have returned to the original cell and direction.
            // The search is complete.
            // Is the obstacle region inside the contour?
            return hasSingleConnection && obtuseCornerCount > acuteCornerCount;
          }
        }

        // If got here then the obstacle region boarder is too large to be fully
        // explored. So it can't be encompassed.
        return false;
      }

      /**
       * Detects and fixes cell configuration issues in the vicinity
       * of obtuse (outer) obstacle region corners.
       * @param grid
       * @param referenceCell The cell in a non-obstacle region that is
       * just past the outer corner.
       * @param borderDirection The direction of the obstacle region border.
       * @return TRUE if more than one region connects to the obstacle region
       * in the vicinity of the corner (this may or may not be due to
       * a change made by this operation).
       */
      private processOuterCorner(
        grid: RasterizationGrid,
        referenceCell: RasterizationCell,
        borderDirection: integer
      ): boolean {
        let hasMultiRegions = false;

        // Get the previous two cells along the border.
        let backOne = grid.getNeighbor(
          referenceCell,
          (borderDirection + 3) & 0x3
        );
        let backTwo = grid.getNeighbor(backOne, borderDirection);
        let testCell: RasterizationCell;

        if (
          backOne.regionID !== referenceCell.regionID &&
          // This differ from the CritterAI implementation.
          // To filter vertices in the middle, this must be avoided too:
          //     a x
          //     b c
          backTwo.regionID !== backOne.regionID
        ) {
          // Dangerous corner configuration.
          //
          //     a x
          //     b a
          //
          // Need to change to one of the following configurations:
          //
          //     b x        a x
          //     b a        b b
          //
          // Reason: During contour detection this type of configuration can
          // result in the region connection being detected as a
          // region-region portal, when it is not. The region connection
          // is actually interrupted by the obstacle region.
          //
          // This configuration has been demonstrated to result in
          // two regions being improperly merged to encompass an
          // internal obstacle region.
          //
          // Example:
          //
          //     a a x x x a
          //     a a x x a a
          //     b b a a a a
          //     b b a a a a
          //
          // During contour and connection detection for region b, at no
          // point will the obstacle region be detected. It will appear
          // as if a clean a-b portal exists.
          //
          // An investigation into fixing this issue via updates to the
          // watershed or contour detection algorithms did not turn
          // up a better way of resolving this issue.
          hasMultiRegions = true;
          // Determine how many connections backTwo has to backOne's region.
          testCell = grid.getNeighbor(backOne, (borderDirection + 3) & 0x3);
          let backTwoConnections = 0;
          if (testCell.regionID === backOne.regionID) {
            backTwoConnections++;
            testCell = grid.getNeighbor(testCell, borderDirection);
            if (testCell.regionID === backOne.regionID) backTwoConnections++;
          }
          // Determine how many connections the reference cell has
          // to backOne's region.
          let referenceConnections = 0;
          testCell = grid.getNeighbor(backOne, (borderDirection + 2) & 0x3);
          if (testCell.regionID === backOne.regionID) {
            referenceConnections++;
            testCell = grid.getNeighbor(testCell, (borderDirection + 2) & 0x3);
            if (testCell.regionID === backOne.regionID) backTwoConnections++;
          }
          // Change the region of the cell that has the most connections
          // to the target region.
          if (referenceConnections > backTwoConnections)
            referenceCell.regionID = backOne.regionID;
          else backTwo.regionID = backOne.regionID;
        } else if (
          backOne.regionID === referenceCell.regionID &&
          backTwo.regionID === referenceCell.regionID
        ) {
          // Potential dangerous short wrap.
          //
          //  a x
          //  a a
          //
          //  Example of actual problem configuration:
          //
          //  b b x x
          //  b a x x <- Short wrap.
          //  b a a a
          //
          //  In the above case, the short wrap around the corner of the
          //  obstacle region has been demonstrated to cause self-intersecting
          //  polygons during polygon formation.
          //
          //  This algorithm detects whether or not one (and only one)
          //  of the axis neighbors of the corner should be re-assigned to
          //  a more appropriate region.
          //
          //  In the above example, the following configuration is more
          //  appropriate:
          //
          //  b b x x
          //  b b x x <- Change to this row.
          //  b a a a
          // Check to see if backTwo should be in a different region.
          let selectedRegion = this.selectedRegionID(
            grid,
            backTwo,
            (borderDirection + 1) & 0x3,
            (borderDirection + 2) & 0x3
          );
          if (selectedRegion === backTwo.regionID) {
            // backTwo should not be re-assigned. How about
            // the reference cell?
            selectedRegion = this.selectedRegionID(
              grid,
              referenceCell,
              borderDirection,
              (borderDirection + 3) & 0x3
            );
            if (selectedRegion !== referenceCell.regionID) {
              // The reference cell should be reassigned
              // to a new region.
              referenceCell.regionID = selectedRegion;
              hasMultiRegions = true;
            }
          } else {
            // backTwo should be re-assigned to a new region.
            backTwo.regionID = selectedRegion;
            hasMultiRegions = true;
          }
        } else hasMultiRegions = true;
        // No dangerous configurations detected. But definitely
        // has a change in regions at the corner. We know this
        // because one of the previous checks looked for a single
        // region for all wrap cells.
        return hasMultiRegions;
      }

      /**
       * Checks the cell to see if it should be reassigned to a new region.
       *
       * @param grid
       * @param referenceCell A cell on one side of an obstacle region contour's
       * outer corner. It is expected that the all cells that wrap the
       * corner are in the same region.
       * @param borderDirection  The direction of the obstacle region border.
       * @param cornerDirection The direction of the outer corner from the
       * reference cell.
       * @return The region the cell should be a member of. May be the
       * region the cell is currently a member of.
       */
      private selectedRegionID(
        grid: RasterizationGrid,
        referenceCell: RasterizationCell,
        borderDirection: integer,
        cornerDirection: integer
      ): integer {
        // Initial example state:
        //
        // a - Known region.
        // x - Null region.
        // u - Unknown, not checked yet.
        //
        //     u u u
        //     u a x
        //     u a a

        // The only possible alternate region id is from
        // the cell that is opposite the border. So check it first.
        let regionID = grid.getNeighbor(
          referenceCell,
          (borderDirection + 2) & 0x3
        ).regionID;
        if (
          regionID === referenceCell.regionID ||
          regionID === RasterizationCell.OBSTACLE_REGION_ID
        )
          // The region away from the border is either a obstacle region
          // or the same region. So we keep the current region.
          //
          //     u u u      u u u
          //     a a x  or  x a x  <-- Potentially bad, but stuck with it.
          //     u a a      u a a
          return referenceCell.regionID;

        // Candidate region for re-assignment.
        let potentialRegion = regionID;

        // Next we check the region opposite from the corner direction.
        // If it is the current region, then we definitely can't
        // change the region id without risk of splitting the region.
        regionID = grid.getNeighbor(referenceCell, (cornerDirection + 2) & 0x3)
          .regionID;
        if (
          regionID === referenceCell.regionID ||
          regionID === RasterizationCell.OBSTACLE_REGION_ID
        )
          // The region opposite from the corner direction is
          // either a obstacle region or the same region. So we
          // keep the current region.
          //
          //     u a u      u x u
          //     b a x  or  b a x
          //     u a a      u a a
          return referenceCell.regionID;

        // We have checked the early exit special cases. Now a generalized
        // brute count is performed.
        //
        // Priority is given to the potential region. Here is why:
        // (Highly unlikely worst case scenario)
        //
        //     c c c    c c c
        //     b a x -> b b x  Select b even though b count == a count.
        //     b a a    b a a

        // Neighbors in potential region.
        // We know this will have a minimum value of 1.
        let potentialCount = 0;

        // Neighbors in the cell's current region.
        // We know this will have a minimum value of 2.
        let currentCount = 0;

        // Maximum edge case:
        //
        //     b b b
        //     b a x
        //     b a a
        //
        // The maximum edge case for region A can't exist. It
        // is filtered out during one of the earlier special cases
        // handlers.
        //
        // Other cases may exist if more regions are involved.
        // Such cases will tend to favor the current region.

        for (let direction = 0; direction < 8; direction++) {
          let regionID = grid.getNeighbor(referenceCell, direction).regionID;
          if (regionID === referenceCell.regionID) currentCount++;
          else if (regionID === potentialRegion) potentialCount++;
        }

        return potentialCount < currentCount
          ? referenceCell.regionID
          : potentialRegion;
      }

      /**
       * Returns the direction of the first neighbor in a non-obstacle region.
       * @param grid
       * @param cell The cell to check.
       * @return The direction of the first neighbor in a non-obstacle region, or
       * -1 if all neighbors are in the obstacle region.
       */
      private getNonNullBorderDirection(
        grid: RasterizationGrid,
        cell: RasterizationCell
      ): integer {
        // Search axis-neighbors.
        for (
          let direction = 0;
          direction < RasterizationGrid.neighbor4Deltas.length;
          direction++
        ) {
          const delta = RasterizationGrid.neighbor4Deltas[direction];

          const neighbor = grid.get(cell.x + delta.x, cell.y + delta.y);
          if (neighbor.regionID !== RasterizationCell.OBSTACLE_REGION_ID)
            // The neighbor is a obstacle region.
            return direction;
        }
        // All neighbors are in a non-obstacle region.
        return -1;
      }
    }

    /**
     * This implementation is strongly inspired from CritterAI class "Geometry".
     */
    export class Geometry {
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
       *
       * Behavior is undefined if the the closest distance is outside the
       * line segment.
       *
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
        // Reference: http://local.wasp.uwa.edu.au/~pbourke/geometry/pointline/
        //
        // The goal of the algorithm is to find the point on line segment AB
        // that is closest to P and then calculate the distance between P
        // and that point.

        const deltaABx = bx - ax;
        const deltaABy = by - ay;
        const deltaAPx = px - ax;
        const deltaAPy = py - ay;

        const segmentABLengthSq = deltaABx * deltaABx + deltaABy * deltaABy;
        if (segmentABLengthSq === 0) {
          // AB is not a line segment. So just return
          // distanceSq from P to A
          return deltaAPx * deltaAPx + deltaAPy * deltaAPy;
        }

        const u =
          (deltaAPx * deltaABx + deltaAPy * deltaABy) / segmentABLengthSq;
        if (u < 0) {
          // Closest point on line AB is outside outside segment AB and
          // closer to A. So return distanceSq from P to A.
          return deltaAPx * deltaAPx + deltaAPy * deltaAPy;
        } else if (u > 1) {
          // Closest point on line AB is outside segment AB and closer to B.
          // So return distanceSq from P to B.
          return (px - bx) * (px - bx) + (py - by) * (py - by);
        }

        // Closest point on lineAB is inside segment AB. So find the exact
        // point on AB and calculate the distanceSq from it to P.

        // The calculation in parenthesis is the location of the point on
        // the line segment.
        const deltaX = ax + u * deltaABx - px;
        const deltaY = ay + u * deltaABy - py;

        return deltaX * deltaX + deltaY * deltaY;
      }
    }

    /**
     * It rasterizes obstacles on a grid.
     *
     * It flags cells as obstacle to be used by {@link RegionGenerator}.
     */
    export class ObstacleRasterizer {
      workingNodes: integer[];
      gridBasisIterable: GridBasisIterable;

      constructor() {
        this.workingNodes = new Array<integer>(8);
        this.gridBasisIterable = new GridBasisIterable();
      }

      /**
       * Rasterize obstacles on a grid.
       * @param grid
       * @param obstacles
       */
      rasterizeObstacles(
        grid: RasterizationGrid,
        obstacles: Iterable<Iterable<Point>>
      ) {
        const obstaclesItr = obstacles[Symbol.iterator]();
        for (
          let next = obstaclesItr.next();
          !next.done;
          next = obstaclesItr.next()
        ) {
          const obstacle = next.value;
          this.gridBasisIterable.set(grid, obstacle);
          const vertices = this.gridBasisIterable;

          let minX = Number.MAX_VALUE;
          let maxX = -Number.MAX_VALUE;
          let minY = Number.MAX_VALUE;
          let maxY = -Number.MAX_VALUE;
          const verticesItr = vertices[Symbol.iterator]();
          for (
            let next = verticesItr.next();
            !next.done;
            next = verticesItr.next()
          ) {
            const vertex = next.value;
            minX = Math.min(minX, vertex.x);
            maxX = Math.max(maxX, vertex.x);
            minY = Math.min(minY, vertex.y);
            maxY = Math.max(maxY, vertex.y);
          }
          minX = Math.max(Math.floor(minX), 0);
          maxX = Math.min(Math.ceil(maxX), grid.dimX());
          minY = Math.max(Math.floor(minY), 0);
          maxY = Math.min(Math.ceil(maxY), grid.dimY());
          this.fillPolygon(
            vertices,
            minX,
            maxX,
            minY,
            maxY,
            (x: integer, y: integer) => (grid.get(x, y).distanceToObstacle = 0)
          );
        }
      }

      private fillPolygon(
        vertices: Iterable<Point>,
        minX: integer,
        maxX: integer,
        minY: integer,
        maxY: integer,
        fill: (x: number, y: number) => void
      ) {
        // The following implementation of the scan-line polygon fill algorithm
        // is strongly inspired from:
        // https://alienryderflex.com/polygon_fill/
        // The original implementation was under this license:
        // public-domain code by Darel Rex Finley, 2007

        // This implementation differ with the following:
        // - it handles float vertices
        //   so it focus on pixels center
        // - it is conservative to thin vertical or horizontal polygons

        let fillAnyPixels = false;
        this.scanY(
          vertices,
          minX,
          maxX,
          minY,
          maxY,
          (pixelY: integer, minX: float, maxX: float) => {
            for (let pixelX = minX; pixelX < maxX; pixelX++) {
              fillAnyPixels = true;
              fill(pixelX, pixelY);
            }
          }
        );

        if (fillAnyPixels) {
          return;
        }

        this.scanY(
          vertices,
          minX,
          maxX,
          minY,
          maxY,
          (pixelY: integer, minX: float, maxX: float) => {
            // conserve thin (less than one cell large) horizontal polygons
            if (minX === maxX) {
              fill(minX, pixelY);
            }
          }
        );

        this.scanX(
          vertices,
          minX,
          maxX,
          minY,
          maxY,
          (pixelX: integer, minY: float, maxY: float) => {
            for (let pixelY = minY; pixelY < maxY; pixelY++) {
              fill(pixelX, pixelY);
            }
            // conserve thin (less than one cell large) vertical polygons
            if (minY === maxY) {
              fill(pixelX, minY);
            }
          }
        );
      }

      private scanY(
        vertices: Iterable<Point>,
        minX: integer,
        maxX: integer,
        minY: integer,
        maxY: integer,
        checkAndFillY: (pixelY: integer, minX: float, maxX: float) => void
      ) {
        const workingNodes = this.workingNodes;
        //  Loop through the rows of the image.
        for (let pixelY = minY; pixelY < maxY; pixelY++) {
          const pixelCenterY = pixelY + 0.5;
          //  Build a list of nodes.
          workingNodes.length = 0;
          //let j = vertices.length - 1;

          const verticesItr = vertices[Symbol.iterator]();
          let next = verticesItr.next();
          let vertex = next.value;
          // The iterator always return the same instance.
          // It must be copied to be save for later.
          const firstVertexX = vertex.x;
          const firstVertexY = vertex.y;
          while (!next.done) {
            const previousVertexX = vertex.x;
            const previousVertexY = vertex.y;
            next = verticesItr.next();
            if (next.done) {
              vertex.x = firstVertexX;
              vertex.y = firstVertexY;
            } else {
              vertex = next.value;
            }
            if (
              (vertex.y <= pixelCenterY && pixelCenterY < previousVertexY) ||
              (previousVertexY < pixelCenterY && pixelCenterY <= vertex.y)
            ) {
              workingNodes.push(
                Math.round(
                  vertex.x +
                    ((pixelCenterY - vertex.y) / (previousVertexY - vertex.y)) *
                      (previousVertexX - vertex.x)
                )
              );
            }
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
            if (workingNodes[i] >= maxX) {
              break;
            }
            if (workingNodes[i + 1] <= minX) {
              continue;
            }
            if (workingNodes[i] < minX) {
              workingNodes[i] = minX;
            }
            if (workingNodes[i + 1] > maxX) {
              workingNodes[i + 1] = maxX;
            }
            checkAndFillY(pixelY, workingNodes[i], workingNodes[i + 1]);
          }
        }
      }

      private scanX(
        vertices: Iterable<Point>,
        minX: integer,
        maxX: integer,
        minY: integer,
        maxY: integer,
        checkAndFillX: (pixelX: integer, minY: float, maxY: float) => void
      ) {
        const workingNodes = this.workingNodes;
        //  Loop through the columns of the image.
        for (let pixelX = minX; pixelX < maxX; pixelX++) {
          const pixelCenterX = pixelX + 0.5;
          //  Build a list of nodes.
          workingNodes.length = 0;

          const verticesItr = vertices[Symbol.iterator]();
          let next = verticesItr.next();
          let vertex = next.value;
          // The iterator always return the same instance.
          // It must be copied to be save for later.
          const firstVertexX = vertex.x;
          const firstVertexY = vertex.y;
          while (!next.done) {
            const previousVertexX = vertex.x;
            const previousVertexY = vertex.y;
            next = verticesItr.next();
            if (next.done) {
              vertex.x = firstVertexX;
              vertex.y = firstVertexY;
            } else {
              vertex = next.value;
            }
            if (
              (vertex.x < pixelCenterX && pixelCenterX < previousVertexX) ||
              (previousVertexX < pixelCenterX && pixelCenterX < vertex.x)
            ) {
              workingNodes.push(
                Math.round(
                  vertex.y +
                    ((pixelCenterX - vertex.x) / (previousVertexX - vertex.x)) *
                      (previousVertexY - vertex.y)
                )
              );
            }
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
            if (workingNodes[i] >= maxY) {
              break;
            }
            if (workingNodes[i + 1] <= minY) {
              continue;
            }
            if (workingNodes[i] < minY) {
              workingNodes[i] = minY;
            }
            if (workingNodes[i + 1] > maxY) {
              workingNodes[i + 1] = maxY;
            }
            checkAndFillX(pixelX, workingNodes[i], workingNodes[i + 1]);
          }
        }
      }
    }

    /**
     * Iterable that converts coordinates to the grid.
     *
     * This is an allocation free iterable
     * that can only do one iteration at a time.
     */
    class GridBasisIterable implements Iterable<Point> {
      grid: RasterizationGrid | null;
      sceneVertices: Iterable<Point>;
      verticesItr: Iterator<Point>;
      result: IteratorResult<Point, any>;

      constructor() {
        this.grid = null;
        this.sceneVertices = [];
        this.verticesItr = this.sceneVertices[Symbol.iterator]();
        this.result = {
          value: { x: 0, y: 0 },
          done: false,
        };
      }

      set(grid: RasterizationGrid, sceneVertices: Iterable<Point>) {
        this.grid = grid;
        this.sceneVertices = sceneVertices;
      }

      [Symbol.iterator]() {
        this.verticesItr = this.sceneVertices[Symbol.iterator]();
        return this;
      }

      next() {
        const next = this.verticesItr.next();
        if (next.done) {
          return next;
        }
        this.grid!.convertToGridBasis(next.value, this.result.value);
        return this.result;
      }
    }
  }
}
