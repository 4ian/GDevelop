namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'AdvancedBloom',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const advancedBloomFilter = new PIXI.filters.AdvancedBloomFilter();
        return advancedBloomFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
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
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {}
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
    })()
  );
}
