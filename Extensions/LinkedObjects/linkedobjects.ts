/*
GDevelop - LinkedObjects Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /**
   * Manages the links between objects.
   */
  export class LinksManager {
    private links: { [objectId: number]: Hashtable<gdjs.RuntimeObject[]> } = {};

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

    _getObjectsLinkedWith(objA: gdjs.RuntimeObject) {
      if (!this.links.hasOwnProperty(objA.id)) {
        this.links[objA.id] = new Hashtable<gdjs.RuntimeObject[]>();
      }
      return this.links[objA.id];
    }

    linkObjects(objA: gdjs.RuntimeObject, objB: gdjs.RuntimeObject) {
      const objALinkedObjectMap = this._getObjectsLinkedWith(objA);
      if (!objALinkedObjectMap.containsKey(objB.getName())) {
        objALinkedObjectMap.put(objB.getName(), []);
      }
      const objALinkedObjects = objALinkedObjectMap.get(objB.getName());
      if (objALinkedObjects.indexOf(objB) === -1) {
        objALinkedObjects.push(objB);
      }
      const objBLinkedObjectMap = this._getObjectsLinkedWith(objB);
      if (!objBLinkedObjectMap.containsKey(objA.getName())) {
        objBLinkedObjectMap.put(objA.getName(), []);
      }
      const objBLinkedObjects = objBLinkedObjectMap.get(objA.getName());
      if (objBLinkedObjects.indexOf(objA) === -1) {
        objBLinkedObjects.push(objA);
      }
    }

    removeAllLinksOf(obj: gdjs.RuntimeObject) {
      // Remove the other side of the links
      const linkedObjectMap = this._getObjectsLinkedWith(obj);
      for (const linkedObjectName in linkedObjectMap.items) {
        if (linkedObjectMap.containsKey(linkedObjectName)) {
          const linkedObjects = linkedObjectMap.get(linkedObjectName);

          for (let i = 0; i < linkedObjects.length; i++) {
            // This is the object on the other side of the link
            // We find obj in its list of linked objects and remove it.
            const linkedObject = linkedObjects[i];
            if (this.links.hasOwnProperty(linkedObject.id)) {
              const otherObjList = this.links[linkedObject.id].get(
                obj.getName()
              );
              const index = otherObjList.indexOf(obj);
              if (index !== -1) {
                otherObjList.splice(index, 1);
              }
            }
          }
        }
      }
      // Remove the links on obj side
      if (this.links.hasOwnProperty(obj.id)) {
        delete this.links[obj.id];
      }
    }

    removeLinkBetween(objA: gdjs.RuntimeObject, objB: gdjs.RuntimeObject) {
      if (this.links.hasOwnProperty(objA.id)) {
        const map = this.links[objA.id];
        if (map.containsKey(objB.getName())) {
          const list = map.get(objB.getName());
          const index = list.indexOf(objB);
          if (index !== -1) {
            list.splice(index, 1);
          }
        }
      }
      if (this.links.hasOwnProperty(objB.id)) {
        const map = this.links[objB.id];
        if (map.containsKey(objA.getName())) {
          const list = map.get(objA.getName());
          const index = list.indexOf(objA);
          if (index !== -1) {
            list.splice(index, 1);
          }
        }
      }
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
        )._getObjectsLinkedWith(obj);

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
              // For functions, objects may be a merged group
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
                linkedObjectExists || linkedObjectMap.containsKey(objectName);
            }

            if (linkedObjectExists) {
              if (pickedObjects.length === objectCount) {
                // All the objects were picked, there is no need to make an intersection.
                pickedObjects.length = 0;
                for (const objectName of temporaryObjectNames) {
                  if (linkedObjectMap.containsKey(objectName)) {
                    const linkedObjects = linkedObjectMap.get(objectName);

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
                  if (linkedObjectMap.containsKey(objectName)) {
                    const linkedObjects = linkedObjectMap.get(objectName);

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
