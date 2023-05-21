namespace gdjs {
  /** Base parameters for {@link gdjs.Cube3DRuntimeObject} */
  export interface Cube3DObjectData extends Object3DData {
    /** The base parameters of the Cube3D object */
    content: Object3DDataContent & {
      enableTextureTransparency: boolean;
      facesOrientation: 'Y' | 'Z';
      frontFaceResourceName: string;
      backFaceResourceName: string;
      backFaceUpThroughWhichAxisRotation: 'X' | 'Y';
      leftFaceResourceName: string;
      rightFaceResourceName: string;
      topFaceResourceName: string;
      bottomFaceResourceName: string;
      frontFaceResourceRepeat: boolean;
      backFaceResourceRepeat: boolean;
      leftFaceResourceRepeat: boolean;
      rightFaceResourceRepeat: boolean;
      topFaceResourceRepeat: boolean;
      bottomFaceResourceRepeat: boolean;
      frontFaceVisible: boolean;
      backFaceVisible: boolean;
      leftFaceVisible: boolean;
      rightFaceVisible: boolean;
      topFaceVisible: boolean;
      bottomFaceVisible: boolean;
      materialType: 'Basic' | 'StandardWithoutMetalness';
    };
  }

  type FaceName = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
  const faceNameToBitmaskIndex = {
    front: 0,
    back: 1,
    left: 2,
    right: 3,
    top: 4,
    bottom: 5,
  };

  /**
   * Shows a 3D box object.
   */
  export class Cube3DRuntimeObject extends gdjs.RuntimeObject3D {
    private _renderer: Cube3DRuntimeObjectRenderer;
    private _facesOrientation: 'Y' | 'Z';
    private _backFaceUpThroughWhichAxisRotation: 'X' | 'Y';
    private _shouldUseTransparentTexture: boolean;
    // `_rotationZ` is `angle` from `gdjs.RuntimeObject`.
    private _visibleFacesBitmask: integer;
    private _textureRepeatFacesBitmask: integer;
    private _faceResourceNames: [
      string,
      string,
      string,
      string,
      string,
      string
    ];
    _materialType: gdjs.Cube3DRuntimeObject.MaterialType =
      gdjs.Cube3DRuntimeObject.MaterialType.Basic;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: Cube3DObjectData
    ) {
      super(instanceContainer, objectData);
      this._shouldUseTransparentTexture =
        objectData.content.enableTextureTransparency || false;
      this._facesOrientation = objectData.content.facesOrientation || 'Y';
      this._visibleFacesBitmask = 0;
      if (objectData.content.frontFaceVisible)
        this._visibleFacesBitmask |= 1 << faceNameToBitmaskIndex['front'];
      if (objectData.content.backFaceVisible)
        this._visibleFacesBitmask |= 1 << faceNameToBitmaskIndex['back'];
      if (objectData.content.leftFaceVisible)
        this._visibleFacesBitmask |= 1 << faceNameToBitmaskIndex['left'];
      if (objectData.content.rightFaceVisible)
        this._visibleFacesBitmask |= 1 << faceNameToBitmaskIndex['right'];
      if (objectData.content.topFaceVisible)
        this._visibleFacesBitmask |= 1 << faceNameToBitmaskIndex['top'];
      if (objectData.content.bottomFaceVisible)
        this._visibleFacesBitmask |= 1 << faceNameToBitmaskIndex['bottom'];
      this._textureRepeatFacesBitmask = 0;
      if (objectData.content.frontFaceResourceRepeat)
        this._textureRepeatFacesBitmask |= 1 << faceNameToBitmaskIndex['front'];
      if (objectData.content.backFaceResourceRepeat)
        this._textureRepeatFacesBitmask |= 1 << faceNameToBitmaskIndex['back'];
      if (objectData.content.leftFaceResourceRepeat)
        this._textureRepeatFacesBitmask |= 1 << faceNameToBitmaskIndex['left'];
      if (objectData.content.rightFaceResourceRepeat)
        this._textureRepeatFacesBitmask |= 1 << faceNameToBitmaskIndex['right'];
      if (objectData.content.topFaceResourceRepeat)
        this._textureRepeatFacesBitmask |= 1 << faceNameToBitmaskIndex['top'];
      if (objectData.content.bottomFaceResourceRepeat)
        this._textureRepeatFacesBitmask |=
          1 << faceNameToBitmaskIndex['bottom'];
      this._backFaceUpThroughWhichAxisRotation =
        objectData.content.backFaceUpThroughWhichAxisRotation || 'X';
      this._faceResourceNames = [
        objectData.content.frontFaceResourceName,
        objectData.content.backFaceResourceName,
        objectData.content.leftFaceResourceName,
        objectData.content.rightFaceResourceName,
        objectData.content.topFaceResourceName,
        objectData.content.bottomFaceResourceName,
      ];
      this._materialType = this._convertMaterialType(
        objectData.content.materialType
      );

      this._renderer = new gdjs.Cube3DRuntimeObjectRenderer(
        this,
        instanceContainer
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    /**
     * Sets the visibility of a face of the 3D box.
     *
     * @param faceName - The name of the face to set visibility for.
     * @param value - The visibility value to set.
     */
    setFaceVisibility(faceName: FaceName, enable: boolean) {
      const faceIndex = faceNameToBitmaskIndex[faceName];
      if (faceIndex === undefined) {
        return;
      }
      if (enable === this.isFaceAtIndexVisible(faceIndex)) {
        return;
      }

      if (enable) {
        this._visibleFacesBitmask |= 1 << faceIndex;
      } else {
        this._visibleFacesBitmask &= ~(1 << faceIndex);
      }
      this._renderer.updateFace(faceIndex);
    }

    /**
     * Sets the texture repeat of a face of the 3D box.
     *
     * @param faceName - The name of the face to set visibility for.
     * @param value - The visibility value to set.
     */
    setRepeatTextureOnFace(faceName: FaceName, enable: boolean) {
      const faceIndex = faceNameToBitmaskIndex[faceName];
      if (faceIndex === undefined) {
        return;
      }
      if (enable === this.shouldRepeatTextureOnFaceAtIndex(faceIndex)) {
        return;
      }

      if (enable) {
        this._textureRepeatFacesBitmask |= 1 << faceIndex;
      } else {
        this._textureRepeatFacesBitmask &= ~(1 << faceIndex);
      }
      this._renderer.updateFace(faceIndex);
    }

    isFaceVisible(faceName: FaceName): boolean {
      const faceIndex = faceNameToBitmaskIndex[faceName];
      if (faceIndex === undefined) {
        return false;
      }

      return this.isFaceAtIndexVisible(faceIndex);
    }

    /** @internal */
    isFaceAtIndexVisible(faceIndex): boolean {
      return (this._visibleFacesBitmask & (1 << faceIndex)) !== 0;
    }

    /** @internal */
    shouldRepeatTextureOnFaceAtIndex(faceIndex): boolean {
      return (this._textureRepeatFacesBitmask & (1 << faceIndex)) !== 0;
    }

    setFaceResourceName(faceName: FaceName, resourceName: string): void {
      const faceIndex = faceNameToBitmaskIndex[faceName];
      if (faceIndex === undefined) {
        return;
      }
      if (this._faceResourceNames[faceIndex] === resourceName) {
        return;
      }

      this._faceResourceNames[faceIndex] = resourceName;
      this._renderer.updateFace(faceIndex);
    }

    /** @internal */
    getFaceAtIndexResourceName(faceIndex: integer): string {
      return this._faceResourceNames[faceIndex];
    }

    getRenderer(): gdjs.RuntimeObject3DRenderer {
      return this._renderer;
    }

    getBackFaceUpThroughWhichAxisRotation(): 'X' | 'Y' {
      return this._backFaceUpThroughWhichAxisRotation;
    }

    setBackFaceUpThroughWhichAxisRotation(axis: 'X' | 'Y'): void {
      this._backFaceUpThroughWhichAxisRotation = axis;
      this._renderer.updateFace(faceNameToBitmaskIndex['back']);
    }

    getFacesOrientation(): 'Y' | 'Z' {
      return this._facesOrientation;
    }

    setFacesOrientation(orientation: 'Y' | 'Z'): void {
      this._facesOrientation = orientation;
      this._renderer.updateFace(faceNameToBitmaskIndex['left']);
      this._renderer.updateFace(faceNameToBitmaskIndex['right']);
      this._renderer.updateFace(faceNameToBitmaskIndex['top']);
      // Bottom texture should not change based on that setting.
    }

    updateFromObjectData(
      oldObjectData: Cube3DObjectData,
      newObjectData: Cube3DObjectData
    ): boolean {
      super.updateFromObjectData(oldObjectData, newObjectData);
      if (
        oldObjectData.content.frontFaceVisible !==
        newObjectData.content.frontFaceVisible
      ) {
        this.setFaceVisibility('front', newObjectData.content.frontFaceVisible);
      }
      if (
        oldObjectData.content.backFaceVisible !==
        newObjectData.content.backFaceVisible
      ) {
        this.setFaceVisibility('back', newObjectData.content.backFaceVisible);
      }
      if (
        oldObjectData.content.leftFaceVisible !==
        newObjectData.content.leftFaceVisible
      ) {
        this.setFaceVisibility('left', newObjectData.content.leftFaceVisible);
      }
      if (
        oldObjectData.content.rightFaceVisible !==
        newObjectData.content.rightFaceVisible
      ) {
        this.setFaceVisibility('right', newObjectData.content.rightFaceVisible);
      }
      if (
        oldObjectData.content.topFaceVisible !==
        newObjectData.content.topFaceVisible
      ) {
        this.setFaceVisibility('top', newObjectData.content.topFaceVisible);
      }
      if (
        oldObjectData.content.bottomFaceVisible !==
        newObjectData.content.bottomFaceVisible
      ) {
        this.setFaceVisibility(
          'bottom',
          newObjectData.content.bottomFaceVisible
        );
      }
      if (
        oldObjectData.content.frontFaceResourceName !==
        newObjectData.content.frontFaceResourceName
      ) {
        this.setFaceResourceName(
          'front',
          newObjectData.content.frontFaceResourceName
        );
      }
      if (
        oldObjectData.content.backFaceResourceName !==
        newObjectData.content.backFaceResourceName
      ) {
        this.setFaceResourceName(
          'back',
          newObjectData.content.backFaceResourceName
        );
      }
      if (
        oldObjectData.content.leftFaceResourceName !==
        newObjectData.content.leftFaceResourceName
      ) {
        this.setFaceResourceName(
          'left',
          newObjectData.content.leftFaceResourceName
        );
      }
      if (
        oldObjectData.content.rightFaceResourceName !==
        newObjectData.content.rightFaceResourceName
      ) {
        this.setFaceResourceName(
          'right',
          newObjectData.content.rightFaceResourceName
        );
      }
      if (
        oldObjectData.content.topFaceResourceName !==
        newObjectData.content.topFaceResourceName
      ) {
        this.setFaceResourceName(
          'top',
          newObjectData.content.topFaceResourceName
        );
      }
      if (
        oldObjectData.content.bottomFaceResourceName !==
        newObjectData.content.bottomFaceResourceName
      ) {
        this.setFaceResourceName(
          'bottom',
          newObjectData.content.bottomFaceResourceName
        );
      }
      if (
        oldObjectData.content.frontFaceResourceRepeat !==
        newObjectData.content.frontFaceResourceRepeat
      ) {
        this.setRepeatTextureOnFace(
          'front',
          newObjectData.content.frontFaceResourceRepeat
        );
      }
      if (
        oldObjectData.content.backFaceResourceRepeat !==
        newObjectData.content.backFaceResourceRepeat
      ) {
        this.setRepeatTextureOnFace(
          'back',
          newObjectData.content.backFaceResourceRepeat
        );
      }
      if (
        oldObjectData.content.leftFaceResourceRepeat !==
        newObjectData.content.leftFaceResourceRepeat
      ) {
        this.setRepeatTextureOnFace(
          'left',
          newObjectData.content.leftFaceResourceRepeat
        );
      }
      if (
        oldObjectData.content.rightFaceResourceRepeat !==
        newObjectData.content.rightFaceResourceRepeat
      ) {
        this.setRepeatTextureOnFace(
          'right',
          newObjectData.content.rightFaceResourceRepeat
        );
      }
      if (
        oldObjectData.content.topFaceResourceRepeat !==
        newObjectData.content.topFaceResourceRepeat
      ) {
        this.setRepeatTextureOnFace(
          'top',
          newObjectData.content.topFaceResourceRepeat
        );
      }
      if (
        oldObjectData.content.bottomFaceResourceRepeat !==
        newObjectData.content.bottomFaceResourceRepeat
      ) {
        this.setRepeatTextureOnFace(
          'bottom',
          newObjectData.content.bottomFaceResourceRepeat
        );
      }
      if (
        oldObjectData.content.backFaceUpThroughWhichAxisRotation !==
        newObjectData.content.backFaceUpThroughWhichAxisRotation
      ) {
        this.setBackFaceUpThroughWhichAxisRotation(
          newObjectData.content.backFaceUpThroughWhichAxisRotation
        );
      }
      if (
        oldObjectData.content.facesOrientation !==
        newObjectData.content.facesOrientation
      ) {
        this.setFacesOrientation(newObjectData.content.facesOrientation);
      }
      if (
        oldObjectData.content.materialType !==
        newObjectData.content.materialType
      ) {
        this.setMaterialType(newObjectData.content.materialType);
      }

      return true;
    }

    /**
     * Return true if the texture transparency should be enabled.
     */
    shouldUseTransparentTexture(): boolean {
      return this._shouldUseTransparentTexture;
    }

    _convertMaterialType(
      materialTypeString: string
    ): gdjs.Cube3DRuntimeObject.MaterialType {
      if (materialTypeString === 'StandardWithoutMetalness') {
        return gdjs.Cube3DRuntimeObject.MaterialType.StandardWithoutMetalness;
      } else {
        return gdjs.Cube3DRuntimeObject.MaterialType.Basic;
      }
    }

    setMaterialType(materialTypeString: string) {
      const newMaterialType = this._convertMaterialType(materialTypeString);
      if (this._materialType === newMaterialType) {
        return;
      }

      this._materialType = newMaterialType;
      this._renderer._updateMaterials();
    }
  }

  export namespace Cube3DRuntimeObject {
    export enum MaterialType {
      Basic,
      StandardWithoutMetalness,
    }
  }
  gdjs.registerObject('Scene3D::Cube3DObject', gdjs.Cube3DRuntimeObject);
}
