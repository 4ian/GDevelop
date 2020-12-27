gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('RadialBlur', {
    makePIXIFilter: function (layer, effectData) {
      const radialBlurFilter = new PIXI.filters.RadialBlurFilter();
      return radialBlurFilter;
    },
    update: function (filter, layer) {
      filter.center[0] = Math.round(filter._centerX * layer.getWidth());
      filter.center[1] = Math.round(filter._centerY * layer.getHeight());
    },
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'radius') {
        filter.radius = value < 0 ? -1 : value;
      } else {
        if (parameterName === 'angle') {
          filter.angle = value;
        } else {
          if (parameterName === 'kernelSize') {
            filter.kernelSize = gdjs.PixiFiltersTools.clampKernelSize(
              value,
              3,
              25
            );
          } else {
            if (parameterName === 'centerX') {
              filter._centerX = value;
            } else {
              if (parameterName === 'centerY') {
                filter._centerY = value;
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
