gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('BlendingMode', {
    makePIXIFilter: function (layer, effectData) {
      const blendingModeFilter = new PIXI.filters.AlphaFilter();
      return blendingModeFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'alpha') {
        filter.alpha = value;
      }
      if (parameterName === 'blendmode') {
        filter.blendMode = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
