namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Displacement',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target, effectData) {
        const displacementMapTexture = target
          .getRuntimeScene()
          .getGame()
          .getImageManager()
          .getPIXITexture(effectData.stringParameters.displacementMapTexture);
        displacementMapTexture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        const displacementSprite = new PIXI.Sprite(displacementMapTexture);
        const displacementFilter = new PIXI.DisplacementFilter(
          displacementSprite
        );
        return displacementFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        const displacementFilter = (filter as unknown) as PIXI.DisplacementFilter;
        if (parameterName === 'scaleX') {
          displacementFilter.scale.x = value;
        }
        if (parameterName === 'scaleY') {
          displacementFilter.scale.y = value;
        }
      }
      updateStringParameter(filter, parameterName, value) {}
      updateBooleanParameter(filter, parameterName, value) {}
    })()
  );
}
