namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'BulgePinch',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const bulgePinchFilter = new PIXI.filters.BulgePinchFilter();
        return bulgePinchFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const bulgePinchFilter = (filter as unknown) as PIXI.filters.BulgePinchFilter;
        if (parameterName === 'centerX') {
          bulgePinchFilter.center[0] = value;
        } else if (parameterName === 'centerY') {
          bulgePinchFilter.center[1] = value;
        } else if (parameterName === 'radius') {
          bulgePinchFilter.radius = value;
        } else if (parameterName === 'strength') {
          bulgePinchFilter.strength = gdjs.PixiFiltersTools.clampValue(
            value,
            -1,
            1
          );
        }
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
