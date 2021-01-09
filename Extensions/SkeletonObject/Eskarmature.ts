namespace gdjs {
  /**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

  gdjs.sk.SharedArmature = function () {
    this.name = '';
    this.bones = [];
    this.bonesMap = {};
    this.rootBone = -1;
    this.slots = [];
    this.slotsMap = {};
    this.animations = [];
    this.animationsMap = {};
    this.aabb = [];
  };
  gdjs.sk.SharedArmature.prototype.loadDragonBones = function (
    armatureData,
    textures
  ) {
    this.name = armatureData.name;
    const aabb = armatureData.aabb;
    this.aabb.push([aabb.x, aabb.y]);
    this.aabb.push([aabb.x + aabb.width, aabb.y]);
    this.aabb.push([aabb.x + aabb.width, aabb.y + aabb.height]);
    this.aabb.push([aabb.x, aabb.y + aabb.height]);

    // Get all the bones
    for (let i = 0; i < armatureData.bone.length; i++) {
      const bone = new gdjs.sk.SharedBone();
      bone.loadDragonBones(armatureData.bone[i]);
      this.bones.push(bone);
      this.bonesMap[armatureData.bone[i].name] = i;
    }

    // Set bone parents
    for (let i = 0; i < armatureData.bone.length; i++) {
      if (
        armatureData.bone[i].hasOwnProperty(
          // Child bone
          'parent'
        )
      ) {
        this.bones[i].parent = this.bonesMap[armatureData.bone[i].parent];
        this.bones[this.bones[i].parent].childBones.push(i);
      } else {
        // Root bone
        this.rootBone = i;
      }
    }

    // Get all the slots
    for (let i = 0; i < armatureData.slot.length; i++) {
      let slot = new gdjs.sk.SharedSlot();
      slot.loadDragonBonesSlotData(armatureData.slot[i]);
      this.slots.push(slot);
      this.slotsMap[armatureData.slot[i].name] = i;
      this.slots[i].parent = this.bonesMap[armatureData.slot[i].parent];
      this.bones[this.slots[i].parent].childSlots.push(i);
    }

    // Generate displayers
    for (let i = 0; i < armatureData.skin[0].slot.length; i++) {
      const skinData = armatureData.skin[0].slot[i];
      let slot = this.slots[this.slotsMap[skinData.name]];
      slot.loadDragonBonesSkinData(armatureData.skin[0].slot, i);
    }

    // Get all the animations
    for (let i = 0; i < armatureData.animation.length; i++) {
      const animation = new gdjs.sk.SharedAnimation();
      animation.loadDragonBones(
        armatureData.animation[i],
        armatureData.frameRate,
        this.slots
      );
      this.animations.push(animation);
      this.animationsMap[animation.name] = i;
    }
  };

  /**
   * The Armature holds the bones and slots/attachments as well as its animations.
   */
  gdjs.sk.Armature = function (
    skeleton,
    parentArmature = null,
    parentSlot = null
  ) {
    gdjs.sk.Transform.call(this);
    this.shared = null;
    this.skeleton = skeleton;
    this.parentArmature = parentArmature;
    this.parentSlot = parentSlot;
    this.bones = [];
    this.bonesMap = {};
    this.slots = [];
    this.slotsMap = {};
    this.animations = [];
    this.animationsMap = {};
    this.currentAnimation = -1;
    this.renderer = new gdjs.sk.ArmatureRenderer();
    this.debugRenderer = null;
    this.isRoot = false;
  };
  gdjs.sk.Armature.prototype = Object.create(gdjs.sk.Transform.prototype);
  gdjs.sk.Armature.prototype.loadData = function (
    armatureData,
    skeletalData,
    debugPolygons
  ) {
    this.shared = armatureData;
    if (debugPolygons) {
      this.debugRenderer = new gdjs.sk.DebugRenderer();
      this.debugRenderer.loadVertices(this.shared.aabb, [100, 100, 255], false);
    }

    // Get all the bones
    for (let i = 0; i < this.shared.bones.length; i++) {
      const bone = new gdjs.sk.Bone(this);
      bone.loadData(this.shared.bones[i]);
      this.bones.push(bone);
      this.bonesMap[bone.shared.name] = bone;
    }

    // With all the bones loaded, set parents
    for (let i = 0; i < this.shared.bones.length; i++) {
      if (this.shared.bones[i].parent !== -1) {
        // Child bone
        this.bones[this.shared.bones[i].parent].addChild(this.bones[i]);
      } else {
        // Root bone
        this.addChild(this.bones[i]);
      }
    }

    // Get all the slots
    for (let i = 0; i < this.shared.slots.length; i++) {
      const slot = new gdjs.sk.Slot(this);
      this.bones[this.shared.slots[i].parent].addChild(slot);
      slot.loadData(
        this.shared.slots[i],
        skeletalData,
        skeletalData.loader.textures,
        debugPolygons
      );
      this.slots.push(slot);
      this.slotsMap[slot.shared.name] = slot;
    }

    // Get all the animations
    for (let i = 0; i < this.shared.animations.length; i++) {
      const animation = new gdjs.sk.Animation(this);
      animation.loadData(this.shared.animations[i]);
      this.animations.push(animation);
      this.animationsMap[animation.shared.name] = animation;
    }
    this.setRenderers();
  };
  gdjs.sk.Armature.prototype.setAsRoot = function () {
    this.isRoot = true;

    // Create an empty shared data, in case nothing is loaded
    this.shared = new gdjs.sk.SharedArmature();
    this.shared.aabb = [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ];
  };
  gdjs.sk.Armature.prototype.getRenderer = function () {
    return this.renderer;
  };
  gdjs.sk.Armature.prototype.getRendererObject = function () {
    return this.renderer.getRendererObject();
  };
  gdjs.sk.Armature.prototype.setRenderers = function () {
    for (let i = 0; i < this.slots.length; i++) {
      if (
        this.slots[i].shared.type === gdjs.sk.SLOT_IMAGE ||
        this.slots[i].shared.type === gdjs.sk.SLOT_MESH
      ) {
        this.renderer.addRenderer(this.slots[i].renderer);
        if (this.slots[i].debugRenderer) {
          this.renderer.addDebugRenderer(this.slots[i].debugRenderer);
        }
      } else {
        if (this.slots[i].shared.type === gdjs.sk.SLOT_ARMATURE) {
          this.renderer.addRenderer(this.slots[i].childArmature.renderer);
          if (this.slots[i].childArmature.debugRenderer) {
            this.renderer.addDebugRenderer(
              this.slots[i].childArmature.debugRenderer
            );
          }
        } else {
          if (this.slots[i].shared.type === gdjs.sk.SLOT_POLYGON) {
            if (this.slots[i].debugRenderer) {
              this.renderer.addDebugRenderer(this.slots[i].debugRenderer);
            }
          }
        }
      }
    }
    if (this.isRoot && this.debugRenderer) {
      this.renderer.addDebugRenderer(this.debugRenderer);
    }
  };
  gdjs.sk.Armature.prototype.getAABB = function () {
    return this.transformPolygon(this.shared.aabb);
  };
  gdjs.sk.Armature.prototype.getDefaultWidth = function () {
    return this.shared.aabb[1][0] - this.shared.aabb[0][0];
  };
  gdjs.sk.Armature.prototype.getDefaultHeight = function () {
    return this.shared.aabb[2][1] - this.shared.aabb[1][1];
  };
  gdjs.sk.Armature.prototype.resetState = function () {
    for (let i = 0; i < this.bones.length; i++) {
      this.bones[i].resetState();
    }
    for (let i = 0; i < this.slots.length; i++) {
      this.slots[i].resetState();
    }
    this.renderer.sortRenderers();
  };
  gdjs.sk.Armature.prototype.updateZOrder = function () {
    this.renderer.sortRenderers();
  };
  gdjs.sk.Armature.prototype.update = function () {
    gdjs.sk.Transform.prototype.update.call(this);
    if (this.debugRenderer) {
      const transform = gdjs.sk.Transform.decomposeMatrix(this.worldMatrix);
      this.debugRenderer.setTransform(transform);
    }
  };
  gdjs.sk.Armature.prototype.getCurrentAnimation = function () {
    if (
      this.currentAnimation >= 0 &&
      this.currentAnimation < this.animations.length
    ) {
      return this.animations[this.currentAnimation];
    }
    return null;
  };
  gdjs.sk.Armature.prototype.updateAnimation = function (delta) {
    const animation = this.getCurrentAnimation();
    if (animation) {
      animation.update(delta);
    }
  };
  gdjs.sk.Armature.prototype.isAnimationFinished = function () {
    const animation = this.getCurrentAnimation();
    return animation ? animation.isFinished() : false;
  };
  gdjs.sk.Armature.prototype.getAnimationTime = function () {
    const animation = this.getCurrentAnimation();
    return animation ? animation.getTime() : 0;
  };
  gdjs.sk.Armature.prototype.setAnimationTime = function (time) {
    const animation = this.getCurrentAnimation();
    if (animation) {
      animation.setTime(time);
    }
  };
  gdjs.sk.Armature.prototype.getAnimationTimeLength = function () {
    const animation = this.getCurrentAnimation();
    return animation ? animation.getTimeLength() : 0;
  };
  gdjs.sk.Armature.prototype.getAnimationFrame = function () {
    const animation = this.getCurrentAnimation();
    return animation ? animation.getFrame() : 0;
  };
  gdjs.sk.Armature.prototype.setAnimationFrame = function (frame) {
    const animation = this.getCurrentAnimation();
    if (animation) {
      animation.setFrame(frame);
    }
  };
  gdjs.sk.Armature.prototype.getAnimationFrameLength = function () {
    const animation = this.getCurrentAnimation();
    return animation ? animation.getFrameLength() : 0;
  };
  gdjs.sk.Armature.prototype.getAnimationIndex = function () {
    return this.currentAnimation;
  };
  gdjs.sk.Armature.prototype.setAnimationIndex = function (
    newAnimation,
    blendTime,
    loops
  ) {
    if (
      newAnimation >= 0 &&
      newAnimation < this.animations.length &&
      newAnimation !== this.currentAnimation
    ) {
      this.resetState();
      const oldAnimation = this.currentAnimation;
      this.currentAnimation = newAnimation;
      this.animations[this.currentAnimation].reset(loops);
      if (
        blendTime > 0 &&
        oldAnimation >= 0 &&
        oldAnimation < this.animations.length
      ) {
        this.animations[this.currentAnimation].blendFrom(
          this.animations[oldAnimation],
          blendTime
        );
      }
      const armatureAnimators = this.animations[this.currentAnimation]
        .armatureAnimators;
      for (let i = 0; i < armatureAnimators.length; i++) {
        armatureAnimators[i].setFirstFrameAnimation(blendTime);
      }
      this.animations[this.currentAnimation].update(0);
    }
  };
  gdjs.sk.Armature.prototype.getAnimationName = function () {
    const animation = this.getCurrentAnimation();
    return animation ? animation.shared.name : '';
  };
  gdjs.sk.Armature.prototype.setAnimationName = function (
    newAnimation,
    blendTime,
    loops
  ) {
    if (newAnimation in this.animationsMap) {
      this.setAnimationIndex(
        this.animations.indexOf(this.animationsMap[newAnimation]),
        blendTime,
        loops
      );
    }
  };
  gdjs.sk.Armature.prototype.resetAnimation = function () {
    const animation = this.getCurrentAnimation();
    if (animation) {
      animation.reset();
    }
  };
}
