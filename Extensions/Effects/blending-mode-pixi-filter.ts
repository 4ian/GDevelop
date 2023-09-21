namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'BlendingMode',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const blendingModeFilter = new PIXI.AlphaFilter();
        return blendingModeFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const blendingModeFilter = (filter as unknown) as PIXI.AlphaFilter;
        if (parameterName === 'alpha') {
          blendingModeFilter.alpha = value;
        } else if (parameterName === 'blendmode') {
          blendingModeFilter.blendMode = value;
        }
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
