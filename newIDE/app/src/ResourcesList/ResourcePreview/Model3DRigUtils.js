// @flow

import * as THREE from 'three';
import { type GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export type Model3DRigMismatchReason =
  | 'missing-skeleton'
  | 'unnamed-bone'
  | 'duplicate-bone-name'
  | 'bone-count'
  | 'bone-names'
  | 'bone-hierarchy'
  | 'bind-pose';

export type Model3DRigValidationResult = {|
  isMatching: boolean,
  mismatchReason: Model3DRigMismatchReason | null,
  boneCount: number,
  differentBoneCount: number,
|};

type RigBoneDescription = {|
  name: string,
  parentName: string,
  bindMatrix: Array<number>,
|};

type RigDescriptionResult = {|
  bones: Array<RigBoneDescription>,
  error: Model3DRigMismatchReason | null,
|};

const rigTransformEpsilon = 1 / (1 << 12);

const getNearestParentBone = (bone: THREE.Bone): THREE.Bone | null => {
  let parent = bone.parent;
  while (parent) {
    const parentBone: THREE.Bone = (parent: any);
    if (parentBone.isBone) {
      return parentBone;
    }
    parent = parent.parent;
  }
  return null;
};

const getRigDescription = (root: THREE.Object3D): RigDescriptionResult => {
  root.updateMatrixWorld(true);
  const bones = [];
  root.traverse(node => {
    const bone: THREE.Bone = (node: any);
    if (bone.isBone) {
      bones.push(bone);
    }
  });
  if (bones.length === 0) {
    return { bones: [], error: 'missing-skeleton' };
  }

  const boneNames = new Set<string>();
  const rootInverseMatrix = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const descriptions = [];
  for (const bone of bones) {
    if (!bone.name) {
      return { bones: [], error: 'unnamed-bone' };
    }
    if (boneNames.has(bone.name)) {
      return { bones: [], error: 'duplicate-bone-name' };
    }
    boneNames.add(bone.name);

    const parentBone = getNearestParentBone(bone);
    const parentInverseMatrix = parentBone
      ? new THREE.Matrix4().copy(parentBone.matrixWorld).invert()
      : rootInverseMatrix;
    descriptions.push({
      name: bone.name,
      parentName: parentBone ? parentBone.name : '',
      bindMatrix: new THREE.Matrix4()
        .multiplyMatrices(parentInverseMatrix, bone.matrixWorld)
        .elements.slice(),
    });
  }
  descriptions.sort((left, right) => left.name.localeCompare(right.name));
  return { bones: descriptions, error: null };
};

const areBindMatricesEqual = (
  left: Array<number>,
  right: Array<number>
): boolean => {
  for (let index = 0; index < left.length; index++) {
    if (Math.abs(left[index] - right[index]) > rigTransformEpsilon) {
      return false;
    }
  }
  return true;
};

export const validateModel3DRig = (
  targetModel: GLTF,
  sourceModel: GLTF
): Model3DRigValidationResult => {
  const targetRigResult = getRigDescription(targetModel.scene);
  const sourceRigResult = getRigDescription(sourceModel.scene);
  const boneCount = sourceRigResult.bones.length;
  if (targetRigResult.error || sourceRigResult.error) {
    return {
      isMatching: false,
      mismatchReason: sourceRigResult.error || targetRigResult.error,
      boneCount,
      differentBoneCount: 0,
    };
  }

  const targetRig = targetRigResult.bones;
  const sourceRig = sourceRigResult.bones;
  if (targetRig.length !== sourceRig.length) {
    return {
      isMatching: false,
      mismatchReason: 'bone-count',
      boneCount,
      differentBoneCount: Math.abs(targetRig.length - sourceRig.length),
    };
  }

  const targetBoneNames = new Set(targetRig.map(bone => bone.name));
  const sourceBoneNames = new Set(sourceRig.map(bone => bone.name));
  const differentBoneNames = new Set([
    ...targetRig
      .filter(bone => !sourceBoneNames.has(bone.name))
      .map(bone => bone.name),
    ...sourceRig
      .filter(bone => !targetBoneNames.has(bone.name))
      .map(bone => bone.name),
  ]);
  if (differentBoneNames.size > 0) {
    return {
      isMatching: false,
      mismatchReason: 'bone-names',
      boneCount,
      differentBoneCount: differentBoneNames.size,
    };
  }

  let differentBoneCount = 0;
  for (let index = 0; index < targetRig.length; index++) {
    if (targetRig[index].parentName !== sourceRig[index].parentName) {
      differentBoneCount++;
    }
  }
  if (differentBoneCount > 0) {
    return {
      isMatching: false,
      mismatchReason: 'bone-hierarchy',
      boneCount,
      differentBoneCount,
    };
  }

  differentBoneCount = 0;
  for (let index = 0; index < targetRig.length; index++) {
    if (
      !areBindMatricesEqual(
        targetRig[index].bindMatrix,
        sourceRig[index].bindMatrix
      )
    ) {
      differentBoneCount++;
    }
  }
  if (differentBoneCount > 0) {
    return {
      isMatching: false,
      mismatchReason: 'bind-pose',
      boneCount,
      differentBoneCount,
    };
  }

  return {
    isMatching: true,
    mismatchReason: null,
    boneCount,
    differentBoneCount: 0,
  };
};
