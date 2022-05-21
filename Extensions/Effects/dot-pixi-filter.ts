namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Dot', {
    makePIXIFilter: function (target, effectData) {
      const dotFilter = new PIXI.filters.DotFilter();
      return dotFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const dotFilter = filter as unknown as PIXI.filters.DotFilter;
      if (parameterName === 'scale') {
        dotFilter.scale = value;
      } else if (parameterName === 'angle') {
        dotFilter.angle = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
