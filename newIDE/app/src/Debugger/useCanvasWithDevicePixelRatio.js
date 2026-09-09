// @flow
import * as React from 'react';

export type CanvasSize = {| width: number, height: number |};

/**
 * Size a canvas to its container, taking the device pixel ratio into account
 * so that drawings stay sharp. Returns the refs to attach and the size in CSS
 * pixels: the drawing context is already scaled, draw in CSS pixels.
 */
export const useCanvasWithDevicePixelRatio = (): {|
  containerRef: { current: null | HTMLDivElement },
  canvasRef: { current: null | HTMLCanvasElement },
  size: CanvasSize,
  getContext: () => CanvasRenderingContext2D | null,
|} => {
  const containerRef = React.useRef<null | HTMLDivElement>(null);
  const canvasRef = React.useRef<null | HTMLCanvasElement>(null);
  const [size, setSize] = React.useState<CanvasSize>({ width: 0, height: 0 });

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateSize = () => {
      const rectangle = container.getBoundingClientRect();
      const width = Math.floor(rectangle.width);
      const height = Math.floor(rectangle.height);
      setSize(currentSize =>
        currentSize.width === width && currentSize.height === height
          ? currentSize
          : { width, height }
      );
    };
    updateSize();
    if (typeof ResizeObserver === 'undefined') return;
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const getContext = React.useCallback(
    (): CanvasRenderingContext2D | null => {
      const canvas = canvasRef.current;
      if (!canvas || !size.width || !size.height) return null;
      const devicePixelRatio = window.devicePixelRatio || 1;
      const scaledWidth = Math.round(size.width * devicePixelRatio);
      const scaledHeight = Math.round(size.height * devicePixelRatio);
      if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
      }
      const context = canvas.getContext('2d');
      if (!context) return null;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      return context;
    },
    [size]
  );

  return { containerRef, canvasRef, size, getContext };
};
