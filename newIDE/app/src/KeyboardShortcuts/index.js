// @flow
import * as React from 'react';
import isDialogOpen from '../UI/OpenedDialogChecker';
import { isMacLike } from '../Utils/Platform';
import reservedShortcuts from './ReservedShortcuts';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import commandsList, { type CommandName } from '../CommandPalette/CommandsList';
import isUserTyping from './IsUserTyping';
import optionalRequire from '../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');

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
  if (keyType === 'other') {
    // Tab and Space may clash with keyboard navigation - Ctrl or Alt required
    if (!ctrlOrCmdPressed && !altPressed) return;
  }

  const shortcutStringPieces = [];
  if (ctrlOrCmdPressed) shortcutStringPieces.push('CmdOrCtrl');
  if (shiftPressed) shortcutStringPieces.push('Shift');
  if (altPressed) shortcutStringPieces.push('Alt');
  shortcutStringPieces.push(e.code);
  const shortcutString = shortcutStringPieces.join('+');

  // Check if shortcut string is reserved
  if (reservedShortcuts.includes(shortcutString)) return;

  return shortcutString;
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
        // Get shortcut string and corresponding command name from event
        const shortcutString = getShortcutStringFromEvent(e);
        const commandName = Object.keys(shortcutMap).find(
          name => shortcutMap[name] === shortcutString
        );
        if (!commandName) return;

        // On desktop app, ignore shortcuts that are handled by Electron
        if (electron && commandsList[commandName].handledByElectron) return;

        // e.preventDefault tends to block user from typing,
        // so do it only if user is not typing.
        if (isUserTyping()) return;
        e.preventDefault();

        // Discard shortcut presses if a dialog is open
        if (isDialogOpen()) return;

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

/**
 * Takes key code and returns Electron string for the key
 */
const getElectronKeyString = (code: string) => {
  const keyType = getKeyTypeFromCode(code);
  if (keyType === 'alphabet') return code.slice(3);
  if (keyType === 'number') return code.slice(5);
  if (keyType === 'fn-row') return code;
  if (keyType === 'numpad-arith')
    return code === 'NumpadAdd' ? 'numadd' : 'numsub';
  if (keyType === 'numrow-arith') return code === 'Minus' ? '-' : '=';
  return code; // Tab, Space
};

/**
 * Converts given shortcut string into an Electron accelerator string
 */
export const getElectronAccelerator = (shortcutString: string) => {
  return shortcutString
    .split('+')
    .map<string>(keyCode => {
      if (keyCode === 'CmdOrCtrl') return 'CmdOrCtrl';
      if (keyCode === 'Shift' || keyCode === 'Alt') return keyCode;
      return getElectronKeyString(keyCode);
    })
    .join('+');
};
