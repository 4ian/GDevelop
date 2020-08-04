// @flow
import * as React from 'react';
import isDialogOpen from '../UI/OpenedDialogChecker';
import { isMacLike } from '../Utils/Platform';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';

/**
 * Creates a keyboard shortcut string from a keyboard event object
 * Returns null if event does not correspond to valid shortcut press
 */
export const getShortcutStringFromEvent = (e: KeyboardEvent): ?string => {
  // Check if action key is alphabet, number, Function row key, +, -, = or Tab
  let isValidActionKey = false;
  if (e.code >= 'KeyA' && e.code <= 'KeyZ') isValidActionKey = true;
  if (e.code >= 'Digit0' && e.code <= 'Digit9') isValidActionKey = true;
  if (
    (e.code >= 'F1' && e.code <= 'F9') ||
    (e.code >= 'F10' && e.code <= 'F12')
  )
    isValidActionKey = true;
  if (
    e.code === 'NumpadAdd' ||
    e.code === 'NumpadSubtract' ||
    e.code === 'Equal' ||
    e.code === 'Minus' ||
    e.code === 'Tab'
  )
    isValidActionKey = true;
  if (!isValidActionKey) return;

  const shortcutStringPieces = [];
  if (e.ctrlKey || e.metaKey) shortcutStringPieces.push('CmdOrCtrl');
  if (e.shiftKey) shortcutStringPieces.push('Shift');
  if (e.altKey) shortcutStringPieces.push('Alt');
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
        console.log('Detected shortcut for', commandName);
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
  // Alphabet key ("KeyA"..."KeyZ")
  if (code.includes('Key')) return code.slice(3);
  // Numeric key ("0"..."9")
  if (code >= '0' && code <= '9') return code;
  // Function row key ("F1"..."F12")
  if (code.includes('F')) return code;
  // Numpad plus, minus
  if (code === 'NumpadAdd') return 'Plus';
  if (code === 'NumpadSubtract') return 'Minus';
  // Equals sign ("Equal"), Tab key ("Tab") and others
  return code;
};

/**
 * Parses shortcut string into array of platform-specific key strings
 */
export const parseShortcutIntoKeys = (shortcutString: string) => {
  return shortcutString.split('+').map<string>(keyCode => {
    if (keyCode === 'CmdOrCtrl') return isMacLike() ? 'Cmd' : 'Ctrl';
    if (keyCode === 'Shift' || keyCode === 'Alt') return keyCode;
    return getKeyDisplayName(keyCode);
  });
};
