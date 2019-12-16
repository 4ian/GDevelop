gdjs.PixiFiltersTools.registerFilterCreator('Sepia', {
    makePIXIFilter: function() {
        var colorMatrix = new PIXI.filters.ColorMatrixFilter();
        colorMatrix.sepia();
        return colorMatrix;
    },
    updateParameter: function(filter, parameterName, value) {
        if (parameterName !== 'opacity') return;

        filter.alpha = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
    },
});
