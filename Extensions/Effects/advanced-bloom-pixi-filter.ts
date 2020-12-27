gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('AdvancedBloom', {
    makePIXIFilter: function (layer, effectData) {
      const advancedBloomFilter = new PIXI.filters.AdvancedBloomFilter();
      return advancedBloomFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'threshold') {
        filter.threshold = value;
      } else {
        if (parameterName === 'bloomScale') {
          filter.bloomScale = value;
        } else {
          if (parameterName === 'brightness') {
            filter.brightness = value;
          } else {
            if (parameterName === 'blur') {
              filter.blur = value;
            } else {
              if (parameterName === 'quality') {
                filter.quality = value;
              }
            }
          }
        }
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
