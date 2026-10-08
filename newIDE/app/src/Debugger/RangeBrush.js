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

type DragKind = 'from' | 'to' | 'move' | 'new';

/** Below this movement, a drag is read as a click. */
const CLICK_TOLERANCE_PX = 3;

/**
 * A strip covering a whole span, with a handle on each side of the selected
 * range: drag a handle to change one end, drag the range to move it, drag the
 * empty part to draw a new range, click it to bring the range there.
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
    /** Where the drag started, for a range drawn from scratch. */
    startTimeMs: number,
    hasMoved: boolean,
  |}>(null);

  const spanMs = Math.max(1, bounds.toMs - bounds.fromMs);
  const toPercent = (timeMs: number) =>
    Math.max(0, Math.min(100, ((timeMs - bounds.fromMs) / spanMs) * 100));

  // The window listeners are stable functions reading the latest props through
  // refs, so that they can be removed whatever the render they were added in.
  const latestPropsRef = React.useRef({ bounds, spanMs, range, onChange });
  latestPropsRef.current = { bounds, spanMs, range, onChange };

  /** The time under the pointer, in the coordinates of the bounds. */
  const getTimeAtClientX = React.useCallback((clientX: number): number => {
    const container = containerRef.current;
    if (!container) return 0;
    const { bounds, spanMs } = latestPropsRef.current;
    const rectangle = container.getBoundingClientRect();
    const ratio = (clientX - rectangle.left) / (rectangle.width || 1);
    return bounds.fromMs + Math.max(0, Math.min(1, ratio)) * spanMs;
  }, []);

  const onWindowMouseMove = React.useCallback(
    (event: MouseEvent) => {
      const drag = dragRef.current;
      const container = containerRef.current;
      if (!drag || !container) return;
      const { bounds, spanMs, onChange } = latestPropsRef.current;
      const width = container.getBoundingClientRect().width || 1;
      const deltaMs = ((event.clientX - drag.startX) / width) * spanMs;
      const minimumSpanMs = spanMs * 0.005;
      if (Math.abs(event.clientX - drag.startX) >= CLICK_TOLERANCE_PX) {
        drag.hasMoved = true;
      }
      if (drag.kind === 'new') {
        // Nothing is changed until the pointer really moved: a click must not
        // collapse the range to a single point.
        if (!drag.hasMoved) return;
        const currentTimeMs = getTimeAtClientX(event.clientX);
        const fromMs = Math.min(drag.startTimeMs, currentTimeMs);
        const toMs = Math.max(drag.startTimeMs, currentTimeMs);
        onChange({
          fromMs,
          toMs: Math.max(toMs, fromMs + minimumSpanMs),
        });
        return;
      }
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
    },
    [getTimeAtClientX]
  );

  const onWindowMouseUp: () => void = React.useCallback(
    (): void => {
      const drag = dragRef.current;
      dragRef.current = null;
      // A click on the strip brings the range where it was clicked, keeping
      // its span: the most expected answer to a click on an empty part.
      if (drag && drag.kind === 'new' && !drag.hasMoved) {
        const { bounds, range, onChange } = latestPropsRef.current;
        const rangeSpanMs = Math.max(1, range.toMs - range.fromMs);
        const fromMs = Math.max(
          bounds.fromMs,
          Math.min(
            bounds.toMs - rangeSpanMs,
            drag.startTimeMs - rangeSpanMs / 2
          )
        );
        onChange({ fromMs, toMs: fromMs + rangeSpanMs });
      }
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
    dragRef.current = {
      kind,
      startX: event.clientX,
      startRange: range,
      startTimeMs: getTimeAtClientX(event.clientX),
      hasMoved: false,
    };
    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
  };

  React.useEffect(() => onWindowMouseUp, [onWindowMouseUp]);

  return (
    <div
      ref={containerRef}
      className={classes.brush}
      onMouseDown={startDrag('new')}
    >
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
