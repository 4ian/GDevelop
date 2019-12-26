gdjs.PixiFiltersTools.registerFilterCreator('Advanced bloom', {
  makePIXIFilter: function(layer, effectData) {
    var advancedBloomFilter = new PIXI.filters.AdvancedBloomFilter();

    return advancedBloomFilter;
  },
  update: function(filter, layer) {
  },
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'threshold') {
      filter.threshold = value;
    }
    if (parameterName === 'bloomScale') {
      filter.bloomScale = value;
    }
    if (parameterName === 'brightness') {
      filter.brightness = value;
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
