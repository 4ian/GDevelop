// @flow

import * as THREE from 'three';
import {
  getCommonModel3DBoneNames,
  getModel3DBoneNameAutocompletions,
  getModel3DBoneNameResourceKey,
} from './Model3DBoneNameFieldUtils';

const makeModel = (boneNames: Array<string>): any => {
  const scene = new THREE.Group();
  boneNames.forEach(name => {
    const bone = new THREE.Bone();
    bone.name = name;
    scene.add(bone);
  });
  return { scene };
};

describe('Model3DBoneNameField', () => {
  test('lists sorted unique names for one model', () => {
    expect(
      getCommonModel3DBoneNames([
        makeModel(['Spine', '', 'Arm', 'Spine', 'Head']),
      ])
    ).toEqual(['Arm', 'Head']);
  });

  test('lists only names common to every model in a group', () => {
    expect(
      getCommonModel3DBoneNames([
        makeModel(['Hand', 'Head', 'Spine']),
        makeModel(['Spine', 'Hand', 'Foot']),
      ])
    ).toEqual(['Hand', 'Spine']);
  });

  test('keeps loading and failure states non-insertable and free-form friendly', () => {
    const loadingCompletions = getModel3DBoneNameAutocompletions(
      { status: 'loading', names: [] },
      ''
    );
    const errorCompletions = getModel3DBoneNameAutocompletions(
      { status: 'error', names: [] },
      ''
    );

    expect(loadingCompletions[0].isExact).toBe(true);
    expect(errorCompletions[0].isExact).toBe(true);
    expect(
      getModel3DBoneNameAutocompletions(
        { status: 'error', names: [] },
        'CustomBoneExpression()'
      )
    ).toEqual([]);
  });

  test('invalidates completion loading when resources change and skips missing resources', () => {
    expect(getModel3DBoneNameResourceKey([])).toBe('');
    expect(getModel3DBoneNameResourceKey(['Rig', ''])).toBe('');
    expect(getModel3DBoneNameResourceKey(['FirstRig'])).not.toBe(
      getModel3DBoneNameResourceKey(['SecondRig'])
    );
  });
});
