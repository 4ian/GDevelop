// @flow
import * as React from 'react';

export type ScreenType = 'normal' | 'touch';

let userHasTouchedScreen = false;
let userHasMovedMouse = false;

if (typeof window !== 'undefined') {
  window.addEventListener(
    'touchstart',
    function onFirstTouch() {
      console.info('Touch detected, considering the screen as touch enabled.');
      userHasTouchedScreen = true;
      window.removeEventListener('touchstart', onFirstTouch, false);
    },
    false
  );

  // An event listener is added (and then removed at the first event triggering) and
  // will determine if the user is on a device that uses a mouse.
  // If the first pointermove event is not triggered by a mouse move, the device
  // will never be considered as mouse-enabled.
  // Note: mousemove cannot be used since browsers emulate the mouse movement when
  // the screen is touched.
  window.addEventListener(
    'pointermove',
    function onPointerMove(event: PointerEvent) {
      console.info('Pointer move detected.');
      if (event.pointerType === 'mouse') {
        console.info(
          'Pointer type is mouse, considering the device is a desktop/laptop computer.'
        );
        userHasMovedMouse = true;
      }
      window.removeEventListener('pointermove', onPointerMove, false);
    },
    false
  );
}

type Props = {|
  children: (screenType: ScreenType) => React.Node,
|};

/**
 * Wraps useScreenType in a component.
 */
export const ScreenTypeMeasurer = ({ children }: Props) =>
  children(useScreenType());

/**
 * Return if the screen is a touchscreen or not.
 */
export const useScreenType = (): ScreenType => {
  // Note: this is not a React hook but is named as one to encourage
  // components to use it as such, so that it could be reworked
  // at some point to use a context (verify in this case all usages).
  if (typeof window === 'undefined') return 'normal';

  return userHasTouchedScreen ? 'touch' : 'normal';
};

export const useShouldAutofocusInput = (): boolean => {
  const isTouchscreen = useScreenType() === 'touch';
  // Whatever size the screen is, if a touch event has been detected, no autofocus should
  // be triggered (that would annoyingly open the keyboard) unless a mouse move has been
  // detected (in that case, the device should be a touch-enabled desktop/laptop computer).
  return !(isTouchscreen && !userHasMovedMouse);
};
