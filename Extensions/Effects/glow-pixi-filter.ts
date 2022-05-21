namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Glow', {
    makePIXIFilter: function (target, effectData) {
      const glowFilter = new PIXI.filters.GlowFilter();
      return glowFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const glowFilter = filter as unknown as PIXI.filters.GlowFilter;
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
      const glowFilter = filter as unknown as PIXI.filters.GlowFilter;
      if (parameterName === 'color') {
        glowFilter.color = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
      }
    },
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
