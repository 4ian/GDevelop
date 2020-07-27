// @flow
import { type CommandName } from '../CommandPalette/CommandsList';

export type ShortcutMap = { [CommandName]: string };

const defaultShortcuts: ShortcutMap = {
  LAUNCH_PREVIEW: 'F5',
  LAUNCH_DEBUG_PREVIEW: 'CmdOrCtrl+F5',
  EDIT_OBJECT: 'CmdOrCtrl+Shift+KeyO',
};

export default defaultShortcuts;
