// @flow

const reservedShortcuts = [
  'CmdOrCtrl+KeyZ', // Undo
  'CmdOrCtrl+KeyY', // Redo
  'CmdOrCtrl+Shift+KeyZ', // Redo
  'CmdOrCtrl+KeyX', // Cut
  'CmdOrCtrl+KeyC', // Copy
  'CmdOrCtrl+KeyV', // Paste
  'CmdOrCtrl+KeyD', // Duplicate
  'CmdOrCtrl+Shift+KeyV', // Paste with style
  'CmdOrCtrl+KeyA', // Select all
  'Delete', // Delete
  'CmdOrCtrl+Shift+KeyI', // Open dev tools
  'F11', // Toggle fullscreen

  'NumpadAdd', // Scene: Zoom in
  'CmdOrCtrl+Equal', // Scene: Zoom in
  'NumpadSubtract', // Scene: Zoom out
  'CmdOrCtrl+Minus', // Scene: Zoom out

  // TODO: Following shortcuts correspond to actions
  // that have overlapping commands
  'CmdOrCtrl+KeyF', // Events: Search
];

export default reservedShortcuts;
