gdjs.PixiFiltersTools = function() {};

gdjs.PixiFiltersTools._filters = {
    Night: {
        makeFilter: function() {
            var filter = new PIXI.filters.ColorMatrixFilter();
            filter.night();
            return filter;
        },
        updateParameter: function(filter, parameterName, value) {
            if (parameterName !== 'intensity') return;

            filter.night(value);
        },
    },
    Sepia: {
        makeFilter: function() {
            return new PIXI.filters.SepiaFilter();
        },
        updateParameter: function(filter, parameterName, value) {
            if (parameterName !== 'intensity') return;

            filter.sepia = value;
        },
    },
};

gdjs.PixiFiltersTools.getFilter = function(filterName) {
    if (gdjs.PixiFiltersTools._filters.hasOwnProperty(filterName))
        return gdjs.PixiFiltersTools._filters[filterName];

    return null;
}
