
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
 */
gdjs.SkeletonRuntimeObject = function(runtimeScene, objectData){
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);

    this.rootArmature = new gdjs.SkeletonArmature(this);
    this.animationPlaying = true;
    this.animationSmooth = true;
    this.timeScale = 1.0;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.renderer = new gdjs.SkeletonRuntimeObjectRenderer();
    
    var skeletalData = this.renderer.getData(objectData.skeletalDataFilename);
    if(objectData.apiName === "DragonBones"){
        // Main loader
        this.loadDragonBones(runtimeScene, skeletalData, objectData);
    }
};
gdjs.SkeletonRuntimeObject.prototype = Object.create(gdjs.RuntimeObject.prototype);
gdjs.SkeletonRuntimeObject.thisIsARuntimeObjectConstructor = "SkeletonObject::Skeleton";

gdjs.SkeletonRuntimeObject.prototype.extraInitializationFromInitialInstance = function(initialInstanceData) {
    if(initialInstanceData.customSize){
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
    }
};

gdjs.SkeletonRuntimeObject.prototype.loadDragonBones = function(runtimeScene, skeletalData, objectData){
    // Load the sub-textures
    this.renderer.loadDragonBones(runtimeScene, objectData);
    // Get the root armature with the given name
    for(var i=0; i<skeletalData.armature.length; i++){
        if(skeletalData.armature[i].name === objectData.rootArmatureName){
            this.rootArmature.loadDragonBones(skeletalData, i, this.renderer.textures);
        }
    }
    // If name was not found, get the first armature
    if(!this.rootArmature.loaded && skeletalData.armature.length > 0){
        this.rootArmature.loadDragonBones(skeletalData, 0, this.renderer.textures);
    }
    this.rootArmature.renderer.putInScene(this, runtimeScene);
};

gdjs.SkeletonRuntimeObject.prototype.setX = function(x){
    this.x = x;
    this.rootArmature.setPos(x, this.y);
};

gdjs.SkeletonRuntimeObject.prototype.setY = function(y){
    this.y = y;
    this.rootArmature.setPos(this.x, y);
};

gdjs.SkeletonRuntimeObject.prototype.setAngle = function(angle){
    this.angle = angle;
    this.rootArmature.setRot(angle);
};

gdjs.SkeletonRuntimeObject.prototype.setScaleX = function(scaleX){
    this.scaleX = scaleX;
    this.rootArmature.setScale(scaleX, this.scaleY);
};

gdjs.SkeletonRuntimeObject.prototype.setScaleY = function(scaleY){
    this.scaleY = scaleY;
    this.rootArmature.setScale(this.scaleX, scaleY);
};

gdjs.SkeletonRuntimeObject.prototype.setWidth = function(width){
    this.setScaleX(width / this.rootArmature.getDefaultWidth());
};

gdjs.SkeletonRuntimeObject.prototype.setHeight = function(height){
    this.setScaleY(height / this.rootArmature.getDefaultHeight());
};

gdjs.SkeletonRuntimeObject.prototype.getRendererObject = function(){
    return this.rootArmature.getRendererObject();
};

gdjs.SkeletonRuntimeObject.prototype.getHitBoxes = function(){
    return [this.rootArmature.getAABB()];
};

gdjs.SkeletonRuntimeObject.prototype.update = function(runtimeScene){
    var delta = this.getElapsedTime(runtimeScene) / 1000.0;
    if(this.animationPlaying){
        this.rootArmature.updateAnimation(delta*this.timeScale);
    }
    this.rootArmature.update();
};

gdjs.SkeletonRuntimeObject.prototype.getTimescale = function(timeScale){
    this.timeScale = timeScale < 0 ? 0 : timeScale; // Support negative timeScale (backward) ?
};

gdjs.SkeletonRuntimeObject.prototype.pauseAnimation = function(){
    this.animationPlaying = false;
};

gdjs.SkeletonRuntimeObject.prototype.unpauseAnimation = function(){
    this.animationPlaying = true;
};

gdjs.SkeletonRuntimeObject.prototype.isAnimationPaused = function(){
    return !this.animationPlaying;
};

gdjs.SkeletonRuntimeObject.prototype.isAnimationSmooth = function(){
    return this.animationSmooth;
};

gdjs.SkeletonRuntimeObject.prototype.isAnimationSmooth = function(){
    return this.animationSmooth;
};

gdjs.SkeletonRuntimeObject.prototype.getCurrentAnimation = function(){
    return this.rootArmature.getCurrentAnimation();
};

gdjs.SkeletonRuntimeObject.prototype.setAnimation = function(newAnimation, blendTime=0, loops=-1){
    this.rootArmature.setAnimation(newAnimation, blendTime, loops);
};

gdjs.SkeletonRuntimeObject.prototype.getCurrentAnimationName = function(){
    return this.rootArmature.getCurrentAnimationName();
};

gdjs.SkeletonRuntimeObject.prototype.setAnimationName = function(newAnimation, blendTime=0, loops=-1){
    this.rootArmature.setAnimationName(newAnimation, blendTime, loops);
};

gdjs.SkeletonRuntimeObject.prototype.resetCurrentAnimation = function(){
    this.rootArmature.resetCurrentAnimation();
};

gdjs.SkeletonRuntimeObject.prototype.getSlot = function(slotPath){
    return null;
};

gdjs.SkeletonRuntimeObject.prototype.getBone = function(bonePath){
    return null;
};

gdjs.SkeletonRuntimeObject.prototype.getSlotX = function(slotPath){
    return 0;
};

gdjs.SkeletonRuntimeObject.prototype.setSlotX = function(slotPath, x){
};

gdjs.SkeletonRuntimeObject.prototype.slotCollidesWithObject = function(slotPath, object){
    return false;
};

gdjs.SkeletonRuntimeObject.prototype.slotCollidesWithSlot = function(slotPath1, slotPath2){
    return false;
};
