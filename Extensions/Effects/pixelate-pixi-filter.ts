gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('Pixelate', {
    makePIXIFilter: function (layer, effectData) {
      const PixelateFilter = new PIXI.filters.PixelateFilter(
        effectData.doubleParameters.size
      );
      return PixelateFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'size') {
        filter.size = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
