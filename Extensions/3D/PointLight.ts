namespace gdjs {
  interface PointLightFilterNetworkSyncData {
    i: number;
    c: number;
    x: number;
    y: number;
    z: number;
    d: number;
    dc: number;
    sb: number;
    snb: number;
    sn: number;
    sf: number;
    sr?: number;
    ao?: string;
    ox?: number;
    oy?: number;
    oz?: number;
    ro?: boolean;
    fr?: boolean;
    ia?: boolean;
    sms?: number;
    sat?: boolean;
    cs?: boolean;
  }

  interface LightingPipelineState {
    mode?: string;
    realtimeWeight?: number;
    attenuationModel?: string;
    attenuationDistanceScale?: number;
    attenuationDecayScale?: number;
    realtimeShadowsOnly?: boolean;
    physicallyCorrectLights?: boolean;
    shadowQualityScale?: number;
  }

  const lightingPipelineStateKey = '__gdScene3dLightingPipelineState';

  const getLightingPipelineState = (
    scene: THREE.Scene | null | undefined
  ): LightingPipelineState | null => {
    if (!scene) {
      return null;
    }
    const state = (scene as THREE.Scene & {
      userData?: { [key: string]: any };
    }).userData?.[lightingPipelineStateKey] as LightingPipelineState | undefined;
    return state || null;
  };

  const getRealtimeLightingMultiplier = (
    state: LightingPipelineState | null
  ): number => {
    if (!state || !state.mode) {
      return 1;
    }
    if (state.mode === 'realtime') {
      return 1;
    }
    if (state.mode === 'baked') {
      return 0;
    }
    return gdjs.evtTools.common.clamp(
      0,
      1,
      state.realtimeWeight !== undefined ? state.realtimeWeight : 0.75
    );
  };

  const shouldUseRealtimeShadows = (
    state: LightingPipelineState | null,
    realtimeMultiplier: number
  ): boolean => {
    if (!state || state.realtimeShadowsOnly === undefined) {
      return true;
    }
    if (!state.realtimeShadowsOnly) {
      return true;
    }
    return realtimeMultiplier > 0.02;
  };

  const getAttenuationModelMultipliers = (
    model: string
  ): { distanceScale: number; decayScale: number } => {
    if (model === 'cinematic') {
      return { distanceScale: 1.35, decayScale: 0.75 };
    }
    if (model === 'stylized') {
      return { distanceScale: 1.6, decayScale: 0.55 };
    }
    if (model === 'physical') {
      return { distanceScale: 1, decayScale: 1 };
    }
    return { distanceScale: 1.12, decayScale: 0.9 };
  };

  const computePipelineAttenuation = (
    distance: number,
    decay: number,
    state: LightingPipelineState | null
  ): { distance: number; decay: number } => {
    if (!state) {
      return { distance: Math.max(0, distance), decay: Math.max(0, decay) };
    }
    const modelMultipliers = getAttenuationModelMultipliers(
      state.attenuationModel || 'balanced'
    );
    const distanceScale =
      Math.max(0, state.attenuationDistanceScale ?? 1) *
      modelMultipliers.distanceScale;
    const decayScale =
      Math.max(0, state.attenuationDecayScale ?? 1) * modelMultipliers.decayScale;
    return {
      distance: distance > 0 ? Math.max(0, distance * distanceScale) : 0,
      decay: Math.max(0, decay * decayScale),
    };
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::PointLight',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          private _top: string = 'Z+';
          private _positionX: float = 0;
          private _positionY: float = 0;
          private _positionZ: float = 500;
          private _distance: float = 0;
          private _decay: float = 2;
          private _intensity: float = 1;
          private _shadowMapSize: float = 1024;
          private _shadowBias: float = -0.001;
          private _shadowNormalBias: float = 0.02;
          private _shadowRadius: float = 1.5;
          private _shadowNear: float = 1;
          private _shadowFar: float = 10000;
          private _attachedObjectName: string = '';
          private _attachedOffsetX: float = 0;
          private _attachedOffsetY: float = 0;
          private _attachedOffsetZ: float = 0;
          private _rotateOffsetsWithObjectAngle: boolean = false;
          private _followAttachedObjectRotation3D: boolean = false;
          private _inheritAttachedObjectScale: boolean = false;
          private _shadowAutoTuningEnabled: boolean = true;

          private _isEnabled: boolean = false;
          private _isCastingShadow: boolean = false;
          private _pipelineRealtimeMultiplier: float = 1;
          private _pipelineAllowsRealtimeShadows: boolean = true;
          private _pipelineShadowQualityScale: float = 1;
          private _light: THREE.PointLight;
          private _shadowMapDirty = true;
          private _shadowCameraDirty = true;
          private _effectiveShadowMapSize: integer = 1024;
          private _maxRendererShadowMapSize: integer = 2048;
          private _temporaryOffsetVector = new THREE.Vector3();
          private _temporaryEuler = new THREE.Euler(0, 0, 0, 'ZYX');

          constructor() {
            this._light = new THREE.PointLight();
            this._top = effectData.stringParameters.top || this._top;
            this._positionX =
              effectData.doubleParameters.positionX !== undefined
                ? effectData.doubleParameters.positionX
                : this._positionX;
            this._positionY =
              effectData.doubleParameters.positionY !== undefined
                ? effectData.doubleParameters.positionY
                : this._positionY;
            this._positionZ =
              effectData.doubleParameters.positionZ !== undefined
                ? effectData.doubleParameters.positionZ
                : this._positionZ;
            this._intensity = Math.max(
              0,
              effectData.doubleParameters.intensity !== undefined
                ? effectData.doubleParameters.intensity
                : this._light.intensity
            );
            this._distance = Math.max(
              0,
              effectData.doubleParameters.distance !== undefined
                ? effectData.doubleParameters.distance
                : this._distance
            );
            this._decay = Math.max(
              0,
              effectData.doubleParameters.decay !== undefined
                ? effectData.doubleParameters.decay
                : this._decay
            );
            this._shadowBias = -Math.max(
              0,
              effectData.doubleParameters.shadowBias !== undefined
                ? effectData.doubleParameters.shadowBias
                : -this._shadowBias
            );
            this._shadowNormalBias = Math.max(
              0,
              effectData.doubleParameters.shadowNormalBias !== undefined
                ? effectData.doubleParameters.shadowNormalBias
                : this._shadowNormalBias
            );
            this._shadowRadius = Math.max(
              0,
              effectData.doubleParameters.shadowRadius !== undefined
                ? effectData.doubleParameters.shadowRadius
                : this._shadowRadius
            );
            this._shadowNear = Math.max(
              0.01,
              effectData.doubleParameters.shadowNear !== undefined
                ? effectData.doubleParameters.shadowNear
                : this._shadowNear
            );
            this._shadowFar = Math.max(
              this._shadowNear + 1,
              effectData.doubleParameters.shadowFar !== undefined
                ? effectData.doubleParameters.shadowFar
                : this._shadowFar
            );
            this._isCastingShadow =
              effectData.booleanParameters.isCastingShadow === undefined
                ? false
                : !!effectData.booleanParameters.isCastingShadow;
            this._shadowAutoTuningEnabled =
              effectData.booleanParameters.shadowAutoTuning === undefined
                ? true
                : !!effectData.booleanParameters.shadowAutoTuning;

            if (effectData.stringParameters.shadowQuality) {
              this._applyShadowQualityPreset(
                effectData.stringParameters.shadowQuality
              );
            } else if (effectData.doubleParameters.shadowMapSize !== undefined) {
              this._shadowMapSize = this._getClosestShadowMapSize(
                effectData.doubleParameters.shadowMapSize
              );
            }
            this._light.position.set(
              this._positionX,
              this._positionY,
              this._positionZ
            );
            this._light.intensity = this._intensity;
            this._light.distance = this._distance;
            this._light.decay = this._decay;
            this._light.color.setHex(
              gdjs.rgbOrHexStringToNumber(
                effectData.stringParameters.color || '255;255;255'
              )
            );
            this._light.castShadow = this._isCastingShadow;

            // Configure shadow defaults
            this._light.shadow.bias = this._shadowBias;
            this._light.shadow.normalBias = this._shadowNormalBias;
            this._light.shadow.radius = this._shadowRadius;
            this._light.shadow.camera.near = this._shadowNear;
            this._light.shadow.camera.far = this._shadowFar;
            this._light.shadow.camera.updateProjectionMatrix();
          }

          private _applyLightingPipeline(target: gdjs.EffectsTarget): void {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            const pipelineState = getLightingPipelineState(scene);
            this._pipelineRealtimeMultiplier =
              getRealtimeLightingMultiplier(pipelineState);

            this._light.intensity =
              this._intensity * this._pipelineRealtimeMultiplier;
            const attenuation = computePipelineAttenuation(
              this._distance,
              this._decay,
              pipelineState
            );
            this._light.distance = attenuation.distance;
            this._light.decay = attenuation.decay;

            this._pipelineAllowsRealtimeShadows = shouldUseRealtimeShadows(
              pipelineState,
              this._pipelineRealtimeMultiplier
            );
            let targetShadowQualityScale = 1;
            if (pipelineState) {
              const baseScale = Math.max(
                0.35,
                Math.min(2, pipelineState.shadowQualityScale ?? 1)
              );
              if (pipelineState.mode === 'baked') {
                targetShadowQualityScale = baseScale * 0.45;
              } else if (pipelineState.mode === 'hybrid') {
                targetShadowQualityScale =
                  baseScale * (0.6 + 0.4 * this._pipelineRealtimeMultiplier);
              } else {
                targetShadowQualityScale = baseScale;
              }
            }
            targetShadowQualityScale = Math.max(
              0.35,
              Math.min(2, targetShadowQualityScale)
            );
            if (
              Math.abs(targetShadowQualityScale - this._pipelineShadowQualityScale) >
              0.001
            ) {
              this._pipelineShadowQualityScale = targetShadowQualityScale;
              this._shadowMapDirty = true;
            }

            const shouldCastShadow =
              this._isCastingShadow && this._pipelineAllowsRealtimeShadows;
            if (this._light.castShadow !== shouldCastShadow) {
              this._light.castShadow = shouldCastShadow;
              if (shouldCastShadow) {
                this._shadowMapDirty = true;
                this._shadowCameraDirty = true;
                this._light.shadow.needsUpdate = true;
              }
            }

            if (pipelineState) {
              const runtimeScene = target.getRuntimeScene
                ? target.getRuntimeScene()
                : null;
              if (runtimeScene && runtimeScene.getGame) {
                const gameRenderer = runtimeScene.getGame().getRenderer();
                if (gameRenderer && (gameRenderer as any).getThreeRenderer) {
                  const threeRenderer = (gameRenderer as any).getThreeRenderer() as
                    | THREE.WebGLRenderer
                    | null;
                  if (threeRenderer) {
                    const rendererWithLightingMode = threeRenderer as
                      | (THREE.WebGLRenderer & {
                          physicallyCorrectLights?: boolean;
                        })
                      | null;
                    if (
                      rendererWithLightingMode &&
                      typeof rendererWithLightingMode.physicallyCorrectLights ===
                        'boolean' &&
                      pipelineState.physicallyCorrectLights !== undefined
                    ) {
                      rendererWithLightingMode.physicallyCorrectLights =
                        !!pipelineState.physicallyCorrectLights;
                    }
                  }
                }
              }
            }
          }

          private _clampShadowMapSizeToRenderer(size: integer): integer {
            const safeRendererMax = Math.max(512, this._maxRendererShadowMapSize);
            let clampedSize = 512;
            while (clampedSize * 2 <= safeRendererMax) {
              clampedSize *= 2;
            }
            return Math.max(512, Math.min(size, clampedSize));
          }

          private _getClosestShadowMapSize(value: float): integer {
            const supportedSizes = [512, 1024, 2048, 4096];
            const target = Math.max(512, value);
            let closestSize = supportedSizes[0];
            let closestDelta = Math.abs(target - closestSize);
            for (let i = 1; i < supportedSizes.length; i++) {
              const size = supportedSizes[i];
              const delta = Math.abs(target - size);
              if (delta < closestDelta) {
                closestDelta = delta;
                closestSize = size;
              }
            }
            return this._clampShadowMapSizeToRenderer(closestSize);
          }

          private _applyShadowQualityPreset(quality: string): void {
            if (quality === 'low') {
              this._shadowMapSize = this._getClosestShadowMapSize(512);
              return;
            }
            if (quality === 'medium') {
              this._shadowMapSize = this._getClosestShadowMapSize(1024);
              return;
            }
            if (quality === 'high') {
              this._shadowMapSize = this._getClosestShadowMapSize(2048);
            }
          }

          private _ensureSoftShadowRenderer(target: gdjs.EffectsTarget): void {
            const runtimeScene = target.getRuntimeScene();
            if (!runtimeScene || !runtimeScene.getGame) {
              return;
            }
            const gameRenderer = runtimeScene.getGame().getRenderer();
            if (!gameRenderer || !(gameRenderer as any).getThreeRenderer) {
              return;
            }
            const threeRenderer = (gameRenderer as any).getThreeRenderer();
            if (!threeRenderer || !threeRenderer.shadowMap) {
              return;
            }

            const rendererMaxTextureSize =
              threeRenderer.capabilities &&
              typeof threeRenderer.capabilities.maxTextureSize === 'number'
                ? threeRenderer.capabilities.maxTextureSize
                : 2048;
            this._maxRendererShadowMapSize = Math.max(
              512,
              rendererMaxTextureSize
            );

            if (!this._light.castShadow) {
              return;
            }

            threeRenderer.shadowMap.enabled = true;
            threeRenderer.shadowMap.autoUpdate = true;
            const preferredShadowType =
              this._shadowRadius > 1
                ? THREE.PCFShadowMap
                : THREE.PCFSoftShadowMap;
            if (
              preferredShadowType === THREE.PCFShadowMap ||
              threeRenderer.shadowMap.type !== THREE.PCFShadowMap
            ) {
              threeRenderer.shadowMap.type = preferredShadowType;
            }
          }

          private _updateShadowMapSize(): void {
            if (!this._shadowMapDirty) {
              return;
            }
            this._shadowMapDirty = false;

            const rendererCappedPointMax = this._clampShadowMapSizeToRenderer(
              2048
            );
            this._effectiveShadowMapSize = Math.max(
              512,
              Math.min(
                rendererCappedPointMax,
                this._getClosestShadowMapSize(
                  this._shadowMapSize * this._pipelineShadowQualityScale
                )
              )
            );
            this._light.shadow.mapSize.set(
              this._effectiveShadowMapSize,
              this._effectiveShadowMapSize
            );

            // Force the recreation of the shadow map texture:
            this._light.shadow.map?.dispose();
            this._light.shadow.map = null;
            this._light.shadow.needsUpdate = true;
          }

          private _updateShadowCamera(): void {
            if (!this._shadowCameraDirty) {
              return;
            }
            this._shadowCameraDirty = false;

            const safeNear = Math.max(0.01, this._shadowNear);
            this._shadowNear = safeNear;
            
            // Auto-adjust far plane if distance is explicitly set
            const effectiveFar = (this._distance > 0) ? 
                Math.min(this._shadowFar, this._distance + Math.max(50, this._distance * 0.25)) : 
                this._shadowFar;

            this._light.shadow.camera.near = safeNear;
            this._light.shadow.camera.far = Math.max(safeNear + 1, effectiveFar);
            this._light.shadow.camera.updateProjectionMatrix();
          }

          private _applyShadowTuning(): void {
            const manualBias = Math.max(0, -this._shadowBias);
            const manualNormalBias = Math.max(0, this._shadowNormalBias);
            if (!this._shadowAutoTuningEnabled) {
              this._light.shadow.bias = -manualBias;
              this._light.shadow.normalBias = manualNormalBias;
              this._light.shadow.radius = this._shadowRadius;
              return;
            }

            const shadowFar = Math.max(1, this._light.shadow.camera.far);
            const texelWorldSize =
              (shadowFar * 2) / Math.max(1, this._effectiveShadowMapSize);
            const automaticBias = Math.max(0.00005, texelWorldSize * 0.0008);
            const automaticNormalBias = texelWorldSize * 0.03;

            this._light.shadow.bias = -Math.max(manualBias, automaticBias);
            this._light.shadow.normalBias = Math.max(
              manualNormalBias,
              automaticNormalBias
            );
            this._light.shadow.radius = this._shadowRadius;
          }

          private _setLightPosition(x: float, y: float, z: float): void {
            if (this._top === 'Y-') {
              this._light.position.set(
                x,
                -z,
                y
              );
            } else {
              this._light.position.set(
                x,
                y,
                z
              );
            }
          }

          private _updatePosition(): void {
            this._setLightPosition(
              this._positionX,
              this._positionY,
              this._positionZ
            );
          }

          private _getFirstObjectByName(
            target: EffectsTarget,
            objectName: string
          ): gdjs.RuntimeObject | null {
            if (!objectName) {
              return null;
            }
            const objects = target.getRuntimeScene().getObjects(objectName);
            if (!objects || objects.length === 0) {
              return null;
            }
            return objects[0];
          }

          private _getObjectCenterZ(object: gdjs.RuntimeObject): float {
            const object3D = object as gdjs.RuntimeObject & {
              getCenterZInScene?: () => float;
            };
            return typeof object3D.getCenterZInScene === 'function'
              ? object3D.getCenterZInScene()
              : 0;
          }

          private _getRotatedOffsets(
            object: gdjs.RuntimeObject,
            offsetX: float,
            offsetY: float
          ): [float, float] {
            if (!this._rotateOffsetsWithObjectAngle) {
              return [offsetX, offsetY];
            }
            const angleRad = gdjs.toRad(object.getAngle());
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            return [
              offsetX * cos - offsetY * sin,
              offsetX * sin + offsetY * cos,
            ];
          }

          private _getObjectRotationX(object: gdjs.RuntimeObject): float {
            const object3D = object as gdjs.RuntimeObject & {
              getRotationX?: () => float;
            };
            return typeof object3D.getRotationX === 'function'
              ? object3D.getRotationX()
              : 0;
          }

          private _getObjectRotationY(object: gdjs.RuntimeObject): float {
            const object3D = object as gdjs.RuntimeObject & {
              getRotationY?: () => float;
            };
            return typeof object3D.getRotationY === 'function'
              ? object3D.getRotationY()
              : 0;
          }

          private _getRotatedOffsets3D(
            object: gdjs.RuntimeObject,
            offsetX: float,
            offsetY: float,
            offsetZ: float
          ): [float, float, float] {
            this._temporaryEuler.set(
              gdjs.toRad(this._getObjectRotationX(object)),
              gdjs.toRad(this._getObjectRotationY(object)),
              gdjs.toRad(object.getAngle()),
              'ZYX'
            );
            this._temporaryOffsetVector.set(offsetX, offsetY, offsetZ);
            this._temporaryOffsetVector.applyEuler(this._temporaryEuler);
            return [
              this._temporaryOffsetVector.x,
              this._temporaryOffsetVector.y,
              this._temporaryOffsetVector.z,
            ];
          }

          private _getObjectScaleX(object: gdjs.RuntimeObject): float {
            const scalableObject = object as gdjs.RuntimeObject & {
              getScaleX?: () => float;
            };
            if (typeof scalableObject.getScaleX === 'function') {
              return Math.max(0.0001, Math.abs(scalableObject.getScaleX()));
            }
            return 1;
          }

          private _getObjectScaleY(object: gdjs.RuntimeObject): float {
            const scalableObject = object as gdjs.RuntimeObject & {
              getScaleY?: () => float;
            };
            if (typeof scalableObject.getScaleY === 'function') {
              return Math.max(0.0001, Math.abs(scalableObject.getScaleY()));
            }
            return 1;
          }

          private _getObjectScaleZ(object: gdjs.RuntimeObject): float {
            const scalableObject = object as gdjs.RuntimeObject & {
              getScaleZ?: () => float;
            };
            if (typeof scalableObject.getScaleZ === 'function') {
              return Math.max(0.0001, Math.abs(scalableObject.getScaleZ()));
            }
            return Math.max(
              0.0001,
              (this._getObjectScaleX(object) + this._getObjectScaleY(object)) * 0.5
            );
          }

          private _applyAttachedPosition(target: EffectsTarget): boolean {
            const attachedObject = this._getFirstObjectByName(
              target,
              this._attachedObjectName
            );
            if (!attachedObject) {
              return false;
            }
            let offsetX = this._attachedOffsetX;
            let offsetY = this._attachedOffsetY;
            let offsetZ = this._attachedOffsetZ;
            if (this._inheritAttachedObjectScale) {
              offsetX *= this._getObjectScaleX(attachedObject);
              offsetY *= this._getObjectScaleY(attachedObject);
              offsetZ *= this._getObjectScaleZ(attachedObject);
            }
            if (this._followAttachedObjectRotation3D) {
              [offsetX, offsetY, offsetZ] = this._getRotatedOffsets3D(
                attachedObject,
                offsetX,
                offsetY,
                offsetZ
              );
            } else if (this._rotateOffsetsWithObjectAngle) {
              [offsetX, offsetY] = this._getRotatedOffsets(
                attachedObject,
                offsetX,
                offsetY
              );
            }
            this._setLightPosition(
              attachedObject.getCenterXInScene() + offsetX,
              attachedObject.getCenterYInScene() + offsetY,
              this._getObjectCenterZ(attachedObject) + offsetZ
            );
            return true;
          }

          isEnabled(target: EffectsTarget): boolean {
            return this._isEnabled;
          }
          setEnabled(target: EffectsTarget, enabled: boolean): boolean {
            if (this._isEnabled === enabled) {
              return true;
            }
            if (enabled) {
              return this.applyEffect(target);
            } else {
              return this.removeEffect(target);
            }
          }
          applyEffect(target: EffectsTarget): boolean {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene) {
              return false;
            }
            scene.add(this._light);
            this._isEnabled = true;
            this._applyLightingPipeline(target);
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene) {
              return false;
            }
            scene.remove(this._light);
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            if (
              !this._applyAttachedPosition(target) &&
              this._attachedObjectName !== ''
            ) {
              this._updatePosition();
            }

            this._applyLightingPipeline(target);
            this._ensureSoftShadowRenderer(target);
            if (!this._light.castShadow) {
              return;
            }
            this._updateShadowCamera();
            this._updateShadowMapSize();
            this._applyShadowTuning();
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this._intensity = Math.max(0, value);
              this._light.intensity = this._intensity;
            } else if (parameterName === 'positionX') {
              this._positionX = value;
              this._updatePosition();
            } else if (parameterName === 'positionY') {
              this._positionY = value;
              this._updatePosition();
            } else if (parameterName === 'positionZ') {
              this._positionZ = value;
              this._updatePosition();
            } else if (parameterName === 'attachedOffsetX') {
              this._attachedOffsetX = value;
            } else if (parameterName === 'attachedOffsetY') {
              this._attachedOffsetY = value;
            } else if (parameterName === 'attachedOffsetZ') {
              this._attachedOffsetZ = value;
            } else if (parameterName === 'distance') {
              this._distance = Math.max(0, value);
              this._light.distance = this._distance;
              this._shadowCameraDirty = true;
            } else if (parameterName === 'decay') {
              this._decay = Math.max(0, value);
              this._light.decay = this._decay;
            } else if (parameterName === 'shadowBias') {
              this._shadowBias = -Math.max(0, value);
            } else if (parameterName === 'shadowNormalBias') {
              this._shadowNormalBias = Math.max(0, value);
            } else if (parameterName === 'shadowRadius') {
              this._shadowRadius = Math.max(0, value);
            } else if (parameterName === 'shadowMapSize') {
              this._shadowMapSize = this._getClosestShadowMapSize(value);
              this._shadowMapDirty = true;
              this._shadowCameraDirty = true;
            } else if (parameterName === 'shadowNear') {
              this._shadowNear = Math.max(0.01, value);
              this._shadowCameraDirty = true;
            } else if (parameterName === 'shadowFar') {
              this._shadowFar = Math.max(this._shadowNear + 1, value);
              this._shadowCameraDirty = true;
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._intensity;
            } else if (parameterName === 'positionX') {
              return this._positionX;
            } else if (parameterName === 'positionY') {
              return this._positionY;
            } else if (parameterName === 'positionZ') {
              return this._positionZ;
            } else if (parameterName === 'attachedOffsetX') {
              return this._attachedOffsetX;
            } else if (parameterName === 'attachedOffsetY') {
              return this._attachedOffsetY;
            } else if (parameterName === 'attachedOffsetZ') {
              return this._attachedOffsetZ;
            } else if (parameterName === 'distance') {
              return this._distance;
            } else if (parameterName === 'decay') {
              return this._decay;
            } else if (parameterName === 'shadowBias') {
              return -this._shadowBias;
            } else if (parameterName === 'shadowNormalBias') {
              return this._shadowNormalBias;
            } else if (parameterName === 'shadowRadius') {
              return this._shadowRadius;
            } else if (parameterName === 'shadowMapSize') {
              return this._shadowMapSize;
            } else if (parameterName === 'shadowNear') {
              return this._shadowNear;
            } else if (parameterName === 'shadowFar') {
              return this._shadowFar;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this._light.color = new THREE.Color(
                gdjs.rgbOrHexStringToNumber(value)
              );
            }
            if (parameterName === 'top') {
              this._top = value;
              this._updatePosition();
            }
            if (parameterName === 'attachedObject') {
              this._attachedObjectName = value;
            }
            if (parameterName === 'shadowQuality') {
              this._applyShadowQualityPreset(value);
              this._shadowMapDirty = true;
            }
            if (parameterName === 'shadowMapSize') {
              const parsedValue = parseFloat(value);
              if (!isNaN(parsedValue)) {
                this._shadowMapSize = this._getClosestShadowMapSize(parsedValue);
                this._shadowMapDirty = true;
                this._shadowCameraDirty = true;
              }
            }
          }
          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'color') {
              this._light.color.setHex(value);
            }
          }
          getColorParameter(parameterName: string): number {
            if (parameterName === 'color') {
              return this._light.color.getHex();
            }
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'isCastingShadow') {
              this._isCastingShadow = value;
              this._light.castShadow =
                value && this._pipelineAllowsRealtimeShadows;
              if (value) {
                this._shadowMapDirty = true;
                this._shadowCameraDirty = true;
              }
            } else if (parameterName === 'rotateOffsetsWithObjectAngle') {
              this._rotateOffsetsWithObjectAngle = value;
            } else if (parameterName === 'followAttachedObjectRotation3D') {
              this._followAttachedObjectRotation3D = value;
            } else if (parameterName === 'inheritAttachedObjectScale') {
              this._inheritAttachedObjectScale = value;
            } else if (parameterName === 'shadowAutoTuning') {
              this._shadowAutoTuningEnabled = value;
            }
          }
          getNetworkSyncData(): PointLightFilterNetworkSyncData {
            return {
              i: this._intensity,
              c: this._light.color.getHex(),
              x: this._positionX,
              y: this._positionY,
              z: this._positionZ,
              d: this._distance,
              dc: this._decay,
              sb: this._shadowBias,
              snb: this._shadowNormalBias,
              sn: this._shadowNear,
              sf: this._shadowFar,
              sr: this._shadowRadius,
              ao: this._attachedObjectName,
              ox: this._attachedOffsetX,
              oy: this._attachedOffsetY,
              oz: this._attachedOffsetZ,
              ro: this._rotateOffsetsWithObjectAngle,
              fr: this._followAttachedObjectRotation3D,
              ia: this._inheritAttachedObjectScale,
              sms: this._shadowMapSize,
              sat: this._shadowAutoTuningEnabled,
              cs: this._isCastingShadow,
            };
          }
          updateFromNetworkSyncData(
            syncData: PointLightFilterNetworkSyncData
          ): void {
            this._intensity = Math.max(0, syncData.i);
            this._light.color.setHex(syncData.c);
            this._positionX = syncData.x;
            this._positionY = syncData.y;
            this._positionZ = syncData.z;
            this._distance = syncData.d;
            this._decay = Math.max(0, syncData.dc);
            this._shadowBias = syncData.sb ?? -0.001;
            this._shadowNormalBias = Math.max(0, syncData.snb ?? 0.02);
            this._shadowNear = Math.max(0.01, syncData.sn ?? 1);
            this._shadowFar = Math.max(this._shadowNear + 1, syncData.sf ?? 10000);
            this._shadowRadius = Math.max(0, syncData.sr ?? 1.5);
            this._shadowMapSize = this._getClosestShadowMapSize(
              syncData.sms ?? 1024
            );
            this._attachedObjectName = syncData.ao || '';
            this._attachedOffsetX = syncData.ox ?? 0;
            this._attachedOffsetY = syncData.oy ?? 0;
            this._attachedOffsetZ = syncData.oz ?? 0;
            this._rotateOffsetsWithObjectAngle = syncData.ro ?? false;
            this._followAttachedObjectRotation3D = syncData.fr ?? false;
            this._inheritAttachedObjectScale = syncData.ia ?? false;
            this._shadowAutoTuningEnabled = syncData.sat ?? true;
            this._isCastingShadow = syncData.cs ?? this._isCastingShadow;
            this._light.castShadow =
              this._isCastingShadow && this._pipelineAllowsRealtimeShadows;
            this._light.intensity = this._intensity;
            this._light.distance = this._distance;
            this._light.decay = this._decay;
            this._updatePosition();
            this._shadowMapDirty = true;
            this._shadowCameraDirty = true;
          }
        })();
      }
    })()
  );
}
