namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Noise', {
    makePIXIFilter: function (layer, effectData) {
      const noiseFilter = new PIXI.filters.NoiseFilter();
      return noiseFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const noiseFilter = filter as PIXI.filters.NoiseFilter;
      if (parameterName !== 'noise') {
        return;
      }
      noiseFilter.noise = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
