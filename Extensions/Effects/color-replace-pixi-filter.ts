gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('ColorReplace', {
    makePIXIFilter: function (layer, effectData) {
      const colorReplaceFilter = new PIXI.filters.ColorReplaceFilter();
      return colorReplaceFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'epsilon') {
        filter.epsilon = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {
      if (parameterName === 'originalColor') {
        filter.originalColor = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
      } else {
        if (parameterName === 'newColor') {
          filter.newColor = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
        }
      }
    },
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
