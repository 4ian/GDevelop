/**
 * GDevelop - Light3D Runtime Object
 * Copyright (c) 2024 GDevelop Team
 * This project is released under the MIT License.
 */

namespace gdjs {
  /**
   * Network sync data type for Light3D object
   */
  type Light3DNetworkSyncDataType = {
    e: boolean;
    i: number;
    c: string;
  };

  type Light3DNetworkSyncData = Object3DNetworkSyncData &
    Light3DNetworkSyncDataType;

  /**
   * Type for object data - using Object3DData for 3D compatibility
   */
  type Light3DObjectData = Object3DData & {
    content: {
      lightType: string;
      enabled: boolean;
      color: string;
      intensity: number;
      distance: number;
      decay: number;
      angle: number;
      penumbra: number;
      castShadow: boolean;
      shadowMapSize: number;
      shadowBias: number;
      shadowNormalBias: number;
      shadowRadius: number;
      shadowNear: number;
      shadowFar: number;
      shadowFocus: number;
      flickerEnabled: boolean;
      flickerSpeed: number;
    };
  };

  /**
   * The Light3D runtime object.
   * Uses Renderer pattern like Cube3D/Model3D for better separation of concerns
   * @category Objects > Light3D
   */
  export class Light3DRuntimeObject extends gdjs.RuntimeObject3D {
    // Renderer for Three.js objects
    private _renderer: Light3DRuntimeObjectRenderer;

    // Properties
    private _lightType: string = 'Point';
    private _enabled: boolean = true;
    private _color: string = '255;255;255';
    private _intensity: number = 1.0;
    private _distance: number = 0;
    private _decay: number = 2.0;
    private _angle: number = 45;
    private _penumbra: number = 0.0;
    private _castShadow: boolean = false;
    private _shadowMapSize: number = 1024;
    private _shadowBias: number = -0.0001;
    private _shadowNormalBias: number = 0.02;
    private _shadowRadius: number = 0;
    private _shadowNear: number = 0.5;
    private _shadowFar: number = 50;
    private _shadowFocus: number = 1.0;

    // Flicker properties
    private _flickerEnabled: boolean = false;
    private _flickerSpeed: number = 1.0;
    private _flickerTime: number = 0;
    private _baseIntensity: number = 1.0;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      objectData: Light3DObjectData,
      instanceData?: InstanceData
    ) {
      super(runtimeScene, objectData, instanceData);

      // Initialize properties from objectData
      this._lightType = objectData.content.lightType || 'Point';
      this._enabled = objectData.content.enabled !== false;
      this._color = objectData.content.color || '255;255;255';
      this._intensity = objectData.content.intensity || 1.0;
      this._distance = objectData.content.distance || 0;
      this._decay = objectData.content.decay !== undefined ? objectData.content.decay : 2.0;
      this._angle = objectData.content.angle || 45;
      this._penumbra = objectData.content.penumbra || 0.0;
      this._castShadow = objectData.content.castShadow || false;
      this._shadowMapSize = objectData.content.shadowMapSize || 1024;
      this._shadowBias = objectData.content.shadowBias !== undefined ? objectData.content.shadowBias : -0.0001;
      this._shadowNormalBias = objectData.content.shadowNormalBias !== undefined ? objectData.content.shadowNormalBias : 0.02;
      this._shadowRadius = objectData.content.shadowRadius !== undefined ? objectData.content.shadowRadius : 0;
      this._shadowNear = objectData.content.shadowNear !== undefined ? objectData.content.shadowNear : 0.5;
      this._shadowFar = objectData.content.shadowFar !== undefined ? objectData.content.shadowFar : 50;
      this._shadowFocus = objectData.content.shadowFocus !== undefined ? objectData.content.shadowFocus : 1.0;
      this._flickerEnabled = objectData.content.flickerEnabled || false;
      this._flickerSpeed = objectData.content.flickerSpeed || 1.0;

      this._baseIntensity = this._intensity;

      // Create the renderer (follows Cube3D/Model3D pattern)
      this._renderer = new gdjs.Light3DRuntimeObjectRenderer(
        this,
        runtimeScene
      );

      // Always call onCreated at the end
      this.onCreated();
    }

    // Get the renderer for external access
    getRenderer(): gdjs.RuntimeObject3DRenderer {
      return this._renderer as any;
    }

    // Update position when the object moves
    update(_instanceContainer: gdjs.RuntimeInstanceContainer): void {
      // Update renderer (position and helper)
      this._renderer.update();
      
      // Handle flicker effect
      if (this._flickerEnabled && this._enabled) {
        const runtimeScene = this.getRuntimeScene();
        if (runtimeScene) {
          const deltaTime = runtimeScene.getElapsedTime() / 1000;
          this._flickerTime += deltaTime * this._flickerSpeed;
          
          // Use sin wave for flicker effect
          const flickerAmount = Math.sin(this._flickerTime * Math.PI * 2) * 0.3 + 0.7;
          const newIntensity = this._baseIntensity * flickerAmount;
          this._renderer.updateIntensity(newIntensity);
        }
      }
    }

    override onDestroyed(): void {
      // Properly dispose Three.js resources through renderer
      this._renderer.destroy();
      super.onDestroyed();
    }

    // ========== Getters ==========

    getLightType(): string {
      return this._lightType;
    }

    isEnabled(): boolean {
      return this._enabled;
    }

    getColor(): string {
      return this._color;
    }

    getIntensity(): number {
      return this._intensity;
    }

    getDistance(): number {
      return this._distance;
    }

