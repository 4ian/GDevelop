// @flow

// Allow any part of the editor to ask the Ask AI editor to pre-fill a user
// request, in a new chat ("Edit with AI" buttons...) or the current one. The Ask AI
// editor may not be mounted yet when the pre-fill is requested (the tab is
// usually being opened at the same time): the request is kept pending until
// it registers.

export type AskAiPrefill = {|
  userRequestText: string,
  // Pre-fill the chat being shown (if any) instead of starting a new one.
  inCurrentChat: boolean,
|};

let pendingPrefill: AskAiPrefill | null = null;
let listener: null | ((prefill: AskAiPrefill) => void) = null;

/**
 * Ask the Ask AI editor to pre-fill a user request, in a new chat or the one
 * being shown (delivered as soon as it is mounted).
 */
export const requestAskAiPrefill = (prefill: AskAiPrefill) => {
  if (listener) {
    listener(prefill);
  } else {
    pendingPrefill = prefill;
  }
};

/**
 * Called by the Ask AI editor to receive the pre-fill requests. Returns the
 * function to unregister. Any pending request is delivered immediately.
 */
export const registerAskAiPrefillListener = (
  newListener: (prefill: AskAiPrefill) => void
): (() => void) => {
  listener = newListener;
  if (pendingPrefill !== null) {
    const prefill = pendingPrefill;
    pendingPrefill = null;
    newListener(prefill);
  }
  return () => {
    if (listener === newListener) listener = null;
  };
};
