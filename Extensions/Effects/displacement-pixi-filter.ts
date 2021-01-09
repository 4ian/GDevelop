namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Displacement', {
    makePIXIFilter: function (layer, effectData) {
      const displacementMapTexture = layer
        .getRuntimeScene()
        .getGame()
        .getImageManager()
        .getPIXITexture(effectData.stringParameters.displacementMapTexture);
      displacementMapTexture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
      const displacementSprite = new PIXI.Sprite(displacementMapTexture);
      const displacementFilter = new PIXI.filters.DisplacementFilter(
        displacementSprite
      );
      return displacementFilter;
    },
    update: function (filter, layer) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      const displacementFilter = filter as PIXI.filters.DisplacementFilter;
      if (parameterName === 'scaleX') {
        displacementFilter.scale.x = value;
      }
      if (parameterName === 'scaleY') {
        displacementFilter.scale.y = value;
      }
    },
    updateStringParameter: function (filter, parameterName, value) {},
    updateBooleanParameter: function (filter, parameterName, value) {},
  });
}
