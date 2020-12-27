gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('Godray', {
    makePIXIFilter: function (layer, effectData) {
      const godrayFilter = new PIXI.filters.GodrayFilter();
      return godrayFilter;
    },
    update: function (filter, layer) {
      if (filter.animationSpeed !== 0) {
        filter.time += (layer.getElapsedTime() / 1000) * filter.animationSpeed;
      }
    },
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'lacunarity') {
        filter.lacunarity = value;
      } else {
        if (parameterName === 'angle') {
          filter.angle = value;
        } else {
          if (parameterName === 'gain') {
            filter.gain = value;
          } else {
            if (parameterName === 'light') {
              filter.light = value;
            } else {
              if (parameterName === 'x') {
                filter.x = value;
              } else {
                if (parameterName === 'y') {
                  filter.y = value;
                } else {
                  if (parameterName === 'animationSpeed') {
                    filter.animationSpeed = value;
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
      if (parameterName === 'parallel') {
        filter.parallel = value;
      }
    },
  });
}
