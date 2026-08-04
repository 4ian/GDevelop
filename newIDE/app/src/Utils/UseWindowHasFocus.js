// @flow
import * as React from 'react';

const getWindowHasFocus = (targetWindow: any): boolean => {
  try {
    return targetWindow.document.hasFocus();
  } catch (error) {
    // The window may already be closed or otherwise inaccessible.
    return false;
  }
};

/**
 * Track whether the given window currently has OS/browser focus.
 *
 * Used so editor-scoped commands (shortcuts like Shift+A) are only published
 * from the focused window when multiple windows are open (popped-out editors).
 */
const useWindowHasFocus = (targetWindow: ?any): boolean => {
  const [hasFocus, setHasFocus] = React.useState(() =>
    targetWindow ? getWindowHasFocus(targetWindow) : false
  );

  React.useEffect(
    () => {
      if (!targetWindow) {
        setHasFocus(false);
        return undefined;
      }

      const onFocus = () => setHasFocus(true);
      const onBlur = () => setHasFocus(false);

      // Sync immediately: focus may have changed between render and effect.
      setHasFocus(getWindowHasFocus(targetWindow));

      targetWindow.addEventListener('focus', onFocus);
      targetWindow.addEventListener('blur', onBlur);
      return () => {
        targetWindow.removeEventListener('focus', onFocus);
        targetWindow.removeEventListener('blur', onBlur);
      };
    },
    [targetWindow]
  );

  return hasFocus;
};

export default useWindowHasFocus;
