namespace gdjs {
  interface BevelFilterExtra {
    /** It's defined for the configuration but not for the filter. */
    distance: number;
  }
  interface BevelFilterNetworkSyncData {
    r: number;
    t: number;
    d: number;
    la: number;
    sa: number;
    lc: number;
    sc: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Bevel',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const bevelFilter = new PIXI.filters.BevelFilter();
        return bevelFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const bevelFilter = (filter as unknown) as PIXI.filters.BevelFilter &
          BevelFilterExtra;
        if (parameterName === 'rotation') {
          bevelFilter.rotation = value;
        } else if (parameterName === 'thickness') {
          bevelFilter.thickness = value;
        } else if (parameterName === 'distance') {
          bevelFilter.distance = value;
        } else if (parameterName === 'lightAlpha') {
          bevelFilter.lightAlpha = value;
        } else if (parameterName === 'shadowAlpha') {
          bevelFilter.shadowAlpha = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const bevelFilter = (filter as unknown) as PIXI.filters.BevelFilter &
          BevelFilterExtra;
        if (parameterName === 'rotation') {
          return bevelFilter.rotation;
        }
        if (parameterName === 'thickness') {
          return bevelFilter.thickness;
        }
        if (parameterName === 'distance') {
          return bevelFilter.distance;
        }
        if (parameterName === 'lightAlpha') {
          return bevelFilter.lightAlpha;
        }
        if (parameterName === 'shadowAlpha') {
          return bevelFilter.shadowAlpha;
        }
        return 0;
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {
        const bevelFilter = (filter as unknown) as PIXI.filters.BevelFilter &
          BevelFilterExtra;
        if (parameterName === 'lightColor') {
          bevelFilter.lightColor = gdjs.rgbOrHexStringToNumber(value);
        }
        if (parameterName === 'shadowColor') {
          bevelFilter.shadowColor = gdjs.rgbOrHexStringToNumber(value);
        }
      }
      updateColorParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void {
        const bevelFilter = (filter as unknown) as PIXI.filters.BevelFilter &
          BevelFilterExtra;
        if (parameterName === 'lightColor') {
          bevelFilter.lightColor = value;
        }
        if (parameterName === 'shadowColor') {
          bevelFilter.shadowColor = value;
        }
      }
      getColorParameter(filter: PIXI.Filter, parameterName: string): number {
        const bevelFilter = (filter as unknown) as PIXI.filters.BevelFilter;
        if (parameterName === 'lightColor') {
          return bevelFilter.lightColor;
        }
        if (parameterName === 'shadowColor') {
          return bevelFilter.shadowColor;
        }
        return 0;
      }
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
      getNetworkSyncData(filter: PIXI.Filter): BevelFilterNetworkSyncData {
        const bevelFilter = (filter as unknown) as PIXI.filters.BevelFilter &
          BevelFilterExtra;
        return {
          r: bevelFilter.rotation,
          t: bevelFilter.thickness,
          d: bevelFilter.distance,
          la: bevelFilter.lightAlpha,
          sa: bevelFilter.shadowAlpha,
          lc: bevelFilter.lightColor,
          sc: bevelFilter.shadowColor,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: BevelFilterNetworkSyncData
      ) {
        const bevelFilter = (filter as unknown) as PIXI.filters.BevelFilter &
          BevelFilterExtra;
        bevelFilter.rotation = data.r;
        bevelFilter.thickness = data.t;
        bevelFilter.distance = data.d;
        bevelFilter.lightAlpha = data.la;
        bevelFilter.shadowAlpha = data.sa;
        bevelFilter.lightColor = data.lc;
        bevelFilter.shadowColor = data.sc;
      }
    })()
  );
}
