namespace gdjs {
  /**
   * One (geometry, material) pair of a GLB, ready to be instanced.
   *
   * The geometry is a *baked* copy: the transform that places the mesh inside
   * the model normalised into a 1x1x1 cube is already applied to its vertices.
   * The per-instance matrix is therefore a plain position/rotation/scale, which
   * matters: `THREE.InstancedMesh` transforms normals with `mat3(instanceMatrix)`
   * (an approximation that is only valid for a rotation and a positive scale),
   * so a mirrored per-instance matrix - and GDevelop's 3D basis does mirror -
   * would break the lighting of every copy.
   */
  type Scenery3DPart = {
    geometry: THREE.BufferGeometry;
    material: THREE.Material | THREE.Material[];
  };

  const epsilon3D = 1 / (1 << 16);

  const scratchEuler = new THREE.Euler(0, 0, 0, 'ZYX');
  const scratchQuaternion = new THREE.Quaternion();
  const scratchPosition = new THREE.Vector3();
  const scratchScale = new THREE.Vector3();
  const scratchInstanceMatrix = new THREE.Matrix4();

  /**
   * Reverses the winding of every triangle of a geometry.
   *
   * Needed after applying a mirroring matrix to the vertices: the triangles
   * would otherwise be back-facing. (For a regular `THREE.Mesh`, three.js
   * handles this by looking at the sign of the object world matrix determinant,
   * which cannot work for a batch of instances.)
   */
  const reverseGeometryWinding = (geometry: THREE.BufferGeometry): void => {
    let index = geometry.getIndex();
    if (!index) {
      const vertexCount = geometry.attributes.position.count;
      const generated = new Uint32Array(vertexCount);
      for (let i = 0; i < vertexCount; i++) {
        generated[i] = i;
      }
      geometry.setIndex(new THREE.BufferAttribute(generated, 1));
      index = geometry.getIndex()!;
    }
    const array = index.array as
      | Uint16Array
      | Uint32Array
      | Array<number>
      | Uint8Array;
    for (let i = 0; i + 2 < array.length; i += 3) {
      const swapped = array[i + 1];
      array[i + 1] = array[i + 2];
      array[i + 2] = swapped;
    }
    index.needsUpdate = true;
  };

  /**
   * Builds the "template": the model transformed exactly the way
   * {@link gdjs.Model3DRuntimeObjectRenderer} transforms it, i.e. rotated by
   * the object rotation properties, centered, flipped on Y and stretched into a
   * 1x1x1 cube.
   *
   * The steps are intentionally identical to
   * `Model3DRuntimeObject3DRenderer.stretchModelIntoUnitaryCube` for the case
   * "origin point = center point = the middle of the object", so that a
   * `Scenery3D` instance is rendered exactly where an equivalent `Model3D`
   * object would be.
   */
  const buildNormalizedTemplate = (
    modelScene: THREE.Object3D,
    rotationX: float,
    rotationY: float,
    rotationZ: float
  ): THREE.Object3D => {
    const template = new THREE.Group();
    template.rotation.order = 'ZYX';
    template.add(modelScene);

    template.rotation.set(
      gdjs.toRad(rotationX),
      gdjs.toRad(rotationY),
      gdjs.toRad(rotationZ)
    );
    template.updateMatrixWorld(true);
    const boundingBox = new THREE.Box3().setFromObject(template);

    const modelWidth = boundingBox.max.x - boundingBox.min.x;
    const modelHeight = boundingBox.max.y - boundingBox.min.y;
    const modelDepth = boundingBox.max.z - boundingBox.min.z;

    // Center the model on all 3 axes (the "object center" convention).
    template.position.x = -(boundingBox.min.x + modelWidth * 0.5);
    // The model is flipped on Y axis, so the center is `1 - 0.5` = `0.5` too.
    template.position.y = -(boundingBox.min.y + modelHeight * 0.5);
    template.position.z = -(boundingBox.min.z + modelDepth * 0.5);

    template.scale.set(1, 1, 1);
    template.rotation.set(
      gdjs.toRad(rotationX),
      gdjs.toRad(rotationY),
      gdjs.toRad(rotationZ)
    );

    const scaleX = modelWidth < epsilon3D ? 1 : 1 / modelWidth;
    const scaleY = modelHeight < epsilon3D ? 1 : 1 / modelHeight;
    const scaleZ = modelDepth < epsilon3D ? 1 : 1 / modelDepth;
    const scaleMatrix = new THREE.Matrix4();
    // Flip on Y because the Y axis is on the opposite side of direct basis.
    scaleMatrix.makeScale(scaleX, -scaleY, scaleZ);
    template.updateMatrix();
    template.applyMatrix4(scaleMatrix);

    template.updateMatrixWorld(true);
    return template;
  };

