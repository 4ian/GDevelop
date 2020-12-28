namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Brightness', {
    makePIXIFilter: function (layer, effectData) {
      const brightness = new PIXI.filters.ColorMatrixFilter();
      brightness.brightness(1);
      return brightness;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName !== 'brightness') {
        return;
      }
      filter.brightness(gdjs.PixiFiltersTools.clampValue(value, 0, 1));
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
