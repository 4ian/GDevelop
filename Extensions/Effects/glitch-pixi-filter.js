gdjs.PixiFiltersTools.registerFilterCreator('Glitch', {
  makePIXIFilter: function(layer, effectData) {
    var glitchFilter = new PIXI.filters.GlitchFilter();

    return glitchFilter;
  },
  update: function(filter, layer) {
    if (filter.animated) {
      filter.time += layer.getElapsedTime() / 1000;
      filter.seed = Math.random();
    }
  },
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'slices') {
      filter.slices = value;
    }
    else if (parameterName === 'offset') {
      filter.offset = value;
    }
    else if (parameterName === 'direction') {
      filter.direction = value;
    }
    else if (parameterName === 'fillMode') {
      filter.fillMode = value;
    }
    else if (parameterName === 'minSize') {
      filter.minSize = value;
    }
    else if (parameterName === 'sampleSize') {
      filter.sampleSize = value;
    }
    else if (parameterName === 'redX') {
      filter.red.x = value;
    }
    else if (parameterName === 'redY') {
      filter.red.y = value;
    }
    else if (parameterName === 'greenX') {
      filter.green.x = value;
    }
    else if (parameterName === 'greenY') {
      filter.green.y = value;
    }
    else if (parameterName === 'blueX') {
      filter.blue.x = value;
    }
    else if (parameterName === 'blueY') {
      filter.blue.y = value;
    }

  },
  updateStringParameter: function(filter, parameterName, value) {},
  updateBooleanParameter: function(filter, parameterName, value) {
    if (parameterName === 'animated') {
      filter.animated = value;
    }
    else if (parameterName === 'average') {
      filter.average = value;
    }
  },
});
