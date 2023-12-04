namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'BlendingMode',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const blendingModeFilter = new PIXI.AlphaFilter();
        return blendingModeFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const blendingModeFilter = (filter as unknown) as PIXI.AlphaFilter;
        if (parameterName === 'alpha') {
          blendingModeFilter.alpha = value;
        } else if (parameterName === 'blendmode') {
          blendingModeFilter.blendMode = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const blendingModeFilter = (filter as unknown) as PIXI.AlphaFilter;
        if (parameterName === 'alpha') {
          return blendingModeFilter.alpha;
        }
        if (parameterName === 'blendmode') {
          return blendingModeFilter.blendMode;
        }
        return 0;
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {}
      updateColorParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void {}
      getColorParameter(filter: PIXI.Filter, parameterName: string): number {
        return 0;
      }
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
    })()
  );
}
