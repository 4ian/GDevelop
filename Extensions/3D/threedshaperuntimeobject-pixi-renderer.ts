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

  class ThreeDShapeRuntimeObjectPixiRenderer {
    private _object: gdjs.ThreeDShapeRuntimeObject;
    private _runtimeGame: gdjs.RuntimeGame;
    private _box: THREE.Mesh;

    constructor(
      runtimeObject: gdjs.ThreeDShapeRuntimeObject,
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
      this._box = new THREE.Mesh(geometry, materials);

      this.updateSize();
      this.updatePosition();
      this.updateRotation();

      instanceContainer
        .getLayer('')
        .getRenderer()
        .add3dRendererObject(this._box);
    }

    _getFaceMaterial(faceIndex: integer) {
      // TODO (3D) - feature: support tiling of texture.
      if (!this._object.isFaceAtIndexVisible(faceIndex))
        return getTransparentMaterial();

      return new THREE.MeshBasicMaterial({
        map: this._runtimeGame
          .getImageManager()
          .getThreeTexture(this._object.getFaceAtIndexResourceName(faceIndex)),
        // TODO (3D) - optimization: use FrontSide instead of DoubleSide if no transparent textures and all face are shown.
        side: THREE.DoubleSide,
        transparent: true,
      });
    }

    updateFace(faceIndex: integer) {
      const materialIndex = faceIndexToMaterialIndex[faceIndex];
      if (materialIndex === undefined) return;

      this._box.material[materialIndex] = this._getFaceMaterial(faceIndex);
    }

    get3dRendererObject() {
      return this._box;
    }

    updatePosition() {
      this._box.position.set(
        this._object.x + this._object.getWidth() / 2,
        this._object.y + this._object.getHeight() / 2,
        this._object.getZ() + this._object.getDepth() / 2
      );
    }

    updateRotation() {
      this._box.rotation.set(
        gdjs.toRad(this._object.getRotationX()),
        gdjs.toRad(this._object.getRotationY()),
        gdjs.toRad(this._object.angle)
      );
    }

    updateSize() {
      this._box.scale.set(
        this._object.getWidth(),
        this._object.getHeight(),
        this._object.getDepth()
      );
      this.updatePosition();
    }
  }

  export const ThreeDShapeRuntimeObjectRenderer = ThreeDShapeRuntimeObjectPixiRenderer;
  export type ThreeDShapeRuntimeObjectRenderer = ThreeDShapeRuntimeObjectPixiRenderer;
}
