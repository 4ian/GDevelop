namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Adjustment', {
    makePIXIFilter: function (target, effectData) {
      const adjustmentFilter = new PIXI.filters.AdjustmentFilter();
      return adjustmentFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const adjustmentFilter =
        filter as unknown as PIXI.filters.AdjustmentFilter;
      if (parameterName === 'gamma') {
        adjustmentFilter.gamma = value;
      } else if (parameterName === 'saturation') {
        adjustmentFilter.saturation = value;
      } else if (parameterName === 'contrast') {
        adjustmentFilter.contrast = value;
      } else if (parameterName === 'brightness') {
        adjustmentFilter.brightness = value;
      } else if (parameterName === 'red') {
        adjustmentFilter.red = value;
      } else if (parameterName === 'green') {
        adjustmentFilter.green = value;
      } else if (parameterName === 'blue') {
        adjustmentFilter.blue = value;
      } else if (parameterName === 'alpha') {
        adjustmentFilter.alpha = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
