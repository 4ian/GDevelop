// @flow
import * as React from 'react';
import isDialogOpen from '../UI/OpenedDialogChecker';
import { isMacLike } from '../Utils/Platform';
import reservedShortcuts from './ReservedShortcuts';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import commandsList, { type CommandName } from '../CommandPalette/CommandsList';
import isUserTyping from './IsUserTyping';
import defaultShortcuts, { type ShortcutMap } from './DefaultShortcuts';
import { type PreviewDebuggerServer } from '../ExportAndShare/PreviewLauncher.flow';
import optionalRequire from '../Utils/OptionalRequire';
import { SafeExtractor } from '../Utils/SafeExtractor';
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
 * Map deprecated (but still used in the runtime) key codes to their new "code"
 * as defined by browsers (and user friendly enough to be shown to the user
 * and used to store shortcuts as strings).
 */
const eventKeyCodeToCode = {
  // Digits
  '48': 'Digit0',
  '49': 'Digit1',
  '50': 'Digit2',
  '51': 'Digit3',
  '52': 'Digit4',
  '53': 'Digit5',
  '54': 'Digit6',
  '55': 'Digit7',
  '56': 'Digit8',
  '57': 'Digit9',

  // Letters
  '65': 'KeyA',
  '66': 'KeyB',
  '67': 'KeyC',
  '68': 'KeyD',
  '69': 'KeyE',
  '70': 'KeyF',
  '71': 'KeyG',
  '72': 'KeyH',
  '73': 'KeyI',
  '74': 'KeyJ',
  '75': 'KeyK',
  '76': 'KeyL',
  '77': 'KeyM',
  '78': 'KeyN',
  '79': 'KeyO',
  '80': 'KeyP',
  '81': 'KeyQ',
  '82': 'KeyR',
  '83': 'KeyS',
  '84': 'KeyT',
  '85': 'KeyU',
  '86': 'KeyV',
  '87': 'KeyW',
  '88': 'KeyX',
  '89': 'KeyY',
  '90': 'KeyZ',

  // Function keys
  '112': 'F1',
  '113': 'F2',
  '114': 'F3',
  '115': 'F4',
  '116': 'F5',
  '117': 'F6',
  '118': 'F7',
  '119': 'F8',
  '120': 'F9',
  '121': 'F10',
  '122': 'F11',
  '123': 'F12',

  // Punctuation and symbols
  '186': 'Semicolon',
  '187': 'Equal',
  '188': 'Comma',
  '189': 'Minus',
  '190': 'Period',
  '191': 'Slash',
  '192': 'Backquote',
  '219': 'BracketLeft',
  '220': 'Backslash',
  '221': 'BracketRight',
  '222': 'Quote',

  // Navigation and editing keys
  '8': 'Backspace',
  '9': 'Tab',
  '13': 'Enter',
  '16': 'Shift',
  '17': 'Control',
  '18': 'Alt',
  '20': 'CapsLock',
  '27': 'Escape',
  '32': 'Space',
  '33': 'PageUp',
  '34': 'PageDown',
  '35': 'End',
  '36': 'Home',
  '37': 'ArrowLeft',
  '38': 'ArrowUp',
  '39': 'ArrowRight',
  '40': 'ArrowDown',
  '45': 'Insert',
  '46': 'Delete',

  // Numpad
  '96': 'Numpad0',
  '97': 'Numpad1',
  '98': 'Numpad2',
  '99': 'Numpad3',
  '100': 'Numpad4',
  '101': 'Numpad5',
  '102': 'Numpad6',
  '103': 'Numpad7',
  '104': 'Numpad8',
  '105': 'Numpad9',
  '106': 'NumpadMultiply',
  '107': 'NumpadAdd',
  '109': 'NumpadSubtract',
  '110': 'NumpadDecimal',
  '111': 'NumpadDivide',

  // Other
  '91': 'MetaLeft',
  '92': 'MetaRight',
  '93': 'ContextMenu',
  '144': 'NumLock',
  '145': 'ScrollLock',
};

