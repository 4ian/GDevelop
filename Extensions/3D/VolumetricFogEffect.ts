namespace gdjs {
  interface VolumetricFogNetworkSyncData {
    c: number;
    d: number;
    ls: number;
    md: number;
    e: boolean;
  }

  const MAX_VOLUMETRIC_LIGHTS = 16;

  const makeVector3Array = (count: integer): THREE.Vector3[] => {
    const values: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      values.push(new THREE.Vector3());
    }
    return values;
  };

  const makeNumberArray = (count: integer): number[] => {
    const values: number[] = [];
    for (let i = 0; i < count; i++) {
      values.push(0);
    }
    return values;
  };

  const volumetricFogShader = {
    uniforms: {
      tDiffuse: { value: null },
      tDepth: { value: null },
      resolution: { value: new THREE.Vector2(1, 1) },
      fogColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
      density: { value: 0.012 },
      lightScatter: { value: 1.0 },
      maxDistance: { value: 1200.0 },
      stepCount: { value: 36.0 },
      lightCount: { value: 0 },
      lightPositions: { value: makeVector3Array(MAX_VOLUMETRIC_LIGHTS) },
      lightColors: { value: makeVector3Array(MAX_VOLUMETRIC_LIGHTS) },
      lightRanges: { value: makeNumberArray(MAX_VOLUMETRIC_LIGHTS) },
      cameraProjectionMatrixInverse: { value: new THREE.Matrix4() },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      #define MAX_VOLUMETRIC_LIGHTS ${MAX_VOLUMETRIC_LIGHTS}
      #define MAX_VOLUMETRIC_STEPS 64

      uniform sampler2D tDiffuse;
      uniform sampler2D tDepth;
      uniform vec2 resolution;
      uniform vec3 fogColor;
      uniform float density;
      uniform float lightScatter;
      uniform float maxDistance;
      uniform float stepCount;
      uniform int lightCount;
      uniform vec3 lightPositions[MAX_VOLUMETRIC_LIGHTS];
      uniform vec3 lightColors[MAX_VOLUMETRIC_LIGHTS];
      uniform float lightRanges[MAX_VOLUMETRIC_LIGHTS];
      uniform mat4 cameraProjectionMatrixInverse;
      varying vec2 vUv;

      vec3 viewPositionFromDepth(vec2 uv, float depth) {
        vec4 clip = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 view = cameraProjectionMatrixInverse * clip;
        return view.xyz / max(view.w, 0.00001);
      }

      void main() {
        vec4 baseColor = texture2D(tDiffuse, vUv);
        if (density <= 0.0 || maxDistance <= 0.0) {
          gl_FragColor = baseColor;
          return;
        }

        float depth = texture2D(tDepth, vUv).x;
        vec3 farViewPosition = viewPositionFromDepth(vUv, 1.0);
        vec3 rayDirection = normalize(farViewPosition);
        float rayLength = maxDistance;

        if (depth < 1.0) {
          vec3 surfaceViewPosition = viewPositionFromDepth(vUv, depth);
          float surfaceDistance = length(surfaceViewPosition);
          if (surfaceDistance > 0.00001) {
            rayDirection = normalize(surfaceViewPosition);
            rayLength = min(surfaceDistance, maxDistance);
          }
        }

        float clampedStepCount = clamp(stepCount, 8.0, float(MAX_VOLUMETRIC_STEPS));
        float stepLength = rayLength / clampedStepCount;
        float transmittance = 1.0;
        vec3 accumulatedFog = vec3(0.0);

        for (int step = 0; step < MAX_VOLUMETRIC_STEPS; step++) {
          if (float(step) >= clampedStepCount) {
            break;
          }
          float sampleDistance = (float(step) + 0.5) * stepLength;
          vec3 samplePosition = rayDirection * sampleDistance;

          float localDensity = density;
          vec3 localLightColor = vec3(0.0);

          for (int i = 0; i < MAX_VOLUMETRIC_LIGHTS; i++) {
            if (i >= lightCount) break;

            float range = max(lightRanges[i], 1.0);
            float distanceToLight = length(samplePosition - lightPositions[i]);
            float attenuation = exp(
              -(distanceToLight * distanceToLight) / max(1.0, range * range * 0.5)
            );

            localLightColor += lightColors[i] * attenuation;
            localDensity += density * lightScatter * attenuation * 0.5;
          }

          float opticalDepth = localDensity * stepLength * 0.01;
          float stepTransmittance = exp(-opticalDepth);
          vec3 mediumColor = fogColor + localLightColor * lightScatter;

          accumulatedFog +=
            transmittance * (1.0 - stepTransmittance) * mediumColor;
          transmittance *= stepTransmittance;

          if (transmittance < 0.01) {
            break;
          }
        }

        vec3 finalColor = baseColor.rgb * transmittance + accumulatedFog;
        gl_FragColor = vec4(finalColor, baseColor.a);
      }
    `,
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::VolumetricFog',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          shaderPass: THREE_ADDONS.ShaderPass;
          _isEnabled: boolean;
          _effectEnabled: boolean;
          _fogColor: THREE.Color;
          _density: number;
          _lightScatter: number;
          _maxDistance: number;
          _sceneRenderTarget: THREE.WebGLRenderTarget;
          _previousViewport: THREE.Vector4;
          _previousScissor: THREE.Vector4;
          _renderSize: THREE.Vector2;
          _lightPositions: THREE.Vector3[];
          _lightColors: THREE.Vector3[];
          _lightRanges: number[];
          _tempWorldPosition: THREE.Vector3;
          _tempViewPosition: THREE.Vector3;

          constructor() {
            this.shaderPass = new THREE_ADDONS.ShaderPass(volumetricFogShader);
            gdjs.markScene3DPostProcessingPass(this.shaderPass, 'FOG');
            this._isEnabled = false;
            this._effectEnabled = true;
            this._fogColor = new THREE.Color(0xc8dcff);
            this._density = 0.012;
            this._lightScatter = 1.0;
            this._maxDistance = 1200;

            this._sceneRenderTarget = new THREE.WebGLRenderTarget(1, 1, {
              minFilter: THREE.LinearFilter,
              magFilter: THREE.LinearFilter,
              format: THREE.RGBAFormat,
              depthBuffer: true,
              stencilBuffer: false,
            });
            this._sceneRenderTarget.texture.generateMipmaps = false;
            this._sceneRenderTarget.depthTexture = new THREE.DepthTexture(1, 1);
            this._sceneRenderTarget.depthTexture.format = THREE.DepthFormat;
            this._sceneRenderTarget.depthTexture.type = THREE.UnsignedIntType;
            this._sceneRenderTarget.depthTexture.needsUpdate = true;

            this._previousViewport = new THREE.Vector4();
            this._previousScissor = new THREE.Vector4();
            this._renderSize = new THREE.Vector2();
            this._lightPositions = makeVector3Array(MAX_VOLUMETRIC_LIGHTS);
            this._lightColors = makeVector3Array(MAX_VOLUMETRIC_LIGHTS);
            this._lightRanges = makeNumberArray(MAX_VOLUMETRIC_LIGHTS);
            this._tempWorldPosition = new THREE.Vector3();
            this._tempViewPosition = new THREE.Vector3();

            this.shaderPass.uniforms.tDepth.value =
              this._sceneRenderTarget.depthTexture;
            this.shaderPass.uniforms.fogColor.value.set(
              this._fogColor.r,
              this._fogColor.g,
              this._fogColor.b
            );
            this.shaderPass.uniforms.density.value = this._density;
            this.shaderPass.uniforms.lightScatter.value = this._lightScatter;
            this.shaderPass.uniforms.maxDistance.value = this._maxDistance;
            this.shaderPass.uniforms.lightPositions.value = this._lightPositions;
            this.shaderPass.uniforms.lightColors.value = this._lightColors;
            this.shaderPass.uniforms.lightRanges.value = this._lightRanges;
            this.shaderPass.enabled = true;
            // Kept for backward compatibility while shared capture is active.
            void this._updateRenderTargetSize;
            void this._captureScene;
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
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            target.getRenderer().addPostProcessingPass(this.shaderPass);
            this._isEnabled = true;
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            target.getRenderer().removePostProcessingPass(this.shaderPass);
            this._isEnabled = false;
            return true;
          }

          private _updateRenderTargetSize(
            target: gdjs.Layer,
            threeRenderer: THREE.WebGLRenderer
          ): void {
            threeRenderer.getDrawingBufferSize(this._renderSize);
            const width = Math.max(1, Math.round(this._renderSize.x || 1));
            const height = Math.max(1, Math.round(this._renderSize.y || 1));

            if (
              this._sceneRenderTarget.width !== width ||
              this._sceneRenderTarget.height !== height
            ) {
              this._sceneRenderTarget.setSize(width, height);
              if (this._sceneRenderTarget.depthTexture) {
                this._sceneRenderTarget.depthTexture.needsUpdate = true;
              }
            }

            this.shaderPass.uniforms.resolution.value.set(width, height);
            this.shaderPass.uniforms.tDepth.value =
              this._sceneRenderTarget.depthTexture;
            this._sceneRenderTarget.texture.colorSpace =
              threeRenderer.outputColorSpace;
          }

          private _captureScene(
            threeRenderer: THREE.WebGLRenderer,
            scene: THREE.Scene,
            camera: THREE.Camera
          ): void {
            const previousRenderTarget = threeRenderer.getRenderTarget();
            const previousAutoClear = threeRenderer.autoClear;
            const previousScissorTest = threeRenderer.getScissorTest();
            const previousXrEnabled = threeRenderer.xr.enabled;
            threeRenderer.getViewport(this._previousViewport);
            threeRenderer.getScissor(this._previousScissor);

            threeRenderer.xr.enabled = false;
            threeRenderer.autoClear = true;
            threeRenderer.setRenderTarget(this._sceneRenderTarget);
            threeRenderer.clear(true, true, true);
            threeRenderer.render(scene, camera);

            threeRenderer.setRenderTarget(previousRenderTarget);
            threeRenderer.setViewport(this._previousViewport);
            threeRenderer.setScissor(this._previousScissor);
            threeRenderer.setScissorTest(previousScissorTest);
            threeRenderer.autoClear = previousAutoClear;
            threeRenderer.xr.enabled = previousXrEnabled;
          }

          private _updateLightsUniforms(
            scene: THREE.Scene,
            camera: THREE.Camera
          ): void {
            let lightCount = 0;

            scene.traverse((object: THREE.Object3D) => {
              if (lightCount >= MAX_VOLUMETRIC_LIGHTS) {
                return;
              }
              if (
                !(object instanceof THREE.PointLight) &&
                !(object instanceof THREE.SpotLight)
              ) {
                return;
              }
              if (!object.visible || object.intensity <= 0) {
                return;
              }

              object.getWorldPosition(this._tempWorldPosition);
              this._tempViewPosition
                .copy(this._tempWorldPosition)
                .applyMatrix4(camera.matrixWorldInverse);

              const distance =
                object.distance > 0
                  ? Math.min(object.distance, this._maxDistance)
                  : this._maxDistance;

              this._lightPositions[lightCount].copy(this._tempViewPosition);
              this._lightColors[lightCount].set(
                object.color.r * object.intensity,
                object.color.g * object.intensity,
                object.color.b * object.intensity
              );
              this._lightRanges[lightCount] = Math.max(distance, 1);
              lightCount++;
            });

            for (let i = lightCount; i < MAX_VOLUMETRIC_LIGHTS; i++) {
              this._lightPositions[i].set(0, 0, 0);
              this._lightColors[i].set(0, 0, 0);
              this._lightRanges[i] = 0;
            }

            this.shaderPass.uniforms.lightCount.value = lightCount;
            this.shaderPass.uniforms.lightPositions.value = this._lightPositions;
            this.shaderPass.uniforms.lightColors.value = this._lightColors;
            this.shaderPass.uniforms.lightRanges.value = this._lightRanges;
          }

          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled || !this._effectEnabled) {
              return;
            }
            if (!(target instanceof gdjs.Layer)) {
              return;
            }

            const runtimeScene = target.getRuntimeScene();
            const threeRenderer = runtimeScene
              .getGame()
              .getRenderer()
              .getThreeRenderer();
            const layerRenderer = target.getRenderer();
            const threeScene = layerRenderer.getThreeScene();
            const threeCamera = layerRenderer.getThreeCamera();

            if (!threeRenderer || !threeScene || !threeCamera) {
              return;
            }

            if (!gdjs.isScene3DPostProcessingEnabled(target)) {
              this.shaderPass.enabled = false;
              return;
            }

            const sharedCapture = gdjs.captureScene3DSharedTextures(
              target,
              threeRenderer,
              threeScene,
              threeCamera
            );
            if (!sharedCapture || !sharedCapture.depthTexture) {
              return;
            }

            threeCamera.updateMatrixWorld();
            threeCamera.matrixWorldInverse.copy(threeCamera.matrixWorld).invert();

            this.shaderPass.enabled = true;
            this.shaderPass.uniforms.resolution.value.set(
              sharedCapture.width,
              sharedCapture.height
            );
            this.shaderPass.uniforms.tDepth.value = sharedCapture.depthTexture;
            this.shaderPass.uniforms.cameraProjectionMatrixInverse.value.copy(
              threeCamera.projectionMatrixInverse
            );
            this.shaderPass.uniforms.fogColor.value.set(
              this._fogColor.r,
              this._fogColor.g,
              this._fogColor.b
            );
            this.shaderPass.uniforms.density.value = this._density;
            this.shaderPass.uniforms.lightScatter.value = this._lightScatter;
            this.shaderPass.uniforms.maxDistance.value = this._maxDistance;
            this.shaderPass.uniforms.stepCount.value =
              sharedCapture.quality.fogSteps;

            this._updateLightsUniforms(threeScene, threeCamera);
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'density') {
              this._density = Math.max(0, value);
            } else if (parameterName === 'lightScatter') {
              this._lightScatter = Math.max(0, value);
            } else if (parameterName === 'maxDistance') {
              this._maxDistance = Math.max(0, value);
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'density') {
              return this._density;
            }
            if (parameterName === 'lightScatter') {
              return this._lightScatter;
            }
            if (parameterName === 'maxDistance') {
              return this._maxDistance;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'fogColor') {
              this._fogColor.setHex(gdjs.rgbOrHexStringToNumber(value));
            }
          }
          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'fogColor') {
              this._fogColor.setHex(value);
            }
          }
          getColorParameter(parameterName: string): number {
            if (parameterName === 'fogColor') {
              return this._fogColor.getHex();
            }
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'enabled') {
              this._effectEnabled = value;
              this.shaderPass.enabled = value;
            }
          }
          getNetworkSyncData(): VolumetricFogNetworkSyncData {
            return {
              c: this._fogColor.getHex(),
              d: this._density,
              ls: this._lightScatter,
              md: this._maxDistance,
              e: this._effectEnabled,
            };
          }
          updateFromNetworkSyncData(
            syncData: VolumetricFogNetworkSyncData
          ): void {
            this._fogColor.setHex(syncData.c);
            this._density = syncData.d;
            this._lightScatter = syncData.ls;
            this._maxDistance = syncData.md;
            this._effectEnabled = syncData.e;

            this.shaderPass.uniforms.fogColor.value.set(
              this._fogColor.r,
              this._fogColor.g,
              this._fogColor.b
            );
            this.shaderPass.uniforms.density.value = this._density;
            this.shaderPass.uniforms.lightScatter.value = this._lightScatter;
            this.shaderPass.uniforms.maxDistance.value = this._maxDistance;
            this.shaderPass.enabled = this._effectEnabled;
          }
        })();
      }
    })()
  );
}
