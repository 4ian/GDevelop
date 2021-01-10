namespace gdjs {
  /**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

  /**
   * The SkeletonRuntimeObject imports and displays skeletal animations files.
   */
  export class SkeletonRuntimeObject extends gdjs.RuntimeObject {
    rootArmature: any;
    animationPlaying: boolean = true;
    animationSmooth: boolean = true;
    timeScale: float = 1.0;
    scaleX: number = 1.0;
    scaleY: number = 1.0;
    hitboxSlot: any = null;
    manager: any;
    x: any;
    y: any;
    angle: float;

    constructor(runtimeScene, objectData) {
      super(runtimeScene, objectData);
      this.rootArmature = new gdjs.sk.Armature(this);
      this.rootArmature.getRenderer().putInScene(this, runtimeScene);
      this.rootArmature.setAsRoot();
      this.manager = gdjs.SkeletonObjectsManager.getManager(runtimeScene);
      this.getSkeletonData(runtimeScene, objectData);

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
    }

    getSkeletonData(runtimeScene, objectData) {
      const skeletonData = this.manager.getSkeleton(
        runtimeScene,
        this.name,
        objectData
      );
      if (skeletonData.armatures.length > 0) {
        this.rootArmature.loadData(
          skeletonData.armatures[skeletonData.rootArmature],
          skeletonData,
          objectData.debugPolygons
        );
        this.rootArmature.resetState();
      }
    }

    // RuntimeObject overwrites
    setX(x): void {
      this.x = x;
      this.rootArmature.setX(x);
    }

    setY(y): void {
      this.y = y;
      this.rootArmature.setY(y);
    }

    setAngle(angle): void {
      this.angle = angle;
      this.rootArmature.setRot(angle);
    }

    getRendererObject() {
      return this.rootArmature.getRendererObject();
    }

    getHitBoxes() {
      if (this.hitboxSlot) {
        return this.hitboxSlot.getPolygons();
      }
      return [this.rootArmature.getAABB()];
    }

    stepBehaviorsPreEvents(runtimeScene) {
      const delta = this.getElapsedTime(runtimeScene) / 1000.0;
      if (this.animationPlaying) {
        this.rootArmature.updateAnimation(delta * this.timeScale);
      }
      super.stepBehaviorsPreEvents(runtimeScene);
    }

    update(runtimeScene): void {
      this.rootArmature.update();
    }

    getDrawableX(): float {
      return (
        this.getX() -
        this.rootArmature.shared.aabb[0][0] * Math.abs(this.scaleX)
      );
    }

    getDrawableY(): float {
      return (
        this.getY() -
        this.rootArmature.shared.aabb[0][1] * Math.abs(this.scaleY)
      );
    }

    // Object instructions
    getScaleX(): float {
      return this.scaleX;
    }

    setScaleX(scaleX): void {
      this.scaleX = scaleX;
      this.rootArmature.setSx(scaleX);
    }

    getScaleY(): float {
      return this.scaleY;
    }

    setScaleY(scaleY): void {
      this.scaleY = scaleY;
      this.rootArmature.setSy(scaleY);
    }

    getWidth(): float {
      return this.rootArmature.getDefaultWidth() * Math.abs(this.scaleX);
    }

    setWidth(width): void {
      if (width < 0) {
        width = 0;
      }
      this.setScaleX(width / this.rootArmature.getDefaultWidth());
    }

    getHeight(): float {
      return this.rootArmature.getDefaultHeight() * Math.abs(this.scaleY);
    }

    setHeight(height): void {
      if (height < 0) {
        height = 0;
      }
      this.setScaleY(height / this.rootArmature.getDefaultHeight());
    }

    setDefaultHitbox(slotPath): void {
      if (slotPath === '') {
        this.hitboxSlot = null;
        return;
      }
      const slot = this.getSlot(slotPath);
      if (slot) {
        this.hitboxSlot = slot;
      }
    }

    // Animation instructions
    isAnimationPaused(): boolean {
      return !this.animationPlaying;
    }

    setAnimationPaused(paused): void {
      this.animationPlaying = !paused;
    }

    isAnimationFinished(): boolean {
      return this.rootArmature.isAnimationFinished();
    }

    getAnimationTime(): float {
      return this.rootArmature.getAnimationTime();
    }

    setAnimationTime(time): void {
      this.rootArmature.setAnimationTime(time);
    }

    getAnimationTimeLength() {
      return this.rootArmature.getAnimationTimeLength();
    }

    getAnimationFrame() {
      return this.rootArmature.getAnimationFrame();
    }

    setAnimationFrame(frame): void {
      this.rootArmature.setAnimationFrame(frame);
    }

    getAnimationFrameLength() {
      return this.rootArmature.getAnimationFrameLength();
    }

    getAnimationIndex() {
      return this.rootArmature.getAnimationIndex();
    }

    setAnimationIndex(newAnimation, blendTime = 0, loops = -1): void {
      this.rootArmature.setAnimationIndex(newAnimation, blendTime, loops);
    }

    getAnimationName(): string {
      return this.rootArmature.getAnimationName();
    }

    setAnimationName(newAnimation, blendTime = 0, loops = -1): void {
      this.rootArmature.setAnimationName(newAnimation, blendTime, loops);
    }

    isAnimationSmooth(): boolean {
      return this.animationSmooth;
    }

    setAnimationSmooth(smooth): void {
      this.animationSmooth = smooth;
    }

    getAnimationTimeScale(): float {
      return this.timeScale;
    }

    setAnimationTimeScale(timeScale): void {
      if (timeScale < 0) {
        timeScale = 0;
      }

      // Support negative timeScale (backward animation) ?
      this.timeScale = timeScale;
    }

    resetAnimation(): void {
      this.rootArmature.resetAnimation();
    }

    // Bone instructions
    getBoneX(bonePath): float {
      const bone = this.getBone(bonePath);
      return bone ? bone.getGlobalX() : 0;
    }

    setBoneX(bonePath, x): void {
      const bone = this.getBone(bonePath);
      if (bone) {
        bone.setGlobalX(x);
        bone.update();
      }
    }

    getBoneY(bonePath): float {
      const bone = this.getBone(bonePath);
      return bone ? bone.getGlobalY() : 0;
    }

    setBoneY(bonePath, y): void {
      const bone = this.getBone(bonePath);
      if (bone) {
        bone.setGlobalY(y);
        bone.update();
      }
    }

    getBoneAngle(bonePath): float {
      const bone = this.getBone(bonePath);
      return bone ? bone.getGlobalRot() : 0;
    }

    setBoneAngle(bonePath, angle): void {
      const bone = this.getBone(bonePath);
      if (bone) {
        bone.setGlobalRot(angle);
        bone.update();
      }
    }

    getBoneScaleX(bonePath): float {
      const bone = this.getBone(bonePath);
      return bone ? bone.getSx() : 0;
    }

    setBoneScaleX(bonePath, scaleX): void {
      const bone = this.getBone(bonePath);
      if (bone) {
        bone.setSx(scaleX);
        bone.update();
      }
    }

    getBoneScaleY(bonePath): float {
      const bone = this.getBone(bonePath);
      return bone ? bone.getSy() : 0;
    }

    setBoneScaleY(bonePath, scaleY): void {
      const bone = this.getBone(bonePath);
      if (bone) {
        bone.setSy(scaleY);
        bone.update();
      }
    }

    resetBone(bonePath): void {
      const bone = this.getBone(bonePath);
      if (bone) {
        bone.resetState();
      }
    }

    // Slot instructions
    setSlotColor(slotPath, color): void {
      const slot = this.getSlot(slotPath);
      if (slot) {
        const rgb = color.split(';');
        if (rgb.length < 3) {
          return;
        }
        slot.setColor(...rgb);
      }
    }

    isSlotVisible(slotPath): boolean {
      const slot = this.getSlot(slotPath);
      return slot ? slot.getVisible() : false;
    }

    setSlotVisible(slotPath, visible): void {
      const slot = this.getSlot(slotPath);
      if (slot) {
        slot.setVisible(visible);
      }
    }

    getSlotZOrder(slotPath): float {
      const slot = this.getSlot(slotPath);
      return slot ? slot.getZ() : 0;
    }

    setSlotZOrder(slotPath, z): void {
      const slot = this.getSlot(slotPath);
      if (slot) {
        slot.setZ(z);
      }
    }

    isPointInsideSlot(slotPath, x, y): boolean {
      const hitBoxes = this.getPolygons(slotPath);
      if (!hitBoxes) {
        return false;
      }
      for (let i = 0; i < this.hitBoxes.length; ++i) {
        if (gdjs.Polygon.isPointInside(hitBoxes[i], x, y)) {
          return true;
        }
      }
      return false;
    }

    // Extension instructions
    raycastSlot(slotPath, x, y, angle, dist, closest) {
      let result = gdjs.Polygon.raycastTestStatics.result;
      result.collision = false;
      const endX = x + dist * Math.cos((angle * Math.PI) / 180.0);
      const endY = y + dist * Math.sin((angle * Math.PI) / 180.0);
      let testSqDist = closest ? dist * dist : 0;
      const hitBoxes = this.getPolygons(slotPath);
      if (!hitBoxes) {
        return result;
      }
      for (let i = 0; i < hitBoxes.length; i++) {
        const res = gdjs.Polygon.raycastTest(hitBoxes[i], x, y, endX, endY);
        if (res.collision) {
          if (closest && res.closeSqDist < testSqDist) {
            testSqDist = res.closeSqDist;
            result = res;
          } else {
            if (
              !closest &&
              res.farSqDist > testSqDist &&
              res.farSqDist <= dist * dist
            ) {
              testSqDist = res.farSqDist;
              result = res;
            }
          }
        }
      }
      return result;
    }

    // Warning!, assuming gdjs.evtTools.object.twoListsTest calls the predicate
    // respecting the given objects lists paramenters order
    static slotObjectCollisionTest(skl, obj, slotPath) {
      const hitBoxes1 = skl.getPolygons(slotPath);
      if (!hitBoxes1) {
        return false;
      }
      const hitBoxes2 = obj.getHitBoxes();
      for (let k = 0, lenBoxes1 = hitBoxes1.length; k < lenBoxes1; ++k) {
        for (let l = 0, lenBoxes2 = hitBoxes2.length; l < lenBoxes2; ++l) {
          if (
            gdjs.Polygon.collisionTest(hitBoxes1[k], hitBoxes2[l], false)
              .collision
          ) {
            return true;
          }
        }
      }
      return false;
    }

    static slotSlotCollisionTest(skl1, skl2, slotPaths) {
      const hitBoxes1 = skl1.getPolygons(slotPaths[0]);
      const hitBoxes2 = skl2.getPolygons(slotPaths[1]);
      if (!hitBoxes1 || !hitBoxes2) {
        return false;
      }
      for (let k = 0, lenBoxes1 = hitBoxes1.length; k < lenBoxes1; ++k) {
        for (let l = 0, lenBoxes2 = hitBoxes2.length; l < lenBoxes2; ++l) {
          if (
            gdjs.Polygon.collisionTest(hitBoxes1[k], hitBoxes2[l], false)
              .collision
          ) {
            return true;
          }
        }
      }
      return false;
    }

    // Helpers
    getSlot(slotPath) {
      const slotArray = slotPath.split('/');
      let currentSlot = null;
      if (slotArray[0] in this.rootArmature.slotsMap) {
        currentSlot = this.rootArmature.slotsMap[slotArray[0]];
        for (let i = 1; i < slotArray.length; i++) {
          if (
            currentSlot.type === gdjs.sk.SLOT_ARMATURE &&
            slotArray[i] in currentSlot.childArmature.slotsMap
          ) {
            currentSlot = currentSlot.childArmature.slotsMap[slotArray[i]];
          } else {
            return null;
          }
        }
      }
      return currentSlot;
    }

    getBone(bonePath) {
      const slotArray = bonePath.split('/');
      const boneName = slotArray.pop();
      if (slotArray.length === 0 && boneName in this.rootArmature.bonesMap) {
        return this.rootArmature.bonesMap[boneName];
      }
      const slot = this.getSlot(slotArray.join('/'));
      if (
        slot &&
        slot.type === gdjs.sk.SLOT_ARMATURE &&
        boneName in slot.childArmature.bonesMap
      ) {
        return slot.childArmature.bonesMap[boneName];
      }
      return null;
    }

    getPolygons(slotPath) {
      if (slotPath === '') {
        return this.rootArmature.getHitBoxes();
      }
      const slot = this.getSlot(slotPath);
      if (slot) {
        return slot.getPolygons();
      }
      return null;
    }
  }
  gdjs.registerObject('SkeletonObject::Skeleton', gdjs.SkeletonRuntimeObject);
}
