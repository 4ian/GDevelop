namespace gdjs {
  /**
   * Base parameters for {@link gdjs.Cube3DRuntimeObject}
   * @category Objects > 3D Box
   */
  export interface Cube3DObjectData extends Object3DData {
    /** The base parameters of the Cube3D object */
    content: Object3DDataContent & {
      enableTextureTransparency: boolean | undefined;
      facesOrientation: 'Y' | 'Z' | undefined;
      frontFaceResourceName: string;
      backFaceResourceName: string;
      backFaceUpThroughWhichAxisRotation: 'X' | 'Y' | undefined;
      leftFaceResourceName: string;
      rightFaceResourceName: string;
      topFaceResourceName: string;
      bottomFaceResourceName: string;
      frontFaceResourceRepeat: boolean | undefined;
      backFaceResourceRepeat: boolean | undefined;
      leftFaceResourceRepeat: boolean | undefined;
      rightFaceResourceRepeat: boolean | undefined;
      topFaceResourceRepeat: boolean | undefined;
      bottomFaceResourceRepeat: boolean | undefined;
      tileScale: number | undefined;
      originLocation:
        | 'TopLeft'
        | 'ObjectCenter'
        | 'CenteredOnZ'
        | 'BottomCenterZ'
        | 'BottomCenterY'
        | undefined;
      centerLocation:
        | 'TopLeft'
        | 'ObjectCenter'
        | 'CenteredOnZ'
        | 'BottomCenterZ'
        | 'BottomCenterY'
        | undefined;
      frontFaceVisible: boolean;
      backFaceVisible: boolean;
      leftFaceVisible: boolean;
      rightFaceVisible: boolean;
      topFaceVisible: boolean;
      bottomFaceVisible: boolean;
      tint: string | undefined;
      isCastingShadow: boolean;
      isReceivingShadow: boolean;
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
   * A point of the cube expressed in coordinates between 0 and 1, relative to
   * the cube dimensions.
   */
  type Cube3DPoint = [float, float, float];

  /**
   * Returns the point of the cube corresponding to a given location name.
   * Coordinates are between 0 and 1, relative to the cube dimensions.
   */
  const getPointForCubeLocation = (
    location: string | undefined
  ): Cube3DPoint => {
    switch (location) {
      case 'ObjectCenter':
        return [0.5, 0.5, 0.5];
      case 'CenteredOnZ':
        // Keep the historical top-left origin on X/Y but center on Z.
        return [0, 0, 0.5];
      case 'BottomCenterZ':
        return [0.5, 0.5, 0];
      case 'BottomCenterY':
        return [0.5, 1, 0.5];
      case 'TopLeft':
        return [0, 0, 0];
      default:
        return [0, 0, 0];
    }
  };

  type Cube3DObjectNetworkSyncDataType = {
    fo: 'Y' | 'Z';
    bfu: 'X' | 'Y';
    vfb: integer;
    trfb: integer;
    ts: number;
    op: Cube3DPoint;
    cp: Cube3DPoint;
    frn: [string, string, string, string, string, string];
    mt: number;
    tint: string;
  };

  type Cube3DObjectNetworkSyncData = Object3DNetworkSyncData &
    Cube3DObjectNetworkSyncDataType;

  /**
   * Shows a 3D box object.
   * @category Objects > 3D Box
   */
  export class Cube3DRuntimeObject extends gdjs.RuntimeObject3D {
    private _renderer: Cube3DRuntimeObjectRenderer;
    private _facesOrientation: 'Y' | 'Z';
    private _backFaceUpThroughWhichAxisRotation: 'X' | 'Y';
    private _shouldUseTransparentTexture: boolean;
    // `_rotationZ` is `angle` from `gdjs.RuntimeObject`.
    private _visibleFacesBitmask: integer;
    private _textureRepeatFacesBitmask: integer;
    private _tileScale: number;
    /**
     * The local point of the cube that is at the object position.
     * Coordinates are between 0 and 1.
     */
    _originPoint: Cube3DPoint;
    /**
     * The local point of the cube that is used as rotation center.
     * Coordinates are between 0 and 1.
     */
    _centerPoint: Cube3DPoint;
    private _faceResourceNames: [
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    _materialType: gdjs.Cube3DRuntimeObject.MaterialType =
      gdjs.Cube3DRuntimeObject.MaterialType.StandardWithoutMetalness;
    _tint: string;
    _isCastingShadow: boolean = true;
    _isReceivingShadow: boolean = true;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: Cube3DObjectData,
      instanceData?: InstanceData
    ) {
      super(instanceContainer, objectData, instanceData);
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
      this._tileScale = objectData.content.tileScale || 1;
      this._originPoint = getPointForCubeLocation(
        objectData.content.originLocation || 'TopLeft'
      );
      this._centerPoint = getPointForCubeLocation(
        objectData.content.centerLocation || 'ObjectCenter'
      );
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

      this._tint = objectData.content.tint || '255;255;255';
      this._isCastingShadow = objectData.content.isCastingShadow || false;
      this._isReceivingShadow = objectData.content.isReceivingShadow || false;

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
     * @param enable - The visibility value to set.
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
     * @param enable - The visibility value to set.
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

    setColor(tint: string): void {
      if (this._tint === tint) {
        return;
      }
      this._tint = tint;
      this._renderer.updateTint();
    }

    getColor(): string {
      return this._tint;
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

    /**
     * Returns the scale applied to the textures when they are tiled
     * (repeated) over the faces of the cube. A scale of 1 means the texture
     * is displayed at the same size as in 2D.
     */
    getTileScale(): number {
      return this._tileScale;
    }

    setTileScale(tileScale: number): void {
      if (this._tileScale === tileScale) {
        return;
      }
      this._tileScale = tileScale;
      this._renderer.updateTextureUvMapping();
    }

    /**
     * The local point of the cube (coordinates between 0 and 1) that is at the
     * object position.
     * @internal
     */
    getOriginPoint(): Cube3DPoint {
      return this._originPoint;
    }

    /**
     * The local point of the cube (coordinates between 0 and 1) that is used as
     * rotation center.
     * @internal
     */
    getCenterPoint(): Cube3DPoint {
      return this._centerPoint;
    }

    private _setOriginPoint(originPoint: Cube3DPoint): void {
      if (
        this._originPoint[0] === originPoint[0] &&
        this._originPoint[1] === originPoint[1] &&
        this._originPoint[2] === originPoint[2]
      ) {
        return;
      }
      this._originPoint = originPoint;
      this._renderer.updatePosition();
      this.invalidateHitboxes();
    }

    private _setCenterPoint(centerPoint: Cube3DPoint): void {
      if (
        this._centerPoint[0] === centerPoint[0] &&
        this._centerPoint[1] === centerPoint[1] &&
        this._centerPoint[2] === centerPoint[2]
      ) {
        return;
      }
      this._centerPoint = centerPoint;
      this._renderer.updatePosition();
      this.invalidateHitboxes();
    }

    getCenterX(): float {
      return this.getWidth() * this._centerPoint[0];
    }

    getCenterY(): float {
      return this.getHeight() * this._centerPoint[1];
    }

    getCenterZ(): float {
      return this.getDepth() * this._centerPoint[2];
    }

    getDrawableX(): float {
      return this.getX() - this.getWidth() * this._originPoint[0];
    }

    getDrawableY(): float {
      return this.getY() - this.getHeight() * this._originPoint[1];
    }

    getDrawableZ(): float {
      return this.getZ() - this.getDepth() * this._originPoint[2];
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
      if (oldObjectData.content.tint !== newObjectData.content.tint) {
        this.setColor(newObjectData.content.tint || '255;255;255');
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
          newObjectData.content.frontFaceResourceRepeat || false
        );
      }
      if (
        oldObjectData.content.backFaceResourceRepeat !==
        newObjectData.content.backFaceResourceRepeat
      ) {
        this.setRepeatTextureOnFace(
          'back',
          newObjectData.content.backFaceResourceRepeat || false
        );
      }
      if (
        oldObjectData.content.leftFaceResourceRepeat !==
        newObjectData.content.leftFaceResourceRepeat
      ) {
        this.setRepeatTextureOnFace(
          'left',
          newObjectData.content.leftFaceResourceRepeat || false
        );
      }
      if (
        oldObjectData.content.rightFaceResourceRepeat !==
        newObjectData.content.rightFaceResourceRepeat
      ) {
        this.setRepeatTextureOnFace(
          'right',
          newObjectData.content.rightFaceResourceRepeat || false
        );
      }
      if (
        oldObjectData.content.topFaceResourceRepeat !==
        newObjectData.content.topFaceResourceRepeat
      ) {
        this.setRepeatTextureOnFace(
          'top',
          newObjectData.content.topFaceResourceRepeat || false
        );
      }
      if (
        oldObjectData.content.bottomFaceResourceRepeat !==
        newObjectData.content.bottomFaceResourceRepeat
      ) {
        this.setRepeatTextureOnFace(
          'bottom',
          newObjectData.content.bottomFaceResourceRepeat || false
        );
      }
      if (
        oldObjectData.content.backFaceUpThroughWhichAxisRotation !==
        newObjectData.content.backFaceUpThroughWhichAxisRotation
      ) {
        this.setBackFaceUpThroughWhichAxisRotation(
          newObjectData.content.backFaceUpThroughWhichAxisRotation || 'X'
        );
      }
      if (
        oldObjectData.content.facesOrientation !==
        newObjectData.content.facesOrientation
      ) {
        this.setFacesOrientation(newObjectData.content.facesOrientation || 'Y');
      }
      if (oldObjectData.content.tileScale !== newObjectData.content.tileScale) {
        this.setTileScale(newObjectData.content.tileScale || 1);
      }
      if (
        oldObjectData.content.originLocation !==
        newObjectData.content.originLocation
      ) {
        this._setOriginPoint(
          getPointForCubeLocation(
            newObjectData.content.originLocation || 'TopLeft'
          )
        );
      }
      if (
        oldObjectData.content.centerLocation !==
        newObjectData.content.centerLocation
      ) {
        this._setCenterPoint(
          getPointForCubeLocation(
            newObjectData.content.centerLocation || 'ObjectCenter'
          )
        );
      }
      if (
        oldObjectData.content.materialType !==
        newObjectData.content.materialType
      ) {
        this.setMaterialType(newObjectData.content.materialType);
      }
      if (
        oldObjectData.content.isCastingShadow !==
        newObjectData.content.isCastingShadow
      ) {
        this.updateShadowCasting(newObjectData.content.isCastingShadow);
      }
      if (
        oldObjectData.content.isReceivingShadow !==
        newObjectData.content.isReceivingShadow
      ) {
        this.updateShadowReceiving(newObjectData.content.isReceivingShadow);
      }

      return true;
    }

    getNetworkSyncData(
      syncOptions: GetNetworkSyncDataOptions
    ): Cube3DObjectNetworkSyncData {
      return {
        ...super.getNetworkSyncData(syncOptions),
        mt: this._materialType,
        fo: this._facesOrientation,
        bfu: this._backFaceUpThroughWhichAxisRotation,
        vfb: this._visibleFacesBitmask,
        trfb: this._textureRepeatFacesBitmask,
        ts: this._tileScale,
        op: this._originPoint,
        cp: this._centerPoint,
        frn: this._faceResourceNames,
        tint: this._tint,
      };
    }

    updateFromNetworkSyncData(
      networkSyncData: Cube3DObjectNetworkSyncData,
      options: UpdateFromNetworkSyncDataOptions
    ): void {
      super.updateFromNetworkSyncData(networkSyncData, options);

      if (networkSyncData.mt !== undefined) {
        this._materialType = networkSyncData.mt;
      }
      if (networkSyncData.fo !== undefined) {
        if (this._facesOrientation !== networkSyncData.fo) {
          this.setFacesOrientation(networkSyncData.fo);
        }
      }
      if (networkSyncData.bfu !== undefined) {
        if (this._backFaceUpThroughWhichAxisRotation !== networkSyncData.bfu) {
          this.setBackFaceUpThroughWhichAxisRotation(networkSyncData.bfu);
        }
      }
      if (networkSyncData.vfb !== undefined) {
        // If it is different, update all the faces.
        if (this._visibleFacesBitmask !== networkSyncData.vfb) {
          this._visibleFacesBitmask = networkSyncData.vfb;
          for (let i = 0; i < this._faceResourceNames.length; i++) {
            this._renderer.updateFace(i);
          }
        }
      }
      if (networkSyncData.trfb !== undefined) {
        // If it is different, update all the faces.
        if (this._textureRepeatFacesBitmask !== networkSyncData.trfb) {
          this._textureRepeatFacesBitmask = networkSyncData.trfb;
          for (let i = 0; i < this._faceResourceNames.length; i++) {
            this._renderer.updateFace(i);
          }
        }
      }
      if (networkSyncData.ts !== undefined) {
        this.setTileScale(networkSyncData.ts);
      }
      if (networkSyncData.op !== undefined) {
        this._setOriginPoint(networkSyncData.op);
      }
      if (networkSyncData.cp !== undefined) {
        this._setCenterPoint(networkSyncData.cp);
      }
      if (networkSyncData.frn !== undefined) {
        // If one element is different, update all the faces.
        if (
          !this._faceResourceNames.every(
            (value, index) => value === networkSyncData.frn[index]
          )
        ) {
          this._faceResourceNames = networkSyncData.frn;
          // Update all faces. (Could optimize to only update the changed ones)
          for (let i = 0; i < this._faceResourceNames.length; i++) {
            this._renderer.updateFace(i);
          }
        }
      }
      if (networkSyncData.tint !== undefined) {
        if (this._tint !== networkSyncData.tint) {
          this._tint = networkSyncData.tint;
          this._renderer.updateTint();
        }
      }
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
    updateShadowCasting(value: boolean) {
      this._isCastingShadow = value;
      this._renderer.updateShadowCasting();
    }
    updateShadowReceiving(value: boolean) {
      this._isReceivingShadow = value;
      this._renderer.updateShadowReceiving();
    }
  }

  /** @category Objects > 3D Box */
  export namespace Cube3DRuntimeObject {
    export enum MaterialType {
      Basic,
      StandardWithoutMetalness,
    }
  }
  gdjs.registerObject('Scene3D::Cube3DObject', gdjs.Cube3DRuntimeObject);
}
