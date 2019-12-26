gdjs.PixiFiltersTools.registerFilterCreator('Crt', {
  makePIXIFilter: function(layer, effectData) {
    var crtFilter = new PIXI.filters.CRTFilter();

    return crtFilter;
  },
  update: function(filter, layer) {
     if (filter.animated) {
      filter.time += layer.getElapsedTime() / 1000;
      filter.seed = Math.random();
    }
  },
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'lineWidth') {
      filter.lineWidth = value;
    }
    if (parameterName === 'lineContrast') {
      filter.lineContrast = value;
    }
    if (parameterName === 'noise') {
      filter.noise = value;
    }
    if (parameterName === 'curvature') {
      filter.curvature = value;
    }
    if (parameterName === 'noiseSize') {
      filter.noiseSize = value;
    }
    if (parameterName === 'vignetting') {
      filter.vignetting = value;
    }
    if (parameterName === 'vignettingAlpha') {
      filter.vignettingAlpha = value;
    }
    if (parameterName === 'vignettingBlur') {
      filter.vignettingBlur = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
  },
  updateBooleanParameter: function(filter, parameterName, value) {
    if (parameterName === 'verticalLine') {
      filter.verticalLine = value;
    }
    if (parameterName === 'animated') {
      filter.animated = value;
    }
  },
});
