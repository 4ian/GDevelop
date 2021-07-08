namespace gdjs {
  export class RasterizationCells {
    isObstacle: boolean = false;
    distanceToObstacle: integer = Number.MAX_VALUE;

    setObstacle() {
      this.isObstacle = true;
      this.distanceToObstacle = 0;
    }
  }

  export class RasterizationGrid {
    originX: float;
    originY: float;
    cellSize: float;
    cells: RasterizationCells[][];

    constructor(
      left: float,
      top: float,
      right: float,
      bottom: float,
      cellSize: float
    ) {
      this.cellSize = cellSize;
      this.originX = left;
      this.originY = top;

      const dimX = Math.ceil((right - left) / cellSize);
      const dimY = Math.ceil((bottom - top) / cellSize);
      this.cells = [];
      for (var x = 0; x < dimX; x++) {
        this.cells[x] = [];

        for (var y = 0; y < dimY; y++) {
          this.cells[x][y] = new RasterizationCells();
        }
      }
    }

    convertToGridBasis(position: FloatPoint, gridPosition: FloatPoint) {
      gridPosition[0] = (position[0] - this.originX) / this.cellSize;
      gridPosition[1] = (position[1] - this.originY) / this.cellSize;
      return gridPosition;
    }

    get(x: integer, y: integer) {
      return this.cells[x][y];
    }

    dimX() {
      return this.cells.length;
    }

    dimY() {
      return this.cells[0].length;
    }
  }

  export class NavMeshGenerator {

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
    private static generateDistanceField(grid: RasterizationGrid) {
      // close borders
      for (let x = 0; x < grid.dimX(); x++) {
        const leftCell = grid.get(x, 0);
        if (!leftCell.isObstacle) {
          grid.get(x, 0).distanceToObstacle = 1;
        }
        const rightCell = grid.get(x, grid.dimY() - 1);
        if (!rightCell.isObstacle) {
          rightCell.distanceToObstacle = 1;
        }
      }
      for (let y = 1; y < grid.dimY() - 1; y++) {
        const topCell = grid.get(0, y);
        if (!topCell.isObstacle) {
          topCell.distanceToObstacle = 1;
        }
        const bottomCell = grid.get(grid.dimX() - 1, y);
        if (!bottomCell.isObstacle) {
          bottomCell.distanceToObstacle = 1;
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
        for (let x = grid.dimX() - 2; x <= 1; x--) {
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

    private static raterizeObstacles(
      obstacles: RuntimeObject[],
      grid: RasterizationGrid
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
          for (let index = 1; index < polygon.vertices.length; index++) {
            const swap = lineStart;
            lineStart = lineEnd;
            lineEnd = grid.convertToGridBasis(polygon.vertices[index], swap);
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
          for (let y = upperY; y < lowerY; y++) {
            if (grid.get(upperX, y).isObstacle) continue;
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
