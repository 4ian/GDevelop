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
      const splitValue = value.split(';');
      if (splitValue.length !== 3) return;
      const hexColor = '#' + gdjs.rgbToHex(
        parseInt(splitValue[0], 0),
        parseInt(splitValue[1], 0),
        parseInt(splitValue[2], 0)
      );
      value = hexColor;
      
    if (parameterName === 'color') {
      filter.color = value.replace('#', '0x');
    }
  },
  updateBooleanParameter: function(filter, parameterName, value) {
    if (parameterName === 'shadowOnly') {
      filter.shadowOnly = value;
    }
  },
});
