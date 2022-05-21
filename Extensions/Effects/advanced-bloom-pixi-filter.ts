namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('AdvancedBloom', {
    makePIXIFilter: function (target, effectData) {
      const advancedBloomFilter = new PIXI.filters.AdvancedBloomFilter();
      return advancedBloomFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const advancedBloomFilter =
        filter as unknown as PIXI.filters.AdvancedBloomFilter;
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
      } else if (parameterName === 'padding') {
        advancedBloomFilter.padding = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
