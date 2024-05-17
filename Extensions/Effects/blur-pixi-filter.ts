namespace gdjs {
  interface BlurFilterNetworkSyncData {
    b: number;
    q: number;
    ks: number;
    res: number | null;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Blur',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const blur = new PIXI.BlurFilter();
        return blur;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        if (
          parameterName !== 'blur' &&
          parameterName !== 'quality' &&
          parameterName !== 'kernelSize' &&
          parameterName !== 'resolution'
        ) {
          return;
        }
        if (parameterName === 'kernelSize') {
          value = gdjs.PixiFiltersTools.clampKernelSize(value, 5, 15);
        }
        filter[parameterName] = value;
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        return filter[parameterName] || 0;
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
      getNetworkSyncData(filter: PIXI.Filter): BlurFilterNetworkSyncData {
        return {
          b: filter['blur'],
          q: filter['quality'],
          ks: filter['kernelSize'],
          res: filter['resolution'],
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: BlurFilterNetworkSyncData
      ) {
        filter['blur'] = data.b;
        filter['quality'] = data.q;
        filter['kernelSize'] = data.ks;
        filter['resolution'] = data.res;
      }
    })()
  );
}
