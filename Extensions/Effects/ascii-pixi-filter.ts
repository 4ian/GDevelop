namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Ascii',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const asciiFilter = new PIXI.filters.AsciiFilter();
        return asciiFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const asciiFilter = (filter as unknown) as PIXI.filters.AsciiFilter;
        if (parameterName === 'size') {
          asciiFilter.size = value;
        }
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
