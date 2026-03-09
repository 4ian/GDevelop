namespace gdjs {
  interface SpotLightFilterNetworkSyncData {
    i: number;
    c: number;
    px: number;
    py: number;
    pz: number;
    tx: number;
    ty: number;
    tz: number;
    d: number;
    a: number;
    p: number;
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
    tao?: string;
    tox?: number;
    toy?: number;
    toz?: number;
    ro?: boolean;
    pbe?: boolean;
    pbi?: number;
    pbd?: number;
    pbo?: number;
    pbcs?: boolean;
    sms?: number;
    sat?: boolean;
    fr?: boolean;
    tr?: boolean;
    ia?: boolean;
    it?: boolean;
    fm?: boolean;
    fd?: number;
    fa?: string;
    fy?: number;
    fp?: number;
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
    'Scene3D::SpotLight',
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
          private _targetX: float = 0;
          private _targetY: float = 0;
          private _targetZ: float = 0;
          private _distance: float = 0;
          private _intensity: float = 1;
          private _angle: float = 45;
          private _penumbra: float = 0.1;
          private _decay: float = 2;
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
          private _targetAttachedObjectName: string = '';
          private _targetAttachedOffsetX: float = 0;
          private _targetAttachedOffsetY: float = 0;
          private _targetAttachedOffsetZ: float = 0;
          private _rotateOffsetsWithObjectAngle: boolean = false;
          private _followAttachedObjectRotation3D: boolean = false;
          private _followTargetObjectRotation3D: boolean = false;
          private _inheritAttachedObjectScale: boolean = false;
          private _inheritTargetObjectScale: boolean = false;
          private _flashlightMode: boolean = false;
          private _flashlightDistance: float = 600;
          private _flashlightForwardAxis: string = 'X+';
          private _flashlightYawOffset: float = 0;
          private _flashlightPitchOffset: float = 0;
          private _physicsBounceEnabled: boolean = false;
          private _physicsBounceIntensityScale: float = 0.35;
          private _physicsBounceDistance: float = 600;
          private _physicsBounceOriginOffset: float = 2;
          private _physicsBounceCastShadow: boolean = false;
          private _shadowAutoTuningEnabled: boolean = true;
          private _physicsBounceRaycastResult: gdjs.Physics3DRaycastResult = {
            hasHit: false,
            hitX: 0,
            hitY: 0,
            hitZ: 0,
            normalX: 0,
            normalY: 0,
            normalZ: 0,
            reflectionDirectionX: 0,
            reflectionDirectionY: 0,
            reflectionDirectionZ: 0,
            distance: 0,
            fraction: 0,
            hitBehavior: null,
          };

          private _isEnabled: boolean = false;
          private _isCastingShadow: boolean = false;
          private _pipelineRealtimeMultiplier: float = 1;
          private _pipelineAllowsRealtimeShadows: boolean = true;
          private _pipelineShadowQualityScale: float = 1;
          private _light: THREE.SpotLight;
          private _bounceLight: THREE.SpotLight;
          private _shadowMapDirty = true;
          private _shadowCameraDirty = true;
          private _effectiveShadowMapSize: integer = 1024;
          private _maxRendererShadowMapSize: integer = 2048;
          private _temporaryOffsetVector = new THREE.Vector3();
          private _temporaryDirectionVector = new THREE.Vector3(1, 0, 0);
          private _temporaryEuler = new THREE.Euler(0, 0, 0, 'ZYX');

          constructor() {
            this._light = new THREE.SpotLight();
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
            this._targetX =
              effectData.doubleParameters.targetX !== undefined
                ? effectData.doubleParameters.targetX
                : this._targetX;
            this._targetY =
              effectData.doubleParameters.targetY !== undefined
                ? effectData.doubleParameters.targetY
                : this._targetY;
            this._targetZ =
              effectData.doubleParameters.targetZ !== undefined
                ? effectData.doubleParameters.targetZ
                : this._targetZ;
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
            this._angle = Math.max(
              1,
              Math.min(
                85,
                effectData.doubleParameters.angle !== undefined
                  ? effectData.doubleParameters.angle
                  : this._angle
              )
            );
            this._penumbra = gdjs.evtTools.common.clamp(
              0,
              1,
              effectData.doubleParameters.penumbra !== undefined
                ? effectData.doubleParameters.penumbra
                : this._penumbra
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
            this._light.intensity = this._intensity;
            this._light.distance = this._distance;
            this._light.angle = gdjs.toRad(this._angle);
            this._light.penumbra = this._penumbra;
            this._light.decay = this._decay;
            this._light.color.setHex(
              gdjs.rgbOrHexStringToNumber(
                effectData.stringParameters.color || '255;255;255'
              )
            );
            this._light.castShadow = this._isCastingShadow;
            this._updatePosition();
            this._updateTarget();

            this._bounceLight = new THREE.SpotLight();
            this._bounceLight.visible = false;
            this._bounceLight.castShadow = this._physicsBounceCastShadow;

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

            this._pipelineAllowsRealtimeShadows = shouldUseRealtimeShadows(
              pipelineState,
              this._pipelineRealtimeMultiplier
            );
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

            this._bounceLight.castShadow =
              this._physicsBounceCastShadow && this._pipelineAllowsRealtimeShadows;

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

            const shouldCastAnyShadow =
              this._light.castShadow ||
              (this._physicsBounceEnabled && this._physicsBounceCastShadow);
            if (!shouldCastAnyShadow) {
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

            this._effectiveShadowMapSize = this._getClosestShadowMapSize(
              this._shadowMapSize * this._pipelineShadowQualityScale
            );
            this._light.shadow.mapSize.set(
              this._effectiveShadowMapSize,
              this._effectiveShadowMapSize
            );

            // Force the recreation of the shadow map texture:
            this._light.shadow.map?.dispose();
            this._light.shadow.map = null;
            this._light.shadow.needsUpdate = true;

            if (this._physicsBounceCastShadow) {
              const bounceMapSize = this._getClosestShadowMapSize(
                Math.max(512, this._effectiveShadowMapSize * 0.5)
              );
              this._bounceLight.shadow.mapSize.set(bounceMapSize, bounceMapSize);
              this._bounceLight.shadow.map?.dispose();
              this._bounceLight.shadow.map = null;
              this._bounceLight.shadow.needsUpdate = true;
            }
          }

          private _applySpotShadowTuning(
            light: THREE.SpotLight,
            mapSize: float,
            normalBiasScale: float = 1,
            radiusScale: float = 1
          ): void {
            const manualBias = Math.max(0, -this._shadowBias);
            const manualNormalBias =
              Math.max(0, this._shadowNormalBias) * normalBiasScale;
            const manualRadius = Math.max(0, this._shadowRadius) * radiusScale;

            if (!this._shadowAutoTuningEnabled) {
              light.shadow.bias = -manualBias;
              light.shadow.normalBias = manualNormalBias;
              light.shadow.radius = manualRadius;
              return;
            }

            const shadowFar = Math.max(1, light.shadow.camera.far);
            const coneDiameter = Math.tan(gdjs.toRad(this._angle)) * shadowFar * 2;
            const texelWorldSize = coneDiameter / Math.max(1, mapSize);
            const automaticBias = Math.max(0.00005, texelWorldSize * 0.0008);
            const automaticNormalBias = texelWorldSize * 0.03 * normalBiasScale;

            light.shadow.bias = -Math.max(manualBias, automaticBias);
            light.shadow.normalBias = Math.max(
              manualNormalBias,
              automaticNormalBias
            );
            light.shadow.radius = manualRadius;
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
            
            // FOV of shadow camera for SpotLight should match the light's angle (angle is half of fov)
            this._light.shadow.camera.fov = Math.max(2, Math.min(170, this._angle * 2));
            
            this._light.shadow.camera.updateProjectionMatrix();

            if (this._physicsBounceCastShadow) {
              const bounceFar = Math.max(
                safeNear + 1,
                this._physicsBounceDistance + Math.max(25, this._physicsBounceDistance * 0.25)
              );
              this._bounceLight.shadow.camera.near = safeNear;
              this._bounceLight.shadow.camera.far = bounceFar;
              this._bounceLight.shadow.camera.fov = Math.max(
                2,
                Math.min(170, this._angle * 2)
              );
              this._bounceLight.shadow.camera.updateProjectionMatrix();
            }
          }

          private _setAnyPosition(
            threeObject: THREE.Object3D,
            x: float,
            y: float,
            z: float
          ): void {
            if (this._top === 'Y-') {
              threeObject.position.set(x, -z, y);
            } else {
              threeObject.position.set(x, y, z);
            }
          }

          private _getAnyPositionInGdCoordinates(
            threeObject: THREE.Object3D
          ): [float, float, float] {
            if (this._top === 'Y-') {
              return [
                threeObject.position.x,
                threeObject.position.z,
                -threeObject.position.y,
              ];
            }
            return [
              threeObject.position.x,
              threeObject.position.y,
              threeObject.position.z,
            ];
          }

          private _setLightPosition(x: float, y: float, z: float): void {
            this._setAnyPosition(this._light, x, y, z);
          }

          private _updatePosition(): void {
            this._setLightPosition(
              this._positionX,
              this._positionY,
              this._positionZ
            );
          }

          private _setTargetPosition(x: float, y: float, z: float): void {
            this._setAnyPosition(this._light.target, x, y, z);
          }

          private _updateTarget(): void {
            this._setTargetPosition(
              this._targetX,
              this._targetY,
              this._targetZ
            );
          }

          private _hideBounceLight(): void {
            this._bounceLight.visible = false;
          }

          private _updatePhysicsBounce(target: gdjs.EffectsTarget): void {
            if (!this._physicsBounceEnabled) {
              this._hideBounceLight();
              return;
            }

            const runtimeScene = target.getRuntimeScene() as gdjs.RuntimeScene;
            if (!runtimeScene) {
              this._hideBounceLight();
              return;
            }

            const physics3DRuntimeBehaviorClass = (gdjs as unknown as {
              Physics3DRuntimeBehavior?: {
                raycastClosestInScene?: (
                  runtimeScene: gdjs.RuntimeScene,
                  startX: float,
                  startY: float,
                  startZ: float,
                  endX: float,
                  endY: float,
                  endZ: float,
                  ignoreBehavior: gdjs.Physics3DRuntimeBehavior | null,
                  outResult: gdjs.Physics3DRaycastResult
                ) => gdjs.Physics3DRaycastResult;
              };
            }).Physics3DRuntimeBehavior;
            const raycastClosestInScene =
              physics3DRuntimeBehaviorClass &&
              physics3DRuntimeBehaviorClass.raycastClosestInScene;

            if (!raycastClosestInScene) {
              this._hideBounceLight();
              return;
            }

            const [startX, startY, startZ] = this._getAnyPositionInGdCoordinates(
              this._light
            );
            const [targetX, targetY, targetZ] =
              this._getAnyPositionInGdCoordinates(this._light.target);

            const raycastResult = raycastClosestInScene(
              runtimeScene,
              startX,
              startY,
              startZ,
              targetX,
              targetY,
              targetZ,
              null,
              this._physicsBounceRaycastResult
            );
            if (!raycastResult.hasHit) {
              this._hideBounceLight();
              return;
            }

            const offsetX =
              raycastResult.hitX +
              raycastResult.normalX * this._physicsBounceOriginOffset;
            const offsetY =
              raycastResult.hitY +
              raycastResult.normalY * this._physicsBounceOriginOffset;
            const offsetZ =
              raycastResult.hitZ +
              raycastResult.normalZ * this._physicsBounceOriginOffset;

            const bouncedTargetX =
              offsetX +
              raycastResult.reflectionDirectionX * this._physicsBounceDistance;
            const bouncedTargetY =
              offsetY +
              raycastResult.reflectionDirectionY * this._physicsBounceDistance;
            const bouncedTargetZ =
              offsetZ +
              raycastResult.reflectionDirectionZ * this._physicsBounceDistance;

            this._setAnyPosition(this._bounceLight, offsetX, offsetY, offsetZ);
            this._setAnyPosition(
              this._bounceLight.target,
              bouncedTargetX,
              bouncedTargetY,
              bouncedTargetZ
            );
            this._bounceLight.color.copy(this._light.color);
            this._bounceLight.intensity =
              this._light.intensity * this._physicsBounceIntensityScale;
            this._bounceLight.distance = this._physicsBounceDistance;
            this._bounceLight.angle = this._light.angle;
            this._bounceLight.penumbra = this._light.penumbra;
            this._bounceLight.decay = this._light.decay;
            this._bounceLight.castShadow =
              this._physicsBounceCastShadow && this._pipelineAllowsRealtimeShadows;
            if (this._bounceLight.castShadow) {
              this._applySpotShadowTuning(
                this._bounceLight,
                this._bounceLight.shadow.mapSize.x,
                0.75,
                0.75
              );
            }
            this._bounceLight.visible = true;
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
              (this._getObjectScaleX(object) + this._getObjectScaleY(object)) *
                0.5
            );
          }

          private _setFlashlightForwardAxis(value: string): void {
            const normalizedValue = (value || 'X+').toUpperCase();
            if (
              normalizedValue === 'X+' ||
              normalizedValue === 'X-' ||
              normalizedValue === 'Y+' ||
              normalizedValue === 'Y-' ||
              normalizedValue === 'Z+' ||
              normalizedValue === 'Z-'
            ) {
              this._flashlightForwardAxis = normalizedValue;
            } else {
              this._flashlightForwardAxis = 'X+';
            }
          }

          private _getRotatedOffsets3D(
            object: gdjs.RuntimeObject,
            offsetX: float,
            offsetY: float,
            offsetZ: float,
            use3DRotation: boolean
          ): [float, float, float] {
            this._temporaryEuler.set(
              use3DRotation ? gdjs.toRad(this._getObjectRotationX(object)) : 0,
              use3DRotation ? gdjs.toRad(this._getObjectRotationY(object)) : 0,
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

          private _getForwardDirectionFromObject(
            object: gdjs.RuntimeObject,
            use3DRotation: boolean
          ): [float, float, float] {
            const baseRotationX = use3DRotation
              ? this._getObjectRotationX(object)
              : 0;
            const baseRotationY = use3DRotation
              ? this._getObjectRotationY(object)
              : 0;
            this._temporaryEuler.set(
              gdjs.toRad(baseRotationX + this._flashlightPitchOffset),
              gdjs.toRad(baseRotationY),
              gdjs.toRad(object.getAngle() + this._flashlightYawOffset),
              'ZYX'
            );
            if (this._flashlightForwardAxis === 'X-') {
              this._temporaryDirectionVector.set(-1, 0, 0);
            } else if (this._flashlightForwardAxis === 'Y+') {
              this._temporaryDirectionVector.set(0, 1, 0);
            } else if (this._flashlightForwardAxis === 'Y-') {
              this._temporaryDirectionVector.set(0, -1, 0);
            } else if (this._flashlightForwardAxis === 'Z+') {
              this._temporaryDirectionVector.set(0, 0, 1);
            } else if (this._flashlightForwardAxis === 'Z-') {
              this._temporaryDirectionVector.set(0, 0, -1);
            } else {
              this._temporaryDirectionVector.set(1, 0, 0);
            }
            this._temporaryDirectionVector.applyEuler(this._temporaryEuler);
            this._temporaryDirectionVector.normalize();
            return [
              this._temporaryDirectionVector.x,
              this._temporaryDirectionVector.y,
              this._temporaryDirectionVector.z,
            ];
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
                offsetZ,
                true
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

          private _applyAttachedTarget(target: EffectsTarget): boolean {
            const attachedObject = this._getFirstObjectByName(
              target,
              this._targetAttachedObjectName
            );
            if (!attachedObject) {
              return false;
            }
            let offsetX = this._targetAttachedOffsetX;
            let offsetY = this._targetAttachedOffsetY;
            let offsetZ = this._targetAttachedOffsetZ;
            if (this._inheritTargetObjectScale) {
              offsetX *= this._getObjectScaleX(attachedObject);
              offsetY *= this._getObjectScaleY(attachedObject);
              offsetZ *= this._getObjectScaleZ(attachedObject);
            }
            if (this._followTargetObjectRotation3D) {
              [offsetX, offsetY, offsetZ] = this._getRotatedOffsets3D(
                attachedObject,
                offsetX,
                offsetY,
                offsetZ,
                true
              );
            } else if (this._rotateOffsetsWithObjectAngle) {
              [offsetX, offsetY] = this._getRotatedOffsets(
                attachedObject,
                offsetX,
                offsetY
              );
            }
            this._setTargetPosition(
              attachedObject.getCenterXInScene() + offsetX,
              attachedObject.getCenterYInScene() + offsetY,
              this._getObjectCenterZ(attachedObject) + offsetZ
            );
            return true;
          }

          private _applyFlashlightTarget(target: EffectsTarget): boolean {
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
                offsetZ,
                true
              );
            } else if (this._rotateOffsetsWithObjectAngle) {
              [offsetX, offsetY] = this._getRotatedOffsets(
                attachedObject,
                offsetX,
                offsetY
              );
            }

            const originX = attachedObject.getCenterXInScene() + offsetX;
            const originY = attachedObject.getCenterYInScene() + offsetY;
            const originZ = this._getObjectCenterZ(attachedObject) + offsetZ;
            this._setLightPosition(originX, originY, originZ);

            const [forwardX, forwardY, forwardZ] = this._getForwardDirectionFromObject(
              attachedObject,
              this._followAttachedObjectRotation3D
            );
            const flashlightDistance = Math.max(
              1,
              this._flashlightDistance > 0 ? this._flashlightDistance : 600
            );
            this._setTargetPosition(
              originX + forwardX * flashlightDistance,
              originY + forwardY * flashlightDistance,
              originZ + forwardZ * flashlightDistance
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
            scene.add(this._light.target);
            scene.add(this._bounceLight);
            scene.add(this._bounceLight.target);
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
            scene.remove(this._light.target);
            scene.remove(this._bounceLight);
            scene.remove(this._bounceLight.target);
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            if (this._flashlightMode && this._attachedObjectName !== '') {
              if (!this._applyFlashlightTarget(target)) {
                this._updatePosition();
                this._updateTarget();
              }
            } else {
              if (
                !this._applyAttachedPosition(target) &&
                this._attachedObjectName !== ''
              ) {
                this._updatePosition();
              }
              if (
                !this._applyAttachedTarget(target) &&
                this._targetAttachedObjectName !== ''
              ) {
                this._updateTarget();
              }
            }

            this._applyLightingPipeline(target);
            this._ensureSoftShadowRenderer(target);
            const shouldUpdateShadows =
              this._light.castShadow ||
              (this._physicsBounceEnabled && this._physicsBounceCastShadow);
            if (shouldUpdateShadows) {
              this._updateShadowCamera();
              this._updateShadowMapSize();
            }
            if (this._light.castShadow) {
              this._applySpotShadowTuning(
                this._light,
                this._effectiveShadowMapSize
              );
            }
            this._updatePhysicsBounce(target);
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
            } else if (parameterName === 'targetX') {
              this._targetX = value;
              this._updateTarget();
            } else if (parameterName === 'targetY') {
              this._targetY = value;
              this._updateTarget();
            } else if (parameterName === 'targetZ') {
              this._targetZ = value;
              this._updateTarget();
            } else if (parameterName === 'targetAttachedOffsetX') {
              this._targetAttachedOffsetX = value;
            } else if (parameterName === 'targetAttachedOffsetY') {
              this._targetAttachedOffsetY = value;
            } else if (parameterName === 'targetAttachedOffsetZ') {
              this._targetAttachedOffsetZ = value;
            } else if (parameterName === 'distance') {
              this._distance = Math.max(0, value);
              this._light.distance = this._distance;
              this._shadowCameraDirty = true;
            } else if (parameterName === 'angle') {
              this._angle = Math.max(1, Math.min(85, value));
              this._light.angle = gdjs.toRad(this._angle);
              this._shadowCameraDirty = true;
            } else if (parameterName === 'penumbra') {
              this._penumbra = gdjs.evtTools.common.clamp(0, 1, value);
              this._light.penumbra = this._penumbra;
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
            } else if (parameterName === 'physicsBounceIntensityScale') {
              this._physicsBounceIntensityScale = value;
            } else if (parameterName === 'physicsBounceDistance') {
              this._physicsBounceDistance = Math.max(0, value);
              this._shadowCameraDirty = true;
            } else if (parameterName === 'physicsBounceOriginOffset') {
              this._physicsBounceOriginOffset = value;
            } else if (parameterName === 'flashlightDistance') {
              this._flashlightDistance = Math.max(1, value);
            } else if (parameterName === 'flashlightYawOffset') {
              this._flashlightYawOffset = value;
            } else if (parameterName === 'flashlightPitchOffset') {
              this._flashlightPitchOffset = value;
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
            } else if (parameterName === 'targetX') {
              return this._targetX;
            } else if (parameterName === 'targetY') {
              return this._targetY;
            } else if (parameterName === 'targetZ') {
              return this._targetZ;
            } else if (parameterName === 'targetAttachedOffsetX') {
              return this._targetAttachedOffsetX;
            } else if (parameterName === 'targetAttachedOffsetY') {
              return this._targetAttachedOffsetY;
            } else if (parameterName === 'targetAttachedOffsetZ') {
              return this._targetAttachedOffsetZ;
            } else if (parameterName === 'distance') {
              return this._distance;
            } else if (parameterName === 'angle') {
              return this._angle;
            } else if (parameterName === 'penumbra') {
              return this._penumbra;
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
            } else if (parameterName === 'physicsBounceIntensityScale') {
              return this._physicsBounceIntensityScale;
            } else if (parameterName === 'physicsBounceDistance') {
              return this._physicsBounceDistance;
            } else if (parameterName === 'physicsBounceOriginOffset') {
              return this._physicsBounceOriginOffset;
            } else if (parameterName === 'flashlightDistance') {
              return this._flashlightDistance;
            } else if (parameterName === 'flashlightYawOffset') {
              return this._flashlightYawOffset;
            } else if (parameterName === 'flashlightPitchOffset') {
              return this._flashlightPitchOffset;
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
              this._updateTarget();
            }
            if (parameterName === 'attachedObject') {
              this._attachedObjectName = value;
            }
            if (parameterName === 'targetAttachedObject') {
              this._targetAttachedObjectName = value;
            }
            if (parameterName === 'flashlightForwardAxis') {
              this._setFlashlightForwardAxis(value);
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
            } else if (parameterName === 'followTargetObjectRotation3D') {
              this._followTargetObjectRotation3D = value;
            } else if (parameterName === 'inheritAttachedObjectScale') {
              this._inheritAttachedObjectScale = value;
            } else if (parameterName === 'inheritTargetObjectScale') {
              this._inheritTargetObjectScale = value;
            } else if (parameterName === 'physicsBounceEnabled') {
              this._physicsBounceEnabled = value;
              if (!value) {
                this._hideBounceLight();
              } else if (this._physicsBounceCastShadow) {
                this._shadowMapDirty = true;
                this._shadowCameraDirty = true;
              }
            } else if (parameterName === 'physicsBounceCastShadow') {
              this._physicsBounceCastShadow = value;
              this._bounceLight.castShadow =
                value && this._pipelineAllowsRealtimeShadows;
              if (value) {
                this._shadowMapDirty = true;
                this._shadowCameraDirty = true;
              }
            } else if (parameterName === 'shadowAutoTuning') {
              this._shadowAutoTuningEnabled = value;
            } else if (parameterName === 'flashlightMode') {
              this._flashlightMode = value;
            }
          }
          getNetworkSyncData(): SpotLightFilterNetworkSyncData {
            return {
              i: this._intensity,
              c: this._light.color.getHex(),
              px: this._positionX,
              py: this._positionY,
              pz: this._positionZ,
              tx: this._targetX,
              ty: this._targetY,
              tz: this._targetZ,
              d: this._distance,
              a: this._angle,
              p: this._penumbra,
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
              tao: this._targetAttachedObjectName,
              tox: this._targetAttachedOffsetX,
              toy: this._targetAttachedOffsetY,
              toz: this._targetAttachedOffsetZ,
              ro: this._rotateOffsetsWithObjectAngle,
              fr: this._followAttachedObjectRotation3D,
              tr: this._followTargetObjectRotation3D,
              ia: this._inheritAttachedObjectScale,
              it: this._inheritTargetObjectScale,
              pbe: this._physicsBounceEnabled,
              pbi: this._physicsBounceIntensityScale,
              pbd: this._physicsBounceDistance,
              pbo: this._physicsBounceOriginOffset,
              pbcs: this._physicsBounceCastShadow,
              sms: this._shadowMapSize,
              sat: this._shadowAutoTuningEnabled,
              fm: this._flashlightMode,
              fd: this._flashlightDistance,
              fa: this._flashlightForwardAxis,
              fy: this._flashlightYawOffset,
              fp: this._flashlightPitchOffset,
              cs: this._isCastingShadow,
            };
          }
          updateFromNetworkSyncData(
            syncData: SpotLightFilterNetworkSyncData
          ): void {
            this._intensity = Math.max(0, syncData.i);
            this._light.color.setHex(syncData.c);
            this._positionX = syncData.px;
            this._positionY = syncData.py;
            this._positionZ = syncData.pz;
            this._targetX = syncData.tx;
            this._targetY = syncData.ty;
            this._targetZ = syncData.tz;
            this._distance = Math.max(0, syncData.d);
            this._angle = Math.max(1, Math.min(85, syncData.a));
            this._penumbra = gdjs.evtTools.common.clamp(0, 1, syncData.p);
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
            this._targetAttachedObjectName = syncData.tao || '';
            this._targetAttachedOffsetX = syncData.tox ?? 0;
            this._targetAttachedOffsetY = syncData.toy ?? 0;
            this._targetAttachedOffsetZ = syncData.toz ?? 0;
            this._rotateOffsetsWithObjectAngle = syncData.ro ?? false;
            this._followAttachedObjectRotation3D = syncData.fr ?? false;
            this._followTargetObjectRotation3D = syncData.tr ?? false;
            this._inheritAttachedObjectScale = syncData.ia ?? false;
            this._inheritTargetObjectScale = syncData.it ?? false;
            this._physicsBounceEnabled = syncData.pbe ?? false;
            this._physicsBounceIntensityScale = syncData.pbi ?? 0.35;
            this._physicsBounceDistance = Math.max(0, syncData.pbd ?? 600);
            this._physicsBounceOriginOffset = syncData.pbo ?? 2;
            this._physicsBounceCastShadow = syncData.pbcs ?? false;
            this._shadowAutoTuningEnabled = syncData.sat ?? true;
            this._flashlightMode = syncData.fm ?? false;
            this._flashlightDistance = Math.max(1, syncData.fd ?? 600);
            this._setFlashlightForwardAxis(syncData.fa ?? 'X+');
            this._flashlightYawOffset = syncData.fy ?? 0;
            this._flashlightPitchOffset = syncData.fp ?? 0;
            this._isCastingShadow = syncData.cs ?? this._isCastingShadow;
            this._light.distance = this._distance;
            this._light.angle = gdjs.toRad(this._angle);
            this._light.penumbra = this._penumbra;
            this._light.decay = this._decay;
            this._light.castShadow =
              this._isCastingShadow && this._pipelineAllowsRealtimeShadows;
            this._light.intensity = this._intensity;
            this._bounceLight.castShadow =
              this._physicsBounceCastShadow && this._pipelineAllowsRealtimeShadows;
            if (!this._physicsBounceEnabled) {
              this._hideBounceLight();
            }
            this._updatePosition();
            this._updateTarget();
            this._shadowMapDirty = true;
            this._shadowCameraDirty = true;
          }
        })();
      }
    })()
  );
}
