namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Outline', {
    makePIXIFilter: function (target, effectData) {
      const outlineFilter = new PIXI.filters.OutlineFilter();
      return outlineFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const outlineFilter = filter as unknown as PIXI.filters.OutlineFilter;
      if (parameterName === 'thickness') {
        outlineFilter.thickness = value;
      } else if (parameterName === 'padding') {
        outlineFilter.padding = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {
      const outlineFilter = filter as unknown as PIXI.filters.OutlineFilter;
      if (parameterName === 'color') {
        outlineFilter.color = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
      }
    },
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
