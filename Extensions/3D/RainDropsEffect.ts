namespace gdjs {
  interface RainDropsNetworkSyncData {
    i: number;
    d: number;
    s: number;
    si: number;
    rs: number;
    wa: number;
    w: number;
    q: string;
    e: boolean;
    t?: number;
  }

  const MAX_DROPS = 48;
  const MAX_STREAKS = 64;

  const rainDropsShader = {
    uniforms: {
      tDiffuse: { value: null },
      resolution: { value: new THREE.Vector2(1, 1) },
      time: { value: 0.0 },
      intensity: { value: 1.0 },
      dropCount: { value: 24.0 },
      streakCount: { value: 32.0 },
      streakIntensity: { value: 0.6 },
      refractionStrength: { value: 1.0 },
      windAngle: { value: 0.0 },
      wetness: { value: 1.0 },
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

      #define MAX_DROPS ${MAX_DROPS}
      #define MAX_STREAKS ${MAX_STREAKS}

      uniform sampler2D tDiffuse;
      uniform vec2 resolution;
      uniform float time;
      uniform float intensity;
      uniform float dropCount;
      uniform float streakCount;
      uniform float streakIntensity;
      uniform float refractionStrength;
      uniform float windAngle;
      uniform float wetness;
      varying vec2 vUv;

      float drop(vec2 uv, float seed, float currentTime) {
        vec2 center = vec2(
          fract(sin(seed * 127.1) * 43758.5),
          fract(cos(seed * 311.7) * 13758.5)
        );

        float lifetime = fract(seed * 0.317 + currentTime * 0.15);
        center.y = mix(
          0.1,
          0.9,
          fract(center.y + currentTime * 0.08 * (0.5 + fract(seed * 0.77)))
        );

        float size = mix(0.008, 0.022, fract(seed * 0.541));
        float swell =
          mix(0.75, 1.35, smoothstep(0.08, 0.45, lifetime)) *
          mix(1.0, 0.65, smoothstep(0.6, 1.0, lifetime));
        size *= swell;

        float dist = length(uv - center);
        float blob = smoothstep(size, size * 0.3, dist);
        float shimmer = 0.5 + 0.5 * sin(currentTime * 3.0 + seed * 6.28);
        float alive =
          smoothstep(0.0, 0.12, lifetime) *
          (1.0 - smoothstep(0.72, 1.0, lifetime));
        return blob * shimmer * alive;
      }

      float streak(vec2 uv, float seed, float currentTime) {
        float x = fract(sin(seed * 93.9) * 78197.5);
        float speed = 0.3 + fract(seed * 0.413) * 0.7;
        float width = 0.001 + fract(seed * 0.271) * 0.002;
        float len = 0.04 + fract(seed * 0.631) * 0.08;
        float y = fract(seed * 0.5 + currentTime * speed);

        vec2 windDir = vec2(sin(windAngle), cos(windAngle));
        float yDelta = uv.y - y;
        float xDrift = yDelta * windDir.x * 0.35;

        float onX = smoothstep(width, 0.0, abs((uv.x - x) - xDrift));
        float onY =
          smoothstep(0.0, len * 0.3, yDelta) *
          smoothstep(len, len * 0.5, yDelta);
        return onX * onY;
      }

      vec2 refractionOffset(vec2 uv, float dropMask, vec2 texel) {
        vec2 normal = vec2(dFdx(dropMask), dFdy(dropMask)) * 8.0;
        return uv + normal * texel * refractionStrength * dropMask;
      }

      void main() {
        float totalDrop = 0.0;
        float totalStreak = 0.0;

        float activeDrops = clamp(dropCount, 1.0, float(MAX_DROPS));
        float activeStreaks = clamp(streakCount, 1.0, float(MAX_STREAKS));

        for (int i = 0; i < MAX_DROPS; i++) {
          if (float(i) >= activeDrops) break;
          totalDrop += drop(vUv, float(i), time);
        }
        for (int i = 0; i < MAX_STREAKS; i++) {
          if (float(i) >= activeStreaks) break;
          totalStreak += streak(vUv, float(i) + 100.0, time);
        }

        totalDrop = clamp(totalDrop * clamp(intensity, 0.0, 2.0), 0.0, 1.0);
        totalStreak = clamp(
          totalStreak * streakIntensity * clamp(intensity, 0.0, 2.0),
          0.0,
          0.6
        );

        vec2 refractedUV = refractionOffset(vUv, totalDrop, 1.0 / resolution);
        vec4 refractedColor =
          texture2D(tDiffuse, clamp(refractedUV, vec2(0.0), vec2(1.0)));
        vec4 baseColor = texture2D(tDiffuse, vUv);

        vec3 dropColor = refractedColor.rgb * (1.0 + totalDrop * 0.15);
        vec3 streakColor = baseColor.rgb + vec3(totalStreak * 0.12);

        vec3 finalColor = mix(baseColor.rgb, dropColor, totalDrop);
        finalColor = mix(finalColor, streakColor, totalStreak);
        finalColor *= mix(1.0, 0.82, wetness * (1.0 - totalDrop));

        gl_FragColor = vec4(finalColor, baseColor.a);
      }
    `,
    extensions: {
      derivatives: true,
    },
  };

  type RainDropsQualityMode = gdjs.Scene3DPostProcessingQualityMode | 'custom';

  const normalizeRainQualityMode = (value: string): RainDropsQualityMode => {
    const normalized = (value || '').toLowerCase();
    if (normalized === 'custom') {
      return 'custom';
    }
    if (normalized === 'low' || normalized === 'high') {
      return normalized;
    }
    return 'medium';
  };

  const clampRainIntensity = (value: number): number =>
    gdjs.evtTools.common.clamp(0, 2, value);
  const clampDropCount = (value: number): number =>
    gdjs.evtTools.common.clamp(1, MAX_DROPS, value);
  const clampStreakCount = (value: number): number =>
    gdjs.evtTools.common.clamp(1, MAX_STREAKS, value);
  const clampStreakIntensity = (value: number): number =>
    gdjs.evtTools.common.clamp(0, 1, value);
  const clampRefractionStrength = (value: number): number =>
    gdjs.evtTools.common.clamp(0, 2, value);
  const clampWetness = (value: number): number =>
    gdjs.evtTools.common.clamp(0, 1, value);

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::RainDrops',
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
          _dropCount: number;
          _streakCount: number;
          _streakIntensity: number;
          _refractionStrength: number;
          _windAngleRad: number;
          _wetness: number;
          _qualityMode: RainDropsQualityMode;
          _time: number;
          _renderSize: THREE.Vector2;

          constructor() {
            this.shaderPass = new THREE_ADDONS.ShaderPass(rainDropsShader);
            gdjs.markScene3DPostProcessingPass(this.shaderPass, 'RAIN');
            this._isEnabled = false;
            this._effectEnabled =
              effectData.booleanParameters.enabled === undefined
                ? true
                : !!effectData.booleanParameters.enabled;

            this._intensity = clampRainIntensity(
              effectData.doubleParameters.intensity !== undefined
                ? effectData.doubleParameters.intensity
                : 1.0
            );
            this._dropCount = clampDropCount(
              effectData.doubleParameters.dropCount !== undefined
                ? effectData.doubleParameters.dropCount
                : 24
            );
            this._streakCount = clampStreakCount(
              effectData.doubleParameters.streakCount !== undefined
                ? effectData.doubleParameters.streakCount
                : 32
            );
            this._streakIntensity = clampStreakIntensity(
              effectData.doubleParameters.streakIntensity !== undefined
                ? effectData.doubleParameters.streakIntensity
                : 0.6
            );
            this._refractionStrength = clampRefractionStrength(
              effectData.doubleParameters.refractionStrength !== undefined
                ? effectData.doubleParameters.refractionStrength
                : 1.0
            );
            this._windAngleRad = gdjs.toRad(
              effectData.doubleParameters.windAngle !== undefined
                ? effectData.doubleParameters.windAngle
                : 0
            );
            this._wetness = clampWetness(
              effectData.doubleParameters.wetness !== undefined
                ? effectData.doubleParameters.wetness
                : 1.0
            );

            this._qualityMode = normalizeRainQualityMode(
              effectData.stringParameters.qualityMode || 'medium'
            );
            this._time = 0;
            this._renderSize = new THREE.Vector2(1, 1);

            this._applyQualityPreset();
            this._updateShaderUniforms();
            this.shaderPass.enabled = this._effectEnabled;
          }

          private _applyQualityPreset(
            qualityMode?: gdjs.Scene3DPostProcessingQualityMode
          ): void {
            if (this._qualityMode === 'custom') {
              return;
            }

            const resolvedQualityMode = qualityMode || this._qualityMode;
            if (resolvedQualityMode === 'low') {
              this._dropCount = 8;
              this._streakCount = 12;
            } else if (resolvedQualityMode === 'high') {
              this._dropCount = 48;
              this._streakCount = 64;
            } else {
              this._dropCount = 24;
              this._streakCount = 32;
            }
          }

          private _applyQualityPresetFromProfile(
            quality: gdjs.Scene3DPostProcessingQualityProfile
          ): void {
            if (this._qualityMode === 'custom') {
              return;
            }
            if (quality.ssrSteps <= 10) {
              this._dropCount = 8;
              this._streakCount = 12;
            } else if (quality.ssrSteps <= 16) {
              this._dropCount = 24;
              this._streakCount = 32;
            } else {
              this._dropCount = 48;
              this._streakCount = 64;
            }
          }

          private _updateShaderUniforms(): void {
            this.shaderPass.uniforms.time.value = this._time;
            this.shaderPass.uniforms.intensity.value = this._intensity;
            this.shaderPass.uniforms.dropCount.value = this._dropCount;
            this.shaderPass.uniforms.streakCount.value = this._streakCount;
            this.shaderPass.uniforms.streakIntensity.value = this._streakIntensity;
            this.shaderPass.uniforms.refractionStrength.value =
              this._refractionStrength;
            this.shaderPass.uniforms.windAngle.value = this._windAngleRad;
            this.shaderPass.uniforms.wetness.value = this._wetness;
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
            if (this._qualityMode !== 'custom') {
              gdjs.setScene3DPostProcessingEffectQualityMode(
                target,
                'RAIN',
                this._qualityMode
              );
            } else {
              gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'RAIN');
            }
            this._isEnabled = true;
            return true;
          }

          removeEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            target.getRenderer().removePostProcessingPass(this.shaderPass);
            gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'RAIN');
            this._isEnabled = false;
            return true;
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
              gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'RAIN');
              return;
            }

            const runtimeScene = target.getRuntimeScene();
            const threeRenderer = runtimeScene
              .getGame()
              .getRenderer()
              .getThreeRenderer();
            if (!threeRenderer) {
              return;
            }

            if (!gdjs.isScene3DPostProcessingEnabled(target)) {
              this.shaderPass.enabled = false;
              gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'RAIN');
              return;
            }

            if (this._intensity <= 0.0001) {
              this.shaderPass.enabled = false;
              return;
            }

            if (this._qualityMode === 'custom') {
              gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'RAIN');
            } else {
              gdjs.setScene3DPostProcessingEffectQualityMode(
                target,
                'RAIN',
                this._qualityMode
              );
              const quality =
                gdjs.getScene3DPostProcessingQualityProfileForLayerMode(
                  target,
                  this._qualityMode
                );
              this._applyQualityPresetFromProfile(quality);
            }

            const deltaTime = Math.max(0, runtimeScene.getElapsedTime() / 1000);
            this._time += deltaTime;

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
              this._intensity = clampRainIntensity(value);
            } else if (parameterName === 'dropCount') {
              this._dropCount = clampDropCount(value);
              this._qualityMode = 'custom';
            } else if (parameterName === 'streakCount') {
              this._streakCount = clampStreakCount(value);
              this._qualityMode = 'custom';
            } else if (parameterName === 'streakIntensity') {
              this._streakIntensity = clampStreakIntensity(value);
            } else if (parameterName === 'refractionStrength') {
              this._refractionStrength = clampRefractionStrength(value);
            } else if (parameterName === 'windAngle') {
              this._windAngleRad = gdjs.toRad(value);
            } else if (parameterName === 'wetness') {
              this._wetness = clampWetness(value);
            }
            this._updateShaderUniforms();
          }

          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._intensity;
            } else if (parameterName === 'dropCount') {
              return this._dropCount;
            } else if (parameterName === 'streakCount') {
              return this._streakCount;
            } else if (parameterName === 'streakIntensity') {
              return this._streakIntensity;
            } else if (parameterName === 'refractionStrength') {
              return this._refractionStrength;
            } else if (parameterName === 'windAngle') {
              return gdjs.toDegrees(this._windAngleRad);
            } else if (parameterName === 'wetness') {
              return this._wetness;
            }
            return 0;
          }

          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'qualityMode') {
              this._qualityMode = normalizeRainQualityMode(value);
              this._applyQualityPreset();
              this._updateShaderUniforms();
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

          getNetworkSyncData(): RainDropsNetworkSyncData {
            return {
              i: this._intensity,
              d: this._dropCount,
              s: this._streakCount,
              si: this._streakIntensity,
              rs: this._refractionStrength,
              wa: gdjs.toDegrees(this._windAngleRad),
              w: this._wetness,
              q: this._qualityMode,
              e: this._effectEnabled,
              t: this._time,
            };
          }

          updateFromNetworkSyncData(syncData: RainDropsNetworkSyncData): void {
            this._intensity = clampRainIntensity(syncData.i);
            this._dropCount = clampDropCount(syncData.d);
            this._streakCount = clampStreakCount(syncData.s);
            this._streakIntensity = clampStreakIntensity(syncData.si);
            this._refractionStrength = clampRefractionStrength(syncData.rs);
            this._windAngleRad = gdjs.toRad(syncData.wa);
            this._wetness = clampWetness(syncData.w);
            this._qualityMode = normalizeRainQualityMode(syncData.q);
            this._effectEnabled = !!syncData.e;
            this._time = Math.max(0, syncData.t ?? this._time);

            this._applyQualityPreset();
            this._updateShaderUniforms();
            this.shaderPass.enabled = this._effectEnabled;
          }
        })();
      }
    })()
  );
}
