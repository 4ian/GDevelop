namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator('Displacement', {
    makePIXIFilter: function (target, effectData) {
      const displacementMapTexture = target
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
    updatePreRender: function (filter, target) {},
    updateDoubleParameter: function (filter, parameterName, value) {
      // @ts-ignore - unsure why PIXI.filters is not recognised.
      const displacementFilter = (filter as unknown) as PIXI.filters.DisplacementFilter;
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
