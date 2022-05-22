namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Bevel', {
    makePIXIFilter: function (target, effectData) {
      const bevelFilter = new PIXI.filters.BevelFilter();
      return bevelFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const bevelFilter = filter as unknown as PIXI.filters.BevelFilter;
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
      const bevelFilter = filter as unknown as PIXI.filters.BevelFilter;
      if (parameterName === 'lightColor') {
        bevelFilter.lightColor =
          gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
      }
      if (parameterName === 'shadowColor') {
        bevelFilter.shadowColor =
          gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
      }
    },
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
