// @flow
import * as React from 'react';
import { type ProfilerRecordingRange } from './ProfilerRecording/ProfilerRecordingStore';
import classes from './RangeBrush.module.css';

type Props = {|
  /** The whole span the range is taken from. */
  bounds: ProfilerRecordingRange,
  /** The selected range (inside the bounds). */
  range: ProfilerRecordingRange,
  onChange: (range: ProfilerRecordingRange) => void,
  /** Formats the times shown at the handles. */
  formatTime: number => string,
|};

type DragKind = 'from' | 'to' | 'move';

/**
 * A strip covering a whole span, with a handle on each side of the selected
 * range: drag a handle to change one end, drag the range to move it.
 */
const RangeBrush = ({
  bounds,
  range,
  onChange,
  formatTime,
}: Props): React.Node => {
  const containerRef = React.useRef<null | HTMLDivElement>(null);
  const dragRef = React.useRef<?{|
    kind: DragKind,
    startX: number,
    startRange: ProfilerRecordingRange,
  |}>(null);

  const spanMs = Math.max(1, bounds.toMs - bounds.fromMs);
  const toPercent = (timeMs: number) =>
    Math.max(0, Math.min(100, ((timeMs - bounds.fromMs) / spanMs) * 100));

  // The window listeners are stable functions reading the latest props through
  // refs, so that they can be removed whatever the render they were added in.
  const latestPropsRef = React.useRef({ bounds, spanMs, onChange });
  latestPropsRef.current = { bounds, spanMs, onChange };

  const onWindowMouseMove = React.useCallback((event: MouseEvent) => {
    const drag = dragRef.current;
    const container = containerRef.current;
    if (!drag || !container) return;
    const { bounds, spanMs, onChange } = latestPropsRef.current;
    const width = container.getBoundingClientRect().width || 1;
    const deltaMs = ((event.clientX - drag.startX) / width) * spanMs;
    const minimumSpanMs = spanMs * 0.005;
    let { fromMs, toMs } = drag.startRange;
    if (drag.kind === 'from') {
      fromMs = Math.max(
        bounds.fromMs,
        Math.min(toMs - minimumSpanMs, fromMs + deltaMs)
      );
    } else if (drag.kind === 'to') {
      toMs = Math.min(
        bounds.toMs,
        Math.max(fromMs + minimumSpanMs, toMs + deltaMs)
      );
    } else {
      const rangeSpanMs = toMs - fromMs;
      fromMs = Math.max(
        bounds.fromMs,
        Math.min(bounds.toMs - rangeSpanMs, fromMs + deltaMs)
      );
      toMs = fromMs + rangeSpanMs;
    }
    onChange({ fromMs, toMs });
  }, []);

  const onWindowMouseUp: () => void = React.useCallback(
    (): void => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    },
    [onWindowMouseMove]
  );

  const startDrag = (kind: DragKind) => (
    event: SyntheticMouseEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { kind, startX: event.clientX, startRange: range };
    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
  };

  React.useEffect(() => onWindowMouseUp, [onWindowMouseUp]);

  return (
    <div ref={containerRef} className={classes.brush}>
      <div
        className={classes.selection}
        style={{
          left: `${toPercent(range.fromMs)}%`,
          width: `${toPercent(range.toMs) - toPercent(range.fromMs)}%`,
        }}
        onMouseDown={startDrag('move')}
        title={`${formatTime(range.fromMs)} - ${formatTime(range.toMs)}`}
      >
        <div
          className={`${classes.handle} ${classes.handleLeft}`}
          onMouseDown={startDrag('from')}
        />
        <div
          className={`${classes.handle} ${classes.handleRight}`}
          onMouseDown={startDrag('to')}
        />
      </div>
    </div>
  );
};

export default RangeBrush;
