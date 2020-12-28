namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('RadialBlur', {
    makePIXIFilter: function (layer, effectData) {
      const radialBlurFilter = new PIXI.filters.RadialBlurFilter();
      return radialBlurFilter;
    },
    update: function (filter, layer) {
      const radialBlurFilter = filter as PIXI.filters.RadialBlurFilter;
      // @ts-ignore - extra properties are stored on the filter.
      radialBlurFilter.center[0] = Math.round(radialBlurFilter._centerX * layer.getWidth());
      // @ts-ignore - extra properties are stored on the filter.
      radialBlurFilter.center[1] = Math.round(radialBlurFilter._centerY * layer.getHeight());
    },
    updateDoubleParameter: function (filter, parameterName, value) {
      const radialBlurFilter = filter as PIXI.filters.RadialBlurFilter;
      if (parameterName === 'radius') {
        radialBlurFilter.radius = value < 0 ? -1 : value;
      } else if (parameterName === 'angle') {
        radialBlurFilter.angle = value;
      } else if (parameterName === 'kernelSize') {
        radialBlurFilter.kernelSize = gdjs.PixiFiltersTools.clampKernelSize(value, 3, 25);
      } else if (parameterName === 'centerX') {
        // @ts-ignore - extra properties are stored on the filter.
        radialBlurFilter._centerX = value;
      } else if (parameterName === 'centerY') {
        // @ts-ignore - extra properties are stored on the filter.
        radialBlurFilter._centerY = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
