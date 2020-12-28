namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('ZoomBlur', {
    makePIXIFilter: function (layer, effectData) {
      const zoomBlurFilter = new PIXI.filters.ZoomBlurFilter();
      return zoomBlurFilter;
    },
    update: function (filter, layer) {
      filter.center[0] = Math.round(filter._centerX * layer.getWidth());
      filter.center[1] = Math.round(filter._centerY * layer.getHeight());
    },
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'centerX') {
        filter._centerX = value;
      } else if (parameterName === 'centerY') {
        filter._centerY = value;
      } else if (parameterName === 'innerRadius') {
        filter.innerRadius = value;
      } else if (parameterName === 'strength') {
        filter.strength = gdjs.PixiFiltersTools.clampValue(value / 10, 0, 20);
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