    getDecay(): number {
      return this._decay;
    }

    getAngle(): number {
      return this._angle;
    }

    getPenumbra(): number {
      return this._penumbra;
    }

    isCastingShadow(): boolean {
      return this._castShadow;
    }

    getShadowMapSize(): number {
      return this._shadowMapSize;
    }

    getShadowBias(): number {
      return this._shadowBias;
    }

    getShadowNormalBias(): number {
      return this._shadowNormalBias;
    }

    getShadowRadius(): number {
      return this._shadowRadius;
    }

    getShadowNear(): number {
      return this._shadowNear;
    }

    getShadowFar(): number {
      return this._shadowFar;
    }

    getShadowFocus(): number {
      return this._shadowFocus;
    }

    isFlickerEnabled(): boolean {
      return this._flickerEnabled;
    }

    getFlickerSpeed(): number {
      return this._flickerSpeed;
    }

    // ========== Setters (Actions) ==========

    setEnabled(enabled: boolean): void {
      this._enabled = enabled;
      this._renderer.updateEnabled(enabled, this._baseIntensity);
    }

    toggleLight(): void {
      this._enabled = !this._enabled;
      this._renderer.updateEnabled(this._enabled, this._baseIntensity);
    }

    toggleFlicker(): void {
      this._flickerEnabled = !this._flickerEnabled;
    }

    setFlickerSpeed(speed: number): void {
      this._flickerSpeed = Math.max(0.1, speed);
    }

    setLightType(type: string): void {
      if (type !== this._lightType) {
        this._lightType = type;
        // Recreate the light with new type
        this._renderer.recreateLight();
      }
    }

    setColor(color: string): void {
      this._color = color;
      this._renderer.updateColor(color);
    }

    setIntensity(intensity: number): void {
      this._intensity = intensity;
      this._baseIntensity = intensity;
      if (this._enabled && !this._flickerEnabled) {
        this._renderer.updateIntensity(intensity);
      }
    }

    setDistance(distance: number): void {
      this._distance = distance;
      this._renderer.updateDistance(distance);
    }

    setDecay(decay: number): void {
      this._decay = decay;
      this._renderer.updateDecay(decay);
    }

    setAngle(angle: number): void {
      this._angle = angle;
      this._renderer.updateAngle(angle);
    }

    setPenumbra(penumbra: number): void {
      this._penumbra = penumbra;
      this._renderer.updatePenumbra(penumbra);
    }

    setCastShadow(castShadow: boolean): void {
      this._castShadow = castShadow;
      this._renderer.updateCastShadow(castShadow);
    }

    setShadowMapSize(size: number): void {
      this._shadowMapSize = Math.max(256, Math.min(4096, size));
      this._renderer.updateShadowMapSize(this._shadowMapSize);
    }

    setShadowBias(bias: number): void {
      this._shadowBias = bias;
      this._renderer.updateShadowBias(bias);
    }

    setShadowNormalBias(normalBias: number): void {
      this._shadowNormalBias = Math.max(0, Math.min(1, normalBias));
      this._renderer.updateShadowNormalBias(this._shadowNormalBias);
    }

    setShadowRadius(radius: number): void {
      this._shadowRadius = Math.max(0, radius);
      this._renderer.updateShadowRadius(this._shadowRadius);
    }

    setShadowNear(near: number): void {
      this._shadowNear = near;
      this._renderer.updateShadowNear(near);
    }

    setShadowFar(far: number): void {
      this._shadowFar = far;
      this._renderer.updateShadowFar(far);
    }

    setShadowFocus(focus: number): void {
      this._shadowFocus = Math.max(0, Math.min(1, focus));
      this._renderer.updateShadowFocus(this._shadowFocus);
    }

    // ========== Conditions ==========

    isLightOn(): boolean {
      return this._enabled;
    }

    isLightType(type: string): boolean {
      return this._lightType === type;
    }

    // ========== Color Getters ==========

    getColorR(): number {
      const parts = this._color.split(';');
      if (parts.length >= 3) {
        return Math.round(parseInt(parts[0], 10));
      }
      return 255;
    }

    getColorG(): number {
      const parts = this._color.split(';');
      if (parts.length >= 3) {
        return Math.round(parseInt(parts[1], 10));
      }
      return 255;
    }

    getColorB(): number {
      const parts = this._color.split(';');
      if (parts.length >= 3) {
        return Math.round(parseInt(parts[2], 10));
      }
      return 255;
    }

    // ========== Network Sync ==========

    override getNetworkSyncData(
      syncOptions: GetNetworkSyncDataOptions
    ): Light3DNetworkSyncData {
      return {
        ...super.getNetworkSyncData(syncOptions),
        e: this._enabled,
        i: this._intensity,
        c: this._color,
      };
    }

    override updateFromNetworkSyncData(
      networkSyncData: Light3DNetworkSyncData,
      options: UpdateFromNetworkSyncDataOptions
    ): void {
      super.updateFromNetworkSyncData(networkSyncData, options);

      if (networkSyncData.e !== undefined) {
        this._enabled = networkSyncData.e;
        this._renderer.updateEnabled(this._enabled, this._baseIntensity);
      }
      if (networkSyncData.i !== undefined) {
        this.setIntensity(networkSyncData.i);
      }
      if (networkSyncData.c !== undefined) {
        this.setColor(networkSyncData.c);
      }
    }
  }

  // Register the object
  gdjs.registerObject('Light3D::Light3D', gdjs.Light3DRuntimeObject);
}
