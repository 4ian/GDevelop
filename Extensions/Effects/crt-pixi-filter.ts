gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('CRT', {
    makePIXIFilter: function (layer, effectData) {
      const crtFilter = new PIXI.filters.CRTFilter();
      crtFilter._animationTimer = 0;
      return crtFilter;
    },
    update: function (filter, layer) {
      if (filter.animationSpeed !== 0) {
        // Multiply by 10 so that the default value is a sensible speed
        filter.time +=
          (layer.getElapsedTime() / 1000) * 10 * filter.animationSpeed;
      }
      if (filter.animationFrequency !== 0) {
        filter._animationTimer += layer.getElapsedTime() / 1000;
        if (filter._animationTimer >= 1 / filter.animationFrequency) {
          filter.seed = Math.random();
          filter._animationTimer = 0;
        }
      }
    },
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'lineWidth') {
        filter.lineWidth = value;
      } else {
        if (parameterName === 'lineContrast') {
          filter.lineContrast = value;
        } else {
          if (parameterName === 'noise') {
            filter.noise = value;
          } else {
            if (parameterName === 'curvature') {
              filter.curvature = value;
            } else {
              if (parameterName === 'noiseSize') {
                filter.noiseSize = value;
              } else {
                if (parameterName === 'vignetting') {
                  filter.vignetting = value;
                } else {
                  if (parameterName === 'vignettingAlpha') {
                    filter.vignettingAlpha = value;
                  } else {
                    if (parameterName === 'vignettingBlur') {
                      filter.vignettingBlur = value;
                    } else {
                      if (parameterName === 'animationSpeed') {
                        filter.animationSpeed = value;
                      } else {
                        if (parameterName === 'animationFrequency') {
                          filter.animationFrequency = value;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {
      if (parameterName === 'verticalLine') {
        filter.verticalLine = value;
      }
    },
  });
}
