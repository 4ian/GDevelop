namespace gdjs {
  /**
   * Base parameters for {@link gdjs.Scenery3DRuntimeObject}
   * @category Objects > 3D Scenery
   */
  export interface Scenery3DObjectData extends Object3DData {
    content: Object3DDataContent & {
      /** The model3D resource repeated by every copy. */
      modelResourceName: string;
      /** Number of copies preallocated in the instance buffers. */
      capacity: number;
      rotationX: number;
      rotationY: number;
      rotationZ: number;
      materialType: 'Basic' | 'StandardWithoutMetalness' | 'KeepOriginal';
      isCastingShadow: boolean;
      isReceivingShadow: boolean;
    };
  }

  /**
   * A single object holding many copies ("instances") of one 3D model, drawn
   * with `THREE.InstancedMesh`.
   *
   * This is meant for static scenery - buildings, road tiles, props, trees,
   * fences - where a city needs tens of thousands of copies of a few hundred
   * models. A `Model3D` object costs one scene node and one draw call per copy;
   * a `Scenery3D` object costs one draw call per mesh *of the model*, whatever
   * the number of copies.
   *
   * Copies are identified by a handle, returned by
   * {@link Scenery3DRuntimeObject.addInstance}.
   *
   * @category Objects > 3D Scenery
   */
  export class Scenery3DRuntimeObject extends gdjs.RuntimeObject3D {
    _renderer: gdjs.Scenery3DRuntimeObjectRenderer;
    _modelResourceName: string;
    _capacity: integer;
    _rotationXProperty: float;
    _rotationYProperty: float;
    _rotationZProperty: float;
    _materialType: gdjs.Model3DRuntimeObject.MaterialType;
    _isCastingShadow: boolean;
    _isReceivingShadow: boolean;

    /** Handle of the copy added last, so event sheets can chain calls on it. */
    _lastInstanceHandle: integer = -1;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: Scenery3DObjectData,
      instanceData?: InstanceData
    ) {
      super(instanceContainer, objectData, instanceData);
      this._modelResourceName = objectData.content.modelResourceName;
      this._capacity = Math.max(
        1,
        Math.floor(objectData.content.capacity || 1000)
      );
      this._rotationXProperty = objectData.content.rotationX || 0;
      this._rotationYProperty = objectData.content.rotationY || 0;
      this._rotationZProperty = objectData.content.rotationZ || 0;
      this._materialType = this._convertMaterialType(
        objectData.content.materialType
      );
      this._isCastingShadow = !!objectData.content.isCastingShadow;
      this._isReceivingShadow = !!objectData.content.isReceivingShadow;

      this._renderer = new gdjs.Scenery3DRuntimeObjectRenderer(
        this,
        instanceContainer
      );

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    private _convertMaterialType(
      materialTypeString: string
    ): gdjs.Model3DRuntimeObject.MaterialType {
      if (materialTypeString === 'KeepOriginal') {
        return gdjs.Model3DRuntimeObject.MaterialType.KeepOriginal;
      } else if (materialTypeString === 'StandardWithoutMetalness') {
        return gdjs.Model3DRuntimeObject.MaterialType.StandardWithoutMetalness;
      }
      return gdjs.Model3DRuntimeObject.MaterialType.Basic;
    }

    getRenderer(): gdjs.Scenery3DRuntimeObjectRenderer {
      return this._renderer;
    }

    override updateFromObjectData(
      oldObjectData: Scenery3DObjectData,
      newObjectData: Scenery3DObjectData
    ): boolean {
      super.updateFromObjectData(oldObjectData, newObjectData);
      // Changing the model or the capacity needs the batches to be rebuilt,
      // which is not supported without recreating the object.
      if (
        oldObjectData.content.modelResourceName !==
          newObjectData.content.modelResourceName ||
        oldObjectData.content.capacity !== newObjectData.content.capacity ||
        oldObjectData.content.rotationX !== newObjectData.content.rotationX ||
        oldObjectData.content.rotationY !== newObjectData.content.rotationY ||
        oldObjectData.content.rotationZ !== newObjectData.content.rotationZ ||
        oldObjectData.content.materialType !==
          newObjectData.content.materialType
      ) {
        return false;
      }
      if (
        oldObjectData.content.isCastingShadow !==
          newObjectData.content.isCastingShadow ||
        oldObjectData.content.isReceivingShadow !==
          newObjectData.content.isReceivingShadow
      ) {
        this._isCastingShadow = !!newObjectData.content.isCastingShadow;
        this._isReceivingShadow = !!newObjectData.content.isReceivingShadow;
        this._renderer._updateShadow();
      }
      return true;
    }

    override onDestroyed(): void {
      super.onDestroyed();
      this._renderer.onDestroy();
    }

    // -----------------------------------------------------------------------
    // Instances
    // -----------------------------------------------------------------------

    /**
     * Adds one copy of the model.
     *
     * @param x Center of the copy on the X axis, in scene coordinates.
     * @param y Center of the copy on the Y axis, in scene coordinates.
     * @param z Center of the copy on the Z axis, in scene coordinates.
     * @param angle Rotation around the Z axis, in degrees.
     * @param scaleX Multiplier of the object width for this copy.
     * @param scaleY Multiplier of the object height for this copy.
     * @param scaleZ Multiplier of the object depth for this copy.
     * @returns The handle of the new copy.
     */
    addInstance(
      x: float,
      y: float,
      z: float,
      angle: float,
      scaleX: float,
      scaleY: float,
      scaleZ: float
    ): integer {
      const handle = this._renderer.addInstance(
        x,
        y,
        z,
        angle,
        this.getOriginalWidth() * (scaleX || 1),
        this.getOriginalHeight() * (scaleY || 1),
        this.getOriginalDepth() * (scaleZ || 1)
      );
      this._lastInstanceHandle = handle;
      return handle;
    }

    /** Adds one copy with the object's own dimensions and no rotation. */
    addInstanceAt(x: float, y: float, z: float): integer {
      return this.addInstance(x, y, z, 0, 1, 1, 1);
    }

    /** Moves/rotates/rescales an existing copy. */
    setInstanceTransform(
      handle: integer,
      x: float,
      y: float,
      z: float,
      angle: float,
      scaleX: float,
      scaleY: float,
      scaleZ: float
    ): void {
      this._renderer.setInstanceTransform(
        handle,
        x,
        y,
        z,
        angle,
        this.getOriginalWidth() * (scaleX || 1),
        this.getOriginalHeight() * (scaleY || 1),
        this.getOriginalDepth() * (scaleZ || 1)
      );
    }

    /**
     * Removes one copy. The last copy takes its place, so its handle changes to
     * `handle` (this is what {@link getLastMovedInstanceHandle} reports).
     */
    removeInstance(handle: integer): void {
      this._movedInstanceHandle = this._renderer.removeInstance(handle);
    }

    private _movedInstanceHandle: integer = -1;

    /**
     * Handle of the copy that was moved by the last `removeInstance`, or -1.
     */
    getLastMovedInstanceHandle(): integer {
      return this._movedInstanceHandle;
    }

    /** Removes every copy. */
    clearInstances(): void {
      this._renderer.clearInstances();
      this._lastInstanceHandle = -1;
      this._movedInstanceHandle = -1;
    }

    /** Number of copies currently displayed. */
    getInstanceCount(): integer {
      return this._renderer.getInstanceCount();
    }

    /** Number of copies that can be displayed without reallocating. */
    getCapacity(): integer {
      return this._renderer.getCapacity();
    }

    /**
     * Number of `THREE.InstancedMesh` used by this object, i.e. how many draw
     * calls it costs per render pass. It is the number of meshes of the model.
     */
    getBatchCount(): integer {
      return this._renderer.getBatchCount();
    }

    /** Handle of the copy added last, or -1. */
    getLastInstanceHandle(): integer {
      return this._lastInstanceHandle;
    }

    // -----------------------------------------------------------------------
    // Shadows
    // -----------------------------------------------------------------------

    setIsCastingShadow(value: boolean): void {
      this._isCastingShadow = value;
      this._renderer._updateShadow();
    }

    isCastingShadow(): boolean {
      return this._isCastingShadow;
    }

    setIsReceivingShadow(value: boolean): void {
      this._isReceivingShadow = value;
      this._renderer._updateShadow();
    }

    isReceivingShadow(): boolean {
      return this._isReceivingShadow;
    }
  }

  gdjs.registerObject('Scene3D::Scenery3DObject', gdjs.Scenery3DRuntimeObject);
}
