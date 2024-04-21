namespace gdjs {
  interface TwistFilterExtra {
    // extra properties are stored on the filter.
    _offsetX: number;
    _offsetY: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Twist',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const twistFilter = new PIXI.filters.TwistFilter();
        twistFilter.offset = new PIXI.Point(0, 0);
        return twistFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        const twistFilter = (filter as unknown) as PIXI.filters.TwistFilter &
          TwistFilterExtra;
        twistFilter.offset.x = Math.round(
          twistFilter._offsetX * target.getWidth()
        );
        twistFilter.offset.y = Math.round(
          twistFilter._offsetY * target.getHeight()
        );
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const twistFilter = (filter as unknown) as PIXI.filters.TwistFilter &
          TwistFilterExtra;
        if (parameterName === 'radius') {
          twistFilter.radius = value;
        } else if (parameterName === 'angle') {
          twistFilter.angle = value;
        } else if (parameterName === 'padding') {
          twistFilter.padding = value;
        } else if (parameterName === 'offsetX') {
          twistFilter._offsetX = value;
        } else if (parameterName === 'offsetY') {
          twistFilter._offsetY = value;
        }
      }
      getDoubleParameter(filter: PIXI.Filter, parameterName: string): number {
        const twistFilter = (filter as unknown) as PIXI.filters.TwistFilter &
          TwistFilterExtra;
        if (parameterName === 'radius') {
          return twistFilter.radius;
        }
        if (parameterName === 'angle') {
          return twistFilter.angle;
        }
        if (parameterName === 'padding') {
          return twistFilter.padding;
        }
        if (parameterName === 'offsetX') {
          return twistFilter._offsetX;
        }
        if (parameterName === 'offsetY') {
          return twistFilter._offsetY;
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
