namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Twist', {
    makePIXIFilter: function (layer, effectData) {
      const twistFilter = new PIXI.filters.TwistFilter();
      twistFilter.offset = new PIXI.Point(0, 0);
      return twistFilter;
    },
    update: function (filter, layer) {
      const twistFilter = filter as PIXI.filters.TwistFilter;
      // @ts-ignore - extra properties are stored on the filter.
      twistFilter.offset.x = Math.round(twistFilter._offsetX * layer.getWidth());
      // @ts-ignore - extra properties are stored on the filter.
      twistFilter.offset.y = Math.round(twistFilter._offsetY * layer.getHeight());
    },
    updateDoubleParameter: function (filter, parameterName, value) {
      const twistFilter = filter as PIXI.filters.TwistFilter;
      if (parameterName === 'radius') {
        twistFilter.radius = value;
      } else if (parameterName === 'angle') {
        twistFilter.angle = value;
      } else if (parameterName === 'padding') {
        twistFilter.padding = value;
      } else if (parameterName === 'offsetX') {
        // @ts-ignore - extra properties are stored on the filter.
        twistFilter._offsetX = value;
      } else if (parameterName === 'offsetY') {
        // @ts-ignore - extra properties are stored on the filter.
        twistFilter._offsetY = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
