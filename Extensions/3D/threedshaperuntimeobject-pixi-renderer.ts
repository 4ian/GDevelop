namespace gdjs {
  let transparentMaterial: THREE.MeshBasicMaterial;
  const getTransparentMaterial = () => {
    if (!transparentMaterial)
      transparentMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
      });

    return transparentMaterial;
  };

  class ThreeDShapeRuntimeObjectPixiRenderer {
    private _object: gdjs.ThreeDShapeRuntimeObject;
    private _instanceContainer: gdjs.RuntimeInstanceContainer;
    private _runtimeGame: gdjs.RuntimeGame;
    private _box: THREE.Mesh;

    constructor(
      runtimeObject: gdjs.ThreeDShapeRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: ThreeDShapeObjectData
    ) {
      this._object = runtimeObject;
      this._runtimeGame = instanceContainer.getGame();
      this._instanceContainer = instanceContainer;

      const geometry = new THREE.BoxGeometry(1, 1, 1);
      // TODO: support tiling of texture?
      // TODO: investigate using MeshStandardMaterial.
      // TODO: support color instead of texture?
      const materials = [
        objectData.content.rightFaceVisible
          ? new THREE.MeshBasicMaterial({
              map: this._runtimeGame
                .getImageManager()
                .getTHREETexture(objectData.content.rightFaceResourceName),
              side: THREE.DoubleSide,
            })
          : getTransparentMaterial(),
        objectData.content.leftFaceVisible
          ? new THREE.MeshBasicMaterial({
              map: this._runtimeGame
                .getImageManager()
                .getTHREETexture(objectData.content.leftFaceResourceName),
              side: THREE.DoubleSide,
            })
          : getTransparentMaterial(),
        objectData.content.bottomFaceVisible
          ? new THREE.MeshBasicMaterial({
              map: this._runtimeGame
                .getImageManager()
                .getTHREETexture(objectData.content.bottomFaceResourceName),
              side: THREE.DoubleSide,
            })
          : getTransparentMaterial(),
        objectData.content.topFaceVisible
          ? new THREE.MeshBasicMaterial({
              map: this._runtimeGame
                .getImageManager()
                .getTHREETexture(objectData.content.topFaceResourceName),
              side: THREE.DoubleSide,
            })
          : getTransparentMaterial(),
        objectData.content.frontFaceVisible
          ? new THREE.MeshBasicMaterial({
              map: this._runtimeGame
                .getImageManager()
                .getTHREETexture(objectData.content.frontFaceResourceName),
              side: THREE.DoubleSide,
            })
          : getTransparentMaterial(),
        objectData.content.backFaceVisible
          ? new THREE.MeshBasicMaterial({
              map: this._runtimeGame
                .getImageManager()
                .getTHREETexture(objectData.content.backFaceResourceName),
              side: THREE.DoubleSide,
            })
          : getTransparentMaterial(),
      ];
      this._box = new THREE.Mesh(geometry, materials);

      this.updateSize();
      this.updatePosition();
      this.updateRotation();
      instanceContainer.getRenderer().get3dRendererObject().add(this._box);
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
    }

    onDestroy() {
      // TODO: Move to onDestroyFromScene?
      this._instanceContainer
        .getRenderer()
        .get3dRendererObject()
        .remove(this._box);
    }
  }

  export const ThreeDShapeRuntimeObjectRenderer =
    ThreeDShapeRuntimeObjectPixiRenderer;
  export type ThreeDShapeRuntimeObjectRenderer =
    ThreeDShapeRuntimeObjectPixiRenderer;
}
