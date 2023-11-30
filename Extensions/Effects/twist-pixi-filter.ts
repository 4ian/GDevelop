namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Twist',
    new (class extends gdjs.PixiFiltersTools.PixiFilterCreator {
      makePIXIFilter(target: EffectsTarget, effectData) {
        const twistFilter = new PIXI.filters.TwistFilter();
        twistFilter.offset = new PIXI.Point(0, 0);
        return twistFilter;
      }
      updatePreRender(filter: PIXI.Filter, target: EffectsTarget) {
        const twistFilter = (filter as unknown) as PIXI.filters.TwistFilter;
        twistFilter.offset.x = Math.round(
          // @ts-ignore - extra properties are stored on the filter.
          twistFilter._offsetX * target.getWidth()
        );
        twistFilter.offset.y = Math.round(
          // @ts-ignore - extra properties are stored on the filter.
          twistFilter._offsetY * target.getHeight()
        );
      }
      updateDoubleParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: number
      ) {
        const twistFilter = (filter as unknown) as PIXI.filters.TwistFilter;
        if (parameterName === 'radius') {
          twistFilter.radius = value;
        } else if (parameterName === 'angle') {
          twistFilter.angle = value;
        } else if (parameterName === 'padding') {
          twistFilter.padding = value;
        } else if (parameterName === 'offsetX') {
          // @ts-ignore - extra properties are stored on the filter.
          twistFilter._offsetX = value;
        } else if (parameterName === 'offsetY') {
          // @ts-ignore - extra properties are stored on the filter.
          twistFilter._offsetY = value;
        }
      }
      updateStringParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: string
      ) {}
      updateBooleanParameter(
        filter: PIXI.Filter,
        parameterName: string,
        value: boolean
      ) {}
    })()
  );
}
