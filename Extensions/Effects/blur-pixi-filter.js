gdjs.PixiFiltersTools.registerFilterCreator('Blur', {
  makePIXIFilter: function(layer, effectData) {
    const kernelSize = gdjs.PixiFiltersTools.clampKernelSize(
      effectData.doubleParameters.kernelSize,
      5,
      15
    );
    var blur = new PIXI.filters.BlurFilter(8, 4, 1, kernelSize);

    return blur;
  },
  update: function(filter, layer) {},
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'blur') {
      filter.blur = value;
    }
    else if (parameterName === 'quality') {
      filter.quality = value;
    }
    else if (parameterName === 'resolution') {
      filter.resolution = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {},
  updateBooleanParameter: function(filter, parameterName, value) {},
});
