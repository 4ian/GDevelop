gdjs.PixiFiltersTools.registerFilterCreator('OldFilm', {
  makePIXIFilter: function(layer, effectData) {
    var oldFilmFilter = new PIXI.filters.OldFilmFilter();

    return oldFilmFilter;
  },  
  update: function(filter, layer) {
    if (filter.animated) {
      filter.time += layer.getElapsedTime() / 1000;
      filter.seed = Math.random();
    }
  },
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'sepia') {
      filter.sepia = value;
    }
    else if (parameterName === 'noise') {
      filter.noise = value;
    }
    else if (parameterName === 'noiseSize') {
      filter.noiseSize = value;
    }
    else if (parameterName === 'scratch') {
      filter.scratch = value;
    }
    else if (parameterName === 'scratchDensity') {
      filter.scratchDensity = value;
    }
    else if (parameterName === 'scratchWidth') {
      filter.scratchWidth = value;
    }
    else if (parameterName === 'vignetting') {
      filter.vignetting = value;
    }
    else if (parameterName === 'vignettingAlpha') {
      filter.vignettingAlpha = value;
    }
    else if (parameterName === 'vignettingBlur') {
      filter.vignettingBlur = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {},
  updateBooleanParameter: function(filter, parameterName, value) {
    if (parameterName === 'animated') {
      filter.animated = value;
    }
  },
});
