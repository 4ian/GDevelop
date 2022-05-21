namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('DropShadow', {
    makePIXIFilter: function (target, effectData) {
      const dropShadowFilter = new PIXI.filters.DropShadowFilter();
      return dropShadowFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const dropShadowFilter =
        filter as unknown as PIXI.filters.DropShadowFilter;
      if (parameterName === 'blur') {
        dropShadowFilter.blur = value;
      } else if (parameterName === 'quality') {
        dropShadowFilter.quality = value;
      } else if (parameterName === 'alpha') {
        dropShadowFilter.alpha = value;
      } else if (parameterName === 'distance') {
        dropShadowFilter.distance = value;
      } else if (parameterName === 'rotation') {
        dropShadowFilter.rotation = value;
      } else if (parameterName === 'padding') {
        dropShadowFilter.padding = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {
      const dropShadowFilter =
        filter as unknown as PIXI.filters.DropShadowFilter;
      if (parameterName === 'color') {
        dropShadowFilter.color =
          gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
      }
    },
    updateBooleanParameter: function (filter, parameterName, value) {
      const dropShadowFilter =
        filter as unknown as PIXI.filters.DropShadowFilter;
      if (parameterName === 'shadowOnly') {
        dropShadowFilter.shadowOnly = value;
      }
    },
  });
}
