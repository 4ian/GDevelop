namespace gdjs {
  const clampPostProcessingTargetFps = (value: number): number =>
    gdjs.evtTools.common.clamp(
      24,
      144,
      Number.isFinite(value) ? value : 60
    );

  interface PostProcessingStackNetworkSyncData {
    q: string;
    e: boolean;
    aq?: boolean;
    tf?: number;
  }

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::PostProcessingStack',
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
          _stackEnabled: boolean;
          _qualityMode: string;
          _adaptiveQualityEnabled: boolean;
          _targetFps: number;

          constructor() {
            this._isEnabled = false;
            this._stackEnabled =
              effectData.booleanParameters.enabled === undefined
                ? true
                : !!effectData.booleanParameters.enabled;
            this._qualityMode =
              effectData.stringParameters.qualityMode || 'medium';
            this._adaptiveQualityEnabled =
              effectData.booleanParameters.adaptiveQuality === undefined
                ? true
                : !!effectData.booleanParameters.adaptiveQuality;
            this._targetFps = clampPostProcessingTargetFps(
              effectData.doubleParameters.targetFps
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
            } else {
              return this.removeEffect(target);
            }
          }

          applyEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            this._isEnabled = true;
            gdjs.setScene3DPostProcessingStackConfig(
              target,
              this._stackEnabled,
              this._qualityMode,
              this._adaptiveQualityEnabled,
              this._targetFps
            );
            gdjs.reorderScene3DPostProcessingPasses(target);
            return true;
          }

          removeEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            gdjs.clearScene3DPostProcessingStackConfig(target);
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

            gdjs.setScene3DPostProcessingStackConfig(
              target,
              this._stackEnabled,
              this._qualityMode,
              this._adaptiveQualityEnabled,
              this._targetFps
            );
            gdjs.reorderScene3DPostProcessingPasses(target);

            if (!this._stackEnabled) {
              return;
            }
            if (!gdjs.hasManagedScene3DPostProcessingPass(target)) {
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

            gdjs.captureScene3DSharedTextures(
              target,
              threeRenderer,
              threeScene,
              threeCamera
            );
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'targetFps') {
              this._targetFps = clampPostProcessingTargetFps(value);
            }
          }

          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'targetFps') {
              return this._targetFps;
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
              this._stackEnabled = value;
            } else if (parameterName === 'adaptiveQuality') {
              this._adaptiveQualityEnabled = value;
            }
          }

          getNetworkSyncData(): PostProcessingStackNetworkSyncData {
            return {
              q: this._qualityMode,
              e: this._stackEnabled,
              aq: this._adaptiveQualityEnabled,
              tf: this._targetFps,
            };
          }

          updateFromNetworkSyncData(
            syncData: PostProcessingStackNetworkSyncData
          ): void {
            this._qualityMode = syncData.q || 'medium';
            this._stackEnabled = !!syncData.e;
            this._adaptiveQualityEnabled =
              syncData.aq === undefined ? true : !!syncData.aq;
            this._targetFps = clampPostProcessingTargetFps(syncData.tf || 60);
          }
        })();
      }
    })()
  );
}
