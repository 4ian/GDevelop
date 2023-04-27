namespace gdjs {
  // Three.js materials for a cube and the order of faces in the object is different,
  // so we keep the mapping from one to the other.
  const faceIndexToMaterialIndex = {
    3: 0,
    2: 1,
    5: 2,
    4: 3,
    0: 4,
    1: 5,
  };
  const materialIndexToFaceIndex = {
    0: 3,
    1: 2,
    2: 5,
    3: 4,
    4: 0,
    5: 1,
  };

  let transparentMaterial: THREE.MeshBasicMaterial;
  const getTransparentMaterial = () => {
    if (!transparentMaterial)
      transparentMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        // Set the alpha test to to ensure the faces behind are rendered
        // (no "back face culling" that would still be done if alphaTest is not set).
        alphaTest: 1,
      });

    return transparentMaterial;
  };

  class Cube3DRuntimeObjectPixiRenderer {
    private _object: gdjs.Cube3DRuntimeObject;
    private _runtimeGame: gdjs.RuntimeGame;
    private _boxMesh: THREE.Mesh;

    constructor(
      runtimeObject: gdjs.Cube3DRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;
      this._runtimeGame = instanceContainer.getGame();

      const geometry = new THREE.BoxGeometry(1, 1, 1);
      // TODO (3D) - feature: investigate using MeshStandardMaterial to support lights.
      // TODO (3D) - feature: support color instead of texture?
      const materials = [
        this._getFaceMaterial(materialIndexToFaceIndex[0]),
        this._getFaceMaterial(materialIndexToFaceIndex[1]),
        this._getFaceMaterial(materialIndexToFaceIndex[2]),
        this._getFaceMaterial(materialIndexToFaceIndex[3]),
        this._getFaceMaterial(materialIndexToFaceIndex[4]),
        this._getFaceMaterial(materialIndexToFaceIndex[5]),
      ];
      this._boxMesh = new THREE.Mesh(geometry, materials);

      this.updateSize();
      this.updatePosition();
      this.updateRotation();

      instanceContainer
        .getLayer('')
        .getRenderer()
        .add3dRendererObject(this._boxMesh);
    }

    _getFaceMaterial(faceIndex: integer) {
      // TODO (3D) - feature: support tiling of texture.
      if (!this._object.isFaceAtIndexVisible(faceIndex))
        return getTransparentMaterial();

      return this._runtimeGame
        .getImageManager()
        .getThreeMaterial(this._object.getFaceAtIndexResourceName(faceIndex));
    }

    updateFace(faceIndex: integer) {
      const materialIndex = faceIndexToMaterialIndex[faceIndex];
      if (materialIndex === undefined) return;

      this._boxMesh.material[materialIndex] = this._getFaceMaterial(faceIndex);
    }

    get3dRendererObject() {
      return this._boxMesh;
    }

    updatePosition() {
      this._boxMesh.position.set(
        this._object.x + this._object.getWidth() / 2,
        this._object.y + this._object.getHeight() / 2,
        this._object.getZ() + this._object.getDepth() / 2
      );
    }

    updateRotation() {
      this._boxMesh.rotation.set(
        gdjs.toRad(this._object.getRotationX()),
        gdjs.toRad(this._object.getRotationY()),
        gdjs.toRad(this._object.angle)
      );
    }

    updateSize() {
      this._boxMesh.scale.set(
        this._object.getWidth(),
        this._object.getHeight(),
        this._object.getDepth()
      );
      this.updatePosition();
    }
  }

  export const Cube3DRuntimeObjectRenderer = Cube3DRuntimeObjectPixiRenderer;
  export type Cube3DRuntimeObjectRenderer = Cube3DRuntimeObjectPixiRenderer;
}
