namespace gdjs {
  interface SSAONetworkSyncData {
    r: number;
    i: number;
    b: number;
    s: number;
    e: boolean;
    q?: string;
  }

  const ssaoShader = {
    uniforms: {
      tDiffuse: { value: null },
      tDepth: { value: null },
      resolution: { value: new THREE.Vector2(1, 1) },
      radius: { value: 60.0 },
      intensity: { value: 0.9 },
      bias: { value: 0.6 },
      sampleCount: { value: 4.0 },
      cameraProjectionMatrix: { value: new THREE.Matrix4() },
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

      uniform sampler2D tDiffuse;
      uniform sampler2D tDepth;
      uniform vec2 resolution;
      uniform float radius;
      uniform float intensity;
      uniform float bias;
      uniform float sampleCount;
      uniform mat4 cameraProjectionMatrix;
      uniform mat4 cameraProjectionMatrixInverse;
      varying vec2 vUv;

      const int MAX_SSAO_SAMPLES = 32;

      vec3 viewPositionFromDepth(vec2 uv, float depth) {
        vec4 clip = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 view = cameraProjectionMatrixInverse * clip;
        return view.xyz / max(view.w, 0.00001);
      }

      vec2 projectToUv(vec3 viewPosition) {
        vec4 clip = cameraProjectionMatrix * vec4(viewPosition, 1.0);
        return clip.xy / max(clip.w, 0.00001) * 0.5 + 0.5;
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

      float hash12(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      vec3 randomHemisphereDirection(
        vec2 uv,
        vec3 normal,
        float index,
        float rotationOffset
      ) {
        float u = hash12(uv * vec2(173.3, 157.7) + vec2(index, index * 1.37));
        float v = hash12(uv.yx * vec2(149.1, 181.9) + vec2(index * 2.11, index * 0.73));

        float phi = 6.28318530718 * u + rotationOffset;
        float cosTheta = 1.0 - v;
        float sinTheta = sqrt(max(0.0, 1.0 - cosTheta * cosTheta));

        vec3 randomVec = vec3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta);

        vec3 tangent = normalize(abs(normal.z) < 0.999
          ? cross(normal, vec3(0.0, 0.0, 1.0))
          : cross(normal, vec3(0.0, 1.0, 0.0)));
        vec3 bitangent = cross(normal, tangent);

        return normalize(
          tangent * randomVec.x +
          bitangent * randomVec.y +
          normal * randomVec.z
        );
      }

      float computeAdaptiveSampleCount(vec3 originVS, float requestedCount) {
        float viewDepth = abs(originVS.z);
        float depthFactor = clamp(radius / (radius + viewDepth), 0.45, 1.0);
        float adaptiveCount = floor(requestedCount * depthFactor + 0.5);
        return clamp(adaptiveCount, 4.0, requestedCount);
      }

      float computeAO(vec3 originVS, vec3 normal, vec2 uv) {
        float requestedCount = clamp(sampleCount, 4.0, float(MAX_SSAO_SAMPLES));
        float count = computeAdaptiveSampleCount(originVS, requestedCount);
        float occlusion = 0.0;
        float kernelRotation =
          hash12(uv * resolution + originVS.xy * 0.01) * 6.28318530718;

        for (int i = 0; i < MAX_SSAO_SAMPLES; i++) {
          if (float(i) >= count) {
            break;
          }

          float scale = (float(i) + 0.5) / count;
          scale = mix(0.1, 1.0, scale * scale);
          vec3 sampleDir = randomHemisphereDirection(
            uv,
            normal,
            float(i),
            kernelRotation
          );
          vec3 samplePos = originVS + sampleDir * radius * scale;
          vec2 sampleUv = projectToUv(samplePos);

          if (
            sampleUv.x <= 0.0 || sampleUv.x >= 1.0 ||
            sampleUv.y <= 0.0 || sampleUv.y >= 1.0
          ) {
            continue;
          }

          float sampleDepth = texture2D(tDepth, sampleUv).x;
          if (sampleDepth >= 1.0) {
            continue;
          }

          vec3 geometryPos = viewPositionFromDepth(sampleUv, sampleDepth);
          float signedDepth = geometryPos.z - samplePos.z;
          float rangeWeight = smoothstep(
            0.0,
            1.0,
            radius / (abs(originVS.z - geometryPos.z) + 0.0001)
          );
          float distanceWeight = 1.0 - smoothstep(
            radius * 0.2,
            radius * 1.5,
            length(samplePos - originVS)
          );
          float isOccluded = signedDepth > bias ? 1.0 : 0.0;
          occlusion += isOccluded * rangeWeight * distanceWeight;
        }

        float ao = 1.0 - (occlusion / count) * intensity;
        return clamp(ao, 0.0, 1.0);
      }

      void main() {
        vec4 baseColor = texture2D(tDiffuse, vUv);
        float depth = texture2D(tDepth, vUv).x;
        if (depth >= 1.0 || intensity <= 0.0 || radius <= 0.0) {
          gl_FragColor = baseColor;
          return;
        }

        vec3 viewPos = viewPositionFromDepth(vUv, depth);
        vec3 normal = reconstructNormal(vUv, depth);
        float ao = computeAO(viewPos, normal, vUv);
        float aoBlend = 0.75;
        vec3 aoColor = mix(baseColor.rgb, baseColor.rgb * ao, aoBlend);
        gl_FragColor = vec4(aoColor, baseColor.a);
      }
    `,
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::SSAO',
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
          _radius: number;
          _intensity: number;
          _bias: number;
          _samples: number;
          _effectiveSamples: number;
          _qualityMode: string;

          constructor() {
            this.shaderPass = new THREE_ADDONS.ShaderPass(ssaoShader);
            gdjs.markScene3DPostProcessingPass(this.shaderPass, 'SSAO');
            this._isEnabled = false;
            this._effectEnabled =
              effectData.booleanParameters.enabled === undefined
                ? true
                : !!effectData.booleanParameters.enabled;
            this._radius =
              effectData.doubleParameters.radius !== undefined
                ? Math.max(0.1, effectData.doubleParameters.radius)
                : 60;
            this._intensity =
              effectData.doubleParameters.intensity !== undefined
                ? Math.max(0, effectData.doubleParameters.intensity)
                : 0.9;
            this._bias =
              effectData.doubleParameters.bias !== undefined
                ? Math.max(0, effectData.doubleParameters.bias)
                : 0.6;
            this._samples =
              effectData.doubleParameters.samples !== undefined
                ? Math.max(
                    4,
                    Math.min(
                      32,
                      Math.round(effectData.doubleParameters.samples)
                    )
                  )
                : 4;
            this._effectiveSamples = this._samples;
            this._qualityMode =
              effectData.stringParameters.qualityMode || 'medium';
            this.shaderPass.enabled = true;
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
            gdjs.reorderScene3DPostProcessingPasses(target);
            this._isEnabled = true;
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            target.getRenderer().removePostProcessingPass(this.shaderPass);
            gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'SSAO');
            this._isEnabled = false;
            return true;
          }

          private _adaptQuality(target: gdjs.EffectsTarget): void {
            if (!(target instanceof gdjs.Layer)) {
              return;
            }
            const quality = gdjs.getScene3DPostProcessingQualityProfileForLayerMode(
              target,
              this._qualityMode
            );
            this._effectiveSamples = Math.max(
              4,
              Math.min(quality.ssaoSamples, this._samples)
            );
          }

          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled) {
              return;
            }
            if (!(target instanceof gdjs.Layer)) {
              return;
            }
            if (!this._effectEnabled) {
              this.shaderPass.enabled = false;
              gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'SSAO');
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

            this._adaptQuality(target);
            if (!gdjs.isScene3DPostProcessingEnabled(target)) {
              this.shaderPass.enabled = false;
              gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'SSAO');
              return;
            }
            gdjs.setScene3DPostProcessingEffectQualityMode(
              target,
              'SSAO',
              this._qualityMode
            );

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

            this.shaderPass.enabled = true;
            this.shaderPass.uniforms.resolution.value.set(
              sharedCapture.width,
              sharedCapture.height
            );
            this.shaderPass.uniforms.tDepth.value = sharedCapture.depthTexture;
            this.shaderPass.uniforms.cameraProjectionMatrix.value.copy(
              threeCamera.projectionMatrix
            );
            this.shaderPass.uniforms.cameraProjectionMatrixInverse.value.copy(
              threeCamera.projectionMatrixInverse
            );
            this.shaderPass.uniforms.radius.value = this._radius;
            this.shaderPass.uniforms.intensity.value = this._intensity;
            this.shaderPass.uniforms.bias.value = this._bias;
            this.shaderPass.uniforms.sampleCount.value = this._effectiveSamples;
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'radius') {
              this._radius = Math.max(0.1, value);
            } else if (parameterName === 'intensity') {
              this._intensity = Math.max(0, value);
            } else if (parameterName === 'bias') {
              this._bias = Math.max(0, value);
            } else if (parameterName === 'samples') {
              this._samples = Math.max(4, Math.min(32, Math.round(value)));
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'radius') {
              return this._radius;
            }
            if (parameterName === 'intensity') {
              return this._intensity;
            }
            if (parameterName === 'bias') {
              return this._bias;
            }
            if (parameterName === 'samples') {
              return this._samples;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'qualityMode') {
              this._qualityMode = value || 'medium';
            }
          }
          updateColorParameter(parameterName: string, value: number): void {}
          getColorParameter(parameterName: string): number {
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'enabled') {
              this._effectEnabled = value;
              this.shaderPass.enabled = value;
            }
          }
          getNetworkSyncData(): SSAONetworkSyncData {
            return {
              r: this._radius,
              i: this._intensity,
              b: this._bias,
              s: this._samples,
              e: this._effectEnabled,
              q: this._qualityMode,
            };
          }
          updateFromNetworkSyncData(syncData: SSAONetworkSyncData): void {
            this._radius = Math.max(0.1, syncData.r);
            this._intensity = Math.max(0, syncData.i);
            this._bias = Math.max(0, syncData.b);
            this._samples = Math.max(4, Math.min(32, Math.round(syncData.s)));
            this._effectiveSamples = Math.max(4, Math.min(24, this._samples));
            this._effectEnabled = syncData.e;
            this._qualityMode = syncData.q || 'medium';

            this.shaderPass.uniforms.radius.value = this._radius;
            this.shaderPass.uniforms.intensity.value = this._intensity;
            this.shaderPass.uniforms.bias.value = this._bias;
            this.shaderPass.uniforms.sampleCount.value = this._effectiveSamples;
            this.shaderPass.enabled = this._effectEnabled;
          }
        })();
      }
    })()
  );
}
