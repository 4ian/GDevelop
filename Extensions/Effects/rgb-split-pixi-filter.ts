gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('RGBSplit', {
    makePIXIFilter: function (layer, effectData) {
      const rgbSplitFilter = new PIXI.filters.RGBSplitFilter();
      return rgbSplitFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'redX') {
        filter.red.x = value;
      } else {
        if (parameterName === 'redY') {
          filter.red.y = value;
        } else {
          if (parameterName === 'greenX') {
            filter.green.x = value;
          } else {
            if (parameterName === 'greenY') {
              filter.green.y = value;
            } else {
              if (parameterName === 'blueX') {
                filter.blue.x = value;
              } else {
                if (parameterName === 'blueY') {
                  filter.blue.y = value;
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
