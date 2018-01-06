
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/


/**
 * The SkeletonBone holds basic transform data in a hierarchy tree.
 *
 * @namespace gdjs
 * @class SkeletonBone
 * @extends gdjs.SkeletonTransform
 */
gdjs.SkeletonBone = function(armature){
    gdjs.SkeletonTransform.call(this);
    this.armature = armature;
    this.name = "";
    this.length = 0;
    this.restX = 0;
    this.restY = 0;
    this.restRot = 0;
    this.restSx = 1;
    this.restSy = 1;
};
gdjs.SkeletonBone.prototype = Object.create(gdjs.SkeletonTransform.prototype);
