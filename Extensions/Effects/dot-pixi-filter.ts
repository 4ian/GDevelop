namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Dot', {
    makePIXIFilter: function (layer, effectData) {
      const dotFilter = new PIXI.filters.DotFilter();
      return dotFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const dotFilter = filter as PIXI.filters.DotFilter;
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