type KeyEventLike = {
  +keyCode?: number,
  +which?: any,
  +code?: string,
  +metaKey: boolean,
  +ctrlKey: boolean,
  +altKey: boolean,
  +shiftKey: boolean,
};

const getCodeFromEvent = (e: KeyEventLike): string => {
  if (
    typeof e.keyCode === 'number' &&
    e.keyCode.toString() in eventKeyCodeToCode
  )
    return eventKeyCodeToCode[e.keyCode.toString()];
  if (typeof e.which === 'number' && e.which.toString() in eventKeyCodeToCode)
    return eventKeyCodeToCode[e.which.toString()];

  if (e.code) return e.code;
  return '';
};

/**
 * Given a key code, gives the associated KeyType.
 * Returns null if the key code can't be categorised.
 */
const getKeyTypeFromCode = (code: string): KeyType | null => {
  if (!code) return null;
  if (code.indexOf('Key') === 0) return 'alphabet';
  if (code.indexOf('Digit') === 0) return 'number';
  if (code.indexOf('F') === 0) return 'fn-row';
  if (code === 'NumpadAdd' || code === 'NumpadSubtract') return 'numpad-arith';
  if (code === 'Equal' || code === 'Minus') return 'numrow-arith';
  if (code === 'Tab' || code === 'Space' || code === 'Comma') return 'other';
  return null;
};

/**
 * Returns possibly partial shortcut string corresponding to given event object
 */
export const getShortcutStringFromEvent = (e: KeyEventLike): string => {
  let shortcutString = '';
  if (e.ctrlKey || e.metaKey) shortcutString += 'CmdOrCtrl+';
  if (e.shiftKey) shortcutString += 'Shift+';
  if (e.altKey) shortcutString += 'Alt+';

  const code = getCodeFromEvent(e);
  const keyType = getKeyTypeFromCode(code);
  if (keyType) shortcutString += code;
  return shortcutString;
};

/**
 * Checks if the given event corresponds to a valid shortcut press.
 * Does not check if shortcut is reserved or not.
 */
export const isValidShortcutEvent = (e: KeyEventLike): boolean => {
  // Check if action key is a shortcut supported key
  const code = getCodeFromEvent(e);
  const keyType = getKeyTypeFromCode(code);
  if (!keyType) return false;

  const ctrlOrCmdPressed = e.ctrlKey || e.metaKey;
  const altPressed = e.altKey;

  // Check keytype-specific restrictions
  if (keyType === 'other') {
    // Tab and Space may clash with keyboard navigation - Ctrl or Alt required
    if (!ctrlOrCmdPressed && !altPressed) return false;
  }

  return true;
};

/**
 * Extracts shortcut-related information from given event object
 */
export const getShortcutMetadataFromEvent = (
  e: KeyEventLike
): {| shortcutString: string, isValid: boolean |} => {
  const shortcutString = getShortcutStringFromEvent(e);
  const isValidKey = isValidShortcutEvent(e);
  const isReserved = reservedShortcuts.includes(shortcutString);
  return { shortcutString, isValid: isValidKey && !isReserved };
};

/**
 * Patches default shortcuts set with user's custom shortcuts and
 * returns the full shortcut map obtained.
 */
export const useShortcutMap = (): ShortcutMap => {
  const preferences = React.useContext(PreferencesContext);
  const userShortcutMap = preferences.values.userShortcutMap;
  return { ...defaultShortcuts, ...userShortcutMap };
};

type UseKeyboardShortcutsProps = {|
  onRunCommand: (commandName: CommandName) => void,
  previewDebuggerServer: ?PreviewDebuggerServer,
|};

/**
 * Listens for keyboard shortcuts and launches
 * callback with corresponding command
 */
