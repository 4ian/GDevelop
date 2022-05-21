namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('BulgePinch', {
    makePIXIFilter: function (target, effectData) {
      const bulgePinchFilter = new PIXI.filters.BulgePinchFilter();
      return bulgePinchFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const bulgePinchFilter =
        filter as unknown as PIXI.filters.BulgePinchFilter;
      if (parameterName === 'centerX') {
        bulgePinchFilter.center[0] = value;
      } else if (parameterName === 'centerY') {
        bulgePinchFilter.center[1] = value;
      } else if (parameterName === 'radius') {
        bulgePinchFilter.radius = value;
      } else if (parameterName === 'strength') {
        bulgePinchFilter.strength = gdjs.PixiFiltersTools.clampValue(
          value,
          -1,
          1
        );
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
