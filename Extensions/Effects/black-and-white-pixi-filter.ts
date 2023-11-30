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
