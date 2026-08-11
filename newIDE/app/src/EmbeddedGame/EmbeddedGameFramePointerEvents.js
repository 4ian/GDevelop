// @flow

let onPreventGameFramePointerEvents: null | ((enabled: boolean) => void) = null;

export const registerPreventGameFramePointerEventsCallback = (
  callback: (enabled: boolean) => void
): (() => void) => {
  onPreventGameFramePointerEvents = callback;

  return () => {
    if (onPreventGameFramePointerEvents === callback) {
      onPreventGameFramePointerEvents = null;
    }
  };
};

export const preventGameFramePointerEvents = (enabled: boolean) => {
  if (!onPreventGameFramePointerEvents)
    throw new Error('No EmbeddedGameFrame registered.');
  onPreventGameFramePointerEvents(enabled);
};
