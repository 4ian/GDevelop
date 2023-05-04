namespace gdjs {
  /** Base parameters for {@link gdjs.Cube3DRuntimeObject} */
  export interface Cube3DObjectData extends ObjectData {
    /** The base parameters of the ThreeDShape */
    content: {
      width: float;
      height: float;
      depth: float;
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
  export class Cube3DRuntimeObject extends gdjs.RuntimeObject {
    _renderer: Cube3DRuntimeObjectRenderer;
    private _z: float = 0;
    private _width: float;
    private _height: float;
    private _depth: float;
    private _rotationX: float = 0;
    private _rotationY: float = 0;
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
    private static _temporaryVector = new THREE.Vector3();

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: Cube3DObjectData
    ) {
      super(instanceContainer, objectData);
      this._width = objectData.content.width || 100;
      this._height = objectData.content.height || 100;
      this._depth = objectData.content.depth || 100;
      this._shouldUseTransparentTexture =
        objectData.content.enableTextureTransparency || false;
      this._facesOrientation = objectData.content.facesOrientation;
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
        objectData.content.backFaceUpThroughWhichAxisRotation;
      this._faceResourceNames = [
        objectData.content.frontFaceResourceName,
        objectData.content.backFaceResourceName,
        objectData.content.leftFaceResourceName,
        objectData.content.rightFaceResourceName,
        objectData.content.topFaceResourceName,
        objectData.content.bottomFaceResourceName,
      ];

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

    getRendererObject() {
      return null;
    }

    get3dRendererObject() {
      return this._renderer.get3dRendererObject();
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
      if (oldObjectData.content.width !== newObjectData.content.width) {
        this.setWidth(newObjectData.content.width);
      }
      if (oldObjectData.content.height !== newObjectData.content.height) {
        this.setHeight(newObjectData.content.height);
      }
      if (oldObjectData.content.depth !== newObjectData.content.depth) {
        this.setDepth(newObjectData.content.depth);
      }
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

      return true;
    }

    extraInitializationFromInitialInstance(initialInstanceData: InstanceData) {
      if (initialInstanceData.customSize) {
        this.setWidth(initialInstanceData.width);
        this.setHeight(initialInstanceData.height);
      }
      initialInstanceData.numberProperties.forEach((property) => {
        if (property.name === 'z') {
          this.setZ(property.value);
        } else if (property.name === 'depth') {
          this.setDepth(property.value);
        } else if (property.name === 'rotationX') {
          this.setRotationX(property.value);
        } else if (property.name === 'rotationY') {
          this.setRotationY(property.value);
        }
      });
    }

    setX(x: float): void {
      super.setX(x);
      this._renderer.updatePosition();
    }

    setY(y: float): void {
      super.setY(y);
      this._renderer.updatePosition();
    }

    /**
     * Set the object position on the Z axis.
     */
    setZ(z: float): void {
      if (z === this._z) return;
      this._z = z;
      this._renderer.updatePosition();
    }

    /**
     * Get the object position on the Z axis.
     */
    getZ(): float {
      return this._z;
    }

    setAngle(angle: float): void {
      super.setAngle(angle);
      this._renderer.updateRotation();
    }

    /**
     * Set the object rotation on the X axis.
     */
    setRotationX(angle: float): void {
      this._rotationX = angle;
      this._renderer.updateRotation();
    }

    /**
     * Set the object rotation on the Y axis.
     */
    setRotationY(angle: float): void {
      this._rotationY = angle;
      this._renderer.updateRotation();
    }

    /**
     * Get the object rotation on the X axis.
     */
    getRotationX(): float {
      return this._rotationX;
    }

    /**
     * Return true if the texture transparency should be enabled.
     */
    shouldUseTransparentTexture(): boolean {
      return this._shouldUseTransparentTexture;
    }

    /**
     * Turn the object around the scene x axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundX(deltaAngle: float): void {
      const axisX = gdjs.Cube3DRuntimeObject._temporaryVector;
      axisX.set(1, 0, 0);

      const mesh = this._renderer.get3dRendererObject();
      mesh.rotateOnWorldAxis(axisX, gdjs.toRad(deltaAngle));
      this._rotationX = gdjs.toDegrees(mesh.rotation.x);
      this._rotationY = gdjs.toDegrees(mesh.rotation.y);
      this.setAngle(gdjs.toDegrees(mesh.rotation.z));
    }

    /**
     * Turn the object around the scene y axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundY(deltaAngle: float): void {
      const axisY = gdjs.Cube3DRuntimeObject._temporaryVector;
      axisY.set(0, 1, 0);

      const mesh = this._renderer.get3dRendererObject();
      mesh.rotateOnWorldAxis(axisY, gdjs.toRad(deltaAngle));
      this._rotationX = gdjs.toDegrees(mesh.rotation.x);
      this._rotationY = gdjs.toDegrees(mesh.rotation.y);
      this.setAngle(gdjs.toDegrees(mesh.rotation.z));
    }

    /**
     * Turn the object around the scene z axis at its center.
     * @param deltaAngle the rotation angle
     */
    turnAroundZ(deltaAngle: float): void {
      const axisZ = gdjs.Cube3DRuntimeObject._temporaryVector;
      axisZ.set(0, 0, 1);

      const mesh = this._renderer.get3dRendererObject();
      mesh.rotateOnWorldAxis(axisZ, gdjs.toRad(deltaAngle));
      this._rotationX = gdjs.toDegrees(mesh.rotation.x);
      this._rotationY = gdjs.toDegrees(mesh.rotation.y);
      this.setAngle(gdjs.toDegrees(mesh.rotation.z));
    }

    /**
     * Get the object rotation on the Y axis.
     */
    getRotationY(): float {
      return this._rotationY;
    }

    getWidth(): float {
      return this._width;
    }

    getHeight(): float {
      return this._height;
    }

    /**
     * Get the object size on the Z axis (called "depth").
     */
    getDepth(): float {
      return this._depth;
    }

    setWidth(width: float): void {
      if (this._width === width) return;

      this._width = width;
      this._renderer.updateSize();
      this.invalidateHitboxes();
    }

    setHeight(height: float): void {
      if (this._height === height) return;

      this._height = height;
      this._renderer.updateSize();
      this.invalidateHitboxes();
    }

    /**
     * Set the object size on the Z axis (called "depth").
     */
    setDepth(depth: float): void {
      if (this._depth === depth) return;

      this._depth = depth;
      this._renderer.updateSize();
    }
  }
  gdjs.registerObject('Scene3D::Cube3DObject', gdjs.Cube3DRuntimeObject);
}
