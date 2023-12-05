namespace gdjs {
  interface ColorReplaceFilterExtra {
    /** It's only set to a number. */
    originalColor: number;
    /** It's only set to a number. */
    newColor: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'ColorReplace',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const colorReplaceFilter = new PIXI.filters.ColorReplaceFilter();
        return colorReplaceFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const colorReplaceFilter = (filter as unknown) as PIXI.filters.ColorReplaceFilter &
          ColorReplaceFilterExtra;
        if (parameterName === 'epsilon') {
          colorReplaceFilter.epsilon = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const colorReplaceFilter = (filter as unknown) as PIXI.filters.ColorReplaceFilter &
          ColorReplaceFilterExtra;
        if (parameterName === 'epsilon') {
          return colorReplaceFilter.epsilon;
        }
        return 0;
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {
        const colorReplaceFilter = (filter as unknown) as PIXI.filters.ColorReplaceFilter &
          ColorReplaceFilterExtra;
        if (parameterName === 'originalColor') {
          colorReplaceFilter.originalColor = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(
            value
          );
        } else if (parameterName === 'newColor') {
          colorReplaceFilter.newColor = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(
            value
          );
        }
      }
      updateColorParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void {
        const colorReplaceFilter = (filter as unknown) as PIXI.filters.ColorReplaceFilter &
          ColorReplaceFilterExtra;
        if (parameterName === 'originalColor') {
          colorReplaceFilter.originalColor = value;
        } else if (parameterName === 'newColor') {
          colorReplaceFilter.newColor = value;
        }
      }
      getColorParameter(filter: PIXI.Filter, parameterName: string): number {
        const colorReplaceFilter = (filter as unknown) as PIXI.filters.ColorReplaceFilter &
          ColorReplaceFilterExtra;
        if (parameterName === 'originalColor') {
          return colorReplaceFilter.originalColor;
        } else if (parameterName === 'newColor') {
          return colorReplaceFilter.newColor;
        }
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
