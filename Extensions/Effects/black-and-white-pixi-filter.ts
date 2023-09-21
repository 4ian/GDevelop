namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'BlackAndWhite',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const colorMatrix = new PIXI.ColorMatrixFilter();
        colorMatrix.blackAndWhite(false);
        return colorMatrix;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const colorMatrix = (filter as unknown) as PIXI.ColorMatrixFilter;
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
