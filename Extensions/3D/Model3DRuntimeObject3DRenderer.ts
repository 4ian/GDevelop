namespace gdjs {
  type FloatPoint3D = [float, float, float];

  /** @internal */
  export type Model3DBonePose = {
    positionX: float;
    positionY: float;
    positionZ: float;
    quaternionX: float;
    quaternionY: float;
    quaternionZ: float;
    quaternionW: float;
  };

  /** @internal Generation-checked access to selected bones for spring dynamics. */
  export type Model3DSpringBoneDynamicsBinding = {
    generation: number;
    chains: THREE.Bone[][];
    flatBones: THREE.Bone[];
    bonesByCanonicalName: Map<string, THREE.Bone>;
  };

  type RigBoneDescription = {
    name: string;
    parentName: string;
    bindMatrix: number[];
  };

  const epsilon = 1 / (1 << 16);
  const rigTransformEpsilon = 1 / (1 << 12);

  const getNearestParentBone = (bone: THREE.Bone): THREE.Bone | null => {
    let parent = bone.parent;
    while (parent) {
      const parentBone = parent as THREE.Bone;
      if (parentBone.isBone) {
        return parentBone;
      }
      parent = parent.parent;
    }
    return null;
  };

  const getRigDescription = (
    root: THREE.Object3D
  ): RigBoneDescription[] | null => {
    root.updateMatrixWorld(true);
    const bones: THREE.Bone[] = [];
    root.traverse((node) => {
      const bone = node as THREE.Bone;
      if (bone.isBone) {
        bones.push(bone);
      }
    });
    if (bones.length === 0) {
      return null;
    }

    const boneNames = new Set<string>();
    const rootInverseMatrix = new THREE.Matrix4()
      .copy(root.matrixWorld)
      .invert();
    const descriptions: RigBoneDescription[] = [];
    for (const bone of bones) {
      if (!bone.name || boneNames.has(bone.name)) {
        return null;
      }
      boneNames.add(bone.name);

      const parentBone = getNearestParentBone(bone);
      const parentInverseMatrix = parentBone
        ? new THREE.Matrix4().copy(parentBone.matrixWorld).invert()
        : rootInverseMatrix;
      const bindMatrix = new THREE.Matrix4()
        .multiplyMatrices(parentInverseMatrix, bone.matrixWorld)
        .elements.slice();
      descriptions.push({
        name: bone.name,
        parentName: parentBone ? parentBone.name : '',
        bindMatrix,
      });
    }
    descriptions.sort((left, right) => left.name.localeCompare(right.name));
    return descriptions;
  };

  const doModelsHaveExactMatchingRigs = (
    targetModel: THREE_ADDONS.GLTF,
    sourceModel: THREE_ADDONS.GLTF
  ): boolean => {
    const targetRig = getRigDescription(targetModel.scene);
    const sourceRig = getRigDescription(sourceModel.scene);
    if (!targetRig || !sourceRig || targetRig.length !== sourceRig.length) {
      return false;
    }

    for (let boneIndex = 0; boneIndex < targetRig.length; boneIndex++) {
      const targetBone = targetRig[boneIndex];
      const sourceBone = sourceRig[boneIndex];
      if (
        targetBone.name !== sourceBone.name ||
        targetBone.parentName !== sourceBone.parentName
      ) {
        return false;
      }
      for (
        let matrixIndex = 0;
        matrixIndex < targetBone.bindMatrix.length;
        matrixIndex++
      ) {
        if (
          Math.abs(
            targetBone.bindMatrix[matrixIndex] -
              sourceBone.bindMatrix[matrixIndex]
          ) > rigTransformEpsilon
        ) {
          return false;
        }
      }
    }
    return true;
  };

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

  /**
   * Extract the closest right-handed rotation from a matrix while discarding
   * scale, reflections and shear.
   *
   * The implementation computes an SVD through a Jacobi eigendecomposition of
   * A^T A. When A contains a reflection, the singular axis with the smallest
   * magnitude is flipped, which gives the closest proper rotation.
   *
   * All temporary values are owned by the extractor so calls don't allocate.
   *
   * @internal
   */
  export class Model3DScaleFreeRotationExtractor {
    private _symmetricMatrix = new Float64Array(9);
    private _eigenvectors = new Float64Array(9);
    private _singularValues = new Float64Array(3);
    private _leftSingularVectors = new Float64Array(9);
    private _properRotation = new Float64Array(9);
    private _rotationMatrix = new THREE.Matrix4();
    private _fallbackX = new THREE.Vector3();
    private _fallbackY = new THREE.Vector3();
    private _fallbackZ = new THREE.Vector3();

    setQuaternionFromMatrix(
      matrix: THREE.Matrix4,
      result: THREE.Quaternion
    ): boolean {
      const elements = matrix.elements;
      const a00 = elements[0];
      const a01 = elements[4];
      const a02 = elements[8];
      const a10 = elements[1];
      const a11 = elements[5];
      const a12 = elements[9];
      const a20 = elements[2];
      const a21 = elements[6];
      const a22 = elements[10];

      const determinant =
        a00 * (a11 * a22 - a12 * a21) -
        a01 * (a10 * a22 - a12 * a20) +
        a02 * (a10 * a21 - a11 * a20);
      if (!Number.isFinite(determinant)) {
        return false;
      }

      const symmetric = this._symmetricMatrix;
      symmetric[0] = a00 * a00 + a10 * a10 + a20 * a20;
      symmetric[1] = a00 * a01 + a10 * a11 + a20 * a21;
      symmetric[2] = a00 * a02 + a10 * a12 + a20 * a22;
      symmetric[3] = symmetric[1];
      symmetric[4] = a01 * a01 + a11 * a11 + a21 * a21;
      symmetric[5] = a01 * a02 + a11 * a12 + a21 * a22;
      symmetric[6] = symmetric[2];
      symmetric[7] = symmetric[5];
      symmetric[8] = a02 * a02 + a12 * a12 + a22 * a22;

      const eigenvectors = this._eigenvectors;
      eigenvectors[0] = 1;
      eigenvectors[1] = 0;
      eigenvectors[2] = 0;
      eigenvectors[3] = 0;
      eigenvectors[4] = 1;
      eigenvectors[5] = 0;
      eigenvectors[6] = 0;
      eigenvectors[7] = 0;
      eigenvectors[8] = 1;

      // A symmetric 3x3 matrix converges in a few Jacobi rotations. Using a
      // fixed upper bound makes the result deterministic across frames.
      for (let iteration = 0; iteration < 16; iteration++) {
        let p = 0;
        let q = 1;
        let largest = Math.abs(symmetric[1]);
        const absolute02 = Math.abs(symmetric[2]);
        if (absolute02 > largest) {
          p = 0;
          q = 2;
          largest = absolute02;
        }
        const absolute12 = Math.abs(symmetric[5]);
        if (absolute12 > largest) {
          p = 1;
          q = 2;
          largest = absolute12;
        }
        if (largest <= 1e-12) {
          break;
        }

        const pp = p * 3 + p;
        const qq = q * 3 + q;
        const pq = p * 3 + q;
        const app = symmetric[pp];
        const aqq = symmetric[qq];
        const apq = symmetric[pq];
        const tau = (aqq - app) / (2 * apq);
        const tangent =
          tau >= 0
            ? 1 / (tau + Math.sqrt(1 + tau * tau))
            : -1 / (-tau + Math.sqrt(1 + tau * tau));
        const cosine = 1 / Math.sqrt(1 + tangent * tangent);
        const sine = tangent * cosine;

        for (let index = 0; index < 3; index++) {
          if (index === p || index === q) continue;
          const indexP = index * 3 + p;
          const indexQ = index * 3 + q;
          const valueP = symmetric[indexP];
          const valueQ = symmetric[indexQ];
          const newValueP = cosine * valueP - sine * valueQ;
          const newValueQ = sine * valueP + cosine * valueQ;
          symmetric[indexP] = newValueP;
          symmetric[p * 3 + index] = newValueP;
          symmetric[indexQ] = newValueQ;
          symmetric[q * 3 + index] = newValueQ;
        }
        symmetric[pp] =
          cosine * cosine * app - 2 * sine * cosine * apq + sine * sine * aqq;
        symmetric[qq] =
          sine * sine * app + 2 * sine * cosine * apq + cosine * cosine * aqq;
        symmetric[pq] = 0;
        symmetric[q * 3 + p] = 0;

        for (let row = 0; row < 3; row++) {
          const rowP = row * 3 + p;
          const rowQ = row * 3 + q;
          const valueP = eigenvectors[rowP];
          const valueQ = eigenvectors[rowQ];
          eigenvectors[rowP] = cosine * valueP - sine * valueQ;
          eigenvectors[rowQ] = sine * valueP + cosine * valueQ;
        }
      }

      const singularValues = this._singularValues;
      let smallestSingularValueIndex = 0;
      for (let index = 0; index < 3; index++) {
        const squaredValue = Math.max(0, symmetric[index * 3 + index]);
        singularValues[index] = Math.sqrt(squaredValue);
        if (
          singularValues[index] < singularValues[smallestSingularValueIndex]
        ) {
          smallestSingularValueIndex = index;
        }
      }

      if (
        Math.abs(determinant) <= 1e-12 ||
        singularValues[smallestSingularValueIndex] <= 1e-10
      ) {
        return this._setQuaternionFromDegenerateMatrix(matrix, result);
      }

      const leftSingularVectors = this._leftSingularVectors;
      for (let column = 0; column < 3; column++) {
        const v0 = eigenvectors[column];
        const v1 = eigenvectors[3 + column];
        const v2 = eigenvectors[6 + column];
        const inverseSingularValue = 1 / singularValues[column];
        leftSingularVectors[column] =
          (a00 * v0 + a01 * v1 + a02 * v2) * inverseSingularValue;
        leftSingularVectors[3 + column] =
          (a10 * v0 + a11 * v1 + a12 * v2) * inverseSingularValue;
        leftSingularVectors[6 + column] =
          (a20 * v0 + a21 * v1 + a22 * v2) * inverseSingularValue;
      }

      const reflectionAxis = determinant < 0 ? smallestSingularValueIndex : -1;
      const rotation = this._properRotation;
      for (let row = 0; row < 3; row++) {
        for (let column = 0; column < 3; column++) {
          let value = 0;
          for (let axis = 0; axis < 3; axis++) {
            value +=
              leftSingularVectors[row * 3 + axis] *
              (axis === reflectionAxis ? -1 : 1) *
              eigenvectors[column * 3 + axis];
          }
          rotation[row * 3 + column] = value;
        }
      }

      this._rotationMatrix.set(
        rotation[0],
        rotation[1],
        rotation[2],
        0,
        rotation[3],
        rotation[4],
        rotation[5],
        0,
        rotation[6],
        rotation[7],
        rotation[8],
        0,
        0,
        0,
        0,
        1
      );
      result.setFromRotationMatrix(this._rotationMatrix).normalize();
      return (
        Number.isFinite(result.x) &&
        Number.isFinite(result.y) &&
        Number.isFinite(result.z) &&
        Number.isFinite(result.w)
      );
    }

    private _setQuaternionFromDegenerateMatrix(
      matrix: THREE.Matrix4,
      result: THREE.Quaternion
    ): boolean {
      const elements = matrix.elements;
      const x = this._fallbackX.set(elements[0], elements[1], elements[2]);
      const y = this._fallbackY.set(elements[4], elements[5], elements[6]);
      const z = this._fallbackZ.set(elements[8], elements[9], elements[10]);

      if (x.lengthSq() <= 1e-20) {
        if (y.lengthSq() > 1e-20) x.copy(y);
        else if (z.lengthSq() > 1e-20) x.copy(z);
        else return false;
      }
      x.normalize();

      y.addScaledVector(x, -y.dot(x));
      if (y.lengthSq() <= 1e-20) {
        y.copy(z).addScaledVector(x, -z.dot(x));
      }
      if (y.lengthSq() <= 1e-20) {
        if (Math.abs(x.x) <= Math.abs(x.y) && Math.abs(x.x) <= Math.abs(x.z)) {
          y.set(0, -x.z, x.y);
        } else if (Math.abs(x.y) <= Math.abs(x.z)) {
          y.set(-x.z, 0, x.x);
        } else {
          y.set(-x.y, x.x, 0);
        }
      }
      y.normalize();
      z.crossVectors(x, y).normalize();

      this._rotationMatrix.set(
        x.x,
        y.x,
        z.x,
        0,
        x.y,
        y.y,
        z.y,
        0,
        x.z,
        y.z,
        z.z,
        0,
        0,
        0,
        0,
        1
      );
      result.setFromRotationMatrix(this._rotationMatrix).normalize();
      return true;
    }
  }

  class Model3DRuntimeObject3DRenderer extends gdjs.RuntimeObject3DRenderer {
    private _model3DRuntimeObject: gdjs.Model3DRuntimeObject;
    /**
     * The 3D model stretched in a 1x1x1 cube.
     */
    private _threeObject: THREE.Object3D;
    /** The current cloned GLTF scene posed by the animation mixer. */
    private _clonedModelRoot: THREE.Object3D | null = null;
    private _bonesByCanonicalName = new Map<string, THREE.Bone>();
    private _ambiguousBoneNames = new Set<string>();
    private _modelGeneration = 0;
    private _relativeInverseMatrix = new THREE.Matrix4();
    private _boneRelativeMatrix = new THREE.Matrix4();
    private _boneQuaternion = new THREE.Quaternion();
    private _modelCoordinateSystemInverseMatrix = new THREE.Matrix4();
    private _modelRotationEuler = new THREE.Euler(0, 0, 0, 'ZYX');
    private _modelYAxisReflectionMatrix = new THREE.Matrix4().makeScale(
      1,
      -1,
      1
    );
    private _scaleFreeRotationExtractor =
      new gdjs.Model3DScaleFreeRotationExtractor();
    private _springBonePosition = new THREE.Vector3();
    private _springBoneChildPosition = new THREE.Vector3();
    private _springBoneCurrentDirection = new THREE.Vector3();
    private _springBoneTargetDirection = new THREE.Vector3();
    private _springBoneParentQuaternion = new THREE.Quaternion();
    private _springBoneParentInverseQuaternion = new THREE.Quaternion();
    private _springBoneWorldDeltaQuaternion = new THREE.Quaternion();
    private _springBoneLocalDeltaQuaternion = new THREE.Quaternion();
    private _springBoneAnimationQuaternion = new THREE.Quaternion();
    private _springBoneTargetQuaternion = new THREE.Quaternion();
    private _originalModel: THREE_ADDONS.GLTF;
    private _animationMixer: THREE.AnimationMixer;
    private _action: THREE.AnimationAction | null;
    private _model3DManager: gdjs.Model3DManager;
    private _sharedAnimationModelCompatibility = new Map<string, boolean>();
    private _animationClipsWithoutRootMotion = new WeakMap<
      THREE.AnimationClip,
      THREE.AnimationClip
    >();
    private _rootMotionTrackTargetNames = new WeakMap<
      THREE.Object3D,
      Set<string>
    >();

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
      const model3DManager = instanceContainer.getGame().getModel3DManager();
      const originalModel = model3DManager.getModel(
        runtimeObject._modelResourceName
      );
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
      this._model3DManager = model3DManager;
      this._modelOriginPoint = [0, 0, 0];

      this.updateSize();
      this.updatePosition();
      this.updateRotation();

      this._animationMixer = new THREE.AnimationMixer(model);
      this._action = null;
    }

    private _rebuildBoneCache(root: THREE.Object3D): void {
      this._clonedModelRoot = root;
      this._bonesByCanonicalName.clear();
      this._ambiguousBoneNames.clear();
      root.traverse((node) => {
        const bone = node as THREE.Bone;
        if (!bone.isBone) return;
        const authoredName =
          bone.userData && typeof bone.userData.name === 'string'
            ? bone.userData.name
            : '';
        const canonicalName = authoredName || bone.name;
        if (!canonicalName || this._ambiguousBoneNames.has(canonicalName)) {
          return;
        }
        if (this._bonesByCanonicalName.has(canonicalName)) {
          this._bonesByCanonicalName.delete(canonicalName);
          this._ambiguousBoneNames.add(canonicalName);
          return;
        }
        this._bonesByCanonicalName.set(canonicalName, bone);
      });
    }

    hasBone(boneName: string): boolean {
      return this._bonesByCanonicalName.has(boneName);
    }

    isBoneNameAmbiguous(boneName: string): boolean {
      return this._ambiguousBoneNames.has(boneName);
    }

    getBonePose(
      boneName: string,
      relativeTo: THREE.Object3D,
      result: gdjs.Model3DBonePose
    ): boolean {
      const bone = this._bonesByCanonicalName.get(boneName);
      if (!bone || !this._clonedModelRoot || !relativeTo) {
        return false;
      }

      let ancestor: THREE.Object3D | null = bone;
      while (ancestor && ancestor !== relativeTo) {
        ancestor = ancestor.parent;
      }
      if (ancestor !== relativeTo) {
        return false;
      }

      relativeTo.updateWorldMatrix(true, false);
      bone.updateWorldMatrix(true, false);
      this._relativeInverseMatrix.copy(relativeTo.matrixWorld).invert();
      this._boneRelativeMatrix.multiplyMatrices(
        this._relativeInverseMatrix,
        bone.matrixWorld
      );

      // The model normalization converts GLTF coordinates to GDevelop with a
      // reflected Y axis followed by the model's configured default rotation.
      // A bone matrix therefore has a negative determinant and cannot be
      // represented directly by the attachment's (proper) logical rotation.
      // Express the bone in the model's GDevelop coordinate system before
      // removing scale and shear. This also makes a zero rotation offset match
      // a mesh authored directly below the bone when both models use the same
      // configured default rotation.
      this._boneRelativeMatrix.multiply(
        this._modelCoordinateSystemInverseMatrix
      );
      if (
        !this._scaleFreeRotationExtractor.setQuaternionFromMatrix(
          this._boneRelativeMatrix,
          this._boneQuaternion
        )
      ) {
        return false;
      }

      const elements = this._boneRelativeMatrix.elements;
      result.positionX = elements[12];
      result.positionY = elements[13];
      result.positionZ = elements[14];
      result.quaternionX = this._boneQuaternion.x;
      result.quaternionY = this._boneQuaternion.y;
      result.quaternionZ = this._boneQuaternion.z;
      result.quaternionW = this._boneQuaternion.w;
      return true;
    }

    /** @internal */
    getSpringBoneModelGeneration(): number {
      return this._modelGeneration;
    }

    /** @internal */
    createSpringBoneDynamicsBinding(
      chainBoneNames: readonly (readonly string[])[],
      additionalBoneNames: readonly string[]
    ): gdjs.Model3DSpringBoneDynamicsBinding | null {
      if (!this._clonedModelRoot) return null;
      const chains: THREE.Bone[][] = [];
      const flatBones: THREE.Bone[] = [];
      const bonesByCanonicalName = new Map<string, THREE.Bone>();
      const ownedBones = new Set<THREE.Bone>();

      for (let chainIndex = 0; chainIndex < chainBoneNames.length; chainIndex++) {
        const names = chainBoneNames[chainIndex];
        const chain: THREE.Bone[] = [];
        for (let boneIndex = 0; boneIndex < names.length; boneIndex++) {
          const name = names[boneIndex];
          const bone = this._bonesByCanonicalName.get(name);
          if (!bone || ownedBones.has(bone)) return null;
          if (
            boneIndex > 0 &&
            getNearestParentBone(bone) !== chain[boneIndex - 1]
          ) {
            return null;
          }
          ownedBones.add(bone);
          bonesByCanonicalName.set(name, bone);
          chain.push(bone);
          flatBones.push(bone);
        }
        chains.push(chain);
      }
      for (let index = 0; index < additionalBoneNames.length; index++) {
        const name = additionalBoneNames[index];
        const bone = this._bonesByCanonicalName.get(name);
        if (!bone) return null;
        bonesByCanonicalName.set(name, bone);
      }
      return {
        generation: this._modelGeneration,
        chains,
        flatBones,
        bonesByCanonicalName,
      };
    }

    /** @internal */
    captureSpringBoneDynamicsPose(
      binding: gdjs.Model3DSpringBoneDynamicsBinding,
      worldPositions: Float32Array,
      localQuaternions: Float32Array
    ): boolean {
      if (
        binding.generation !== this._modelGeneration ||
        !this._clonedModelRoot ||
        worldPositions.length !== binding.flatBones.length * 3 ||
        localQuaternions.length !== binding.flatBones.length * 4
      ) {
        return false;
      }
      this._clonedModelRoot.updateMatrixWorld(true);
      for (let index = 0; index < binding.flatBones.length; index++) {
        const bone = binding.flatBones[index];
        this._springBonePosition.setFromMatrixPosition(bone.matrixWorld);
        const positionOffset = index * 3;
        worldPositions[positionOffset] = this._springBonePosition.x;
        worldPositions[positionOffset + 1] = this._springBonePosition.y;
        worldPositions[positionOffset + 2] = this._springBonePosition.z;
        const quaternionOffset = index * 4;
        localQuaternions[quaternionOffset] = bone.quaternion.x;
        localQuaternions[quaternionOffset + 1] = bone.quaternion.y;
        localQuaternions[quaternionOffset + 2] = bone.quaternion.z;
        localQuaternions[quaternionOffset + 3] = bone.quaternion.w;
      }
      return true;
    }

    /** Restore the animation-only pose before the next mixer/capture pass. @internal */
    restoreSpringBoneDynamicsAnimationPose(
      binding: gdjs.Model3DSpringBoneDynamicsBinding,
      animationLocalQuaternions: Float32Array
    ): boolean {
      if (
        binding.generation !== this._modelGeneration ||
        !this._clonedModelRoot ||
        animationLocalQuaternions.length !== binding.flatBones.length * 4
      ) {
        return false;
      }
      for (let index = 0; index < binding.flatBones.length; index++) {
        binding.flatBones[index].quaternion.fromArray(
          animationLocalQuaternions,
          index * 4
        );
      }
      this._clonedModelRoot.updateMatrixWorld(true);
      return true;
    }

    /** @internal */
    applySpringBoneDynamicsPose(
      binding: gdjs.Model3DSpringBoneDynamicsBinding,
      simulatedWorldPositions: Float32Array,
      animationLocalQuaternions: Float32Array,
      blendWeight: number
    ): boolean {
      if (
        binding.generation !== this._modelGeneration ||
        !this._clonedModelRoot ||
        simulatedWorldPositions.length !== binding.flatBones.length * 3 ||
        animationLocalQuaternions.length !== binding.flatBones.length * 4
      ) {
        return false;
      }
      const weight = Math.min(1, Math.max(0, blendWeight));
      let flatIndex = 0;
      for (let chainIndex = 0; chainIndex < binding.chains.length; chainIndex++) {
        const chain = binding.chains[chainIndex];
        for (let boneIndex = 0; boneIndex < chain.length - 1; boneIndex++) {
          const bone = chain[boneIndex];
          const child = chain[boneIndex + 1];
          const quaternionOffset = flatIndex * 4;
          this._springBoneAnimationQuaternion.fromArray(
            animationLocalQuaternions,
            quaternionOffset
          );
          bone.quaternion.copy(this._springBoneAnimationQuaternion);
          this._clonedModelRoot.updateMatrixWorld(true);
          this._springBonePosition.setFromMatrixPosition(bone.matrixWorld);
          this._springBoneChildPosition.setFromMatrixPosition(child.matrixWorld);
          this._springBoneCurrentDirection
            .subVectors(this._springBoneChildPosition, this._springBonePosition);
          const positionOffset = flatIndex * 3;
          const childPositionOffset = (flatIndex + 1) * 3;
          this._springBoneTargetDirection.set(
            simulatedWorldPositions[childPositionOffset] -
              simulatedWorldPositions[positionOffset],
            simulatedWorldPositions[childPositionOffset + 1] -
              simulatedWorldPositions[positionOffset + 1],
            simulatedWorldPositions[childPositionOffset + 2] -
              simulatedWorldPositions[positionOffset + 2]
          );
          if (
            this._springBoneCurrentDirection.lengthSq() > epsilon * epsilon &&
            this._springBoneTargetDirection.lengthSq() > epsilon * epsilon
          ) {
            this._springBoneCurrentDirection.normalize();
            this._springBoneTargetDirection.normalize();
            this._springBoneWorldDeltaQuaternion.setFromUnitVectors(
              this._springBoneCurrentDirection,
              this._springBoneTargetDirection
            );
            if (bone.parent) {
              bone.parent.getWorldQuaternion(this._springBoneParentQuaternion);
            } else {
              this._springBoneParentQuaternion.identity();
            }
            this._springBoneParentInverseQuaternion
              .copy(this._springBoneParentQuaternion)
              .invert();
            this._springBoneLocalDeltaQuaternion
              .copy(this._springBoneParentInverseQuaternion)
              .multiply(this._springBoneWorldDeltaQuaternion)
              .multiply(this._springBoneParentQuaternion);
            this._springBoneTargetQuaternion
              .copy(this._springBoneLocalDeltaQuaternion)
              .multiply(this._springBoneAnimationQuaternion)
              .normalize();
            bone.quaternion
              .copy(this._springBoneAnimationQuaternion)
              .slerp(this._springBoneTargetQuaternion, weight)
              .normalize();
          }
          flatIndex++;
        }
        flatIndex++;
      }
      this._clonedModelRoot.updateMatrixWorld(true);
      return true;
    }

    /** Convert a source-model bind-space point into a named bone's local space. @internal */
    convertSpringBoneModelPointToBoneLocal(
      binding: gdjs.Model3DSpringBoneDynamicsBinding,
      boneName: string,
      x: number,
      y: number,
      z: number,
      result: Float32Array,
      offset: number
    ): boolean {
      if (binding.generation !== this._modelGeneration) return false;
      let sourceBone: THREE.Bone | null = null;
      this._originalModel.scene.traverse((node) => {
        const bone = node as THREE.Bone;
        if (sourceBone || !bone.isBone) return;
        const authoredName =
          bone.userData && typeof bone.userData.name === 'string'
            ? bone.userData.name
            : '';
        if ((authoredName || bone.name) === boneName) sourceBone = bone;
      });
      if (!sourceBone) return false;
      this._originalModel.scene.updateMatrixWorld(true);
      this._springBonePosition
        .set(x, y, z)
        // Collider recipes use the authored model coordinate system. Undo the
        // renderer's configured model rotation and Y reflection before
        // resolving the point against the raw GLTF bind-pose hierarchy.
        .applyMatrix4(this._modelCoordinateSystemInverseMatrix)
        .applyMatrix4(this._originalModel.scene.matrixWorld);
      (sourceBone as THREE.Bone).worldToLocal(this._springBonePosition);
      result[offset] = this._springBonePosition.x;
      result[offset + 1] = this._springBonePosition.y;
      result[offset + 2] = this._springBonePosition.z;
      return true;
    }

    /** Resolve a named bone-local point in the current animated world pose. @internal */
    getSpringBoneLocalPointInWorld(
      binding: gdjs.Model3DSpringBoneDynamicsBinding,
      boneName: string,
      x: number,
      y: number,
      z: number,
      result: Float32Array,
      offset: number
    ): boolean {
      if (binding.generation !== this._modelGeneration) return false;
      const bone = binding.bonesByCanonicalName.get(boneName);
      if (!bone) return false;
      this._springBonePosition.set(x, y, z);
      bone.localToWorld(this._springBonePosition);
      result[offset] = this._springBonePosition.x;
      result[offset + 1] = this._springBonePosition.y;
      result[offset + 2] = this._springBonePosition.z;
      return true;
    }

    updateAnimation(timeDelta: float) {
      this._animationMixer.update(timeDelta);
    }

    private _releaseCurrentModelInstance(): void {
      this._modelGeneration++;
      this._animationMixer.stopAllAction();
      if (this._clonedModelRoot) {
        this._animationMixer.uncacheRoot(this._clonedModelRoot);
      }
      this._action = null;
      this._clonedModelRoot = null;
      this._bonesByCanonicalName.clear();
      this._ambiguousBoneNames.clear();
      this.get3DRendererObject().remove(this._threeObject);
      // SkeletonUtils clones share geometry, material and texture resources
      // with the cached GLTF. Only detach the hierarchy here; disposing shared
      // GPU resources would break other live instances.
      this._threeObject.clear();
    }

    onDestroyed(): void {
      this._releaseCurrentModelInstance();
      this._sharedAnimationModelCompatibility.clear();
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
      this._sharedAnimationModelCompatibility.clear();
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
      // stretchModelIntoUnitaryCube applies this same reflected coordinate
      // system to the rendered model (positive normalization scales omitted).
      this._modelRotationEuler.set(
        gdjs.toRad(rotationX),
        gdjs.toRad(rotationY),
        gdjs.toRad(rotationZ),
        'ZYX'
      );
      this._modelCoordinateSystemInverseMatrix
        .makeRotationFromEuler(this._modelRotationEuler)
        .premultiply(this._modelYAxisReflectionMatrix)
        .invert();

      // Start from the original model because:
      // - _replaceMaterials is destructive
      // - _updateDefaultTransformation may need to work with meshes in local space

      // Release the old mixer bindings and clone hierarchy before creating the
      // replacement. This keeps model rebuilds from retaining two animated
      // skeletons at once longer than necessary.
      this._releaseCurrentModelInstance();

      // This group hold the rotation defined by properties.
      const threeObject = new THREE.Group();
      threeObject.rotation.order = 'ZYX';
      const root = THREE_ADDONS.SkeletonUtils.clone(this._originalModel.scene);
      threeObject.add(root);
      this._rebuildBoneCache(root);

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
      ignoreCrossFade: boolean = false,
      sourceModelResourceName: string = '',
      shouldUseRootMotion: boolean = true
    ) {
      const clip = this._getAnimationClip(
        animationName,
        sourceModelResourceName,
        shouldUseRootMotion
      );
      if (!clip) {
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

    private _getAnimationClip(
      animationName: string,
      sourceModelResourceName: string,
      shouldUseRootMotion: boolean = true
    ): THREE.AnimationClip | null {
      const modelResourceName =
        sourceModelResourceName ||
        this._model3DRuntimeObject._modelResourceName;
      let animationModel = this._originalModel;
      if (modelResourceName !== this._model3DRuntimeObject._modelResourceName) {
        animationModel = this._model3DManager.getModel(modelResourceName);
        let isCompatible =
          this._sharedAnimationModelCompatibility.get(modelResourceName);
        if (isCompatible === undefined) {
          isCompatible = doModelsHaveExactMatchingRigs(
            this._originalModel,
            animationModel
          );
          this._sharedAnimationModelCompatibility.set(
            modelResourceName,
            isCompatible
          );
          if (!isCompatible) {
            console.error(
              `The GLB file: ${modelResourceName} can't share animations with ${this._model3DRuntimeObject._modelResourceName} because their rigs don't exactly match.`
            );
          }
        }
        if (!isCompatible) {
          return null;
        }
      }

      const clip = THREE.AnimationClip.findByName(
        animationModel.animations,
        animationName
      );
      if (!clip) {
        console.error(
          `The GLB file: ${modelResourceName} doesn't have any animation named: ${animationName}`
        );
      }
      return clip && !shouldUseRootMotion
        ? this._getAnimationClipWithoutRootMotion(clip, animationModel.scene)
        : clip;
    }

    private _getAnimationClipWithoutRootMotion(
      clip: THREE.AnimationClip,
      modelRoot: THREE.Object3D
    ): THREE.AnimationClip {
      const cachedClip = this._animationClipsWithoutRootMotion.get(clip);
      if (cachedClip) return cachedClip;

      const rootMotionTrackTargetNames =
        this._getRootMotionTrackTargetNames(modelRoot);
      const tracks = clip.tracks.filter((track) => {
        try {
          const parsedTrackName = THREE.PropertyBinding.parseTrackName(
            track.name
          );
          return !(
            rootMotionTrackTargetNames.has(parsedTrackName.nodeName) &&
            (parsedTrackName.propertyName === 'position' ||
              parsedTrackName.propertyName === 'quaternion')
          );
        } catch (error) {
          return true;
        }
      });
      const clipWithoutRootMotion = new THREE.AnimationClip(
        `${clip.name}-without-root-motion`,
        clip.duration,
        tracks,
        clip.blendMode
      );
      this._animationClipsWithoutRootMotion.set(clip, clipWithoutRootMotion);
      return clipWithoutRootMotion;
    }

    private _getRootMotionTrackTargetNames(
      modelRoot: THREE.Object3D
    ): Set<string> {
      const cachedNames = this._rootMotionTrackTargetNames.get(modelRoot);
      if (cachedNames) return cachedNames;

      const names = new Set<string>();
      modelRoot.traverse((node) => {
        const bone = node as THREE.Bone;
        let isRootBone: boolean = bone.isBone;
        if (isRootBone) {
          let ancestor = node.parent;
          while (ancestor && ancestor !== modelRoot) {
            if ((ancestor as THREE.Bone).isBone) {
              isRootBone = false;
              break;
            }
            ancestor = ancestor.parent;
          }
        }

        if (node.parent !== modelRoot && !isRootBone) return;

        let rootMotionNode: THREE.Object3D | null = node;
        while (rootMotionNode && rootMotionNode !== modelRoot) {
          if (rootMotionNode.name) names.add(rootMotionNode.name);
          const authoredName = rootMotionNode.userData
            ? rootMotionNode.userData.name
            : null;
          if (typeof authoredName === 'string' && authoredName) {
            names.add(authoredName);
          }
          rootMotionNode = isRootBone ? rootMotionNode.parent : null;
        }
      });
      this._rootMotionTrackTargetNames.set(modelRoot, names);
      return names;
    }

    getAnimationDuration(
      animationName: string,
      sourceModelResourceName: string = ''
    ): float {
      const clip = this._getAnimationClip(
        animationName,
        sourceModelResourceName
      );
      return clip ? clip.duration : 0;
    }
  }

  /** @category Renderers > 3D Model */
  export const Model3DRuntimeObjectRenderer = Model3DRuntimeObject3DRenderer;
  /** @category Renderers > 3D Model */
  export type Model3DRuntimeObjectRenderer = Model3DRuntimeObject3DRenderer;
}
