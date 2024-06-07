namespace gdjs {
  interface KawaseBlurFilterNetworkSyncData {
    px: number;
    py: number;
    b: number;
    q: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'KawaseBlur',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const kawaseBlurFilter = new PIXI.filters.KawaseBlurFilter();
        return kawaseBlurFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const kawaseBlurFilter = (filter as unknown) as PIXI.filters.KawaseBlurFilter;
        if (parameterName === 'pixelizeX') {
          kawaseBlurFilter.pixelSize[0] = value;
        } else if (parameterName === 'pixelizeY') {
          kawaseBlurFilter.pixelSize[1] = value;
        } else if (parameterName === 'blur') {
          kawaseBlurFilter.blur = value;
        } else if (parameterName === 'quality') {
          kawaseBlurFilter.quality = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const kawaseBlurFilter = (filter as unknown) as PIXI.filters.KawaseBlurFilter;
        if (parameterName === 'pixelizeX') {
          return kawaseBlurFilter.pixelSize[0];
        }
        if (parameterName === 'pixelizeY') {
          return kawaseBlurFilter.pixelSize[1];
        }
        if (parameterName === 'blur') {
          return kawaseBlurFilter.blur;
        }
        if (parameterName === 'quality') {
          return kawaseBlurFilter.quality;
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
      getNetworkSyncData(filter: PIXI.Filter): KawaseBlurFilterNetworkSyncData {
        const kawaseBlurFilter = (filter as unknown) as PIXI.filters.KawaseBlurFilter;
        return {
          px: kawaseBlurFilter.pixelSize[0],
          py: kawaseBlurFilter.pixelSize[1],
          b: kawaseBlurFilter.blur,
          q: kawaseBlurFilter.quality,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: KawaseBlurFilterNetworkSyncData
      ) {
        const kawaseBlurFilter = (filter as unknown) as PIXI.filters.KawaseBlurFilter;
        kawaseBlurFilter.pixelSize[0] = data.px;
        kawaseBlurFilter.pixelSize[1] = data.py;
        kawaseBlurFilter.blur = data.b;
        kawaseBlurFilter.quality = data.q;
      }
    })()
  );
}
