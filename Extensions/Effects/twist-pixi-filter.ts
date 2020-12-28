namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Twist', {
    makePIXIFilter: function (layer, effectData) {
      const twistFilter = new PIXI.filters.TwistFilter();
      twistFilter.offset = new PIXI.Point(0, 0);
      return twistFilter;
    },
    update: function (filter, layer) {
      filter.offset.x = Math.round(filter._offsetX * layer.getWidth());
      filter.offset.y = Math.round(filter._offsetY * layer.getHeight());
    },
    updateDoubleParameter: function (filter, parameterName, value) {
      if (parameterName === 'radius') {
        filter.radius = value;
      } else if (parameterName === 'angle') {
        filter.angle = value;
      } else if (parameterName === 'padding') {
        filter.padding = value;
      } else if (parameterName === 'offsetX') {
        filter._offsetX = value;
      } else if (parameterName === 'offsetY') {
        filter._offsetY = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
