namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('AdvancedBloom', {
    makePIXIFilter: function (layer, effectData) {
      const advancedBloomFilter = new PIXI.filters.AdvancedBloomFilter();
      return advancedBloomFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const advancedBloomFilter = filter as PIXI.filters.AdvancedBloomFilter;
      if (parameterName === 'threshold') {
        advancedBloomFilter.threshold = value;
      } else if (parameterName === 'bloomScale') {
        advancedBloomFilter.bloomScale = value;
      } else if (parameterName === 'brightness') {
        advancedBloomFilter.brightness = value;
      } else if (parameterName === 'blur') {
        advancedBloomFilter.blur = value;
      } else if (parameterName === 'quality') {
        advancedBloomFilter.quality = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
