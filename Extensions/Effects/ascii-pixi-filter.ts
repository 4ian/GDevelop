namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Ascii',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const asciiFilter = new PIXI.filters.AsciiFilter();
        return asciiFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const asciiFilter = (filter as unknown) as PIXI.filters.AsciiFilter;
        if (parameterName === 'size') {
          asciiFilter.size = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const asciiFilter = (filter as unknown) as PIXI.filters.AsciiFilter;
        if (parameterName === 'size') {
          return asciiFilter.size;
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
