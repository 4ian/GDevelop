
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/


/**
 * The SkeletonRuntimeObject imports and displays skeletal animations files.
 *
 * @namespace gdjs
 * @class SkeletonRuntimeObject
 * @extends RuntimeObject
 * @namespace gdjs
 */
gdjs.SkeletonRuntimeObject = function(runtimeScene, objectData){
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);

    this.filename = objectData.mainFilename;
};

gdjs.SkeletonRuntimeObject.prototype = Object.create(gdjs.RuntimeObject.prototype);
gdjs.SkeletonRuntimeObject.thisIsARuntimeObjectConstructor = "SkeletonObject::Skeleton";

gdjs.SkeletonRuntimeObject.prototype.sayHello = function(){
    console.log(this.filename);
};

gdjs.SkeletonRuntimeObject.prototype.setLayer = function(layer){
     // No renderable object
};

gdjs.SkeletonRuntimeObject.prototype.setZOrder = function(z){
     // No renderable object
};
