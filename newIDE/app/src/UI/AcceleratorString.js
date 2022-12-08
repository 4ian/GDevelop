// @flow
import { isMacLike, isMobile } from '../Utils/Platform';

/**
 * Transform a Electron-like accelerator string (https://www.electronjs.org/docs/latest/api/accelerator)
 * so that it's user friendly.
 */
export const adaptAcceleratorString = (accelerator: string): string => {
  if (isMobile()) {
    return ''; // Do not display accelerators on mobile devices
  } else if (isMacLike()) {
    return accelerator
      .replace(/CmdOrCtrl\+/, '⌘')
      .replace(/CommandOrControl\+/, '⌘')
      .replace(/Super\+/, '⌘')
      .replace(/Shift\+/, '⇧')
      .replace(/Alt\+/, '⌥')
      .replace(/Option\+/, '⌥')
      .replace(/Delete/, '⌦')
      .replace(/Backspace/, '⌫')
      .replace(/numadd/, '+')
      .replace(/numsub/, '-')
      .replace(/num1/, '1')
      .replace(/num2/, '2')
      .replace(/num3/, '3');
  } else {
    return accelerator
      .replace(/CmdOrCtrl\+/, 'Ctrl+')
      .replace(/CommandOrControl\+/, 'Ctrl+')
      .replace(/Super\+/, 'Win+')
      .replace(/Option\+/, 'Alt+')
      .replace(/Delete/, 'DEL')
      .replace(/numadd/, '+')
      .replace(/numsub/, '-')
      .replace(/num1/, '1')
      .replace(/num2/, '2')
      .replace(/num3/, '3');
  }
};
