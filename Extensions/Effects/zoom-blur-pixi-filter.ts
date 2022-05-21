namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('ZoomBlur', {
    makePIXIFilter: function (target, effectData) {
      const zoomBlurFilter = new PIXI.filters.ZoomBlurFilter();
      return zoomBlurFilter;
    },
    updatePreRender: function (filter, target) {
      const zoomBlurFilter = filter as unknown as PIXI.filters.ZoomBlurFilter;
      zoomBlurFilter.center[0] = Math.round(
        // @ts-ignore - extra properties are stored on the filter.
        zoomBlurFilter._centerX * target.getWidth()
      );
      zoomBlurFilter.center[1] = Math.round(
        // @ts-ignore - extra properties are stored on the filter.
        zoomBlurFilter._centerY * target.getHeight()
      );
    },
    updateDoubleParameter: function (filter, parameterName, value) {
      const zoomBlurFilter = filter as unknown as PIXI.filters.ZoomBlurFilter;
      if (parameterName === 'centerX') {
        // @ts-ignore - extra properties are stored on the filter.
        zoomBlurFilter._centerX = value;
      } else if (parameterName === 'centerY') {
        // @ts-ignore - extra properties are stored on the filter.
        zoomBlurFilter._centerY = value;
      } else if (parameterName === 'innerRadius') {
        zoomBlurFilter.innerRadius = value;
      } else if (parameterName === 'strength') {
        zoomBlurFilter.strength = gdjs.PixiFiltersTools.clampValue(
          value / 10,
          0,
          20
        );
      } else if (parameterName === 'padding') {
        zoomBlurFilter.padding = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
