namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Sepia',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const colorMatrixFilter = new PIXI.ColorMatrixFilter();
        colorMatrixFilter.sepia(false);
        return colorMatrixFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const colorMatrixFilter = (filter as unknown) as PIXI.ColorMatrixFilter;
        if (parameterName !== 'opacity') {
          return;
        }
        colorMatrixFilter.alpha = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
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
