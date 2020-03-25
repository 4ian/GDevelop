gdjs.PixiFiltersTools.registerFilterCreator('Blur', {
  makePIXIFilter: function(layer, effectData) {
    var blur = new PIXI.filters.BlurFilter();
    return blur;
  },
  update: function(filter, layer) {},
  updateDoubleParameter: function(filter, parameterName, value) {
    if (
      parameterName !== 'blur' &&
      parameterName !== 'quality' &&
      parameterName !== 'kernelSize' &&
      parameterName !== 'resolution'
    )
      return;

    if (parameterName === 'kernelSize') {
      value = gdjs.PixiFiltersTools.clampKernelSize(value, 5, 15);
    }

    filter[parameterName] = value;
  },
  updateStringParameter: function(filter, parameterName, value) {},
  updateBooleanParameter: function(filter, parameterName, value) {},
});
