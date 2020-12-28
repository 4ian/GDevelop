// @ts-nocheck
// Hierarchical Spatial Hash Grid: HSHG
//Note that this file has been customized so that HSHG is put into the gdjs object.
//Thus, it must be included after gd.js

namespace gdjs {
  gdjs.HSHG = gdjs.HSHG || {};

  (function (root, undefined) {
    //---------------------------------------------------------------------
    // GLOBAL FUNCTIONS
    //---------------------------------------------------------------------

    /**
     * Updates every object's position in the grid, but only if
     * the hash value for that object has changed.
     * This method DOES NOT take into account object expansion or
     * contraction, just position, and does not attempt to change
     * the grid the object is currently in; it only (possibly) changes
     * the cell.
     *
     * If the object has significantly changed in size, the best bet is to
     * call removeObject() and addObject() sequentially, outside of the
     * normal update cycle of HSHG.
     *
     * @return void
     */
    function update_RECOMPUTE(): any {
      let i, obj, grid, meta, objAABB, newObjHash;

      // for each object
      for (i = 0; i < this._globalObjects.length; i++) {
        obj = this._globalObjects[i];
        meta = obj.HSHG;
        grid = meta.grid;

        // recompute hash
        objAABB = obj.getAABB();
        newObjHash = grid.toHash(objAABB.min[0], objAABB.min[1]);
        if (newObjHash !== meta.hash) {
          // grid position has changed, update!
          grid.removeObject(obj);
          grid.addObject(obj, newObjHash);
        }
      }
    }

    function update_REMOVEALL() {}

    // not implemented yet :)
    function testAABBOverlap(objA, objB) {
      const a = objA.getAABB(),
        b = objB.getAABB();
      if (
        a.min[0] > b.max[0] ||
        a.min[1] > b.max[1] ||
        a.max[0] < b.min[0] ||
        a.max[1] < b.min[1]
      ) {
        return false;
      } else {
        return true;
      }
    }

    function getLongestAABBEdge(min, max) {
      return Math.max(Math.abs(max[0] - min[0]), Math.abs(max[1] - min[1]));
    }

    //---------------------------------------------------------------------
    // ENTITIES
    //---------------------------------------------------------------------

    /**
     * A hierarchical spatial grid containing objects and allowing fast test collisions between them.
     *
     * @class HSHG
     * @memberof gdjs.HSHG
     */
    class HSHG {
      MAX_OBJECT_CELL_DENSITY: any;

      // objects / cells
      INITIAL_GRID_LENGTH: number = 256;

      // 16x16
      HIERARCHY_FACTOR: number = 2;
      HIERARCHY_FACTOR_SQRT: any;
      UPDATE_METHOD: any;
      _grids: any = [];
      _globalObjects: any = [];

      /**
       * @param theObject The object to be tested against.
       */
      constructor() {
        this.MAX_OBJECT_CELL_DENSITY = 1 / 8;
        this.HIERARCHY_FACTOR_SQRT = Math.SQRT2;
        this.UPDATE_METHOD = update_RECOMPUTE;

        // or update_REMOVEALL
      }

      /**
       * Add an object to the grid. The object can be anything as long as it provides a getAABB method.
       * An 'HSHG' property is added to the object, and is then deleted when the object is removed from the HSHG.
       */
      addObject(obj) {
        let x;
        let i;
        let cellSize;
        const objAABB = obj.getAABB();
        const objSize = getLongestAABBEdge(objAABB.min, objAABB.max);
        let oneGrid;
        let newGrid;

        // for HSHG metadata
        obj.HSHG = { globalObjectsIndex: this._globalObjects.length };

        //TODO: recycle existing object if necessary.

        // add to global object array
        this._globalObjects.push(obj);
        if (this._grids.length === 0) {
          // no grids exist yet
          cellSize = objSize * this.HIERARCHY_FACTOR_SQRT;
          newGrid = new Grid(cellSize, this.INITIAL_GRID_LENGTH, this);
          newGrid.initCells();
          newGrid.addObject(obj);
          this._grids.push(newGrid);
        } else {
          x = 0;

          // grids are sorted by cellSize, smallest to largest
          for (i = 0; i < this._grids.length; i++) {
            oneGrid = this._grids[i];
            x = oneGrid.cellSize;
            if (objSize < x) {
              x = x / this.HIERARCHY_FACTOR;
              if (objSize < x) {
                // find appropriate size
                while (objSize < x) {
                  x = x / this.HIERARCHY_FACTOR;
                }
                newGrid = new Grid(
                  x * this.HIERARCHY_FACTOR,
                  this.INITIAL_GRID_LENGTH,
                  this
                );
                newGrid.initCells();

                // assign obj to grid
                newGrid.addObject(obj);

                // insert grid into list of grids directly before oneGrid
                this._grids.splice(i, 0, newGrid);
              } else {
                // insert obj into grid oneGrid
                oneGrid.addObject(obj);
              }
              return;
            }
          }
          while (objSize >= x) {
            x = x * this.HIERARCHY_FACTOR;
          }
          newGrid = new Grid(x, this.INITIAL_GRID_LENGTH, this);
          newGrid.initCells();

          // insert obj into grid
          newGrid.addObject(obj);

          // add newGrid as last element in grid list
          this._grids.push(newGrid);
        }
      }

      /**
       * Remove an object from the HSHG. The object must be in the HSHG before being removed.
       */
      removeObject(obj) {
        const meta = obj.HSHG;
        let globalObjectsIndex;
        let replacementObj;
        if (meta === undefined) {
          throw Error(obj + ' was not in the HSHG.');
          return;
        }

        // remove object from global object list
        globalObjectsIndex = meta.globalObjectsIndex;
        if (globalObjectsIndex === this._globalObjects.length - 1) {
          this._globalObjects.pop();
        } else {
          replacementObj = this._globalObjects.pop();
          replacementObj.HSHG.globalObjectsIndex = globalObjectsIndex;
          this._globalObjects[globalObjectsIndex] = replacementObj;
        }
        meta.grid.removeObject(obj);

        // remove meta data
        delete obj.HSHG;
      }

      /**
       * Must be called when objects have been moved ( typically at each "tick" of the game/simulation ).
       */
      update(): void {
        this.UPDATE_METHOD.call(this);
      }

      /**
       * Return a list of objects colliding with theObject.
       */
      queryForCollisionWith(theObject, result) {
        let i,
          j,
          k,
          l,
          c,
          grid,
          cell,
          objA,
          objB,
          offset,
          adjacentCell,
          biggerGrid,
          objAAABB,
          objAHashInBiggerGrid;
        result.length = 0;
        theObject.HSHG.excludeMe = true;
        const theObjectAABB = theObject.getAABB();
        const theObjectHashInItsGrid = theObject.HSHG.grid.toHash(
          theObjectAABB.min[0],
          theObjectAABB.min[1]
        );
        const theObjectCellInItsGrid =
          theObject.HSHG.grid.allCells[theObjectHashInItsGrid];

        // default broad test to internal aabb overlap test
        broadOverlapTest = testAABBOverlap;

        // for all grids ordered by cell size ASC
        for (i = 0; i < this._grids.length; i++) {
          grid = this._grids[i];

          //All collisions with object have now been registered
          if (grid.cellSize === theObject.HSHG.grid.cellSize) {
            //We're in the grid of theObject:

            // 1)Test against neighbors:

            // For each cell of the grid that is occupied
            for (j = 0; j < grid.occupiedCells.length; j++) {
              cell = grid.occupiedCells[j];

              // Collide all objects within the occupied cell
              for (l = 0; l < cell.objectContainer.length; l++) {
                objB = cell.objectContainer[l];

                //Note that objB could be theObject.
                if (
                  !objB.HSHG.excludeMe &&
                  broadOverlapTest(theObject, objB) === true
                ) {
                  result.push(objB);
                }
              }

              // For the first half of all adjacent cells (offset 4 is the current cell)
              for (c = 0; c < 4; c++) {
                offset = cell.neighborOffsetArray[c];
                adjacentCell = grid.allCells[cell.allCellsIndex + offset];

                // Collide all objects in cell with adjacent cell
                for (l = 0; l < adjacentCell.objectContainer.length; l++) {
                  objB = adjacentCell.objectContainer[l];

                  //Note that objB could be theObject.
                  if (
                    !objB.HSHG.excludeMe &&
                    broadOverlapTest(theObject, objB) === true
                  ) {
                    result.push(objB);
                  }
                }
              }
            }

            // 2)Test against objects of bigger grids:

            // For all grids with cellsize larger than the grid of theObject:
            for (k = i + 1; k < this._grids.length; k++) {
              biggerGrid = this._grids[k];
              const objectHashInBiggerGrid = biggerGrid.toHash(
                theObjectAABB.min[0],
                theObjectAABB.min[1]
              );
              cell = biggerGrid.allCells[objectHashInBiggerGrid];

              // Check theObject against every object in all cells in offset array of cell
              // for all adjacent cells...
              for (c = 0; c < cell.neighborOffsetArray.length; c++) {
                offset = cell.neighborOffsetArray[c];
                adjacentCell = biggerGrid.allCells[cell.allCellsIndex + offset];

                // for all objects in the adjacent cell...
                for (l = 0; l < adjacentCell.objectContainer.length; l++) {
                  objB = adjacentCell.objectContainer[l];

                  // Test against theObject: Note that objB is necessarily different from theObject.
                  if (broadOverlapTest(theObject, objB) === true) {
                    result.push(objB);
                  }
                }
              }
            }
            break;
          } else {
            if (grid.cellSize < theObject.HSHG.grid.cellSize) {
              // For all objects that are stored in this smaller grid
              for (j = 0; j < grid.allObjects.length; j++) {
                //Get the object of the smaller grid.
                objA = grid.allObjects[j];
                objAAABB = objA.getAABB();

                //Get its position in the (bigger) grid containing theObject.
                objAHashInBiggerGrid = theObject.HSHG.grid.toHash(
                  objAAABB.min[0],
                  objAAABB.min[1]
                );

                //Check if it is near theObject (i.e: Check if the cell of objA is a neighbor of the cell
                //of theObject ).
                let objAIsInAdjacentCellToObject = false;
                for (
                  c = 0;
                  c < theObjectCellInItsGrid.neighborOffsetArray.length;
                  c++
                ) {
                  offset = theObjectCellInItsGrid.neighborOffsetArray[c];
                  if (
                    objAHashInBiggerGrid ===
                    theObjectCellInItsGrid.allCellsIndex + offset
                  ) {
                    objAIsInAdjacentCellToObject = true;
                    break;
                  }
                }

                //If objA is near theObject, trigger a collision test.
                if (objAIsInAdjacentCellToObject) {
                  //Note that objA is necessarily different from theObject
                  if (broadOverlapTest(theObject, objA) === true) {
                    result.push(objA);
                  }
                }
              }
            }
          }
        }
        delete theObject.HSHG.excludeMe;
      }
    }
    HSHG.update_RECOMPUTE = update_RECOMPUTE;
    HSHG.update_REMOVEALL = update_REMOVEALL;

    /**
     * Grid
     *
     * @class Grid
     * @memberof gdjs.HSHG
     * @param cellSize {int} the pixel size of each cell of the grid
     * @param cellCount {int} the total number of cells for the grid (width x height)
     * @param parentHierarchy {HSHG} the HSHG to which this grid belongs
     * @return void
     */
    class Grid {
      cellSize: any;
      inverseCellSize: any;
      rowColumnCount: any;
      xyHashMask: any;
      occupiedCells: any = [];
      allCells: any;
      allObjects: any = [];
      sharedInnerOffsets: any = [];
      _parentHierarchy: any;

      constructor(cellSize, cellCount, parentHierarchy) {
        this.cellSize = cellSize;
        this.inverseCellSize = 1 / cellSize;
        this.rowColumnCount = ~~Math.sqrt(cellCount);
        this.xyHashMask = this.rowColumnCount - 1;
        this.allCells = Array(this.rowColumnCount * this.rowColumnCount);
        this._parentHierarchy = parentHierarchy || null;
      }

      initCells() {
        // TODO: inner/unique offset rows 0 and 2 may need to be
        // swapped due to +y being "down" vs "up"
        let i;
        const gridLength = this.allCells.length;
        let x;
        let y;
        const wh = this.rowColumnCount;
        let isOnRightEdge;
        let isOnLeftEdge;
        let isOnTopEdge;
        let isOnBottomEdge;
        const innerOffsets = [
          // y+ down offsets
          //-1 + -wh, -wh, -wh + 1,
          //-1, 0, 1,
          //wh - 1, wh, wh + 1
          // y+ up offsets
          wh - 1,
          wh,
          wh + 1,
          -1,
          0,
          1,
          -1 + -wh,
          -wh,
          -wh + 1,
        ];
        let leftOffset;
        let rightOffset;
        let topOffset;
        let bottomOffset;
        let uniqueOffsets = [];
        let cell;
        this.sharedInnerOffsets = innerOffsets;

        // init all cells, creating offset arrays as needed
        for (i = 0; i < gridLength; i++) {
          cell = new Cell();

          // compute row (y) and column (x) for an index
          y = ~~(i / this.rowColumnCount);
          x = ~~(i - y * this.rowColumnCount);

          // reset / init
          isOnRightEdge = false;
          isOnLeftEdge = false;
          isOnTopEdge = false;
          isOnBottomEdge = false;

          // right or left edge cell
          if ((x + 1) % this.rowColumnCount == 0) {
            isOnRightEdge = true;
          } else {
            if (x % this.rowColumnCount == 0) {
              isOnLeftEdge = true;
            }
          }

          // top or bottom edge cell
          if ((y + 1) % this.rowColumnCount == 0) {
            isOnTopEdge = true;
          } else {
            if (y % this.rowColumnCount == 0) {
              isOnBottomEdge = true;
            }
          }

          // if cell is edge cell, use unique offsets, otherwise use inner offsets
          if (isOnRightEdge || isOnLeftEdge || isOnTopEdge || isOnBottomEdge) {
            // figure out cardinal offsets first
            rightOffset = isOnRightEdge === true ? -wh + 1 : 1;
            leftOffset = isOnLeftEdge === true ? wh - 1 : -1;
            topOffset = isOnTopEdge === true ? -gridLength + wh : wh;
            bottomOffset = isOnBottomEdge === true ? gridLength - wh : -wh;

            // diagonals are composites of the cardinals
            uniqueOffsets = [
              // y+ down offset
              //leftOffset + bottomOffset, bottomOffset, rightOffset + bottomOffset,
              //leftOffset, 0, rightOffset,
              //leftOffset + topOffset, topOffset, rightOffset + topOffset
              // y+ up offset
              leftOffset + topOffset,
              topOffset,
              rightOffset + topOffset,
              leftOffset,
              0,
              rightOffset,
              leftOffset + bottomOffset,
              bottomOffset,
              rightOffset + bottomOffset,
            ];
            cell.neighborOffsetArray = uniqueOffsets;
          } else {
            cell.neighborOffsetArray = this.sharedInnerOffsets;
          }
          cell.allCellsIndex = i;
          this.allCells[i] = cell;
        }
      }

      toHash(x, y, z) {
        let i, xHash, yHash, zHash;
        if (x < 0) {
          i = -x * this.inverseCellSize;
          xHash = this.rowColumnCount - 1 - (~~i & this.xyHashMask);
        } else {
          i = x * this.inverseCellSize;
          xHash = ~~i & this.xyHashMask;
        }
        if (y < 0) {
          i = -y * this.inverseCellSize;
          yHash = this.rowColumnCount - 1 - (~~i & this.xyHashMask);
        } else {
          i = y * this.inverseCellSize;
          yHash = ~~i & this.xyHashMask;
        }
        return xHash + yHash * this.rowColumnCount;
      }

      addObject(obj, hash) {
        let objAABB, objHash, targetCell;

        // technically, passing this in this should save some computational effort when updating objects
        if (hash !== undefined) {
          objHash = hash;
        } else {
          objAABB = obj.getAABB();
          objHash = this.toHash(objAABB.min[0], objAABB.min[1]);
        }
        targetCell = this.allCells[objHash];
        if (targetCell.objectContainer.length === 0) {
          // insert this cell into occupied cells list
          targetCell.occupiedCellsIndex = this.occupiedCells.length;
          this.occupiedCells.push(targetCell);
        }

        // add meta data to obj, for fast update/removal
        obj.HSHG.objectContainerIndex = targetCell.objectContainer.length;
        obj.HSHG.hash = objHash;
        obj.HSHG.grid = this;
        obj.HSHG.allGridObjectsIndex = this.allObjects.length;

        // add obj to cell
        targetCell.objectContainer.push(obj);

        // we can assume that the targetCell is already a member of the occupied list

        // add to grid-global object list
        this.allObjects.push(obj);

        // do test for grid density
        if (
          this.allObjects.length / this.allCells.length >
          this._parentHierarchy.MAX_OBJECT_CELL_DENSITY
        ) {
          // grid must be increased in size
          this.expandGrid();
        }
      }

      removeObject(obj) {
        const meta = obj.HSHG;
        let hash;
        let containerIndex;
        let allGridObjectsIndex;
        let cell;
        let replacementCell;
        let replacementObj;
        hash = meta.hash;
        containerIndex = meta.objectContainerIndex;
        allGridObjectsIndex = meta.allGridObjectsIndex;
        cell = this.allCells[hash];

        // remove object from cell object container
        if (cell.objectContainer.length === 1) {
          // this is the last object in the cell, so reset it
          cell.objectContainer.length = 0;

          // remove cell from occupied list
          if (cell.occupiedCellsIndex === this.occupiedCells.length - 1) {
            // special case if the cell is the newest in the list
            this.occupiedCells.pop();
          } else {
            replacementCell = this.occupiedCells.pop();
            replacementCell.occupiedCellsIndex = cell.occupiedCellsIndex;
            this.occupiedCells[cell.occupiedCellsIndex] = replacementCell;
          }
          cell.occupiedCellsIndex = null;
        } else {
          // there is more than one object in the container
          if (containerIndex === cell.objectContainer.length - 1) {
            // special case if the obj is the newest in the container
            cell.objectContainer.pop();
          } else {
            replacementObj = cell.objectContainer.pop();
            replacementObj.HSHG.objectContainerIndex = containerIndex;
            cell.objectContainer[containerIndex] = replacementObj;
          }
        }

        // remove object from grid object list
        if (allGridObjectsIndex === this.allObjects.length - 1) {
          this.allObjects.pop();
        } else {
          replacementObj = this.allObjects.pop();
          replacementObj.HSHG.allGridObjectsIndex = allGridObjectsIndex;
          this.allObjects[allGridObjectsIndex] = replacementObj;
        }
      }

      expandGrid() {
        let i;
        let j;
        const currentCellCount = this.allCells.length;
        const currentRowColumnCount = this.rowColumnCount;
        const currentXYHashMask = this.xyHashMask;
        const // double each dimension
          newCellCount = currentCellCount * 4;
        const newRowColumnCount = ~~Math.sqrt(newCellCount);
        const newXYHashMask = newRowColumnCount - 1;
        const // duplicate array, not objects contained
          allObjects = this.allObjects.slice(0);
        let aCell;
        const push = Array.prototype.push;

        // remove all objects
        for (i = 0; i < allObjects.length; i++) {
          this.removeObject(allObjects[i]);
        }

        // reset grid values, set new grid to be 4x larger than last
        this.rowColumnCount = newRowColumnCount;
        this.allCells = Array(this.rowColumnCount * this.rowColumnCount);
        this.xyHashMask = newXYHashMask;

        // initialize new cells
        this.initCells();

        // re-add all objects to grid
        for (i = 0; i < allObjects.length; i++) {
          this.addObject(allObjects[i]);
        }
      }
    }

    /**
     * A cell of a grid
     *
     * @class Cell
     * @memberof gdjs.HSHG
     */
    class Cell {
      objectContainer: any = [];
      neighborOffsetArray: any;
      occupiedCellsIndex: any = null;
      allCellsIndex: any = null;
    }

    //---------------------------------------------------------------------
    // EXPORTS
    //---------------------------------------------------------------------
    root['HSHG'] = HSHG;
    HSHG._private = {
      Grid: Grid,
      Cell: Cell,
      testAABBOverlap: testAABBOverlap,
      getLongestAABBEdge: getLongestAABBEdge,
    };
  })(gdjs.HSHG);
}
