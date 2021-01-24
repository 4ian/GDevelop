// @flow
import {
  getShortcutStringFromEvent,
  isValidShortcutEvent,
  getElectronAccelerator,
} from './index';

/**
 * Creates a KeyboardEvent-like object for testing
 * functions that take event objects as input
 */
const makeKeyEvent = (ctrlKey, shiftKey, altKey, code): KeyboardEvent => {
  // $FlowIgnore - create fake KeyboardEvent object
  return { ctrlKey, shiftKey, altKey, code };
};

// Action key, with various modifiers
const keyA = makeKeyEvent(false, false, false, 'KeyA'); // A
const ctrlA = makeKeyEvent(true, false, false, 'KeyA'); // Ctrl+A
const shiftA = makeKeyEvent(false, true, false, 'KeyA'); // Shift+A
const altA = makeKeyEvent(false, false, true, 'KeyA'); // Alt+A
const ctrlShiftAltA = makeKeyEvent(true, true, true, 'KeyA'); // Ctrl+Shift+Alt+A

// Partial or invalid shortcut keypresses
const ctrlShiftAlt = makeKeyEvent(true, true, true, ''); // Ctrl+Shift+Alt+
const ctrlShiftAltUp = makeKeyEvent(true, true, true, 'ArrowUp'); // Ctrl+Shift+Alt+Up

// Edge cases of restricted shortcuts
const keyTab = makeKeyEvent(false, false, false, 'Tab'); // Tab
const shiftTab = makeKeyEvent(false, true, false, 'Tab'); // Shift+Tab
const ctrlTab = makeKeyEvent(true, false, false, 'Tab'); // Ctrl+Tab
const altTab = makeKeyEvent(false, false, true, 'Tab'); // Alt+Tab
const keySpace = makeKeyEvent(false, false, false, 'Space'); // Space
const shiftSpace = makeKeyEvent(false, true, false, 'Space'); // Shift+Space
const ctrlSpace = makeKeyEvent(true, false, false, 'Space'); // Ctrl+Space
const altSpace = makeKeyEvent(false, false, true, 'Space'); // Alt+Space

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
