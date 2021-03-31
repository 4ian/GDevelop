namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('BlendingMode', {
    makePIXIFilter: function (layer, effectData) {
      const blendingModeFilter = new PIXI.filters.AlphaFilter();
      return blendingModeFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const blendingModeFilter = filter as PIXI.filters.AlphaFilter;
      if (parameterName === 'alpha') {
        blendingModeFilter.alpha = value;
      } else if (parameterName === 'blendmode') {
        blendingModeFilter.blendMode = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
