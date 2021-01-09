namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('BlackAndWhite', {
    makePIXIFilter: function (layer, effectData) {
      const colorMatrix = new PIXI.filters.ColorMatrixFilter();
      colorMatrix.blackAndWhite(false);
      return colorMatrix;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const colorMatrix = filter as PIXI.filters.ColorMatrixFilter;
      if (parameterName !== 'opacity') {
        return;
      }
      colorMatrix.alpha = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
