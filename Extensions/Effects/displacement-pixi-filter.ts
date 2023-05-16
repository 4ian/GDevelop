namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;
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
        const displacementFilter = new PIXI.filters.DisplacementFilter(
          displacementSprite
        );
        return displacementFilter;
      }
      updatePreRender(filter, target) {}
      updateDoubleParameter(filter, parameterName, value) {
        // @ts-ignore - unsure why PIXI.filters is not recognised.
        const displacementFilter = (filter as unknown) as PIXI.filters.DisplacementFilter;
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
