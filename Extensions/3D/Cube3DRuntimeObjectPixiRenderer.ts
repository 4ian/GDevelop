namespace gdjs {
  // Three.js materials for a cube and the order of faces in the object is different,
  // so we keep the mapping from one to the other.
  const faceIndexToMaterialIndex = {
    3: 0, // right
    2: 1, // left
    5: 2, // top
    4: 3, // bottom
    0: 4, // front
    1: 5, // back
  };
  const materialIndexToFaceIndex = {
    0: 3,
    1: 2,
    2: 5,
    3: 4,
    4: 0,
    5: 1,
  };

  const noRepeatTextureVertexIndexToUvMapping = {
    0: [0, 1],
    1: [1, 1],
    2: [0, 0],
    3: [1, 0],
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
      this._boxMesh.rotation.order = 'ZYX';

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
        .getThreeMaterial(this._object.getFaceAtIndexResourceName(faceIndex), {
          useTransparentTexture: this._object.shouldUseTransparentTexture(),
        });
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
      this.updateTextureUvMapping();
    }

    /**
     * Updates the UV mapping of the geometry in order to repeat a material
     * over the different faces of the cube.
     * The mesh must be configured with a list of materials in order
     * for the method to work.
     */
    updateTextureUvMapping() {
      // @ts-ignore - position is stored as a Float32BufferAttribute
      const pos: THREE.BufferAttribute =
        this._boxMesh.geometry.getAttribute('position');
      // @ts-ignore - uv is stored as a Float32BufferAttribute
      const uvMapping: THREE.BufferAttribute =
        this._boxMesh.geometry.getAttribute('uv');
      for (var vertexIndex = 0; vertexIndex < pos.count; vertexIndex++) {
        const materialIndex = Math.floor(
          vertexIndex /
            // Each face of the cube has 4 points
            4
        );
        const material = this._boxMesh.material[materialIndex];
        if (!material || !material.map) {
          continue;
        }
        const shouldRepeatTexture =
          this._object.shouldRepeatTextureOnFaceAtIndex(
            materialIndexToFaceIndex[materialIndex]
          );
        if (materialIndex === 0 || materialIndex === 1) {
          // Right or left
          const isRight = materialIndex === 0;

          let y: float, z: float;
          if (shouldRepeatTexture) {
            y =
              (isRight ? -1 : 1) *
              (this._boxMesh.scale.y / material.map.source.data.width) *
              (pos.getY(vertexIndex) + 0.5);
            z =
              (this._boxMesh.scale.z / material.map.source.data.height) *
              (pos.getZ(vertexIndex) - 0.5);
          } else {
            [y, z] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
          }
          uvMapping.setXY(vertexIndex, y, z);
        } else if (materialIndex === 2 || materialIndex === 3) {
          // Top or bottom
          const isTop = materialIndex === 2;

          let x: float, z: float;
          if (shouldRepeatTexture) {
            x =
              (isTop ? 1 : -1) *
              (this._boxMesh.scale.x / material.map.source.data.width) *
              (pos.getX(vertexIndex) + 0.5);
            z =
              (this._boxMesh.scale.z / material.map.source.data.height) *
              (pos.getZ(vertexIndex) - 0.5);
          } else {
            [x, z] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
          }
          uvMapping.setXY(vertexIndex, x, z);
        } else {
          // Front or back
          const isFront = materialIndex === 4;

          let x: float, y: float;
          if (shouldRepeatTexture) {
            x =
              (isFront ? 1 : -1) *
              (this._boxMesh.scale.x / material.map.source.data.width) *
              (pos.getX(vertexIndex) + (isFront ? 1 : -1) * 0.5);
            y =
              -(this._boxMesh.scale.y / material.map.source.data.height) *
              (pos.getY(vertexIndex) + 0.5);
          } else {
            [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
          }
          uvMapping.setXY(vertexIndex, x, y);
        }
      }
      uvMapping.needsUpdate = true;
    }
  }

  export const Cube3DRuntimeObjectRenderer = Cube3DRuntimeObjectPixiRenderer;
  export type Cube3DRuntimeObjectRenderer = Cube3DRuntimeObjectPixiRenderer;
}
