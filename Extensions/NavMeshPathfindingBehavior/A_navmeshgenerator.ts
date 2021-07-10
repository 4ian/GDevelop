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

    dimX() {
      return this.cells.length;
    }

    dimY() {
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

  export class NavMeshGenerator {

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
          NavMeshGenerator.buildRawContours(grid, cell, startDir, workingRawVerts);
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
        console.log("buildRawContours x:" + startCell.x + " y: " + startCell.y);
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
          let upperX = lineEnd[0];
          let upperY = lineEnd[1];
          let lowerY = lineEnd[1];

          // outline the polygon
          for (let index = 1; index < polygon.vertices.length + 1; index++) {
            const swap = lineStart;
            lineStart = lineEnd;
            lineEnd = grid.convertToGridBasis(
              polygon.vertices[index % polygon.vertices.length],
              swap
            );
            NavMeshGenerator.rasterizeLine(
              lineStart[0],
              lineStart[1],
              lineEnd[0],
              lineEnd[1],
              (x: integer, y: integer) => grid.get(x, y).setObstacle()
            );
            if (lineEnd[1] < upperY) {
              upperX = lineEnd[0];
              upperY = lineEnd[1];
            }
            if (lineEnd[1] > lowerY) {
              lowerY = lineEnd[1];
            }
          }
          // fill the polygon
          for (let y = upperY + 1; y < lowerY; y++) {
            const cell = grid.get(upperX, y);
            if (cell.isObstacle) continue;
            cell.setObstacle();
            for (let x = upperX - 1; !grid.get(x, y).isObstacle; x--) {
              grid.get(x, y).setObstacle();
            }
            for (let x = upperX + 1; !grid.get(x, y).isObstacle; x++) {
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
