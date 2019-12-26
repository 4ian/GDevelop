gdjs.PixiFiltersTools.registerFilterCreator('Kawase blur', {
  makePIXIFilter: function(layer, effectData) {
    var kawaseBlurFilter = new PIXI.filters.KawaseBlurFilter();

    return kawaseBlurFilter;
  },
  update: function(filter, layer) {
  },
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'pixelizeX') {
      filter.pixelizeX = value;
    }
    if (parameterName === 'pixelizeY') {
      filter.pixelizeY = value;
    }
    if (parameterName === 'blur') {
      filter.blur = value;
    }
    if (parameterName === 'quality') {
      filter.quality = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
  },
  updateBooleanParameter: function(filter, parameterName, value) {
  },
});
