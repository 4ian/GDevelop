// @flow
import {
  copySelectionToClipboard,
  pasteEventsFromClipboardInSelection,
} from './ClipboardKind';
import { selectEvents, type EventContext } from './SelectionHandler';

const gd: libGDevelop = global.gd;

describe('ClipboardKind', () => {
  it('gives pasted events (and their sub-events) fresh persistent UUIDs', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const eventsList = new gd.EventsList();

    // Use a type registered on the platform: an unregistered type would
    // round-trip through the clipboard's JSON as an EmptyEvent (see
    // EventsListSerialization::UnserializeEventsFrom), losing the sub-events.
    const originalEvent = eventsList.insertNewEvent(
      project,
      'BuiltinCommonInstructions::Standard',
      0
    );
    const originalSubEvent = originalEvent
      .getSubEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);

    const originalUuid = originalEvent.getOrCreatePersistentUuid();
    const originalSubUuid = originalSubEvent.getOrCreatePersistentUuid();

    const eventContext: EventContext = {
      eventsList,
      event: originalEvent,
      indexInList: 0,
      // Not read by the copy/paste path.
      // $FlowFixMe[incompatible-type]
      projectScopedContainersAccessor: null,
    };
    const selection = selectEvents([eventContext]);
    copySelectionToClipboard(selection, () => [0]);

    const pasted = pasteEventsFromClipboardInSelection(project, selection);
    expect(pasted).toBe(true);

    // Paste inserts before the original at its former index.
    expect(eventsList.getEventsCount()).toBe(2);
    const pastedEvent = eventsList.getEventAt(0);
    const pastedSubEvent = pastedEvent.getSubEvents().getEventAt(0);

    expect(pastedEvent.getPersistentUuid()).not.toBe('');
    expect(pastedEvent.getPersistentUuid()).not.toBe(originalUuid);
    expect(pastedSubEvent.getPersistentUuid()).not.toBe('');
    expect(pastedSubEvent.getPersistentUuid()).not.toBe(originalSubUuid);

    // The original (still on the sheet) keeps its own identity.
    expect(eventsList.getEventAt(1).getPersistentUuid()).toBe(originalUuid);

    eventsList.delete();
    project.delete();
  });
});
