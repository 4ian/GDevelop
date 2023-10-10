// @flow
import {
  getShortcutStringFromEvent,
  isValidShortcutEvent,
  getElectronAccelerator,
  getShortcutDisplayName,
} from './index';

/**
 * Creates a KeyboardEvent-like object for testing
 * functions that take event objects as input
 */
const makeKeyEvent = (
  ctrlKey,
  shiftKey,
  altKey,
  code,
  which
): KeyboardEvent => {
  // $FlowIgnore - create fake KeyboardEvent object
  return { ctrlKey, shiftKey, altKey, code, which };
};

// Action key, with various modifiers, when code corresponds to key
const keyA = makeKeyEvent(false, false, false, 'KeyA', 65); // A
const ctrlA = makeKeyEvent(true, false, false, 'KeyA', 65); // Ctrl+A
const shiftA = makeKeyEvent(false, true, false, 'KeyA', 65); // Shift+A
const altA = makeKeyEvent(false, false, true, 'KeyA', 65); // Alt+A
const ctrlShiftAltA = makeKeyEvent(true, true, true, 'KeyA', 65); // Ctrl+Shift+Alt+A

// Action key, with various modifiers, when code does not correspond to key (m key on Azerty that is ; on Qwerty)
const keyM = makeKeyEvent(false, false, false, 'Semicolon', 77); // M
const ctrlM = makeKeyEvent(true, false, false, 'Semicolon', 77); // Ctrl+M
const shiftM = makeKeyEvent(false, true, false, 'Semicolon', 77); // Shift+M
const altM = makeKeyEvent(false, false, true, 'Semicolon', 77); // Alt+M
const ctrlShiftAltM = makeKeyEvent(true, true, true, 'Semicolon', 77); // Ctrl+Shift+Alt+M

// Action key, with various modifiers, when code does not correspond to key (, key on Azerty that is M on Qwerty)
const keyComma = makeKeyEvent(false, false, false, 'KeyM', 188); // ,
const ctrlComma = makeKeyEvent(true, false, false, 'KeyM', 188); // Ctrl+,
// TODO: Find a way to handle using Question mark in azerty.
// const shiftComma = makeKeyEvent(false, true, false, 'KeyM', 191); // Shift+, (Question mark?)
const altComma = makeKeyEvent(false, false, true, 'KeyM', 188); // Alt+,
const ctrlShiftAltComma = makeKeyEvent(true, true, true, 'KeyM', 188); // Ctrl+Shift+Alt+,

// Partial or invalid shortcut keypresses
const ctrlShiftAlt = makeKeyEvent(true, true, true, '', ''); // Ctrl+Shift+Alt+
const ctrlShiftAltUp = makeKeyEvent(true, true, true, 'ArrowUp', 'ArrowUp'); // Ctrl+Shift+Alt+Up

// Edge cases of restricted shortcuts
const keyTab = makeKeyEvent(false, false, false, 'Tab', 'Tab'); // Tab
const shiftTab = makeKeyEvent(false, true, false, 'Tab', 'Tab'); // Shift+Tab
const ctrlTab = makeKeyEvent(true, false, false, 'Tab', 'Tab'); // Ctrl+Tab
const altTab = makeKeyEvent(false, false, true, 'Tab', 'Tab'); // Alt+Tab
const keySpace = makeKeyEvent(false, false, false, 'Space', ' '); // Space
const shiftSpace = makeKeyEvent(false, true, false, 'Space', ' '); // Shift+Space
const ctrlSpace = makeKeyEvent(true, false, false, 'Space', ' '); // Ctrl+Space
const altSpace = makeKeyEvent(false, false, true, 'Space', ' '); // Alt+Space

