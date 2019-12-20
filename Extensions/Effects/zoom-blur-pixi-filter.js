gdjs.PixiFiltersTools.registerFilterCreator('ZoomBlur', {
  makePIXIFilter: function() {
    var zoomBlur = new PIXI.filters.ZoomBlurFilter();

    return zoomBlur;
  },
  updateParameter: function(filter, parameterName, value) {
    if (!['centerX', 'centerY', 'strength', 'innerRadius'].includes(parameterName)) return;

    if (parameterName === 'centerX') filter.center[0]= Math.round(window.innerWidth * value);
    else if (parameterName === 'centerY') filter.center[1] = Math.round(window.innerHeight * value);
    else if (parameterName === 'innerRadius') filter.innerRadius = Math.round(window.innerWidth * value);
    else filter[parameterName] = gdjs.PixiFiltersTools.clampValue(value / 10, 0, 20);
  },
});
