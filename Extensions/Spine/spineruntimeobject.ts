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

  export class SpineRuntimeObject extends gdjs.RuntimeObject {
    private _opacity: float;
    private _scale: number;
    private _timeScale: number;
    private _animations: SpineAnimation[];
    private _currentAnimationIndex = 0;
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
      this._timeScale = objectData.content.timeScale;
      this._opacity = objectData.content.opacity;
      this._scale = objectData.content.scale;
      this.spineResourceName = objectData.content.spineResourceName;
      this._renderer = new gdjs.SpineRuntimeObjectRenderer(
        this,
        instanceContainer
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    getRendererObject(): pixi_spine.Spine | PIXI.Container {
      return this._renderer.getRendererObject();
    }

    updateFromObjectData(
      oldObjectData: SpineObjectData,
      newObjectData: SpineObjectData
    ): boolean {
      super.updateFromObjectData(oldObjectData, newObjectData);

      if (oldObjectData.content.opacity !== newObjectData.content.opacity) {
        this.setOpacity(newObjectData.content.opacity);
      }
      if (oldObjectData.content.scale !== newObjectData.content.scale) {
        this.setScale(newObjectData.content.scale);
      }
      if (oldObjectData.content.timeScale !== newObjectData.content.timeScale) {
        this.setTimeScale(newObjectData.content.timeScale);
      }

      return true;
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

      this.setAnimationIndex(animationIndex, 0);

      if (initialInstanceData.customSize) {
        this.setScale(1);
        this._renderer.setSize(
          initialInstanceData.width,
          initialInstanceData.height
        );
        this.invalidateHitboxes();
      }
    }

    onDestroyed(): void {
      super.onDestroyed();
      this._renderer.onDestroy();
    }

    setTimeScale(timeScale: float): void {
      this._timeScale = timeScale;
      this._renderer.updateTimeScale();
    }

    getTimeScale(): float {
      return this._timeScale;
    }

    setScale(scale: float): void {
      this._scale = scale;
      this._renderer.updateScale();
      this.invalidateHitboxes();
    }

    getScale(): float {
      return this._scale;
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
      this._opacity = gdjs.PixiFiltersTools.clampValue(opacity, 0, 255);
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

    setWidth(width: float): void {
      this._renderer.setWidth(width);
      this.invalidateHitboxes();
    }

    setHeight(height: float): void {
      this._renderer.setHeight(height);
      this.invalidateHitboxes();
    }

    setAnimationIndex(animationIndex: number, mixingDuration: number): void {
      if (!this.isAnimationIndex(animationIndex)) {
        return;
      }

      const previousAnimationName = this.getAnimationSource(
        this._currentAnimationIndex
      );
      const newAnimationName = this.getAnimationSource(animationIndex);

      if (
        previousAnimationName &&
        newAnimationName &&
        newAnimationName !== previousAnimationName
      ) {
        this._renderer.setMixing(
          previousAnimationName,
          newAnimationName,
          mixingDuration
        );
      }

      const animation = this._animations[animationIndex];
      this._currentAnimationIndex = animationIndex;

      this._renderer.setAnimation(animation.source, animation.loop);
    }

    setAnimationName(animationName: string, mixingDuration: number): void {
      this.setAnimationIndex(
        this.getAnimationIndex(animationName),
        mixingDuration
      );
    }

    getCurrentAnimationIndex(): number {
      return this._currentAnimationIndex;
    }

    getAnimationName(): string {
      return this.isAnimationIndex(this._currentAnimationIndex)
        ? this._animations[this._currentAnimationIndex].name
        : '';
    }

    getAnimationSource(index: number): string {
      return this.isAnimationIndex(index) ? this._animations[index].source : '';
    }

    getAnimationIndex(animationName: string): number {
      return this._animations.findIndex(
        (animation) => animation.name === animationName
      );
    }

    isAnimationIndex(animationIndex: number): boolean {
      return (
        Number.isInteger(animationIndex) &&
        animationIndex >= 0 &&
        animationIndex < this._animations.length
      );
    }

    isAnimationComplete(): boolean {
      return this._renderer.isAnimationComplete();
    }

    isCurrentAnimationName(name: string): boolean {
      return this.getAnimationName() === name;
    }

    setIsUpdatable(isUpdatable: boolean): void {
      this._renderer.setIsUpdatable(isUpdatable);
    }

    isUpdatable(): boolean {
      return this._renderer.isUpdatable();
    }
  }

  gdjs.registerObject('SpineObject::SpineObject', gdjs.SpineRuntimeObject);
}
