
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/


/**
 * The SkeletonAnimation holds information to transform bones and slots through time.
 *
 * @namespace gdjs
 * @class SkeletonAnimation
 */
gdjs.SkeletonAnimation = function(armature, fps){
    this.fps = fps <= 0 || !fps ? 30 : fps;
    this.armature = armature;
    this.name = "";
    this.defaultPlayTimes = 0;
    this.playTimes = 0;
    this.playedTimes = 0;
    this.duration = 0; // in frames
    this.time = 0.0;
    this.boneAnimators = [];
    this.slotAnimators = [];
    this.meshAnimators = [];
    this.armatureAnimators = [];
    this.zOrderAnimator = new gdjs.SkeletonZOrderAnimator(this.armature.slots);
    this.blending = false;
    this.blendTime = 0.0;
    this.blendDuration = 0.0; // In seconds
    this.blendBones = [];
    this.blendSlots = [];
    this.blendMeshes = [];
};

gdjs.SkeletonAnimation.prototype.loadDragonBones = function(animationData){
    this.name = animationData.name;
};

gdjs.SkeletonAnimation.prototype.update = function(delta){
};

gdjs.SkeletonZOrderAnimator = function(slots){
};
