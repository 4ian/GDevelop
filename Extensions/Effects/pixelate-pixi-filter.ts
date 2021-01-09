namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Pixelate', {
    makePIXIFilter: function (layer, effectData) {
      const pixelateFilter = new PIXI.filters.PixelateFilter(
        effectData.doubleParameters.size
      );
      return pixelateFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const pixelateFilter = filter as PIXI.filters.PixelateFilter;
      if (parameterName === 'size') {
        pixelateFilter.size = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
