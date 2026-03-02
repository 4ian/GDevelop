namespace gdjs {
  interface RimLightNetworkSyncData {
    i: number;
    c: number;
    o: number;
    s: number;
    e: boolean;
  }

  const rimLightShader = {
    uniforms: {
      tDiffuse: { value: null },
      tSceneColor: { value: null },
      tDepth: { value: null },
      resolution: { value: new THREE.Vector2(1, 1) },
      cameraProjectionMatrix: { value: new THREE.Matrix4() },
      cameraProjectionMatrixInverse: { value: new THREE.Matrix4() },
      cameraMatrixWorld: { value: new THREE.Matrix4() },
      smoothedCameraPosition: { value: new THREE.Vector3() },
      rimColor: { value: new THREE.Color(0xffffff) },
      rimIntensity: { value: 0.8 },
      rimOuterWrap: { value: 0.18 },
      shadowStrength: { value: 1.0 },
      shadowBias: { value: 0.0008 },
      shadowMap0: { value: null },
      shadowMap1: { value: null },
      shadowMap2: { value: null },
      shadowMatrix0: { value: new THREE.Matrix4() },
      shadowMatrix1: { value: new THREE.Matrix4() },
      shadowMatrix2: { value: new THREE.Matrix4() },
      shadowEnabled0: { value: 0.0 },
      shadowEnabled1: { value: 0.0 },
      shadowEnabled2: { value: 0.0 },
      fogMode: { value: 0.0 },
      fogNear: { value: 1.0 },
      fogFar: { value: 2000.0 },
      fogDensity: { value: 0.001 },
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

      uniform sampler2D tDiffuse;
      uniform sampler2D tSceneColor;
      uniform sampler2D tDepth;
      uniform vec2 resolution;
      uniform mat4 cameraProjectionMatrix;
      uniform mat4 cameraProjectionMatrixInverse;
      uniform mat4 cameraMatrixWorld;
      uniform vec3 smoothedCameraPosition;
      uniform vec3 rimColor;
      uniform float rimIntensity;
      uniform float rimOuterWrap;
      uniform float shadowStrength;
      uniform float shadowBias;
      uniform sampler2D shadowMap0;
      uniform sampler2D shadowMap1;
      uniform sampler2D shadowMap2;
      uniform mat4 shadowMatrix0;
      uniform mat4 shadowMatrix1;
      uniform mat4 shadowMatrix2;
      uniform float shadowEnabled0;
      uniform float shadowEnabled1;
      uniform float shadowEnabled2;
      uniform float fogMode;
      uniform float fogNear;
      uniform float fogFar;
      uniform float fogDensity;
      varying vec2 vUv;

      vec3 viewPositionFromDepth(vec2 uv, float depth) {
        vec4 clip = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 view = cameraProjectionMatrixInverse * clip;
        return view.xyz / max(view.w, 0.00001);
      }

      vec3 worldPositionFromView(vec3 viewPosition) {
        return (cameraMatrixWorld * vec4(viewPosition, 1.0)).xyz;
      }

      vec3 reconstructNormal(vec2 uv, float depth) {
        vec2 texel = 1.0 / resolution;
        float depthRight = texture2D(tDepth, uv + vec2(texel.x, 0.0)).x;
        float depthUp = texture2D(tDepth, uv + vec2(0.0, texel.y)).x;

        vec3 center = viewPositionFromDepth(uv, depth);
        vec3 right = viewPositionFromDepth(uv + vec2(texel.x, 0.0), depthRight);
        vec3 up = viewPositionFromDepth(uv + vec2(0.0, texel.y), depthUp);

        vec3 normal = normalize(cross(right - center, up - center));
        if (dot(normal, -normalize(center)) < 0.0) {
          normal = -normal;
        }
        return normal;
      }

      float computeRimZone(vec3 normalVS, vec3 viewDirVS) {
        float ndv = clamp(abs(dot(normalVS, viewDirVS)), 0.0, 1.0);

        // Inner: 0-15 deg from silhouette => full intensity.
        float innerMax = 0.2588190451; // cos(75 deg)
        // Mid: 15-45 deg from silhouette => smooth falloff.
        float midMax = 0.7071067812; // cos(45 deg)

        if (ndv <= innerMax) {
          return 1.0;
        }
        if (ndv <= midMax) {
          return 1.0 - smoothstep(innerMax, midMax, ndv);
        }

        // Outer: 45-90 deg from silhouette => ambient wrap.
        float outerFactor = 1.0 - smoothstep(midMax, 1.0, ndv);
        return outerFactor * rimOuterWrap;
      }

      float sampleShadowSingle(
        sampler2D shadowMap,
        mat4 shadowMatrix,
        vec3 worldPos,
        float enabledFlag
      ) {
        if (enabledFlag < 0.5) {
          return -1.0;
        }

        vec4 shadowCoord = shadowMatrix * vec4(worldPos, 1.0);
        shadowCoord.xyz /= max(shadowCoord.w, 0.00001);

        // Outside this cascade frustum => no decision from this map.
        if (
          shadowCoord.x < 0.0 || shadowCoord.x > 1.0 ||
          shadowCoord.y < 0.0 || shadowCoord.y > 1.0 ||
          shadowCoord.z < 0.0 || shadowCoord.z > 1.0
        ) {
          return -1.0;
        }

        float mapDepth = texture2D(shadowMap, shadowCoord.xy).x;
        float receiverDepth = shadowCoord.z - shadowBias;
        return receiverDepth <= mapDepth ? 1.0 : 0.0;
      }

      float computeShadowVisibility(vec3 worldPos) {
        float litMax = 0.0;
        float contributors = 0.0;

        float lit0 = sampleShadowSingle(shadowMap0, shadowMatrix0, worldPos, shadowEnabled0);
        if (lit0 >= 0.0) {
          contributors += 1.0;
          litMax = max(litMax, lit0);
        }

        float lit1 = sampleShadowSingle(shadowMap1, shadowMatrix1, worldPos, shadowEnabled1);
        if (lit1 >= 0.0) {
          contributors += 1.0;
          litMax = max(litMax, lit1);
        }

        float lit2 = sampleShadowSingle(shadowMap2, shadowMatrix2, worldPos, shadowEnabled2);
        if (lit2 >= 0.0) {
          contributors += 1.0;
          litMax = max(litMax, lit2);
        }

        if (contributors <= 0.0) {
          return 1.0;
        }
        return litMax;
      }

      float computeFogAttenuation(float distanceToCamera) {
        if (fogMode < 0.5) {
          return 1.0;
        }
        if (fogMode < 1.5) {
          float linearFog = smoothstep(fogNear, fogFar, distanceToCamera);
          return clamp(1.0 - linearFog, 0.0, 1.0);
        }
        float expFog = 1.0 - exp(-fogDensity * fogDensity * distanceToCamera * distanceToCamera);
        return clamp(1.0 - expFog, 0.0, 1.0);
      }

      void main() {
        vec4 baseColor = texture2D(tDiffuse, vUv);
        if (rimIntensity <= 0.0) {
          gl_FragColor = baseColor;
          return;
        }

        float depth = texture2D(tDepth, vUv).x;
        if (depth >= 1.0) {
          gl_FragColor = baseColor;
          return;
        }

        vec3 viewPos = viewPositionFromDepth(vUv, depth);
        vec3 normalVS = reconstructNormal(vUv, depth);
        vec3 worldPos = worldPositionFromView(viewPos);

        vec3 viewDirWorld = normalize(smoothedCameraPosition - worldPos);
        vec3 viewDirVS = normalize((viewMatrix * vec4(viewDirWorld, 0.0)).xyz);

        float rimZone = computeRimZone(normalVS, viewDirVS);
        float shadowVisibility = computeShadowVisibility(worldPos);
        float distanceToCamera = length(smoothedCameraPosition - worldPos);
        float fogAttenuation = computeFogAttenuation(distanceToCamera);

        // Preserve energy in very dark areas by slightly mixing with captured scene color.
        vec3 sceneColor = texture2D(tSceneColor, vUv).rgb;
        float sceneLuma = dot(sceneColor, vec3(0.2126, 0.7152, 0.0722));
        float darkLift = mix(0.55, 1.0, clamp(sceneLuma * 1.5, 0.0, 1.0));

        float shadowFactor = mix(1.0, shadowVisibility, clamp(shadowStrength, 0.0, 1.0));
        float rim = rimIntensity * rimZone * shadowFactor * fogAttenuation * darkLift;

        gl_FragColor = vec4(baseColor.rgb + rimColor * rim, baseColor.a);
      }
    `,
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::RimLight',
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
          _intensity: number;
          _outerWrap: number;
          _shadowStrength: number;
          _colorHex: number;
          _smoothedCameraPosition: THREE.Vector3;
          _hasSmoothedCameraPosition: boolean;

          constructor() {
            this.shaderPass = new THREE_ADDONS.ShaderPass(rimLightShader);
            gdjs.markScene3DPostProcessingPass(this.shaderPass, 'RIM');
            this._isEnabled = false;
            this._effectEnabled =
              effectData.booleanParameters.enabled === undefined
                ? true
                : !!effectData.booleanParameters.enabled;
            this._intensity = Math.max(
              0,
              effectData.doubleParameters.intensity !== undefined
                ? effectData.doubleParameters.intensity
                : 0.8
            );
            this._outerWrap = Math.max(
              0,
              Math.min(
                1,
                effectData.doubleParameters.outerWrap !== undefined
                  ? effectData.doubleParameters.outerWrap
                  : 0.18
              )
            );
            this._shadowStrength = 1.0;
            this._colorHex = gdjs.rgbOrHexStringToNumber(
              effectData.stringParameters.color || '255;255;255'
            );
            this._smoothedCameraPosition = new THREE.Vector3();
            this._hasSmoothedCameraPosition = false;

            this.shaderPass.uniforms.rimIntensity.value = this._intensity;
            this.shaderPass.uniforms.rimOuterWrap.value = this._outerWrap;
            this.shaderPass.uniforms.shadowStrength.value = this._shadowStrength;
            this.shaderPass.uniforms.rimColor.value.setHex(this._colorHex);
            this.shaderPass.enabled = this._effectEnabled;
          }

          private _getShadowLights(scene: THREE.Scene): Array<THREE.DirectionalLight> {
            const lights: Array<THREE.DirectionalLight> = [];
            scene.traverse((object3D) => {
              if (lights.length >= 3) {
                return;
              }
              const light = object3D as THREE.DirectionalLight & {
                isDirectionalLight?: boolean;
              };
              if (!light || !light.isDirectionalLight || !light.castShadow) {
                return;
              }
              const shadowMap = light.shadow && light.shadow.map;
              if (!shadowMap || !shadowMap.texture) {
                return;
              }
              lights.push(light);
            });
            return lights;
          }

          private _updateShadowUniforms(scene: THREE.Scene): void {
            const lights = this._getShadowLights(scene);
            for (let i = 0; i < 3; i++) {
              const light = lights[i];
              const shadowTextureUniform = this.shaderPass.uniforms[
                `shadowMap${i}`
              ];
              const shadowMatrixUniform = this.shaderPass.uniforms[
                `shadowMatrix${i}`
              ];
              const shadowEnabledUniform = this.shaderPass.uniforms[
                `shadowEnabled${i}`
              ];

              if (!light || !light.shadow || !light.shadow.map) {
                shadowTextureUniform.value = null;
                shadowEnabledUniform.value = 0.0;
                continue;
              }

              shadowTextureUniform.value = light.shadow.map.texture;
              shadowMatrixUniform.value.copy(light.shadow.matrix);
              shadowEnabledUniform.value = 1.0;
            }
          }

          private _updateFogUniforms(scene: THREE.Scene): void {
            const fog = scene.fog;
            if (!fog) {
              this.shaderPass.uniforms.fogMode.value = 0.0;
              this.shaderPass.uniforms.fogNear.value = 1.0;
              this.shaderPass.uniforms.fogFar.value = 2000.0;
              this.shaderPass.uniforms.fogDensity.value = 0.001;
              return;
            }

            const linearFog = fog as THREE.Fog;
            if ((linearFog as THREE.Fog & { isFog?: boolean }).isFog) {
              this.shaderPass.uniforms.fogMode.value = 1.0;
              this.shaderPass.uniforms.fogNear.value = linearFog.near;
              this.shaderPass.uniforms.fogFar.value = linearFog.far;
              this.shaderPass.uniforms.fogDensity.value = 0.001;
              return;
            }

            const expFog = fog as THREE.FogExp2;
            if ((expFog as THREE.FogExp2 & { isFogExp2?: boolean }).isFogExp2) {
              this.shaderPass.uniforms.fogMode.value = 2.0;
              this.shaderPass.uniforms.fogNear.value = 1.0;
              this.shaderPass.uniforms.fogFar.value = 2000.0;
              this.shaderPass.uniforms.fogDensity.value = expFog.density;
              return;
            }

            this.shaderPass.uniforms.fogMode.value = 0.0;
          }

          private _updateSmoothedCamera(camera: THREE.Camera): void {
            if (!this._hasSmoothedCameraPosition) {
              this._smoothedCameraPosition.copy(camera.position);
              this._hasSmoothedCameraPosition = true;
              return;
            }
            // 1-frame lerp buffer to reduce fast-rotation edge jitter.
            this._smoothedCameraPosition.lerp(camera.position, 0.5);
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
            }
            return this.removeEffect(target);
          }

          applyEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            target.getRenderer().addPostProcessingPass(this.shaderPass);
            this._hasSmoothedCameraPosition = false;
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
            threeCamera.updateProjectionMatrix();
            threeCamera.projectionMatrixInverse
              .copy(threeCamera.projectionMatrix)
              .invert();

            this._updateSmoothedCamera(threeCamera);
            this._updateShadowUniforms(threeScene);
            this._updateFogUniforms(threeScene);

            this.shaderPass.enabled = true;
            this.shaderPass.uniforms.tSceneColor.value = sharedCapture.colorTexture;
            this.shaderPass.uniforms.tDepth.value = sharedCapture.depthTexture;
            this.shaderPass.uniforms.resolution.value.set(
              sharedCapture.width,
              sharedCapture.height
            );
            this.shaderPass.uniforms.cameraProjectionMatrix.value.copy(
              threeCamera.projectionMatrix
            );
            this.shaderPass.uniforms.cameraProjectionMatrixInverse.value.copy(
              threeCamera.projectionMatrixInverse
            );
            this.shaderPass.uniforms.cameraMatrixWorld.value.copy(
              threeCamera.matrixWorld
            );
            this.shaderPass.uniforms.smoothedCameraPosition.value.copy(
              this._smoothedCameraPosition
            );
            this.shaderPass.uniforms.rimIntensity.value = this._intensity;
            this.shaderPass.uniforms.rimOuterWrap.value = this._outerWrap;
            this.shaderPass.uniforms.shadowStrength.value = this._shadowStrength;
            this.shaderPass.uniforms.rimColor.value.setHex(this._colorHex);
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this._intensity = Math.max(0, value);
            } else if (parameterName === 'outerWrap') {
              this._outerWrap = Math.max(0, Math.min(1, value));
            } else if (parameterName === 'shadowStrength') {
              this._shadowStrength = Math.max(0, Math.min(1, value));
            }
          }

          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._intensity;
            }
            if (parameterName === 'outerWrap') {
              return this._outerWrap;
            }
            if (parameterName === 'shadowStrength') {
              return this._shadowStrength;
            }
            return 0;
          }

          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this._colorHex = gdjs.rgbOrHexStringToNumber(value);
            }
          }

          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'color') {
              this._colorHex = value;
            }
          }

          getColorParameter(parameterName: string): number {
            if (parameterName === 'color') {
              return this._colorHex;
            }
            return 0;
          }

          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'enabled') {
              this._effectEnabled = value;
              this.shaderPass.enabled = value;
            }
          }

          getNetworkSyncData(): RimLightNetworkSyncData {
            return {
              i: this._intensity,
              c: this._colorHex,
              o: this._outerWrap,
              s: this._shadowStrength,
              e: this._effectEnabled,
            };
          }

          updateFromNetworkSyncData(syncData: RimLightNetworkSyncData): void {
            this._intensity = Math.max(0, syncData.i);
            this._colorHex = syncData.c;
            this._outerWrap = Math.max(0, Math.min(1, syncData.o));
            this._shadowStrength = Math.max(0, Math.min(1, syncData.s));
            this._effectEnabled = !!syncData.e;

            this.shaderPass.uniforms.rimIntensity.value = this._intensity;
            this.shaderPass.uniforms.rimOuterWrap.value = this._outerWrap;
            this.shaderPass.uniforms.shadowStrength.value = this._shadowStrength;
            this.shaderPass.uniforms.rimColor.value.setHex(this._colorHex);
            this.shaderPass.enabled = this._effectEnabled;
          }
        })();
      }
    })()
  );
}
