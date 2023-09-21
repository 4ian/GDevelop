namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Sepia',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const colorMatrixFilter = new PIXI.ColorMatrixFilter();
        colorMatrixFilter.sepia(false);
        return colorMatrixFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const colorMatrixFilter = (filter as unknown) as PIXI.ColorMatrixFilter;
        if (parameterName !== 'opacity') {
          return;
        }
        colorMatrixFilter.alpha = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
