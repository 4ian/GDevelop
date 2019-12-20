gdjs.PixiFiltersTools.registerFilterCreator('AdvancedBloom', {
  makePIXIFilter: function() {
    var advancedBloom = new PIXI.filters.AdvancedBloomFilter();

    return advancedBloom;
  },
  updateParameter: function(filter, parameterName, value) {
    if (!['threshold', 'bloomScale', 'brightness', 'blur', 'quality'].includes(parameterName)) return;

    filter[parameterName] = gdjs.PixiFiltersTools.clampValue(value, 0, 20);
  },
});
