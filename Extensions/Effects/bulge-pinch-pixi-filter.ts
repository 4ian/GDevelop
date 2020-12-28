namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('BulgePinch', {
    makePIXIFilter: function (layer, effectData) {
      const bulgePinchFilter = new PIXI.filters.BulgePinchFilter();
      return bulgePinchFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'centerX') {
        filter.center[0] = value;
      } else if (parameterName === 'centerY') {
        filter.center[1] = value;
      } else if (parameterName === 'radius') {
        filter.radius = value;
      } else if (parameterName === 'strength') {
        filter.strength = gdjs.PixiFiltersTools.clampValue(value, -1, 1);
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
