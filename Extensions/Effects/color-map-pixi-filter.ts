namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'ColorMap',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const colorMapTexture = target
          .getRuntimeScene()
          .getGame()
          .getImageManager()
          .getPIXITexture(effectData.stringParameters.colorMapTexture);
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
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const colorMapFilter = (filter as unknown) as PIXI.filters.ColorMapFilter;
        if (parameterName === 'mix') {
          colorMapFilter.mix = gdjs.PixiFiltersTools.clampValue(
            value / 100,
            0,
            1
          );
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const colorMapFilter = (filter as unknown) as PIXI.filters.ColorMapFilter;
        if (parameterName === 'mix') {
          return colorMapFilter.mix;
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
      ) {
        const colorMapFilter = (filter as unknown) as PIXI.filters.ColorMapFilter;
        if (parameterName === 'nearest') {
          colorMapFilter.nearest = value;
        }
      }
    })()
  );
}
