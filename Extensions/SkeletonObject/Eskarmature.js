
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/


/**
 * The Armature holds the bones and slots/attachments as well as its animations.
 *
 * @namespace gdjs.sk
 * @class Armature
 * @extends gdjs.sk.Transform
 */
gdjs.sk.Armature = function(skeleton, parentArmature=null, parentSlot=null){
	gdjs.sk.Transform.call(this);
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
	this.renderer = new gdjs.sk.ArmatureRenderer();
	this.debugRenderer = null;
	this._updateZ = false;
	this._loaded = false;
};
gdjs.sk.Armature.prototype = Object.create(gdjs.sk.Transform.prototype);

gdjs.sk.Armature.prototype.loadDragonBones = function(skeletalData, index, textures, debugPolygons){
	var armatureData = skeletalData.armature[index];
	this.name = armatureData.name;
	this.loaded = true;

	var aabb = armatureData.aabb;
	this.aabb.vertices[0] = [aabb.x,              aabb.y              ];
	this.aabb.vertices[1] = [aabb.x + aabb.width, aabb.y			  ];
	this.aabb.vertices[2] = [aabb.x + aabb.width, aabb.y + aabb.height];
	this.aabb.vertices[3] = [aabb.x,              aabb.y + aabb.height];

	if(debugPolygons){
		this.debugRenderer = new gdjs.sk.DebugRenderer();
		this.debugRenderer.loadVertices(this.aabb.vertices, [100, 100, 255], false);
	}

	// Get all the bones
	for(var i=0; i<armatureData.bone.length; i++){
		var bone = new gdjs.sk.Bone(this);
		bone.loadDragonBones(armatureData.bone[i]);
		this.bones.push(bone);
		this.bonesMap[armatureData.bone[i].name] = bone;
	}
	// With all the bones loaded, set parents
	for(var i=0; i<armatureData.bone.length; i++){
		if(armatureData.bone[i].hasOwnProperty("parent")){ // Child bone
			this.bonesMap[armatureData.bone[i].parent].addChild(this.bonesMap[armatureData.bone[i].name]);
		}
		else{ // Root bone
			this.addChild(this.bonesMap[armatureData.bone[i].name]);
		}
	}
	this.update();

	// Get all the slots
	for(var i=0; i<armatureData.slot.length; i++){
		var slot = new gdjs.sk.Slot(this)
		this.slots.push(slot);
		this.slotsMap[armatureData.slot[i].name] = slot;
		this.bonesMap[armatureData.slot[i].parent].addChild(slot);
		slot.loadDragonBonesSlotData(armatureData.slot[i]);
	}
	// Generate displayers
	for(var i=0; i<armatureData.skin[0].slot.length; i++){
		var skinData = armatureData.skin[0].slot[i];
		var slot = this.slotsMap[skinData.name];
		this.slotsMap[skinData.name].loadDragonBonesSkinData(armatureData.skin[0].slot,
															 i,
															 skeletalData,
															 this.bones,
															 textures,
															 debugPolygons);
	}
	// Get all the animations
	for(var i=0; i<armatureData.animation.length; i++){
		var animation = new gdjs.sk.Animation(this, armatureData.frameRate);
		animation.loadDragonBones(armatureData.animation[i]);
		this.animations.push(animation);
		this.animationsMap[animation.name] = i;
	}

	this.setRenderers();
};

gdjs.sk.Armature.prototype.updateAnimation = function(delta){
	var animation = this.getCurrentAnimation();
	if(animation){
		animation.update(delta);
	}
};

gdjs.sk.Armature.prototype.getRendererObject = function(){
	return this.renderer.getRendererObject();
};

gdjs.sk.Armature.prototype.setRenderers = function(){
	for(var i=0; i<this.slots.length; i++){
		if(this.slots[i].type === gdjs.sk.SLOT_IMAGE || this.slots[i].type === gdjs.sk.SLOT_MESH){
			this.renderer.addRenderer(this.slots[i].renderer);
			if(this.slots[i].debugRenderer){
				this.renderer.addDebugRenderer(this.slots[i].debugRenderer);
			}
		}
		else if(this.slots[i].type === gdjs.sk.SLOT_ARMATURE){
			this.renderer.addRenderer(this.slots[i].childArmature.renderer);
			if(this.slots[i].childArmature.debugRenderer){
				this.renderer.addDebugRenderer(this.slots[i].childArmature.debugRenderer);
			}
		}
		else if(this.slots[i].type === gdjs.sk.SLOT_POLYGON){
			if(this.slots[i].debugRenderer){
				this.renderer.addDebugRenderer(this.slots[i].debugRenderer);
			}
		}
	}

	if(this.debugRenderer){
		this.renderer.addDebugRenderer(this.debugRenderer);
	}
};

gdjs.sk.Armature.prototype.getCurrentAnimation = function(){
	if(this.currentAnimation >= 0 && this.currentAnimation < this.animations.length){
		return this.animations[this.currentAnimation];
	}
	return null;
};

