// @flow
import { applyEventsChanges } from './ApplyEventsChanges';
import { type AiGeneratedEventEventsChanges } from '../Utils/GDevelopServices/Generation';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

const gd: libGDevelop = global.gd;

describe('applyEventsChanges', () => {
  let project: gdProject;
  let sceneEventsList: gdEventsList;
  let newEventsForInsertionJson = ` [{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]},{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]}]`;

  beforeEach(() => {
    project = new gd.ProjectHelper.createNewGDJSProject();
    sceneEventsList = new gd.EventsList();
  });

  afterEach(() => {
    sceneEventsList.delete();
    project.delete();
  });

  const setupInitialSceneEvents = (eventTypes: Array<string>) => {
    sceneEventsList.clear();
    eventTypes.forEach((type, index) => {
      sceneEventsList.insertNewEvent(project, type, index);
    });
  };

  const getEventTypes = (list: gdEventsList): Array<string> => {
    const types = [];
    for (let i = 0; i < list.getEventsCount(); i++) {
      types.push(list.getEventAt(i).getType());
    }
    return types;
  };

  it('should delete an event at the specified path', () => {
    setupInitialSceneEvents([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Comment',
      'BuiltinCommonInstructions::Standard',
    ]);
    // Path "event-1" targets index 1 (the second event)
    const changes: AiGeneratedEventEventsChanges = {
      deleteEvents: ['event-1'],
      insertAndReplaceEvents: [],
      insertBeforeEvents: [],
      insertAsSubEvents: [],
    };
    applyEventsChanges(project, sceneEventsList, null, changes);
    expect(sceneEventsList.getEventsCount()).toBe(2);
    expect(sceneEventsList.getEventAt(0).getType()).toBe(
      'BuiltinCommonInstructions::Standard'
    );
    expect(sceneEventsList.getEventAt(1).getType()).toBe(
      'BuiltinCommonInstructions::Standard'
    );
  });

  it('should delete a sub-event', () => {
    sceneEventsList.clear();
    const parentEvent = gd.asGroupEvent(
      sceneEventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Group',
        0
      )
    );
    const subEvents = parentEvent.getSubEvents();
    subEvents.insertNewEvent(project, 'BuiltinCommonInstructions::Comment', 0); // sub-event 0
    subEvents.insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 1); // sub-event 1 (to delete)

    // Path "event-0.1" targets parent at index 0, sub-event at its index 1
    const changes: AiGeneratedEventEventsChanges = {
      deleteEvents: ['event-0.1'],
      insertAndReplaceEvents: [],
      insertBeforeEvents: [],
      insertAsSubEvents: [],
    };
    applyEventsChanges(project, sceneEventsList, null, changes);

    const finalParentEvent = sceneEventsList.getEventAt(0);
    expect(finalParentEvent.getSubEvents().getEventsCount()).toBe(1);
    expect(
      finalParentEvent
        .getSubEvents()
        .getEventAt(0)
        .getType()
    ).toBe('BuiltinCommonInstructions::Comment');
  });

  it('should insert events before a specified path', () => {
    setupInitialSceneEvents([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Repeat',
    ]);
    // Path "event-1" means insert at index 1 (before Repeat)
    const changes: AiGeneratedEventEventsChanges = {
      deleteEvents: [],
      insertAndReplaceEvents: [],
      insertBeforeEvents: ['event-1'],
      insertAsSubEvents: [],
    };
    applyEventsChanges(
      project,
      sceneEventsList,
      newEventsForInsertionJson,
      changes
    );
    // Expected: S0, NewS, NewS, R1
    expect(sceneEventsList.getEventsCount()).toBe(4);
    expect(getEventTypes(sceneEventsList)).toEqual([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Repeat',
    ]);
  });

  it('should append events if path targets end of list', () => {
    setupInitialSceneEvents([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Repeat',
    ]); // S0, R1. Count = 2
    // Path "event-2" (count) will insert at index 2 (end of list)
    const changes: AiGeneratedEventEventsChanges = {
      deleteEvents: [],
      insertAndReplaceEvents: [],
      insertBeforeEvents: ['event-2'],
      insertAsSubEvents: [],
    };
    applyEventsChanges(
      project,
      sceneEventsList,
      newEventsForInsertionJson,
      changes
    );
    // Expected: S0, R1, NewS, NewS
    expect(sceneEventsList.getEventsCount()).toBe(4);
    expect(getEventTypes(sceneEventsList)).toEqual([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Repeat',
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Standard',
    ]);
  });

  it('should insert events as sub-events', () => {
    setupInitialSceneEvents([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Group',
    ]); // S0, G1
    // Path "event-1" targets parent at index 1 ('Group')
    const changes: AiGeneratedEventEventsChanges = {
      deleteEvents: [],
      insertAndReplaceEvents: [],
      insertBeforeEvents: [],
      insertAsSubEvents: ['event-1'],
    };
    applyEventsChanges(
      project,
      sceneEventsList,
      newEventsForInsertionJson,
      changes
    );
    const parentEvent = sceneEventsList.getEventAt(1);
    expect(parentEvent.getSubEvents().getEventsCount()).toBe(2);
    expect(getEventTypes(parentEvent.getSubEvents())).toEqual([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Standard',
    ]);
  });

  it('should replace an event', () => {
    setupInitialSceneEvents([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Repeat',
      'BuiltinCommonInstructions::While',
    ]);
    // Path "event-1" targets index 1 ('Repeat') for replacement
    const changes: AiGeneratedEventEventsChanges = {
      deleteEvents: [],
      insertAndReplaceEvents: ['event-1'],
      insertBeforeEvents: [],
      insertAsSubEvents: [],
    };
    applyEventsChanges(
      project,
      sceneEventsList,
      newEventsForInsertionJson,
      changes
    );
    // Expected: S0, NewS, NewS, W2 (original R1 is gone, 2 new events inserted)
    expect(sceneEventsList.getEventsCount()).toBe(4);
    expect(getEventTypes(sceneEventsList)).toEqual([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::While',
    ]);
  });

  it('should process deletions before insertions when paths are sorted', () => {
    setupInitialSceneEvents([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Repeat',
      'BuiltinCommonInstructions::While',
      'BuiltinCommonInstructions::ForEach',
    ]);
    // Delete W2 (idx 2, path "event-2")
    // Insert new before R1 (idx 1, path "event-1")
    const changes: AiGeneratedEventEventsChanges = {
      deleteEvents: ['event-2'],
      insertBeforeEvents: ['event-1'],
      insertAndReplaceEvents: [],
      insertAsSubEvents: [],
    };
    applyEventsChanges(
      project,
      sceneEventsList,
      newEventsForInsertionJson,
      changes
    );
    // Initial: S0, R1, W2, F3
    // After del W2: S0, R1, F3
    // After insert new before R1: S0, NewS, NewS, R1, F3
    expect(sceneEventsList.getEventsCount()).toBe(5);
    expect(getEventTypes(sceneEventsList)).toEqual([
      'BuiltinCommonInstructions::Standard', // S0
      'BuiltinCommonInstructions::Standard', // NewS
      'BuiltinCommonInstructions::Standard', // NewS
      'BuiltinCommonInstructions::Repeat', // R1
      'BuiltinCommonInstructions::ForEach', // F3
    ]);
  });

  it('should throw error if multiple insertion operations are specified', () => {
    const changes: AiGeneratedEventEventsChanges = {
      deleteEvents: [],
      insertAndReplaceEvents: ['event-1'],
      insertBeforeEvents: ['event-2'],
      insertAsSubEvents: [],
    };
    expect(() =>
      applyEventsChanges(
        project,
        sceneEventsList,
        newEventsForInsertionJson,
        changes
      )
    ).toThrow(/Multiple insertion operations specified/);
  });

  it('should throw error if insertion operation is specified but no generatedEventsJson', () => {
    const changes: AiGeneratedEventEventsChanges = {
      deleteEvents: [],
      insertAndReplaceEvents: [],
      insertBeforeEvents: ['event-1'],
      insertAsSubEvents: [],
    };
    expect(() =>
      applyEventsChanges(project, sceneEventsList, null, changes)
    ).toThrow(
      /Specified event changes involving insertions, but did not provide the events content/
    );
  });

  it('should skip invalid delete path (out of bounds) gracefully and log error', () => {
    setupInitialSceneEvents(['BuiltinCommonInstructions::Standard']);
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const changes: AiGeneratedEventEventsChanges = {
      deleteEvents: ['event-5'], // Path "event-5" targets index 5, out of bounds
      insertAndReplaceEvents: [],
      insertBeforeEvents: [],
      insertAsSubEvents: [],
    };
    applyEventsChanges(project, sceneEventsList, null, changes);
    expect(sceneEventsList.getEventsCount()).toBe(1); // No change
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Error applying event operation type delete for path [5]'
      ),
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });

  it('should skip insert if generatedEventsJson results in no actual events after unserialization', () => {
    setupInitialSceneEvents(['BuiltinCommonInstructions::Standard']);
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const emptyNewEventsJson = '[]';

    const changes: AiGeneratedEventEventsChanges = {
      deleteEvents: [],
      insertAndReplaceEvents: [],
      insertBeforeEvents: ['event-1'], // Insert at index 1 (append)
      insertAsSubEvents: [],
    };
    applyEventsChanges(project, sceneEventsList, emptyNewEventsJson, changes);
    expect(sceneEventsList.getEventsCount()).toBe(1); // No events added
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Insert operation for path [1] skipped: no events to insert or events list is empty'
      )
    );
    consoleWarnSpy.mockRestore();
  });
});