export const useKeyboardShortcuts = ({
  onRunCommand,
  previewDebuggerServer,
}: UseKeyboardShortcutsProps) => {
  const shortcutMap = useShortcutMap();

  React.useEffect(
    () => {
      const handler = (e: KeyboardEvent) => {
        // Extract shortcut from event object and check if it's valid
        const shortcutData = getShortcutMetadataFromEvent(e);
        if (!shortcutData.isValid) return;

        // Get corresponding command, if it exists
        const commandName = Object.keys(shortcutMap).find(
          name => shortcutMap[name] === shortcutData.shortcutString
        );
        if (!commandName) return;

        // On desktop app, ignore shortcuts that are handled by Electron
        if (electron && commandsList[commandName].handledByElectron) {
          // console.info(
          //   `Command ${commandName} triggered from KeyboardEvent but handled by Electron.`
          // );
          return;
        }

        // e.preventDefault tends to block user from typing,
        // so do it only if user is not typing.
        if (isUserTyping()) return;
        e.preventDefault();

        // Discard shortcut presses if a dialog is open
        if (isDialogOpen()) return;

        // console.info(`Command ${commandName} triggered from KeyboardEvent.`);
        onRunCommand(commandName);
      };

      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    },
    [onRunCommand, shortcutMap]
  );

  React.useEffect(
    () => {
      if (!previewDebuggerServer) return;

      const unregister = previewDebuggerServer.registerCallbacks({
        onErrorReceived: () => {},
        onServerStateChanged: () => {},
        onConnectionClosed: () => {},
        onConnectionOpened: () => {},
        onConnectionErrored: () => {},
        onHandleParsedMessage: ({ id, parsedMessage }) => {
          if (
            parsedMessage.command !== 'handleKeyboardShortcutFromInGameEditor'
          ) {
            return;
          }

          const keyEventLike = parsedMessage.payload;
          const metaKey =
            SafeExtractor.extractBooleanProperty(keyEventLike, 'metaKey') ||
            false;
          const ctrlKey =
            SafeExtractor.extractBooleanProperty(keyEventLike, 'ctrlKey') ||
            false;
          const altKey =
            SafeExtractor.extractBooleanProperty(keyEventLike, 'altKey') ||
            false;
          const shiftKey =
            SafeExtractor.extractBooleanProperty(keyEventLike, 'shiftKey') ||
            false;
          const keyCode = SafeExtractor.extractNumberProperty(
            keyEventLike,
            'keyCode'
          );

          if (!keyCode) return;

          const shortcutData = getShortcutMetadataFromEvent({
            keyCode,
            metaKey,
            ctrlKey,
            altKey,
            shiftKey,
          });
          if (!shortcutData.isValid) return;

          // Get corresponding command, if it exists
          const commandName = Object.keys(shortcutMap).find(
            name => shortcutMap[name] === shortcutData.shortcutString
          );
          if (!commandName) return;

          const command = commandsList[commandName];
          if (!command) return;

          if (isUserTyping() || isDialogOpen()) {
            console.warn(
              'Shortcut received from the in-game editor, despite the user having a dialog opened or being typing. Ignoring. Still double check why this shortcut was received.'
            );
            return;
          }

          // console.info(
          //   `Command ${commandName} triggered from a in-game editor shortcut.`
          // );
          onRunCommand(commandName);
        },
      });

      return () => {
        unregister();
      };
    },
    [previewDebuggerServer, shortcutMap, onRunCommand]
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
  if (code === 'Comma') return ',';
  return code; // Tab, Space
};

/**
 * Parses shortcut string into array of platform-specific key strings
 */
export const getShortcutDisplayName = (shortcutString: ?string) => {
  if (!shortcutString) return '';

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
      if (keyCode === 'CmdOrCtrl' || keyCode === 'Shift' || keyCode === 'Alt')
        return keyCode;
      return getElectronKeyString(keyCode);
    })
    .join('+');
};
