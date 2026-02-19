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
  // $FlowFixMe[missing-local-annot]
  ctrlKey,
  // $FlowFixMe[missing-local-annot]
  shiftKey,
  // $FlowFixMe[missing-local-annot]
  altKey,
  // $FlowFixMe[missing-local-annot]
  code,
  // $FlowFixMe[missing-local-annot]
  keyCode
): KeyboardEvent => {
  // $FlowIgnore - create fake KeyboardEvent object
  // $FlowFixMe[incompatible-type]
  return { ctrlKey, shiftKey, altKey, code, keyCode };
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
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(keyA)).toBe('KeyA');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(ctrlA)).toBe('CmdOrCtrl+KeyA');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(shiftA)).toBe('Shift+KeyA');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(altA)).toBe('Alt+KeyA');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(ctrlShiftAltA)).toBe(
      'CmdOrCtrl+Shift+Alt+KeyA'
    );
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutDisplayName(getShortcutStringFromEvent(keyA))).toBe('A');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutDisplayName(getShortcutStringFromEvent(ctrlA))).toBe(
      'Ctrl + A'
    );
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutDisplayName(getShortcutStringFromEvent(shiftA))).toBe(
      'Shift + A'
    );
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutDisplayName(getShortcutStringFromEvent(altA))).toBe(
      'Alt + A'
    );
    expect(
      // $FlowFixMe[incompatible-exact]
      getShortcutDisplayName(getShortcutStringFromEvent(ctrlShiftAltA))
    ).toBe('Ctrl + Shift + Alt + A');

    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(keyM)).toBe('KeyM');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(ctrlM)).toBe('CmdOrCtrl+KeyM');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(shiftM)).toBe('Shift+KeyM');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(altM)).toBe('Alt+KeyM');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(ctrlShiftAltM)).toBe(
      'CmdOrCtrl+Shift+Alt+KeyM'
    );
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutDisplayName(getShortcutStringFromEvent(keyM))).toBe('M');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutDisplayName(getShortcutStringFromEvent(ctrlM))).toBe(
      'Ctrl + M'
    );
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutDisplayName(getShortcutStringFromEvent(shiftM))).toBe(
      'Shift + M'
    );
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutDisplayName(getShortcutStringFromEvent(altM))).toBe(
      'Alt + M'
    );
    expect(
      // $FlowFixMe[incompatible-exact]
      getShortcutDisplayName(getShortcutStringFromEvent(ctrlShiftAltM))
    ).toBe('Ctrl + Shift + Alt + M');

    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(keyComma)).toBe('Comma');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(ctrlComma)).toBe('CmdOrCtrl+Comma');
    // TODO: Find a way to handle using Question mark in azerty.
    // expect(getShortcutStringFromEvent(shiftComma)).toBe('Shift+Comma');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(altComma)).toBe('Alt+Comma');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(ctrlShiftAltComma)).toBe(
      'CmdOrCtrl+Shift+Alt+Comma'
    );
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutDisplayName(getShortcutStringFromEvent(keyComma))).toBe(
      ','
    );
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutDisplayName(getShortcutStringFromEvent(ctrlComma))).toBe(
      'Ctrl + ,'
    );
    // TODO: Find a way to handle using Question mark in azerty.
    // expect(getShortcutDisplayName(getShortcutStringFromEvent(shiftComma))).toBe('Shift + ,');
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutDisplayName(getShortcutStringFromEvent(altComma))).toBe(
      'Alt + ,'
    );
    expect(
      // $FlowFixMe[incompatible-exact]
      getShortcutDisplayName(getShortcutStringFromEvent(ctrlShiftAltComma))
    ).toBe('Ctrl + Shift + Alt + ,');

    // Partial or incorrect shortcut keypresses
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(ctrlShiftAlt)).toBe(
      'CmdOrCtrl+Shift+Alt+'
    );
    // $FlowFixMe[incompatible-exact]
    expect(getShortcutStringFromEvent(ctrlShiftAltUp)).toBe(
      'CmdOrCtrl+Shift+Alt+'
    );
  });

  it('validates shortcut presses correctly', () => {
    // Action key, with modifiers
    // $FlowFixMe[incompatible-exact]
    expect(isValidShortcutEvent(keyA)).toBe(true);
    // $FlowFixMe[incompatible-exact]
    expect(isValidShortcutEvent(ctrlA)).toBe(true);
    // $FlowFixMe[incompatible-exact]
    expect(isValidShortcutEvent(shiftA)).toBe(true);
    // $FlowFixMe[incompatible-exact]
    expect(isValidShortcutEvent(altA)).toBe(true);
    // $FlowFixMe[incompatible-exact]
    expect(isValidShortcutEvent(ctrlShiftAltA)).toBe(true);

    // Invalid shortcut keypresses...
    // $FlowFixMe[incompatible-exact]
    expect(isValidShortcutEvent(keyTab)).toBe(false);
    // $FlowFixMe[incompatible-exact]
    expect(isValidShortcutEvent(keySpace)).toBe(false);
    // $FlowFixMe[incompatible-exact]
    expect(isValidShortcutEvent(shiftTab)).toBe(false);
    // $FlowFixMe[incompatible-exact]
    expect(isValidShortcutEvent(shiftSpace)).toBe(false);
    // .. and valid edge cases
    // $FlowFixMe[incompatible-exact]
    expect(isValidShortcutEvent(ctrlTab)).toBe(true);
    // $FlowFixMe[incompatible-exact]
    expect(isValidShortcutEvent(altTab)).toBe(true);
    // $FlowFixMe[incompatible-exact]
    expect(isValidShortcutEvent(ctrlSpace)).toBe(true);
    // $FlowFixMe[incompatible-exact]
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
