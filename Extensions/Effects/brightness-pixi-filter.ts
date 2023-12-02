namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Brightness',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const brightness = new PIXI.ColorMatrixFilter();
        brightness.brightness(1, false);
        return brightness;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const brightnessFilter = (filter as unknown) as PIXI.ColorMatrixFilter;
        if (parameterName !== 'brightness') {
          return;
        }
        const brightness = gdjs.PixiFiltersTools.clampValue(value, 0, 1);
        //@ts-ignore
        brightnessFilter.__brightness = brightness;
        brightnessFilter.brightness(brightness, false);
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const brightnessFilter = (filter as unknown) as PIXI.ColorMatrixFilter;
        if (parameterName === 'brightness') {
          //@ts-ignore
          return brightnessFilter.__brightness;
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
