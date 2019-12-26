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
    else if (parameterName === 'lacunarity') {
      filter.lacunarity = value;
    }
    else if (parameterName === 'angle') {
      filter.angle = value;
    }
    else if (parameterName === 'gain') {
      filter.gain = value;
    }
    else if (parameterName === 'light') {
      filter.light = value;
    }
    else if (parameterName === 'x') {
      filter.x = value;
    }
    else if (parameterName === 'y') {
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
