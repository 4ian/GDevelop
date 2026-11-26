namespace gdjs {
  type FloatPoint3D = [float, float, float];

  const epsilon = 1 / (1 << 16);

  const removeMetalness = (material: THREE.Material): void => {
    //@ts-ignore
    if (material.metalness) {
      //@ts-ignore
      material.metalness = 0;
    }
  };

  const removeMetalnessFromMesh = (node: THREE.Object3D) => {
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

  const traverseToRemoveMetalnessFromMeshes = (node: THREE.Object3D) =>
    node.traverse(removeMetalnessFromMesh);

  const convertToBasicMaterial = (
    material: THREE.Material
  ): THREE.MeshBasicMaterial => {
    const basicMaterial = new THREE.MeshBasicMaterial();
    basicMaterial.name = material.name;
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

  const setBasicMaterialTo = (node: THREE.Object3D): void => {
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

  const traverseToSetBasicMaterialFromMeshes = (node: THREE.Object3D) =>
    node.traverse(setBasicMaterialTo);

  class Model3DRuntimeObject3DRenderer extends gdjs.RuntimeObject3DRenderer {
    private _model3DRuntimeObject: gdjs.Model3DRuntimeObject;
    /**
     * The 3D model stretched in a 1x1x1 cube.
     */
    private _threeObject: THREE.Object3D;
    private _originalModel: THREE_ADDONS.GLTF;
    private _animationMixer: THREE.AnimationMixer;
    private _action: THREE.AnimationAction | null;
    /**
     * The materials owned by this object (copies of the materials of the
     * model, configured with PBR settings). They are disposed when the model
     * is rebuilt or when the object is destroyed, to avoid leaking GPU
     * memory.
     */
    private _ownedMaterials = new Set<THREE.Material>();

    /**
     * The model origin evaluated according to the object configuration.
     *
     * Coordinates are between 0 and 1.
     */
    private _modelOriginPoint: FloatPoint3D;

    constructor(
      runtimeObject: gdjs.Model3DRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      // GLB files with skeleton must not have any transformation to work properly.
      const originalModel = instanceContainer
        .getGame()
        .getModel3DManager()
        .getModel(runtimeObject._modelResourceName);
      // _updateModel will actually add a clone of the model.
      const model = new THREE.Group();

      // Create a group to transform the object according to
      // position, angle and dimensions.
      const group = new THREE.Group();
      group.rotation.order = 'ZYX';
      group.add(model);
      super(runtimeObject, instanceContainer, group);

      this._model3DRuntimeObject = runtimeObject;
      this._threeObject = model;
      this._originalModel = originalModel;
      this._modelOriginPoint = [0, 0, 0];

      this.updateSize();
      this.updatePosition();
      this.updateRotation();

      this._animationMixer = new THREE.AnimationMixer(model);
      this._action = null;
      // Dispose the materials owned by this object when it is destroyed.
      runtimeObject.registerDestroyCallback(() =>
        this._disposeOwnedMaterials()
      );
    }

    private _disposeOwnedMaterials() {
      const pbrMaterialManager = this._model3DRuntimeObject
        .getInstanceContainer()
        .getGame()
        .getPBRMaterialManager();
      for (const material of this._ownedMaterials) {
        pbrMaterialManager.disposeUniqueMaterial(material);
      }
      this._ownedMaterials.clear();
    }

    updateAnimation(timeDelta: float) {
      this._animationMixer.update(timeDelta);
    }

    override updatePosition() {
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

    getOriginPoint(): FloatPoint3D {
      //@ts-ignore
      const point: FloatPoint3D = gdjs.staticArray(
        Model3DRuntimeObject3DRenderer.prototype.getOriginPoint
      );
      const originPoint = this._model3DRuntimeObject._originPoint;
      point[0] =
        originPoint[0] === null ? this._modelOriginPoint[0] : originPoint[0];
      point[1] =
        originPoint[1] === null ? this._modelOriginPoint[1] : originPoint[1];
      point[2] =
        originPoint[2] === null ? this._modelOriginPoint[2] : originPoint[2];
      return point;
    }

    getCenterPoint(): FloatPoint3D {
      //@ts-ignore
      const point: FloatPoint3D = gdjs.staticArray(
        Model3DRuntimeObject3DRenderer.prototype.getCenterPoint
      );
      const centerPoint = this._model3DRuntimeObject._centerPoint;
      point[0] =
        centerPoint[0] === null ? this._modelOriginPoint[0] : centerPoint[0];
      point[1] =
        centerPoint[1] === null ? this._modelOriginPoint[1] : centerPoint[1];
      point[2] =
        centerPoint[2] === null ? this._modelOriginPoint[2] : centerPoint[2];
      return point;
    }

    /**
     * Transform `threeObject` to fit in a 1x1x1 cube.
     *
     * When the object change of size, rotation or position,
     * the transformation is done on the parent of `threeObject`.
     *
     * This function doesn't mutate anything outside of `threeObject`.
     */
    stretchModelIntoUnitaryCube(
      threeObject: THREE.Object3D,
      rotationX: float,
      rotationY: float,
      rotationZ: float
    ): THREE.Box3 {
      // These formulas are also used in:
      // - Model3DEditor.modelSize
      // - Model3DRendered2DInstance
      threeObject.rotation.set(
        gdjs.toRad(rotationX),
        gdjs.toRad(rotationY),
        gdjs.toRad(rotationZ)
      );
      threeObject.updateMatrixWorld(true);
      const boundingBox = new THREE.Box3().setFromObject(threeObject);

      const shouldKeepModelOrigin =
        this._model3DRuntimeObject._originPoint[0] === null ||
        this._model3DRuntimeObject._originPoint[1] === null ||
        this._model3DRuntimeObject._originPoint[2] === null;
      if (shouldKeepModelOrigin) {
        // Keep the origin as part of the model.
        // For instance, a model can be 1 face of a cube and we want to keep the
        // inside as part of the object even if it's just void.
        // It also avoids to have the origin outside of the object box.
        boundingBox.expandByPoint(
          new THREE.Vector3(
            this._model3DRuntimeObject._originPoint[0] === null
              ? 0
              : boundingBox.min[0],
            this._model3DRuntimeObject._originPoint[1] === null
              ? 0
              : boundingBox.min[1],
            this._model3DRuntimeObject._originPoint[2] === null
              ? 0
              : boundingBox.min[2]
          )
        );
      }
      const modelWidth = boundingBox.max.x - boundingBox.min.x;
      const modelHeight = boundingBox.max.y - boundingBox.min.y;
      const modelDepth = boundingBox.max.z - boundingBox.min.z;

      // Center the model.
      const centerPoint = this._model3DRuntimeObject._centerPoint;
      if (centerPoint[0] !== null) {
        threeObject.position.x = -(
          boundingBox.min.x +
          modelWidth * centerPoint[0]
        );
      }
      if (centerPoint[1] !== null) {
        // The model is flipped on Y axis.
        threeObject.position.y = -(
          boundingBox.min.y +
          modelHeight * (1 - centerPoint[1])
        );
      }
      if (centerPoint[2] !== null) {
        threeObject.position.z = -(
          boundingBox.min.z +
          modelDepth * centerPoint[2]
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
      const scaleX = modelWidth < epsilon ? 1 : 1 / modelWidth;
      const scaleY = modelHeight < epsilon ? 1 : 1 / modelHeight;
      const scaleZ = modelDepth < epsilon ? 1 : 1 / modelDepth;

      const scaleMatrix = new THREE.Matrix4();
      // Flip on Y because the Y axis is on the opposite side of direct basis.
      // It avoids models to be like a mirror refection.
      scaleMatrix.makeScale(scaleX, -scaleY, scaleZ);
      threeObject.updateMatrix();
      threeObject.applyMatrix4(scaleMatrix);

      return boundingBox;
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
      const boundingBox = this.stretchModelIntoUnitaryCube(
        threeObject,
        rotationX,
        rotationY,
        rotationZ
      );
      const modelWidth = boundingBox.max.x - boundingBox.min.x;
      const modelHeight = boundingBox.max.y - boundingBox.min.y;
      const modelDepth = boundingBox.max.z - boundingBox.min.z;

      this._modelOriginPoint[0] =
        modelWidth < epsilon ? 0 : -boundingBox.min.x / modelWidth;
      this._modelOriginPoint[1] =
        modelHeight < epsilon ? 0 : -boundingBox.min.y / modelHeight;
      this._modelOriginPoint[2] =
        modelDepth < epsilon ? 0 : -boundingBox.min.z / modelDepth;

      // The model is flipped on Y axis.
      this._modelOriginPoint[1] = 1 - this._modelOriginPoint[1];

      if (keepAspectRatio) {
        // Reduce the object dimensions to keep aspect ratio.
        const widthRatio =
          modelWidth < epsilon
            ? Number.POSITIVE_INFINITY
            : originalWidth / modelWidth;
        const heightRatio =
          modelHeight < epsilon
            ? Number.POSITIVE_INFINITY
            : originalHeight / modelHeight;
        const depthRatio =
          modelDepth < epsilon
            ? Number.POSITIVE_INFINITY
            : originalDepth / modelDepth;
        let scaleRatio = Math.min(widthRatio, heightRatio, depthRatio);
        if (!Number.isFinite(scaleRatio)) {
          scaleRatio = 1;
        }

        this._object._setOriginalWidth(scaleRatio * modelWidth);
        this._object._setOriginalHeight(scaleRatio * modelHeight);
        this._object._setOriginalDepth(scaleRatio * modelDepth);
      } else {
        this._object._setOriginalWidth(originalWidth);
        this._object._setOriginalHeight(originalHeight);
        this._object._setOriginalDepth(originalDepth);
      }
    }

    /**
     * `_updateModel` should always be called after this method.
     * Ideally, use `Model3DRuntimeObject#_reloadModel` instead.
     */
    _reloadModel(
      runtimeObject: Model3DRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._originalModel = instanceContainer
        .getGame()
        .getModel3DManager()
        .getModel(runtimeObject._modelResourceName);
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

      // Dispose the materials owned for the previous model.
      this._disposeOwnedMaterials();

      // This group hold the rotation defined by properties.
      const threeObject = new THREE.Group();
      threeObject.rotation.order = 'ZYX';
      const root = THREE_ADDONS.SkeletonUtils.clone(this._originalModel.scene);
      threeObject.add(root);

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
      this.updatePosition();
      this._updateShadow();

      // Start the current animation on the new 3D object.
      this._animationMixer = new THREE.AnimationMixer(root);
      const isAnimationPaused = this._model3DRuntimeObject.isAnimationPaused();
      this._model3DRuntimeObject.setAnimationIndex(
        this._model3DRuntimeObject.getAnimationIndex()
      );
      if (isAnimationPaused) {
        this.pauseAnimation();
      }
    }

    /**
     * Replace materials to better work with lights (or no light), or to
     * apply the PBR settings configured on the object.
     */
    private _replaceMaterials(threeObject: THREE.Object3D) {
      const pbrConfig = this._model3DRuntimeObject.getPBRConfig();
      if (pbrConfig && pbrConfig.enabled !== false) {
        this._applyPBRMaterials(threeObject, pbrConfig, '');
        return;
      }
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

    private _getPBRMaterialManager(): gdjs.PBRMaterialManager {
      return this._model3DRuntimeObject
        .getInstanceContainer()
        .getGame()
        .getPBRMaterialManager();
    }

    private _getPBRMaterialOptions(material: THREE.Material) {
      const pbrConfig = this._model3DRuntimeObject.getPBRConfig();
      return {
        materialType: (pbrConfig && pbrConfig.material === 'physical'
          ? 'physical'
          : 'standard') as gdjs.PBRMaterialType,
        vertexColors: material.vertexColors,
      };
    }

    /**
     * Give a PBR material to every mesh of the model (copied from the
     * material of the model and configured with the PBR settings of the
     * object and of the mesh).
     *
     * @param meshName The name of the mesh to configure, or '' for all of
     * them.
     */
    private _applyPBRMaterials(
      threeObject: THREE.Object3D,
      pbrConfig: gdjs.PBRConfig,
      meshName: string
    ) {
      const pbrMaterialManager = this._getPBRMaterialManager();
      threeObject.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (!mesh.material) {
          return;
        }
        if (meshName && mesh.name !== meshName) {
          return;
        }
        const settings = gdjs.pbrconfig.getSettingsForTarget(
          pbrConfig,
          mesh.name || ''
        );
        const isArray = Array.isArray(mesh.material);
        const materials: THREE.Material[] = isArray
          ? (mesh.material as THREE.Material[])
          : [mesh.material as THREE.Material];
        const newMaterials = materials.map((material) => {
          // Always work on a copy: the materials of the model are shared with
          // the other instances and with the model manager cache.
          const isOwned = this._ownedMaterials.has(material);
          const target = isOwned
            ? material
            : pbrMaterialManager.makeUniqueMaterialCopy(material);
          const newMaterial = pbrMaterialManager.configureMaterial(
            target,
            settings,
            this._getPBRMaterialOptions(material)
          );
          if (newMaterial !== target) {
            // The material type had to change (e.g. for the glass preset).
            this._ownedMaterials.delete(target);
            pbrMaterialManager.disposeUniqueMaterial(target);
          }
          this._ownedMaterials.add(newMaterial);
          return newMaterial;
        });
        mesh.material = isArray
          ? (newMaterials as THREE.Material[])
          : newMaterials[0];
      });
    }

    /**
     * To be called when the PBR configuration of the object changed (after
     * being changed by events).
     *
     * @param meshName The name of the mesh to update, or '' for all of them.
     */
    onPBRConfigChanged(meshName: string) {
      const pbrConfig = this._model3DRuntimeObject.getPBRConfig();
      if (!pbrConfig || pbrConfig.enabled === false) {
        return;
      }
      this._applyPBRMaterials(this._threeObject, pbrConfig, meshName);
    }

    private _getTargetMaterial(targetName: string): THREE.Material | null {
      let foundMaterial: THREE.Material | null = null;
      this._threeObject.traverse((node) => {
        if (foundMaterial) return;
        const mesh = node as THREE.Mesh;
        if (!mesh.material) return;
        if (targetName && mesh.name !== targetName) return;
        foundMaterial = Array.isArray(mesh.material)
          ? mesh.material[0]
          : mesh.material;
      });
      return foundMaterial;
    }

    getPBRFloatValue(
      targetName: string,
      property: gdjs.PBRFloatPropertyName
    ): float {
      const material = this._getTargetMaterial(targetName);
      return material
        ? this._getPBRMaterialManager().getFloatProperty(material, property)
        : 0;
    }

    getPBRColorValue(
      targetName: string,
      property: gdjs.PBRColorPropertyName
    ): string {
      const material = this._getTargetMaterial(targetName);
      return material
        ? this._getPBRMaterialManager().getColorProperty(material, property)
        : '255;255;255';
    }

    getPBRTextureSlotName(
      targetName: string,
      slot: gdjs.PBRTextureSlotName
    ): string {
      const material = this._getTargetMaterial(targetName);
      return material
        ? this._getPBRMaterialManager().getTextureSlotName(material, slot)
        : '';
    }

    getPBRBooleanValue(
      targetName: string,
      property: gdjs.PBRBooleanPropertyName
    ): boolean {
      const material = this._getTargetMaterial(targetName);
      return material
        ? this._getPBRMaterialManager().getBooleanProperty(material, property)
        : false;
    }

    getPBRUvTransformValue(
      targetName: string,
      slot: gdjs.PBRTextureSlotName,
      property: gdjs.PBRUvTransformPropertyName
    ): float {
      const material = this._getTargetMaterial(targetName);
      if (!material) return 0;
      return (
        this._getPBRMaterialManager().getUvTransform(material, slot)[
          property
        ] || 0
      );
    }

    getAnimationCount() {
      return this._originalModel.animations.length;
    }

    getAnimationName(animationIndex: integer) {
      return this._originalModel.animations[animationIndex].name;
    }

    _updateShadow() {
      this._threeObject.traverse((child) => {
        child.castShadow = this._model3DRuntimeObject._isCastingShadow;
        child.receiveShadow = this._model3DRuntimeObject._isReceivingShadow;
      });
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

    playAnimation(
      animationName: string,
      shouldLoop: boolean,
      ignoreCrossFade: boolean = false
    ) {
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
      const previousAction = this._action;
      this._action = this._animationMixer.clipAction(clip);
      // Reset the animation and play it from the start.
      // `clipAction` always gives back the same action for a given animation
      // and its likely to be in a finished or at least started state.
      this._action.reset();
      this._action.setLoop(
        shouldLoop ? THREE.LoopRepeat : THREE.LoopOnce,
        Number.POSITIVE_INFINITY
      );
      this._action.clampWhenFinished = true;
      this._action.timeScale =
        this._model3DRuntimeObject.getAnimationSpeedScale();

      if (
        previousAction &&
        previousAction !== this._action &&
        !ignoreCrossFade
      ) {
        this._action.crossFadeFrom(
          previousAction,
          this._model3DRuntimeObject._crossfadeDuration,
          false
        );
      }
      this._action.play();
      // Make sure the first frame is displayed.
      this._animationMixer.update(0);
    }

    getAnimationElapsedTime(): float {
      return this._action ? this._action.time : 0;
    }

    setAnimationElapsedTime(time: float): void {
      if (this._action) {
        this._action.time = time;
      }
    }

    setAnimationTimeScale(timeScale: float): void {
      if (this._action) {
        this._action.timeScale = timeScale;
      }
    }

    getAnimationDuration(animationName: string): float {
      const clip = THREE.AnimationClip.findByName(
        this._originalModel.animations,
        animationName
      );
      return clip ? clip.duration : 0;
    }
  }

  /** @category Renderers > 3D Model */
  export const Model3DRuntimeObjectRenderer = Model3DRuntimeObject3DRenderer;
  /** @category Renderers > 3D Model */
  export type Model3DRuntimeObjectRenderer = Model3DRuntimeObject3DRenderer;
}
