gdjs.PixiFiltersTools.registerFilterCreator('ZoomBlur', {
  makePIXIFilter: function(layer, effectData) {
    var zoomBlurFilter = new PIXI.filters.ZoomBlurFilter();

    return zoomBlurFilter;
  },
  update: function(filter, layer) {
  },
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'centerX') {
      filter.center[0] = Math.round(window.innerWidth * value);
    }
    else if (parameterName === 'centerY') {
      filter.center[1] = Math.round(window.innerHeight * value);
    }
    else if (parameterName === 'innerRadius') {
      filter.innerRadius = Math.round(window.innerWidth * value);
    }
    else if (parameterName === 'strength') {
      filter.strength = gdjs.PixiFiltersTools.clampValue(value / 10, 0, 20);
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
  },
  updateBooleanParameter: function(filter, parameterName, value) {
  },
});
