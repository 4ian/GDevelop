// @flow

// Allow any part of the editor to ask the Ask AI editor to start a new chat
// with a pre-filled user request ("Edit with AI" buttons...). The Ask AI
// editor may not be mounted yet when the pre-fill is requested (the tab is
// usually being opened at the same time): the request is kept pending until
// it registers.

let pendingPrefilledUserRequestText: string | null = null;
let listener: null | ((userRequestText: string) => void) = null;

/**
 * Ask the Ask AI editor to start a new chat with this pre-filled user
 * request (delivered as soon as it is mounted).
 */
export const requestAskAiPrefill = (userRequestText: string) => {
  if (listener) {
    listener(userRequestText);
  } else {
    pendingPrefilledUserRequestText = userRequestText;
  }
};

/**
 * Called by the Ask AI editor to receive the pre-fill requests. Returns the
 * function to unregister. Any pending request is delivered immediately.
 */
export const registerAskAiPrefillListener = (
  newListener: (userRequestText: string) => void
): (() => void) => {
  listener = newListener;
  if (pendingPrefilledUserRequestText !== null) {
    const userRequestText = pendingPrefilledUserRequestText;
    pendingPrefilledUserRequestText = null;
    newListener(userRequestText);
  }
  return () => {
    if (listener === newListener) listener = null;
  };
};
