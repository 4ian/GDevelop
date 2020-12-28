namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('KawaseBlur', {
    makePIXIFilter: function (layer, effectData) {
      const kawaseBlurFilter = new PIXI.filters.KawaseBlurFilter();
      return kawaseBlurFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const kawaseBlurFilter = filter as PIXI.filters.KawaseBlurFilter;
      if (parameterName === 'pixelizeX') {
        // @ts-ignore: fix these wrong parameters
        kawaseBlurFilter.pixelizeX = value;
      } else if (parameterName === 'pixelizeY') {
        // @ts-ignore: fix these wrong parameters
        kawaseBlurFilter.pixelizeY = value;
      } else if (parameterName === 'blur') {
        kawaseBlurFilter.blur = value;
      } else if (parameterName === 'quality') {
        kawaseBlurFilter.quality = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
