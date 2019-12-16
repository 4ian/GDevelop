gdjs.PixiFiltersTools.registerFilterCreator('Noise', {
    makePIXIFilter: function() {
        var noise = new PIXI.filters.NoiseFilter();
        return noise;
    },
    updateParameter: function(filter, parameterName, value) {
        if (parameterName !== 'noise') return;

        filter.noise = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
    },
});
