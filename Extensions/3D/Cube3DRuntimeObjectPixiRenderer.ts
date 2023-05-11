namespace gdjs {
  // Three.js materials for a cube and the order of faces in the object is different,
  // so we keep the mapping from one to the other.
  const faceIndexToMaterialIndex = {
    3: 0, // right
    2: 1, // left
    5: 2, // bottom
    4: 3, // top
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
    0: [0, 0],
    1: [1, 0],
    2: [0, 1],
    3: [1, 1],
  };

  const noRepeatTextureVertexIndexToUvMappingForLeftAndRightFacesTowardsZ = {
    0: [0, 1],
    1: [0, 0],
    2: [1, 1],
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
        .add3DRendererObject(this._boxMesh);
    }

    _getFaceMaterial(faceIndex: integer) {
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
      if (this._object.isFaceAtIndexVisible(faceIndex)) {
        this.updateTextureUvMapping(faceIndex);
      }
    }

    get3DRendererObject() {
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

    updateVisibility() {
      this._boxMesh.visible = !this._object.hidden;
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
     * @param faceIndex The face index to update. If undefined, updates all the faces.
     */
    updateTextureUvMapping(faceIndex?: number) {
      // @ts-ignore - position is stored as a Float32BufferAttribute
      const pos: THREE.BufferAttribute =
        this._boxMesh.geometry.getAttribute('position');
      // @ts-ignore - uv is stored as a Float32BufferAttribute
      const uvMapping: THREE.BufferAttribute =
        this._boxMesh.geometry.getAttribute('uv');
      const startIndex =
        faceIndex === undefined ? 0 : faceIndexToMaterialIndex[faceIndex] * 4;
      const endIndex =
        faceIndex === undefined
          ? 23
          : faceIndexToMaterialIndex[faceIndex] * 4 + 3;
      for (
        let vertexIndex = startIndex;
        vertexIndex <= endIndex;
        vertexIndex++
      ) {
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

        const shouldOrientateFacesTowardsY =
          this._object.getFacesOrientation() === 'Y';

        let x: float, y: float;
        switch (materialIndex) {
          case 0:
            // Right face
            if (shouldRepeatTexture) {
              if (shouldOrientateFacesTowardsY) {
                x =
                  -(this._boxMesh.scale.z / material.map.source.data.width) *
                  (pos.getZ(vertexIndex) - 0.5);
                y =
                  -(this._boxMesh.scale.y / material.map.source.data.height) *
                  (pos.getY(vertexIndex) + 0.5);
              } else {
                x =
                  -(this._boxMesh.scale.y / material.map.source.data.width) *
                  (pos.getY(vertexIndex) - 0.5);
                y =
                  (this._boxMesh.scale.z / material.map.source.data.height) *
                  (pos.getZ(vertexIndex) - 0.5);
              }
            } else {
              if (shouldOrientateFacesTowardsY) {
                [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
              } else {
                [x, y] =
                  noRepeatTextureVertexIndexToUvMappingForLeftAndRightFacesTowardsZ[
                    vertexIndex % 4
                  ];
              }
            }
            break;
          case 1:
            // Left face
            if (shouldRepeatTexture) {
              if (shouldOrientateFacesTowardsY) {
                x =
                  (this._boxMesh.scale.z / material.map.source.data.width) *
                  (pos.getZ(vertexIndex) + 0.5);
                y =
                  -(this._boxMesh.scale.y / material.map.source.data.height) *
                  (pos.getY(vertexIndex) + 0.5);
              } else {
                x =
                  (this._boxMesh.scale.y / material.map.source.data.width) *
                  (pos.getY(vertexIndex) + 0.5);
                y =
                  (this._boxMesh.scale.z / material.map.source.data.height) *
                  (pos.getZ(vertexIndex) - 0.5);
              }
            } else {
              if (shouldOrientateFacesTowardsY) {
                [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
              } else {
                [x, y] =
                  noRepeatTextureVertexIndexToUvMappingForLeftAndRightFacesTowardsZ[
                    vertexIndex % 4
                  ];
                x = -x;
                y = -y;
              }
            }
            break;
          case 2:
            // Bottom face
            if (shouldRepeatTexture) {
              x =
                (this._boxMesh.scale.x / material.map.source.data.width) *
                (pos.getX(vertexIndex) + 0.5);
              y =
                (this._boxMesh.scale.z / material.map.source.data.height) *
                (pos.getZ(vertexIndex) - 0.5);
            } else {
              [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
            }
            break;
          case 3:
            // Top face
            if (shouldRepeatTexture) {
              if (shouldOrientateFacesTowardsY) {
                x =
                  (this._boxMesh.scale.x / material.map.source.data.width) *
                  (pos.getX(vertexIndex) + 0.5);
                y =
                  -(this._boxMesh.scale.z / material.map.source.data.height) *
                  (pos.getZ(vertexIndex) + 0.5);
              } else {
                x =
                  -(this._boxMesh.scale.x / material.map.source.data.width) *
                  (pos.getX(vertexIndex) - 0.5);
                y =
                  (this._boxMesh.scale.z / material.map.source.data.height) *
                  (pos.getZ(vertexIndex) - 0.5);
              }
            } else {
              [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
              if (!shouldOrientateFacesTowardsY) {
                x = -x;
                y = -y;
              }
            }
            break;
          case 4:
            // Front face
            if (shouldRepeatTexture) {
              x =
                (this._boxMesh.scale.x / material.map.source.data.width) *
                (pos.getX(vertexIndex) + 0.5);
              y =
                -(this._boxMesh.scale.y / material.map.source.data.height) *
                (pos.getY(vertexIndex) + 0.5);
            } else {
              [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
            }
            break;
          case 5:
            // Back face
            const shouldBackFaceBeUpThroughXAxisRotation =
              this._object.getBackFaceUpThroughWhichAxisRotation() === 'X';

            if (shouldRepeatTexture) {
              x =
                (shouldBackFaceBeUpThroughXAxisRotation ? 1 : -1) *
                (this._boxMesh.scale.x / material.map.source.data.width) *
                (pos.getX(vertexIndex) +
                  (shouldBackFaceBeUpThroughXAxisRotation ? 1 : -1) * 0.5);
              y =
                (shouldBackFaceBeUpThroughXAxisRotation ? 1 : -1) *
                (this._boxMesh.scale.y / material.map.source.data.height) *
                (pos.getY(vertexIndex) +
                  (shouldBackFaceBeUpThroughXAxisRotation ? -1 : 1) * 0.5);
            } else {
              [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
              if (shouldBackFaceBeUpThroughXAxisRotation) {
                x = -x;
                y = -y;
              }
            }
            break;
          default:
            [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
        }
        uvMapping.setXY(vertexIndex, x, y);
      }
      uvMapping.needsUpdate = true;
    }
  }

  export const Cube3DRuntimeObjectRenderer = Cube3DRuntimeObjectPixiRenderer;
  export type Cube3DRuntimeObjectRenderer = Cube3DRuntimeObjectPixiRenderer;
}
