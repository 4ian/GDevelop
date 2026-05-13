// @flow

/**
 * Suppress the benign "ResizeObserver loop completed with undelivered
 * notifications" browser error on the given window.
 *
 * Per the W3C spec this is a **non-fatal warning**: undelivered observations
 * are simply deferred to the next animation frame and do not affect
 * correctness. It is triggered when a ResizeObserver callback causes layout
 * changes that produce additional observations that cannot all be delivered
 * in the same frame.
 *
 * In development, react-error-overlay treats every unhandled error event as
 * fatal and shows a red overlay. Calling `stopImmediatePropagation` on the
 * error event prevents it from reaching the overlay handler (provided this
 * listener is registered *before* react-error-overlay).
 *
 * A throttled `console.log` is emitted (at most once per second) so the
 * suppression remains visible during debugging without spamming the console.
 */
export function silenceBenignResizeObserverError(
  targetWindow: typeof window
): void {
  let lastLogTime = 0;

  targetWindow.addEventListener('error', (event: { message: string }) => {
    if (
      event.message ===
      'ResizeObserver loop completed with undelivered notifications.'
    ) {
      const now = Date.now();
      if (now - lastLogTime > 1000) {
        lastLogTime = now;
        console.log(
          'Silenced benign "ResizeObserver loop completed with undelivered notifications" error. ' +
            'This is a non-fatal browser warning (W3C spec): undelivered observations are deferred to the next frame.'
        );
      }
      // $FlowFixMe[prop-missing] - stopImmediatePropagation exists on ErrorEvent.
      event.stopImmediatePropagation();
    }
  });
}
