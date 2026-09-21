// @flow
import * as React from 'react';
import { useDragDropManager } from 'react-dnd';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import CustomDragLayer from '../../../UI/DragAndDrop/CustomDragLayer';
import { useScreenType } from '../../../UI/Responsive/ScreenTypeMeasurer';

/**
 * How a surface starts a drag on a touch screen:
 * - 'row': the whole row is the drag source and lives in a scrollable list,
 *   so a drag only starts after the finger stayed still for a while (a quick
 *   move scrolls the list).
 * - 'handle': the row has a dedicated grip, so touching it drags instantly.
 */
export type TouchDragMode = 'row' | 'handle';

export type GestureId =
  | 'flick'
  | 'grabAndMove'
  | 'holdThenDrag'
  | 'wobbleThenDrag'
  | 'longPress'
  | 'holdThenDragBeforeMenu'
  | 'tap'
  | 'doubleTap'
  | 'interruptedDrag'
  | 'dragToEdge'
  | 'dragOntoScene';

type Gesture = {|
  title: string,
  action: string,
  expected: {| row: string, handle: string |},
|};

const gestures: { [GestureId]: Gesture } = {
  flick: {
    title: 'Flick',
    action: 'Swipe quickly up or down on an item.',
    expected: {
      row: 'The list scrolls. Nothing is dragged, no menu.',
      handle:
        'On the grip: the item is dragged. Anywhere else on the row: the list scrolls.',
    },
  },
  grabAndMove: {
    title: 'Grab and move',
    action: 'Press and immediately move, without pausing.',
    expected: {
      row: 'The list scrolls for the whole gesture (no drag starts later on).',
      handle: 'The item is dragged right away.',
    },
  },
  holdThenDrag: {
    title: 'Hold, then drag',
    action: 'Press, keep the finger still about half a second, then move.',
    expected: {
      row:
        'The item lifts (visibly) once the hold elapsed, then follows the finger. Dropping reorders it. No menu.',
      handle: 'The item is dragged. No menu.',
    },
  },
  wobbleThenDrag: {
    title: 'Hold with a wobbling finger, then drag',
    action:
      'Press, let the finger roll a bit (about a centimeter) while holding, then move.',
    expected: {
      row: 'Same as "Hold, then drag": the wobble does not cancel the drag.',
      handle: 'The item is dragged.',
    },
  },
  longPress: {
    title: 'Long press',
    action: 'Press and keep the finger still for more than a second.',
    expected: {
      row:
        'The context menu opens. No drag preview. Lifting the finger does not activate what is under it. After closing the menu (try "Delete" where it exists), the list still scrolls and drags.',
      handle:
        'Same: the context menu opens (on the row), nothing is dragged, the list is usable afterwards.',
    },
  },
  holdThenDragBeforeMenu: {
    title: 'Hold, then drag just before the menu',
    action: 'Press, wait about half a second, then move.',
    expected: {
      row: 'The item is dragged and the menu does not open.',
      handle: 'The item is dragged and the menu does not open.',
    },
  },
  tap: {
    title: 'Tap',
    action: 'Touch and release quickly.',
    expected: {
      row: 'The item is selected/activated. No drag, no menu.',
      handle: 'The item is selected/activated. No drag, no menu.',
    },
  },
  doubleTap: {
    title: 'Double tap',
    action: 'Tap twice quickly.',
    expected: {
      row: 'The item opens for editing. No drag, no menu.',
      handle: 'The item opens for editing. No drag, no menu.',
    },
  },
  interruptedDrag: {
    title: 'Interrupted drag',
    action:
      'Start a drag, then put a second finger down, or switch app / pull the notification shade.',
    expected: {
      row:
        'The drag is abandoned. The next gesture behaves normally and nothing is dropped by mistake.',
      handle:
        'The drag is abandoned. The next gesture behaves normally and nothing is dropped by mistake.',
    },
  },
  dragToEdge: {
    title: 'Drag to the edge',
    action: 'Drag an item and hold it near the top or bottom edge of the list.',
    expected: {
      row: 'The list scrolls while the finger stays near the edge.',
      handle: 'The list scrolls while the finger stays near the edge.',
    },
  },
  dragOntoScene: {
    title: 'Drag onto the scene',
    action: 'Drag an object and drop it on the scene area below the list.',
    expected: {
      row: 'The drop is logged with the object name.',
      handle: 'The drop is logged with the object name.',
    },
  },
};

