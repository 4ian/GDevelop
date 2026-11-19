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
  const faceIndexToFaceName = {
    0: 'front',
    1: 'back',
    2: 'left',
    3: 'right',
    4: 'top',
    5: 'bottom',
  };
  const faceNameToFaceIndex = {
    front: 0,
    back: 1,
    left: 2,
    right: 3,
    top: 4,
    bottom: 5,
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

  /**
   * The PBR settings applied to a face: the settings of the object merged
   * with the settings of the face. The texture of the face is used as the
   * albedo texture when no other one is chosen.
   */
  const getFacePBRSettings = (
    runtimeObject: gdjs.Cube3DRuntimeObject,
    faceIndex: integer
  ): gdjs.PBRMaterialSettings => {
    const faceName = faceIndexToFaceName[faceIndex];
    const settings = gdjs.pbrconfig.getSettingsForTarget(
      runtimeObject.getPBRConfig(),
      faceName
    );
    const textures = { ...(settings.textures || {}) };
    if (textures.baseColor === undefined) {
      textures.baseColor = runtimeObject.getFaceAtIndexResourceName(faceIndex);
    }
    settings.textures = textures;
    return settings;
  };

  const getFaceMaterialOptions = (runtimeObject: gdjs.Cube3DRuntimeObject) => {
    const useTransparentTexture = runtimeObject.shouldUseTransparentTexture();
    const pbrConfig = runtimeObject.getPBRConfig();
    return {
      materialType: (runtimeObject.isPBREnabled()
        ? pbrConfig && pbrConfig.material === 'physical'
          ? 'physical'
          : 'standard'
        : runtimeObject._materialType ===
            gdjs.Cube3DRuntimeObject.MaterialType.Basic
          ? 'basic'
          : 'standard') as gdjs.PBRMaterialType,
      vertexColors: true,
      side: useTransparentTexture ? THREE.DoubleSide : THREE.FrontSide,
      transparent: useTransparentTexture,
    };
  };

  const getFaceMaterial = (
    runtimeObject: gdjs.Cube3DRuntimeObject,
    faceIndex: integer
  ) => {
    if (!runtimeObject.isFaceAtIndexVisible(faceIndex))
      return getTransparentMaterial();

    if (runtimeObject.isPBREnabled()) {
      const settings = getFacePBRSettings(runtimeObject, faceIndex);
      const options = getFaceMaterialOptions(runtimeObject);
      const cacheKey =
        faceIndex +
        '|' +
        JSON.stringify(settings) +
        '|' +
        JSON.stringify(options);
      return runtimeObject
        .getInstanceContainer()
        .getGame()
        .getPBRMaterialManager()
        .getSharedMaterial(cacheKey, settings, options);
    }

    return runtimeObject
      .getInstanceContainer()
      .getGame()
      .getImageManager()
      .getThreeMaterial(runtimeObject.getFaceAtIndexResourceName(faceIndex), {
        useTransparentTexture: runtimeObject.shouldUseTransparentTexture(),
        forceBasicMaterial:
          runtimeObject._materialType ===
          gdjs.Cube3DRuntimeObject.MaterialType.Basic,
        vertexColors: true,
      });
  };

  class Cube3DRuntimeObjectPixiRenderer extends gdjs.RuntimeObject3DRenderer {
    private _cube3DRuntimeObject: gdjs.Cube3DRuntimeObject;
    private _boxMesh: THREE.Mesh;
    /**
     * The PBR materials owned by this object (created when events changed
     * their properties), indexed by material index. They are disposed when the
     * object is destroyed to avoid leaking GPU memory.
     */
    private _pbrOwnedMaterials: Array<THREE.Material | null> = [
      null,
      null,
      null,
      null,
      null,
      null,
    ];

    constructor(
      runtimeObject: gdjs.Cube3DRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);

      const materials: THREE.Material[] = new Array(6)
        .fill(0)
        .map((_, index) =>
          getFaceMaterial(runtimeObject, materialIndexToFaceIndex[index])
        );
      const boxMesh = new THREE.Mesh(geometry, materials);

      super(runtimeObject, instanceContainer, boxMesh);
      this._boxMesh = boxMesh;
      this._cube3DRuntimeObject = runtimeObject;

      boxMesh.receiveShadow = this._cube3DRuntimeObject._isReceivingShadow;
      boxMesh.castShadow = this._cube3DRuntimeObject._isCastingShadow;
      this.updateSize();
      this.updatePosition();
      this.updateRotation();
      this.updateTint();
      // Dispose the materials owned by this object when it is destroyed.
      runtimeObject.registerDestroyCallback(() =>
        this._disposeOwnedMaterials()
      );
    }

    private _disposeOwnedMaterials() {
      const pbrMaterialManager = this._cube3DRuntimeObject
        .getInstanceContainer()
        .getGame()
        .getPBRMaterialManager();
      for (let index = 0; index < this._pbrOwnedMaterials.length; index++) {
        const material = this._pbrOwnedMaterials[index];
        if (material) {
          pbrMaterialManager.disposeUniqueMaterial(material);
        }
        this._pbrOwnedMaterials[index] = null;
      }
    }

    updateTint() {
      const tints: number[] = [];

      const normalizedTint = gdjs
        .rgbOrHexToRGBColor(this._cube3DRuntimeObject.getColor())
        .map((component) => component / 255);

      for (
        let i = 0;
        i < this._boxMesh.geometry.attributes.position.count;
        i++
      ) {
        tints.push(...normalizedTint);
      }

      this._boxMesh.geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(new Float32Array(tints), 3)
      );
    }
    updateShadowCasting() {
      this._boxMesh.castShadow = this._cube3DRuntimeObject._isCastingShadow;
    }
    updateShadowReceiving() {
      this._boxMesh.receiveShadow =
        this._cube3DRuntimeObject._isReceivingShadow;
    }

    updateFace(faceIndex: integer) {
      const materialIndex = faceIndexToMaterialIndex[faceIndex];
      if (materialIndex === undefined) return;

      if (!this._cube3DRuntimeObject.isFaceAtIndexVisible(faceIndex)) {
        this._boxMesh.material[materialIndex] = getTransparentMaterial();
        return;
      }
      const ownedMaterial = this._pbrOwnedMaterials[materialIndex];
      if (ownedMaterial) {
        // The material was already customized by events: reconfigure it in
        // place instead of rebuilding a material.
        this._reconfigureOwnedMaterial(ownedMaterial, materialIndex);
      } else {
        this._boxMesh.material[materialIndex] = getFaceMaterial(
          this._cube3DRuntimeObject,
          faceIndex
        );
      }
      this.updateTextureUvMapping(faceIndex);
    }

    /**
     * To be called when the PBR configuration of the object changed (after
     * being changed by events). The material of the face is copied if needed
     * so that only this object is impacted by the change.
     *
     * @param faceIndex The index of the face to update. If undefined, updates all the faces.
     */
    onPBRConfigChanged(faceIndex?: integer) {
      const pbrMaterialManager = this._cube3DRuntimeObject
        .getInstanceContainer()
        .getGame()
        .getPBRMaterialManager();
      const updateFacePBR = (faceIndex: integer) => {
        if (!this._cube3DRuntimeObject.isFaceAtIndexVisible(faceIndex)) return;
        const materialIndex = faceIndexToMaterialIndex[faceIndex];
        let material = this._pbrOwnedMaterials[materialIndex];
        if (!material) {
          // Take ownership of a copy of the shared material, so that the
          // change doesn't impact the other objects using it.
          material = pbrMaterialManager.makeUniqueMaterialCopy(
            this._boxMesh.material[materialIndex]
          );
          this._pbrOwnedMaterials[materialIndex] = material;
          this._boxMesh.material[materialIndex] = material;
        }
        this._reconfigureOwnedMaterial(material, materialIndex);
        this.updateTextureUvMapping(faceIndex);
      };
      if (faceIndex === undefined) {
        for (let index = 0; index < 6; index++) updateFacePBR(index);
      } else {
        updateFacePBR(faceIndex);
      }
    }

    private _reconfigureOwnedMaterial(
      material: THREE.Material,
      materialIndex: integer
    ) {
      const faceIndex = materialIndexToFaceIndex[materialIndex];
      const pbrMaterialManager = this._cube3DRuntimeObject
        .getInstanceContainer()
        .getGame()
        .getPBRMaterialManager();
      const newMaterial = pbrMaterialManager.configureMaterial(
        material,
        getFacePBRSettings(this._cube3DRuntimeObject, faceIndex),
        getFaceMaterialOptions(this._cube3DRuntimeObject)
      );
      if (newMaterial !== material) {
        // The material type had to change (e.g. for the glass preset): the
        // new material replaces the old one.
        pbrMaterialManager.disposeUniqueMaterial(material);
        this._pbrOwnedMaterials[materialIndex] = newMaterial;
        this._boxMesh.material[materialIndex] = newMaterial;
      }
    }

    getPBRFloatValue(
      targetName: string,
      property: gdjs.PBRFloatPropertyName
    ): float {
      return this._getPBRMaterialManager().getFloatProperty(
        this._getTargetMaterial(targetName),
        property
      );
    }

    getPBRColorValue(
      targetName: string,
      property: gdjs.PBRColorPropertyName
    ): string {
      return this._getPBRMaterialManager().getColorProperty(
        this._getTargetMaterial(targetName),
        property
      );
    }

    getPBRTextureSlotName(
      targetName: string,
      slot: gdjs.PBRTextureSlotName
    ): string {
      return this._getPBRMaterialManager().getTextureSlotName(
        this._getTargetMaterial(targetName),
        slot
      );
    }

    getPBRBooleanValue(
      targetName: string,
      property: gdjs.PBRBooleanPropertyName
    ): boolean {
      return this._getPBRMaterialManager().getBooleanProperty(
        this._getTargetMaterial(targetName),
        property
      );
    }

    getPBRUvTransformValue(
      targetName: string,
      slot: gdjs.PBRTextureSlotName,
      property: gdjs.PBRUvTransformPropertyName
    ): float {
      return (
        this._getPBRMaterialManager().getUvTransform(
          this._getTargetMaterial(targetName),
          slot
        )[property] || 0
      );
    }

    private _getPBRMaterialManager(): gdjs.PBRMaterialManager {
      return this._cube3DRuntimeObject
        .getInstanceContainer()
        .getGame()
        .getPBRMaterialManager();
    }

    /**
     * Return the material used to read PBR properties: the material of the
     * face when a face is targeted, or the material of the front face when
     * the whole object is targeted.
     */
    private _getTargetMaterial(targetName: string): THREE.Material {
      const faceIndex =
        faceNameToFaceIndex[targetName] !== undefined
          ? faceNameToFaceIndex[targetName]
          : 0;
      return this._boxMesh.material[faceIndexToMaterialIndex[faceIndex]];
    }

    updateSize(): void {
      super.updateSize();
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
      const tileScale = this._cube3DRuntimeObject.getTileScale() || 1;
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
          this._cube3DRuntimeObject.shouldRepeatTextureOnFaceAtIndex(
            materialIndexToFaceIndex[materialIndex]
          );

        const shouldOrientateFacesTowardsY =
          this._cube3DRuntimeObject.getFacesOrientation() === 'Y';

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
              this._cube3DRuntimeObject.getBackFaceUpThroughWhichAxisRotation() ===
              'X';

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
        if (shouldRepeatTexture && tileScale !== 1) {
          x /= tileScale;
          y /= tileScale;
        }
        uvMapping.setXY(vertexIndex, x, y);
      }
      uvMapping.needsUpdate = true;
    }

    _updateMaterials() {
      for (let index = 0; index < 6; index++) {
        this.updateFace(index);
      }
    }
  }

  /** @category Renderers > 3D Box */
  export const Cube3DRuntimeObjectRenderer = Cube3DRuntimeObjectPixiRenderer;
  /** @category Renderers > 3D Box */
  export type Cube3DRuntimeObjectRenderer = Cube3DRuntimeObjectPixiRenderer;
}
