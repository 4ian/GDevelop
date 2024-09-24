namespace gdjs {
  interface GlowFilterExtra {
    distance: number;
  }
  interface GlowFilterNetworkSyncData {
    is: number;
    os: number;
    d: number;
    c: number;
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
          glowFilter.color = gdjs.rgbOrHexStringToNumber(value);
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
      getNetworkSyncData(filter: PIXI.Filter): GlowFilterNetworkSyncData {
        const glowFilter = (filter as unknown) as PIXI.filters.GlowFilter &
          GlowFilterExtra;
        return {
          is: glowFilter.innerStrength,
          os: glowFilter.outerStrength,
          d: glowFilter.distance,
          c: glowFilter.color,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: GlowFilterNetworkSyncData
      ): void {
        const glowFilter = (filter as unknown) as PIXI.filters.GlowFilter &
          GlowFilterExtra;
        glowFilter.innerStrength = data.is;
        glowFilter.outerStrength = data.os;
        glowFilter.distance = data.d;
        glowFilter.color = data.c;
      }
    })()
  );
}
