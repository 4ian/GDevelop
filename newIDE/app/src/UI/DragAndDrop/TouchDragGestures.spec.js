/**
 * @jest-environment jsdom
 */
// @flow
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { useDragDropManager } from 'react-dnd';
import DragAndDropContextProvider from './DragAndDropContextProvider';
import { makeDragSourceAndDropTarget } from './DragSourceAndDropTarget';
import {
  LONG_PRESS_DELAY_ON_HELD_ITEM,
  TOUCH_DRAG_START_DELAY,
  TOUCH_HOLD_TOLERANCE,
} from './TouchDragDelay';
import { useLongTouch } from '../../Utils/UseLongTouch';

/**
 * Integration tests of the touch gestures on a list of draggable rows, run
 * through the real react-dnd touch backend, the drag gate (TouchDragDelay)
 * and the long press opening context menus (useLongTouch), wired together
 * the way TreeViewRow and EventContainer do.
 *
 * Each test drives a finger with real TouchEvents and timings.
 */

const ROW_HEIGHT = 40;
const ROW_WIDTH = 300;
const ROWS_COUNT = 5;
const LONG_PRESS_DELAY = LONG_PRESS_DELAY_ON_HELD_ITEM;

type DraggedRow = {| name: string |};

// A list of rows that must be held before being dragged, and
// one of rows dragging immediately, like the ones with a dedicated handle.
const RowDragSourceAndDropTarget =
  makeDragSourceAndDropTarget <
  DraggedRow >
  ('touch-gestures-row', { touchDragStart: 'afterHold' });
const HandleDragSourceAndDropTarget =
  makeDragSourceAndDropTarget <
  DraggedRow >
  ('touch-gestures-handle', { touchDragStart: 'immediate' });

type Log = {|
  beginDrag: JestMockFn<any, any>,
  endDrag: JestMockFn<any, any>,
  drop: JestMockFn<any, any>,
  contextMenu: JestMockFn<any, any>,
|};

type ListOptions = {| touchDragStart?: 'immediate' | 'afterHold' |};

const Row = ({
  index,
  log,
  options,
}: {|
  index: number,
  log: Log,
  options: ListOptions,
|}) => {
  const name = `row-${index}`;
  const DragSourceAndDropTarget =
    options.touchDragStart === 'immediate'
      ? HandleDragSourceAndDropTarget
      : RowDragSourceAndDropTarget;
  const dragDropManager = useDragDropManager();
  const { contextMenuProps } = useLongTouch(
    () => {
      // Same as TreeViewRow/EventContainer: the menu swallows the touchend,
      // so a drag in progress must be ended before opening it.
      if (dragDropManager.getMonitor().isDragging()) {
        dragDropManager.getActions().endDrag();
      }
      log.contextMenu(name);
    },
    { delay: LONG_PRESS_DELAY }
  );

  return (
    <DragSourceAndDropTarget
      beginDrag={() => {
        log.beginDrag(name);
        return { name };
      }}
      endDrag={() => log.endDrag(name)}
      canDrop={() => true}
      drop={() => log.drop(name)}
    >
      {({ connectDragSource, connectDropTarget, isReadyToDrag }) =>
        connectDragSource(
          connectDropTarget(
            <div
              data-row-index={index}
              data-ready-to-drag={isReadyToDrag ? 'true' : undefined}
              {...contextMenuProps}
            >
              {name}
            </div>
          )
        )
      }
    </DragSourceAndDropTarget>
  );
};

const List = ({ log, options }: {| log: Log, options: ListOptions |}) => (
  <DragAndDropContextProvider>
    <div data-list>
      {Array.from({ length: ROWS_COUNT }, (_, index) => (
        <Row key={index} index={index} log={log} options={options} />
      ))}
    </div>
  </DragAndDropContextProvider>
);

// jsdom has no layout: give the rows a position (stacked vertically) so the
// backend can find what is under the finger.
const getRowElements = (): Array<HTMLElement> =>
  Array.from(document.querySelectorAll('[data-row-index]'));

const getReadyToDragRows = (): Array<string> =>
  Array.from(document.querySelectorAll('[data-ready-to-drag]')).map(
    row => row.textContent
  );

