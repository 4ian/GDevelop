
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

gdjs.SkeletonBone.prototype.loadDragonBones = function(boneData){
    this.name = boneData.name;
    this.length = boneData.hasOwnProperty("length") ? boneData.length : 0; // Debug only
    
    var transformData = boneData.transform;
    this.restX = transformData.hasOwnProperty("x") ? transformData.x : 0;
    this.restY = transformData.hasOwnProperty("y") ? transformData.y : 0;
    this.restRot = transformData.hasOwnProperty("skX") ? transformData.skX * Math.PI / 180.0 : 0;
    this.restSx = transformData.hasOwnProperty("scX") ? transformData.scX : 1;
    this.restSy = transformData.hasOwnProperty("scY") ? transformData.scY : 1;

    this.inheritRotation = boneData.hasOwnProperty("inheritRotation") ? transformData.inheritRotation : true;
    this.inheritScale = boneData.hasOwnProperty("inheritScale") ? transformData.inheritScale : true;

    this.resetState();
};

gdjs.SkeletonBone.prototype.resetState = function(){
    this.setPos(0, 0);
    this.setRot(0);
    this.setScale(1, 1);
};

gdjs.SkeletonBone.prototype.setPos = function(x, y){
    var prevX = this.x;
    var prevY = this.y;
    this.x = this.restX + x;
    this.y = this.restY + y;
    if(this.x !== prevX || this.y !== prevY){
        this._updateMatrix = true;
    }
};

gdjs.SkeletonBone.prototype.setRot = function(angle){
    var prevRot = this.rot;
    this.rot = this.restRot + angle*Math.PI/180.0;
    if(this.rot !== prevRot){
        this._updateMatrix = true;
    }
};

gdjs.SkeletonBone.prototype.setScale = function(sx, sy){
    var prevSx = this.sx;
    var prevSy = this.sy;
    this.sx = this.restSx * sx;
    this.sy = this.restSy * sy;
    if(this.sx !== prevSx || this.sy !== prevSy){
        this._updateMatrix = true;
    }
};
