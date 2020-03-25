gdjs.PixiFiltersTools.registerFilterCreator('Twist', {
  makePIXIFilter: function(layer, effectData) {
    var twistFilter = new PIXI.filters.TwistFilter();

    return twistFilter;
  },
  update: function(filter, layer) {
    filter.offset[0] = Math.round(filter._offsetX * layer.getWidth());
    filter.offset[1] = Math.round(filter._offsetY * layer.getHeight());
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
      filter._offsetX = value;
    }
    else if (parameterName === 'offsetY') {
      filter._offsetY = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
  },
  updateBooleanParameter: function(filter, parameterName, value) {
  },
});