const getRowAt = (x: number, y: number): ?HTMLElement => {
  if (x < 0 || x >= ROW_WIDTH) return null;
  const index = Math.floor(y / ROW_HEIGHT);
  return getRowElements().find(
    row => row.getAttribute('data-row-index') === String(index)
  );
};

const installFakeLayout = () => {
  const originalGetBoundingClientRect =
    // $FlowFixMe[method-unbinding]
    Element.prototype.getBoundingClientRect;
  // $FlowFixMe[cannot-write]
  // $FlowFixMe[missing-this-annot] - prettier 1.x can't parse the annotation.
  Element.prototype.getBoundingClientRect = function() {
    const indexAttribute = this.getAttribute('data-row-index');
    if (indexAttribute === null)
      return originalGetBoundingClientRect.call(this);
    const top = Number(indexAttribute) * ROW_HEIGHT;
    return {
      x: 0,
      y: top,
      top,
      left: 0,
      bottom: top + ROW_HEIGHT,
      right: ROW_WIDTH,
      width: ROW_WIDTH,
      height: ROW_HEIGHT,
      toJSON: () => {},
    };
  };
  // $FlowFixMe[cannot-write]
  document.elementFromPoint = (x, y) => getRowAt(x, y) || document.body;
  // $FlowFixMe[cannot-write]
  document.elementsFromPoint = (x, y) => {
    const row = getRowAt(x, y);
    return row ? [row, document.body] : [document.body];
  };
  return () => {
    // $FlowFixMe[cannot-write]
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  };
};

type Finger = {|
  down: (row: number) => void,
  // Move relative to the initial position of the gesture. Returns the event,
  // whose `defaultPrevented` tells if the browser would have scrolled.
  move: (dx: number, dy: number) => TouchEvent,
  up: () => TouchEvent,
  cancel: () => void,
  wait: (ms: number) => void,
|};

const makeFinger = (): Finger => {
  let target: ?HTMLElement = null;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;

  const dispatchTouch = (type: string): TouchEvent => {
    const dispatchTarget = target;
    if (!dispatchTarget) throw new Error('The finger is not down.');
    const touch = {
      identifier: 1,
      target: dispatchTarget,
      clientX: currentX,
      clientY: currentY,
      pageX: currentX,
      pageY: currentY,
    };
    const isEnd = type === 'touchend' || type === 'touchcancel';
    const event = new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      // $FlowFixMe[incompatible-call] - jsdom accepts plain objects.
      touches: isEnd ? [] : [touch],
      // $FlowFixMe[incompatible-call]
      targetTouches: isEnd ? [] : [touch],
      // $FlowFixMe[incompatible-call]
      changedTouches: [touch],
    });
    // Touch events are always dispatched on the element the gesture started
    // on, wherever the finger is now (like browsers do).
    act(() => {
      dispatchTarget.dispatchEvent(event);
    });
    return event;
  };

  return {
    down: row => {
      const rowElement = getRowElements()[row];
      if (!rowElement) throw new Error(`No row ${row}.`);
      target = rowElement;
      startX = currentX = ROW_WIDTH / 2;
      startY = currentY = row * ROW_HEIGHT + ROW_HEIGHT / 2;
      dispatchTouch('touchstart');
    },
    move: (dx, dy) => {
      currentX = startX + dx;
      currentY = startY + dy;
      return dispatchTouch('touchmove');
    },
    up: () => {
      const event = dispatchTouch('touchend');
      target = null;
      return event;
    },
    cancel: () => {
      dispatchTouch('touchcancel');
      target = null;
    },
    wait: ms => {
      act(() => {
        jest.advanceTimersByTime(ms);
      });
    },
  };
};

const dispatchMouse = (
  element: HTMLElement,
  type: string,
  x: number,
  y: number
) => {
  act(() => {
    element.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        button: 0,
        buttons: type === 'mouseup' ? 0 : 1,
      })
    );
  });
};

// Simulate the browser scrolling an element (scroll events don't bubble).
const dispatchScroll = (element: HTMLElement) => {
  act(() => {
    element.dispatchEvent(new Event('scroll'));
  });
};

