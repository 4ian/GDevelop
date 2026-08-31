// @flow
import * as React from 'react';
import optionalRequire from './OptionalRequire';

const electron = optionalRequire('electron');

/**
 * Browsers stop `requestAnimationFrame` and throttle timers in a hidden
 * page - down to one wake up per minute once it has been hidden for a few
 * minutes - and can even freeze it entirely to save memory or battery.
 * A page that is playing audio is exempted from all of this.
 *
 * So, to keep long running work (the AI agent) going while the user looks
 * at something else, we play a tone that is inaudible in practice but not
 * digitally silent: Chromium decides that a page is audible by measuring
 * the power of what it outputs (anything under about -72 dBFS counts as
 * silence), so a perfectly silent - or muted - source would be ignored.
 *
 * -60 dBFS at 40Hz: two orders of magnitude below the quietest sound of a
 * game, at the very bottom of the audible spectrum. It cannot be heard, but
 * it is loud enough for the browser to consider the page active.
 */
const KEEP_PAGE_ACTIVE_GAIN = 0.001;
const KEEP_PAGE_ACTIVE_FREQUENCY = 40;

// A single audio context is used for the whole app: creating one is costly,
// and browsers limit how many can exist at the same time.
let audioContext: ?AudioContext = null;
let oscillator: ?OscillatorNode = null;
let hasLoggedFailure = false;

const getAudioContext = (): ?AudioContext => {
  if (audioContext) return audioContext;

  const AudioContextConstructor =
    typeof window !== 'undefined'
      ? window.AudioContext || window.webkitAudioContext
      : null;
  if (!AudioContextConstructor) return null;

  try {
    audioContext = new AudioContextConstructor();
    return audioContext;
  } catch (error) {
    console.warn('Could not create an audio context to keep the page active.');
    return null;
  }
};

const startKeepingPageActive = () => {
  if (oscillator) return;

  const context = getAudioContext();
  if (!context) return;

  try {
    const newOscillator = context.createOscillator();
    const gainNode = context.createGain();
    gainNode.gain.value = KEEP_PAGE_ACTIVE_GAIN;
    newOscillator.frequency.value = KEEP_PAGE_ACTIVE_FREQUENCY;
    newOscillator.connect(gainNode);
    gainNode.connect(context.destination);
    newOscillator.start();
    oscillator = newOscillator;

    // Autoplay policies start an audio context suspended until the page
    // has been interacted with. In practice there always was an
    // interaction (the user sent a request to the AI), but if the context
    // stays suspended, nothing is played and the page will be throttled as
    // usual: degraded, not broken.
    if (context.state === 'suspended') {
      context.resume().catch(() => {
        if (hasLoggedFailure) return;
        hasLoggedFailure = true;
        console.info(
          'Could not resume the audio context keeping the page active: the app will be throttled by the browser if left in the background.'
        );
      });
    }
  } catch (error) {
    if (hasLoggedFailure) return;
    hasLoggedFailure = true;
    console.warn('Could not keep the page active:', error);
  }
};

const stopKeepingPageActive = () => {
  const startedOscillator = oscillator;
  if (!startedOscillator) return;

  oscillator = null;
  try {
    startedOscillator.stop();
    startedOscillator.disconnect();
  } catch (error) {
    // The oscillator was already stopped: nothing to do.
  }
};

/**
 * While `shouldKeepPageActive` is true, prevent the browser from throttling
 * or freezing the app when it is not looked at (tab in the background,
 * window minimized or covered by another one).
 *
 * Use it only for work that must keep going while the user is away (an AI
 * request being processed): it makes the tab show the "playing audio"
 * indicator, and keeping a page fully awake in the background costs
 * battery.
 *
 * Does nothing in the desktop app, where the main window is already created
 * with `backgroundThrottling` disabled.
 */
export const useKeepPageActive = (shouldKeepPageActive: boolean) => {
  React.useEffect(
    () => {
      if (electron) return;
      if (!shouldKeepPageActive) return;

      startKeepingPageActive();
      return () => stopKeepingPageActive();
    },
    [shouldKeepPageActive]
  );
};
