namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('ColorReplace', {
    makePIXIFilter: function (target, effectData) {
      const colorReplaceFilter = new PIXI.filters.ColorReplaceFilter();
      return colorReplaceFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const colorReplaceFilter =
        filter as unknown as PIXI.filters.ColorReplaceFilter;
      if (parameterName === 'epsilon') {
        colorReplaceFilter.epsilon = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {
      const colorReplaceFilter =
        filter as unknown as PIXI.filters.ColorReplaceFilter;
      if (parameterName === 'originalColor') {
        colorReplaceFilter.originalColor =
          gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
      } else if (parameterName === 'newColor') {
        colorReplaceFilter.newColor =
          gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
      }
    },
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
