namespace gdjs {
  export namespace evtTools {
    export namespace timeline {
      export type TimelinePoint = { x: number; y: number };

      export type PathSegment = {
        fromKeyframeId: string;
        toKeyframeId: string;
        mode: 'line' | 'cubicBezier';
        cp1?: TimelinePoint;
        cp2?: TimelinePoint;
      };

      export const cubicBezier = (
        p0: number,
        p1: number,
        p2: number,
        p3: number,
        t: number
      ): number => {
        const u = 1 - t;
        return (
          u * u * u * p0 +
          3 * u * u * t * p1 +
          3 * u * t * t * p2 +
          t * t * t * p3
        );
      };

      export const evaluatePathSegment = (
        from: TimelinePoint,
        to: TimelinePoint,
        pathSegment: PathSegment | null | undefined,
        t: number
      ): TimelinePoint => {
        if (!pathSegment || pathSegment.mode !== 'cubicBezier') {
          return {
            x: gdjs.evtTools.timeline.lerp(from.x, to.x, t),
            y: gdjs.evtTools.timeline.lerp(from.y, to.y, t),
          };
        }

        const cp1 = pathSegment.cp1 || from;
        const cp2 = pathSegment.cp2 || to;
        return {
          x: cubicBezier(from.x, cp1.x, cp2.x, to.x, t),
          y: cubicBezier(from.y, cp1.y, cp2.y, to.y, t),
        };
      };
    }
  }
}
