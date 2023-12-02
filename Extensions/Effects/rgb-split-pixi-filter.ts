namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'RGBSplit',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const rgbSplitFilter = new PIXI.filters.RGBSplitFilter();
        return rgbSplitFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
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
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const rgbSplitFilter = (filter as unknown) as PIXI.filters.RGBSplitFilter;
        if (parameterName === 'redX') {
          return rgbSplitFilter.red.x;
        }
        if (parameterName === 'redY') {
          return rgbSplitFilter.red.y;
        }
        if (parameterName === 'greenX') {
          return rgbSplitFilter.green.x;
        }
        if (parameterName === 'greenY') {
          return rgbSplitFilter.green.y;
        }
        if (parameterName === 'blueX') {
          return rgbSplitFilter.blue.x;
        }
        if (parameterName === 'blueY') {
          return rgbSplitFilter.blue.y;
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
