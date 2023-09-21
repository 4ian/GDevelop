namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Noise',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const noiseFilter = new PIXI.NoiseFilter();
        return noiseFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const noiseFilter = (filter as unknown) as PIXI.NoiseFilter;
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
