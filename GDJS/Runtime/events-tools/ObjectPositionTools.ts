namespace gdjs {
  export namespace evtTools {
    export namespace object {
      export namespace position {
        type SearchArea = {
          minX: float;
          minY: float;
          maxX: float;
          maxY: float;
        };

        const searchArea = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        const nearbyObjects: Array<RuntimeObject> = [];

        export const twoListsSpatialCheck = (
          instanceContainer: RuntimeInstanceContainer | EventsFunctionContext,
          predicate: (
            object1: gdjs.RuntimeObject,
            object2: gdjs.RuntimeObject,
            extraArg: any
          ) => boolean,
          getSearchArea: (
            object: gdjs.RuntimeObject,
            searchArea: SearchArea,
            extraArg: any
          ) => SearchArea,
          objectsLists1: ObjectsLists,
          objectsLists2: ObjectsLists,
          inverted: boolean,
          predicateExtraArg?: any,
          areaExtraArg?: any
        ): boolean => {
          const isPicked1 = objectsLists1.isPicked;
          const isPicked2 = objectsLists2.isPicked;

          if (isPicked1 && isPicked2) {
            // Both are already filtered fallback on the naïve check
            return gdjs.evtTools.object.twoListsTest(
              predicate,
              objectsLists1,
              objectsLists2,
              inverted,
              predicateExtraArg
            );
          }
          if (
            inverted ||
            !(instanceContainer instanceof gdjs.RuntimeInstanceContainer)
          ) {
            // Fast spatial conditions are using objectListOrEmptyIfJustDeclared
            // where naive spatial implementation is expecting objectList.
            if (!isPicked1) {
              fillPickedLists(instanceContainer, objectsLists1);
            }
            if (!isPicked2) {
              fillPickedLists(instanceContainer, objectsLists2);
            }
            // Both are already filtered fallback on the naïve check
            return gdjs.evtTools.object.twoListsTest(
              predicate,
              objectsLists1,
              objectsLists2,
              inverted,
              predicateExtraArg
            );
          }
          let isAnyObjectPicked = false;

          let iteratedLists = isPicked1 ? objectsLists1 : objectsLists2;
          let treeLists = isPicked1 ? objectsLists2 : objectsLists1;

          let objectsMaxCount1 = 0;
          if (!isPicked1) {
            for (const objectName in objectsLists1.items) {
              const objects = instanceContainer.getObjects(objectName);
              objectsMaxCount1 = Math.max(
                objectsMaxCount1,
                objects ? objects.length : 0
              );
            }
          }
          let objectsMaxCount2 = 0;
          if (!isPicked2) {
            for (const objectName in objectsLists2.items) {
              const objects = instanceContainer.getObjects(objectName);
              objectsMaxCount2 = Math.max(
                objectsMaxCount1,
                objects ? objects.length : 0
              );
            }
          }
          if (!isPicked1 && !isPicked2) {
            if (objectsMaxCount1 < objectsMaxCount2) {
              iteratedLists = objectsLists1;
              treeLists = objectsLists2;
            }
          }

          const pickingId = instanceContainer.getNewPickingId();
          for (const iteratedObjectName in iteratedLists.items) {
            const iteratedObjects = iteratedLists.isPicked
              ? iteratedLists.items[iteratedObjectName]
              : instanceContainer.getObjects(iteratedObjectName) || [];

            let isAnyIteratedObjectPicked = false;
            for (const objectName in treeLists.items) {
              const treeObjects = treeLists.items[objectName];
              const objectManager = instanceContainer.getObjectManager(
                objectName
              );
              for (const object of iteratedObjects) {
                nearbyObjects.length = 0;
                objectManager.search(
                  getSearchArea(object, searchArea, areaExtraArg),
                  nearbyObjects
                );
                for (const nearbyObject of nearbyObjects) {
                  if (predicate(object, nearbyObject, predicateExtraArg)) {
                    isAnyObjectPicked = true;
                    isAnyIteratedObjectPicked = true;
                    object.pickingId = pickingId;
                    if (nearbyObject.pickingId !== pickingId) {
                      treeObjects.push(nearbyObject);
                      nearbyObject.pickingId = pickingId;
                    }
                  }
                }
              }
            }
            if (isAnyIteratedObjectPicked) {
              gdjs.evtTools.object.filterPickedObjectsListWithId(
                iteratedObjects,
                pickingId
              );
            } else if (iteratedLists.isPicked) {
              iteratedObjects.length = 0;
            }
          }

          return isAnyObjectPicked;
        };

        const fillPickedLists = (
          instanceContainer: RuntimeInstanceContainer | EventsFunctionContext,
          objectsLists: ObjectsLists
        ) => {
          for (const objectName in objectsLists.items) {
            const pickedObjects = objectsLists.items[objectName];
            const allObjects = instanceContainer.getObjects(objectName);
            pickedObjects.push.apply(pickedObjects, allObjects);
          }
        };

        const getSearchAreaForDistanceCheck = (
          object: gdjs.RuntimeObject,
          searchArea: SearchArea,
          distance: float
        ): SearchArea => {
          const centerX = object.getX();
          const centerY = object.getY();
          searchArea.minX = centerX - distance;
          searchArea.maxX = centerX + distance;
          searchArea.minY = centerY - distance;
          searchArea.maxY = centerY + distance;
          return searchArea;
        };

        export const distanceCheck = (
          objectsLists1: ObjectsLists,
          objectsLists2: ObjectsLists,
          distance: float,
          inverted: boolean,
          instanceContainer:
            | gdjs.RuntimeInstanceContainer
            | EventsFunctionContext
        ): boolean => {
          return twoListsSpatialCheck(
            instanceContainer,
            gdjs.evtTools.object._distanceBetweenObjects,
            getSearchAreaForDistanceCheck,
            objectsLists1,
            objectsLists2,
            inverted,
            distance * distance,
            distance
          );
        };

        const getSearchAreaForCollisionCheck = (
          object: gdjs.RuntimeObject,
          searchArea: SearchArea
        ): SearchArea => {
          const centerX = object.getCenterXInScene();
          const centerY = object.getCenterYInScene();
          const boundingRadius = Math.sqrt(object.getSqBoundingRadius());
          searchArea.minX = centerX - boundingRadius;
          searchArea.maxX = centerX + boundingRadius;
          searchArea.minY = centerY - boundingRadius;
          searchArea.maxY = centerY + boundingRadius;
          return searchArea;
        };

        export const hitBoxesCollisionCheck = (
          objectsLists1: ObjectsLists,
          objectsLists2: ObjectsLists,
          inverted: boolean,
          instanceContainer:
            | gdjs.RuntimeInstanceContainer
            | EventsFunctionContext,
          ignoreTouchingEdges: boolean
        ): boolean => {
          return twoListsSpatialCheck(
            instanceContainer,
            gdjs.RuntimeObject.collisionTest,
            getSearchAreaForCollisionCheck,
            objectsLists1,
            objectsLists2,
            inverted,
            ignoreTouchingEdges
          );
        };
      }
    }
  }
}
