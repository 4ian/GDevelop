// @flow
import { isMacLike, isMobile } from '../Utils/Platform';

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
      .replace(/Backspace/, '⌫');
  } else {
    return accelerator
      .replace(/CmdOrCtrl\+/, 'Ctrl+')
      .replace(/CommandOrControl\+/, 'Ctrl+')
      .replace(/Super\+/, 'Win+')
      .replace(/Option\+/, 'Alt+')
      .replace(/Delete/, 'DEL');
  }
};
