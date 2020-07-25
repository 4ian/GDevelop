// @flow
import { type CommandName } from '../CommandsList';

const defaultShortcuts: { [CommandName]: string } = {
  LAUNCH_PREVIEW: 'F5',
  LAUNCH_DEBUG_PREVIEW: 'CmdOrCtrl+F5',
  EDIT_OBJECT: 'CmdOrCtrl+Shift+KeyO',
};

export default defaultShortcuts;
