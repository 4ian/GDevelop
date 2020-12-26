
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/


/**
 * The SkeletonRuntimeObject imports and displays skeletal animations files.
 *
 * @memberof gdjs
 * @class SkeletonRuntimeObject
 * @extends RuntimeObject
 */
gdjs.SkeletonRuntimeObject = function(runtimeScene, objectData){
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);

    this.rootArmature = new gdjs.sk.Armature(this);
    this.rootArmature.getRenderer().putInScene(this, runtimeScene);
    this.rootArmature.setAsRoot();
    this.animationPlaying = true;
    this.animationSmooth = true;
    this.timeScale = 1.0;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.hitboxSlot = null;

    this.manager = gdjs.SkeletonObjectsManager.getManager(runtimeScene);
    this.getSkeletonData(runtimeScene, objectData);

    // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
    this.onCreated();
};
gdjs.SkeletonRuntimeObject.prototype = Object.create(gdjs.RuntimeObject.prototype);
gdjs.registerObject("SkeletonObject::Skeleton", gdjs.SkeletonRuntimeObject);

gdjs.SkeletonRuntimeObject.prototype.extraInitializationFromInitialInstance = function(initialInstanceData) {
    if(initialInstanceData.customSize){
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
    }
};

gdjs.SkeletonRuntimeObject.prototype.getSkeletonData = function(runtimeScene, objectData){
    var skeletonData = this.manager.getSkeleton(runtimeScene, this.name, objectData);

    if(skeletonData.armatures.length > 0){
        this.rootArmature.loadData(skeletonData.armatures[skeletonData.rootArmature],
                                   skeletonData,
                                   objectData.debugPolygons);

        this.rootArmature.resetState();
    }
};

// RuntimeObject overwrites
gdjs.SkeletonRuntimeObject.prototype.setX = function(x){
    this.x = x;
    this.rootArmature.setX(x);
};

gdjs.SkeletonRuntimeObject.prototype.setY = function(y){
    this.y = y;
    this.rootArmature.setY(y);
};

gdjs.SkeletonRuntimeObject.prototype.setAngle = function(angle){
    this.angle = angle;
    this.rootArmature.setRot(angle);
};

gdjs.SkeletonRuntimeObject.prototype.getRendererObject = function(){
    return this.rootArmature.getRendererObject();
};

gdjs.SkeletonRuntimeObject.prototype.getHitBoxes = function(){
    if(this.hitboxSlot){
        return this.hitboxSlot.getPolygons();
    }
    return [this.rootArmature.getAABB()];
};

gdjs.SkeletonRuntimeObject.prototype.stepBehaviorsPreEvents = function(runtimeScene){
    var delta = this.getElapsedTime(runtimeScene) / 1000.0;
    if(this.animationPlaying){
        this.rootArmature.updateAnimation(delta*this.timeScale);
    }

    gdjs.RuntimeObject.prototype.stepBehaviorsPreEvents.call(this, runtimeScene);
};

gdjs.SkeletonRuntimeObject.prototype.update = function(runtimeScene){
    this.rootArmature.update();
};

gdjs.SkeletonRuntimeObject.prototype.getDrawableX = function(){
    return this.getX() - this.rootArmature.shared.aabb[0][0] * Math.abs(this.scaleX);
};
gdjs.SkeletonRuntimeObject.prototype.getDrawableY = function(){
    return this.getY() - this.rootArmature.shared.aabb[0][1] * Math.abs(this.scaleY);
};

// Object instructions
gdjs.SkeletonRuntimeObject.prototype.getScaleX = function(){
    return this.scaleX;
};

gdjs.SkeletonRuntimeObject.prototype.setScaleX = function(scaleX){
    this.scaleX = scaleX;
    this.rootArmature.setSx(scaleX);
};

gdjs.SkeletonRuntimeObject.prototype.getScaleY = function(){
    return this.scaleY;
};

