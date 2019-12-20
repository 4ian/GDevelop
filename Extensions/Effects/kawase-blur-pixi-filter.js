gdjs.PixiFiltersTools.registerFilterCreator('KawaseBlur', {
  makePIXIFilter: function() {
    var kawaseBlur = new PIXI.filters.KawaseBlurFilter();

    return kawaseBlur;
  },
  updateParameter: function(filter, parameterName, value) {
    if (!['pixelSizeX', 'pixelSizeY', 'blur', 'quality'].includes(parameterName)) return;

    if (parameterName === 'pixelSizeX') filter.pixelSize.x = gdjs.PixiFiltersTools.clampValue(value, 0, 20);
    else if (parameterName === 'pixelSizeY') filter.pixelSize.y = gdjs.PixiFiltersTools.clampValue(value, 0, 20);
    else filter[parameterName] = gdjs.PixiFiltersTools.clampValue(value, 0, 20);
  },
});
