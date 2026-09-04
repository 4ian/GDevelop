/**
 * @jest-environment jsdom
 * @flow
 */
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import Dialog from '@material-ui/core/Dialog';

// The scene editor listens to `keydown` on its root div to catch undo/redo
// shortcuts (see `_onKeyDownInEditor` in `SceneEditor/index.js`). Dialogs are
// rendered in portals: their DOM lives outside of the root div, but React
// synthetic events propagate through the REACT tree, not the DOM tree - so a
// shortcut pressed inside a dialog DOES reach the root div handler.
// These tests document this behavior and the DOM containment check
// (`container.contains(event.target)`) used by `_onKeyDownInEditor` to
// distinguish the two cases.
describe('keydown propagation from a dialog to a parent onKeyDown', () => {
  let container: HTMLDivElement;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    if (!document.body) throw new Error('No document body');
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      if (root) root.unmount();
    });
    container.remove();
  });

  const dispatchCtrlZOn = (element: HTMLElement) => {
    act(() => {
      element.focus();
      element.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'z',
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        })
      );
    });
  };

  it('reaches the parent handler from an element inside the div, which contains the event target', () => {
    const receivedEvents = [];
    const onKeyDown = (event: SyntheticKeyboardEvent<HTMLElement>) =>
      receivedEvents.push({
        containsTarget:
          event.target instanceof Node &&
          event.currentTarget.contains(event.target),
      });
    act(() => {
      root = createRoot(container);
      root.render(
        <div onKeyDown={onKeyDown} tabIndex={-1}>
          <button id="in-div-button">In div</button>
        </div>
      );
    });

    const button = document.getElementById('in-div-button');
    if (!button) throw new Error('Button not found');
    dispatchCtrlZOn(button);

    expect(receivedEvents).toEqual([{ containsTarget: true }]);
  });

  it('reaches the parent handler from inside a portaled dialog, but the div does NOT contain the event target', () => {
    const receivedEvents = [];
    const onKeyDown = (event: SyntheticKeyboardEvent<HTMLElement>) =>
      receivedEvents.push({
        containsTarget:
          event.target instanceof Node &&
          event.currentTarget.contains(event.target),
      });
    act(() => {
      root = createRoot(container);
      root.render(
        <div onKeyDown={onKeyDown} tabIndex={-1}>
          <Dialog open transitionDuration={0} disableEnforceFocus>
            <button id="dialog-button">In dialog</button>
          </Dialog>
        </div>
      );
    });

    const button = document.getElementById('dialog-button');
    if (!button) throw new Error('Dialog button not found');
    dispatchCtrlZOn(button);

    // The synthetic event DOES reach the parent handler (React tree
    // propagation): without a guard, shortcuts pressed in a dialog would
    // wrongly trigger the editor ones.
    expect(receivedEvents.length).toBe(1);
    // ...but the DOM containment check tells the two cases apart (the
    // dialog DOM is in a portal, outside of the div).
    expect(receivedEvents[0].containsTarget).toBe(false);
  });
});