  /**
   * Renders many copies of one 3D model with one `THREE.InstancedMesh` per
   * (geometry, material) pair of the model.
   *
   * The number of draw calls is therefore the number of meshes *of the model*,
   * no matter how many copies are displayed.
   *
   * @category Renderers > 3D Scenery
   */
  class Scenery3DRuntimeObject3DRenderer extends gdjs.RuntimeObject3DRenderer {
    private _scenery3DRuntimeObject: gdjs.Scenery3DRuntimeObject;
    private _group: THREE.Group;
    private _parts: Scenery3DPart[] = [];
    private _instancedMeshes: THREE.InstancedMesh[] = [];
    private _capacity: integer;
    private _count: integer = 0;
    /**
     * Materials created by this renderer (when the material type is `Basic`),
     * which must be disposed of. Materials coming from the GLB are shared with
     * the model manager and must NOT be disposed of here.
     */
    private _ownedMaterials: THREE.Material[] = [];
    /** Geometries baked by this renderer, which must be disposed of. */
    private _ownedGeometries: THREE.BufferGeometry[] = [];

    constructor(
      runtimeObject: gdjs.Scenery3DRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      const group = new THREE.Group();
      group.rotation.order = 'ZYX';
      super(runtimeObject, instanceContainer, group);

      this._scenery3DRuntimeObject = runtimeObject;
      this._group = group;
      this._capacity = Math.max(1, runtimeObject._capacity);

      this._buildParts(instanceContainer);
      this._allocateInstancedMeshes(this._capacity);
    }

    /**
     * The container is only a holder: instance matrices are absolute, so the
     * group must stay at the origin with an identity transform.
     */
    override updatePosition() {}
    override updateRotation() {}
    override updateSize() {}

    private _buildParts(instanceContainer: gdjs.RuntimeInstanceContainer) {
      const runtimeObject = this._scenery3DRuntimeObject;
      const originalModel = instanceContainer
        .getGame()
        .getModel3DManager()
        .getModel(runtimeObject._modelResourceName);

      // The clone is only used to compute the normalising transform and to hold
      // the (possibly replaced) materials: it is never added to the scene, so
      // it costs one clone per Scenery3D object, not one per copy displayed.
      const modelClone = originalModel.scene.clone(true);
      this._replaceMaterials(modelClone);
      const template = buildNormalizedTemplate(
        modelClone,
        runtimeObject._rotationXProperty,
        runtimeObject._rotationYProperty,
        runtimeObject._rotationZProperty
      );

      const parts: Scenery3DPart[] = [];
      template.traverse((node: THREE.Object3D) => {
        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh || !mesh.geometry) {
          return;
        }
        // Bake the mesh transform inside the normalised model into the
        // vertices, once per Scenery3D object (not once per copy). This is the
        // only per-object memory cost of instancing: the vertex data of the
        // model is duplicated once.
        const geometry = mesh.geometry.clone();
        geometry.applyMatrix4(mesh.matrixWorld);
        if (mesh.matrixWorld.determinant() < 0) {
          reverseGeometryWinding(geometry);
        }
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        parts.push({ geometry, material: mesh.material });
        this._ownedGeometries.push(geometry);
      });
      this._parts = parts;
    }