gdjs.SkeletonRuntimeObject.prototype.setScaleY = function(scaleY){
    this.scaleY = scaleY;
    this.rootArmature.setSy(scaleY);
};

gdjs.SkeletonRuntimeObject.prototype.getWidth = function(){
    return this.rootArmature.getDefaultWidth() * Math.abs(this.scaleX);
};

gdjs.SkeletonRuntimeObject.prototype.setWidth = function(width){
    if(width < 0) width = 0;
    this.setScaleX(width / this.rootArmature.getDefaultWidth());
};

gdjs.SkeletonRuntimeObject.prototype.getHeight = function(){
    return this.rootArmature.getDefaultHeight() * Math.abs(this.scaleY);
};

gdjs.SkeletonRuntimeObject.prototype.setHeight = function(height){
    if(height < 0) height = 0;
    this.setScaleY(height / this.rootArmature.getDefaultHeight());
};

gdjs.SkeletonRuntimeObject.prototype.setDefaultHitbox = function(slotPath){
    if(slotPath === ""){
        this.hitboxSlot = null;
        return;
    }
    var slot = this.getSlot(slotPath);
    if(slot){
        this.hitboxSlot = slot;
    }
};

// Animation instructions
gdjs.SkeletonRuntimeObject.prototype.isAnimationPaused = function(){
    return !this.animationPlaying;
};

gdjs.SkeletonRuntimeObject.prototype.setAnimationPaused = function(paused){
    this.animationPlaying = !paused;
};

gdjs.SkeletonRuntimeObject.prototype.isAnimationFinished = function(){
    return this.rootArmature.isAnimationFinished();
};

gdjs.SkeletonRuntimeObject.prototype.getAnimationTime = function(){
    return this.rootArmature.getAnimationTime();
};

gdjs.SkeletonRuntimeObject.prototype.setAnimationTime = function(time){
    this.rootArmature.setAnimationTime(time);
};

gdjs.SkeletonRuntimeObject.prototype.getAnimationTimeLength = function(){
    return this.rootArmature.getAnimationTimeLength();
};

gdjs.SkeletonRuntimeObject.prototype.getAnimationFrame = function(){
    return this.rootArmature.getAnimationFrame();
};

gdjs.SkeletonRuntimeObject.prototype.setAnimationFrame = function(frame){
    this.rootArmature.setAnimationFrame(frame);
};

gdjs.SkeletonRuntimeObject.prototype.getAnimationFrameLength = function(){
    return this.rootArmature.getAnimationFrameLength();
};

gdjs.SkeletonRuntimeObject.prototype.getAnimationIndex = function(){
    return this.rootArmature.getAnimationIndex();
};

gdjs.SkeletonRuntimeObject.prototype.setAnimationIndex = function(newAnimation, blendTime=0, loops=-1){
    this.rootArmature.setAnimationIndex(newAnimation, blendTime, loops);
};

gdjs.SkeletonRuntimeObject.prototype.getAnimationName = function(){
    return this.rootArmature.getAnimationName();
};

gdjs.SkeletonRuntimeObject.prototype.setAnimationName = function(newAnimation, blendTime=0, loops=-1){
    this.rootArmature.setAnimationName(newAnimation, blendTime, loops);
};

gdjs.SkeletonRuntimeObject.prototype.isAnimationSmooth = function(){
    return this.animationSmooth;
};

gdjs.SkeletonRuntimeObject.prototype.setAnimationSmooth = function(smooth){
    this.animationSmooth = smooth;
};

gdjs.SkeletonRuntimeObject.prototype.getAnimationTimeScale = function(){
    return this.timeScale;
};

gdjs.SkeletonRuntimeObject.prototype.setAnimationTimeScale = function(timeScale){
    if(timeScale < 0) timeScale = 0; // Support negative timeScale (backward animation) ?
    this.timeScale = timeScale;
};

gdjs.SkeletonRuntimeObject.prototype.resetAnimation = function(){
    this.rootArmature.resetAnimation();
};

