namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Glow',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const glowFilter = new PIXI.filters.GlowFilter();
        return glowFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const glowFilter = (filter as unknown) as PIXI.filters.GlowFilter;
        if (parameterName === 'innerStrength') {
          glowFilter.innerStrength = value;
        } else if (parameterName === 'outerStrength') {
          glowFilter.outerStrength = value;
        } else if (parameterName === 'distance') {
          // @ts-ignore
          glowFilter.distance = value;
        }
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {
        const glowFilter = (filter as unknown) as PIXI.filters.GlowFilter;
        if (parameterName === 'color') {
          glowFilter.color = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
        }
      }
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
    })()
  );
}
