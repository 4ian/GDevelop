gdjs.PixiFiltersTools.registerFilterCreator('Twist', {
  makePIXIFilter: function(layer, effectData) {
    var twistFilter = new PIXI.filters.TwistFilter();
    PIXI.filters.TwistFilter.prototype.apply = function(filterManager, input, output, clear) {
      this.offset[0] = Math.round(this._offsetX * input.sourceFrame.width);
      this.offset[1] = Math.round(this._offsetY * input.sourceFrame.height);
      filterManager.applyFilter(this, input, output, clear);
    }

    return twistFilter;
  },
  update: function(filter, layer) { },
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'radius') {
      filter.radius = value;
    }
    else if (parameterName === 'angle') {
      filter.angle = value;
    }
    else if (parameterName === 'padding') {
      filter.padding = value;
    }
    else if (parameterName === 'offsetX') {
      filter._offsetX = value;
    }
    else if (parameterName === 'offsetY') {
      filter._offsetY = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
  },
  updateBooleanParameter: function(filter, parameterName, value) {
  },
});
