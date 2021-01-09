/**
GDevelop - LinkedObjects Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /**
   * Manages the links between objects.
   */
  export class LinksManager {
    links: any = {};

    /**
     * Get the links manager of a scene.
     */
    static getManager(runtimeScene) {
      if (!runtimeScene.linkedObjectsManager) {
        //Create the shared manager if necessary.
        runtimeScene.linkedObjectsManager = new gdjs.LinksManager();
      }
      return runtimeScene.linkedObjectsManager;
    }

    getObjectsLinkedWith(objA) {
      if (!this.links.hasOwnProperty(objA.id)) {
        this.links[objA.id] = [];
      }
      return this.links[objA.id];
    }

    linkObjects(objA, objB) {
      const objALinkedObjects = this.getObjectsLinkedWith(objA);
      if (objALinkedObjects.indexOf(objB) === -1) {
        objALinkedObjects.push(objB);
      }
      const objBLinkedObjects = this.getObjectsLinkedWith(objB);
      if (objBLinkedObjects.indexOf(objA) === -1) {
        objBLinkedObjects.push(objA);
      }
    }

    removeAllLinksOf(obj) {
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

    removeLinkBetween(objA, objB) {
      let list, index;
      if (this.links.hasOwnProperty(objA.id)) {
        list = this.links[objA.id];
        index = list.indexOf(objB);
        if (index !== -1) {
          list.splice(index, 1);
        }
      }
      if (this.links.hasOwnProperty(objB.id)) {
        list = this.links[objB.id];
        index = list.indexOf(objA);
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
      export const linkObjects = function (runtimeScene, objA, objB) {
        if (objA === null || objB === null) {
          return;
        }
        LinksManager.getManager(runtimeScene).linkObjects(objA, objB);
      };
      export const removeLinkBetween = function (runtimeScene, objA, objB) {
        if (objA === null || objB === null) {
          return;
        }
        LinksManager.getManager(runtimeScene).removeLinkBetween(objA, objB);
      };
      export const removeAllLinksOf = function (runtimeScene, objA) {
        if (objA === null) {
          return;
        }
        LinksManager.getManager(runtimeScene).removeAllLinksOf(objA);
      };
      export const _objectIsInList = function (obj, linkedObjects) {
        return linkedObjects.indexOf(obj) !== -1;
      };
      export const pickObjectsLinkedTo = function (
        runtimeScene,
        objectsLists,
        obj
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
