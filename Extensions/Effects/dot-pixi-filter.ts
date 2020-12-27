gd;
namespace gdjs {
  js.PixiFiltersTools.registerFilterCreator('Dot', {
    makePIXIFilter: function (layer, effectData) {
      const dotFilter = new PIXI.filters.DotFilter();
      return dotFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'scale') {
        filter.scale = value;
      } else {
        if (parameterName === 'angle') {
          filter.angle = value;
        }
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
