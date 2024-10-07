namespace gdjs {
  type Model3DAnimation = { name: string; source: string; loop: boolean };

  type Model3DObjectNetworkSyncDataType = {
    mt: number;
    op: FloatPoint3D | null;
    cp: FloatPoint3D | null;
    anis: Model3DAnimation[];
    ai: integer;
    ass: float;
    ap: boolean;
  };

  type Model3DObjectNetworkSyncData = Object3DNetworkSyncData &
    Model3DObjectNetworkSyncDataType;

  /** Base parameters for {@link gdjs.Cube3DRuntimeObject} */
  export interface Model3DObjectData extends Object3DData {
    /** The base parameters of the Model3D object */
    content: Object3DDataContent & {
      modelResourceName: string;
      rotationX: number;
      rotationY: number;
      rotationZ: number;
      keepAspectRatio: boolean;
      materialType: 'Basic' | 'StandardWithoutMetalness' | 'KeepOriginal';
      originLocation:
        | 'ModelOrigin'
        | 'ObjectCenter'
        | 'BottomCenterZ'
        | 'BottomCenterY'
        | 'TopLeft';
      centerLocation:
        | 'ModelOrigin'
        | 'ObjectCenter'
        | 'BottomCenterZ'
        | 'BottomCenterY';
      animations: Model3DAnimation[];
    };
  }

  type FloatPoint3D = [float, float, float];

  const getPointForLocation = (location: string): FloatPoint3D | null => {
    switch (location) {
      case 'ModelOrigin':
        return null;
      case 'ObjectCenter':
        return [0.5, 0.5, 0.5];
      case 'BottomCenterZ':
        return [0.5, 0.5, 0];
      case 'BottomCenterY':
        return [0.5, 1, 0.5];
      case 'TopLeft':
        return [0, 0, 0];
      default:
        return null;
    }
  };

  /**
   * A 3D object which displays a 3D model.
   */
  export class Model3DRuntimeObject
    extends gdjs.RuntimeObject3D
    implements gdjs.Animatable {
    _renderer: gdjs.Model3DRuntimeObjectRenderer;

    _modelResourceName: string;
    _materialType: gdjs.Model3DRuntimeObject.MaterialType =
      gdjs.Model3DRuntimeObject.MaterialType.Basic;

    /**
     * The local point of the model that will be at the object position.
     *
     * Coordinates are between 0 and 1.
     *
     * Its value is `null` when the point is configured to `"ModelOrigin"`
     * because the model origin needs to be evaluated according to the object
     * configuration.
     * @see gdjs.Model3DRuntimeObject3DRenderer.getOriginPoint
     */
    _originPoint: FloatPoint3D | null;
    /**
     * The local point of the model that is used as rotation center.
     *
     * Coordinates are between 0 and 1.
     *
     * Its value is `null` when the point is configured to `"ModelOrigin"`
     * because the model origin needs to be evaluated according to the object
     * configuration.
     * @see gdjs.Model3DRuntimeObject3DRenderer.getCenterPoint
     */
    _centerPoint: FloatPoint3D | null;

    _animations: Model3DAnimation[];
    _currentAnimationIndex: integer = 0;
    _animationSpeedScale: float = 1;
    _animationPaused: boolean = false;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: Model3DObjectData
    ) {
      super(instanceContainer, objectData);
      this._modelResourceName = objectData.content.modelResourceName;
      this._animations = objectData.content.animations;
      this._originPoint = getPointForLocation(
        objectData.content.originLocation
      );
      this._centerPoint = getPointForLocation(
        objectData.content.centerLocation
      );
      this._renderer = new gdjs.Model3DRuntimeObjectRenderer(
        this,
        instanceContainer
      );
      this._materialType = this._convertMaterialType(
        objectData.content.materialType
      );

      this.onModelChanged(objectData);

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    /**
     * To be called after the renderer loaded a Model resource:
     * - After the renderer was instantiated
     * - After reloading the model
     */
    private onModelChanged(objectData) {
      this._updateModel(objectData);
      if (this._animations.length > 0) {
        this._renderer.playAnimation(
          this._animations[0].source,
          this._animations[0].loop
        );
      }
    }

    updateFromObjectData(
      oldObjectData: Model3DObjectData,
      newObjectData: Model3DObjectData
    ): boolean {
      super.updateFromObjectData(oldObjectData, newObjectData);

      if (
        oldObjectData.content.materialType !==
        newObjectData.content.materialType
      ) {
        this._materialType = this._convertMaterialType(
          newObjectData.content.materialType
        );
      }
      if (
        oldObjectData.content.modelResourceName !==
        newObjectData.content.modelResourceName
      ) {
        this._reloadModel(newObjectData);
      } else if (
        oldObjectData.content.width !== newObjectData.content.width ||
        oldObjectData.content.height !== newObjectData.content.height ||
        oldObjectData.content.depth !== newObjectData.content.depth ||
        oldObjectData.content.rotationX !== newObjectData.content.rotationX ||
        oldObjectData.content.rotationY !== newObjectData.content.rotationY ||
        oldObjectData.content.rotationZ !== newObjectData.content.rotationZ ||
        oldObjectData.content.keepAspectRatio !==
          newObjectData.content.keepAspectRatio ||
        oldObjectData.content.materialType !==
          newObjectData.content.materialType
      ) {
        this._updateModel(newObjectData);
      }
      if (
        oldObjectData.content.originLocation !==
        newObjectData.content.originLocation
      ) {
        this._originPoint = getPointForLocation(
          newObjectData.content.originLocation
        );
      }
      if (
        oldObjectData.content.centerLocation !==
        newObjectData.content.centerLocation
      ) {
        this._centerPoint = getPointForLocation(
          newObjectData.content.centerLocation
        );
      }
      return true;
    }

    getNetworkSyncData(): Model3DObjectNetworkSyncData {
      return {
        ...super.getNetworkSyncData(),
        mt: this._materialType,
        op: this._originPoint,
        cp: this._centerPoint,
        anis: this._animations,
        ai: this._currentAnimationIndex,
        ass: this._animationSpeedScale,
        ap: this._animationPaused,
      };
    }

    updateFromNetworkSyncData(
      networkSyncData: Model3DObjectNetworkSyncData
    ): void {
      super.updateFromNetworkSyncData(networkSyncData);

      if (networkSyncData.mt !== undefined) {
        this._materialType = networkSyncData.mt;
      }
      if (networkSyncData.op !== undefined) {
        this._originPoint = networkSyncData.op;
      }
      if (networkSyncData.cp !== undefined) {
        this._centerPoint = networkSyncData.cp;
      }
      if (networkSyncData.anis !== undefined) {
        this._animations = networkSyncData.anis;
      }
      if (networkSyncData.ai !== undefined) {
        this.setAnimationIndex(networkSyncData.ai);
      }
      if (networkSyncData.ass !== undefined) {
        this.setAnimationSpeedScale(networkSyncData.ass);
      }
      if (networkSyncData.ap !== undefined) {
        if (networkSyncData.ap !== this.isAnimationPaused()) {
          networkSyncData.ap ? this.pauseAnimation() : this.resumeAnimation();
        }
      }
    }

    _reloadModel(objectData: Model3DObjectData) {
      this._modelResourceName = objectData.content.modelResourceName;
      this._renderer._reloadModel(this, this._runtimeScene);
      this.onModelChanged(objectData);
    }

    _updateModel(objectData: Model3DObjectData) {
      const rotationX = objectData.content.rotationX || 0;
      const rotationY = objectData.content.rotationY || 0;
      const rotationZ = objectData.content.rotationZ || 0;
      const keepAspectRatio = objectData.content.keepAspectRatio;
      this._renderer._updateModel(
        rotationX,
        rotationY,
        rotationZ,
        this._getOriginalWidth(),
        this._getOriginalHeight(),
        this._getOriginalDepth(),
        keepAspectRatio
      );
    }

    getRenderer(): RuntimeObject3DRenderer {
      return this._renderer;
    }

    _convertMaterialType(
      materialTypeString: string
    ): gdjs.Model3DRuntimeObject.MaterialType {
      if (materialTypeString === 'KeepOriginal') {
        return gdjs.Model3DRuntimeObject.MaterialType.KeepOriginal;
      } else if (materialTypeString === 'StandardWithoutMetalness') {
        return gdjs.Model3DRuntimeObject.MaterialType.StandardWithoutMetalness;
      } else {
        return gdjs.Model3DRuntimeObject.MaterialType.Basic;
      }
    }

    update(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      const elapsedTime = this.getElapsedTime() / 1000;
      this._renderer.updateAnimation(elapsedTime * this._animationSpeedScale);
    }

    /**
     * Get the index of the animation being played.
     * @return The index of the new animation being played
     */
    getAnimationIndex(): number {
      return this._currentAnimationIndex;
    }

    /**
     * Change the animation being played.
     * @param animationIndex The index of the new animation to be played
     */
    setAnimationIndex(animationIndex: number): void {
      animationIndex = animationIndex | 0;
      if (
        animationIndex < this._animations.length &&
        this._currentAnimationIndex !== animationIndex &&
        animationIndex >= 0
      ) {
        const animation = this._animations[animationIndex];
        this._currentAnimationIndex = animationIndex;
        this._renderer.playAnimation(animation.source, animation.loop);
        if (this._animationPaused) {
          this._renderer.pauseAnimation();
        }
      }
    }

    /**
     * Get the name of the animation being played.
     * @return The name of the new animation being played
     */
    getAnimationName(): string {
      if (this._currentAnimationIndex >= this._animations.length) {
        return '';
      }
      return this._animations[this._currentAnimationIndex].name;
    }

    /**
     * Change the animation being played.
     * @param newAnimationName The name of the new animation to be played
     */
    setAnimationName(newAnimationName: string): void {
      if (!newAnimationName) {
        return;
      }
      const animationIndex = this._animations.findIndex(
        (animation) => animation.name === newAnimationName
      );
      if (animationIndex >= 0) {
        this.setAnimationIndex(animationIndex);
      }
    }

    isCurrentAnimationName(name: string): boolean {
      return this.getAnimationName() === name;
    }

    /**
     * Return true if animation has ended.
     * The animation had ended if:
     * - it's not configured as a loop;
     * - the current frame is the last frame;
     * - the last frame has been displayed long enough.
     */
    hasAnimationEnded(): boolean {
      return this._renderer.hasAnimationEnded();
    }

    isAnimationPaused() {
      return this._animationPaused;
    }

    pauseAnimation() {
      this._animationPaused = true;
      this._renderer.pauseAnimation();
    }

    resumeAnimation() {
      this._animationPaused = false;
      this._renderer.resumeAnimation();
    }

    getAnimationSpeedScale() {
      return this._animationSpeedScale;
    }

    setAnimationSpeedScale(ratio: float): void {
      this._animationSpeedScale = ratio;
    }

    getAnimationElapsedTime(): float {
      return this._renderer.getAnimationElapsedTime();
    }

    setAnimationElapsedTime(time: float): void {
      this._renderer.setAnimationElapsedTime(time);
      if (!this._animationPaused) {
        this._renderer.resumeAnimation();
      }
    }

    getAnimationDuration(): float {
      return this._renderer.getAnimationDuration(
        this._animations[this._currentAnimationIndex].source
      );
    }

    getCenterX(): float {
      const centerPoint = this._renderer.getCenterPoint();
      return this.getWidth() * centerPoint[0];
    }

    getCenterY(): float {
      const centerPoint = this._renderer.getCenterPoint();
      return this.getHeight() * centerPoint[1];
    }

    getCenterZ(): float {
      const centerPoint = this._renderer.getCenterPoint();
      return this.getDepth() * centerPoint[2];
    }

    getDrawableX(): float {
      const originPoint = this._renderer.getOriginPoint();
      return this.getX() - this.getWidth() * originPoint[0];
    }

    getDrawableY(): float {
      const originPoint = this._renderer.getOriginPoint();
      return this.getY() - this.getHeight() * originPoint[1];
    }

    getDrawableZ(): float {
      const originPoint = this._renderer.getOriginPoint();
      return this.getZ() - this.getDepth() * originPoint[2];
    }
  }

  export namespace Model3DRuntimeObject {
    export enum MaterialType {
      Basic,
      StandardWithoutMetalness,
      KeepOriginal,
    }
  }
  gdjs.registerObject('Scene3D::Model3DObject', gdjs.Model3DRuntimeObject);
}
