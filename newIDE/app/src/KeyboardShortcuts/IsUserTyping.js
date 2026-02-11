// @flow

/**
 * Checks if the user is currently typing text
 */
const isUserTyping = () => {
  const activeElement = document.activeElement;
  if (!activeElement) return false;
  // Check if focused element is part of a text entry HTML element
  const textEditorSelectors = 'textarea, input, [contenteditable="true"]';
  if (activeElement.closest(textEditorSelectors)) return true;
  return false;
};

export default isUserTyping;
