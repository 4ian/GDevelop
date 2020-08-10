// @flow

const reservedShortcuts = [
  'CmdOrCtrl+KeyZ', // Undo
  'CmdOrCtrl+KeyY', // Redo
  'CmdOrCtrl+KeyX', // Cut
  'CmdOrCtrl+KeyC', // Copy
  'CmdOrCtrl+KeyV', // Paste
  'Delete', // Delete
  'NumpadAdd', // Scene: Zoom in
  'CmdOrCtrl+Equal', // Scene: Zoom in
  'NumpadSubtract', // Scene: Zoom out
  'CmdOrCtrl+Minus', // Scene: Zoom out

  // TODO: Following shortcuts correspond to actions
  // that have overlapping commands
  'CmdOrCtrl+KeyF', // Events: Search
];

export default reservedShortcuts;
