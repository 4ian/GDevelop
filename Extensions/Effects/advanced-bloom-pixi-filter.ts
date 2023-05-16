namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'AdvancedBloom',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const advancedBloomFilter = new PIXI.filters.AdvancedBloomFilter();
        return advancedBloomFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const advancedBloomFilter = (filter as unknown) as PIXI.filters.AdvancedBloomFilter;
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
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
