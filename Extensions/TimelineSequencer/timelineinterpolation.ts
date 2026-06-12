namespace gdjs {
  export namespace evtTools {
    export namespace timeline {
      export type TimelineValue =
        | number
        | string
        | boolean
        | { x?: number; y?: number; [key: string]: any }
        | Array<number>;

      export const lerp = (from: number, to: number, t: number): number =>
        from + (to - from) * t;

      export const lerpAngleDeg = (
        from: number,
        to: number,
        t: number
      ): number => {
        const delta = ((to - from + 540) % 360) - 180;
        return from + delta * t;
      };

      const interpolateArray = (
        from: Array<number>,
        to: Array<number>,
        t: number
      ): Array<number> => {
        const length = Math.min(from.length, to.length);
        const value = new Array<number>(length);
        for (let i = 0; i < length; i++) {
          value[i] = lerp(from[i], to[i], t);
        }
        return value;
      };

      const interpolateObject = (
        from: { [key: string]: any },
        to: { [key: string]: any },
        t: number,
        propertyName: string
      ): { [key: string]: any } => {
        const value = { ...from };
        for (const key in to) {
          if (typeof from[key] === 'number' && typeof to[key] === 'number') {
            value[key] =
              propertyName.toLowerCase().indexOf('angle') !== -1
                ? lerpAngleDeg(from[key], to[key], t)
                : lerp(from[key], to[key], t);
          } else {
            value[key] = t < 1 ? from[key] : to[key];
          }
        }
        return value;
      };

      export const interpolateValue = (
        from: TimelineValue,
        to: TimelineValue,
        t: number,
        propertyName: string
      ): TimelineValue => {
        if (typeof from === 'number' && typeof to === 'number') {
          return propertyName.toLowerCase().indexOf('angle') !== -1
            ? lerpAngleDeg(from, to, t)
            : lerp(from, to, t);
        }

        if (Array.isArray(from) && Array.isArray(to)) {
          return interpolateArray(from, to, t);
        }

        if (
          from &&
          to &&
          typeof from === 'object' &&
          typeof to === 'object' &&
          !Array.isArray(from) &&
          !Array.isArray(to)
        ) {
          return interpolateObject(from, to, t, propertyName);
        }

        return t < 1 ? from : to;
      };

      export const valueAsNumber = (
        value: TimelineValue,
        fallback: number = 0
      ): number =>
        typeof value === 'number'
          ? value
          : typeof value === 'string'
            ? parseFloat(value) || fallback
            : fallback;
    }
  }
}
