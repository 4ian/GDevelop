/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export namespace evtTools {
    export namespace object {
      /**
       * Keep only the specified object in the lists of picked objects.
       *
       * @param objectsLists The lists of objects to trim
       * @param runtimeObject The object to keep in the lists
       */
      export const pickOnly = function (
        objectsLists: ObjectsLists,
        runtimeObject: gdjs.RuntimeObject
      ) {
        for (const listName in objectsLists.items) {
          if (objectsLists.items.hasOwnProperty(listName)) {
            const list = objectsLists.items[listName];

            //Be sure not to lose the reference to the original array
            if (list.indexOf(runtimeObject) === -1) {
              list.length = 0;
            } else {
              list.length = 0;

              //Be sure not to lose the reference to the original array
              list.push(runtimeObject);
            }
          }
        }
      };

      /**
       * Do a test on two tables of objects so as to pick only the pair of objects for which the test is true.
       *
       * Note that the predicate method is not called strictly for each pair: When considering a pair of objects, if
       * these objects have already been marked as picked, the predicate method won't be called again.
       *
       * Cost (Worst case, predicate being always false):
       *    Cost(Setting property 'picked' of NbObjList1+NbObjList2 objects to false)
       *  + Cost(predicate)*NbObjList1*NbObjList2
       *  + Cost(Testing NbObjList1+NbObjList2 booleans)
       *  + Cost(Removing NbObjList1+NbObjList2 objects from all the lists)
       *
       * Cost (Best case, predicate being always true):
       *    Cost(Setting property 'picked' of NbObjList1+NbObjList2 objects to false)
       *  + Cost(predicate)*(NbObjList1+NbObjList2)
       *  + Cost(Testing NbObjList1+NbObjList2 booleans)
       *
       *
       * @param predicate The predicate function is called with the two objects to compare, and an optional argument `extraArg`
       * @param objectsLists1 The first lists of objects
       * @param objectsLists2 The second lists of objects
       * @param inverted If `inverted` == true, only the objects of the first table are filtered.
       * @param extraArg (optional) This argument should be used to avoid declaring the predicate as a closure that would be created and destroyed at each call to twoListsTest (potentially multiple time per frame).
       */
      export const twoListsTest = function (
        predicate: (
          object1: gdjs.RuntimeObject,
          object2: gdjs.RuntimeObject,
          extraArg: any
        ) => boolean,
        objectsLists1: ObjectsLists,
        objectsLists2: ObjectsLists,
        inverted: boolean,
        extraArg: any
      ) {
        const objects1Lists = gdjs.staticArray(
          gdjs.evtTools.object.twoListsTest
        );
        objectsLists1.values(objects1Lists);
        const objects2Lists = gdjs.staticArray2(
          gdjs.evtTools.object.twoListsTest
        );
        objectsLists2.values(objects2Lists);
        return testEveryPairOfObjects(
          predicate,
          objects1Lists,
          objects2Lists,
          inverted,
          extraArg
        );
      };

      /**
       * The test of `twoListsTest`, on the arrays of objects of the lists.
       */
      const testEveryPairOfObjects = function (
        predicate: (
          object1: gdjs.RuntimeObject,
          object2: gdjs.RuntimeObject,
          extraArg: any
        ) => boolean,
        objects1Lists: Array<gdjs.RuntimeObject[]>,
        objects2Lists: Array<gdjs.RuntimeObject[]>,
        inverted: boolean,
        extraArg: any
      ): boolean {
        let isTrue = false;
        for (let i = 0, leni = objects1Lists.length; i < leni; ++i) {
          let arr = objects1Lists[i];
          for (let k = 0, lenk = arr.length; k < lenk; ++k) {
            arr[k].pick = false;
          }
        }
        for (let i = 0, leni = objects2Lists.length; i < leni; ++i) {
          let arr = objects2Lists[i];
          for (let k = 0, lenk = arr.length; k < lenk; ++k) {
            arr[k].pick = false;
          }
        }

        //Launch the function for each object of the first list with each object
        //of the second list.
        for (let i = 0, leni = objects1Lists.length; i < leni; ++i) {
          const arr1 = objects1Lists[i];
          for (let k = 0, lenk = arr1.length; k < lenk; ++k) {
            let atLeastOneObject = false;
            for (let j = 0, lenj = objects2Lists.length; j < lenj; ++j) {
              const arr2 = objects2Lists[j];
              for (let l = 0, lenl = arr2.length; l < lenl; ++l) {
                if (arr1[k].pick && arr2[l].pick) {
                  continue;
                }

                //Avoid unnecessary costly call to predicate.
                if (
                  arr1[k].id !== arr2[l].id &&
                  predicate(arr1[k], arr2[l], extraArg)
                ) {
                  if (!inverted) {
                    isTrue = true;

                    //Pick the objects
                    arr1[k].pick = true;
                    arr2[l].pick = true;
                  }
                  atLeastOneObject = true;
                }
              }
            }
            if (!atLeastOneObject && inverted) {
              //For example, the object is not overlapping any other object.
              isTrue = true;
              arr1[k].pick = true;
            }
          }
        }

        //Trim not picked objects from lists.
        for (let i = 0, leni = objects1Lists.length; i < leni; ++i) {
          let arr = objects1Lists[i];
          let finalSize = 0;
          for (let k = 0, lenk = arr.length; k < lenk; ++k) {
            let obj = arr[k];
            if (arr[k].pick) {
              arr[finalSize] = obj;
              finalSize++;
            }
          }
          arr.length = finalSize;
        }
        if (!inverted) {
          for (let i = 0, leni = objects2Lists.length; i < leni; ++i) {
            let arr = objects2Lists[i];
            let finalSize = 0;
            for (let k = 0, lenk = arr.length; k < lenk; ++k) {
              let obj = arr[k];
              if (arr[k].pick) {
                arr[finalSize] = obj;
                finalSize++;
              }
            }
            arr.length = finalSize;
          }
        }
        return isTrue;
      };

      /**
       * Building the grid costs about the time of testing a few pairs per
       * object: testing every pair is faster when there are not many more
       * pairs than objects (like 10 objects with 10 others, or 1 object with
       * 1000 others).
       */
      const isTestingEveryPairFaster = (
        objects1Count: integer,
        objects2Count: integer
      ) => objects1Count * objects2Count <= 8 * (objects1Count + objects2Count);
      /**
       * An object covering more grid cells than this is not put in the grid
       * but tested with every object: a few very large objects would
       * otherwise fill most of the cells.
       */
      const maxCellsCountPerObject = 16;

      type ObjectsPairPredicate = (
        object1: gdjs.RuntimeObject,
        object2: gdjs.RuntimeObject,
        extraArg: any
      ) => boolean;

      // The grid of the objects of the second lists, reused at each call to
      // avoid allocations. The indices of the objects of each cell are
      // stored one cell after the other in `gridCellsObjects`, from
      // `gridCellsStart[cell]` to `gridCellsStart[cell + 1]`.
      const gridObjects: gdjs.RuntimeObject[] = [];
      const objectsNotInGrid: gdjs.RuntimeObject[] = [];
      let gridObjectsBounds = new Float64Array(4 * 64);
      let gridCellsStart = new Int32Array(64);
      let gridCellsObjects = new Int32Array(64);
      let gridCellsNextObject = new Int32Array(64);
      let gridObjectsLastTestedObjectIndex = new Int32Array(64);
      let gridMinX = 0;
      let gridMinY = 0;
      let gridCellSize = 1;
      let gridColumnsCount = 1;
      let gridRowsCount = 1;
      const bounds = new Float64Array(4);
      const cellRange = new Int32Array(4);

      // The content of the array is not kept when it is enlarged.
      const ensureFloat64ArraySize = (array: Float64Array, size: integer) =>
        array.length >= size
          ? array
          : new Float64Array(Math.max(size, 2 * array.length));
      const ensureInt32ArraySize = (array: Int32Array, size: integer) =>
        array.length >= size
          ? array
          : new Int32Array(Math.max(size, 2 * array.length));

      /**
       * Store in `bounds` the bounds (minX, minY, maxX, maxY) of the
       * bounding circle used by `gdjs.RuntimeObject.collisionTest`, with a
       * margin so that rounding errors can't separate touching circles.
       * @returns false if the bounds are not finite numbers.
       */
      const updateBoundingCircleBounds = (
        object: gdjs.RuntimeObject
      ): boolean => {
        const width = object.getWidth();
        const height = object.getHeight();
        const centerX = object.getCenterX();
        const centerY = object.getCenterY();
        const radiusX = Math.max(centerX, width - centerX);
        const radiusY = Math.max(centerY, height - centerY);
        const radius = Math.sqrt(radiusX * radiusX + radiusY * radiusY) + 1;
        const absoluteCenterX = object.getDrawableX() + centerX;
        const absoluteCenterY = object.getDrawableY() + centerY;
        bounds[0] = absoluteCenterX - radius;
        bounds[1] = absoluteCenterY - radius;
        bounds[2] = absoluteCenterX + radius;
        bounds[3] = absoluteCenterY + radius;
        return isFinite(bounds[0] + bounds[1] + bounds[2] + bounds[3]);
      };

      /**
       * Store in `cellRange` the grid cells (minColumn, minRow, maxColumn,
       * maxRow) covered by the given bounds.
       */
      const updateCellRange = (
        minX: float,
        minY: float,
        maxX: float,
        maxY: float
      ) => {
        cellRange[0] = Math.max(
          0,
          Math.floor((minX - gridMinX) / gridCellSize)
        );
        cellRange[1] = Math.max(
          0,
          Math.floor((minY - gridMinY) / gridCellSize)
        );
        cellRange[2] = Math.min(
          gridColumnsCount - 1,
          Math.floor((maxX - gridMinX) / gridCellSize)
        );
        cellRange[3] = Math.min(
          gridRowsCount - 1,
          Math.floor((maxY - gridMinY) / gridCellSize)
        );
      };

      const countObjects = (objectsLists: Array<gdjs.RuntimeObject[]>) => {
        let count = 0;
        for (let i = 0; i < objectsLists.length; ++i) {
          count += objectsLists[i].length;
        }
        return count;
      };

      const buildGrid = (objectsLists: Array<gdjs.RuntimeObject[]>) => {
        gridObjects.length = 0;
        objectsNotInGrid.length = 0;
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        let sizesSum = 0;
        gridObjectsBounds = ensureFloat64ArraySize(
          gridObjectsBounds,
          4 * countObjects(objectsLists)
        );
        for (let i = 0; i < objectsLists.length; ++i) {
          const objects = objectsLists[i];
          for (let k = 0; k < objects.length; ++k) {
            const object = objects[k];
            if (!updateBoundingCircleBounds(object)) {
              objectsNotInGrid.push(object);
              continue;
            }
            gridObjectsBounds.set(bounds, 4 * gridObjects.length);
            gridObjects.push(object);
            minX = Math.min(minX, bounds[0]);
            minY = Math.min(minY, bounds[1]);
            maxX = Math.max(maxX, bounds[2]);
            maxY = Math.max(maxY, bounds[3]);
            sizesSum += bounds[2] - bounds[0];
          }
        }

        // Cells of the average size of the objects, unless it makes too many
        // cells for the number of objects (objects spread on a large area).
        if (!gridObjects.length) {
          minX = minY = maxX = maxY = sizesSum = 0;
        }
        gridMinX = minX;
        gridMinY = minY;
        gridCellSize = Math.max(sizesSum / (gridObjects.length || 1), 1);
        do {
          gridColumnsCount = Math.floor((maxX - minX) / gridCellSize) + 1;
          gridRowsCount = Math.floor((maxY - minY) / gridCellSize) + 1;
          gridCellSize *= 2;
        } while (
          gridColumnsCount * gridRowsCount >
          4 * gridObjects.length + 64
        );
        gridCellSize /= 2;
        const cellsCount = gridColumnsCount * gridRowsCount;

        // Count the objects of each cell, then store them.
        gridCellsStart = ensureInt32ArraySize(gridCellsStart, cellsCount + 1);
        gridCellsStart.fill(0, 0, cellsCount + 1);
        for (let i = 0; i < gridObjects.length; ++i) {
          updateCellRange(
            gridObjectsBounds[4 * i],
            gridObjectsBounds[4 * i + 1],
            gridObjectsBounds[4 * i + 2],
            gridObjectsBounds[4 * i + 3]
          );
          if (
            (cellRange[2] - cellRange[0] + 1) *
              (cellRange[3] - cellRange[1] + 1) >
            maxCellsCountPerObject
          ) {
            objectsNotInGrid.push(gridObjects[i]);
            gridObjectsBounds[4 * i] = NaN;
            continue;
          }
          for (let row = cellRange[1]; row <= cellRange[3]; ++row) {
            for (let column = cellRange[0]; column <= cellRange[2]; ++column) {
              gridCellsStart[row * gridColumnsCount + column + 1]++;
            }
          }
        }
        for (let cell = 0; cell < cellsCount; ++cell) {
          gridCellsStart[cell + 1] += gridCellsStart[cell];
        }
        gridCellsObjects = ensureInt32ArraySize(
          gridCellsObjects,
          gridCellsStart[cellsCount]
        );
        gridCellsNextObject = ensureInt32ArraySize(
          gridCellsNextObject,
          cellsCount
        );
        gridCellsNextObject.set(gridCellsStart.subarray(0, cellsCount));
        for (let i = 0; i < gridObjects.length; ++i) {
          if (isNaN(gridObjectsBounds[4 * i])) continue;
          updateCellRange(
            gridObjectsBounds[4 * i],
            gridObjectsBounds[4 * i + 1],
            gridObjectsBounds[4 * i + 2],
            gridObjectsBounds[4 * i + 3]
          );
          for (let row = cellRange[1]; row <= cellRange[3]; ++row) {
            for (let column = cellRange[0]; column <= cellRange[2]; ++column) {
              gridCellsObjects[
                gridCellsNextObject[row * gridColumnsCount + column]++
              ] = i;
            }
          }
        }
        gridObjectsLastTestedObjectIndex = ensureInt32ArraySize(
          gridObjectsLastTestedObjectIndex,
          gridObjects.length
        );
        gridObjectsLastTestedObjectIndex.fill(-1, 0, gridObjects.length);
      };

      /**
       * Test the pair of objects like `twoListsTest` does, picking them if
       * the predicate is true (unless `inverted`).
       * @returns true if the predicate was true.
       */
      const testObjectsPair = (
        object1: gdjs.RuntimeObject,
        object2: gdjs.RuntimeObject,
        predicate: ObjectsPairPredicate,
        inverted: boolean,
        extraArg: any
      ): boolean => {
        if (
          (object1.pick && object2.pick) ||
          object1.id === object2.id ||
          !predicate(object1, object2, extraArg)
        ) {
          return false;
        }
        if (!inverted) {
          object1.pick = true;
          object2.pick = true;
        }
        return true;
      };

      const unpickObjects = (objectsLists: Array<gdjs.RuntimeObject[]>) => {
        for (let i = 0; i < objectsLists.length; ++i) {
          const objects = objectsLists[i];
          for (let k = 0; k < objects.length; ++k) objects[k].pick = false;
        }
      };

      const keepOnlyPickedObjects = (
        objectsLists: Array<gdjs.RuntimeObject[]>
      ) => {
        for (let i = 0; i < objectsLists.length; ++i) {
          const objects = objectsLists[i];
          let pickedCount = 0;
          for (let k = 0; k < objects.length; ++k) {
            if (objects[k].pick) objects[pickedCount++] = objects[k];
          }
          objects.length = pickedCount;
        }
      };

      /**
       * Same as `twoListsTest`, for a predicate that is always false for
       * objects whose bounding circles (the ones used by
       * `gdjs.RuntimeObject.collisionTest`) don't overlap.
       *
       * When there are many pairs of objects, the objects of the second
       * lists are put in a grid, and each object of the first lists is only
       * tested with the objects of the cells covered by its bounding circle.
       * The picked objects are exactly the same as with `twoListsTest`.
       */
      export const twoListsTestOfObjectsWithOverlappingBoundingCircles =
        function (
          predicate: ObjectsPairPredicate,
          objectsLists1: ObjectsLists,
          objectsLists2: ObjectsLists,
          inverted: boolean,
          extraArg: any
        ): boolean {
          const objects1Lists = gdjs.staticArray(
            gdjs.evtTools.object
              .twoListsTestOfObjectsWithOverlappingBoundingCircles
          );
          objectsLists1.values(objects1Lists);
          const objects2Lists = gdjs.staticArray2(
            gdjs.evtTools.object
              .twoListsTestOfObjectsWithOverlappingBoundingCircles
          );
          objectsLists2.values(objects2Lists);
          if (
            isTestingEveryPairFaster(
              countObjects(objects1Lists),
              countObjects(objects2Lists)
            )
          ) {
            return testEveryPairOfObjects(
              predicate,
              objects1Lists,
              objects2Lists,
              inverted,
              extraArg
            );
          }

          unpickObjects(objects1Lists);
          unpickObjects(objects2Lists);
          buildGrid(objects2Lists);

          let isTrue = false;
          let object1Index = 0;
          for (let i = 0; i < objects1Lists.length; ++i) {
            const objects1 = objects1Lists[i];
            for (let k = 0; k < objects1.length; ++k, ++object1Index) {
              const object1 = objects1[k];
              let atLeastOneObject = false;
              if (updateBoundingCircleBounds(object1)) {
                updateCellRange(bounds[0], bounds[1], bounds[2], bounds[3]);
              } else {
                // Not a finite position or size: test with the whole grid.
                updateCellRange(-Infinity, -Infinity, Infinity, Infinity);
              }
              for (let row = cellRange[1]; row <= cellRange[3]; ++row) {
                for (
                  let column = cellRange[0];
                  column <= cellRange[2];
                  ++column
                ) {
                  const cell = row * gridColumnsCount + column;
                  const cellEnd = gridCellsStart[cell + 1];
                  for (
                    let entry = gridCellsStart[cell];
                    entry < cellEnd;
                    ++entry
                  ) {
                    // An object covering several cells is tested only once.
                    const object2Index = gridCellsObjects[entry];
                    if (
                      gridObjectsLastTestedObjectIndex[object2Index] ===
                      object1Index
                    ) {
                      continue;
                    }
                    gridObjectsLastTestedObjectIndex[object2Index] =
                      object1Index;
                    if (
                      testObjectsPair(
                        object1,
                        gridObjects[object2Index],
                        predicate,
                        inverted,
                        extraArg
                      )
                    ) {
                      atLeastOneObject = true;
                    }
                  }
                }
              }
              for (let l = 0; l < objectsNotInGrid.length; ++l) {
                if (
                  testObjectsPair(
                    object1,
                    objectsNotInGrid[l],
                    predicate,
                    inverted,
                    extraArg
                  )
                ) {
                  atLeastOneObject = true;
                }
              }
              if (inverted ? !atLeastOneObject : atLeastOneObject) {
                isTrue = true;
                object1.pick = true;
              }
            }
          }

          keepOnlyPickedObjects(objects1Lists);
          if (!inverted) keepOnlyPickedObjects(objects2Lists);
          return isTrue;
        };

      /**
       * Filter objects to keep only the one that fullfil the predicate
       *
       * Objects that do not fullfil the predicate are removed from objects lists.
       *
       * @param predicate The function applied to each object: must return true if the object fulfill the predicate.
       * @param objectsLists The lists of objects to trim
       * @param negatePredicate If set to true, the result of the predicate is negated.
       * @param extraArg Argument passed to the predicate (along with the object). Useful for avoiding relying on temporary closures.
       * @return true if at least one object fulfill the predicate.
       */
      export const pickObjectsIf = function (
        predicate: Function,
        objectsLists: ObjectsLists,
        negatePredicate: boolean,
        extraArg: any
      ): boolean {
        let isTrue = false;
        const lists = gdjs.staticArray(gdjs.evtTools.object.pickObjectsIf);
        objectsLists.values(lists);

        // Pick only objects that are fulfilling the predicate.
        for (let i = 0, leni = lists.length; i < leni; ++i) {
          const arr = lists[i];
          for (let k = 0, lenk = arr.length; k < lenk; ++k) {
            const object = arr[k];
            // @ts-ignore
            if (negatePredicate ^ predicate(object, extraArg)) {
              isTrue = true;
              object.pick = true;
            } else {
              object.pick = false;
            }
          }
        }

        // Trim not picked objects from lists.
        for (let i = 0, leni = lists.length; i < leni; ++i) {
          gdjs.evtTools.object.filterPickedObjectsList(lists[i]);
        }
        return isTrue;
      };

      /**
       * Filter in-place the specified array to remove objects for which
       * `pick` property is set to false.
       */
      export const filterPickedObjectsList = function (
        arr: gdjs.RuntimeObject[]
      ) {
        let finalSize = 0;
        for (let k = 0, lenk = arr.length; k < lenk; ++k) {
          const obj = arr[k];
          if (obj.pick) {
            arr[finalSize] = obj;
            finalSize++;
          }
        }
        arr.length = finalSize;
      };

      export const hitBoxesCollisionTest = function (
        objectsLists1: ObjectsLists,
        objectsLists2: ObjectsLists,
        inverted: boolean,
        instanceContainer: gdjs.RuntimeInstanceContainer,
        ignoreTouchingEdges: boolean
      ) {
        return gdjs.evtTools.object.twoListsTestOfObjectsWithOverlappingBoundingCircles(
          gdjs.RuntimeObject.collisionTest,
          objectsLists1,
          objectsLists2,
          inverted,
          ignoreTouchingEdges
        );
      };

      export const _distanceBetweenObjects = function (obj1, obj2, distance) {
        return obj1.getSqDistanceToObject(obj2) <= distance;
      };

      export const distanceTest = function (
        objectsLists1: ObjectsLists,
        objectsLists2: ObjectsLists,
        distance: float,
        inverted: boolean
      ) {
        return gdjs.evtTools.object.twoListsTest(
          gdjs.evtTools.object._distanceBetweenObjects,
          objectsLists1,
          objectsLists2,
          inverted,
          distance * distance
        );
      };

      export const _movesToward = function (obj1, obj2, tolerance) {
        if (obj1.hasNoForces()) {
          return false;
        }
        let objAngle = Math.atan2(
          obj2.getDrawableY() +
            obj2.getCenterY() -
            (obj1.getDrawableY() + obj1.getCenterY()),
          obj2.getDrawableX() +
            obj2.getCenterX() -
            (obj1.getDrawableX() + obj1.getCenterX())
        );
        objAngle *= 180 / 3.14159;
        return (
          Math.abs(
            gdjs.evtTools.common.angleDifference(
              obj1.getAverageForce().getAngle(),
              objAngle
            )
          ) <=
          tolerance / 2
        );
      };

      export const movesTowardTest = function (
        objectsLists1: ObjectsLists,
        objectsLists2: ObjectsLists,
        tolerance: float,
        inverted: boolean
      ) {
        return gdjs.evtTools.object.twoListsTest(
          gdjs.evtTools.object._movesToward,
          objectsLists1,
          objectsLists2,
          inverted,
          tolerance
        );
      };

      // Deprecated
      export const _turnedToward = function (obj1, obj2, tolerance) {
        let objAngle = Math.atan2(
          obj2.getDrawableY() +
            obj2.getCenterY() -
            (obj1.getDrawableY() + obj1.getCenterY()),
          obj2.getDrawableX() +
            obj2.getCenterX() -
            (obj1.getDrawableX() + obj1.getCenterX())
        );
        objAngle *= 180 / 3.14159;
        return (
          Math.abs(
            gdjs.evtTools.common.angleDifference(obj1.getAngle(), objAngle)
          ) <=
          tolerance / 2
        );
      };

      // Deprecated
      export const turnedTowardTest = function (
        objectsLists1,
        objectsLists2,
        tolerance,
        inverted
      ) {
        return gdjs.evtTools.object.twoListsTest(
          gdjs.evtTools.object._turnedToward,
          objectsLists1,
          objectsLists2,
          inverted,
          tolerance
        );
      };

      export const _isTurnedTowardObject = function (
        obj1: gdjs.RuntimeObject,
        obj2: gdjs.RuntimeObject,
        tolerance: float
      ) {
        return (
          Math.abs(
            gdjs.evtTools.common.angleDifference(
              obj1.getAngle(),
              obj1.getAngleToObject(obj2)
            )
          ) <= tolerance
        );
      };

      export const isTurnedTowardObject = function (
        objectsLists1: ObjectsLists,
        objectsLists2: ObjectsLists,
        tolerance: float,
        inverted: boolean
      ) {
        return gdjs.evtTools.object.twoListsTest(
          gdjs.evtTools.object._isTurnedTowardObject,
          objectsLists1,
          objectsLists2,
          inverted,
          tolerance
        );
      };

      export const pickAllObjects = function (
        objectsContext: EventsFunctionContext | gdjs.RuntimeScene,
        objectsLists: ObjectsLists
      ) {
        for (const name in objectsLists.items) {
          if (objectsLists.items.hasOwnProperty(name)) {
            const allObjects = objectsContext.getObjects(name);
            const objectsList = objectsLists.items[name];
            gdjs.copyArray(allObjects, objectsList);
          }
        }
        return true;
      };

      export const pickRandomObject = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        objectsLists: ObjectsLists
      ) {
        // Compute one many objects we have
        let objectsCount = 0;
        for (let listName in objectsLists.items) {
          if (objectsLists.items.hasOwnProperty(listName)) {
            let list = objectsLists.items[listName];
            objectsCount += list.length;
          }
        }
        if (objectsCount === 0) {
          return false;
        }

        // Pick one random object
        let index = Math.floor(Math.random() * objectsCount);
        if (index >= objectsCount) {
          index = objectsCount - 1;
        }

        //Should never happen.

        // Find the object
        let startIndex = 0;
        let theChosenOne: gdjs.RuntimeObject | null = null;
        for (let listName in objectsLists.items) {
          if (objectsLists.items.hasOwnProperty(listName)) {
            let list = objectsLists.items[listName];
            if (index - startIndex < list.length) {
              theChosenOne = list[index - startIndex];
              break;
            }
            startIndex += list.length;
          }
        }
        // @ts-ignore
        gdjs.evtTools.object.pickOnly(objectsLists, theChosenOne);
        return true;
      };

      export const pickNearestObject = function (
        objectsLists: ObjectsLists,
        x: float,
        y: float,
        inverted: boolean = false
      ) {
        let bestObject = null;
        let best = 0;
        let first = true;
        const lists = gdjs.staticArray(gdjs.evtTools.object.pickNearestObject);
        objectsLists.values(lists);
        for (let i = 0, len = lists.length; i < len; ++i) {
          const list = lists[i];
          for (let j = 0; j < list.length; ++j) {
            const object = list[j];
            const distance = object.getSqDistanceToPosition(x, y);
            if (first || distance < best !== !!inverted) {
              best = distance;
              bestObject = object;
            }
            first = false;
          }
        }
        if (!bestObject) {
          return false;
        }
        gdjs.evtTools.object.pickOnly(objectsLists, bestObject);
        return true;
      };

      export const raycastObject = function (
        objectsLists: ObjectsLists,
        x: float,
        y: float,
        angle: float,
        dist: float,
        varX: gdjs.Variable,
        varY: gdjs.Variable,
        inverted: boolean
      ) {
        return gdjs.evtTools.object.raycastObjectToPosition(
          objectsLists,
          x,
          y,
          x + dist * Math.cos((angle * Math.PI) / 180.0),
          y + dist * Math.sin((angle * Math.PI) / 180.0),
          varX,
          varY,
          inverted
        );
      };

      export const raycastObjectToPosition = function (
        objectsLists: ObjectsLists,
        x: float,
        y: float,
        endX: float,
        endY: float,
        varX: gdjs.Variable,
        varY: gdjs.Variable,
        inverted: boolean
      ) {
        let matchObject: gdjs.RuntimeObject | null = null;
        let testSqDist = inverted
          ? 0
          : (endX - x) * (endX - x) + (endY - y) * (endY - y);
        let resultX = 0;
        let resultY = 0;
        const lists: RuntimeObject[][] = gdjs.staticArray(
          gdjs.evtTools.object.raycastObjectToPosition
        );
        objectsLists.values(lists);
        for (let i = 0; i < lists.length; i++) {
          const list = lists[i];
          for (let j = 0; j < list.length; j++) {
            const object = list[j];
            const result = object.raycastTest(x, y, endX, endY, !inverted);
            if (result.collision) {
              if (!inverted && result.closeSqDist <= testSqDist) {
                testSqDist = result.closeSqDist;
                matchObject = object;
                resultX = result.closeX;
                resultY = result.closeY;
              } else {
                if (inverted && result.farSqDist >= testSqDist) {
                  testSqDist = result.farSqDist;
                  matchObject = object;
                  resultX = result.farX;
                  resultY = result.farY;
                }
              }
            }
          }
        }
        if (!matchObject) {
          return false;
        }
        gdjs.evtTools.object.pickOnly(objectsLists, matchObject);
        varX.setNumber(resultX);
        varY.setNumber(resultY);
        return true;
      };

      /**
       * Do the work of creating a new object
       */
      export const doCreateObjectOnScene = function (
        objectsContext: EventsFunctionContext | gdjs.RuntimeScene,
        objectName: string,
        objectsLists: ObjectsLists,
        x: float,
        y: float,
        layerName: string
      ): gdjs.RuntimeObject | null {
        // objectsContext will either be the gdjs.RuntimeScene or, in an events function, the
        // eventsFunctionContext. We can't directly use runtimeScene because the object name could
        // be different than the real object name (this is the case in a function. The eventsFunctionContext
        // will take care of this in createObject).
        const obj = objectsContext.createObject(objectName);
        const layer = objectsContext.getLayer(layerName);
        if (obj !== null) {
          //Do some extra setup
          obj.setPosition(x, y);
          obj.setLayer(layerName);
          obj.setZOrder(layer.getDefaultZOrder());

          //Let the new object be picked by next actions/conditions.
          if (objectsLists.containsKey(objectName)) {
            objectsLists.get(objectName).push(obj);
          }
        }
        return obj;
      };

      /**
       * Allows events to create a new object on a scene.
       */
      export const createObjectOnScene = function (
        objectsContext: EventsFunctionContext | gdjs.RuntimeScene,
        objectsLists: ObjectsLists,
        x: float,
        y: float,
        layerName: string
      ): gdjs.RuntimeObject | null {
        return gdjs.evtTools.object.doCreateObjectOnScene(
          objectsContext,
          objectsLists.firstKey() as string,
          objectsLists,
          x,
          y,
          layerName
        );
      };

      /**
       * Allows events to create a new object on a scene.
       */
      export const createObjectFromGroupOnScene = function (
        objectsContext: EventsFunctionContext | gdjs.RuntimeScene,
        objectsLists: ObjectsLists,
        objectName: string,
        x: float,
        y: float,
        layerName: string
      ) {
        gdjs.evtTools.object.doCreateObjectOnScene(
          objectsContext,
          objectName,
          objectsLists,
          x,
          y,
          layerName
        );
      };

      /**
       * Return the number of instances in the specified lists of objects.
       */
      export const getPickedInstancesCount = (objectsLists: ObjectsLists) => {
        let count = 0;
        const lists = gdjs.staticArray(
          gdjs.evtTools.object.getPickedInstancesCount
        );
        objectsLists.values(lists);
        for (let i = 0, len = lists.length; i < len; ++i) {
          count += lists[i].length;
        }
        return count;
      };

      /**
       * Return the number of instances of the specified objects living on the scene.
       */
      export const getSceneInstancesCount = (
        objectsContext: EventsFunctionContext | gdjs.RuntimeScene,
        objectsLists: ObjectsLists
      ) => {
        let count = 0;

        const objectNames = gdjs.staticArray(
          gdjs.evtTools.object.getSceneInstancesCount
        );
        objectsLists.keys(objectNames);

        const uniqueObjectNames = new Set(objectNames);
        for (const objectName of uniqueObjectNames) {
          count += objectsContext.getInstancesCountOnScene(objectName);
        }
        return count;
      };

      /** @deprecated */
      export const pickedObjectsCount = getPickedInstancesCount;
    }
  }

  const logger = new gdjs.Logger('LongLivedObjectsLists');
  /**
   * @category Core Engine > Object
   */
  export type LongLivedObjectsListNetworkSyncData = {
    objectsLists: {
      [objectName: string]: Array<string>;
    };
    localVariablesContainers: Array<Array<VariableNetworkSyncData>>;
  };

  /**
   * A container for objects lists that should last more than the current frame.
   * It automatically removes objects that were destroyed from the objects lists.
   * @category Core Engine > Object
   */
  export class LongLivedObjectsList {
    private objectsLists = new Map<string, Array<RuntimeObject>>();
    private localVariablesContainers: Array<gdjs.VariablesContainer> = [];
    private callbacks = new Map<RuntimeObject, () => void>();
    private parent: LongLivedObjectsList | null = null;

    /**
     * Create a new container for objects lists, inheriting from another one. This is
     * useful should we get the objects that have not been saved in this context (using
     * `addObject`) but saved in a parent context.
     * This avoids to save all object lists every time we create a new `LongLivedObjectsList`,
     * despite not all objects lists being used.
     *
     * @param parent
     * @returns
     */
    static from(parent: LongLivedObjectsList): LongLivedObjectsList {
      const newList = new LongLivedObjectsList();
      newList.parent = parent;
      return newList;
    }

    private getOrCreateList(objectName: string): RuntimeObject[] {
      if (!this.objectsLists.has(objectName))
        this.objectsLists.set(objectName, []);
      return this.objectsLists.get(objectName)!;
    }

    getObjects(objectName: string): RuntimeObject[] {
      if (!this.objectsLists.has(objectName) && this.parent)
        return this.parent.getObjects(objectName);
      return this.objectsLists.get(objectName) || [];
    }

    addObject(objectName: string, runtimeObject: gdjs.RuntimeObject): void {
      const list = this.getOrCreateList(objectName);
      if (list.includes(runtimeObject)) return;
      list.push(runtimeObject);

      // Register callbacks for when the object is destroyed
      const onDestroy = () => this.removeObject(objectName, runtimeObject);
      this.callbacks.set(runtimeObject, onDestroy);
      runtimeObject.registerDestroyCallback(onDestroy);
    }

    removeObject(objectName: string, runtimeObject: gdjs.RuntimeObject): void {
      const list = this.getOrCreateList(objectName);
      const index = list.indexOf(runtimeObject);
      if (index === -1) return;
      list.splice(index, 1);

      // Properly remove callbacks to not leak the object
      runtimeObject.unregisterDestroyCallback(
        this.callbacks.get(runtimeObject)!
      );
      this.callbacks.delete(runtimeObject);
    }

    restoreLocalVariablesContainers(
      variablesContainers: Array<gdjs.VariablesContainer>
    ): void {
      gdjs.copyArray(this.localVariablesContainers, variablesContainers);
    }

    backupLocalVariablesContainers(
      variablesContainers: Array<gdjs.VariablesContainer>
    ): void {
      gdjs.copyArray(variablesContainers, this.localVariablesContainers);
    }

    getNetworkSyncData(
      syncOptions: GetNetworkSyncDataOptions
    ): LongLivedObjectsListNetworkSyncData {
      const objectsLists: {
        [objectName: string]: Array<string>;
      } = {};
      for (const [objectName, runtimeObjects] of this.objectsLists.entries()) {
        const objectNetworkIds: Array<string> = [];
        for (const runtimeObject of runtimeObjects) {
          const objectNetworkId = runtimeObject.getNetworkId();
          if (!objectNetworkId) {
            logger.warn(
              'Tried to get sync data of a LongLivedObjectsList and found an object without a network ID'
            );
            continue;
          }
          objectNetworkIds.push(objectNetworkId);
        }
        objectsLists[objectName] = objectNetworkIds;
      }
      return {
        objectsLists,
        localVariablesContainers: this.localVariablesContainers.map(
          (container) => container.getNetworkSyncData(syncOptions)
        ),
      };
    }

    updateFromNetworkSyncData(
      syncData: LongLivedObjectsListNetworkSyncData,
      runtimeScene: gdjs.RuntimeScene,
      syncOptions: UpdateFromNetworkSyncDataOptions
    ) {
      const { objectsLists, localVariablesContainers } = syncData;

      // Clear the current state.
      this.objectsLists.clear();
      this.localVariablesContainers.length = 0;

      // Restore the list of objects.
      for (const [objectName, objectNetworkIds] of Object.entries(
        objectsLists
      )) {
        const runtimeObjects = runtimeScene.getObjects(objectName);
        if (!runtimeObjects) {
          logger.warn(
            'Tried to update sync data of a LongLivedObjectsList but cannot find objects with name: ' +
              objectName
          );
          continue;
        }

        const runtimeObjectsFromSyncData = runtimeObjects.filter(
          (runtimeObject) => {
            const runtimeObjectNetworkId = runtimeObject.getNetworkId();
            return (
              !!runtimeObjectNetworkId &&
              objectNetworkIds.includes(runtimeObjectNetworkId)
            );
          }
        );

        for (const runtimeObject of runtimeObjectsFromSyncData) {
          this.addObject(objectName, runtimeObject);
        }
      }

      // Restore the local variables containers.
      this.localVariablesContainers = localVariablesContainers.map(
        (localVariablesContainer) => {
          const newContainer = new gdjs.VariablesContainer();
          newContainer.updateFromNetworkSyncData(
            localVariablesContainer,
            syncOptions
          );
          return newContainer;
        }
      );
    }
  }
}
