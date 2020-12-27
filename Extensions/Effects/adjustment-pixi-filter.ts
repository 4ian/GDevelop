gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('Adjustment', {
    makePIXIFilter: function (layer, effectData) {
      const adjustmentFilter = new PIXI.filters.AdjustmentFilter();
      return adjustmentFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'gamma') {
        filter.gamma = value;
      } else {
        if (parameterName === 'saturation') {
          filter.saturation = value;
        } else {
          if (parameterName === 'contrast') {
            filter.contrast = value;
          } else {
            if (parameterName === 'brightness') {
              filter.brightness = value;
            } else {
              if (parameterName === 'red') {
                filter.red = value;
              } else {
                if (parameterName === 'green') {
                  filter.green = value;
                } else {
                  if (parameterName === 'blue') {
                    filter.blue = value;
                  } else {
                    if (parameterName === 'alpha') {
                      filter.alpha = value;
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
