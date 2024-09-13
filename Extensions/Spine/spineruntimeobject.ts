namespace gdjs {
  type SpineAnimation = { name: string; source: string; loop: boolean };

  export type SpineObjectDataType = {
    content: {
      opacity: float;
      scale: float;
      timeScale: float;
      spineResourceName: string;
      animations: SpineAnimation[];
    };
  };
  export type SpineObjectData = ObjectData & SpineObjectDataType;

  export type SpineNetworkSyncDataType = {
    opa: float;
    wid: float;
    hei: float;
    scaX: float;
    scaY: float;
    flipX: boolean;
    flipY: boolean;
    ani: number;
    anmd: number;
    anp: boolean;
    anss: float;
    anet: number;
  };

  export type SpineNetworkSyncData = ObjectNetworkSyncData &
    SpineNetworkSyncDataType;

  export class SpineRuntimeObject
    extends gdjs.RuntimeObject
    implements
      gdjs.Resizable,
      gdjs.Scalable,
      gdjs.Animatable,
      gdjs.OpacityHandler {
    private _opacity: float = 255;
    private _scaleX: number = 1;
    private _scaleY: number = 1;
    _originalScale: number;
    private _flippedX: boolean = false;
    private _flippedY: boolean = false;
    private _animations: SpineAnimation[];
    private _currentAnimationIndex = -1;
    private _animationSpeedScale: float = 1;
    private _animationPaused: boolean = false;
    private _isPausedFrameDirty = false;
    /** The duration in second for the smooth transition between 2 animations */
    private _animationMixingDuration: number;
    private _renderer: gdjs.SpineRuntimeObjectPixiRenderer;

    readonly spineResourceName: string;

    /**
     * @param instanceContainer The container the object belongs to.
     * @param objectData The object data used to initialize the object
     */
    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: SpineObjectData
    ) {
      super(instanceContainer, objectData);

      this._animations = objectData.content.animations;
      this._originalScale = objectData.content.scale;
      this.spineResourceName = objectData.content.spineResourceName;
      this._animationMixingDuration = 0;
      this._renderer = new gdjs.SpineRuntimeObjectRenderer(
        this,
        instanceContainer
      );
      this.setAnimationIndex(0);
      this._renderer.updateAnimation(0);

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    update(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      if (this._animationPaused) {
        if (this._isPausedFrameDirty) {
          this._renderer.updateAnimation(0);
          this.invalidateHitboxes();
          this._isPausedFrameDirty = false;
        }
        return;
      }
      const elapsedTime = this.getElapsedTime() / 1000;
      this._renderer.updateAnimation(elapsedTime * this._animationSpeedScale);
      this.invalidateHitboxes();
    }

    getRendererObject(): pixi_spine.Spine | PIXI.Container {
      return this._renderer.getRendererObject();
    }

    updateFromObjectData(
      oldObjectData: SpineObjectData,
      newObjectData: SpineObjectData
    ): boolean {
      super.updateFromObjectData(oldObjectData, newObjectData);

      if (oldObjectData.content.scale !== newObjectData.content.scale) {
        this._originalScale = newObjectData.content.scale;
        this._renderer.updateScale();
        this.invalidateHitboxes();
      }

      return true;
    }

    getNetworkSyncData(): SpineNetworkSyncData {
      return {
        ...super.getNetworkSyncData(),
        opa: this._opacity,
        wid: this.getWidth(),
        hei: this.getHeight(),
        scaX: this.getScaleX(),
        scaY: this.getScaleY(),
        flipX: this.isFlippedX(),
        flipY: this.isFlippedY(),
        ani: this.getAnimationIndex(),
        anmd: this.getAnimationMixingDuration(),
        anp: this.isAnimationPaused(),
        anss: this.getAnimationSpeedScale(),
        anet: this.getAnimationElapsedTime(),
      };
    }

    updateFromNetworkSyncData(syncData: SpineNetworkSyncData): void {
      super.updateFromNetworkSyncData(syncData);

      if (syncData.opa !== undefined && syncData.opa !== this._opacity) {
        this.setOpacity(syncData.opa);
      }
      if (syncData.wid !== undefined && syncData.wid !== this.getWidth()) {
        this.setWidth(syncData.wid);
      }
      if (syncData.hei !== undefined && syncData.hei !== this.getHeight()) {
        this.setHeight(syncData.hei);
      }
      if (syncData.scaX !== undefined && syncData.scaX !== this.getScaleX()) {
        this.setScaleX(syncData.scaX);
      }
      if (syncData.scaY !== undefined && syncData.scaY !== this.getScaleY()) {
        this.setScaleY(syncData.scaY);
      }
      if (
        syncData.flipX !== undefined &&
        syncData.flipX !== this.isFlippedX()
      ) {
        this.flipX(syncData.flipX);
      }
      if (
        syncData.flipY !== undefined &&
        syncData.flipY !== this.isFlippedY()
      ) {
        this.flipY(syncData.flipY);
      }
      if (
        syncData.ani !== undefined &&
        syncData.ani !== this.getAnimationIndex()
      ) {
        this.setAnimationIndex(syncData.ani);
      }
      if (
        syncData.anmd !== undefined &&
        syncData.anmd !== this.getAnimationMixingDuration()
      ) {
        this.setAnimationMixingDuration(syncData.anmd);
      }
      if (
        syncData.anp !== undefined &&
        syncData.anp !== this.isAnimationPaused()
      ) {
        syncData.anp ? this.pauseAnimation() : this.resumeAnimation();
      }
      if (
        syncData.anss !== undefined &&
        syncData.anss !== this.getAnimationSpeedScale()
      ) {
        this.setAnimationSpeedScale(syncData.anss);
      }
      if (
        syncData.anet !== undefined &&
        syncData.anet !== this.getAnimationElapsedTime()
      ) {
        this.setAnimationElapsedTime(syncData.anet);
      }
    }

    extraInitializationFromInitialInstance(
      initialInstanceData: InstanceData
    ): void {
      const animationData = initialInstanceData.numberProperties.find(
        (data) => data.name === 'animation'
      );
      const animationIndex = animationData
        ? animationData.value
        : this._currentAnimationIndex;

      this.setAnimationIndexWithMixing(animationIndex, 0);

      if (initialInstanceData.customSize) {
        this.setSize(initialInstanceData.width, initialInstanceData.height);
        this.invalidateHitboxes();
      }
      if (initialInstanceData.opacity !== undefined) {
        this.setOpacity(initialInstanceData.opacity);
      }
      if (initialInstanceData.flippedX) {
        this.flipX(initialInstanceData.flippedX);
      }
      if (initialInstanceData.flippedY) {
        this.flipY(initialInstanceData.flippedY);
      }
    }

    getDrawableX(): number {
      const originOffset = this._renderer.getOriginOffset();

      return this.getX() + originOffset.x;
    }

    getDrawableY(): number {
      const originOffset = this._renderer.getOriginOffset();

      return this.getY() + originOffset.y;
    }

    getCenterX(): float {
      const originOffset = this._renderer.getOriginOffset();
      return -originOffset.x;
    }

    getCenterY(): float {
      const originOffset = this._renderer.getOriginOffset();
      return -originOffset.y;
    }

    onDestroyed(): void {
      super.onDestroyed();
      this._renderer.onDestroy();
    }

    setX(x: float): void {
      super.setX(x);
      this._renderer.updatePosition();
    }

    setY(y: float): void {
      super.setY(y);
      this._renderer.updatePosition();
    }

    setAngle(angle: float): void {
      super.setAngle(angle);
      this._renderer.updateAngle();
    }

    setOpacity(opacity: float): void {
      this._opacity = Math.max(0, Math.min(255, opacity));
      this._renderer.updateOpacity();
    }

    getOpacity(): float {
      return this._opacity;
    }

    getWidth(): float {
      return this._renderer.getWidth();
    }

    getHeight(): float {
      return this._renderer.getHeight();
    }

    setWidth(newWidth: float): void {
      const unscaledWidth = this._renderer.getUnscaledWidth();
      if (unscaledWidth !== 0) {
        this.setScaleX(newWidth / unscaledWidth);
      }
    }

    setHeight(newHeight: float): void {
      const unscaledHeight = this._renderer.getUnscaledHeight();
      if (unscaledHeight !== 0) {
        this.setScaleY(newHeight / unscaledHeight);
      }
    }

    setSize(newWidth: number, newHeight: number): void {
      this.setWidth(newWidth);
      this.setHeight(newHeight);
    }

    setScale(newScale: float): void {
      if (newScale < 0) {
        newScale = 0;
      }
      if (
        newScale === Math.abs(this._scaleX) &&
        newScale === Math.abs(this._scaleY)
      ) {
        return;
      }
      this._scaleX = newScale * (this._flippedX ? -1 : 1);
      this._scaleY = newScale * (this._flippedY ? -1 : 1);
      this._renderer.updateScale();
      this.invalidateHitboxes();
    }

    setScaleX(newScale: float): void {
      if (newScale < 0) {
        newScale = 0;
      }
      if (newScale === Math.abs(this._scaleX)) {
        return;
      }
      this._scaleX = newScale * (this._flippedX ? -1 : 1);
      this._renderer.updateScale();
      this.invalidateHitboxes();
    }

    setScaleY(newScale: float): void {
      if (newScale < 0) {
        newScale = 0;
      }
      if (newScale === Math.abs(this._scaleY)) {
        return;
      }
      this._scaleY = newScale * (this._flippedY ? -1 : 1);
      this._renderer.updateScale();
      this.invalidateHitboxes();
    }

    /**
     * Get the scale of the object (or the geometric mean of the X and Y scale in case they are different).
     *
     * @return the scale of the object (or the geometric mean of the X and Y scale in case they are different).
     */
    getScale(): float {
      const scaleX = Math.abs(this._scaleX);
      const scaleY = Math.abs(this._scaleY);
      return scaleX === scaleY ? scaleX : Math.sqrt(scaleX * scaleY);
    }

    getScaleY(): float {
      return Math.abs(this._scaleY);
    }

    getScaleX(): float {
      return Math.abs(this._scaleX);
    }

    isFlippedX(): boolean {
      return this._flippedX;
    }

    isFlippedY(): boolean {
      return this._flippedY;
    }

    flipX(enable: boolean) {
      if (enable !== this._flippedX) {
        this._scaleX *= -1;
        this._flippedX = enable;
        this.invalidateHitboxes();
        this._renderer.updateScale();
      }
    }

    flipY(enable: boolean) {
      if (enable !== this._flippedY) {
        this._scaleY *= -1;
        this._flippedY = enable;
        this.invalidateHitboxes();
        this._renderer.updateScale();
      }
    }

    setAnimationIndex(animationIndex: number): void {
      this.setAnimationIndexWithMixing(
        animationIndex,
        this._animationMixingDuration
      );
    }

    setAnimationIndexWithMixing(
      animationIndex: number,
      mixingDuration: number
    ): void {
      if (
        this._animations.length === 0 ||
        this._currentAnimationIndex === animationIndex ||
        !this.isAnimationIndex(animationIndex)
      ) {
        return;
      }
      const previousAnimation = this._animations[this._currentAnimationIndex];
      const newAnimation = this._animations[animationIndex];
      this._currentAnimationIndex = animationIndex;

      if (previousAnimation) {
        this._renderer.setMixing(
          previousAnimation.source,
          newAnimation.source,
          mixingDuration
        );
      }
      this._renderer.setAnimation(newAnimation.source, newAnimation.loop);
      this._isPausedFrameDirty = true;
    }

    setAnimationName(animationName: string): void {
      this.setAnimationNameWithMixing(
        animationName,
        this._animationMixingDuration
      );
    }

    setAnimationNameWithMixing(
      animationName: string,
      mixingDuration: number
    ): void {
      this.setAnimationIndexWithMixing(
        this.getAnimationIndexFor(animationName),
        mixingDuration
      );
    }

    getAnimationIndexFor(animationName: string): number {
      return this._animations.findIndex(
        (animation) => animation.name === animationName
      );
    }

    /**
     * Return the duration in second for the smooth transition between 2 animations.
     */
    getAnimationMixingDuration(): number {
      return this._animationMixingDuration;
    }

    /**
     * Change the duration in second for the smooth transition between 2 animations.
     */
    setAnimationMixingDuration(animationMixingDuration: number): void {
      this._animationMixingDuration = animationMixingDuration;
    }

    getAnimationIndex(): number {
      return this._currentAnimationIndex;
    }

    getAnimationName(): string {
      return this.isAnimationIndex(this._currentAnimationIndex)
        ? this._animations[this._currentAnimationIndex].name
        : '';
    }

    isAnimationIndex(animationIndex: number): boolean {
      return (
        Number.isInteger(animationIndex) &&
        animationIndex >= 0 &&
        animationIndex < this._animations.length
      );
    }

    hasAnimationEnded(): boolean {
      return this._renderer.isAnimationComplete();
    }

    isAnimationPaused() {
      return this._animationPaused;
    }

    pauseAnimation() {
      this._animationPaused = true;
    }

    resumeAnimation() {
      this._animationPaused = false;
    }

    getAnimationSpeedScale() {
      return this._animationSpeedScale;
    }

    setAnimationSpeedScale(ratio: float): void {
      this._animationSpeedScale = ratio;
    }

    getAnimationElapsedTime(): number {
      if (this._animations.length === 0) {
        return 0;
      }
      return this._renderer.getAnimationElapsedTime();
    }

    setAnimationElapsedTime(time: number): void {
      if (this._animations.length === 0) {
        return;
      }
      this._renderer.setAnimationElapsedTime(time);
      this._isPausedFrameDirty = true;
    }

    getPointAttachmentX(attachmentName: string, slotName?: string): number {
      return this._renderer.getPointAttachmentPosition(attachmentName, slotName)
        .x;
    }

    getPointAttachmentY(attachmentName: string, slotName?: string): number {
      return this._renderer.getPointAttachmentPosition(attachmentName, slotName)
        .y;
    }

    getAnimationDuration(): number {
      if (this._animations.length === 0) {
        return 0;
      }
      return this._renderer.getAnimationDuration(
        this._animations[this._currentAnimationIndex].source
      );
    }
  }

  gdjs.registerObject('SpineObject::SpineObject', gdjs.SpineRuntimeObject);
}
