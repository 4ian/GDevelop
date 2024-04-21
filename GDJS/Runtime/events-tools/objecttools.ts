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
        let isTrue = false;
        const objects1Lists = gdjs.staticArray(
          gdjs.evtTools.object.twoListsTest
        );
        objectsLists1.values(objects1Lists);
        const objects2Lists = gdjs.staticArray2(
          gdjs.evtTools.object.twoListsTest
        );
        objectsLists2.values(objects2Lists);
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
        return gdjs.evtTools.object.twoListsTest(
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

      export const pickAllObjects = function (objectsContext, objectsLists) {
        for (const name in objectsLists.items) {
          if (objectsLists.items.hasOwnProperty(name)) {
            const allObjects = objectsContext.getObjects(name);
            const objectsList = objectsLists.items[name];
            objectsList.length = 0;
            objectsList.push.apply(objectsList, allObjects);
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

      export const pickNearestObject = function (objectsLists, x, y, inverted) {
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
            // @ts-ignore
            if (first || (distance < best) ^ inverted) {
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

  /**
   * A container for objects lists that should last more than the current frame.
   * It automatically removes objects that were destroyed from the objects lists.
   */
  export class LongLivedObjectsList {
    private objectsLists = new Map<string, Array<RuntimeObject>>();
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
  }
}
