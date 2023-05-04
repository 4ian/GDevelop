namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Dot',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const dotFilter = new PIXI.filters.DotFilter();
        return dotFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const dotFilter = (filter as unknown) as PIXI.filters.DotFilter;
        if (parameterName === 'scale') {
          dotFilter.scale = value;
        } else if (parameterName === 'angle') {
          dotFilter.angle = value;
        }
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
