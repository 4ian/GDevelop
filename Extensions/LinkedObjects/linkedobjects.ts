/*
GDevelop - LinkedObjects Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /**
   * Manages the links between objects.
   */
  export class LinksManager {
    private links: { [objectId: number]: gdjs.RuntimeObject[] } = {};

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
        this.links[objA.id] = [];
      }
      return this.links[objA.id];
    }

    linkObjects(objA: gdjs.RuntimeObject, objB: gdjs.RuntimeObject) {
      const objALinkedObjects = this.getObjectsLinkedWith(objA);
      if (objALinkedObjects.indexOf(objB) === -1) {
        objALinkedObjects.push(objB);
      }
      const objBLinkedObjects = this.getObjectsLinkedWith(objB);
      if (objBLinkedObjects.indexOf(objA) === -1) {
        objBLinkedObjects.push(objA);
      }
    }

    removeAllLinksOf(obj: gdjs.RuntimeObject) {
      const objLinkedObjects = this.getObjectsLinkedWith(obj);
      for (let i = 0; i < objLinkedObjects.length; i++) {
        if (this.links.hasOwnProperty(objLinkedObjects[i].id)) {
          const otherObjList = this.links[objLinkedObjects[i].id];
          const index = otherObjList.indexOf(obj);
          if (index !== -1) {
            otherObjList.splice(index, 1);
          }
        }
      }
      if (this.links.hasOwnProperty(obj.id)) {
        delete this.links[obj.id];
      }
    }

    removeLinkBetween(objA: gdjs.RuntimeObject, objB: gdjs.RuntimeObject) {
      if (this.links.hasOwnProperty(objA.id)) {
        const list = this.links[objA.id];
        const index = list.indexOf(objB);
        if (index !== -1) {
          list.splice(index, 1);
        }
      }
      if (this.links.hasOwnProperty(objB.id)) {
        const list = this.links[objB.id];
        const index = list.indexOf(objA);
        if (index !== -1) {
          list.splice(index, 1);
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
        const linkedObjects = LinksManager.getManager(
          runtimeScene
        ).getObjectsLinkedWith(obj);
        return gdjs.evtTools.object.pickObjectsIf(
          gdjs.evtTools.linkedObjects._objectIsInList,
          objectsLists,
          false,
          linkedObjects
        );
      };
    }
  }
}
