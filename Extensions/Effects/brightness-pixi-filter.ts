namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Brightness', {
    makePIXIFilter: function (target, effectData) {
      const brightness = new PIXI.filters.ColorMatrixFilter();
      brightness.brightness(1, false);
      return brightness;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      // @ts-ignore - unsure why PIXI.filters is not recognised.
      const brightnessFilter = (filter as unknown) as PIXI.filters.ColorMatrixFilter;
      if (parameterName !== 'brightness') {
        return;
      }
      brightnessFilter.brightness(
        gdjs.PixiFiltersTools.clampValue(value, 0, 1),
        false
      );
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
