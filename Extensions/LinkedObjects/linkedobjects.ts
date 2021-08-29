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

    getObjectsLinkedWith(objA: gdjs.RuntimeObject) {
      if (!this.links.hasOwnProperty(objA.id)) {
        this.links[objA.id] = new Hashtable<gdjs.RuntimeObject[]>();
      }
      return this.links[objA.id];
    }

    linkObjects(objA: gdjs.RuntimeObject, objB: gdjs.RuntimeObject) {
      const objALinkedObjectMap = this.getObjectsLinkedWith(objA);
      if (!objALinkedObjectMap.hasOwnProperty(objB.getName())) {
        objALinkedObjectMap.put(
          objB.getName(),
          new Array<gdjs.RuntimeObject>()
        );
      }
      const objALinkedObjects = objALinkedObjectMap.get(objB.getName());
      if (objALinkedObjects.indexOf(objB) === -1) {
        objALinkedObjects.push(objB);
      }
      const objBLinkedObjectMap = this.getObjectsLinkedWith(objB);
      if (!objBLinkedObjectMap.hasOwnProperty(objA.getName())) {
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
      const linkedObjectMap = this.getObjectsLinkedWith(obj);

      for (const linkedObjectMapItem in linkedObjectMap.items) {
        if (linkedObjectMap.items.hasOwnProperty(linkedObjectMapItem)) {
          const objLinkedObjects = linkedObjectMap.items[linkedObjectMapItem];
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
        if (map.hasOwnProperty(objB.getName())) {
          const list = map.get(objB.getName());
          const index = list.indexOf(objB);
          if (index !== -1) {
            list.splice(index, 1);
          }
        }
      }
      if (this.links.hasOwnProperty(objB.id)) {
        const map = this.links[objB.id];
        if (map.hasOwnProperty(objA.getName())) {
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

      export const _objectIsInList = function (
        obj: gdjs.RuntimeObject,
        linkedObjects: gdjs.RuntimeObject[]
      ) {
        return linkedObjects.indexOf(obj) !== -1;
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
        ).getObjectsLinkedWith(obj);

        let pickedSomething = false;
        const temporaryObjects = gdjs.staticArray(
          gdjs.evtTools.linkedObjects.pickObjectsLinkedTo
        );
        for (const objectName in linkedObjectMap.items) {
          if (
            linkedObjectMap.items.hasOwnProperty(objectName) &&
            objectsLists.items.hasOwnProperty(objectName)
          ) {
            const linkedObjects = linkedObjectMap.items[objectName];
            const pickedObjects = objectsLists.items[objectName];

            if (
              pickedObjects.length ===
              runtimeScene.getObjects(objectName).length
            ) {
              // All the objects were picked, there is no need to make an intersection.
              pickedObjects.length = 0;
              pickedSomething = pickedSomething || linkedObjects.length > 0;
              pickedObjects.push.apply(pickedObjects, linkedObjects);
            } else {
              temporaryObjects.length = 0;
              for (const otherObject of linkedObjects) {
                if (pickedObjects.indexOf(otherObject) >= 0) {
                  temporaryObjects.push(otherObject);
                }
              }
              pickedObjects.length = 0;
              pickedSomething = pickedSomething || temporaryObjects.length > 0;
              pickedObjects.push.apply(pickedObjects, temporaryObjects);
            }
          }
        }
        temporaryObjects.length = 0;
        return pickedSomething;
      };
    }
  }
}
