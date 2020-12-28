namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Sepia', {
    makePIXIFilter: function (layer, effectData) {
      const colorMatrixFilter = new PIXI.filters.ColorMatrixFilter();
      colorMatrixFilter.sepia(false);
      return colorMatrixFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const colorMatrixFilter = filter as PIXI.filters.ColorMatrixFilter;
      if (parameterName !== 'opacity') {
        return;
      }
      colorMatrixFilter.alpha = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
