namespace gdjs {
  /**
   * Renderer for {@link gdjs.PointLight3DRuntimeObject}
   * @category Objects > 3D Point Light
   */
  export class PointLight3DRuntimeObjectRenderer extends gdjs.RuntimeObject3DRenderer {
    private _light: THREE.PointLight | null = null;
    private static readonly _infiniteLightShadowFar = 5000;

    constructor(
      object: gdjs.PointLight3DRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      const threeObject = new THREE.Group();
      super(object, instanceContainer, threeObject);
      this._createLight();
    }

    private _createLight(): void {
      const object = this._object as gdjs.PointLight3DRuntimeObject;
      const color = object.getThreeColor();
      const intensity = object.getIntensity();
      const distance = object.getDistance();
      const decay = object.getDecay();
      const threeObject = this.get3DRendererObject();

      // Remove existing light if any
      if (this._light) {
        threeObject.remove(this._light);
        this._light.dispose();
        this._light = null;
      }

      // Create Point Light
      const pointLight = new THREE.PointLight(color, intensity);
      pointLight.distance = distance;
      pointLight.decay = decay;
      pointLight.castShadow = object.isCastingShadow();

      if (pointLight.castShadow) {
        const shadowMapSize = object.getShadowMapSize();
        pointLight.shadow.mapSize.width = shadowMapSize;
        pointLight.shadow.mapSize.height = shadowMapSize;

        // Shadow camera setup for point light
        pointLight.shadow.camera.near = 0.1;
        pointLight.shadow.camera.far =
          distance <= 0
            ? PointLight3DRuntimeObjectRenderer._infiniteLightShadowFar
            : Math.max(distance * 2, 100);
        pointLight.shadow.camera.updateProjectionMatrix();

        // CRITICAL FIX: Shadow bias to prevent shadow acne
        // Point lights need higher bias values than directional lights
        // Adjust bias based on shadow map size (smaller maps need higher bias)
        const biasMultiplier = shadowMapSize < 1024 ? 2 : shadowMapSize < 2048 ? 1.5 : 1;
        pointLight.shadow.bias = -0.005 * biasMultiplier;

        // Add shadow radius for softer shadows (reduces pixelation artifacts)
        pointLight.shadow.radius = 2;

        // Ensure shadow map is updated
        pointLight.shadow.needsUpdate = true;
      }

      this._light = pointLight;
      threeObject.add(this._light);
    }

    /**
     * Update the light color.
     */
    updateColor(): void {
      if (!this._light) return;
      const object = this._object as gdjs.PointLight3DRuntimeObject;
      this._light.color = object.getThreeColor();
    }

    /**
     * Update the light intensity.
     */
    updateIntensity(): void {
      if (!this._light) return;
      const object = this._object as gdjs.PointLight3DRuntimeObject;
      this._light.intensity = object.getIntensity();
    }

    /**
     * Update the light distance/range.
     */
    updateDistance(): void {
      if (!this._light) return;
      const object = this._object as gdjs.PointLight3DRuntimeObject;
      this._light.distance = object.getDistance();

      // Update shadow camera far plane when distance changes
      if (this._light.castShadow) {
        const distance = object.getDistance();
        this._light.shadow.camera.far =
          distance <= 0
            ? PointLight3DRuntimeObjectRenderer._infiniteLightShadowFar
            : Math.max(distance * 2, 100);
        this._light.shadow.camera.updateProjectionMatrix();
      }
    }

    /**
     * Update the light decay.
     */
    updateDecay(): void {
      if (!this._light) return;
      const object = this._object as gdjs.PointLight3DRuntimeObject;
      this._light.decay = object.getDecay();
    }

    /**
     * Update shadow casting.
     */
    updateCastShadow(): void {
      if (!this._light) return;
      const object = this._object as gdjs.PointLight3DRuntimeObject;
      const newCastShadow = object.isCastingShadow();
      
      // If toggling shadow casting, recreate the light to properly initialize shadow properties
      if (this._light.castShadow !== newCastShadow) {
        this._createLight();
      }
    }

    /**
     * Update shadow map size.
     */
    updateShadowMapSize(): void {
      if (!this._light || !this._light.castShadow) return;
      const object = this._object as gdjs.PointLight3DRuntimeObject;
      const newSize = object.getShadowMapSize();
      
      // Dispose old shadow map and recreate with new size
      if (this._light.shadow.map) {
        this._light.shadow.map.dispose();
        this._light.shadow.map = null;
      }
      
      this._light.shadow.mapSize.width = newSize;
      this._light.shadow.mapSize.height = newSize;
      
      // Recalculate bias based on new size
      const biasMultiplier = newSize < 1024 ? 2 : newSize < 2048 ? 1.5 : 1;
      this._light.shadow.bias = -0.005 * biasMultiplier;
      
      this._light.shadow.needsUpdate = true;
    }

    /**
     * Dispose resources when the object is destroyed.
     */
    dispose(): void {
      if (this._light) {
        const threeObject = this.get3DRendererObject();
        threeObject.remove(this._light);
        this._light.dispose();
        this._light = null;
      }
    }
  }
}
