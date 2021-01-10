namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('ColorMap', {
    makePIXIFilter: function (layer, effectData) {
      const colorMapTexture = layer
        .getRuntimeScene()
        .getGame()
        .getImageManager()
        .getPIXITexture(effectData.stringParameters.colorMapTexture);
      const colorMapSprite = new PIXI.Sprite(colorMapTexture);
      const colorMapFilter = new PIXI.filters.ColorMapFilter(
        colorMapTexture,
        effectData.booleanParameters.nearest,
        gdjs.PixiFiltersTools.clampValue(
          effectData.doubleParameters.mix / 100,
          0,
          1
        )
      );
      return colorMapFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const colorMapFilter = filter as PIXI.filters.ColorMapFilter;
      if (parameterName === 'mix') {
        colorMapFilter.mix = gdjs.PixiFiltersTools.clampValue(value / 100, 0, 1);
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {
      const colorMapFilter = filter as PIXI.filters.ColorMapFilter;
      if (parameterName === 'nearest') {
        colorMapFilter.nearest = value;
      }
    },
  });
}
