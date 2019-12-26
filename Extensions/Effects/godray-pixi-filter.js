gdjs.PixiFiltersTools.registerFilterCreator('Godray', {
  makePIXIFilter: function(layer, effectData) {
    var godrayFilter = new PIXI.filters.GodrayFilter();

    return godrayFilter;
  },
  update: function(filter, layer) {
     if (filter.animated) {
      filter.time += layer.getElapsedTime() / 1000;
    }
  },
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'lacunarity') {
      filter.lacunarity = value;
    }
    if (parameterName === 'angle') {
      filter.angle = value;
    }
    if (parameterName === 'gain') {
      filter.gain = value;
    }
    if (parameterName === 'light') {
      filter.light = value;
    }
    if (parameterName === 'x') {
      filter.x = value;
    }
    if (parameterName === 'y') {
      filter.y = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
  },
  updateBooleanParameter: function(filter, parameterName, value) {
    if (parameterName === 'parallel') {
      filter.parallel = value;
    }
    if (parameterName === 'animated') {
      filter.animated = value;
    }
  },
});
