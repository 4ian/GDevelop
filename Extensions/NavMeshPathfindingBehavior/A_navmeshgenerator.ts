namespace gdjs {
  export class RasterizationCell {
    static NULL_REGION_ID = 0;

    x: integer;
    y: integer;
    isObstacle: boolean = false;
    distanceToObstacle: integer = Number.MAX_VALUE;
    regionID: integer = RasterizationCell.NULL_REGION_ID;
    distanceToRegionCore: integer = 0;

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

  export class NavMeshGenerator {
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
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
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
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
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
