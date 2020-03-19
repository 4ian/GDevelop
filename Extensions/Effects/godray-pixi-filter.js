gdjs.PixiFiltersTools.registerFilterCreator('Godray', {
  makePIXIFilter: function(layer, effectData) {
    var godrayFilter = new PIXI.filters.GodrayFilter();
    godrayFilter._animationTimer = 0;
    return godrayFilter;
  },
  update: function(filter, layer) {
    if (filter.animationFrequency !== 0) { 
      filter._animationTimer += layer.getElapsedTime() / 1000;
      if (filter._animationTimer >= 1 / filter.animationFrequency) {
        filter.time += layer.getElapsedTime() / 1000;
        filter._animationTimer = 0;
      }
    }
  },
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'lacunarity') {
      filter.lacunarity = value;
    } else if (parameterName === 'angle') {
      filter.angle = value;
    } else if (parameterName === 'gain') {
      filter.gain = value;
    } else if (parameterName === 'light') {
      filter.light = value;
    } else if (parameterName === 'x') {
      filter.x = value;
    } else if (parameterName === 'y') {
      filter.y = value;
    } else if (parameterName === 'animationFrequency') {
      filter.animationFrequency = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {},
  updateBooleanParameter: function(filter, parameterName, value) {
    if (parameterName === 'parallel') {
      filter.parallel = value;
    }
  },
});
