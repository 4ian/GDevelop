namespace gdjs {
  /**
   * Renderer for {@link gdjs.PointLight3DRuntimeObject}
   * @category Objects > 3D Point Light
   */
  export class PointLight3DRuntimeObjectRenderer extends gdjs.RuntimeObject3DRenderer {
    private _light: THREE.PointLight | null = null;
    private _unregisterShadowSettingsListener: (() => void) | null = null;

    private _getShadowManager():
      | {
          applyPointLightShadow?: (
            runtimeLayer: gdjs.RuntimeLayer | null,
            pointLight: THREE.PointLight,
            options: {
              castShadow: boolean;
              shadowMapSize: number;
              lightDistance: number;
              forceUpdate?: boolean;
            }
          ) => void;
          registerShadowSettingsObserver?: (
            runtimeLayer: gdjs.RuntimeLayer | null,
            refreshShadows: () => void
          ) => () => void;
          registerPointLightRenderer?: (
            runtimeLayer: gdjs.RuntimeLayer | null,
            refreshShadows: () => void
          ) => () => void;
        }
      | null {
      const scene3dAny = gdjs.scene3d as any;
      if (!scene3dAny || !scene3dAny.shadows) {
        return null;
      }
      return scene3dAny.shadows;
    }

    private _getRuntimeLayer(): gdjs.RuntimeLayer | null {
      const object = this._object as gdjs.PointLight3DRuntimeObject;
      const instanceContainer = object.getInstanceContainer();
      if (!instanceContainer || !instanceContainer.getLayer) {
        return null;
      }
      const runtimeLayer = instanceContainer.getLayer(object.getLayer());
      return runtimeLayer || null;
    }

    private _applyShadowSettings(forceUpdate = false): void {
      if (!this._light) return;
      const object = this._object as gdjs.PointLight3DRuntimeObject;
      const runtimeLayer = this._getRuntimeLayer();
      const shadowManager = this._getShadowManager();
      if (
        shadowManager &&
        typeof shadowManager.applyPointLightShadow === 'function'
      ) {
        shadowManager.applyPointLightShadow(runtimeLayer, this._light, {
          castShadow: object.isCastingShadow(),
          shadowMapSize: object.getShadowMapSize(),
          lightDistance: object.getDistance(),
          forceUpdate,
        });
        return;
      }
      this._light.castShadow = false;
    }

    constructor(
      object: gdjs.PointLight3DRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      const threeObject = new THREE.Group();
      super(object, instanceContainer, threeObject);
      const shadowManager = this._getShadowManager();
      const registerShadowSettingsObserver =
        shadowManager &&
        typeof shadowManager.registerShadowSettingsObserver === 'function'
          ? shadowManager.registerShadowSettingsObserver.bind(shadowManager)
          : shadowManager &&
              typeof shadowManager.registerPointLightRenderer === 'function'
            ? shadowManager.registerPointLightRenderer.bind(shadowManager)
            : null;
      if (registerShadowSettingsObserver) {
        const runtimeLayer = this._getRuntimeLayer();
        this._unregisterShadowSettingsListener = registerShadowSettingsObserver(
          runtimeLayer,
          () => {
            this._applyShadowSettings(true);
          }
        );
      }
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

      this._light = pointLight;
      threeObject.add(this._light);
      this._applyShadowSettings(true);
    }

    /**
     * Update the light color.
     */
    updateColor(): void {
      if (!this._light) return;
      const object = this._object as gdjs.PointLight3DRuntimeObject;
      this._light.color.copy(object.getThreeColor());
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
      this._applyShadowSettings();
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
      this._applyShadowSettings(true);
    }

    /**
     * Update shadow map size.
     */
    updateShadowMapSize(): void {
      this._applyShadowSettings(true);
    }

    /**
     * Dispose resources when the object is destroyed.
     */
    dispose(): void {
      if (this._unregisterShadowSettingsListener) {
        this._unregisterShadowSettingsListener();
        this._unregisterShadowSettingsListener = null;
      }
      if (this._light) {
        const threeObject = this.get3DRendererObject();
        threeObject.remove(this._light);
        this._light.dispose();
        this._light = null;
      }
    }
  }
}
