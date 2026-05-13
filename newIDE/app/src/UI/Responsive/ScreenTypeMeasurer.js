// @flow
import * as React from 'react';

export type ScreenType = 'normal' | 'touch';

// Module-level state shared across all hook instances.
// A single pointerdown listener detects the current input type and only
// notifies subscribers when the type actually changes (touch ↔ mouse/pen).
let _screenType: ScreenType = 'normal';
const _listeners: Set<(type: ScreenType) => void> = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', (event: PointerEvent) => {
    const newType: ScreenType =
      event.pointerType === 'touch' ? 'touch' : 'normal';
    if (newType === _screenType) return;
    console.info(
      `Screen type changed from "${_screenType}" to "${newType}" (pointerType: "${
        event.pointerType
      }").`
    );
    _screenType = newType;
    _listeners.forEach(fn => fn(newType));
  });
}

type Props = {|
  children: (screenType: ScreenType) => React.Node,
|};

/**
 * Wraps useScreenType in a component.
 */
export const ScreenTypeMeasurer = ({ children }: Props): React.Node =>
  children(useScreenType());

/**
 * Returns whether the screen is currently being used as a touchscreen or not.
 * Dynamically switches when the user alternates between touch and mouse/pen,
 * so hybrid devices (e.g. Windows touchscreen laptops) are handled correctly.
 */
export const useScreenType = (): ScreenType => {
  const [screenType, setScreenType] = React.useState<ScreenType>(_screenType);

  React.useEffect(() => {
    // setScreenType is stable across renders, safe to store in the Set.
    _listeners.add(setScreenType);
    return () => {
      _listeners.delete(setScreenType);
    };
  }, []);

  return screenType;
};

/**
 * Returns true if inputs should be auto-focused.
 * No autofocus when the last interaction was touch, to avoid opening the
 * on-screen keyboard unexpectedly.
 */
export const useShouldAutofocusInput = (): boolean =>
  useScreenType() !== 'touch';
