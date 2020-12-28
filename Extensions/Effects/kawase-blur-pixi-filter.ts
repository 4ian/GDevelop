namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('KawaseBlur', {
    makePIXIFilter: function (layer, effectData) {
      const kawaseBlurFilter = new PIXI.filters.KawaseBlurFilter();
      return kawaseBlurFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'pixelizeX') {
        filter.pixelizeX = value;
      } else if (parameterName === 'pixelizeY') {
        filter.pixelizeY = value;
      } else if (parameterName === 'blur') {
        filter.blur = value;
      } else if (parameterName === 'quality') {
        filter.quality = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
