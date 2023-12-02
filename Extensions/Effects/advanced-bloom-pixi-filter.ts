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
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const advancedBloomFilter = (filter as unknown) as PIXI.filters.AdvancedBloomFilter;
        if (parameterName === 'threshold') {
          return advancedBloomFilter.threshold;
        }
        if (parameterName === 'bloomScale') {
          return advancedBloomFilter.bloomScale;
        }
        if (parameterName === 'brightness') {
          return advancedBloomFilter.brightness;
        }
        if (parameterName === 'blur') {
          return advancedBloomFilter.blur;
        }
        if (parameterName === 'quality') {
          return advancedBloomFilter.quality;
        }
        if (parameterName === 'padding') {
          return advancedBloomFilter.padding;
        }
        return 0;
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {}
      updateColorParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void {}
      getColorParameter(filter: PIXI.Filter, parameterName: string): number {
        return 0;
      }
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
    })()
  );
}
