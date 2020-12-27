gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('OldFilm', {
    makePIXIFilter: function (layer, effectData) {
      const oldFilmFilter = new PIXI.filters.OldFilmFilter();
      oldFilmFilter._animationTimer = 0;
      return oldFilmFilter;
    },
    update: function (filter, layer) {
      if (filter.animationFrequency !== 0) {
        filter._animationTimer += layer.getElapsedTime() / 1000;
        if (filter._animationTimer >= 1 / filter.animationFrequency) {
          filter.seed = Math.random();
          filter._animationTimer = 0;
        }
      }
    },
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'sepia') {
        filter.sepia = value;
      } else {
        if (parameterName === 'noise') {
          filter.noise = value;
        } else {
          if (parameterName === 'noiseSize') {
            filter.noiseSize = value;
          } else {
            if (parameterName === 'scratch') {
              filter.scratch = value;
            } else {
              if (parameterName === 'scratchDensity') {
                filter.scratchDensity = value;
              } else {
                if (parameterName === 'scratchWidth') {
                  filter.scratchWidth = value;
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
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
