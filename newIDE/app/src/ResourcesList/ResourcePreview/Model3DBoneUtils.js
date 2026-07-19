// @flow

/**
 * GLTFLoader sanitizes Object3D names for animation bindings, removing dots.
 * It keeps the name authored in the GLB in userData.name, so prefer that for
 * display and fall back to the runtime name for programmatically-built rigs.
 */
export const getModelBoneDisplayName = (
  bone: any,
  boneIndex: number
): string => {
  const originalName =
    bone.userData && typeof bone.userData.name === 'string'
      ? bone.userData.name
      : '';
  return originalName || bone.name || `Bone ${boneIndex + 1}`;
};
