gdjs.PixiFiltersTools.registerFilterCreator('Twist', {
  makePIXIFilter: function(layer, effectData) {
    var twistFilter = new PIXI.filters.TwistFilter();

    return twistFilter;
  },
  update: function(filter, layer) {
  },
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'radius') {
      filter.radius = value;
    }
    else if (parameterName === 'angle') {
      filter.angle = value;
    }
    else if (parameterName === 'padding') {
      filter.padding = value;
    }
    else if (parameterName === 'offsetX') {
      filter.offset[0] = value;
    }
    else if (parameterName === 'offsetY') {
      filter.offset[1] = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
  },
  updateBooleanParameter: function(filter, parameterName, value) {
  },
});
