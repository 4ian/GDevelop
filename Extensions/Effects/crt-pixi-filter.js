gdjs.PixiFiltersTools.registerFilterCreator('CRT', {
  makePIXIFilter: function(layer, effectData) {
    var crtFilter = new PIXI.filters.CRTFilter();
    crtFilter._animationTimer = 0;
    return crtFilter;
  },
  update: function(filter, layer) {
    if (filter.animationSpeed !== 0) {
      filter.time += layer.getElapsedTime() / 1000 * filter.animationSpeed;
      filter._animationTimer += filter.animationSpeed;
      if (filter._animationTimer >= 1) {
        filter.seed = Math.random();
        filter._animationTimer = 0
      }
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
    } else if (parameterName === 'animationSpeed') {
      filter.animationSpeed = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {},
  updateBooleanParameter: function(filter, parameterName, value) {
    if (parameterName === 'verticalLine') {
      filter.verticalLine = value;
    }
  },
});
