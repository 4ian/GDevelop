namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('RGBSplit', {
    makePIXIFilter: function (target, effectData) {
      const rgbSplitFilter = new PIXI.filters.RGBSplitFilter();
      return rgbSplitFilter;
    },
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const rgbSplitFilter = (filter as unknown) as PIXI.filters.RGBSplitFilter;
      if (parameterName === 'redX') {
        rgbSplitFilter.red.x = value;
      } else if (parameterName === 'redY') {
        rgbSplitFilter.red.y = value;
      } else if (parameterName === 'greenX') {
        rgbSplitFilter.green.x = value;
      } else if (parameterName === 'greenY') {
        rgbSplitFilter.green.y = value;
      } else if (parameterName === 'blueX') {
        rgbSplitFilter.blue.x = value;
      } else if (parameterName === 'blueY') {
        rgbSplitFilter.blue.y = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
