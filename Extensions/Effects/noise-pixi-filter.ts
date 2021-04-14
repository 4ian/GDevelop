namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;
  gdjs.PixiFiltersTools.registerFilterCreator('Noise', {
    makePIXIFilter: function (layer, effectData) {
      const noiseFilter = new PIXI.filters.NoiseFilter();
      return noiseFilter;
    },
    update: function (filter, layer) {},
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
