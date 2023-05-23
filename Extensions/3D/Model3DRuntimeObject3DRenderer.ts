namespace gdjs {
  const removeMetalness = (material: THREE.Material): void => {
    //@ts-ignore
    if (material.metalness) {
      //@ts-ignore
      material.metalness = 0;
    }
  };

  const removeMetalnessFromMesh = (node: THREE.Object3D<THREE.Event>) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.material) {
      return;
    }
    if (Array.isArray(mesh.material)) {
      for (let index = 0; index < mesh.material.length; index++) {
        removeMetalness(mesh.material[index]);
      }
    } else {
      removeMetalness(mesh.material);
    }
  };

  const traverseToRemoveMetalnessFromMeshes = (
    node: THREE.Object3D<THREE.Event>
  ) => node.traverse(removeMetalnessFromMesh);

  const convertToBasicMaterial = (
    material: THREE.Material
  ): THREE.MeshBasicMaterial => {
    const basicMaterial = new THREE.MeshBasicMaterial();
    //@ts-ignore
    if (material.color) {
      //@ts-ignore
      basicMaterial.color = material.color;
    }
    //@ts-ignore
    if (material.map) {
      //@ts-ignore
      basicMaterial.map = material.map;
    }
    return basicMaterial;
  };

  const setBasicMaterialTo = (node: THREE.Object3D<THREE.Event>): void => {
    const mesh = node as THREE.Mesh;
    if (!mesh.material) {
      return;
    }

    if (Array.isArray(mesh.material)) {
      for (let index = 0; index < mesh.material.length; index++) {
        mesh.material[index] = convertToBasicMaterial(mesh.material[index]);
      }
    } else {
      mesh.material = convertToBasicMaterial(mesh.material);
    }
  };

  const traverseToSetBasicMaterialFromMeshes = (
    node: THREE.Object3D<THREE.Event>
  ) => node.traverse(setBasicMaterialTo);

  class Model3DRuntimeObject3DRenderer extends gdjs.RuntimeObject3DRenderer {
    private _model3DRuntimeObject: gdjs.Model3DRuntimeObject;
    /**
     * The 3D model stretched in a 1x1x1 cube.
     */
    private _threeObject: THREE.Object3D;
    private _originalModel: THREE_ADDONS.GLTF;
    private _animationMixer: THREE.AnimationMixer;
    private _action: THREE.AnimationAction | null;

    constructor(
      runtimeObject: gdjs.Model3DRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      const originalModel = instanceContainer
        .getGame()
        .getModel3DManager()
        .getModel(runtimeObject._modelResourceName);
      const model = THREE_ADDONS.SkeletonUtils.clone(originalModel.scene);

      // Create a group to transform the object according to
      // position, angle and dimensions.
      const group = new THREE.Group();
      group.rotation.order = 'ZYX';
      group.add(model);
      super(runtimeObject, instanceContainer, group);

      this._model3DRuntimeObject = runtimeObject;
      this._threeObject = model;
      this._originalModel = originalModel;

      this.updateSize();
      this.updatePosition();
      this.updateRotation();

      this._animationMixer = new THREE.AnimationMixer(model);
      this._action = null;
    }

    updateAnimation(timeDelta: float) {
      this._animationMixer.update(timeDelta);
    }

    _updateDefaultTransformation(
      rotationX: float,
      rotationY: float,
      rotationZ: float,
      originalWidth: float,
      originalHeight: float,
      originalDepth: float,
      keepAspectRatio: boolean
    ) {
      const boundingBox = this._getModelAABB(rotationX, rotationY, rotationZ);

      // Center the model.
      this._threeObject.position.set(
        -(boundingBox.min.x + boundingBox.max.x) / 2,
        (this._threeObject.position.y =
          -(boundingBox.min.y + boundingBox.max.y) / 2),
        (this._threeObject.position.z =
          -(boundingBox.min.z + boundingBox.max.z) / 2)
      );

      // Rotate the model.
      this._threeObject.scale.set(1, 1, 1);
      this._threeObject.rotation.set(
        gdjs.toRad(rotationX),
        gdjs.toRad(rotationY),
        gdjs.toRad(rotationZ)
      );

      // Stretch the model in a 1x1x1 cube.
      const modelWidth = boundingBox.max.x - boundingBox.min.x;
      const modelHeight = boundingBox.max.y - boundingBox.min.y;
      const modelDepth = boundingBox.max.z - boundingBox.min.z;

      const scaleX = 1 / modelWidth;
      const scaleY = 1 / modelHeight;
      const scaleZ = 1 / modelDepth;

      const scaleMatrix = new THREE.Matrix4();
      scaleMatrix.makeScale(scaleX, scaleY, scaleZ);
      this._threeObject.updateMatrix();
      this._threeObject.applyMatrix4(scaleMatrix);

      if (keepAspectRatio) {
        // Reduce the object dimensions to keep aspect ratio.
        const widthRatio = originalWidth / modelWidth;
        const heightRatio = originalHeight / modelHeight;
        const depthRatio = originalDepth / modelDepth;
        const scaleRatio = Math.min(widthRatio, heightRatio, depthRatio);

        this._object._setOriginalWidth(scaleRatio * modelWidth);
        this._object._setOriginalHeight(scaleRatio * modelHeight);
        this._object._setOriginalDepth(scaleRatio * modelDepth);
      }

      this._threeObject.updateMatrix();
    }

    private _getModelAABB(
      rotationX: float,
      rotationY: float,
      rotationZ: float
    ) {
      // The original model is used because `setFromObject` is working in
      // world transformation.
      const originalModelMesh = this._originalModel.scene;

      originalModelMesh.rotation.set(
        gdjs.toRad(rotationX),
        gdjs.toRad(rotationY),
        gdjs.toRad(rotationZ)
      );

      const aabb = new THREE.Box3().setFromObject(originalModelMesh);

      // Revert changes.
      originalModelMesh.rotation.set(0, 0, 0);

      return aabb;
    }

    _updateMaterials() {
      const originalModelMesh = this._originalModel.scene;
      const modelObject3D = THREE_ADDONS.SkeletonUtils.clone(originalModelMesh);
      
      this.get3DRendererObject().remove(this._threeObject);
      this.get3DRendererObject().add(modelObject3D);
      
      this._threeObject = modelObject3D;
      this._animationMixer = new THREE.AnimationMixer(modelObject3D);
      const animationName = this._model3DRuntimeObject.getAnimationName();
      if (animationName) {
        this.playAnimation(animationName);
        if (this._model3DRuntimeObject.isAnimationPaused()) {
          this.pauseAnimation();
        }
      }

      this._replaceMaterials();
    }

    /**
     * Replace materials to better work with lights (or no light).
     */
    _replaceMaterials() {
      if (
        this._model3DRuntimeObject._materialType ===
        gdjs.Model3DRuntimeObject.MaterialType.StandardWithoutMetalness
      ) {
        traverseToRemoveMetalnessFromMeshes(this._threeObject);
      } else if (
        this._model3DRuntimeObject._materialType ===
        gdjs.Model3DRuntimeObject.MaterialType.Basic
      ) {
        traverseToSetBasicMaterialFromMeshes(this._threeObject);
      }
    }

    getAnimationCount() {
      return this._originalModel.animations.length;
    }

    getAnimationName(animationIndex: integer) {
      return this._originalModel.animations[animationIndex].name;
    }

    /**
     * Return true if animation has ended.
     * The animation had ended if:
     * - it's not configured as a loop;
     * - the current frame is the last frame;
     * - the last frame has been displayed long enough.
     */
    hasAnimationEnded(): boolean {
      if (!this._action) {
        return true;
      }
      return !this._action.isRunning();
    }

    animationPaused() {
      if (!this._action) {
        return;
      }
      return this._action.paused;
    }

    pauseAnimation() {
      if (!this._action) {
        return;
      }
      this._action.paused = true;
    }

    resumeAnimation() {
      if (!this._action) {
        return;
      }
      this._action.paused = false;
    }
    
    playAnimation(animationName: string) {
      this._animationMixer.stopAllAction();
      const clip = THREE.AnimationClip.findByName(
        this._originalModel.animations,
        animationName
      );
      this._action = this._animationMixer.clipAction(clip);
      this._action.play();
    }
  }

  export const Model3DRuntimeObjectRenderer = Model3DRuntimeObject3DRenderer;
  export type Model3DRuntimeObjectRenderer = Model3DRuntimeObject3DRenderer;
}
