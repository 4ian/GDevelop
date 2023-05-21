namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Noise',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const noiseFilter = new PIXI.filters.NoiseFilter();
        return noiseFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        // @ts-ignore - unsure why PIXI.filters is not recognised.
        const noiseFilter = (filter as unknown) as PIXI.filters.NoiseFilter;
        if (parameterName !== 'noise') {
          return;
        }
        noiseFilter.noise = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
