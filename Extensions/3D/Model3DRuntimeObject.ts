namespace gdjs {
  type Model3DAnimation = { name: string; source: string };

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
      animations: Model3DAnimation[];
    };
  }

  /**
   * A 3D object which displays a 3D model.
   */
  export class Model3DRuntimeObject extends gdjs.RuntimeObject3D {
    _renderer: gdjs.Model3DRuntimeObjectRenderer;

    _modelResourceName: string;
    _materialType: gdjs.Model3DRuntimeObject.MaterialType =
      gdjs.Model3DRuntimeObject.MaterialType.Basic;

    _currentAnimationIndex: integer = 0;
    _animationSpeedScale: float = 1;
    _animationPaused: boolean = false;

    _animations: Model3DAnimation[];

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: Model3DObjectData
    ) {
      super(instanceContainer, objectData);
      this._modelResourceName = objectData.content.modelResourceName;
      this._animations = objectData.content.animations;
      this._renderer = new gdjs.Model3DRuntimeObjectRenderer(
        this,
        instanceContainer
      );
      this._updateMaterialType(objectData);
      this._renderer.playAnimation(this._animations[0].source);

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    updateFromObjectData(
      oldObjectData: Model3DObjectData,
      newObjectData: Model3DObjectData
    ): boolean {
      super.updateFromObjectData(oldObjectData, newObjectData);
      if (
        oldObjectData.content.width !== newObjectData.content.width ||
        oldObjectData.content.height !== newObjectData.content.height ||
        oldObjectData.content.depth !== newObjectData.content.depth ||
        oldObjectData.content.rotationX !== newObjectData.content.rotationX ||
        oldObjectData.content.rotationY !== newObjectData.content.rotationY ||
        oldObjectData.content.rotationZ !== newObjectData.content.rotationZ ||
        oldObjectData.content.keepAspectRatio !==
          newObjectData.content.keepAspectRatio
      ) {
        this._updateDefaultTransformation(newObjectData);
      }
      if (
        oldObjectData.content.materialType !==
        newObjectData.content.materialType
      ) {
        this._updateMaterialType(newObjectData);
      }
      return true;
    }

    _updateDefaultTransformation(objectData: Model3DObjectData) {
      const rotationX = objectData.content.rotationX || 0;
      const rotationY = objectData.content.rotationY || 0;
      const rotationZ = objectData.content.rotationZ || 0;
      const keepAspectRatio = objectData.content.keepAspectRatio;
      this._renderer._updateDefaultTransformation(
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

    _updateMaterialType(objectData: Model3DObjectData) {
      this._materialType = this._convertMaterialType(
        objectData.content.materialType
      );
      this._renderer._updateMaterials();
      this._updateDefaultTransformation(objectData);
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
        this._renderer.playAnimation(animation.source);
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
      return this._renderer.pauseAnimation();
    }

    resumeAnimation() {
      this._animationPaused = false;
      return this._renderer.resumeAnimation();
    }

    getAnimationSpeedScale() {
      return this._animationSpeedScale;
    }

    setAnimationSpeedScale(ratio: float): void {
      this._animationSpeedScale = ratio;
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
