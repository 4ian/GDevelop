// @flow
import * as React from 'react';
import isDialogOpen from '../../UI/OpenedDialogChecker';
import defaultShortcuts from './DefaultShortcuts';

/**
 * Creates a keyboard shortcut string from a keyboard event object
 * Returns null if event does not correspond to valid shortcut press
 */
const getShortcutStringFromEvent = (e: KeyboardEvent): ?string => {
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
  if (!isValidActionKey) return console.log('Invalid shortcut');

  const shortcutStringPieces = [];
  if (e.ctrlKey || e.metaKey) shortcutStringPieces.push('CmdOrCtrl');
  if (e.shiftKey) shortcutStringPieces.push('Shift');
  if (e.altKey) shortcutStringPieces.push('Alt');
  shortcutStringPieces.push(e.code);
  console.log('SHORTCUT PRESSED:', shortcutStringPieces.join('+'));
  return shortcutStringPieces.join('+');
};

/**
 * Listens for keyboard shortcuts and launches
 * callback with corresponding command
 */
export const useKeyboardShortcuts = (onRunCommand: string => void) => {
  React.useEffect(
    () => {
      console.log('KEYBOARD SHORTCUT HOOK RUN!');
      const handler = (e: KeyboardEvent) => {
        // Disable shortcuts when a dialog or overlay is open
        if (isDialogOpen()) return;
        // Convert event object to shortcut string
        const shortcutString = getShortcutStringFromEvent(e);
        // Get corresponding command name and run callback
        const commandName = Object.keys(defaultShortcuts).find(
          name => defaultShortcuts[name] === shortcutString
        );
        if (!commandName) return;
        e.preventDefault();
        console.log('Detected shortcut for', commandName);
        onRunCommand(commandName);
      };

      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    },
    [onRunCommand]
  );
};
