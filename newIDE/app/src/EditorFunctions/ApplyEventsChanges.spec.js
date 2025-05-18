// @flow
import { applyEventsChanges } from './ApplyEventsChanges';
import { type AiGeneratedEventChange } from '../Utils/GDevelopServices/Generation';

const gd: libGDevelop = global.gd;

describe('applyEventsChanges', () => {
  let project: gdProject;
  let sceneEventsList: gdEventsList;
  let newEventsForInsertionJson = ` [{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]},{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]}]`;
  const fakeGeneratedEventId = 'fakeGeneratedEventId';

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
    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'delete_event',
        operationTargetEvent: 'event-1',
        generatedEvents: null,
        isEventsJsonValid: null,
        areEventsValid: null,
        diagnosticLines: [],
        extensionNames: [],
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );
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
    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'delete_event',
        operationTargetEvent: 'event-0.1',
        generatedEvents: null,
        isEventsJsonValid: null,
        areEventsValid: null,
        diagnosticLines: [],
        extensionNames: [],
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );

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
    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'insert_before_event',
        operationTargetEvent: 'event-1',
        generatedEvents: newEventsForInsertionJson,
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
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
    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'insert_at_end',
        operationTargetEvent: null,
        generatedEvents: newEventsForInsertionJson,
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
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
    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'insert_as_sub_event',
        operationTargetEvent: 'event-1',
        generatedEvents: newEventsForInsertionJson,
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
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
    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'insert_and_replace_event',
        operationTargetEvent: 'event-1',
        generatedEvents: newEventsForInsertionJson,
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
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
    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'delete_event',
        operationTargetEvent: 'event-2',
        generatedEvents: null,
        isEventsJsonValid: null,
        areEventsValid: null,
        diagnosticLines: [],
        extensionNames: [],
      },
      {
        operationName: 'insert_before_event',
        operationTargetEvent: 'event-1',
        generatedEvents: newEventsForInsertionJson,
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
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

  it('should warn and skip insert if no generatedEvents provided for an insert operation', () => {
    setupInitialSceneEvents(['BuiltinCommonInstructions::Standard']);
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'insert_before_event',
        operationTargetEvent: 'event-1', // Insert at index 1 (append)
        generatedEvents: null, // No events provided
        isEventsJsonValid: null,
        areEventsValid: null,
        diagnosticLines: [],
        extensionNames: [],
      },
    ];

    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );

    expect(sceneEventsList.getEventsCount()).toBe(1); // No events added
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Insert operation for path [1] skipped: no events to insert or events list is empty'
      )
    );
    consoleWarnSpy.mockRestore();
  });

  it('should skip invalid delete path (out of bounds) gracefully and log error', () => {
    setupInitialSceneEvents(['BuiltinCommonInstructions::Standard']);
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'delete_event',
        operationTargetEvent: 'event-5', // Path "event-5" targets index 5, out of bounds
        generatedEvents: null,
        isEventsJsonValid: null,
        areEventsValid: null,
        diagnosticLines: [],
        extensionNames: [],
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );
    expect(sceneEventsList.getEventsCount()).toBe(1); // No change
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Error applying event operation type delete for path [5]'
      ),
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });
});
