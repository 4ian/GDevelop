// @flow
import * as React from 'react';
import isDialogOpen from '../UI/OpenedDialogChecker';
import { isMacLike } from '../Utils/Platform';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';

// Valid action keys
type KeyType =
  | 'alphabet' // A-Z
  | 'number' // Numrow 0-9
  | 'fn-row' // F1-F12
  | 'numpad-arith' // Numpad+, Numpad-
  | 'numrow-arith' // Numrow-, Numrow=
  | 'other'; // Tab, Space

/**
 * Given a key code, gives the associated KeyType.
 * Returns null if the key code can't be categorised.
 */
const getKeyTypeFromCode = (code: string): KeyType | null => {
  if (code.indexOf('Key') === 0) return 'alphabet';
  if (code.indexOf('Digit') === 0) return 'number';
  if (code.indexOf('F') === 0) return 'fn-row'; // Improve this
  if (code === 'NumpadAdd' || code === 'NumpadSubtract') return 'numpad-arith';
  if (code === 'Equal' || code === 'Minus') return 'numrow-arith';
  if (code === 'Tab' || code === 'Space') return 'other';
  return null;
};

/**
 * Creates a keyboard shortcut string from a keyboard event object
 * Returns null if event does not correspond to valid shortcut press
 */
export const getShortcutStringFromEvent = (e: KeyboardEvent): ?string => {
  // Check if action key is a shortcut supported key
  const keyType = getKeyTypeFromCode(e.code);
  if (!keyType) return;

  const ctrlOrCmdPressed = e.ctrlKey || e.metaKey;
  const shiftPressed = e.shiftKey;
  const altPressed = e.altKey;

  // Check keytype-specific restrictions
  if (
    keyType === 'alphabet' ||
    keyType === 'number' ||
    keyType === 'numrow-arith' ||
    keyType === 'other'
  ) {
    // Ctrl or Alt modifier is required, otherwise may clash with text entry
    if (!ctrlOrCmdPressed && !altPressed) return;
  } else if (keyType === 'numpad-arith') {
    // A modifier key is required, otherwise clashes with zoom shortcuts
    if (!ctrlOrCmdPressed && !altPressed && !shiftPressed) return;
  }

  const shortcutStringPieces = [];
  if (ctrlOrCmdPressed) shortcutStringPieces.push('CmdOrCtrl');
  if (shiftPressed) shortcutStringPieces.push('Shift');
  if (altPressed) shortcutStringPieces.push('Alt');
  shortcutStringPieces.push(e.code);
  return shortcutStringPieces.join('+');
};

/**
 * Listens for keyboard shortcuts and launches
 * callback with corresponding command
 */
export const useKeyboardShortcuts = (onRunCommand: string => void) => {
  const preferences = React.useContext(PreferencesContext);
  const shortcutMap = preferences.values.shortcutMap;

  React.useEffect(
    () => {
      const handler = (e: KeyboardEvent) => {
        // Disable shortcuts when a dialog or overlay is open
        if (isDialogOpen()) return;
        // Convert event object to shortcut string
        const shortcutString = getShortcutStringFromEvent(e);
        // Get corresponding command name and run callback
        const commandName = Object.keys(shortcutMap).find(
          name => shortcutMap[name] === shortcutString
        );
        if (!commandName) return;
        e.preventDefault();
        onRunCommand(commandName);
      };

      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    },
    [onRunCommand, shortcutMap]
  );
};

/**
 * Converts an action key's e.code value to user-friendly string
 * For example, "KeyA" -> "A", "NumpadAdd" -> "Plus"
 */
const getKeyDisplayName = (code: string) => {
  const keyType = getKeyTypeFromCode(code);
  if (keyType === 'alphabet') return code.slice(3);
  if (keyType === 'number') return code.slice(5);
  if (keyType === 'fn-row') return code;
  if (keyType === 'numpad-arith') return code === 'NumpadAdd' ? 'Num+' : 'Num-';
  if (keyType === 'numrow-arith') return code === 'Minus' ? '-' : '=';
  return code; // Tab, Space
};

/**
 * Parses shortcut string into array of platform-specific key strings
 */
export const getShortcutDisplayName = (shortcutString: string) => {
  return shortcutString
    .split('+')
    .map<string>(keyCode => {
      if (keyCode === 'CmdOrCtrl') return isMacLike() ? 'Cmd' : 'Ctrl';
      if (keyCode === 'Shift' || keyCode === 'Alt') return keyCode;
      return getKeyDisplayName(keyCode);
    })
    .join(' + ');
};
