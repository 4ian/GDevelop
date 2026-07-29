// @flow

import * as React from 'react';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import { useLongTouch } from './UseLongTouch';

const LongTouchTester = ({
  callback,
  options,
  propsRef,
}: {|
  callback: () => void,
  options: any,
  propsRef: {| current: any |},
|}) => {
  const { contextMenuProps } = useLongTouch(callback, options);
  propsRef.current = contextMenuProps;
  return null;
};

const renderLongTouchTester = (callback: () => void, options?: any) => {
  const propsRef = { current: (null: any) };
  renderer.create(
    <LongTouchTester
      callback={callback}
      options={{ doNotCancelOnScroll: true, ...options }}
      propsRef={propsRef}
    />
  );
  return propsRef;
};

const makeTouchStartEvent = (): any => ({
  touches: [{ clientX: 10, clientY: 10 }],
  currentTarget: null,
});

const makeTouchEndEvent = (cancelable: boolean = true): any => ({
  cancelable,
  preventDefault: (jest.fn(): () => void),
});

describe('useLongTouch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('calls the callback and prevents the synthesized click after a long touch', () => {
    const callback: () => void = jest.fn();
    const propsRef = renderLongTouchTester(callback);

    act(() => {
      propsRef.current.onTouchStart(makeTouchStartEvent());
      jest.advanceTimersByTime(700);
    });
    expect(callback).toHaveBeenCalled();

    const touchEndEvent = makeTouchEndEvent();
    act(() => {
      propsRef.current.onTouchEnd(touchEndEvent);
    });
    expect(touchEndEvent.preventDefault).toHaveBeenCalled();
  });

  it('does not prevent the click for a quick tap', () => {
    const callback: () => void = jest.fn();
    const propsRef = renderLongTouchTester(callback);

    const touchEndEvent = makeTouchEndEvent();
    act(() => {
      propsRef.current.onTouchStart(makeTouchStartEvent());
      jest.advanceTimersByTime(100);
      propsRef.current.onTouchEnd(touchEndEvent);
    });
    expect(callback).not.toHaveBeenCalled();
    expect(touchEndEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('does not call preventDefault on a non-cancelable touchend', () => {
    const callback: () => void = jest.fn();
    const propsRef = renderLongTouchTester(callback);

    const touchEndEvent = makeTouchEndEvent(false);
    act(() => {
      propsRef.current.onTouchStart(makeTouchStartEvent());
      jest.advanceTimersByTime(700);
      propsRef.current.onTouchEnd(touchEndEvent);
    });
    expect(callback).toHaveBeenCalled();
    expect(touchEndEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('does not prevent a tap on a nested element after an interrupted long touch on the outer element', () => {
    // Like the events sheet: an event row (outer) and an instruction (inner)
    // share a context, and the menu swallows the outer's touchend.
    const context = 'nested-context-test';
    const outerCallback: () => void = jest.fn();
    const innerCallback: () => void = jest.fn();
    const outerPropsRef = renderLongTouchTester(outerCallback, { context });
    const innerPropsRef = renderLongTouchTester(innerCallback, { context });

    act(() => {
      outerPropsRef.current.onTouchStart(makeTouchStartEvent());
      jest.advanceTimersByTime(700);
    });
    expect(outerCallback).toHaveBeenCalled();

    // Quick tap on the inner element: events bubble from inner to outer.
    const touchEndEvent = makeTouchEndEvent();
    act(() => {
      innerPropsRef.current.onTouchStart(makeTouchStartEvent());
      outerPropsRef.current.onTouchStart(makeTouchStartEvent());
      jest.advanceTimersByTime(100);
      innerPropsRef.current.onTouchEnd(touchEndEvent);
      outerPropsRef.current.onTouchEnd(touchEndEvent);
    });
    expect(innerCallback).not.toHaveBeenCalled();
    expect(touchEndEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('allows a new long press after one whose touchend was swallowed', () => {
    // The context lock must not stay held when a menu swallows the touchend.
    const context = 'swallowed-touchend-context-test';
    const callback: () => void = jest.fn();
    const propsRef = renderLongTouchTester(callback, { context });

    act(() => {
      propsRef.current.onTouchStart(makeTouchStartEvent());
      jest.advanceTimersByTime(700);
      // No onTouchEnd: the menu swallowed it.
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      propsRef.current.onTouchStart(makeTouchStartEvent());
      jest.advanceTimersByTime(700);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('releases the context lock when the touch is cancelled', () => {
    const context = 'cancel-context-test';
    const firstCallback: () => void = jest.fn();
    const secondCallback: () => void = jest.fn();
    const firstPropsRef = renderLongTouchTester(firstCallback, { context });
    const secondPropsRef = renderLongTouchTester(secondCallback, { context });

    act(() => {
      firstPropsRef.current.onTouchStart(makeTouchStartEvent());
      jest.advanceTimersByTime(100);
      firstPropsRef.current.onTouchCancel(makeTouchEndEvent());
    });
    expect(firstCallback).not.toHaveBeenCalled();

    act(() => {
      secondPropsRef.current.onTouchStart(makeTouchStartEvent());
      jest.advanceTimersByTime(700);
    });
    expect(secondCallback).toHaveBeenCalled();
  });
});
