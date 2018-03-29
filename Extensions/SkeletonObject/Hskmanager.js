
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

gdjs.SkeletonObjectsManager = function(){
    // List of loaded skeletons per object type
    this.loadedObjects = {};
};

gdjs.SkeletonObjectsManager.getManager = function(runtimeScene){
    if( !runtimeScene.skeletonObjectsManager ){
        runtimeScene.skeletonObjectsManager = new gdjs.SkeletonObjectsManager();
    }

    return runtimeScene.skeletonObjectsManager;
};

gdjs.SkeletonObjectsManager.prototype.getSkeleton = function(runtimeScene, objectName, objectData){
    if( !(objectName in this.loadedObjects) ){
        this.loadedObjects[objectName] = this.loadSkeleton(runtimeScene, objectData);
    }

    return this.loadedObjects[objectName];
};

gdjs.SkeletonObjectsManager.prototype.loadSkeleton = function(runtimeScene, objectData){
    var loader = new gdjs.sk.DataLoader();
    var skeletalData = loader.getData(objectData.skeletalDataFilename);
    var skeleton = {"loader": loader,
                    "armatures": [],
                    "rootArmature": 0};

    if(objectData.apiName === "DragonBones"){
        // Load sub-textures
        loader.loadDragonBones(runtimeScene, objectData);
        // Load the root armature with the given name
        for(var i=0; i<skeletalData.armature.length; i++){
            var armature = new gdjs.sk.SharedArmature();
            armature.loadDragonBones(skeletalData.armature[i]);
            skeleton.armatures.push(armature);
            if(armature.name === objectData.rootArmatureName){
                skeleton.rootArmature = i;
            }
        }
    }

    return skeleton;
};
