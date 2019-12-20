gdjs.PixiFiltersTools.registerFilterCreator('Godray', {
  makePIXIFilter: function() {
    var center = new PIXI.Point(0, 0);
    var godray = new PIXI.filters.GodrayFilter({center});

    return godray;
  },
  updateParameter: function(filter, parameterName, value) {
    if (!['light', 'time', 'gain', 'lacunarity', 'parallel', 'angle', 'x', 'y'].includes(parameterName)) return;

    if (['x', 'y'].includes(parameterName)) filter.center[parameterName] = gdjs.PixiFiltersTools.clampValue(value, -1000, 1000);
    else if (filter !== 'parallel') filter[parameterName] = gdjs.PixiFiltersTools.clampValue(value, 0, 20);
    else filter.verticalLine = value === 1;
  },
});
