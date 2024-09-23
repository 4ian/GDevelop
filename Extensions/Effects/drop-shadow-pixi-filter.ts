namespace gdjs {
  interface DropShadowFilterNetworkSyncData {
    b: number;
    q: number;
    a: number;
    d: number;
    r: number;
    p: number;
    c: number;
    so: boolean;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'DropShadow',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const dropShadowFilter = new PIXI.filters.DropShadowFilter();
        return dropShadowFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const dropShadowFilter = (filter as unknown) as PIXI.filters.DropShadowFilter;
        if (parameterName === 'blur') {
          dropShadowFilter.blur = value;
        } else if (parameterName === 'quality') {
          dropShadowFilter.quality = value;
        } else if (parameterName === 'alpha') {
          dropShadowFilter.alpha = value;
        } else if (parameterName === 'distance') {
          dropShadowFilter.distance = value;
        } else if (parameterName === 'rotation') {
          dropShadowFilter.rotation = value;
        } else if (parameterName === 'padding') {
          dropShadowFilter.padding = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const dropShadowFilter = (filter as unknown) as PIXI.filters.DropShadowFilter;
        if (parameterName === 'blur') {
          return dropShadowFilter.blur;
        }
        if (parameterName === 'quality') {
          return dropShadowFilter.quality;
        }
        if (parameterName === 'alpha') {
          return dropShadowFilter.alpha;
        }
        if (parameterName === 'distance') {
          return dropShadowFilter.distance;
        }
        if (parameterName === 'rotation') {
          return dropShadowFilter.rotation;
        }
        if (parameterName === 'padding') {
          return dropShadowFilter.padding;
        }
        return 0;
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {
        const dropShadowFilter = (filter as unknown) as PIXI.filters.DropShadowFilter;
        if (parameterName === 'color') {
          dropShadowFilter.color = gdjs.rgbOrHexStringToNumber(value);
        }
      }
      updateColorParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ): void {
        const dropShadowFilter = (filter as unknown) as PIXI.filters.DropShadowFilter;
        if (parameterName === 'color') {
          dropShadowFilter.color = value;
        }
      }
      getColorParameter(filter: PIXI.Filter, parameterName: string): number {
        const dropShadowFilter = (filter as unknown) as PIXI.filters.DropShadowFilter;
        if (parameterName === 'color') {
          return dropShadowFilter.color;
        }
        return 0;
      }
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {
        const dropShadowFilter = (filter as unknown) as PIXI.filters.DropShadowFilter;
        if (parameterName === 'shadowOnly') {
          dropShadowFilter.shadowOnly = value;
        }
      }
      getNetworkSyncData(filter: PIXI.Filter): DropShadowFilterNetworkSyncData {
        const dropShadowFilter = (filter as unknown) as PIXI.filters.DropShadowFilter;
        return {
          b: dropShadowFilter.blur,
          q: dropShadowFilter.quality,
          a: dropShadowFilter.alpha,
          d: dropShadowFilter.distance,
          r: dropShadowFilter.rotation,
          p: dropShadowFilter.padding,
          c: dropShadowFilter.color,
          so: dropShadowFilter.shadowOnly,
        };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: DropShadowFilterNetworkSyncData
      ) {
        const dropShadowFilter = (filter as unknown) as PIXI.filters.DropShadowFilter;
        dropShadowFilter.blur = data.b;
        dropShadowFilter.quality = data.q;
        dropShadowFilter.alpha = data.a;
        dropShadowFilter.distance = data.d;
        dropShadowFilter.rotation = data.r;
        dropShadowFilter.padding = data.p;
        dropShadowFilter.color = data.c;
        dropShadowFilter.shadowOnly = data.so;
      }
    })()
  );
}
