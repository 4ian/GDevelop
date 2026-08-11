// @flow

import * as THREE from 'three';
import {
  captureModelMaterialAppearances,
  findHoveredBoneJointIndex,
  setModelMaterialsBonesVisibility,
} from './Model3DBoneVisualizationUtils';

describe('Model3DBoneVisualizationUtils', () => {
  test('keeps masked GLB materials visible while the model is translucent', () => {
    const model = new THREE.Group();
    const maskedMaterial = new THREE.MeshBasicMaterial({
      alphaTest: 0.5,
      opacity: 1,
    });
    const originallyTransparentMaterial = new THREE.MeshBasicMaterial({
      alphaTest: 0.25,
      opacity: 0.5,
      transparent: true,
      depthWrite: false,
    });
    model.add(
      new THREE.Mesh(new THREE.BufferGeometry(), [
        maskedMaterial,
        originallyTransparentMaterial,
      ])
    );

    const materialAppearances = captureModelMaterialAppearances(model);
    setModelMaterialsBonesVisibility({
      materialAppearances,
      isVisible: true,
      previewOpacity: 0.18,
    });

    expect(maskedMaterial.transparent).toBe(true);
    expect(maskedMaterial.opacity).toBe(0.18);
    expect(maskedMaterial.depthWrite).toBe(false);
    expect(maskedMaterial.alphaTest).toBeCloseTo(0.09);
    expect(originallyTransparentMaterial.opacity).toBe(0.18);
    expect(originallyTransparentMaterial.alphaTest).toBeCloseTo(0.09);

    setModelMaterialsBonesVisibility({
      materialAppearances,
      isVisible: false,
      previewOpacity: 0.18,
    });

    expect(maskedMaterial.transparent).toBe(false);
    expect(maskedMaterial.opacity).toBe(1);
    expect(maskedMaterial.depthWrite).toBe(true);
    expect(maskedMaterial.alphaTest).toBe(0.5);
    expect(originallyTransparentMaterial.transparent).toBe(true);
    expect(originallyTransparentMaterial.opacity).toBe(0.5);
    expect(originallyTransparentMaterial.depthWrite).toBe(false);
    expect(originallyTransparentMaterial.alphaTest).toBe(0.25);
  });

  test('captures shared materials only once', () => {
    const model = new THREE.Group();
    const material = new THREE.MeshBasicMaterial();
    model.add(
      new THREE.Mesh(new THREE.BufferGeometry(), material),
      new THREE.Mesh(new THREE.BufferGeometry(), material)
    );

    expect(captureModelMaterialAppearances(model)).toHaveLength(1);
  });

  test('finds the nearest visible bone joint within the hover radius', () => {
    const boneScreenPositions = [
      { x: 100, y: 100, depth: 0.5, isVisible: true },
      { x: 104, y: 100, depth: -0.2, isVisible: true },
      { x: 102, y: 100, depth: -0.8, isVisible: false },
    ];

    expect(
      findHoveredBoneJointIndex({
        boneScreenPositions,
        pointerX: 102,
        pointerY: 100,
        hitRadius: 8,
      })
    ).toBe(1);
    expect(
      findHoveredBoneJointIndex({
        boneScreenPositions,
        pointerX: 130,
        pointerY: 100,
        hitRadius: 8,
      })
    ).toBe(-1);
  });
});
