// @flow

/**
 * Checks if a dialog or overlay is currently open on screen
 */
const isDialogOpen = (targetDocument?: Document): false | boolean | true => {
  // If currently focused element is inside the MainFrame div (main window)
  // or the popped-out-frame div (external editor window), we can be sure
  // that no dialog or overlay is opened.
  // But clicking on some empty spaces like in properties panel leads
  // to <body> element getting focused, so we also need to check if
  // currently focused element is <body>.
  const doc = targetDocument || document;
  const body = doc.body;
  const activeEl = doc.activeElement;
  const frame =
    doc.querySelector('div.main-frame') ||
    doc.querySelector('div.popped-out-frame');
  const isInFrame = frame && frame.contains(activeEl);
  const isBody = activeEl === body;
  return !isBody && !isInFrame;
};

export default isDialogOpen;
