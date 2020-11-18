// @flow

/**
 * Checks if a dialog or overlay is currently open on screen
 */
const isDialogOpen = () => {
  // If currently focused element is inside MainFrame div, we can
  // be sure that no dialog or overlay is opened.
  // But clicking on some empty spaces like in properties panel leads
  // to <body> element getting focused, so we also need to check if
  // currently focused element is <body>.
  const body = document.body;
  const activeEl = document.activeElement;
  const mainFrame = document.querySelector('div.main-frame');
  const isInMainframe = mainFrame && mainFrame.contains(activeEl);
  const isBody = activeEl === body;
  return !isBody && !isInMainframe;
};

export default isDialogOpen;