const MOVE_THRESHOLD = 10; // px, same as the drag slop and long press tolerance.
const MAX_LOG_ENTRIES = 14;

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: 480,
    fontFamily: 'system-ui, sans-serif',
    fontSize: 13,
  },
  header: { display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' },
  title: { fontSize: 16, fontWeight: 600, margin: 0 },
  pill: {
    fontSize: 11,
    padding: '1px 8px',
    borderRadius: 999,
    background: '#e6ebfb',
    color: '#2447c9',
  },
  frame: {
    border: '1px solid #b9bfcc',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  log: {
    fontFamily: 'ui-monospace, Menlo, monospace',
    fontSize: 11.5,
    lineHeight: 1.5,
    background: '#1b1f27',
    color: '#e8eaf0',
    borderRadius: 6,
    padding: '8px 10px',
    minHeight: 80,
    margin: 0,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  checklist: {
    margin: 0,
    paddingLeft: 0,
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  gesture: {
    border: '1px solid #dfe3ea',
    borderRadius: 6,
    padding: '6px 10px',
  },
  gestureTitle: { fontWeight: 600 },
  muted: { color: '#4b5262' },
  button: { fontSize: 12, padding: '2px 8px' },
};

type LogEntry = {| time: number, text: string |};

const formatDuration = (durationInMs: number) =>
  `${Math.round(durationInMs)}ms`;

const describeItem = (item: any, itemType: mixed): string => {
  const type = String(itemType);
  if (!item) return type;
  if (typeof item.name === 'string') return `${type} "${item.name}"`;
  if (item.event && typeof item.event.getType === 'function')
    return `${type} (${item.event.getType()})`;
  return type;
};

/**
 * Logs the drags seen by react-dnd. Must be rendered inside the provider.
 */
const DragLogger = ({ log }: {| log: (text: string) => void |}) => {
  const dragDropManager = useDragDropManager();
  React.useEffect(
    () => {
      const monitor = dragDropManager.getMonitor();
      let wasDragging = false;
      let didDrop = false;
      let lastItemDescription = '';
      return monitor.subscribeToStateChange(() => {
        const isDragging = monitor.isDragging();
        if (isDragging && !wasDragging) {
          didDrop = false;
          lastItemDescription = describeItem(
            monitor.getItem(),
            monitor.getItemType()
          );
          log(`drag started: ${lastItemDescription}`);
        } else if (isDragging && monitor.didDrop()) {
          // Seen before the end of the drag resets it.
          didDrop = true;
        } else if (!isDragging && wasDragging) {
          log(
            didDrop
              ? `dropped: ${lastItemDescription}`
              : `drag ended without drop: ${lastItemDescription}`
          );
        }
        wasDragging = isDragging;
      });
    },
    [dragDropManager, log]
  );
  return null;
};

type Props = {|
  title: string,
  mode: TouchDragMode,
  gestureIds: Array<GestureId>,
  /** Notes specific to the surface, shown above the checklist. */
  notes?: React.Node,
  children: React.Node,
|};

/**
 * Wraps a draggable surface with what is needed to check its touch gestures
 * on a device: the drag and drop provider and preview layer, a log of the
 * gestures (finger, scroll, drags, menus) and the checklist of gestures to
 * try with their expected result.
 */
const TouchGestureHarness = ({
  title,
  mode,
  gestureIds,
  notes,
  children,
}: Props): React.Node => {
  const screenType = useScreenType();
  const frameRef = React.useRef<?HTMLDivElement>(null);
  const [entries, setEntries] = React.useState<Array<LogEntry>>([]);
  const log = React.useCallback((text: string) => {
    setEntries(entries =>
      [{ time: performance.now(), text }, ...entries].slice(0, MAX_LOG_ENTRIES)
    );
  }, []);

  React.useEffect(
    () => {
      const frame = frameRef.current;
      if (!frame) return;
      const isInFrame = (event: Event) =>
        event.target instanceof Node && frame.contains(event.target);

      let gestureStartTime = 0;
      let gestureStartX = 0;
      let gestureStartY = 0;
      let hasMovedPastThreshold = false;
      let hasScrolled = false;
      const elapsed = () =>
        formatDuration(performance.now() - gestureStartTime);

      const onTouchStart = (event: TouchEvent) => {
        if (!isInFrame(event)) return;
        const touch = event.touches[0];
        gestureStartTime = performance.now();
        gestureStartX = touch.clientX;
        gestureStartY = touch.clientY;
        hasMovedPastThreshold = false;
        hasScrolled = false;
        log(
          event.touches.length === 1
            ? 'finger down'
            : `finger down (${event.touches.length} fingers)`
        );
      };
      const onTouchMove = (event: TouchEvent) => {
        if (!isInFrame(event) || hasMovedPastThreshold) return;
        const touch = event.touches[0];
        const distance = Math.hypot(
          touch.clientX - gestureStartX,
          touch.clientY - gestureStartY
        );
        if (distance < MOVE_THRESHOLD) return;
        hasMovedPastThreshold = true;
        // Listened on the window, after the drag backend handled the event:
        // it prevents the default only when a drag is in progress.
        log(
          `${elapsed()}: moved ${Math.round(distance)}px, ${
            event.defaultPrevented
              ? 'drag (scroll prevented)'
              : 'scroll allowed'
          }`
        );
      };
      const onTouchEnd = (event: TouchEvent) => {
        if (!isInFrame(event)) return;
        log(
          `${elapsed()}: finger up${
            event.defaultPrevented ? ' (click prevented)' : ''
          }`
        );
      };
      const onTouchCancel = (event: TouchEvent) => {
        if (!isInFrame(event)) return;
        log(`${elapsed()}: touch cancelled by the system`);
      };
      const onScroll = (event: Event) => {
        if (!isInFrame(event) || hasScrolled) return;
        // The resize detectors scroll their own hidden elements.
        const target = event.target;
        if (
          target instanceof Element &&
          (target.classList.contains('expand-trigger') ||
            target.classList.contains('contract-trigger'))
        )
          return;
        hasScrolled = true;
        log(`${elapsed()}: list scrolled`);
      };
      const onContextMenu = (event: Event) => {
        if (!isInFrame(event)) return;
        log(`${elapsed()}: contextmenu event`);
      };
      const onClick = (event: Event) => {
        if (!isInFrame(event)) return;
        log(`${elapsed()}: click`);
      };

      window.addEventListener('touchstart', onTouchStart);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
      window.addEventListener('touchcancel', onTouchCancel);
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('contextmenu', onContextMenu);
      window.addEventListener('click', onClick);
      return () => {
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('touchcancel', onTouchCancel);
        window.removeEventListener('scroll', onScroll, true);
        window.removeEventListener('contextmenu', onContextMenu);
        window.removeEventListener('click', onClick);
      };
    },
    [log]
  );

  return (
    <DragAndDropContextProvider>
      <DragLogger log={log} />
      <div style={styles.page}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <span style={styles.pill}>{mode} drag</span>
          <span style={styles.muted}>input: {screenType}</span>
        </div>
        <div style={styles.frame} ref={frameRef}>
          {children}
        </div>
        <div>
          <div style={styles.header}>
            <strong>Gesture log</strong>
            <button
              type="button"
              style={styles.button}
              onClick={() => setEntries([])}
            >
              Clear
            </button>
          </div>
          <pre style={styles.log} data-touch-gesture-log>
            {entries.length === 0
              ? 'Touch the list above.'
              : entries.map(entry => entry.text).join('\n')}
          </pre>
        </div>
        {notes ? <div style={styles.muted}>{notes}</div> : null}
        <ol style={styles.checklist}>
          {gestureIds.map(id => {
            const gesture = gestures[id];
            return (
              <li key={id} style={styles.gesture}>
                <div style={styles.gestureTitle}>{gesture.title}</div>
                <div>{gesture.action}</div>
                <div style={styles.muted}>
                  Expected: {gesture.expected[mode]}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <CustomDragLayer />
    </DragAndDropContextProvider>
  );
};

export default TouchGestureHarness;