describe('KeyboardShortcuts', () => {
  it('creates shortcut strings from events correctly', () => {
    // Action key, with modifiers
    expect(getShortcutStringFromEvent(keyA)).toBe('KeyA');
    expect(getShortcutStringFromEvent(ctrlA)).toBe('CmdOrCtrl+KeyA');
    expect(getShortcutStringFromEvent(shiftA)).toBe('Shift+KeyA');
    expect(getShortcutStringFromEvent(altA)).toBe('Alt+KeyA');
    expect(getShortcutStringFromEvent(ctrlShiftAltA)).toBe(
      'CmdOrCtrl+Shift+Alt+KeyA'
    );
    expect(getShortcutDisplayName(getShortcutStringFromEvent(keyA))).toBe('A');
    expect(getShortcutDisplayName(getShortcutStringFromEvent(ctrlA))).toBe(
      'Ctrl + A'
    );
    expect(getShortcutDisplayName(getShortcutStringFromEvent(shiftA))).toBe(
      'Shift + A'
    );
    expect(getShortcutDisplayName(getShortcutStringFromEvent(altA))).toBe(
      'Alt + A'
    );
    expect(
      getShortcutDisplayName(getShortcutStringFromEvent(ctrlShiftAltA))
    ).toBe('Ctrl + Shift + Alt + A');

    expect(getShortcutStringFromEvent(keyM)).toBe('KeyM');
    expect(getShortcutStringFromEvent(ctrlM)).toBe('CmdOrCtrl+KeyM');
    expect(getShortcutStringFromEvent(shiftM)).toBe('Shift+KeyM');
    expect(getShortcutStringFromEvent(altM)).toBe('Alt+KeyM');
    expect(getShortcutStringFromEvent(ctrlShiftAltM)).toBe(
      'CmdOrCtrl+Shift+Alt+KeyM'
    );
    expect(getShortcutDisplayName(getShortcutStringFromEvent(keyM))).toBe('M');
    expect(getShortcutDisplayName(getShortcutStringFromEvent(ctrlM))).toBe(
      'Ctrl + M'
    );
    expect(getShortcutDisplayName(getShortcutStringFromEvent(shiftM))).toBe(
      'Shift + M'
    );
    expect(getShortcutDisplayName(getShortcutStringFromEvent(altM))).toBe(
      'Alt + M'
    );
    expect(
      getShortcutDisplayName(getShortcutStringFromEvent(ctrlShiftAltM))
    ).toBe('Ctrl + Shift + Alt + M');

    expect(getShortcutStringFromEvent(keyComma)).toBe('Comma');
    expect(getShortcutStringFromEvent(ctrlComma)).toBe('CmdOrCtrl+Comma');
    // TODO: Find a way to handle using Question mark in azerty.
    // expect(getShortcutStringFromEvent(shiftComma)).toBe('Shift+Comma');
    expect(getShortcutStringFromEvent(altComma)).toBe('Alt+Comma');
    expect(getShortcutStringFromEvent(ctrlShiftAltComma)).toBe(
      'CmdOrCtrl+Shift+Alt+Comma'
    );
    expect(getShortcutDisplayName(getShortcutStringFromEvent(keyComma))).toBe(
      ','
    );
    expect(getShortcutDisplayName(getShortcutStringFromEvent(ctrlComma))).toBe(
      'Ctrl + ,'
    );
    // TODO: Find a way to handle using Question mark in azerty.
    // expect(getShortcutDisplayName(getShortcutStringFromEvent(shiftComma))).toBe('Shift + ,');
    expect(getShortcutDisplayName(getShortcutStringFromEvent(altComma))).toBe(
      'Alt + ,'
    );
    expect(
      getShortcutDisplayName(getShortcutStringFromEvent(ctrlShiftAltComma))
    ).toBe('Ctrl + Shift + Alt + ,');

    // Partial or incorrect shortcut keypresses
    expect(getShortcutStringFromEvent(ctrlShiftAlt)).toBe(
      'CmdOrCtrl+Shift+Alt+'
    );
    expect(getShortcutStringFromEvent(ctrlShiftAltUp)).toBe(
      'CmdOrCtrl+Shift+Alt+'
    );
  });

  it('validates shortcut presses correctly', () => {
    // Action key, with modifiers
    expect(isValidShortcutEvent(keyA)).toBe(true);
    expect(isValidShortcutEvent(ctrlA)).toBe(true);
    expect(isValidShortcutEvent(shiftA)).toBe(true);
    expect(isValidShortcutEvent(altA)).toBe(true);
    expect(isValidShortcutEvent(ctrlShiftAltA)).toBe(true);

    // Invalid shortcut keypresses...
    expect(isValidShortcutEvent(keyTab)).toBe(false);
    expect(isValidShortcutEvent(keySpace)).toBe(false);
    expect(isValidShortcutEvent(shiftTab)).toBe(false);
    expect(isValidShortcutEvent(shiftSpace)).toBe(false);
    // .. and valid edge cases
    expect(isValidShortcutEvent(ctrlTab)).toBe(true);
    expect(isValidShortcutEvent(altTab)).toBe(true);
    expect(isValidShortcutEvent(ctrlSpace)).toBe(true);
    expect(isValidShortcutEvent(altSpace)).toBe(true);
  });

  it('converts shortcut strings to Electron accelerators correctly', () => {
    // Conversion of action keys...
    expect(getElectronAccelerator('KeyA')).toBe('A');
    expect(getElectronAccelerator('KeyZ')).toBe('Z');
    expect(getElectronAccelerator('Digit0')).toBe('0');
    expect(getElectronAccelerator('Digit9')).toBe('9');
    expect(getElectronAccelerator('F1')).toBe('F1');
    expect(getElectronAccelerator('F9')).toBe('F9');
    expect(getElectronAccelerator('F12')).toBe('F12');
    expect(getElectronAccelerator('NumpadAdd')).toBe('numadd');
    expect(getElectronAccelerator('NumpadSubtract')).toBe('numsub');
    expect(getElectronAccelerator('Minus')).toBe('-');
    expect(getElectronAccelerator('Equal')).toBe('=');
    expect(getElectronAccelerator('Tab')).toBe('Tab');
    expect(getElectronAccelerator('Space')).toBe('Space');

    // ... and modifier keys
    expect(getElectronAccelerator('CmdOrCtrl+Shift+Alt+KeyA')).toBe(
      'CmdOrCtrl+Shift+Alt+A'
    );
  });
});
