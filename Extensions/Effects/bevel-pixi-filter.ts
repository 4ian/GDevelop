namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Bevel', {
    makePIXIFilter: function (layer, effectData) {
      const bevelFilter = new PIXI.filters.BevelFilter();
      return bevelFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const bevelFilter = filter as PIXI.filters.BevelFilter;
      if (parameterName === 'rotation') {
        bevelFilter.rotation = value;
      } else if (parameterName === 'thickness') {
        bevelFilter.thickness = value;
      } else if (parameterName === 'distance') {
        // @ts-ignore
        bevelFilter.distance = value;
      } else if (parameterName === 'lightAlpha') {
        bevelFilter.lightAlpha = value;
      } else if (parameterName === 'shadowAlpha') {
        bevelFilter.shadowAlpha = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {
      const bevelFilter = filter as PIXI.filters.BevelFilter;
      if (parameterName === 'lightColor') {
        bevelFilter.lightColor = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
      }
      if (parameterName === 'shadowColor') {
        bevelFilter.shadowColor = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
      }
    },
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
