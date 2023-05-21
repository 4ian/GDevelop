// @flow

// These functions are very simple, but are there to ensure consistency
// in the codebase when dealing with keys.

type SupportedEvent = KeyboardEvent | SyntheticKeyboardEvent<any>;

/**
 * Check if the user asked to close/cancel what is being edited.
 */
export const shouldCloseOrCancel = (event: SupportedEvent) => {
  return event.key === 'Escape';
};

/**
 * Check if the user asked to validate what is being edited.
 */
export const shouldValidate = (event: SupportedEvent) => {
  return event.key === 'Enter' && !event.shiftKey;
};

/**
 * Check if the user asked to go to previous match.
 */
export const shouldBrowsePrevious = (event: SupportedEvent) => {
  return event.shiftKey && event.key === 'Enter';
};

/**
 * Check if the user asked to activate something.
 */
export const shouldActivate = (event: SupportedEvent) => {
  return event.key === 'Enter' || event.key === ' ';
};

/**
 * Check if the user wants to apply changes or "submit" what they did.
 * This is more intentional from the user than just
 * `shouldValidate` or `shouldActivate`.
 */
export const shouldSubmit = (event: SupportedEvent) => {
  return (event.metaKey || event.ctrlKey) && event.key === 'Enter';
};

/**
 * Check if the user wants to zoom when scrolling.
 */
export const shouldZoom = (event: SupportedEvent | WheelEvent) => {
  return event.metaKey || event.ctrlKey;
};

/**
 * Check if the user asked to go to the next field.
 * Note that in most case, this should be automatically handled by the browser
 * (or material-ui), and using this should not be needed.
 */
export const shouldFocusNextField = (event: SupportedEvent) => {
  return event.key === 'Tab' && !event.shiftKey;
};

/**
 * Check if the user asked to go to the previous field.
 * Note that in most case, this should be automatically handled by the browser
 * (or material-ui), and using this should not be needed.
 */
export const shouldFocusPreviousField = (event: SupportedEvent) => {
  return event.key === 'Tab' && event.shiftKey;
};
