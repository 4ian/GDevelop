namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('BlackAndWhite', {
    makePIXIFilter: function (target, effectData) {
      const colorMatrix = new PIXI.filters.ColorMatrixFilter();
      colorMatrix.blackAndWhite(false);
      return colorMatrix;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      // @ts-ignore - unsure why PIXI.filters is not recognised.
      const colorMatrix = (filter as unknown) as PIXI.filters.ColorMatrixFilter;
      if (parameterName !== 'opacity') {
        return;
      }
      colorMatrix.alpha = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
