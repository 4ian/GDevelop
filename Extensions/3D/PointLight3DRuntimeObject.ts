namespace gdjs {
  const pointLightAllowedShadowMapSizes = [256, 512, 1024, 2048, 4096];
  const sanitizePointLightShadowMapSize = (rawSize: number): number => {
    if (!Number.isFinite(rawSize)) {
      return 1024;
    }
    const roundedSize = Math.round(rawSize);
    const clampedSize = Math.max(256, Math.min(4096, roundedSize));
    let nearestSize = pointLightAllowedShadowMapSizes[0];
    let nearestDistance = Math.abs(clampedSize - nearestSize);
    for (let index = 1; index < pointLightAllowedShadowMapSizes.length; index++) {
      const candidateSize = pointLightAllowedShadowMapSizes[index];
      const candidateDistance = Math.abs(clampedSize - candidateSize);
      if (candidateDistance < nearestDistance) {
        nearestSize = candidateSize;
        nearestDistance = candidateDistance;
      }
    }
    return nearestSize;
  };

  /**
   * Base parameters for {@link gdjs.PointLight3DRuntimeObject}
   * @category Objects > 3D Point Light
   */
  export interface PointLight3DObjectData extends Object3DData {
    /** The base parameters of the PointLight3D object */
    content: Object3DDataContent & {
      color: string;
      intensity: number;
      distance: number;
      decay: number;
      castShadow: boolean;
      shadowMapSize: number;
    };
  }

  type PointLight3DObjectNetworkSyncDataType = {
    c: string;
    i: number;
    d: number;
    dc: number;
    cs: boolean;
    sms: number;
  };

  type PointLight3DObjectNetworkSyncData = Object3DNetworkSyncData &
    PointLight3DObjectNetworkSyncDataType;

  /**
   * A 3D Point Light that illuminates the scene in all directions.
   * @category Objects > 3D Point Light
   */
  export class PointLight3DRuntimeObject extends gdjs.RuntimeObject3D {
    private _renderer: PointLight3DRuntimeObjectRenderer;
    private _color: string;
    private _intensity: number;
    private _distance: number;
    private _decay: number;
    private _castShadow: boolean;
    private _shadowMapSize: number;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: PointLight3DObjectData,
      instanceData?: InstanceData
    ) {
      super(instanceContainer, objectData, instanceData);

      const content = objectData.content;
      this._color = content.color || '255;255;255';
      this._intensity = content.intensity !== undefined ? content.intensity : 1;
      this._distance = content.distance !== undefined ? content.distance : 100;
      this._decay = content.decay !== undefined ? content.decay : 2;
      this._castShadow = content.castShadow || false;
      this._shadowMapSize = sanitizePointLightShadowMapSize(
        content.shadowMapSize !== undefined ? content.shadowMapSize : 1024
      );

      this._renderer = new gdjs.PointLight3DRuntimeObjectRenderer(
        this,
        instanceContainer
      );
      this.registerDestroyCallback(() => {
        this._renderer.dispose();
      });

      // *ALWAYS* call `this.onCreated()` at the very end of your object constructor.
      this.onCreated();
    }

    /**
     * Get the light color.
     */
    getColor(): string {
      return this._color;
    }

    /**
     * Set the light color.
     */
    setColor(color: string): void {
      if (this._color === color) return;
      this._color = color;
      this._renderer.updateColor();
    }

    /**
     * Get the light intensity.
     */
    getIntensity(): number {
      return this._intensity;
    }

    /**
     * Set the light intensity.
     */
    setIntensity(intensity: number): void {
      if (this._intensity === intensity) return;
      this._intensity = intensity;
      this._renderer.updateIntensity();
    }

    /**
     * Get the light range (distance).
     */
    getDistance(): number {
      return this._distance;
    }

    /**
     * Set the light range (distance).
     */
    setDistance(distance: number): void {
      if (this._distance === distance) return;
      this._distance = distance;
      this._renderer.updateDistance();
    }

    /**
     * Get the light decay.
     */
    getDecay(): number {
      return this._decay;
    }

    /**
     * Set the light decay.
     */
    setDecay(decay: number): void {
      if (this._decay === decay) return;
      this._decay = decay;
      this._renderer.updateDecay();
    }

    /**
     * Check if the light is casting shadows.
     */
    isCastingShadow(): boolean {
      return this._castShadow;
    }

    /**
     * Set whether the light should cast shadows.
     */
    setCastShadow(castShadow: boolean): void {
      if (this._castShadow === castShadow) return;
      this._castShadow = castShadow;
      this._renderer.updateCastShadow();
    }

    /**
     * Get the shadow map size.
     */
    getShadowMapSize(): number {
      return this._shadowMapSize;
    }

    /**
     * Set the shadow map size.
     */
    setShadowMapSize(shadowMapSize: number): void {
      const sanitizedShadowMapSize = sanitizePointLightShadowMapSize(shadowMapSize);
      if (this._shadowMapSize === sanitizedShadowMapSize) return;
      this._shadowMapSize = sanitizedShadowMapSize;
      this._renderer.updateShadowMapSize();
    }

    /**
     * Get the renderer for this object.
     */
    getRenderer(): gdjs.RuntimeObject3DRenderer {
      return this._renderer;
    }

    updateFromObjectData(
      oldObjectData: PointLight3DObjectData,
      newObjectData: PointLight3DObjectData
    ): boolean {
      super.updateFromObjectData(oldObjectData, newObjectData);

      if (oldObjectData.content.color !== newObjectData.content.color) {
        this.setColor(newObjectData.content.color || '255;255;255');
      }
      if (oldObjectData.content.intensity !== newObjectData.content.intensity) {
        this.setIntensity(
          newObjectData.content.intensity !== undefined
            ? newObjectData.content.intensity
            : 1
        );
      }
      if (oldObjectData.content.distance !== newObjectData.content.distance) {
        this.setDistance(
          newObjectData.content.distance !== undefined
            ? newObjectData.content.distance
            : 100
        );
      }
      if (oldObjectData.content.decay !== newObjectData.content.decay) {
        this.setDecay(
          newObjectData.content.decay !== undefined
            ? newObjectData.content.decay
            : 2
        );
      }
      if (oldObjectData.content.castShadow !== newObjectData.content.castShadow) {
        this.setCastShadow(newObjectData.content.castShadow || false);
      }
      if (
        oldObjectData.content.shadowMapSize !== newObjectData.content.shadowMapSize
      ) {
        this.setShadowMapSize(
          newObjectData.content.shadowMapSize !== undefined
            ? newObjectData.content.shadowMapSize
            : 1024
        );
      }

      return true;
    }

    getNetworkSyncData(
      syncOptions: GetNetworkSyncDataOptions
    ): PointLight3DObjectNetworkSyncData {
      return {
        ...super.getNetworkSyncData(syncOptions),
        c: this._color,
        i: this._intensity,
        d: this._distance,
        dc: this._decay,
        cs: this._castShadow,
        sms: this._shadowMapSize,
      };
    }

    updateFromNetworkSyncData(
      networkSyncData: PointLight3DObjectNetworkSyncData,
      options: UpdateFromNetworkSyncDataOptions
    ): void {
      super.updateFromNetworkSyncData(networkSyncData, options);

      if (networkSyncData.c !== undefined && this._color !== networkSyncData.c) {
        this.setColor(networkSyncData.c);
      }
      if (networkSyncData.i !== undefined && this._intensity !== networkSyncData.i) {
        this.setIntensity(networkSyncData.i);
      }
      if (networkSyncData.d !== undefined && this._distance !== networkSyncData.d) {
        this.setDistance(networkSyncData.d);
      }
      if (networkSyncData.dc !== undefined && this._decay !== networkSyncData.dc) {
        this.setDecay(networkSyncData.dc);
      }
      if (networkSyncData.cs !== undefined && this._castShadow !== networkSyncData.cs) {
        this.setCastShadow(networkSyncData.cs);
      }
      if (
        networkSyncData.sms !== undefined &&
        this._shadowMapSize !== networkSyncData.sms
      ) {
        this.setShadowMapSize(networkSyncData.sms);
      }
    }

    /**
     * Convert the color string to a Three.js color.
     * @internal
     */
    getThreeColor(): THREE.Color {
      const [rawR = '255', rawG = '255', rawB = '255'] = this._color.split(';');
      const toChannel = (value: string): number => {
        const channel = parseInt(value, 10);
        if (!Number.isFinite(channel)) return 1;
        if (channel <= 0) return 0;
        if (channel >= 255) return 1;
        return channel / 255;
      };
      const r = toChannel(rawR);
      const g = toChannel(rawG);
      const b = toChannel(rawB);
      return new THREE.Color(r, g, b);
    }
  }

  gdjs.registerObject('Scene3D::PointLight3DObject', gdjs.PointLight3DRuntimeObject);
}
