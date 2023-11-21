namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Noise',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const noiseFilter = new PIXI.NoiseFilter();
        return noiseFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const noiseFilter = (filter as unknown) as PIXI.NoiseFilter;
        if (parameterName !== 'noise') {
          return;
        }
        noiseFilter.noise = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {}
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
    })()
  );
}
