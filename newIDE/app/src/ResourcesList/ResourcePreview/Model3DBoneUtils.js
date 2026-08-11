// @flow

/**
 * Return the stable public name used by bone attachments.
 *
 * GLTFLoader sanitizes Object3D names for animation bindings, removing dots,
 * while preserving the authored GLB name in userData.name. Synthetic display
 * labels are deliberately excluded because they are not stable identifiers.
 */
export const getModelBoneCanonicalName = (bone: any): string => {
  const authoredName =
    bone.userData && typeof bone.userData.name === 'string'
      ? bone.userData.name
      : '';
  return authoredName || bone.name || '';
};

/** Return a human-readable label, including a preview-only synthetic fallback. */
export const getModelBoneDisplayName = (
  bone: any,
  boneIndex: number
): string => {
  return getModelBoneCanonicalName(bone) || `Bone ${boneIndex + 1}`;
};

/**
 * Return sorted canonical names that identify exactly one bone in the model.
 * Empty and duplicate names are omitted without affecting other valid bones.
 */
export const getUniqueModelBoneNames = (root: any): Array<string> => {
  const names = new Set<string>();
  const ambiguousNames = new Set<string>();
  if (!root || typeof root.traverse !== 'function') return [];

  root.traverse(node => {
    if (!node || !node.isBone) return;
    const canonicalName = getModelBoneCanonicalName(node);
    if (!canonicalName || ambiguousNames.has(canonicalName)) return;
    if (names.has(canonicalName)) {
      names.delete(canonicalName);
      ambiguousNames.add(canonicalName);
      return;
    }
    names.add(canonicalName);
  });
  return Array.from(names).sort();
};
