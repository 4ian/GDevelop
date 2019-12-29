gdjs.PixiFiltersTools.registerFilterCreator('Bevel', {
  makePIXIFilter: function(layer, effectData) {
    var bevelFilter = new PIXI.filters.BevelFilter();

    return bevelFilter;
  },
  update: function(filter, layer) {},
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'rotation') {
      filter.rotation = value;
    } else if (parameterName === 'thickness') {
      filter.thickness = value;
    } else if (parameterName === 'distance') {
      filter.distance = value;
    } else if (parameterName === 'lightAlpha') {
      filter.lightAlpha = value;
    } else if (parameterName === 'shadowAlpha') {
      filter.shadowAlpha = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
    if (parameterName === 'lightColor') {
      filter.lightColor = value.replace('#', '0x');
    }
    if (parameterName === 'shadowColor') {
      filter.shadowColor = value.replace('#', '0x');
    }
  },
  updateBooleanParameter: function(filter, parameterName, value) {},
});
