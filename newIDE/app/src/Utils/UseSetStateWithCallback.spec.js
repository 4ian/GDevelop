// @flow
import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import useStateWithCallback from './UseSetStateWithCallback';

describe('useStateWithCallback', () => {
  it('settles every promise when state updates are batched in one commit', async () => {
    let setStateWithCallback = null;
    let currentState = null;
    let renderer = null;

    const HookCapture = () => {
      const [state, setState] = useStateWithCallback({ count: 0 });
      currentState = state;
      setStateWithCallback = setState;
      return null;
    };

    act(() => {
      renderer = TestRenderer.create(<HookCapture />);
    });
    if (!setStateWithCallback) throw new Error('Hook was not captured.');

    let firstResolvedState = null;
    let secondResolvedState = null;
    act(() => {
      setStateWithCallback(state => ({ count: state.count + 1 })).then(
        state => {
          firstResolvedState = state;
        }
      );
      setStateWithCallback(state => ({ count: state.count + 1 })).then(
        state => {
          secondResolvedState = state;
        }
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(currentState).toEqual({ count: 2 });
    expect(firstResolvedState).toEqual({ count: 2 });
    expect(secondResolvedState).toEqual({ count: 2 });

    act(() => {
      if (renderer) renderer.unmount();
    });
  });
});
