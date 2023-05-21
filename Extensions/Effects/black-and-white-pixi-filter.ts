namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;
  gdjs.PixiFiltersTools.registerFilterCreator(
    'BlackAndWhite',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const colorMatrix = new PIXI.filters.ColorMatrixFilter();
        colorMatrix.blackAndWhite(false);
        return colorMatrix;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        // @ts-ignore - unsure why PIXI.filters is not recognised.
        const colorMatrix = (filter as unknown) as PIXI.filters.ColorMatrixFilter;
        if (parameterName !== 'opacity') {
          return;
        }
        colorMatrix.alpha = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
