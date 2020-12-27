gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('Outline', {
    makePIXIFilter: function (layer, effectData) {
      const outlineFilter = new PIXI.filters.OutlineFilter();
      return outlineFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'thickness') {
        filter.thickness = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {
      if (parameterName === 'color') {
        filter.color = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
      }
    },
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
