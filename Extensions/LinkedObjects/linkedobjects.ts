/*
GDevelop - LinkedObjects Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /**
   * Manages the links between objects.
   */
  export class LinksManager {
    private links = new Map<integer, LinkedObjectIterable>();

    /**
     * Get the links manager of a scene.
     */
    static getManager(runtimeScene: gdjs.RuntimeScene): gdjs.LinksManager {
      // @ts-ignore
      if (!runtimeScene.linkedObjectsManager) {
        //Create the shared manager if necessary.
        // @ts-ignore
        runtimeScene.linkedObjectsManager = new gdjs.LinksManager();
      }
      // @ts-ignore
      return runtimeScene.linkedObjectsManager;
    }

    /**
     * This function is for internal use and could disappear in next versions.
     * Prefer using
     * * {@link LinksManager.getObjectsLinkedWithAndNamed}
     * * {@link LinksManager.getObjectsLinkedWith}
     * * {@link evtTools.linkedObjects.quickPickObjectsLinkedTo}
     * @param objA
     * @returns
     */
    _getMapOfObjectsLinkedWith(
      objA: gdjs.RuntimeObject
    ): Map<string, gdjs.RuntimeObject[]> {
      if (!this.links.has(objA.id)) {
        this.links.set(objA.id, new LinkedObjectIterable());
      }
      return this.links.get(objA.id)!.linkedObjectMap;
    }

    // These 2 following functions give JS extensions an implementation dependent access to links.

    /**
     * @param objA
     * @returns an iterable on every object liked with objA.
     */
    // : Iterable<gdjs.RuntimeObject> in practice
    getObjectsLinkedWith(objA: gdjs.RuntimeObject) {
      if (!this.links.has(objA.id)) {
        this.links.set(objA.id, new LinkedObjectIterable());
      }
      return this.links.get(objA.id)!;
    }

    /**
     * @param objA
     * @param objectName
     * @returns an iterable of the objects with the given name that are liked with objA.
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

    removeAllLinksOf(obj: gdjs.RuntimeObject) {
      // Remove the other side of the links
      const linkedObjectMap = this._getMapOfObjectsLinkedWith(obj);
      for (const [
        linkedObjectName,
        linkedObjects,
      ] of linkedObjectMap.entries()) {
        for (let i = 0; i < linkedObjects.length; i++) {
          // This is the object on the other side of the link
          // We find obj in its list of linked objects and remove it.
          const linkedObject = linkedObjects[i];
          if (this.links.has(linkedObject.id)) {
            const otherObjList = this.links
              .get(linkedObject.id)!
              .linkedObjectMap.get(obj.getName())!;
            const index = otherObjList.indexOf(obj);
            if (index !== -1) {
              otherObjList.splice(index, 1);
            }
          }
        }
      }
      // Remove the links on obj side
      if (this.links.has(obj.id)) {
        this.links.delete(obj.id);
      }
    }

    removeLinkBetween(objA: gdjs.RuntimeObject, objB: gdjs.RuntimeObject) {
      if (this.links.has(objA.id)) {
        const map = this.links.get(objA.id)!.linkedObjectMap;
        if (map.has(objB.getName())) {
          const list = map.get(objB.getName())!;
          const index = list.indexOf(objB);
          if (index !== -1) {
            list.splice(index, 1);
          }
        }
      }
      if (this.links.has(objB.id)) {
        const map = this.links.get(objB.id)!.linkedObjectMap;
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

  class LinkedObjectIterable {
    linkedObjectMap: Map<string, gdjs.RuntimeObject[]>;

    constructor() {
      this.linkedObjectMap = new Map<string, gdjs.RuntimeObject[]>();
    }

    [Symbol.iterator]() {
      let mapItr = this.linkedObjectMap.entries();
      let listItr: IterableIterator<[
        number,
        gdjs.RuntimeObject
      ]> = [].entries();

      return {
        next: () => {
          let listNext = listItr.next();
          while (listNext.done) {
            const mapNext = mapItr.next();
            if (mapNext.done) {
              // IteratorReturnResult<gdjs.RuntimeObject> require a defined value
              // even though the spec state otherwise.
              // So, this class can't be typed as an iterable.
              return { value: undefined, done: true };
            }
            listItr = mapNext.value[1].entries();
            listNext = listItr.next();
          }
          return { value: listNext.value[1], done: false };
        },
      };
    }
  }

  export namespace evtTools {
    export namespace linkedObjects {
      gdjs.registerObjectDeletedFromSceneCallback(function (runtimeScene, obj) {
        LinksManager.getManager(runtimeScene).removeAllLinksOf(obj);
      });
      export const linkObjects = function (
        runtimeScene: gdjs.RuntimeScene,
        objA: gdjs.RuntimeObject,
        objB: gdjs.RuntimeObject
      ) {
        if (objA === null || objB === null) {
          return;
        }
        LinksManager.getManager(runtimeScene).linkObjects(objA, objB);
      };

      export const removeLinkBetween = function (
        runtimeScene: gdjs.RuntimeScene,
        objA: gdjs.RuntimeObject,
        objB: gdjs.RuntimeObject
      ) {
        if (objA === null || objB === null) {
          return;
        }
        LinksManager.getManager(runtimeScene).removeLinkBetween(objA, objB);
      };

      export const removeAllLinksOf = function (
        runtimeScene: gdjs.RuntimeScene,
        objA: gdjs.RuntimeObject
      ) {
        if (objA === null) {
          return;
        }
        LinksManager.getManager(runtimeScene).removeAllLinksOf(objA);
      };

      export const quickPickObjectsLinkedTo = function (
        runtimeScene: gdjs.RuntimeScene,
        eventsFunctionContext: EventsFunctionContext | undefined,
        objectsLists: Hashtable<gdjs.RuntimeObject[]>,
        obj: gdjs.RuntimeObject
      ) {
        return doPickObjectsLinkedTo(
          runtimeScene,
          objectsLists,
          obj,
          !!eventsFunctionContext
        );
      };

      export const pickObjectsLinkedTo = function (
        runtimeScene: gdjs.RuntimeScene,
        objectsLists: Hashtable<gdjs.RuntimeObject[]>,
        obj: gdjs.RuntimeObject
      ) {
        return doPickObjectsLinkedTo(
          runtimeScene,
          objectsLists,
          obj,
          // Can't know if it's called from an event function or not
          // Object names will have to be checked
          true
        );
      };

      const doPickObjectsLinkedTo = function (
        runtimeScene: gdjs.RuntimeScene,
        objectsLists: Hashtable<gdjs.RuntimeObject[]>,
        obj: gdjs.RuntimeObject,
        isEventsFunction: boolean
      ) {
        if (obj === null) {
          return false;
        }
        const linkedObjectMap = LinksManager.getManager(
          runtimeScene
        )._getMapOfObjectsLinkedWith(obj);

        let pickedSomething = false;
        for (const contextObjectName in objectsLists.items) {
          if (objectsLists.containsKey(contextObjectName)) {
            const pickedObjects = objectsLists.items[contextObjectName];

            if (pickedObjects.length === 0) {
              continue;
            }

            // Find the object names in the scene
            const temporaryObjectNames = gdjs.staticArray2(
              gdjs.evtTools.linkedObjects.pickObjectsLinkedTo
            );
            temporaryObjectNames.length = 0;
            if (isEventsFunction) {
              // For functions, objects may be a flattened group
              for (const pickedObject of pickedObjects) {
                if (temporaryObjectNames.indexOf(pickedObject.getName()) < 0) {
                  temporaryObjectNames.push(pickedObject.getName());
                }
              }
            } else {
              temporaryObjectNames.push(contextObjectName);
            }

            let objectCount = 0;
            let linkedObjectExists = false;
            for (const objectName of temporaryObjectNames) {
              objectCount += runtimeScene.getObjects(objectName).length;
              linkedObjectExists =
                linkedObjectExists || linkedObjectMap.has(objectName);
            }

            if (linkedObjectExists) {
              if (pickedObjects.length === objectCount) {
                // All the objects were picked, there is no need to make an intersection.
                pickedObjects.length = 0;
                for (const objectName of temporaryObjectNames) {
                  if (linkedObjectMap.has(objectName)) {
                    const linkedObjects = linkedObjectMap.get(objectName)!;

                    pickedSomething =
                      pickedSomething || linkedObjects.length > 0;
                    pickedObjects.push.apply(pickedObjects, linkedObjects);
                  }
                }
              } else {
                const temporaryObjects = gdjs.staticArray(
                  gdjs.evtTools.linkedObjects.pickObjectsLinkedTo
                );
                temporaryObjects.length = 0;

                for (const objectName of temporaryObjectNames) {
                  if (linkedObjectMap.has(objectName)) {
                    const linkedObjects = linkedObjectMap.get(objectName)!;

                    for (const otherObject of linkedObjects) {
                      if (pickedObjects.indexOf(otherObject) >= 0) {
                        temporaryObjects.push(otherObject);
                      }
                    }
                  }
                }
                pickedSomething =
                  pickedSomething || temporaryObjects.length > 0;
                pickedObjects.length = 0;
                pickedObjects.push.apply(pickedObjects, temporaryObjects);
                temporaryObjects.length = 0;
              }
            } else {
              // No object is linked for this name
              pickedObjects.length = 0;
            }
            temporaryObjectNames.length = 0;
          }
        }
        return pickedSomething;
      };
    }
  }
}
