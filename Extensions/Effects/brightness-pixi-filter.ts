namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Brightness', {
    makePIXIFilter: function (layer, effectData) {
      const brightness = new PIXI.filters.ColorMatrixFilter();
      brightness.brightness(1, false);
      return brightness;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const brightnessFilter = filter as PIXI.filters.ColorMatrixFilter;
      if (parameterName !== 'brightness') {
        return;
      }
      brightnessFilter.brightness(gdjs.PixiFiltersTools.clampValue(value, 0, 1), false);
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
