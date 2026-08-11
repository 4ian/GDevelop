// @flow

import * as THREE from 'three';
import {
  getModelBoneCanonicalName,
  getModelBoneDisplayName,
  getUniqueModelBoneNames,
} from './Model3DBoneUtils';

const makeBone = (name: string, authoredName?: string): any => {
  const bone = new THREE.Bone();
  bone.name = name;
  if (authoredName !== undefined) bone.userData.name = authoredName;
  return bone;
};

describe('Model3DBoneUtils', () => {
  test('separates canonical authored names from display fallbacks', () => {
    const authoredBone = makeBone('SanitizedName', 'Authored.Name');
    const unnamedBone = makeBone('');

    expect(getModelBoneCanonicalName(authoredBone)).toBe('Authored.Name');
    expect(getModelBoneDisplayName(authoredBone, 0)).toBe('Authored.Name');
    expect(getModelBoneCanonicalName(unnamedBone)).toBe('');
    expect(getModelBoneDisplayName(unnamedBone, 2)).toBe('Bone 3');
  });

  test('returns sorted unique canonical names and omits empty or duplicate names', () => {
    const root = new THREE.Group();
    root.add(
      makeBone('Zed'),
      makeBone('Sanitized', 'Alpha.Socket'),
      makeBone('Duplicate'),
      makeBone('Duplicate'),
      makeBone('')
    );

    expect(getUniqueModelBoneNames(root)).toEqual(['Alpha.Socket', 'Zed']);
  });
});
