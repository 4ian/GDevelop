namespace gdjs {
  interface ToneMappingNetworkSyncData {
    m: string;
    x: number;
    e: boolean;
  }

  interface ToneMappingRendererState {
    toneMapping: THREE.ToneMapping;
    toneMappingExposure: number;
    outputColorSpace: any;
    useLegacyLights: boolean | null;
  }

  const normalizeToneMappingMode = (mode: string): string => {
    const normalized = (mode || '')
      .trim()
      .toLowerCase()
      .replace(/[\s_-]/g, '');
    if (normalized === 'reinhard') {
      return 'Reinhard';
    }
    if (normalized === 'cineon') {
      return 'Cineon';
    }
    if (normalized === 'linear') {
      return 'Linear';
    }
    return 'ACESFilmic';
  };

  const getToneMappingConstant = (mode: string): THREE.ToneMapping => {
    if (mode === 'Reinhard') {
      return THREE.ReinhardToneMapping;
    }
    if (mode === 'Cineon') {
      return THREE.CineonToneMapping;
    }
    if (mode === 'Linear') {
      // Requested behavior: "Linear" acts as no tone mapping.
      return THREE.NoToneMapping;
    }
    return THREE.ACESFilmicToneMapping;
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::ToneMapping',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          _isEnabled: boolean;
          _effectEnabled: boolean;
          _mode: string;
          _exposure: number;
          _rendererState: ToneMappingRendererState | null;
          _boundRenderer: THREE.WebGLRenderer | null;

          constructor() {
            this._isEnabled = false;
            this._effectEnabled =
              effectData.booleanParameters.enabled === undefined
                ? true
                : !!effectData.booleanParameters.enabled;
            this._mode = normalizeToneMappingMode(
              effectData.stringParameters.mode || 'ACESFilmic'
            );
            this._exposure = Math.max(
              0,
              effectData.doubleParameters.exposure !== undefined
                ? effectData.doubleParameters.exposure
                : 1.0
            );
            this._rendererState = null;
            this._boundRenderer = null;
          }

          private _getRenderer(
            target: EffectsTarget
          ): THREE.WebGLRenderer | null {
            if (!(target instanceof gdjs.Layer)) {
              return null;
            }
            return target
              .getRuntimeScene()
              .getGame()
              .getRenderer()
              .getThreeRenderer();
          }

          private _captureRendererState(renderer: THREE.WebGLRenderer): void {
            if (this._boundRenderer === renderer && this._rendererState) {
              return;
            }

            // Defensive: if target renderer changes, restore old renderer first.
            if (this._boundRenderer && this._rendererState) {
              this._restoreRendererState(this._boundRenderer);
            }

            const rendererWithLegacyLights = renderer as THREE.WebGLRenderer & {
              useLegacyLights?: boolean;
            };
            this._rendererState = {
              toneMapping: renderer.toneMapping,
              toneMappingExposure: renderer.toneMappingExposure,
              outputColorSpace: renderer.outputColorSpace,
              useLegacyLights:
                typeof rendererWithLegacyLights.useLegacyLights === 'boolean'
                  ? rendererWithLegacyLights.useLegacyLights
                  : null,
            };
            this._boundRenderer = renderer;
          }

          private _restoreRendererState(renderer: THREE.WebGLRenderer): void {
            if (!this._rendererState) {
              return;
            }

            renderer.toneMapping = this._rendererState.toneMapping;
            renderer.toneMappingExposure =
              this._rendererState.toneMappingExposure;
            renderer.outputColorSpace = this._rendererState.outputColorSpace;

            const rendererWithLegacyLights = renderer as THREE.WebGLRenderer & {
              useLegacyLights?: boolean;
            };
            if (
              this._rendererState.useLegacyLights !== null &&
              typeof rendererWithLegacyLights.useLegacyLights === 'boolean'
            ) {
              rendererWithLegacyLights.useLegacyLights =
                this._rendererState.useLegacyLights;
            }

            this._rendererState = null;
            this._boundRenderer = null;
          }

          private _setPhysicalLighting(renderer: THREE.WebGLRenderer): void {
            const rendererWithLegacyLights = renderer as THREE.WebGLRenderer & {
              useLegacyLights?: boolean;
            };
            if (typeof rendererWithLegacyLights.useLegacyLights === 'boolean') {
              rendererWithLegacyLights.useLegacyLights = false;
            }
          }

          private _applyToneMapping(target: EffectsTarget): boolean {
            const renderer = this._getRenderer(target);
            if (!renderer) {
              return false;
            }

            this._captureRendererState(renderer);
            const mode = normalizeToneMappingMode(this._mode);
            renderer.toneMapping = getToneMappingConstant(mode);
            renderer.toneMappingExposure = Math.max(0, this._exposure);
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            this._setPhysicalLighting(renderer);
            return true;
          }

          private _disableToneMapping(target: EffectsTarget): boolean {
            const renderer = this._getRenderer(target);
            if (!renderer) {
              return false;
            }

            if (this._boundRenderer === renderer && this._rendererState) {
              this._restoreRendererState(renderer);
            } else if (this._boundRenderer && this._rendererState) {
              this._restoreRendererState(this._boundRenderer);
            }
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
            }
            return this.removeEffect(target);
          }

          applyEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            this._isEnabled = true;
            if (!this._effectEnabled) {
              return this._disableToneMapping(target);
            }
            return this._applyToneMapping(target);
          }

          removeEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            this._isEnabled = false;
            return this._disableToneMapping(target);
          }

          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled) {
              return;
            }

            if (this._effectEnabled) {
              this._applyToneMapping(target);
            } else {
              this._disableToneMapping(target);
            }
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'exposure') {
              this._exposure = Math.max(0, value);
            }
          }

          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'exposure') {
              return this._exposure;
            }
            return 0;
          }

          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'mode') {
              this._mode = normalizeToneMappingMode(value);
            }
          }

          updateColorParameter(parameterName: string, value: number): void {}

          getColorParameter(parameterName: string): number {
            return 0;
          }

          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'enabled') {
              this._effectEnabled = value;
            }
          }

          getNetworkSyncData(): ToneMappingNetworkSyncData {
            return {
              m: this._mode,
              x: this._exposure,
              e: this._effectEnabled,
            };
          }

          updateFromNetworkSyncData(
            syncData: ToneMappingNetworkSyncData
          ): void {
            this._mode = normalizeToneMappingMode(syncData.m);
            this._exposure = Math.max(0, syncData.x);
            this._effectEnabled = !!syncData.e;
          }
        })();
      }
    })()
  );
}
