// @flow
import * as THREE from 'three';

// `three` has no Flow types in this project: the three.js objects are `any`.

/**
 * The bounding box of a 3D model, as the editor and the game engine measure it:
 * the model rotated as its object configures it, and the origin of the model
 * kept inside the box when the object is positioned by it (a model can be one
 * face of a cube, and the inside stays part of the object).
 *
 * The same measure is done by `gdjs.Model3DRuntimeObject3DRenderer`
 * (`stretchModelIntoUnitaryCube`) and by `Model3DRendered2DInstance` in
 * `Extensions/3D/JsExtension.js`: keep them identical.
 *
 * `threeObject` is rotated and put back as it was.
 */
export const getModel3DBoundingBox = (
  threeObject: any,
  {
    rotationX,
    rotationY,
    rotationZ,
    keepsModelOrigin,
  }: {|
    rotationX: number,
    rotationY: number,
    rotationZ: number,
    // True when the object is positioned by the origin of the model itself
    // (`originLocation` = `ModelOrigin`), the only location that is not a
    // point of the box.
    keepsModelOrigin: boolean,
  |}
): any => {
  const savedRotation = threeObject.rotation.clone();
  let boundingBox;
  try {
    threeObject.rotation.order = 'ZYX';
    threeObject.rotation.set(
      (rotationX * Math.PI) / 180,
      (rotationY * Math.PI) / 180,
      (rotationZ * Math.PI) / 180
    );
    threeObject.updateMatrixWorld(true);
    boundingBox = new THREE.Box3().setFromObject(threeObject);
  } finally {
    // A measurement that throws must not leave the model rotated: it is
    // shared with everything else showing it.
    threeObject.rotation.copy(savedRotation);
    threeObject.updateMatrixWorld(true);
  }

  if (keepsModelOrigin) {
    boundingBox.expandByPoint(new THREE.Vector3(0, 0, 0));
  }
  return boundingBox;
};
