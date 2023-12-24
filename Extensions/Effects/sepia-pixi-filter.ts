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
        if (parameterName === 'opacity') {
          colorMatrixFilter.alpha = gdjs.PixiFiltersTools.clampValue(
            value,
            0,
            1
          );
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const colorMatrixFilter = (filter as unknown) as PIXI.ColorMatrixFilter;
        if (parameterName === 'opacity') {
          return colorMatrixFilter.alpha;
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
