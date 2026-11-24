// @flow

/**
 * Declare what the editor is displaying, so that the native mobile app knows what was running
 * if the system killed the WebView (because of the memory used). Does nothing otherwise.
 */

/**
 * Declare that something heavy (a game preview, an instances editor...) is displayed.
 * Returns the function to call when it's finished.
 */
export const startNativeAppActivity = (activityName: string): (() => void) => {
  return () => {};
};

/** Declare what the editor is doing, so that this is known if the app is killed later. */
export const updateNativeAppLifecycleContext = (newContext: {
  [string]: any,
}) => {};

/**
 * Declare that the editor is doing something that should go on for a while if the user leaves
 * the app (an AI request being processed), so that the native mobile app asks the system for
 * extra time when it goes to the background. Does nothing otherwise.
 * Returns the function to call when the work is finished.
 */
export const startNativeAppBackgroundWork = (): (() => void) => {
  return () => {};
};
