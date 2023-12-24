namespace gdjs {
  interface PixelateFilterExtra {
    /** It's only set to a number. */
    size: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Pixelate',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const pixelateFilter = new PIXI.filters.PixelateFilter(
          effectData.doubleParameters.size
        );
        return pixelateFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const pixelateFilter = (filter as unknown) as PIXI.filters.PixelateFilter &
          PixelateFilterExtra;
        if (parameterName === 'size') {
          pixelateFilter.size = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const pixelateFilter = (filter as unknown) as PIXI.filters.PixelateFilter &
          PixelateFilterExtra;
        if (parameterName === 'size') {
          return pixelateFilter.size;
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
