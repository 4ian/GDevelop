// @flow
import * as React from 'react';
import { getFramedSize } from './CubicBezierFrame';

const desktopCurveSize = 360;
const mobileCurveSize = 240;
const minMeasuredCurveSize = 160;

const readContentWidth = (element: HTMLElement): number => {
  const style = getComputedStyle(element);
  const padding =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  return Math.floor(element.clientWidth - padding);
};

// First paint, before the graph frame is measured.
const estimateDesktopCurveSize = (besideWidth: number): number => {
  if (typeof window === 'undefined') return desktopCurveSize;
  // Dialog `maxWidth="md"` (960px), 64px dialog margin, 48px dialog padding,
  // 16px body margin and 8px gap between the graph and what is beside it.
  const dialogWidth = Math.min(960, Math.max(0, window.innerWidth - 64));
  const graphFrameWidth = dialogWidth - 48 - 16 - 8 - besideWidth;
  return Math.max(
    desktopCurveSize,
    Math.floor(graphFrameWidth - getFramedSize(0))
  );
};

/**
 * Size of the curve editor: fixed on mobile, otherwise the content width of
 * the frame given `graphFrameRef`, which fills the space left by `besideWidth`.
 */
export const useCubicBezierCurveSize = ({
  isMobile,
  besideWidth,
}: {|
  isMobile: boolean,
  besideWidth: number,
|}): {|
  graphFrameRef: {| current: ?HTMLDivElement |},
  curveSize: number,
|} => {
  const graphFrameRef = React.useRef<?HTMLDivElement>(null);
  const [measuredCurveSize, setMeasuredCurveSize] = React.useState<number>(() =>
    estimateDesktopCurveSize(besideWidth)
  );

  React.useLayoutEffect(
    () => {
      if (isMobile) return undefined;
      const element = graphFrameRef.current;
      if (!element || typeof ResizeObserver !== 'function') return undefined;
      const updateSize = () => {
        const width = readContentWidth(element);
        if (width < minMeasuredCurveSize) return;
        setMeasuredCurveSize(current => (current === width ? current : width));
      };
      updateSize();
      const observer = new ResizeObserver(updateSize);
      observer.observe(element);
      return () => observer.disconnect();
    },
    [isMobile]
  );

  return {
    graphFrameRef,
    curveSize: isMobile ? mobileCurveSize : measuredCurveSize,
  };
};
