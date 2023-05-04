namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;
  gdjs.PixiFiltersTools.registerFilterCreator(
    'BlendingMode',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const blendingModeFilter = new PIXI.filters.AlphaFilter();
        return blendingModeFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        // @ts-ignore - unsure why PIXI.filters is not recognised.
        const blendingModeFilter = (filter as unknown) as PIXI.filters.AlphaFilter;
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
