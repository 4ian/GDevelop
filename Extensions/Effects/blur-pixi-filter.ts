namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Blur', {
    makePIXIFilter: function (target, effectData) {
      const blur = new PIXI.filters.BlurFilter();
      return blur;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (
        parameterName !== 'blur' &&
        parameterName !== 'quality' &&
        parameterName !== 'kernelSize' &&
        parameterName !== 'resolution'
      ) {
        return;
      }
      if (parameterName === 'kernelSize') {
        value = gdjs.PixiFiltersTools.clampKernelSize(value, 5, 15);
      }
      filter[parameterName] = value;
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
