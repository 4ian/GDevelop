// @flow
import * as React from 'react';
import isDialogOpen from '../UI/OpenedDialogChecker';

// Values of `e.key` for modifier keys
const MODIFIER_KEYS = ['Control', 'Shift', 'Meta', 'Alt'];

/**
 * Creates a keyboard shortcut string from a keyboard event object
 */
const getShortcutStringFromEvent = (e: SyntheticKeyboardEvent<>): ?string => {
  // If the key pressed is a modifier key, exit
  if (MODIFIER_KEYS.includes(e.key)) return null;

  const shortcutStringPieces = [];
  if (e.ctrlKey || e.metaKey) shortcutStringPieces.push('CmdOrCtrl');
  if (e.shiftKey) shortcutStringPieces.push('Shift');
  if (e.altKey) shortcutStringPieces.push('Alt');
  shortcutStringPieces.push(e.key.toUpperCase());
  return shortcutStringPieces.join('+');
};

const defaultShortcuts = {
  LAUNCH_PREVIEW: 'F5',
  LAUNCH_DEBUG_PREVIEW: 'CmdOrCtrl+F5',
  EDIT_OBJECT: 'CmdOrCtrl+Shift+O',
};

/**
 * Listens for keyboard shortcuts and launches
 * callback with corresponding command
 */
export const useKeyboardShortcuts = (onRunCommand: string => void) => {
  React.useEffect(() => {
    const handler = (e: SyntheticKeyboardEvent<>) => {
      e.preventDefault();
      // Disable shortcuts when a dialog or overlay is open
      if (isDialogOpen()) return;
      const shortcutString = getShortcutStringFromEvent(e);
      shortcutString && console.log(shortcutString);
      // Get corresponding command and run callback
      const commandName = Object.keys(defaultShortcuts).find(
        name => defaultShortcuts[name] === shortcutString
      );
      if (!commandName) return;
      console.log('Detected shortcut for', commandName);
      onRunCommand(commandName);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });
};
