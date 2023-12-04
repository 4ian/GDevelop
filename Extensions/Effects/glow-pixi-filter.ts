namespace gdjs {
  interface GlowFilterExtra {
    distance: number;
  }
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
        const glowFilter = (filter as unknown) as PIXI.filters.GlowFilter &
          GlowFilterExtra;
        if (parameterName === 'innerStrength') {
          glowFilter.innerStrength = value;
        } else if (parameterName === 'outerStrength') {
          glowFilter.outerStrength = value;
        } else if (parameterName === 'distance') {
          glowFilter.distance = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const glowFilter = (filter as unknown) as PIXI.filters.GlowFilter &
          GlowFilterExtra;
        if (parameterName === 'innerStrength') {
          return glowFilter.innerStrength;
        }
        if (parameterName === 'outerStrength') {
          return glowFilter.outerStrength;
        }
        if (parameterName === 'distance') {
          return glowFilter.distance;
        }
        return 0;
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {
        const glowFilter = (filter as unknown) as PIXI.filters.GlowFilter &
          GlowFilterExtra;
        if (parameterName === 'color') {
          glowFilter.color = gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value);
        }
      }
      updateColorParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void {
        const glowFilter = (filter as unknown) as PIXI.filters.GlowFilter &
          GlowFilterExtra;
        if (parameterName === 'color') {
          glowFilter.color = value;
        }
      }
      getColorParameter(filter: PIXI.Filter, parameterName: string): number {
        const glowFilter = (filter as unknown) as PIXI.filters.GlowFilter &
          GlowFilterExtra;
        if (parameterName === 'color') {
          return glowFilter.color;
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
