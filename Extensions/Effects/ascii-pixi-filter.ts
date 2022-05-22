namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Ascii', {
    makePIXIFilter: function (target, effectData) {
      const asciiFilter = new PIXI.filters.AsciiFilter();
      return asciiFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const asciiFilter = filter as unknown as PIXI.filters.AsciiFilter;
      if (parameterName === 'size') {
        asciiFilter.size = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
