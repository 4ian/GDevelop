gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('Noise', {
    makePIXIFilter: function (layer, effectData) {
      const noise = new PIXI.filters.NoiseFilter();
      return noise;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName !== 'noise') {
        return;
      }
      filter.noise = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
