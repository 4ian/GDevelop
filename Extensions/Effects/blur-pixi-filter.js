gdjs.PixiFiltersTools.registerFilterCreator('Blur', {
    makePIXIFilter: function() {
        var blur = new PIXI.filters.BlurFilter();
        return blur;
    },
    updateParameter: function(filter, parameterName, value) {
        if (parameterName !== 'blur' &&
            parameterName !== 'quality' &&
            parameterName !== 'kernelSize' &&
            parameterName !== 'resolution') return;

        if (parameterName === 'kernelSize'){
            value = gdjs.PixiFiltersTools.clampKernelSize(value);
        }

        filter[parameterName] = value;
    },
});
