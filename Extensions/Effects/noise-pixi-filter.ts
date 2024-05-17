namespace gdjs {
  interface NoiseFilterNetworkSyncData {
    n: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Noise',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const noiseFilter = new PIXI.NoiseFilter();
        return noiseFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const noiseFilter = (filter as unknown) as PIXI.NoiseFilter;
        if (parameterName === 'noise') {
          noiseFilter.noise = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const noiseFilter = (filter as unknown) as PIXI.NoiseFilter;
        if (parameterName === 'noise') {
          return noiseFilter.noise;
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
      getNetworkSyncData(filter: PIXI.Filter): NoiseFilterNetworkSyncData {
        const noiseFilter = (filter as unknown) as PIXI.NoiseFilter;
        return { n: noiseFilter.noise };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: NoiseFilterNetworkSyncData
      ) {
        const noiseFilter = (filter as unknown) as PIXI.NoiseFilter;
        noiseFilter.noise = data.n;
      }
    })()
  );
}
