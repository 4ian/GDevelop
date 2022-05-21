namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Pixelate', {
    makePIXIFilter: function (target, effectData) {
      const pixelateFilter = new PIXI.filters.PixelateFilter(
        effectData.doubleParameters.size
      );
      return pixelateFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const pixelateFilter = filter as unknown as PIXI.filters.PixelateFilter;
      if (parameterName === 'size') {
        pixelateFilter.size = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
