namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Noise', {
    makePIXIFilter: function (target, effectData) {
      const noiseFilter = new PIXI.filters.NoiseFilter();
      return noiseFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      // @ts-ignore - unsure why PIXI.filters is not recognised.
      const noiseFilter = (filter as unknown) as PIXI.filters.NoiseFilter;
      if (parameterName !== 'noise') {
        return;
      }
      noiseFilter.noise = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
