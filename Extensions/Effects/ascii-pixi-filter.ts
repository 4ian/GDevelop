namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Ascii', {
    makePIXIFilter: function (layer, effectData) {
      const asciiFilter = new PIXI.filters.AsciiFilter();
      return asciiFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const asciiFilter = filter as PIXI.filters.AsciiFilter;
      if (parameterName === 'size') {
        asciiFilter.size = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