describe('Touch drag gestures', () => {
  let container: HTMLElement;
  let root;
  let log: Log;
  let finger: Finger;
  let uninstallFakeLayout = () => {};

  const renderList = (options: ListOptions = {}) => {
    act(() => {
      root.render(<List log={log} options={options} />);
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
    // $FlowFixMe[prop-missing]
    global.IS_REACT_ACT_ENVIRONMENT = true;
    uninstallFakeLayout = installFakeLayout();
    log = {
      beginDrag: jest.fn(),
      endDrag: jest.fn(),
      drop: jest.fn(),
      contextMenu: jest.fn(),
    };
    container = document.createElement('div');
    if (document.body) document.body.appendChild(container);
    root = createRoot(container);
    renderList();
    finger = makeFinger();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    uninstallFakeLayout();
    jest.useRealTimers();
  });

  const expectNothingHappened = () => {
    expect(log.beginDrag).not.toHaveBeenCalled();
    expect(log.drop).not.toHaveBeenCalled();
    expect(log.contextMenu).not.toHaveBeenCalled();
  };

  describe('scrolling a list of rows', () => {
    it('a flick scrolls and does not drag', () => {
      finger.down(1);
      finger.wait(30);
      const move = finger.move(0, 20);
      finger.wait(30);
      finger.move(0, 60);
      finger.up();

      // Not prevented: the browser scrolls.
      expect(move.defaultPrevented).toBe(false);
      expectNothingHappened();
    });

    it('a flick cannot turn into a drag later in the same gesture, even after the delay', () => {
      finger.down(1);
      finger.wait(30);
      finger.move(0, 40);
      finger.wait(TOUCH_DRAG_START_DELAY);
      const move = finger.move(0, 80);
      finger.up();

      expect(move.defaultPrevented).toBe(false);
      expectNothingHappened();
    });

    it('a slow scroll crossing the slop after the delay starts a drag', () => {
      // Known trade-off of the time-based gate: this is indistinguishable
      // from a deliberate drag after a hold.
      finger.down(1);
      finger.wait(TOUCH_DRAG_START_DELAY + 100);
      const move = finger.move(0, 20);

      expect(move.defaultPrevented).toBe(true);
      expect(log.beginDrag).toHaveBeenCalledWith('row-1');
      finger.up();
    });
  });

  describe('dragging a row', () => {
    it('holding still then moving drags the row and drops it on another row', () => {
      finger.down(1);
      finger.wait(TOUCH_DRAG_START_DELAY + 50);
      const move = finger.move(0, 20);
      expect(log.beginDrag).toHaveBeenCalledWith('row-1');
      expect(move.defaultPrevented).toBe(true);

      finger.move(0, 2 * ROW_HEIGHT);
      finger.up();

      expect(log.drop).toHaveBeenCalledWith('row-3');
      expect(log.endDrag).toHaveBeenCalledWith('row-1');
      expect(log.contextMenu).not.toHaveBeenCalled();
    });

    it('small movements during the hold do not start a drag nor cancel it', () => {
      finger.down(1);
      finger.wait(100);
      const jitter = finger.move(2, 3);
      expect(jitter.defaultPrevented).toBe(false);
      expect(log.beginDrag).not.toHaveBeenCalled();

      finger.wait(TOUCH_DRAG_START_DELAY);
      finger.move(0, 20);
      expect(log.beginDrag).toHaveBeenCalledWith('row-1');
      finger.up();
    });

    it('moving right away is a scroll for the whole gesture', () => {
      // Current behavior of the "row" drag mode: the backend tries to start
      // the drag on the first move past the slop and forgets the rows of the
      // gesture when refused, so a grab-and-move never drags.
      finger.down(1);
      finger.wait(150);
      finger.move(0, 30);
      finger.wait(TOUCH_DRAG_START_DELAY);
      finger.move(0, 60);
      finger.up();

      expectNothingHappened();
    });

    it('a source dragging immediately on touch (a handle) drags without holding', () => {
      renderList({ touchDragStart: 'immediate' });
      finger.down(1);
      finger.wait(50);
      // The browser is not allowed to scroll from a handle, even before
      // the drag starts.
      expect(finger.move(0, 3).defaultPrevented).toBe(true);
      // The hold tolerance does not apply: 15px is past the slop.
      const move = finger.move(0, 15);
      expect(move.defaultPrevented).toBe(true);
      expect(log.beginDrag).toHaveBeenCalledWith('row-1');

      finger.move(0, 2 * ROW_HEIGHT);
      finger.up();
      expect(log.drop).toHaveBeenCalledWith('row-3');
    });

    it('a flick on a source dragging immediately on touch (a handle) drags it', () => {
      renderList({ touchDragStart: 'immediate' });
      finger.down(1);
      finger.wait(30);
      finger.move(0, 40);
      expect(log.beginDrag).toHaveBeenCalledWith('row-1');
      finger.up();
    });

    it('a drift past the slop during the hold does not prevent dragging after the hold', () => {
      // A finger rolling a bit while pressing is not scrolling.
      finger.down(1);
      finger.wait(150);
      const drift = finger.move(8, 8);
      expect(drift.defaultPrevented).toBe(false);
      finger.wait(TOUCH_DRAG_START_DELAY);
      finger.move(0, 30);
      expect(log.beginDrag).toHaveBeenCalledWith('row-1');
      finger.move(0, 40);
      finger.up();
      expect(log.drop).toHaveBeenCalledWith('row-2');
    });

    it('a gesture that scrolled the list cannot drag, even after the hold', () => {
      // The browser scrolled for a small drift during the hold: from then
      // on, it keeps scrolling whatever the finger does, so a drag would
      // fight the scroll.
      finger.down(1);
      finger.wait(100);
      finger.move(0, 12);
      const list = document.querySelector('[data-list]');
      if (!list) throw new Error('No list.');
      dispatchScroll(list);
      finger.wait(TOUCH_DRAG_START_DELAY);
      expect(getReadyToDragRows()).toEqual([]);

      finger.move(0, 40);
      finger.up();
      expectNothingHappened();
    });

    it('once the row is ready to drag, the browser is not allowed to scroll anymore', () => {
      finger.down(1);
      finger.wait(100);
      expect(finger.move(0, 5).defaultPrevented).toBe(false);
      finger.wait(TOUCH_DRAG_START_DELAY);
      expect(getReadyToDragRows()).toEqual(['row-1']);

      // A move too small to start the drag is prevented too.
      expect(finger.move(0, 8).defaultPrevented).toBe(true);
      expect(log.beginDrag).not.toHaveBeenCalled();
      finger.move(0, 20);
      expect(log.beginDrag).toHaveBeenCalledWith('row-1');
      finger.up();
    });

    it('a scroll that is not made by the finger does not prevent dragging', () => {
      const list = document.querySelector('[data-list]');
      if (!list) throw new Error('No list.');

      // Before the finger moved (a list scrolling its selection into view).
      finger.down(1);
      finger.wait(100);
      dispatchScroll(list);
      // Of an element not under the finger (a resize detector).
      finger.move(0, 5);
      dispatchScroll(getRowElements()[3]);
      finger.wait(TOUCH_DRAG_START_DELAY);
      expect(getReadyToDragRows()).toEqual(['row-1']);

      finger.move(0, 20);
      expect(log.beginDrag).toHaveBeenCalledWith('row-1');
      finger.up();
    });

    it('a drift past the hold tolerance during the hold is a scroll', () => {
      finger.down(1);
      finger.wait(150);
      finger.move(0, TOUCH_HOLD_TOLERANCE + 5);
      finger.wait(TOUCH_DRAG_START_DELAY);
      finger.move(0, 60);
      finger.up();

      expectNothingHappened();
    });

    it('the row is ready to drag once the hold elapsed, until the drag starts', () => {
      finger.down(1);
      finger.wait(TOUCH_DRAG_START_DELAY - 1);
      expect(getReadyToDragRows()).toEqual([]);
      finger.wait(1);
      expect(getReadyToDragRows()).toEqual(['row-1']);

      finger.move(0, 20);
      expect(log.beginDrag).toHaveBeenCalledWith('row-1');
      expect(getReadyToDragRows()).toEqual([]);
      finger.up();
    });

    it('the row is not ready to drag after a scroll, a tap or a mouse press', () => {
      finger.down(1);
      finger.wait(100);
      finger.move(0, TOUCH_HOLD_TOLERANCE + 5);
      finger.wait(TOUCH_DRAG_START_DELAY);
      expect(getReadyToDragRows()).toEqual([]);
      finger.up();

      finger.down(1);
      finger.wait(100);
      finger.up();
      finger.wait(TOUCH_DRAG_START_DELAY);
      expect(getReadyToDragRows()).toEqual([]);

      const row = getRowElements()[1];
      dispatchMouse(row, 'mousedown', 150, 60);
      act(() => {
        jest.advanceTimersByTime(TOUCH_DRAG_START_DELAY);
      });
      expect(getReadyToDragRows()).toEqual([]);
      dispatchMouse(row, 'mouseup', 150, 60);
    });

    it('the row is no longer ready to drag once the long press menu swallowed the touchend', () => {
      finger.down(1);
      finger.wait(LONG_PRESS_DELAY + 50);
      expect(log.contextMenu).toHaveBeenCalledWith('row-1');
      expect(getReadyToDragRows()).toEqual(['row-1']);

      // The menu stops the propagation of the touchend before it reaches
      // the row.
      const menu = document.createElement('div');
      menu.addEventListener('touchend', event => event.stopPropagation());
      if (document.body) document.body.appendChild(menu);
      act(() => {
        menu.dispatchEvent(
          new TouchEvent('touchend', { bubbles: true, cancelable: true })
        );
      });
      expect(getReadyToDragRows()).toEqual([]);
      menu.remove();
    });

    it('a source dragging immediately on touch (a handle) is never marked as ready to drag', () => {
      renderList({ touchDragStart: 'immediate' });
      finger.down(1);
      finger.wait(TOUCH_DRAG_START_DELAY + 50);
      expect(getReadyToDragRows()).toEqual([]);
      finger.up();
    });

    it('moving after the drag delay but before the long press drags, and opens no menu', () => {
      finger.down(1);
      finger.wait(LONG_PRESS_DELAY - 100);
      finger.move(0, 20);
      finger.wait(200);

      expect(log.beginDrag).toHaveBeenCalledWith('row-1');
      expect(log.contextMenu).not.toHaveBeenCalled();
      finger.up();
    });

    it('a second gesture can drag after a first gesture scrolled', () => {
      finger.down(1);
      finger.wait(30);
      finger.move(0, 40);
      finger.up();
      expectNothingHappened();

      finger.down(1);
      finger.wait(TOUCH_DRAG_START_DELAY + 50);
      finger.move(0, 20);
      expect(log.beginDrag).toHaveBeenCalledWith('row-1');
      finger.up();
    });
  });

  describe('long press opening the context menu', () => {
    it('holding without moving opens the menu and does not drag', () => {
      finger.down(1);
      finger.wait(LONG_PRESS_DELAY + 50);
      expect(log.contextMenu).toHaveBeenCalledWith('row-1');
      expect(log.beginDrag).not.toHaveBeenCalled();

      // The synthesized click following the touchend is prevented, so the
      // item under the finger (menu, row) is not activated.
      const up = finger.up();
      expect(up.defaultPrevented).toBe(true);
      expect(log.beginDrag).not.toHaveBeenCalled();
    });

    it('a drag started by a tiny move is ended when the menu opens', () => {
      // The long press tolerates 10px on each axis while the backend starts
      // the drag past 10px of distance: a diagonal move can start a drag
      // without cancelling the long press. The menu would then swallow the
      // touchend and leave the drag active forever, so it is ended first.
      finger.down(1);
      finger.wait(TOUCH_DRAG_START_DELAY + 50);
      finger.move(8, 8);
      expect(log.beginDrag).toHaveBeenCalledWith('row-1');

      finger.wait(LONG_PRESS_DELAY);
      expect(log.contextMenu).toHaveBeenCalledWith('row-1');
      expect(log.endDrag).toHaveBeenCalledWith('row-1');
      expect(log.drop).not.toHaveBeenCalled();
      finger.up();
    });

    it('after the menu was opened, the next gesture can drag', () => {
      finger.down(1);
      finger.wait(LONG_PRESS_DELAY + 50);
      finger.up();
      expect(log.contextMenu).toHaveBeenCalledTimes(1);

      finger.down(2);
      finger.wait(TOUCH_DRAG_START_DELAY + 50);
      finger.move(0, 20);
      expect(log.beginDrag).toHaveBeenCalledWith('row-2');
      finger.move(0, -2 * ROW_HEIGHT);
      finger.up();
      expect(log.drop).toHaveBeenCalledWith('row-0');
    });

    it('two quick taps (a double tap) neither lift the row nor drag', () => {
      finger.down(1);
      finger.wait(100);
      finger.up();
      finger.wait(150);
      finger.down(1);
      finger.wait(100);
      finger.up();
      finger.wait(TOUCH_DRAG_START_DELAY);

      expect(getReadyToDragRows()).toEqual([]);
      expectNothingHappened();
    });

    it('a tap does neither drag nor open the menu', () => {
      finger.down(1);
      finger.wait(100);
      const up = finger.up();

      expect(up.defaultPrevented).toBe(false);
      expectNothingHappened();
    });
  });

  describe('gesture interrupted by the system', () => {
    it('a touchcancel during a drag ends it, and the next gesture starts from scratch', () => {
      finger.down(1);
      finger.wait(TOUCH_DRAG_START_DELAY + 50);
      finger.move(0, 20);
      expect(log.beginDrag).toHaveBeenCalledWith('row-1');
      finger.cancel();
      expect(log.endDrag).toHaveBeenCalledWith('row-1');
      expect(log.drop).not.toHaveBeenCalled();

      // A tap does not drop the interrupted drag anywhere.
      finger.down(3);
      finger.wait(30);
      finger.move(0, 10);
      finger.up();
      expect(log.drop).not.toHaveBeenCalled();

      // A new drag works normally.
      finger.down(3);
      finger.wait(TOUCH_DRAG_START_DELAY + 50);
      finger.move(0, -20);
      expect(log.beginDrag).toHaveBeenCalledWith('row-3');
      finger.move(0, -ROW_HEIGHT);
      finger.up();
      expect(log.drop).toHaveBeenCalledWith('row-2');
      expect(log.contextMenu).not.toHaveBeenCalled();
    });
  });

  describe('mouse and hybrid devices', () => {
    it('a mouse drags immediately, with no delay', () => {
      const row = getRowElements()[1];
      dispatchMouse(row, 'mousedown', 150, 60);
      dispatchMouse(row, 'mousemove', 150, 75);
      expect(log.beginDrag).toHaveBeenCalledWith('row-1');

      dispatchMouse(row, 'mousemove', 150, 140);
      dispatchMouse(row, 'mouseup', 150, 140);
      expect(log.drop).toHaveBeenCalledWith('row-3');
    });

    it('a mouse still drags immediately after a touch gesture was made', () => {
      finger.down(1);
      finger.wait(30);
      finger.move(0, 40);
      finger.up();
      expectNothingHappened();

      const row = getRowElements()[2];
      dispatchMouse(row, 'mousedown', 150, 100);
      dispatchMouse(row, 'mousemove', 150, 115);
      expect(log.beginDrag).toHaveBeenCalledWith('row-2');
      dispatchMouse(row, 'mouseup', 150, 115);
    });

    it('the mouse events synthesized by a long press on Android do not start a phantom drag', () => {
      // Android Chrome fires hover mouse events ~1px off the touch position
      // during a long press, then a contextmenu event.
      const row = getRowElements()[1];
      finger.down(1);
      finger.wait(LONG_PRESS_DELAY - 100);
      dispatchMouse(row, 'mousemove', ROW_WIDTH / 2 + 1, 60 + 1);
      finger.wait(100);
      expect(log.contextMenu).toHaveBeenCalledWith('row-1');
      expect(log.beginDrag).not.toHaveBeenCalled();

      act(() => {
        row.dispatchEvent(
          new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
        );
      });
      finger.up();
      expect(log.beginDrag).not.toHaveBeenCalled();
      expect(log.drop).not.toHaveBeenCalled();
    });
  });
});
