gdjs.PixiFiltersTools.registerFilterCreator('RadialBlur', {
  makePIXIFilter: function(layer, effectData) {
    var radialBlurFilter = new PIXI.filters.RadialBlurFilter();
    PIXI.filters.RadialBlurFilter.prototype.apply = function(filterManager, input, output, clear) {
      this.center[0] = Math.round(this._centerX * input.sourceFrame.width);
      this.center[1] = Math.round(this._centerY * input.sourceFrame.height);
      this.uniforms.uKernelSize = this._angle !== 0 ? this.kernelSize : 0;
      filterManager.applyFilter(this, input, output, clear);
    }

    return radialBlurFilter;
  },
  update: function(filter, layer) {
  },
  updateDoubleParameter: function(filter, parameterName, value) {
    if (parameterName === 'radius') {
      filter.radius = (value < 0 ? -1 : value);
    }
    else if (parameterName === 'angle') {
      filter.angle = value;
    }
    else if (parameterName === 'kernelSize') {
      filter.kernelSize = gdjs.PixiFiltersTools.clampKernelSize(value, 3, 25);
    }
    else if (parameterName === 'centerX') {
      filter._centerX = value;
    }
    else if (parameterName === 'centerY') {
      filter._centerY = value;
    }
  },
  updateStringParameter: function(filter, parameterName, value) {
  },
  updateBooleanParameter: function(filter, parameterName, value) {
  },
});
