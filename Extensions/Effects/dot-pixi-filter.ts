namespace gdjs {
  interface DotFilterNetworkSyncData {
    s: number;
    a: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Dot',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const dotFilter = new PIXI.filters.DotFilter();
        return dotFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {}
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const dotFilter = (filter as unknown) as PIXI.filters.DotFilter;
        if (parameterName === 'scale') {
          dotFilter.scale = value;
        } else if (parameterName === 'angle') {
          dotFilter.angle = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const dotFilter = (filter as unknown) as PIXI.filters.DotFilter;
        if (parameterName === 'scale') {
          return dotFilter.scale;
        }
        if (parameterName === 'angle') {
          return dotFilter.angle;
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
      getNetworkSyncData(filter: PIXI.Filter): DotFilterNetworkSyncData {
        const dotFilter = (filter as unknown) as PIXI.filters.DotFilter;
        return { s: dotFilter.scale, a: dotFilter.angle };
      }
      updateFromNetworkSyncData(
        filter: PIXI.Filter,
        data: DotFilterNetworkSyncData
      ) {
        const dotFilter = (filter as unknown) as PIXI.filters.DotFilter;
        dotFilter.scale = data.s;
        dotFilter.angle = data.a;
      }
    })()
  );
}
