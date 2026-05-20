/*
 * GDevelop JS Platform
 * Copyright 2013-present Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * A spatial hash grid for broad-phase collision culling.
   *
   * Objects are inserted by their axis-aligned bounding box (AABB) and can
   * be queried by region to find potential overlapping candidates, avoiding
   * the O(N×M) cost of testing every pair.
   *
   * **Important — duplicate results:** An item whose AABB spans multiple
   * grid cells will be stored in each of those cells.  Consequently,
   * {@link queryToArray} may return the same item more than once.  Callers
   * are responsible for de-duplicating results if needed.  The collision
   * pipeline in `objecttools.ts` handles this implicitly via `pick` flags.
   *
   * @category Utils > Geometry
   */
  export class SpatialHashGrid<T> {
    /** Width/height of each grid cell. */
    private _cellSize: number;
    /** 1 / cellSize, cached to replace divisions with multiplications. */
    private _invCellSize: number;
    /** Map from hashed cell key → array of items in that cell. */
    private _grid: Map<number, T[]> = new Map();
    /** Pool of reusable arrays to reduce GC pressure. */
    private _pooledArrays: T[][] = [];

    constructor(cellSize: number) {
      this._cellSize = cellSize;
      this._invCellSize = 1 / cellSize;
    }

    /** Change the cell size (also clears the grid). */
    setCellSize(cellSize: number): void {
      this._cellSize = cellSize;
      this._invCellSize = 1 / cellSize;
      this.clear();
    }

    getCellSize(): number {
      return this._cellSize;
    }

    /** Remove all items, returning internal arrays to the pool. */
    clear(): void {
      this._grid.forEach((arr) => {
        arr.length = 0;
        this._pooledArrays.push(arr);
      });
      this._grid.clear();
    }

    /**
     * Trim the internal array pool to at most `maxSize` entries.
     *
     * The pool grows as cells are cleared but is never shrunk automatically.
     * Call this after a one-time spike (e.g. a scene with many temporary
     * objects) to release memory that is no longer needed.
     */
    trimPool(maxSize: number): void {
      if (this._pooledArrays.length > maxSize) {
        this._pooledArrays.length = maxSize;
      }
    }

    /**
     * Convert a world coordinate to a cell index, correctly handling
     * negative values (where `| 0` truncates toward zero instead of
     * flooring).
     */
    private _toCell(v: number): number {
      const c = v * this._invCellSize;
      return c >= 0 ? c | 0 : Math.floor(c);
    }

    /**
     * Hash a 2D cell coordinate to a single integer key.
     * Uses multiplication with large primes + XOR to distribute evenly.
     *
     * Hash collisions are harmless: they only cause extra candidates to be
     * returned by {@link queryToArray}, but every candidate is still
     * validated by the full collision predicate, so correctness is
     * unaffected.
     */
    private _hashKey(cellX: number, cellY: number): number {
      return ((cellX * 92837111) ^ (cellY * 689287499)) | 0;
    }

    /** Get or create the array for a grid cell. */
    private _getOrCreateCell(key: number): T[] {
      let cell = this._grid.get(key);
      if (!cell) {
        cell = this._pooledArrays.length > 0 ? this._pooledArrays.pop()! : [];
        this._grid.set(key, cell);
      }
      return cell;
    }

    /**
     * Insert an item into every cell its AABB overlaps.
     *
     * @param item The item to store.
     * @param minX Left edge of the item's AABB.
     * @param minY Top edge of the item's AABB.
     * @param maxX Right edge of the item's AABB.
     * @param maxY Bottom edge of the item's AABB.
     */
    insert(
      item: T,
      minX: number,
      minY: number,
      maxX: number,
      maxY: number
    ): void {
      const minCellX = this._toCell(minX);
      const minCellY = this._toCell(minY);
      const maxCellX = this._toCell(maxX);
      const maxCellY = this._toCell(maxY);

      for (let cx = minCellX; cx <= maxCellX; cx++) {
        for (let cy = minCellY; cy <= maxCellY; cy++) {
          this._getOrCreateCell(this._hashKey(cx, cy)).push(item);
        }
      }
    }

    /**
     * Collect every item stored in cells that overlap the query region.
     *
     * **Note:** an item that spans multiple cells may appear more than once
     * in `result`.  Callers should de-duplicate if needed (the collision
     * pipeline's `pick` flags already handle this).
     *
     * @param minX Left edge of the query region.
     * @param minY Top edge of the query region.
     * @param maxX Right edge of the query region.
     * @param maxY Bottom edge of the query region.
     * @param result Array to push matches into (NOT cleared by this method).
     */
    queryToArray(
      minX: number,
      minY: number,
      maxX: number,
      maxY: number,
      result: T[]
    ): void {
      const minCellX = this._toCell(minX);
      const minCellY = this._toCell(minY);
      const maxCellX = this._toCell(maxX);
      const maxCellY = this._toCell(maxY);

      for (let cx = minCellX; cx <= maxCellX; cx++) {
        for (let cy = minCellY; cy <= maxCellY; cy++) {
          const cell = this._grid.get(this._hashKey(cx, cy));
          if (cell) {
            for (let i = 0, len = cell.length; i < len; i++) {
              result.push(cell[i]);
            }
          }
        }
      }
    }
  }
}