    private _replaceMaterials(node: THREE.Object3D) {
      const materialType = this._scenery3DRuntimeObject._materialType;
      if (
        materialType === gdjs.Model3DRuntimeObject.MaterialType.KeepOriginal
      ) {
        return;
      }
      node.traverse((child: THREE.Object3D) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.material) {
          return;
        }
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        if (
          materialType ===
          gdjs.Model3DRuntimeObject.MaterialType.StandardWithoutMetalness
        ) {
          for (const material of materials) {
            //@ts-ignore `metalness` only exists on some materials.
            if (material.metalness) {
              //@ts-ignore
              material.metalness = 0;
            }
          }
          return;
        }
        // Basic material: build cheap unlit materials, owned by this renderer.
        const basicMaterials = materials.map((material) => {
          const basicMaterial = new THREE.MeshBasicMaterial();
          basicMaterial.name = material.name;
          //@ts-ignore
          if (material.color) basicMaterial.color = material.color;
          //@ts-ignore
          if (material.map) basicMaterial.map = material.map;
          this._ownedMaterials.push(basicMaterial);
          return basicMaterial;
        });
        mesh.material = Array.isArray(mesh.material)
          ? basicMaterials
          : basicMaterials[0];
      });
    }

    private _allocateInstancedMeshes(capacity: integer) {
      const runtimeObject = this._scenery3DRuntimeObject;
      this._instancedMeshes = this._parts.map((part) => {
        const instancedMesh = new THREE.InstancedMesh(
          part.geometry,
          part.material,
          capacity
        );
        instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        instancedMesh.count = this._count;
        instancedMesh.castShadow = runtimeObject._isCastingShadow;
        instancedMesh.receiveShadow = runtimeObject._isReceivingShadow;
        //@ts-ignore Attached for debugging/picking, like other 3D renderers do.
        instancedMesh.gdjsRuntimeObject = runtimeObject;
        this._group.add(instancedMesh);
        return instancedMesh;
      });
      this._capacity = capacity;
    }

    getCapacity(): integer {
      return this._capacity;
    }

    getInstanceCount(): integer {
      return this._count;
    }

    /**
     * Number of `THREE.InstancedMesh` used, i.e. the number of draw calls this
     * object costs (times the number of render passes).
     */
    getBatchCount(): integer {
      return this._instancedMeshes.length;
    }

    /**
     * Doubles the capacity, keeping the instances already stored.
     * This is a full reallocation of the instance buffers, so it is better to
     * declare the right capacity upfront - but it must not break the game.
     */
    private _grow() {
      const newCapacity = this._capacity * 2;
      const oldMeshes = this._instancedMeshes;
      const oldCount = this._count;
      this._allocateInstancedMeshes(newCapacity);
      for (let i = 0; i < oldMeshes.length; i++) {
        const oldMesh = oldMeshes[i];
        const newMesh = this._instancedMeshes[i];
        newMesh.instanceMatrix.array.set(
          oldMesh.instanceMatrix.array.subarray(0, oldCount * 16)
        );
        newMesh.instanceMatrix.needsUpdate = true;
        newMesh.count = oldCount;
        this._group.remove(oldMesh);
        oldMesh.dispose();
      }
    }

    /**
     * Writes the matrix of one copy.
     * @returns the handle of the copy, or -1 if it could not be added.
     */
    addInstance(
      x: float,
      y: float,
      z: float,
      angle: float,
      width: float,
      height: float,
      depth: float
    ): integer {
      if (this._count >= this._capacity) {
        this._grow();
      }
      const handle = this._count;
      this._count++;
      for (const instancedMesh of this._instancedMeshes) {
        instancedMesh.count = this._count;
      }
      this.setInstanceTransform(handle, x, y, z, angle, width, height, depth);
      return handle;
    }

    setInstanceTransform(
      handle: integer,
      x: float,
      y: float,
      z: float,
      angle: float,
      width: float,
      height: float,
      depth: float
    ): void {
      if (handle < 0 || handle >= this._count) {
        return;
      }
      scratchEuler.set(0, 0, gdjs.toRad(angle), 'ZYX');
      scratchQuaternion.setFromEuler(scratchEuler);
      scratchPosition.set(x, y, z);
      scratchScale.set(width, height, depth);
      scratchInstanceMatrix.compose(
        scratchPosition,
        scratchQuaternion,
        scratchScale
      );
      for (let i = 0; i < this._instancedMeshes.length; i++) {
        this._instancedMeshes[i].setMatrixAt(handle, scratchInstanceMatrix);
      }
      this._invalidateInstances();
    }

    /**
     * Removes one copy by moving the last one in its place (so handles of other
     * copies stay valid, except the handle of the last copy).
     * @returns the handle that was moved, or -1 if nothing was moved.
     */
    removeInstance(handle: integer): integer {
      if (handle < 0 || handle >= this._count) {
        return -1;
      }
      const lastHandle = this._count - 1;
      if (handle !== lastHandle) {
        for (const instancedMesh of this._instancedMeshes) {
          instancedMesh.getMatrixAt(lastHandle, scratchInstanceMatrix);
          instancedMesh.setMatrixAt(handle, scratchInstanceMatrix);
        }
      }
      this._count = lastHandle;
      for (const instancedMesh of this._instancedMeshes) {
        instancedMesh.count = this._count;
      }
      this._invalidateInstances();
      return handle === lastHandle ? -1 : lastHandle;
    }

    clearInstances(): void {
      this._count = 0;
      for (const instancedMesh of this._instancedMeshes) {
        instancedMesh.count = 0;
      }
      this._invalidateInstances();
    }

    getInstanceTransform(
      handle: integer,
      target: THREE.Matrix4
    ): THREE.Matrix4 | null {
      if (
        handle < 0 ||
        handle >= this._count ||
        this._instancedMeshes.length === 0
      ) {
        return null;
      }
      this._instancedMeshes[0].getMatrixAt(handle, target);
      return target;
    }

    private _invalidateInstances() {
      for (const instancedMesh of this._instancedMeshes) {
        instancedMesh.instanceMatrix.needsUpdate = true;
        // Force three.js to recompute the bounding sphere covering all the
        // copies, so that frustum culling of the whole batch stays correct.
        instancedMesh.boundingSphere = null;
        instancedMesh.boundingBox = null;
      }
    }

    _updateShadow() {
      const runtimeObject = this._scenery3DRuntimeObject;
      for (const instancedMesh of this._instancedMeshes) {
        instancedMesh.castShadow = runtimeObject._isCastingShadow;
        instancedMesh.receiveShadow = runtimeObject._isReceivingShadow;
      }
    }

    onDestroy() {
      for (const instancedMesh of this._instancedMeshes) {
        this._group.remove(instancedMesh);
        // Only frees the per-instance buffers: geometries and materials of the
        // GLB are shared with the model manager.
        instancedMesh.dispose();
      }
      this._instancedMeshes = [];
      for (const material of this._ownedMaterials) {
        material.dispose();
      }
      this._ownedMaterials = [];
      for (const geometry of this._ownedGeometries) {
        geometry.dispose();
      }
      this._ownedGeometries = [];
      this._parts = [];
      this._count = 0;
    }
  }

  /** @category Renderers > 3D Scenery */
  export const Scenery3DRuntimeObjectRenderer =
    Scenery3DRuntimeObject3DRenderer;
  /** @category Renderers > 3D Scenery */
  export type Scenery3DRuntimeObjectRenderer = Scenery3DRuntimeObject3DRenderer;
}
