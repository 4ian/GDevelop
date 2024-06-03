namespace gdjs {
  interface GodrayFilterExtra {
    animationSpeed: number;
    light: number;
    x: number;
    y: number;
  }
  interface GodrayFilterNetworkSyncData {
    la: number;
    a: number;
    g: number;
    li: number;
    x: number;
    y: number;
    as: number;
    p: number;
    pa: boolean;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Godray',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(layer, effectData) {
        const godrayFilter = new PIXI.filters.GodrayFilter();
        return godrayFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        const godrayFilter = (filter as unknown) as PIXI.filters.GodrayFilter &
          GodrayFilterExtra;
        if (godrayFilter.animationSpeed !== 0) {
          godrayFilter.time +=
            (target.getElapsedTime() / 1000) * godrayFilter.animationSpeed;
        }
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const godrayFilter = (filter as unknown) as PIXI.filters.GodrayFilter &
          GodrayFilterExtra;
        if (parameterName === 'lacunarity') {
          godrayFilter.lacunarity = value;
        } else if (parameterName === 'angle') {
          godrayFilter.angle = value;
        } else if (parameterName === 'gain') {
          godrayFilter.gain = value;
        } else if (parameterName === 'light') {
          godrayFilter.light = value;
        } else if (parameterName === 'x') {
          godrayFilter.x = value;
        } else if (parameterName === 'y') {
          godrayFilter.y = value;
        } else if (parameterName === 'animationSpeed') {
          godrayFilter.animationSpeed = value;
        } else if (parameterName === 'padding') {
          godrayFilter.padding = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const godrayFilter = (filter as unknown) as PIXI.filters.GodrayFilter &
          GodrayFilterExtra;
        if (parameterName === 'lacunarity') {
          return godrayFilter.lacunarity;
        }
        if (parameterName === 'angle') {
          return godrayFilter.angle;
        }
        if (parameterName === 'gain') {
          return godrayFilter.gain;
        }
        if (parameterName === 'light') {
          return godrayFilter.light;
        }
        if (parameterName === 'x') {
          return godrayFilter.x;
        }
        if (parameterName === 'y') {
          return godrayFilter.y;
        }
        if (parameterName === 'animationSpeed') {
          return godrayFilter.animationSpeed;
        }
        if (parameterName === 'padding') {
          return godrayFilter.padding;
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
        const godrayFilter = (filter as unknown) as PIXI.filters.GodrayFilter &
          GodrayFilterExtra;
        if (parameterName === 'parallel') {
          godrayFilter.parallel = value;
        }
      }
      getNetworkSyncData(filter: PIXI.Filter): GodrayFilterNetworkSyncData {
        const godrayFilter = (filter as unknown) as PIXI.filters.GodrayFilter &
          GodrayFilterExtra;
        return {
          la: godrayFilter.lacunarity,
          a: godrayFilter.angle,
          g: godrayFilter.gain,
          li: godrayFilter.light,
          x: godrayFilter.x,
          y: godrayFilter.y,
          as: godrayFilter.animationSpeed,
          p: godrayFilter.padding,
          pa: godrayFilter.parallel,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: GodrayFilterNetworkSyncData
      ) {
        const godrayFilter = (filter as unknown) as PIXI.filters.GodrayFilter &
          GodrayFilterExtra;
        godrayFilter.lacunarity = data.la;
        godrayFilter.angle = data.a;
        godrayFilter.gain = data.g;
        godrayFilter.light = data.li;
        godrayFilter.x = data.x;
        godrayFilter.y = data.y;
        godrayFilter.animationSpeed = data.as;
        godrayFilter.padding = data.p;
        godrayFilter.parallel = data.pa;
      }
    })()
  );
}
