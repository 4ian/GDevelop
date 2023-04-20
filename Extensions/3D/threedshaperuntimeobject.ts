namespace gdjs {
  /** Base parameters for {@link gdjs.ThreeDShapeRuntimeObject} */
  export interface ThreeDShapeObjectData extends ObjectData {
    /** The base parameters of the ThreeDShape */
    content: {
      width: float;
      height: float;
      depth: float;
      frontFaceResourceName: string;
      backFaceResourceName: string;
      leftFaceResourceName: string;
      rightFaceResourceName: string;
      topFaceResourceName: string;
      bottomFaceResourceName: string;
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
  export class ThreeDShapeRuntimeObject extends gdjs.RuntimeObject {
    _renderer: ThreeDShapeRuntimeObjectRenderer;
    private _z: float = 0;
    private _width: float;
    private _height: float;
    private _depth: float;
    private _rotationX: float = 0;
    private _rotationY: float = 0;
    // `_rotationZ` is `angle` from `gdjs.RuntimeObject`.
    private _visibleFacesBitmask: integer;
    private _faceResourceNames: [
      string,
      string,
      string,
      string,
      string,
      string
    ];

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: ThreeDShapeObjectData
    ) {
      super(instanceContainer, objectData);

      this._width = objectData.content.width || 100;
      this._height = objectData.content.height || 100;
      this._depth = objectData.content.depth || 100;
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
      this._faceResourceNames = [
        objectData.content.frontFaceResourceName,
        objectData.content.backFaceResourceName,
        objectData.content.leftFaceResourceName,
        objectData.content.rightFaceResourceName,
        objectData.content.topFaceResourceName,
        objectData.content.bottomFaceResourceName,
      ];

      this._renderer = new gdjs.ThreeDShapeRuntimeObjectRenderer(
        this,
        instanceContainer,
        objectData
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    setFaceVisibility(faceName: FaceName, value: boolean) {
      const faceIndex = faceNameToBitmaskIndex[faceName];
      if (faceIndex === undefined) {
        return;
      }
      if (value === this.isFaceAtIndexVisible(faceIndex)) {
        return;
      }

      if (value) {
        this._visibleFacesBitmask |= 1 << faceIndex;
      } else {
        this._visibleFacesBitmask &= ~(1 << faceIndex);
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

    updateFromObjectData(
      oldObjectData: ThreeDShapeObjectData,
      newObjectData: ThreeDShapeObjectData
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
  gdjs.registerObject('3D::ThreeDShapeObject', gdjs.ThreeDShapeRuntimeObject);
}
