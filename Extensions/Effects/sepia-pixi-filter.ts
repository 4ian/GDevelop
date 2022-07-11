namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Sepia', {
    makePIXIFilter: function (target, effectData) {
      const colorMatrixFilter = new PIXI.filters.ColorMatrixFilter();
      colorMatrixFilter.sepia(false);
      return colorMatrixFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      // @ts-ignore - unsure why PIXI.filters is not recognised.
      const colorMatrixFilter = (filter as unknown) as PIXI.filters.ColorMatrixFilter;
      if (parameterName !== 'opacity') {
        return;
      }
      colorMatrixFilter.alpha = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
