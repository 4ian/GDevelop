gdjs.PixiFiltersTools.registerFilterCreator('DropShadow', {
  makePIXIFilter: function(layer, effectData) {
    var dropShadowFilter = new PIXI.filters.DropShadowFilter();

    return dropShadowFilter;
  },
  update: function(filter, layer) {},
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'blur') {
      filter.blur = value;
    } else if (parameterName === 'quality') {
      filter.quality = value;
    } else if (parameterName === 'alpha') {
      filter.alpha = value;
    } else if (parameterName === 'distance') {
      filter.distance = value;
    } else if (parameterName === 'rotation') {
      filter.rotation = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
    if (parameterName === 'color') {
      filter.color = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
    }
  },
  updateBooleanParameter: function(filter, parameterName, value) {
    if (parameterName === 'shadowOnly') {
      filter.shadowOnly = value;
    }
  },
});
