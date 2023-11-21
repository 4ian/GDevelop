namespace gdjs {
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
        const pixelateFilter = (filter as unknown) as PIXI.filters.PixelateFilter;
        if (parameterName === 'size') {
          pixelateFilter.size = value;
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
