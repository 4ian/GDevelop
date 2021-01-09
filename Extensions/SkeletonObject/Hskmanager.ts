namespace gdjs {
  /**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/
  export class SkeletonObjectsManager {
    // List of loaded skeletons per object type
    loadedObjects: any = {};

    static getManager(runtimeScene) {
      if (!runtimeScene.skeletonObjectsManager) {
        runtimeScene.skeletonObjectsManager = new gdjs.SkeletonObjectsManager();
      }
      return runtimeScene.skeletonObjectsManager;
    }

    getSkeleton(runtimeScene, objectName, objectData) {
      if (!(objectName in this.loadedObjects)) {
        this.loadedObjects[objectName] = this.loadSkeleton(
          runtimeScene,
          objectData
        );
      }
      return this.loadedObjects[objectName];
    }

    /**
     * Load the Skeleton data
     */
    loadSkeleton(runtimeScene: gdjs.RuntimeScene, objectData: Object) {
      const loader = new gdjs.sk.DataLoader();
      const skeleton = { loader: loader, armatures: [], rootArmature: 0 };
      const jsonManager = runtimeScene.getGame().getJsonManager();
      const skeletalData = jsonManager.getLoadedJson(
        objectData.skeletalDataFilename
      );
      if (!skeletalData) {
        console.error(
          'Tried to load a Skeleton file from "' +
            objectData.skeletalDataFilename +
            '" but this resource is not loaded.'
        );
        return skeleton;
      }
      if (objectData.apiName === 'DragonBones') {
        // Load sub-textures
        loader.loadDragonBones(runtimeScene, objectData);

        // Load the root armature with the given name
        for (let i = 0; i < skeletalData.armature.length; i++) {
          const armature = new gdjs.sk.SharedArmature();
          armature.loadDragonBones(skeletalData.armature[i]);
          skeleton.armatures.push(armature);
          if (armature.name === objectData.rootArmatureName) {
            skeleton.rootArmature = i;
          }
        }
      }
      return skeleton;
    }
  }
}
