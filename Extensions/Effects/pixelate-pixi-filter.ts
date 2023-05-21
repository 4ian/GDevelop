namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Pixelate',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const pixelateFilter = new PIXI.filters.PixelateFilter(
          effectData.doubleParameters.size
        );
        return pixelateFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const pixelateFilter = (filter as unknown) as PIXI.filters.PixelateFilter;
        if (parameterName === 'size') {
          pixelateFilter.size = value;
        }
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