gdjs.sk.Armature.prototype.getAABB = function(){
	return this.transformPolygon(this.aabb);
};

gdjs.sk.Armature.prototype.getDefaultWidth = function(){
	return this.aabb.vertices[1][0] - this.aabb.vertices[0][0];
};

gdjs.sk.Armature.prototype.getDefaultHeight = function(){
	return this.aabb.vertices[2][1] - this.aabb.vertices[1][1];
};

gdjs.sk.Armature.prototype.resetState = function(){
	for(var i=0; i<this.bones.length; i++){
		this.bones[i].resetState();
	}
	for(var i=0; i<this.slots.length; i++){
		this.slots[i].resetState();
	}
	this.renderer.sortRenderers();
};

gdjs.sk.Armature.prototype.resetState = function(){
	for(var i=0; i<this.bones.length; i++){
		this.bones[i].resetState();
	}
	for(var i=0; i<this.slots.length; i++){
		this.slots[i].resetState();
	}
	this.renderer.sortRenderers();
};

gdjs.sk.Armature.prototype.updateZOrder = function(){
	this.renderer.sortRenderers();
};

gdjs.sk.Armature.prototype.isAnimationFinished = function(){
	var animation = this.getCurrentAnimation();
	return animation ? animation.isFinished() : false;
};

gdjs.sk.Armature.prototype.getAnimationTime = function(){
	var animation = this.getCurrentAnimation();
	return animation ? animation.getTime() : 0;
};

gdjs.sk.Armature.prototype.setAnimationTime = function(time){
	var animation = this.getCurrentAnimation();
	if(animation){
		animation.setTime(time);
	}
};

gdjs.sk.Armature.prototype.getAnimationTimeLength = function(){
	var animation = this.getCurrentAnimation();
	return animation ? animation.getTimeLength() : 0;
};

gdjs.sk.Armature.prototype.getAnimationFrame = function(){
	var animation = this.getCurrentAnimation();
	return animation ? animation.getFrame() : 0;
};

gdjs.sk.Armature.prototype.setAnimationFrame = function(frame){
	var animation = this.getCurrentAnimation();
	if(animation){
		animation.setFrame(frame);
	}
};

gdjs.sk.Armature.prototype.getAnimationFrameLength = function(){
	var animation = this.getCurrentAnimation();
	return animation ? animation.getFrameLength() : 0;
};

gdjs.sk.Armature.prototype.getAnimationIndex = function(){
	return this.currentAnimation;
};

gdjs.sk.Armature.prototype.setAnimationIndex = function(newAnimation, blendTime, loops){
	if(newAnimation >= 0 && newAnimation < this.animations.length && newAnimation !== this.currentAnimation){
		this.resetState();
		var oldAnimation = this.currentAnimation;
		this.currentAnimation = newAnimation;
		this.animations[this.currentAnimation].reset(loops);
		if(blendTime > 0 && oldAnimation >= 0 && oldAnimation < this.animations.length){
			this.animations[this.currentAnimation].blendFrom(this.animations[oldAnimation], blendTime);
		}
		for(var i=0; i<this.slots.length; i++){
			if(this.slots[i].type === gdjs.sk.SLOT_ARMATURE){
				var childArmature = this.slots[i].childArmature;
				if(blendTime > 0){
					var childAnimation = "";
					var animators = this.animations[this.currentAnimation].armatureAnimators;
					for(var j=0; j<animators.length; j++){
						if(animators[j].target === childArmature){
							if(animators[j].channelAction.frames.length > 0 &&
							   animators[j].channelAction.frames[0] === 0)
							{
								for(var k=0; k<animators[j].actionsLists[0].length; k++)
								{
									if(animators[j].actionsLists[0][k].type === gdjs.sk.EVENT_PLAY ||
									   animators[j].actionsLists[0][k].type === gdjs.sk.EVENT_PLAYSINGLE)
									{
										childAnimation = animators[j].actionsLists[0][k].value;
									}
								}
							}
							break;
						}
					}
					childArmature.setAnimationName(childAnimation, blendTime, -1);
				}
				else{
					childArmature.currentAnimation = -1;
				}
			}
		}
		this.animations[this.currentAnimation].update(0);
	}
};

gdjs.sk.Armature.prototype.getAnimationName = function(){
	var animation = this.getCurrentAnimation();
	return animation ? animation.name : "";
};

gdjs.sk.Armature.prototype.setAnimationName = function(newAnimation, blendTime, loops){
	if(newAnimation in this.animationsMap){
		this.setAnimationIndex(this.animationsMap[newAnimation], blendTime, loops);
	}
};

gdjs.sk.Armature.prototype.resetAnimation = function(){
	var animation = this.getCurrentAnimation();
	if(animation){
		animation.reset();
	}
};

gdjs.sk.Armature.prototype.update = function(){
	gdjs.sk.Transform.prototype.update.call(this);

	if(this.debugRenderer){
		var transform = gdjs.sk.Transform.decomposeMatrix(this.worldMatrix, this.debugRenderer.skewSupported());
		this.debugRenderer.setTransform(transform);
	}
};