// Bone instructions
gdjs.SkeletonRuntimeObject.prototype.getBoneX = function(bonePath){
    var bone = this.getBone(bonePath);
    return bone ? bone.getGlobalX() : 0;
};

gdjs.SkeletonRuntimeObject.prototype.setBoneX = function(bonePath, x){
    var bone = this.getBone(bonePath);
    if(bone){
        bone.setGlobalX(x);
        bone.update();
    }
};

gdjs.SkeletonRuntimeObject.prototype.getBoneY = function(bonePath){
    var bone = this.getBone(bonePath);
    return bone ? bone.getGlobalY() : 0;
};

gdjs.SkeletonRuntimeObject.prototype.setBoneY = function(bonePath, y){
    var bone = this.getBone(bonePath);
    if(bone){
        bone.setGlobalY(y);
        bone.update();
    }
};

gdjs.SkeletonRuntimeObject.prototype.getBoneAngle = function(bonePath){
    var bone = this.getBone(bonePath);
    return bone ? bone.getGlobalRot() : 0;
};

gdjs.SkeletonRuntimeObject.prototype.setBoneAngle = function(bonePath, angle){
    var bone = this.getBone(bonePath);
    if(bone){
        bone.setGlobalRot(angle);
        bone.update();
    }
};

gdjs.SkeletonRuntimeObject.prototype.getBoneScaleX = function(bonePath){
    var bone = this.getBone(bonePath);
    return bone ? bone.getSx() : 0;
};

gdjs.SkeletonRuntimeObject.prototype.setBoneScaleX = function(bonePath, scaleX){
    var bone = this.getBone(bonePath);
    if(bone){
        bone.setSx(scaleX);
        bone.update();
    }
};

gdjs.SkeletonRuntimeObject.prototype.getBoneScaleY = function(bonePath){
    var bone = this.getBone(bonePath);
    return bone ? bone.getSy() : 0;
};

gdjs.SkeletonRuntimeObject.prototype.setBoneScaleY = function(bonePath, scaleY){
    var bone = this.getBone(bonePath);
    if(bone){
        bone.setSy(scaleY);
        bone.update();
    }
};

gdjs.SkeletonRuntimeObject.prototype.resetBone = function(bonePath){
    var bone = this.getBone(bonePath);
    if(bone){
        bone.resetState();
    }
};

// Slot instructions
gdjs.SkeletonRuntimeObject.prototype.setSlotColor = function(slotPath, color){
    var slot = this.getSlot(slotPath);
    if(slot){
        var rgb = color.split(";");
        if(rgb.length < 3) return;
        slot.setColor(...rgb);
    }
};

gdjs.SkeletonRuntimeObject.prototype.isSlotVisible = function(slotPath){
    var slot = this.getSlot(slotPath);
    return slot ? slot.getVisible() : false;
};

gdjs.SkeletonRuntimeObject.prototype.setSlotVisible = function(slotPath, visible){
    var slot = this.getSlot(slotPath);
    if(slot){
        slot.setVisible(visible);
    }
};

gdjs.SkeletonRuntimeObject.prototype.getSlotZOrder = function(slotPath){
    var slot = this.getSlot(slotPath);
    return slot ? slot.getZ() : 0;
};

gdjs.SkeletonRuntimeObject.prototype.setSlotZOrder = function(slotPath, z){
    var slot = this.getSlot(slotPath);
    if(slot){
        slot.setZ(z);
    }
};

gdjs.SkeletonRuntimeObject.prototype.isPointInsideSlot = function(slotPath, x, y){
    var hitBoxes = this.getPolygons(slotPath);
    if(!hitBoxes) return false;

    for(var i = 0; i < this.hitBoxes.length; ++i) {
       if ( gdjs.Polygon.isPointInside(hitBoxes[i], x, y) )
            return true;
    }

    return false;
};

