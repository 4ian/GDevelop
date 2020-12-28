namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Ascii', {
    makePIXIFilter: function (layer, effectData) {
      const asciiFilter = new PIXI.filters.AsciiFilter();
      return asciiFilter;
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
