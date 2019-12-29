gdjs.PixiFiltersTools.registerFilterCreator('Glow', {
  makePIXIFilter: function(layer, effectData) {
    var glowFilter = new PIXI.filters.GlowFilter();

    return glowFilter;
  },
  update: function(filter, layer) {},
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'innerStrength') {
      filter.innerStrength = value;
    } else if (parameterName === 'outerStrength') {
      filter.outerStrength = value;
    } else if (parameterName === 'distance') {
      filter.distance = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
    if (parameterName === 'color') {
      filter.color = value.replace('#', '0x');
    }
  },
  updateBooleanParameter: function(filter, parameterName, value) {},
});
