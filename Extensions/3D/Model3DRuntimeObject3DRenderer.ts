namespace gdjs {

  type FloatPoint3D = [float, float, float];

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

    private _modelOriginPoint: FloatPoint3D = [0, 0, 0];

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

    updatePosition() {
      const originPoint = this.getOriginPoint();
      const centerPoint = this.getCenterPoint();
      this.get3DRendererObject().position.set(
        this._object.getX() -
          this._object.getWidth() * (originPoint[0] - centerPoint[0]),
        this._object.getY() -
          this._object.getHeight() * (originPoint[1] - centerPoint[1]),
        this._object.getZ() -
          this._object.getDepth() * (originPoint[2] - centerPoint[2])
      );
    }

    getOriginPoint() {
      return this._model3DRuntimeObject._originPoint || this._modelOriginPoint;
    }

    getCenterPoint() {
      return this._model3DRuntimeObject._centerPoint || this._modelOriginPoint;
    }

    private _updateDefaultTransformation(
      threeObject: THREE.Object3D,
      rotationX: float,
      rotationY: float,
      rotationZ: float,
      originalWidth: float,
      originalHeight: float,
      originalDepth: float,
      keepAspectRatio: boolean
    ) {
      const boundingBox = this._getModelAABB(rotationX, rotationY, rotationZ);

      const modelWidth = boundingBox.max.x - boundingBox.min.x;
      const modelHeight = boundingBox.max.y - boundingBox.min.y;
      const modelDepth = boundingBox.max.z - boundingBox.min.z;
      this._modelOriginPoint[0] = -boundingBox.min.x / modelWidth;
      this._modelOriginPoint[1] = -boundingBox.min.y / modelHeight;
      this._modelOriginPoint[2] = -boundingBox.min.z / modelDepth;

      // Flip the model origin on Y axis.
      const center = this.getCenterPoint();
      this._modelOriginPoint[1] = center[1] - (this._modelOriginPoint[1] - center[1]);

      // Center the model.
      const centerPoint = this._model3DRuntimeObject._centerPoint;
      if (centerPoint) {
        threeObject.position.set(
          -(
            boundingBox.min.x +
            (boundingBox.max.x - boundingBox.min.x) * centerPoint[0]
          ),
          -(
            boundingBox.min.y +
            (boundingBox.max.y - boundingBox.min.y) * centerPoint[1]
          ),
          -(
            boundingBox.min.z +
            (boundingBox.max.z - boundingBox.min.z) * centerPoint[2]
          )
        );
      }

      // Rotate the model.
      threeObject.scale.set(1, 1, 1);
      threeObject.rotation.set(
        gdjs.toRad(rotationX),
        gdjs.toRad(rotationY),
        gdjs.toRad(rotationZ)
      );

      // Stretch the model in a 1x1x1 cube.
      const scaleX = 1 / modelWidth;
      const scaleY = 1 / modelHeight;
      const scaleZ = 1 / modelDepth;

      const scaleMatrix = new THREE.Matrix4();
      // Flip on Y because the Y axis is on the opposite side of direct basis.
      // It avoids models to be like a mirror refection.
      scaleMatrix.makeScale(scaleX, -scaleY, scaleZ);
      threeObject.updateMatrix();
      threeObject.applyMatrix4(scaleMatrix);

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

      threeObject.updateMatrix();
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

    _updateModel(
      rotationX: float,
      rotationY: float,
      rotationZ: float,
      originalWidth: float,
      originalHeight: float,
      originalDepth: float,
      keepAspectRatio: boolean
    ) {
      // Start from the original model because:
      // - _replaceMaterials is destructive
      // - _updateDefaultTransformation may need to work with meshes in local space
      const originalModelMesh = this._originalModel.scene;
      const threeObject = THREE_ADDONS.SkeletonUtils.clone(originalModelMesh);

      this._replaceMaterials(threeObject);

      this._updateDefaultTransformation(
        threeObject,
        rotationX,
        rotationY,
        rotationZ,
        originalWidth,
        originalHeight,
        originalDepth,
        keepAspectRatio
      );

      // Replace the 3D object.
      this.get3DRendererObject().remove(this._threeObject);
      this.get3DRendererObject().add(threeObject);
      this._threeObject = threeObject;

      // Start the current animation on the new 3D object.
      this._animationMixer = new THREE.AnimationMixer(threeObject);
      const isAnimationPaused = this._model3DRuntimeObject.isAnimationPaused();
      this._model3DRuntimeObject.setAnimationIndex(
        this._model3DRuntimeObject.getAnimationIndex()
      );
      if (isAnimationPaused) {
        this.pauseAnimation();
      }
    }

    /**
     * Replace materials to better work with lights (or no light).
     */
    private _replaceMaterials(threeObject: THREE.Object3D) {
      if (
        this._model3DRuntimeObject._materialType ===
        gdjs.Model3DRuntimeObject.MaterialType.StandardWithoutMetalness
      ) {
        traverseToRemoveMetalnessFromMeshes(threeObject);
      } else if (
        this._model3DRuntimeObject._materialType ===
        gdjs.Model3DRuntimeObject.MaterialType.Basic
      ) {
        traverseToSetBasicMaterialFromMeshes(threeObject);
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

    playAnimation(animationName: string, shouldLoop: boolean) {
      this._animationMixer.stopAllAction();
      const clip = THREE.AnimationClip.findByName(
        this._originalModel.animations,
        animationName
      );
      if (!clip) {
        console.error(
          `The GLB file: ${this._model3DRuntimeObject._modelResourceName} doesn't have any animation named: ${animationName}`
        );
        return;
      }
      this._action = this._animationMixer.clipAction(clip);
      this._action.setLoop(
        shouldLoop ? THREE.LoopRepeat : THREE.LoopOnce,
        Number.POSITIVE_INFINITY
      );
      this._action.clampWhenFinished = true;
      this._action.play();
    }
  }

  export const Model3DRuntimeObjectRenderer = Model3DRuntimeObject3DRenderer;
  export type Model3DRuntimeObjectRenderer = Model3DRuntimeObject3DRenderer;
}
