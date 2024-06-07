namespace gdjs {
  interface AdvancedBloomFilterNetworkSyncData {
    th: number;
    bs: number;
    bn: number;
    b: number;
    q: number;
    p: number;
  }
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
      getNetworkSyncData(
        filter: PIXI.Filter
      ): AdvancedBloomFilterNetworkSyncData {
        const advancedBloomFilter = (filter as unknown) as PIXI.filters.AdvancedBloomFilter;
        return {
          th: advancedBloomFilter.threshold,
          bs: advancedBloomFilter.bloomScale,
          bn: advancedBloomFilter.brightness,
          b: advancedBloomFilter.blur,
          q: advancedBloomFilter.quality,
          p: advancedBloomFilter.padding,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        syncData: AdvancedBloomFilterNetworkSyncData
      ) {
        const advancedBloomFilter = (filter as unknown) as PIXI.filters.AdvancedBloomFilter;
        advancedBloomFilter.threshold = syncData.th;
        advancedBloomFilter.bloomScale = syncData.bs;
        advancedBloomFilter.brightness = syncData.bn;
        advancedBloomFilter.blur = syncData.b;
        advancedBloomFilter.quality = syncData.q;
        advancedBloomFilter.padding = syncData.p;
      }
    })()
  );
}