// Extension instructions
gdjs.SkeletonRuntimeObject.prototype.raycastSlot = function(slotPath, x, y, angle, dist, closest){
    var result = gdjs.Polygon.raycastTestStatics.result;
    result.collision = false;

    var endX = x + dist*Math.cos(angle*Math.PI/180.0);
    var endY = y + dist*Math.sin(angle*Math.PI/180.0);
    var testSqDist = closest ? dist*dist : 0;

    var hitBoxes = this.getPolygons(slotPath);
    if(!hitBoxes) return result;

    for(var i=0; i<hitBoxes.length; i++){
        var res =  gdjs.Polygon.raycastTest(hitBoxes[i], x, y, endX, endY);
        if ( res.collision ) {
            if ( closest && (res.closeSqDist < testSqDist) ) {
                testSqDist = res.closeSqDist;
                result = res;
            }
            else if ( !closest && (res.farSqDist > testSqDist) && (res.farSqDist <= dist*dist) ) {
                testSqDist = res.farSqDist;
                result = res;
            }
        }
    }

    return result;
};

// Warning!, assuming gdjs.evtTools.object.twoListsTest calls the predicate
// respecting the given objects lists paramenters order
gdjs.SkeletonRuntimeObject.slotObjectCollisionTest = function(skl, obj, slotPath){
    var hitBoxes1 = skl.getPolygons(slotPath);
    if(!hitBoxes1) return false;

    var hitBoxes2 = obj.getHitBoxes();
    for(var k=0, lenBoxes1=hitBoxes1.length; k<lenBoxes1; ++k){
        for(var l=0, lenBoxes2=hitBoxes2.length; l<lenBoxes2; ++l){
            if (gdjs.Polygon.collisionTest(hitBoxes1[k], hitBoxes2[l], false).collision){
                return true;
            }
        }
    }

    return false;
};

gdjs.SkeletonRuntimeObject.slotSlotCollisionTest = function(skl1, skl2, slotPaths){
    var hitBoxes1 = skl1.getPolygons(slotPaths[0]);
    var hitBoxes2 = skl2.getPolygons(slotPaths[1]);
    if(!hitBoxes1 || !hitBoxes2) return false;

    for(var k=0, lenBoxes1=hitBoxes1.length; k<lenBoxes1; ++k){
        for(var l=0, lenBoxes2=hitBoxes2.length; l<lenBoxes2; ++l){
            if (gdjs.Polygon.collisionTest(hitBoxes1[k], hitBoxes2[l], false).collision){
                return true;
            }
        }
    }

    return false;
};

// Helpers
gdjs.SkeletonRuntimeObject.prototype.getSlot = function(slotPath){
    var slotArray = slotPath.split("/");
    var currentSlot = null;
    if(slotArray[0] in this.rootArmature.slotsMap){
        currentSlot = this.rootArmature.slotsMap[slotArray[0]];
        for(var i=1; i<slotArray.length; i++){
            if(currentSlot.type === gdjs.sk.SLOT_ARMATURE &&
               slotArray[i] in currentSlot.childArmature.slotsMap){
                currentSlot = currentSlot.childArmature.slotsMap[slotArray[i]];
            }
            else{
                return null
            }
        }
    }
    return currentSlot;
};

gdjs.SkeletonRuntimeObject.prototype.getBone = function(bonePath){
    var slotArray = bonePath.split("/");
    var boneName = slotArray.pop();

    if(slotArray.length === 0 && boneName in this.rootArmature.bonesMap){
        return this.rootArmature.bonesMap[boneName];
    }

    var slot = this.getSlot(slotArray.join("/"));
    if(slot && slot.type === gdjs.sk.SLOT_ARMATURE && boneName in slot.childArmature.bonesMap){
        return slot.childArmature.bonesMap[boneName];
    }

    return null;
};

gdjs.SkeletonRuntimeObject.prototype.getPolygons = function(slotPath){
    if(slotPath === ""){
        return this.rootArmature.getHitBoxes();
    }

    var slot = this.getSlot(slotPath);
    if(slot){
        return slot.getPolygons();
    }

    return null;
};
