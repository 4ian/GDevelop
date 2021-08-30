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
        objALinkedObjectMap.put(
          objB.getName(),
          new Array<gdjs.RuntimeObject>()
        );
      }
      const objALinkedObjects = objALinkedObjectMap.get(objB.getName());
      if (objALinkedObjects.indexOf(objB) === -1) {
        objALinkedObjects.push(objB);
      }
      const objBLinkedObjectMap = this._getObjectsLinkedWith(objB);
      if (!objBLinkedObjectMap.containsKey(objA.getName())) {
        objBLinkedObjectMap.put(
          objA.getName(),
          new Array<gdjs.RuntimeObject>()
        );
      }
      const objBLinkedObjects = objBLinkedObjectMap.get(objA.getName());
      if (objBLinkedObjects.indexOf(objA) === -1) {
        objBLinkedObjects.push(objA);
      }
    }

    removeAllLinksOf(obj: gdjs.RuntimeObject) {
      const linkedObjectMap = this._getObjectsLinkedWith(obj);

      for (const linkedObjectName in linkedObjectMap.items) {
        if (linkedObjectMap.containsKey(linkedObjectName)) {
          const objLinkedObjects = linkedObjectMap.get(linkedObjectName);

          for (let i = 0; i < objLinkedObjects.length; i++) {
            if (this.links.hasOwnProperty(objLinkedObjects[i].id)) {
              const otherObjList = this.links[objLinkedObjects[i].id].get(
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

      export const pickObjectsLinkedTo = function (
        runtimeScene: gdjs.RuntimeScene,
        objectsLists: Hashtable<gdjs.RuntimeObject[]>,
        obj: gdjs.RuntimeObject
      ) {
        if (obj === null) {
          return false;
        }
        const linkedObjectMap = LinksManager.getManager(
          runtimeScene
        )._getObjectsLinkedWith(obj);

        let pickedSomething = false;
        for (const objectName in objectsLists.items) {
          if (objectsLists.containsKey(objectName)) {
            const pickedObjects = objectsLists.items[objectName];

            if (linkedObjectMap.containsKey(objectName)) {
              const linkedObjects = linkedObjectMap.get(objectName);
              if (
                pickedObjects.length ===
                runtimeScene.getObjects(objectName).length
              ) {
                // All the objects were picked, there is no need to make an intersection.
                pickedSomething = pickedSomething || linkedObjects.length > 0;
                pickedObjects.length = 0;
                pickedObjects.push.apply(pickedObjects, linkedObjects);
              } else {
                const temporaryObjects = gdjs.staticArray(
                  gdjs.evtTools.linkedObjects.pickObjectsLinkedTo
                );
                temporaryObjects.length = 0;
                for (const otherObject of linkedObjects) {
                  if (pickedObjects.indexOf(otherObject) >= 0) {
                    temporaryObjects.push(otherObject);
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
          }
        }
        return pickedSomething;
      };
    }
  }
}
