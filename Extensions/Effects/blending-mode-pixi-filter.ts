namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('BlendingMode', {
    makePIXIFilter: function (target, effectData) {
      const blendingModeFilter = new PIXI.filters.AlphaFilter();
      return blendingModeFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      // @ts-ignore - unsure why PIXI.filters is not recognised.
      const blendingModeFilter = (filter as unknown) as PIXI.filters.AlphaFilter;
      if (parameterName === 'alpha') {
        blendingModeFilter.alpha = value;
      } else if (parameterName === 'blendmode') {
        blendingModeFilter.blendMode = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
