namespace gdjs {
  export namespace evtTools {
    export namespace timeline {
      export type EaseDefinition =
        | string
        | [number, number, number, number]
        | {
            type: 'preset';
            name: string;
          }
        | {
            type: 'cubicBezier';
            x1: number;
            y1: number;
            x2: number;
            y2: number;
          }
        | {
            type: 'steps';
            steps: number;
            position: 'start' | 'end';
          };

      const clamp01 = (value: number): number =>
        Math.max(0, Math.min(1, value));

      const finiteOr = (value: number, fallback: number): number =>
        typeof value === 'number' && isFinite(value) ? value : fallback;

      const fallbackPresetEasingFunctions: Record<
        string,
        (t: number) => number
      > = {
        linear: (t) => t,
        easeInQuad: (t) => t * t,
        easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
        easeInOutQuad: (t) =>
          t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
        easeInCubic: (t) => t * t * t,
        easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
        easeInOutCubic: (t) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      };

      const cubicBezierCoordinate = (
        p1: number,
        p2: number,
        t: number
      ): number => {
        const u = 1 - t;
        return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
      };

      const cubicBezierDerivative = (
        p1: number,
        p2: number,
        t: number
      ): number => {
        const u = 1 - t;
        return 3 * u * u * p1 + 6 * u * t * (p2 - p1) + 3 * t * t * (1 - p2);
      };

      const solveCubicBezierT = (x1: number, x2: number, x: number): number => {
        let t = x;
        for (let i = 0; i < 8; i++) {
          const currentX = cubicBezierCoordinate(x1, x2, t) - x;
          const derivative = cubicBezierDerivative(x1, x2, t);
          if (Math.abs(currentX) < 1e-6) {
            return t;
          }
          if (Math.abs(derivative) < 1e-6) {
            break;
          }
          t -= currentX / derivative;
        }

        let min = 0;
        let max = 1;
        t = x;
        for (let i = 0; i < 10; i++) {
          const currentX = cubicBezierCoordinate(x1, x2, t);
          if (Math.abs(currentX - x) < 1e-6) {
            return t;
          }
          if (currentX < x) {
            min = t;
          } else {
            max = t;
          }
          t = (min + max) / 2;
        }
        return t;
      };

      export const evaluateEase = (
        ease: EaseDefinition | null | undefined,
        progress: number
      ): number => {
        const clampedProgress = clamp01(progress);
        if (!ease) {
          return clampedProgress;
        }

        if (typeof ease === 'string') {
          if (ease === 'hold' || ease === 'step' || ease === 'stepped') {
            return 0;
          }

          const tween = (gdjs.evtTools as any).tween;
          const preset =
            tween && tween.easingFunctions && tween.easingFunctions[ease]
              ? tween.easingFunctions[ease]
              : fallbackPresetEasingFunctions[ease];
          return preset ? preset(clampedProgress) : clampedProgress;
        }

        if (Array.isArray(ease)) {
          const t = solveCubicBezierT(
            clamp01(finiteOr(ease[0], 0)),
            clamp01(finiteOr(ease[2], 1)),
            clampedProgress
          );
          return clamp01(
            cubicBezierCoordinate(finiteOr(ease[1], 0), finiteOr(ease[3], 1), t)
          );
        }

        if (ease.type === 'preset') {
          return evaluateEase(ease.name, clampedProgress);
        }

        if (ease.type === 'steps') {
          const steps = Math.max(1, Math.floor(ease.steps || 1));
          return ease.position === 'start'
            ? Math.min(1, Math.ceil(clampedProgress * steps) / steps)
            : Math.floor(clampedProgress * steps) / steps;
        }

        if (ease.type === 'cubicBezier') {
          const t = solveCubicBezierT(
            clamp01(finiteOr(ease.x1, 0)),
            clamp01(finiteOr(ease.x2, 1)),
            clampedProgress
          );
          return clamp01(
            cubicBezierCoordinate(finiteOr(ease.y1, 0), finiteOr(ease.y2, 1), t)
          );
        }

        return clampedProgress;
      };
    }
  }
}
