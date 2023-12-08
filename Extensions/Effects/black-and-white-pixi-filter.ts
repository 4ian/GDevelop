namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'BlackAndWhite',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const colorMatrix = new PIXI.ColorMatrixFilter();
        colorMatrix.blackAndWhite(false);
        return colorMatrix;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const colorMatrix = (filter as unknown) as PIXI.ColorMatrixFilter;
        if (parameterName !== 'opacity') {
          return;
        }
        colorMatrix.alpha = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const colorMatrix = (filter as unknown) as PIXI.ColorMatrixFilter;
        if (parameterName === 'opacity') {
          return colorMatrix.alpha;
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
