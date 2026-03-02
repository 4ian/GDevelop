namespace gdjs {
  /**
   * @category Behaviors > 3D
   */
  export class FlickeringLightRuntimeBehavior extends gdjs.RuntimeBehavior {
    private _enabled: boolean;
    private _baseIntensity: float;
    private _flickerSpeed: float;
    private _flickerStrength: float;
    private _failChance: float;
    private _offDuration: float;
    private _targetLayerName: string;
    private _targetEffectName: string;

    private _phase: float;
    private _noise: float;
    private _remainingOffTime: float;
    private _cachedLayerName: string;
    private _cachedEffectName: string;
    private _warnedNoTargetEffect: boolean;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this._enabled =
        behaviorData.enabled === undefined ? true : !!behaviorData.enabled;
      this._baseIntensity = Math.max(
        0,
        behaviorData.baseIntensity !== undefined
          ? behaviorData.baseIntensity
          : 1.0
      );
      this._flickerSpeed = Math.max(
        0,
        behaviorData.flickerSpeed !== undefined ? behaviorData.flickerSpeed : 10
      );
      this._flickerStrength = Math.max(
        0,
        behaviorData.flickerStrength !== undefined
          ? behaviorData.flickerStrength
          : 0.4
      );
      this._failChance = Math.max(
        0,
        behaviorData.failChance !== undefined ? behaviorData.failChance : 0.02
      );
      this._offDuration = Math.max(
        0,
        behaviorData.offDuration !== undefined ? behaviorData.offDuration : 0.1
      );
      this._targetLayerName = behaviorData.targetLayerName || '';
      this._targetEffectName = behaviorData.targetEffectName || '';

      this._phase = Math.random();
      this._noise = 0;
      this._remainingOffTime = 0;
      this._cachedLayerName = '';
      this._cachedEffectName = '';
      this._warnedNoTargetEffect = false;
    }

    override applyBehaviorOverriding(behaviorData): boolean {
      if (behaviorData.enabled !== undefined) {
        this.setEnabled(!!behaviorData.enabled);
      }
      if (behaviorData.baseIntensity !== undefined) {
        this.setBaseIntensity(behaviorData.baseIntensity);
      }
      if (behaviorData.flickerSpeed !== undefined) {
        this.setFlickerSpeed(behaviorData.flickerSpeed);
      }
      if (behaviorData.flickerStrength !== undefined) {
        this.setFlickerStrength(behaviorData.flickerStrength);
      }
      if (behaviorData.failChance !== undefined) {
        this.setFailChance(behaviorData.failChance);
      }
      if (behaviorData.offDuration !== undefined) {
        this.setOffDuration(behaviorData.offDuration);
      }
      if (behaviorData.targetLayerName !== undefined) {
        this.setTargetLayerName(behaviorData.targetLayerName);
      }
      if (behaviorData.targetEffectName !== undefined) {
        this.setTargetEffectName(behaviorData.targetEffectName);
      }
      return true;
    }

    override onDeActivate(): void {
      this._remainingOffTime = 0;
      this._applyIntensity(this._baseIntensity);
    }

    override onDestroy(): void {
      this._remainingOffTime = 0;
      this._applyIntensity(this._baseIntensity);
      this._invalidateTargetEffect();
    }

    override doStepPostEvents(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): void {
      const effect = this._getTargetLightEffect();
      if (!effect) {
        return;
      }

      if (!this._enabled) {
        this._remainingOffTime = 0;
        this._applyIntensity(this._baseIntensity, effect);
        return;
      }

      const deltaTime = Math.max(0, instanceContainer.getElapsedTime() / 1000);
      if (this._remainingOffTime > 0) {
        this._remainingOffTime = Math.max(0, this._remainingOffTime - deltaTime);
        this._applyIntensity(0, effect);
        return;
      }

      if (deltaTime > 0 && this._failChance > 0) {
        const failureProbability = 1 - Math.exp(-this._failChance * deltaTime);
        if (Math.random() < failureProbability) {
          this._remainingOffTime = this._offDuration;
          this._applyIntensity(0, effect);
          return;
        }
      }

      const speed = Math.max(0, this._flickerSpeed);
      this._phase += deltaTime * speed;
      if (!Number.isFinite(this._phase)) {
        this._phase = 0;
      } else if (this._phase > 1000000) {
        this._phase -= Math.floor(this._phase);
      }
      const sine = Math.sin(this._phase * Math.PI * 2);
      const rawNoise = Math.random() * 2 - 1;
      const smoothing = Math.min(1, deltaTime * (speed * 0.5 + 3));
      this._noise += (rawNoise - this._noise) * smoothing;

      const signal = sine * 0.65 + this._noise * 0.35;
      const intensity =
        this._baseIntensity * (1 + signal * Math.max(0, this._flickerStrength));
      this._applyIntensity(Math.max(0, intensity), effect);
    }

    private _invalidateTargetEffect(): void {
      this._cachedEffectName = '';
    }

    private _isSpotOrPointLightEffect(
      effect: gdjs.PixiFiltersTools.Filter
    ): boolean {
      const anyEffect = effect as any;
      const light = anyEffect._light || anyEffect.light;
      if (!light) {
        return false;
      }
      return !!(
        light.isPointLight ||
        light.isSpotLight ||
        light.type === 'PointLight' ||
        light.type === 'SpotLight'
      );
    }

    private _getAttachedObjectName(effect: gdjs.PixiFiltersTools.Filter): string {
      const attachedObjectName = (effect as any)._attachedObjectName;
      return typeof attachedObjectName === 'string' ? attachedObjectName : '';
    }

    private _getLayerByName(
      runtimeScene: gdjs.RuntimeScene,
      layerName: string
    ): gdjs.RuntimeLayer | null {
      if (!layerName) {
        return null;
      }
      if (!runtimeScene.hasLayer(layerName)) {
        return null;
      }
      return runtimeScene.getLayer(layerName);
    }

    private _getPreferredLayer(runtimeScene: gdjs.RuntimeScene): gdjs.RuntimeLayer {
      const targetLayerName = (this._targetLayerName || '').trim();
      const fallbackLayerName = this.owner.getLayer();
      if (targetLayerName) {
        const targetLayer = this._getLayerByName(runtimeScene, targetLayerName);
        if (targetLayer) {
          return targetLayer;
        }
      }
      return runtimeScene.getLayer(fallbackLayerName);
    }

    private _warnTargetEffectNotFound(layerName: string): void {
      if (this._warnedNoTargetEffect) {
        return;
      }
      this._warnedNoTargetEffect = true;
      console.warn(
        `[Scene3D::FlickeringLight] No PointLight/SpotLight effect found for "${this.owner.getName()}" on layer "${layerName}".` +
          ` Set "Target effect name" and "Target layer name" in the behavior if needed.`
      );
    }

    private _getTargetLightEffect(): gdjs.PixiFiltersTools.Filter | null {
      const runtimeScene = this.owner.getRuntimeScene();
      const layer = this._getPreferredLayer(runtimeScene);
      const layerName = layer.getName();
      if (this._cachedLayerName !== layerName) {
        this._cachedLayerName = layerName;
        this._invalidateTargetEffect();
      }
      const rendererEffects = layer.getRendererEffects();

      const explicitTargetEffectName = (this._targetEffectName || '').trim();
      if (explicitTargetEffectName) {
        const explicitTargetEffect = rendererEffects[explicitTargetEffectName];
        if (
          explicitTargetEffect &&
          this._isSpotOrPointLightEffect(explicitTargetEffect)
        ) {
          this._cachedEffectName = explicitTargetEffectName;
          this._warnedNoTargetEffect = false;
          return explicitTargetEffect;
        }
      }

      if (this._cachedEffectName) {
        const cached = rendererEffects[this._cachedEffectName];
        if (cached && this._isSpotOrPointLightEffect(cached)) {
          this._warnedNoTargetEffect = false;
          return cached;
        }
        this._invalidateTargetEffect();
      }

      const ownerName = this.owner.getName();
      let firstLightEffectName = '';
      let firstLightEffect: gdjs.PixiFiltersTools.Filter | null = null;
      for (const effectName in rendererEffects) {
        const effect = rendererEffects[effectName];
        if (!this._isSpotOrPointLightEffect(effect)) {
          continue;
        }

        if (!firstLightEffect) {
          firstLightEffect = effect;
          firstLightEffectName = effectName;
        }

        const attachedObjectName = this._getAttachedObjectName(effect);
        if (attachedObjectName && attachedObjectName === ownerName) {
          this._cachedEffectName = effectName;
          this._warnedNoTargetEffect = false;
          return effect;
        }
      }

      if (firstLightEffect) {
        this._cachedEffectName = firstLightEffectName;
        this._warnedNoTargetEffect = false;
        return firstLightEffect;
      }

      this._invalidateTargetEffect();
      this._warnTargetEffectNotFound(layerName);
      return null;
    }

    private _applyIntensity(
      intensity: float,
      targetEffect: gdjs.PixiFiltersTools.Filter | null = null
    ): void {
      const effect = targetEffect || this._getTargetLightEffect();
      if (!effect) {
        return;
      }
      effect.updateDoubleParameter('intensity', Math.max(0, intensity));
    }

    isEnabled(): boolean {
      return this._enabled;
    }

    setEnabled(enabled: boolean): void {
      this._enabled = !!enabled;
      if (!this._enabled) {
        this._remainingOffTime = 0;
        this._applyIntensity(this._baseIntensity);
      }
    }

    getBaseIntensity(): float {
      return this._baseIntensity;
    }

    setBaseIntensity(value: float): void {
      this._baseIntensity = Math.max(0, value);
      if (!this._enabled) {
        this._applyIntensity(this._baseIntensity);
      }
    }

    getFlickerSpeed(): float {
      return this._flickerSpeed;
    }

    setFlickerSpeed(value: float): void {
      this._flickerSpeed = Math.max(0, value);
    }

    getFlickerStrength(): float {
      return this._flickerStrength;
    }

    setFlickerStrength(value: float): void {
      this._flickerStrength = Math.max(0, value);
    }

    getFailChance(): float {
      return this._failChance;
    }

    setFailChance(value: float): void {
      this._failChance = Math.max(0, value);
    }

    getOffDuration(): float {
      return this._offDuration;
    }

    setOffDuration(value: float): void {
      this._offDuration = Math.max(0, value);
    }

    getTargetLayerName(): string {
      return this._targetLayerName;
    }

    setTargetLayerName(layerName: string): void {
      const normalizedLayerName = (layerName || '').trim();
      if (this._targetLayerName === normalizedLayerName) {
        return;
      }
      this._targetLayerName = normalizedLayerName;
      this._cachedLayerName = '';
      this._invalidateTargetEffect();
      this._warnedNoTargetEffect = false;
    }

    getTargetEffectName(): string {
      return this._targetEffectName;
    }

    setTargetEffectName(effectName: string): void {
      const normalizedEffectName = (effectName || '').trim();
      if (this._targetEffectName === normalizedEffectName) {
        return;
      }
      this._targetEffectName = normalizedEffectName;
      this._invalidateTargetEffect();
      this._warnedNoTargetEffect = false;
    }
  }

  gdjs.registerBehavior(
    'Scene3D::FlickeringLight',
    gdjs.FlickeringLightRuntimeBehavior
  );
}
