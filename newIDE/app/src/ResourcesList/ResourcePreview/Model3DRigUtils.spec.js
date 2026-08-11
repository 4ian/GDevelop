// @flow

import * as THREE from 'three';
import { validateModel3DRig } from './Model3DRigUtils';

const createModel = ({
  boneNames = ['Hips', 'Spine', 'Head'],
  makeHeadSibling = false,
  spineX = 0,
}: {|
  boneNames?: Array<string>,
  makeHeadSibling?: boolean,
  spineX?: number,
|} = {}): any => {
  const scene = new THREE.Group();
  const hips = new THREE.Bone();
  hips.name = boneNames[0];
  const spine = new THREE.Bone();
  spine.name = boneNames[1];
  spine.position.x = spineX;
  const head = new THREE.Bone();
  head.name = boneNames[2];
  scene.add(hips);
  hips.add(spine);
  (makeHeadSibling ? hips : spine).add(head);
  return { scene, animations: [] };
};

describe('Model3DRigUtils', () => {
  test('accepts rigs with matching bone names, hierarchy and bind pose', () => {
    const result = validateModel3DRig(createModel(), createModel());

    expect(result).toEqual({
      isMatching: true,
      mismatchReason: null,
      boneCount: 3,
      differentBoneCount: 0,
    });
  });

  test('rejects different bone names', () => {
    const result = validateModel3DRig(
      createModel(),
      createModel({ boneNames: ['Hips', 'Chest', 'Head'] })
    );

    expect(result.isMatching).toBe(false);
    expect(result.mismatchReason).toBe('bone-names');
    expect(result.differentBoneCount).toBe(2);
  });

  test('rejects a different bone hierarchy', () => {
    const result = validateModel3DRig(
      createModel(),
      createModel({ makeHeadSibling: true })
    );

    expect(result.isMatching).toBe(false);
    expect(result.mismatchReason).toBe('bone-hierarchy');
    expect(result.differentBoneCount).toBe(1);
  });

  test('rejects a different bind pose', () => {
    const result = validateModel3DRig(
      createModel(),
      createModel({ spineX: 0.25 })
    );

    expect(result.isMatching).toBe(false);
    expect(result.mismatchReason).toBe('bind-pose');
    expect(result.differentBoneCount).toBe(1);
  });

  test('rejects models without a skeleton', () => {
    const result = validateModel3DRig(createModel(), {
      scene: new THREE.Group(),
      animations: [],
    });

    expect(result.isMatching).toBe(false);
    expect(result.mismatchReason).toBe('missing-skeleton');
  });
});
