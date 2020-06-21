gdjs.PixiFiltersTools.registerFilterCreator('Outline', {
  makePIXIFilter: function(layer, effectData) {
    var outlineFilter = new PIXI.filters.OutlineFilter();

    return outlineFilter;
  },
  update: function(filter, layer) {},
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'thickness') {
      filter.thickness = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
    if (parameterName === 'color') {
      filter.color = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
    }
  },
  updateBooleanParameter: function(filter, parameterName, value) {},
});
