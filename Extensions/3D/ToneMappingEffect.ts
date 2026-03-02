namespace gdjs {
  interface ToneMappingNetworkSyncData {
    m: string;
    x: number;
    e: boolean;
  }

  const normalizeToneMappingMode = (mode: string): string => {
    const normalized = (mode || '').trim().toLowerCase().replace(/[\s_-]/g, '');
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
          _oldUseLegacyLights: boolean | null;

          constructor() {
            this._isEnabled = false;
            this._effectEnabled = true;
            this._mode = 'ACESFilmic';
            this._exposure = 1.0;
            this._oldUseLegacyLights = null;
            void effectData;
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

          private _setPhysicalLighting(renderer: THREE.WebGLRenderer): void {
            const rendererWithLegacyLights = renderer as THREE.WebGLRenderer & {
              useLegacyLights?: boolean;
            };
            if (
              this._oldUseLegacyLights === null &&
              typeof rendererWithLegacyLights.useLegacyLights === 'boolean'
            ) {
              this._oldUseLegacyLights = rendererWithLegacyLights.useLegacyLights;
            }
            if (typeof rendererWithLegacyLights.useLegacyLights === 'boolean') {
              rendererWithLegacyLights.useLegacyLights = false;
            }
          }

          private _restoreLegacyLighting(renderer: THREE.WebGLRenderer): void {
            const rendererWithLegacyLights = renderer as THREE.WebGLRenderer & {
              useLegacyLights?: boolean;
            };
            if (
              this._oldUseLegacyLights !== null &&
              typeof rendererWithLegacyLights.useLegacyLights === 'boolean'
            ) {
              rendererWithLegacyLights.useLegacyLights = this._oldUseLegacyLights;
            }
          }

          private _applyToneMapping(target: EffectsTarget): boolean {
            const renderer = this._getRenderer(target);
            if (!renderer) {
              return false;
            }

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

            renderer.toneMapping = THREE.NoToneMapping;
            this._restoreLegacyLighting(renderer);
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

          updateFromNetworkSyncData(syncData: ToneMappingNetworkSyncData): void {
            this._mode = normalizeToneMappingMode(syncData.m);
            this._exposure = Math.max(0, syncData.x);
            this._effectEnabled = !!syncData.e;
          }
        })();
      }
    })()
  );
}
