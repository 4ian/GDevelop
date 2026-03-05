namespace gdjs {
  interface VignetteNetworkSyncData {
    i: number;
    s: number;
    r: number;
    c: number;
    e: boolean;
  }

  const vignetteShader = {
    uniforms: {
      tDiffuse: { value: null },
      resolution: { value: new THREE.Vector2(1, 1) },
      intensity: { value: 0.35 },
      softness: { value: 0.45 },
      roundness: { value: 1.0 },
      vignetteColor: { value: new THREE.Vector3(0, 0, 0) },
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
      uniform vec2 resolution;
      uniform float intensity;
      uniform float softness;
      uniform float roundness;
      uniform vec3 vignetteColor;
      varying vec2 vUv;

      void main() {
        vec4 baseColor = texture2D(tDiffuse, vUv);
        if (intensity <= 0.0) {
          gl_FragColor = baseColor;
          return;
        }

        vec2 centered = (vUv - vec2(0.5)) * 2.0;
        float safeHeight = max(resolution.y, 1.0);
        float aspect = resolution.x / safeHeight;
        centered.x *= aspect;

        float shapeScale = mix(1.6, 0.7, clamp(roundness, 0.0, 1.0));
        centered.x *= shapeScale;

        float distanceFromCenter = length(centered);
        float edgeStart = clamp(1.0 - clamp(softness, 0.01, 1.0), 0.0, 0.99);
        float edgeMask = smoothstep(edgeStart, 1.0, distanceFromCenter);
        float blendFactor = clamp(intensity, 0.0, 1.0) * edgeMask;

        vec3 finalColor = mix(
          baseColor.rgb,
          baseColor.rgb * vignetteColor,
          blendFactor
        );
        gl_FragColor = vec4(finalColor, baseColor.a);
      }
    `,
  };

  const clampVignetteIntensity = (value: number): number =>
    gdjs.evtTools.common.clamp(0, 1, value);
  const clampVignetteSoftness = (value: number): number =>
    gdjs.evtTools.common.clamp(0.01, 1, value);
  const clampVignetteRoundness = (value: number): number =>
    gdjs.evtTools.common.clamp(0, 1, value);

  const markScene3DPostProcessingPassIfAvailable = (
    pass: THREE_ADDONS.ShaderPass,
    effectId: string
  ): void => {
    const maybeMarker = (gdjs as unknown as {
      markScene3DPostProcessingPass?: (
        pass: THREE_ADDONS.ShaderPass,
        effectId: string
      ) => void;
    }).markScene3DPostProcessingPass;
    if (typeof maybeMarker === 'function') {
      maybeMarker(pass, effectId);
    }
  };

  const isScene3DPostProcessingEnabledOrFallback = (
    target: gdjs.Layer
  ): boolean => {
    const maybeChecker = (gdjs as unknown as {
      isScene3DPostProcessingEnabled?: (target: gdjs.Layer) => boolean;
    }).isScene3DPostProcessingEnabled;
    return typeof maybeChecker === 'function' ? maybeChecker(target) : true;
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::Vignette',
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
          _softness: number;
          _roundness: number;
          _vignetteColor: THREE.Color;
          _renderSize: THREE.Vector2;

          constructor() {
            this.shaderPass = new THREE_ADDONS.ShaderPass(vignetteShader);
            markScene3DPostProcessingPassIfAvailable(
              this.shaderPass,
              'VIGNETTE'
            );
            this._isEnabled = false;
            this._effectEnabled =
              effectData.booleanParameters.enabled === undefined
                ? true
                : !!effectData.booleanParameters.enabled;
            this._intensity = clampVignetteIntensity(
              effectData.doubleParameters.intensity !== undefined
                ? effectData.doubleParameters.intensity
                : 0.35
            );
            this._softness = clampVignetteSoftness(
              effectData.doubleParameters.softness !== undefined
                ? effectData.doubleParameters.softness
                : 0.45
            );
            this._roundness = clampVignetteRoundness(
              effectData.doubleParameters.roundness !== undefined
                ? effectData.doubleParameters.roundness
                : 1.0
            );
            this._vignetteColor = new THREE.Color(
              gdjs.rgbOrHexStringToNumber(
                effectData.stringParameters.color || '0;0;0'
              )
            );
            this._renderSize = new THREE.Vector2(1, 1);
            this._updateShaderUniforms();
            this.shaderPass.enabled = this._effectEnabled;
            void target;
          }

          private _updateShaderUniforms(): void {
            this.shaderPass.uniforms.intensity.value = this._intensity;
            this.shaderPass.uniforms.softness.value = this._softness;
            this.shaderPass.uniforms.roundness.value = this._roundness;
            this.shaderPass.uniforms.vignetteColor.value.set(
              this._vignetteColor.r,
              this._vignetteColor.g,
              this._vignetteColor.b
            );
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

            const threeRenderer = target
              .getRuntimeScene()
              .getGame()
              .getRenderer()
              .getThreeRenderer();
            if (!threeRenderer) {
              return;
            }
            if (!isScene3DPostProcessingEnabledOrFallback(target)) {
              this.shaderPass.enabled = false;
              return;
            }

            threeRenderer.getDrawingBufferSize(this._renderSize);
            this.shaderPass.uniforms.resolution.value.set(
              Math.max(1, this._renderSize.x || target.getWidth()),
              Math.max(1, this._renderSize.y || target.getHeight())
            );
            this._updateShaderUniforms();
            this.shaderPass.enabled = true;
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this._intensity = clampVignetteIntensity(value);
            } else if (parameterName === 'softness') {
              this._softness = clampVignetteSoftness(value);
            } else if (parameterName === 'roundness') {
              this._roundness = clampVignetteRoundness(value);
            }
            this._updateShaderUniforms();
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._intensity;
            }
            if (parameterName === 'softness') {
              return this._softness;
            }
            if (parameterName === 'roundness') {
              return this._roundness;
            }
            return 0;
          }

          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this._vignetteColor.setHex(gdjs.rgbOrHexStringToNumber(value));
              this._updateShaderUniforms();
            }
          }
          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'color') {
              this._vignetteColor.setHex(value);
              this._updateShaderUniforms();
            }
          }
          getColorParameter(parameterName: string): number {
            if (parameterName === 'color') {
              return this._vignetteColor.getHex();
            }
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'enabled') {
              this._effectEnabled = value;
              this.shaderPass.enabled = value;
            }
          }

          getNetworkSyncData(): VignetteNetworkSyncData {
            return {
              i: this._intensity,
              s: this._softness,
              r: this._roundness,
              c: this._vignetteColor.getHex(),
              e: this._effectEnabled,
            };
          }

          updateFromNetworkSyncData(syncData: VignetteNetworkSyncData): void {
            this._intensity = clampVignetteIntensity(syncData.i);
            this._softness = clampVignetteSoftness(syncData.s);
            this._roundness = clampVignetteRoundness(syncData.r);
            this._vignetteColor.setHex(syncData.c);
            this._effectEnabled = !!syncData.e;
            this._updateShaderUniforms();
            this.shaderPass.enabled = this._effectEnabled;
          }
        })();
      }
    })()
  );
}
