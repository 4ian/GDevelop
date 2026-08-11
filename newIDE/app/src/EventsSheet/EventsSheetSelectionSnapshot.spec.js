// @flow
import {
  getEventsSheetSelectionSnapshot,
  type EventsSheetSelectionSnapshot,
} from './SelectionSnapshot';
import { getInitialSelection, selectEvent } from './SelectionHandler';
import { makeTestProject } from '../fixtures/TestProject';

const gd: libGDevelop = global.gd;

describe('EventsSheet selection snapshot', () => {
  it('returns selected event paths and serialized event data', () => {
    const {
      project,
      emptyLayout,
      emptySceneProjectScopedContainersAccessor,
    } = makeTestProject(gd);
    const events = new gd.EventsList();

    try {
      const parentEvent = events.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      );
      const selectedEvent = parentEvent
        .getSubEvents()
        .insertNewEvent(project, 'BuiltinCommonInstructions::Comment', 0);
      gd.asCommentEvent(selectedEvent).setComment('Selected comment');

      const selection = selectEvent(getInitialSelection(), {
        eventsList: parentEvent.getSubEvents(),
        event: selectedEvent,
        indexInList: 0,
        projectScopedContainersAccessor: emptySceneProjectScopedContainersAccessor,
      });

      const snapshot: EventsSheetSelectionSnapshot = getEventsSheetSelectionSnapshot(
        {
          events,
          selection,
          isActive: true,
          scope: {
            project,
            layout: emptyLayout,
          },
        }
      );

      expect(snapshot.selectionProvider).toBe('EventsSheet');
      expect(snapshot.isActive).toBe(true);
      expect(snapshot.sceneName).toBe('EmptyLayout');
      expect(snapshot.lastSelectionType).toBe('event');
      expect(snapshot.selectedEvents).toHaveLength(1);
      expect(snapshot.selectedEvents[0].eventPath).toBe('event-0.0');
      expect(snapshot.selectedEvents[0].eventIndexPath).toEqual([0, 0]);
      expect(snapshot.selectedEvents[0].indexInList).toBe(0);
      expect(snapshot.selectedEvents[0].eventType).toBe(
        'BuiltinCommonInstructions::Comment'
      );
      expect(
        JSON.stringify(snapshot.selectedEvents[0].serializedEvent)
      ).toContain('Selected comment');
      expect(snapshot.selectedEvents[0].eventAsText).toContain(
        'Selected comment'
      );
    } finally {
      events.delete();
      project.delete();
    }
  });
});
