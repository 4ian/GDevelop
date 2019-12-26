gdjs.PixiFiltersTools.registerFilterCreator('CRT', {
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
    } else if (parameterName === 'lineContrast') {
      filter.lineContrast = value;
    } else if (parameterName === 'noise') {
      filter.noise = value;
    } else if (parameterName === 'curvature') {
      filter.curvature = value;
    } else if (parameterName === 'noiseSize') {
      filter.noiseSize = value;
    } else if (parameterName === 'vignetting') {
      filter.vignetting = value;
    } else if (parameterName === 'vignettingAlpha') {
      filter.vignettingAlpha = value;
    } else if (parameterName === 'vignettingBlur') {
      filter.vignettingBlur = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {},
  updateBooleanParameter: function(filter, parameterName, value) {
    if (parameterName === 'verticalLine') {
      filter.verticalLine = value;
    }
    if (parameterName === 'animated') {
      filter.animated = value;
    }
  },
});
