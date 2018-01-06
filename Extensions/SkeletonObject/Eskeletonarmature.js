
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/


/**
 * The SkeletonArmature hold the bones and slots/attachments as well as its animations.
 *
 * @namespace gdjs
 * @class SkeletonRuntimeObject
 * @extends RuntimeObject
 * @namespace gdjs
 */
gdjs.SkeletonArmature = function(skeleton, parentArmature=null, parentSlot=null){
	gdjs.SkeletonTransform.call(this);
	this.skeleton = skeleton;
	this.parentArmature = parentArmature;
	this.parentSlot = parentSlot;
	this.name = "";
	this.bones = [];
	this.bonesMap = {};
	this.slots = [];
	this.slotsMap = {};
	this.animations = [];
	this.animationsMap = {};
	this.currentAnimation = -1;
	this.aabb = gdjs.Polygon.createRectangle(0, 0);
	this.renderer = new gdjs.SkeletonArmatureRenderer();
	this._updateZ = false;
	this._loaded = false;
};

gdjs.SkeletonArmature.prototype = Object.create(gdjs.SkeletonTransform.prototype);

gdjs.SkeletonArmature.prototype.loadDragonBones = function(skeletalData, index, textures){
	
};

gdjs.SkeletonArmature.prototype.getRendererObject = function(){
	return this.renderer.getRendererObject();
};

gdjs.SkeletonArmature.prototype.setPos = function(x, y){
};
gdjs.SkeletonArmature.prototype.setRot = function(angle){
};
gdjs.SkeletonArmature.prototype.setScale = function(sx, sy){
};

gdjs.SkeletonArmature.prototype.getCurrentAnimation = function(){
	if(this.currentAnimation >= 0 && this.currentAnimation < this.animations.length){
		return this.animations[this.currentAnimation];
	}
	return null;
};

gdjs.SkeletonArmature.prototype.getAABB = function(){
	return this.aabb;
};

gdjs.SkeletonArmature.prototype.getWidth = function(){
	return 1;
};

gdjs.SkeletonArmature.prototype.getCurrentAnimation = function(){
	return -1;
};

gdjs.SkeletonArmature.prototype.setAnimation = function(newAnimation, blendTime, loops){
};

gdjs.SkeletonArmature.prototype.getCurrentAnimationName = function(){
	return "";
};

gdjs.SkeletonArmature.prototype.setAnimationName = function(newAnimation, blendTime, loops){
};

gdjs.SkeletonArmature.prototype.resetCurrentAnimation = function(){
};
