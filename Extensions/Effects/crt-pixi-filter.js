gdjs.PixiFiltersTools.registerFilterCreator('Crt', {
  makePIXIFilter: function() {
    var crt = new PIXI.filters.CRTFilter();

    return crt;
  },
  updateParameter: function(filter, parameterName, value) {
    if (!['curvature', 'lineWidth', 'lineContrast', 'verticalLine', 'noise', 'noiseSize', 'vignetting', 'vignettingAlpha', 'vignettingBlur', 'seed', 'time'].includes(parameterName)) return;

    if (filter !== 'verticalLine') filter[parameterName] = gdjs.PixiFiltersTools.clampValue(value, 0, 20);
    else filter.verticalLine = value === 1;
  },
});
