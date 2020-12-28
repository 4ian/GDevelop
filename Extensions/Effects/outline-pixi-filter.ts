namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Outline', {
    makePIXIFilter: function (layer, effectData) {
      const outlineFilter = new PIXI.filters.OutlineFilter();
      return outlineFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const outlineFilter = filter as PIXI.filters.OutlineFilter;
      if (parameterName === 'thickness') {
        outlineFilter.thickness = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {
      const outlineFilter = filter as PIXI.filters.OutlineFilter;
      if (parameterName === 'color') {
        outlineFilter.color = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
      }
    },
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
