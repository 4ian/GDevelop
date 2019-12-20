gdjs.PixiFiltersTools.registerFilterCreator('TiltShift', {
  makePIXIFilter: function() {
    var tiltShift = new PIXI.filters.TiltShiftFilter();

    return tiltShift;
  },
  updateParameter: function(filter, parameterName, value) {
    if (!['blur', 'gradientBlur'].includes(parameterName)) return;

    filter[parameterName] = gdjs.PixiFiltersTools.clampValue(value, 0, 2000);
  },
});
