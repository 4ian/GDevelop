gdjs.PixiFiltersTools.registerFilterCreator('Brightness', {
    makePIXIFilter: function() {
        var brightness = new PIXI.filters.ColorMatrixFilter();
        brightness.brightness(1);
        return brightness;
    },
    updateParameter: function(filter, parameterName, value) {
        if (parameterName !== 'brightness') return;

        filter.brightness(gdjs.PixiFiltersTools.clampValue(value, 0, 1));
    },
});
