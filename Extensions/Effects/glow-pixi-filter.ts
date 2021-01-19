namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Glow', {
    makePIXIFilter: function (layer, effectData) {
      const glowFilter = new PIXI.filters.GlowFilter();
      return glowFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const glowFilter = filter as PIXI.filters.GlowFilter;
      if (parameterName === 'innerStrength') {
        glowFilter.innerStrength = value;
      } else if (parameterName === 'outerStrength') {
        glowFilter.outerStrength = value;
      } else if (parameterName === 'distance') {
        // @ts-ignore
        glowFilter.distance = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {
      const glowFilter = filter as PIXI.filters.GlowFilter;
      if (parameterName === 'color') {
        glowFilter.color = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
      }
    },
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
