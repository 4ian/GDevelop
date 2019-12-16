gdjs.PixiFiltersTools.registerFilterCreator('BlackAndWhite', {
    makePIXIFilter: function() {
        var colorMatrix = new PIXI.filters.ColorMatrixFilter();
        colorMatrix.blackAndWhite();
        return colorMatrix;
    },
    updateParameter: function(filter, parameterName, value) {
        if (parameterName !== 'opacity') return;

        filter.alpha = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
    },
});
