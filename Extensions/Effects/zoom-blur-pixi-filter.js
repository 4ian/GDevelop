gdjs.PixiFiltersTools.registerFilterCreator('ZoomBlur', {
  makePIXIFilter: function(layer, effectData) {
    var zoomBlurFilter = new PIXI.filters.ZoomBlurFilter();
    PIXI.filters.ZoomBlurFilter.prototype.apply = function(filterManager, input, output, clear) {
      this.center[0] = Math.round(this._centerX * input.sourceFrame.width);
      this.center[1] = Math.round(this._centerY * input.sourceFrame.height);
      filterManager.applyFilter(this, input, output, clear);
    }

    return zoomBlurFilter;
  },
  update: function(filter, layer) {
  },
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'centerX') {
      filter._centerX = value;
    }
    else if (parameterName === 'centerY') {
      filter._centerY = value;
    }
    else if (parameterName === 'innerRadius') {
      filter.innerRadius = value;
    }
    else if (parameterName === 'strength') {
      filter.strength = gdjs.PixiFiltersTools.clampValue(value / 10, 0, 20);
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
  },
  updateBooleanParameter: function(filter, parameterName, value) {
  },
});
