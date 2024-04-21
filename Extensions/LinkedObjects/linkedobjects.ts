/*
GDevelop - LinkedObjects Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  const logger = new gdjs.Logger('LinkedObjects');
  /**
   * Manages the links between objects.
   */
  export class LinksManager {
    private _links = new Map<integer, IterableLinkedObjects>();

    /**
     * Get the links manager of a scene.
     */
    static getManager(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): gdjs.LinksManager {
      // @ts-ignore
      if (!instanceContainer.linkedObjectsManager) {
        //Create the shared manager if necessary.
        // @ts-ignore
        instanceContainer.linkedObjectsManager = new gdjs.LinksManager();
      }
      // @ts-ignore
      return instanceContainer.linkedObjectsManager;
    }

    /**
     * This function is for internal use and could disappear in next versions.
     * Prefer using:
     * * {@link LinksManager.getObjectsLinkedWithAndNamed}
     * * {@link LinksManager.getObjectsLinkedWith}
     * * {@link evtTools.linkedObjects.quickPickObjectsLinkedTo}
     *
     * @param objA
     * @returns the linked objects by name
     */
    _getMapOfObjectsLinkedWith(
      objA: gdjs.RuntimeObject
    ): Map<string, gdjs.RuntimeObject[]> {
      if (!this._links.has(objA.id)) {
        this._links.set(objA.id, new IterableLinkedObjects());
      }
      return this._links.get(objA.id)!.linkedObjectMap;
    }

    // These 2 following functions give JS extensions an implementation dependent access to links.

    /**
     * @returns an iterable on every object linked with objA.
     */
    getObjectsLinkedWith(
      objA: gdjs.RuntimeObject
    ): Iterable<gdjs.RuntimeObject> {
      if (!this._links.has(objA.id)) {
        this._links.set(objA.id, new IterableLinkedObjects());
      }
      return this._links.get(objA.id)!;
    }

    /**
     * @returns an iterable of the objects with the given name that are linked with objA.
     */
    getObjectsLinkedWithAndNamed(
      objA: gdjs.RuntimeObject,
      objectName: string
    ): Iterable<gdjs.RuntimeObject> {
      let objects = this._getMapOfObjectsLinkedWith(objA).get(objectName);
      if (!objects) {
        // Give an empty Array
        objects = gdjs.staticArray(
          LinksManager.prototype.getObjectsLinkedWithAndNamed
        );
      }
      return objects;
    }

    linkObjects(objA: gdjs.RuntimeObject, objB: gdjs.RuntimeObject) {
      const objALinkedObjectMap = this._getMapOfObjectsLinkedWith(objA);
      if (!objALinkedObjectMap.has(objB.getName())) {
        objALinkedObjectMap.set(objB.getName(), []);
      }
      const objALinkedObjects = objALinkedObjectMap.get(objB.getName())!;
      if (objALinkedObjects.indexOf(objB) === -1) {
        objALinkedObjects.push(objB);
      }
      const objBLinkedObjectMap = this._getMapOfObjectsLinkedWith(objB);
      if (!objBLinkedObjectMap.has(objA.getName())) {
        objBLinkedObjectMap.set(objA.getName(), []);
      }
      const objBLinkedObjects = objBLinkedObjectMap.get(objA.getName())!;
      if (objBLinkedObjects.indexOf(objA) === -1) {
        objBLinkedObjects.push(objA);
      }
    }

    removeAllLinksOf(removedObject: gdjs.RuntimeObject) {
      // Remove the other side of the links
      // Note: don't use `this._getMapOfObjectsLinkedWith` as this would
      // create an empty map of linked objects if not existing already.
      const links = this._links.get(removedObject.id);
      if (!links) {
        // No existing links to other objects.
        // This also means no links to the object from other objects.
        return;
      }

      for (const linkedObjects of links.linkedObjectMap.values()) {
        for (let i = 0; i < linkedObjects.length; i++) {
          // This is the object on the other side of the link.
          // We find the removed object in its list of linked objects and remove it.
          const linkedObject = linkedObjects[i];

          if (this._links.has(linkedObject.id)) {
            const otherObjList = this._links
              .get(linkedObject.id)!
              .linkedObjectMap.get(removedObject.getName());

            if (!otherObjList) {
              logger.error(
                `Can't find link from ${linkedObject.id} (${linkedObject.name}) to ${removedObject.id} (${removedObject.name})`
              );
              return;
            }

            const index = otherObjList.indexOf(removedObject);
            if (index !== -1) {
              otherObjList.splice(index, 1);
            }
          }
        }
      }

      // Remove the links on the removedObject side.
      this._links.delete(removedObject.id);
    }

    removeLinkBetween(objA: gdjs.RuntimeObject, objB: gdjs.RuntimeObject) {
      if (this._links.has(objA.id)) {
        const map = this._links.get(objA.id)!.linkedObjectMap;
        if (map.has(objB.getName())) {
          const list = map.get(objB.getName())!;
          const index = list.indexOf(objB);
          if (index !== -1) {
            list.splice(index, 1);
          }
        }
      }
      if (this._links.has(objB.id)) {
        const map = this._links.get(objB.id)!.linkedObjectMap;
        if (map.has(objA.getName())) {
          const list = map.get(objA.getName())!;
          const index = list.indexOf(objA);
          if (index !== -1) {
            list.splice(index, 1);
          }
        }
      }
    }
  }

  class IterableLinkedObjects implements Iterable<gdjs.RuntimeObject> {
    linkedObjectMap: Map<string, gdjs.RuntimeObject[]>;
    static emptyItr: Iterator<gdjs.RuntimeObject> = {
      next: () => ({ value: undefined, done: true }),
    };

    constructor() {
      this.linkedObjectMap = new Map<string, gdjs.RuntimeObject[]>();
    }

    [Symbol.iterator]() {
      let mapItr = this.linkedObjectMap.values();
      let listItr: Iterator<gdjs.RuntimeObject> =
        IterableLinkedObjects.emptyItr;

      return {
        next: () => {
          let listNext = listItr.next();
          while (listNext.done) {
            const mapNext = mapItr.next();
            if (mapNext.done) {
              return listNext;
            }
            listItr = mapNext.value[Symbol.iterator]();
            listNext = listItr.next();
          }
          return listNext;
        },
      };
    }
  }

  export namespace evtTools {
    export namespace linkedObjects {
      gdjs.registerObjectDeletedFromSceneCallback(function (
        instanceContainer,
        obj
      ) {
        LinksManager.getManager(instanceContainer).removeAllLinksOf(obj);
      });

      export const linkObjects = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        objA: gdjs.RuntimeObject | null,
        objB: gdjs.RuntimeObject | null
      ) {
        if (objA === null || objB === null) {
          return;
        }
        LinksManager.getManager(instanceContainer).linkObjects(objA, objB);
      };

      export const removeLinkBetween = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        objA: gdjs.RuntimeObject | null,
        objB: gdjs.RuntimeObject | null
      ) {
        if (objA === null || objB === null) {
          return;
        }
        LinksManager.getManager(instanceContainer).removeLinkBetween(
          objA,
          objB
        );
      };

      export const removeAllLinksOf = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        objA: gdjs.RuntimeObject
      ) {
        if (objA === null) {
          return;
        }
        LinksManager.getManager(instanceContainer).removeAllLinksOf(objA);
      };

      export const pickObjectsLinkedTo = function (
        instanceContainer: gdjs.RuntimeInstanceContainer,
        objectsLists: Hashtable<gdjs.RuntimeObject[]>,
        obj: gdjs.RuntimeObject | null,
        eventsFunctionContext: EventsFunctionContext | undefined
      ) {
        if (obj === null) {
          return false;
        }
        const linkedObjectMap = LinksManager.getManager(
          instanceContainer
        )._getMapOfObjectsLinkedWith(obj);

        let pickedSomething = false;
        for (const contextObjectName in objectsLists.items) {
          if (objectsLists.containsKey(contextObjectName)) {
            const parentEventPickedObjects =
              objectsLists.items[contextObjectName];

            if (parentEventPickedObjects.length === 0) {
              continue;
            }

            // Find the object names in the scene
            const parentEventPickedObjectNames = gdjs.staticArray2(
              gdjs.evtTools.linkedObjects.pickObjectsLinkedTo
            );
            parentEventPickedObjectNames.length = 0;
            if (eventsFunctionContext) {
              // For functions, objects lists may contain objects with different names
              // indexed not by their name, but by the parameter name representing them.
              // This means that each object can have a different name,
              // so we iterate on them to get all the names.
              for (const pickedObject of parentEventPickedObjects) {
                if (
                  parentEventPickedObjectNames.indexOf(pickedObject.getName()) <
                  0
                ) {
                  parentEventPickedObjectNames.push(pickedObject.getName());
                }
              }
            } else {
              // In the case of a scene, the list of objects are guaranteed
              // to be indexed by the object name (no mix of objects with
              // different names in a list).
              parentEventPickedObjectNames.push(contextObjectName);
            }

            // Sum the number of instances in the scene for each objects found
            // previously in parentEventPickedObjects, so that we know if we can
            // avoid running an intersection with the picked objects later.
            let objectCount = 0;
            for (const objectName of parentEventPickedObjectNames) {
              objectCount += instanceContainer.getObjects(objectName)!.length;
            }

            if (parentEventPickedObjects.length === objectCount) {
              // The parent event didn't make any selection on the current object,
              // (because the number of picked objects is the total object count on the scene).
              // There is no need to make an intersection.
              // We will only replace the picked list with the linked object list.
              parentEventPickedObjects.length = 0;
              for (const objectName of parentEventPickedObjectNames) {
                if (linkedObjectMap.has(objectName)) {
                  const linkedObjects = linkedObjectMap.get(objectName)!;

                  pickedSomething = pickedSomething || linkedObjects.length > 0;
                  parentEventPickedObjects.push.apply(
                    parentEventPickedObjects,
                    linkedObjects
                  );
                }
              }
            } else {
              // Run an intersection between objects picked by parent events
              // and the linked ones.
              const pickedAndLinkedObjects = gdjs.staticArray(
                gdjs.evtTools.linkedObjects.pickObjectsLinkedTo
              );
              pickedAndLinkedObjects.length = 0;

              for (const objectName of parentEventPickedObjectNames) {
                if (linkedObjectMap.has(objectName)) {
                  const linkedObjects = linkedObjectMap.get(objectName)!;

                  for (const otherObject of linkedObjects) {
                    if (parentEventPickedObjects.indexOf(otherObject) >= 0) {
                      pickedAndLinkedObjects.push(otherObject);
                    }
                  }
                }
              }
              pickedSomething =
                pickedSomething || pickedAndLinkedObjects.length > 0;
              parentEventPickedObjects.length = 0;
              parentEventPickedObjects.push.apply(
                parentEventPickedObjects,
                pickedAndLinkedObjects
              );
              pickedAndLinkedObjects.length = 0;
            }
            parentEventPickedObjectNames.length = 0;
          }
        }
        return pickedSomething;
      };
    }
  }
}
