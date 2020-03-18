gdjs.PixiFiltersTools.registerFilterCreator('RadialBlur', {
  makePIXIFilter: function(layer, effectData) {
    var radialBlurFilter = new PIXI.filters.RadialBlurFilter();

    return radialBlurFilter;
  },
  update: function(filter, layer) {
  },
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'radius') {
      filter.radius = (value < 0 ? -1 : value);
    }
    else if (parameterName === 'angle') {
      filter.angle = value;
    }
    else if (parameterName === 'kernelSize') {
      filter.kernelSize = gdjs.PixiFiltersTools.clampKernelSize(value, 3, 25);
    }
    else if (parameterName === 'centerX') {
      filter.center[0] = value;
    }
    else if (parameterName === 'centerY') {
      filter.center[1] = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
  },
  updateBooleanParameter: function(filter, parameterName, value) {
  },
});
