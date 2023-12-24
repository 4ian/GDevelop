namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Displacement',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
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
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const displacementFilter = (filter as unknown) as PIXI.DisplacementFilter;
        if (parameterName === 'scaleX') {
          displacementFilter.scale.x = value;
        }
        if (parameterName === 'scaleY') {
          displacementFilter.scale.y = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const displacementFilter = (filter as unknown) as PIXI.DisplacementFilter;
        if (parameterName === 'scaleX') {
          return displacementFilter.scale.x;
        }
        if (parameterName === 'scaleY') {
          return displacementFilter.scale.y;
        }
        return 0;
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {}
      updateColorParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void {}
      getColorParameter(filter: PIXI.Filter, parameterName: string): number {
        return 0;
      }
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
    })()
  );
}
