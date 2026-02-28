namespace gdjs {
  /**
   * Renderer for Light3D runtime object
   * Extends RuntimeObject3DRenderer for proper 3D object integration
   */
  export class Light3DRuntimeObjectRenderer extends gdjs.RuntimeObject3DRenderer {
    private _light3DObject: Light3DRuntimeObject;
    private _instanceContainer: gdjs.RuntimeInstanceContainer;

    // Three.js objects
    private _light: THREE.SpotLight | THREE.PointLight | null = null;
    private _lightTarget: THREE.Object3D | null = null;
    private _lightHelper: THREE.SpotLightHelper | THREE.PointLightHelper | null = null;

    constructor(
      light3DObject: Light3DRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      // Create a group to hold the light representation
      const group = new THREE.Group();
      group.rotation.order = 'ZYX';
      super(light3DObject, instanceContainer, group);

      this._light3DObject = light3DObject;
      this._instanceContainer = instanceContainer;

      this._createLight();
    }

    /**
     * Get the Three.js scene from the layer renderer
     */
    private _getThreeScene(): THREE.Scene | null {
      const layerRenderer = this._instanceContainer
        .getLayer('')
        .getRenderer();
      // Use the public API method instead of accessing internal property
      return layerRenderer.getThreeScene();
    }

    private _createLight(): void {
      if (typeof THREE === 'undefined') {
        console.warn('Three.js is not loaded');
        return;
      }

      const threeScene = this._getThreeScene();
      if (!threeScene) return;

      const lightType = this._light3DObject.getLightType();
      const color = this._light3DObject.getColor();
      const intensity = this._light3DObject.getIntensity();
      const distance = this._light3DObject.getDistance();
      const decay = this._light3DObject.getDecay();
      const angle = this._light3DObject.getAngle();
      const penumbra = this._light3DObject.getPenumbra();
      const castShadow = this._light3DObject.isCastingShadow();
      const shadowMapSize = this._light3DObject.getShadowMapSize();
      const shadowBias = this._light3DObject.getShadowBias();
      const shadowNormalBias = this._light3DObject.getShadowNormalBias();
      const shadowRadius = this._light3DObject.getShadowRadius();
      const shadowNear = this._light3DObject.getShadowNear();
      const shadowFar = this._light3DObject.getShadowFar();
      const shadowFocus = this._light3DObject.getShadowFocus();

      // Parse color
      const colorRGB = this._parseColor(color);
      const threeColor = new THREE.Color(colorRGB.r, colorRGB.g, colorRGB.b);

      if (lightType === 'Spot') {
        // Create SpotLight
        this._light = new THREE.SpotLight(
          threeColor,
          intensity,
          distance,
          gdjs.toRad(angle),
          penumbra,
          decay
        );

        // Create target for spotlight direction
        this._lightTarget = new THREE.Object3D();
        this._lightTarget.position.set(0, 0, -10);
        (this._light as THREE.SpotLight).target = this._lightTarget;
        threeScene.add(this._lightTarget);
      } else {
        // Create PointLight
        this._light = new THREE.PointLight(
          threeColor,
          intensity,
          distance,
          decay
        );
      }

      // Set shadow properties
      if (this._light && castShadow) {
        this._light.castShadow = true;
        this._light.shadow.mapSize.width = shadowMapSize;
        this._light.shadow.mapSize.height = shadowMapSize;
        this._light.shadow.camera.near = shadowNear;
        this._light.shadow.camera.far = shadowFar;
        this._light.shadow.bias = shadowBias;
        this._light.shadow.normalBias = shadowNormalBias;

        if (shadowRadius > 0) {
          this._light.shadow.radius = shadowRadius;
        }

        if (lightType === 'Spot') {
          (this._light as THREE.SpotLight).shadow.focus = shadowFocus;
        }
      }

      // Set initial position
      this._updateLightPosition();

      // Add light to scene
      if (this._light) {
        threeScene.add(this._light);

        // Add helper for visualization
        this._createHelper();
      }
    }

    private _parseColor(colorStr: string): { r: number; g: number; b: number } {
      const parts = colorStr.split(';');
      if (parts.length >= 3) {
        return {
          r: parseInt(parts[0], 10) / 255,
          g: parseInt(parts[1], 10) / 255,
          b: parseInt(parts[2], 10) / 255,
        };
      }
      return { r: 1, g: 1, b: 1 };
    }

    private _createHelper(): void {
      if (typeof THREE === 'undefined' || !this._light) return;

      const threeScene = this._getThreeScene();
      if (!threeScene) return;

      // Remove existing helper
      if (this._lightHelper) {
        threeScene.remove(this._lightHelper);
        if (this._lightHelper.dispose) {
          this._lightHelper.dispose();
        }
        this._lightHelper = null;
      }

      const lightType = this._light3DObject.getLightType();

      // Use Three.js built-in helpers
      if (lightType === 'Spot') {
        this._lightHelper = new THREE.SpotLightHelper(this._light as THREE.SpotLight);
        threeScene.add(this._lightHelper);
      } else if (lightType === 'Point') {
        this._lightHelper = new THREE.PointLightHelper(this._light as THREE.PointLight, 5);
        threeScene.add(this._lightHelper);
      }
    }

    private _updateLightPosition(): void {
      if (!this._light) return;

      const x = this._light3DObject.getX() + this._light3DObject.getWidth() / 2;
      const y = this._light3DObject.getY() + this._light3DObject.getHeight() / 2;
      const z = this._light3DObject.getZ();

      this._light.position.set(x, y, z);
    }

    /**
     * Update position - called by the runtime object
     */
    updatePosition(): void {
      super.updatePosition();
      this._updateLightPosition();

      // Update helper to stay in sync
      if (this._lightHelper) {
        this._lightHelper.update();
      }
    }

    /**
     * Update the renderer
     */
    update(): void {
      this._updateLightPosition();

      // Update helper to stay in sync
      if (this._lightHelper) {
        this._lightHelper.update();
      }
    }

    // Light property updates
    updateColor(color: string): void {
      if (!this._light) return;

      const colorRGB = this._parseColor(color);
      this._light.color.setRGB(colorRGB.r, colorRGB.g, colorRGB.b);
    }

    updateIntensity(intensity: number): void {
      if (!this._light) return;

      this._light.intensity = intensity;
    }

    updateEnabled(enabled: boolean, baseIntensity: number): void {
      if (!this._light) return;

      this._light.intensity = enabled ? baseIntensity : 0;
    }

    updateDistance(distance: number): void {
      if (!this._light) return;

      this._light.distance = distance;
    }

    updateDecay(decay: number): void {
      if (!this._light) return;

      this._light.decay = decay;
    }

    updateAngle(angle: number): void {
      if (!this._light || this._light3DObject.getLightType() !== 'Spot') return;

      (this._light as THREE.SpotLight).angle = gdjs.toRad(angle);
      // Recreate helper to update cone visualization
      this._createHelper();
    }

    updatePenumbra(penumbra: number): void {
      if (!this._light || this._light3DObject.getLightType() !== 'Spot') return;

      (this._light as THREE.SpotLight).penumbra = penumbra;
    }

    updateCastShadow(castShadow: boolean): void {
      if (!this._light) return;

      this._light.castShadow = castShadow;

      if (castShadow) {
        this._light.shadow.mapSize.width = this._light3DObject.getShadowMapSize();
        this._light.shadow.mapSize.height = this._light3DObject.getShadowMapSize();
        this._light.shadow.camera.near = this._light3DObject.getShadowNear();
        this._light.shadow.camera.far = this._light3DObject.getShadowFar();
        this._light.shadow.bias = this._light3DObject.getShadowBias();

        if (this._light3DObject.getLightType() === 'Spot') {
          (this._light as THREE.SpotLight).shadow.focus = this._light3DObject.getShadowFocus();
        }

        if (this._light.shadow.map) {
          this._light.shadow.map.dispose();
          this._light.shadow.map = null as any;
        }
        this._light.shadow.needsUpdate = true;
      }
    }

    updateShadowMapSize(size: number): void {
      if (!this._light || !this._light3DObject.isCastingShadow()) return;

      this._light.shadow.mapSize.width = size;
      this._light.shadow.mapSize.height = size;

      if (this._light.shadow.map) {
        this._light.shadow.map.dispose();
        this._light.shadow.map = null as any;
      }
      this._light.shadow.needsUpdate = true;
    }

    updateShadowBias(bias: number): void {
      if (!this._light || !this._light3DObject.isCastingShadow()) return;

      this._light.shadow.bias = bias;
    }

    updateShadowNormalBias(normalBias: number): void {
      if (!this._light || !this._light3DObject.isCastingShadow()) return;

      this._light.shadow.normalBias = normalBias;
    }

    updateShadowRadius(radius: number): void {
      if (!this._light || !this._light3DObject.isCastingShadow()) return;

      this._light.shadow.radius = radius;
    }

    updateShadowNear(near: number): void {
      if (!this._light || !this._light3DObject.isCastingShadow()) return;

      this._light.shadow.camera.near = near;
      this._light.shadow.camera.updateProjectionMatrix();
    }

    updateShadowFar(far: number): void {
      if (!this._light || !this._light3DObject.isCastingShadow()) return;

      this._light.shadow.camera.far = far;
      this._light.shadow.camera.updateProjectionMatrix();
    }

    updateShadowFocus(focus: number): void {
      if (!this._light || this._light3DObject.getLightType() !== 'Spot' || !this._light3DObject.isCastingShadow()) return;

      (this._light as THREE.SpotLight).shadow.focus = focus;
    }

    // Recreate light when type changes
    recreateLight(): void {
      this._destroyLight();
      this._createLight();
    }

    private _destroyLight(): void {
      const threeScene = this._getThreeScene();

      if (this._light && threeScene) {
        threeScene.remove(this._light);

        if (this._lightTarget) {
          threeScene.remove(this._lightTarget);
          if ('dispose' in this._lightTarget && typeof this._lightTarget.dispose === 'function') {
            this._lightTarget.dispose();
          }
          this._lightTarget = null;
        }

        if (this._lightHelper) {
          threeScene.remove(this._lightHelper);
          if ('dispose' in this._lightHelper && typeof this._lightHelper.dispose === 'function') {
            this._lightHelper.dispose();
          }
          this._lightHelper = null;
        }

        if (this._light.shadow && this._light.shadow.map) {
          this._light.shadow.map.dispose();
          this._light.shadow.map = null as any;
        }

        if ('dispose' in this._light && typeof this._light.dispose === 'function') {
          this._light.dispose();
        }
        this._light = null;
      }
    }

    destroy(): void {
      this._destroyLight();
      // No need to call super.destroy() as RuntimeObject3DRenderer doesn't have it
    }

    // Get the Three.js light object for direct access
    getLight(): THREE.SpotLight | THREE.PointLight | null {
      return this._light;
    }
  }
}
