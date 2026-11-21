'use strict';

/**
 * Pure helpers for the "Copy events as JSON" action.
 *
 * The clipboard payload is the serialized events list itself: a JSON array of
 * events (the same shape `serializeToJSObject` returns for a `gd.EventsList`).
 * It is pretty-printed with `JSON.stringify(..., null, 2)` so it can be pasted
 * into a file or a gameplay-test fixture. It is not the mangled in-editor
 * clipboard payload used by Copy/Cut/Paste.
 *
 * An empty selection does not copy: this returns null and the menu/command
 * stay disabled.
 */

/**
 * Pretty-print a serialized events list.
 * @param {*} serializedEvents
 * @returns {string}
 */
function prettyPrintEventsJson(serializedEvents) {
  return JSON.stringify(serializedEvents, null, 2);
}

/**
 * Convert a serialized events list to clipboard text.
 * Empty selection (or a missing list) returns null so the caller does not copy.
 * @param {*} serializedEvents
 * @returns {string|null}
 */
function eventsListToClipboardText(serializedEvents) {
  if (!Array.isArray(serializedEvents) || serializedEvents.length === 0) {
    return null;
  }
  return prettyPrintEventsJson(serializedEvents);
}

module.exports = {
  prettyPrintEventsJson,
  eventsListToClipboardText,
};
