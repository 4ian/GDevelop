namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('KawaseBlur', {
    makePIXIFilter: function (target, effectData) {
      const kawaseBlurFilter = new PIXI.filters.KawaseBlurFilter();
      return kawaseBlurFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const kawaseBlurFilter =
        filter as unknown as PIXI.filters.KawaseBlurFilter;
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
