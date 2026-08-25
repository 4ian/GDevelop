// @flow

export type WheelInputDevice = 'trackpad' | 'mouseWheel';

// Browsers don't expose which physical device produced a wheel event, so
// this is a heuristic - but a fairly reliable one, combining a few signals
// commonly used for this purpose:
//
// - `deltaMode`: when the browser reports a "line" or "page" step instead
//   of "pixel", that's a strong signal of a physical wheel notch (OSes and
//   browsers essentially always report trackpad gestures in pixel mode).
// - Frequency: a trackpad swipe fires many events in a fast, continuous
//   burst (typically every ~10-30ms); a wheel fires one event per detent,
//   usually spaced much further apart.
// - Magnitude/shape: trackpad deltas are usually small and often
//   fractional; wheel deltas are usually larger, whole numbers.
//
// None of these alone is reliable (e.g. a very fast wheel spin can also
// produce frequent events), which is why they're combined.
export class WheelInputClassifier {
  _lastEventTime: number | null = null;
  _recentIntervalsMs: Array<number> = [];
  _recentAbsDeltas: Array<number> = [];
  _maxHistoryLength = 6;

  classify(event: WheelEvent): WheelInputDevice {
    const now = Date.now();
    const intervalMs =
      this._lastEventTime === null ? null : now - this._lastEventTime;
    this._lastEventTime = now;

    // DOM_DELTA_LINE (1) or DOM_DELTA_PAGE (2): the browser itself is
    // telling us this is a discrete step, characteristic of a physical
    // mouse wheel notch.
    if (event.deltaMode === 1 || event.deltaMode === 2) {
      return 'mouseWheel';
    }

    if (intervalMs !== null) this._recentIntervalsMs.push(intervalMs);
    this._recentAbsDeltas.push(Math.abs(event.deltaY));
    if (this._recentIntervalsMs.length > this._maxHistoryLength)
      this._recentIntervalsMs.shift();
    if (this._recentAbsDeltas.length > this._maxHistoryLength)
      this._recentAbsDeltas.shift();

    const averageIntervalMs = average(this._recentIntervalsMs);
    const averageAbsDelta = average(this._recentAbsDeltas);

    // Trackpads: continuous stream of frequent, usually small and/or
    // fractional deltas. Wheels: sparse events (one per detent), larger,
    // almost always whole-number deltas.
    const looksLikeAContinuousGesture =
      averageIntervalMs === 0 || averageIntervalMs < 40;
    const looksSmallOrFractional =
      !Number.isInteger(event.deltaY) || averageAbsDelta < 12;

    return looksLikeAContinuousGesture && looksSmallOrFractional
      ? 'trackpad'
      : 'mouseWheel';
  }
}

const average = (numbers: Array<number>): number =>
  numbers.length === 0
    ? 0
    : numbers.reduce((sum, value) => sum + value, 0) / numbers.length;