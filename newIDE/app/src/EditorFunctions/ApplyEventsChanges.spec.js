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
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
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
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
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
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
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
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
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
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
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
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
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
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
      },
      {
        operationName: 'insert_before_event',
        operationTargetEvent: 'event-1',
        generatedEvents: newEventsForInsertionJson,
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
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
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
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
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
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

  it('should replace event using replace_entire_event_and_sub_events (synonym for insert_and_replace_event)', () => {
    setupInitialSceneEvents([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Repeat',
      'BuiltinCommonInstructions::While',
    ]);
    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'replace_entire_event_and_sub_events',
        operationTargetEvent: 'event-1',
        generatedEvents: newEventsForInsertionJson,
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
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

  it('should replace event but keep existing sub-events with replace_event_but_keep_existing_sub_events', () => {
    sceneEventsList.clear();
    // Create a Group event with sub-events
    const groupEvent = gd.asGroupEvent(
      sceneEventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Group',
        0
      )
    );
    groupEvent.setName('TestGroup');
    const subEvents = groupEvent.getSubEvents();
    subEvents.insertNewEvent(project, 'BuiltinCommonInstructions::Comment', 0);
    subEvents.insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 1);

    // Replace the group event with a standard event - should keep the sub-events
    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'replace_event_but_keep_existing_sub_events',
        operationTargetEvent: 'event-0',
        generatedEvents:
          '[{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]}]',
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );

    expect(sceneEventsList.getEventsCount()).toBe(1);
    const replacedEvent = sceneEventsList.getEventAt(0);
    expect(replacedEvent.getType()).toBe('BuiltinCommonInstructions::Standard');
    // Check that sub-events were preserved
    expect(replacedEvent.getSubEvents().getEventsCount()).toBe(2);
    expect(
      replacedEvent
        .getSubEvents()
        .getEventAt(0)
        .getType()
    ).toBe('BuiltinCommonInstructions::Comment');
    expect(
      replacedEvent
        .getSubEvents()
        .getEventAt(1)
        .getType()
    ).toBe('BuiltinCommonInstructions::Standard');
  });

  it('should append sub-events from replacement event with replace_event_but_keep_existing_sub_events', () => {
    sceneEventsList.clear();
    // Create a Group event with one sub-event
    const groupEvent = gd.asGroupEvent(
      sceneEventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Group',
        0
      )
    );
    const subEvents = groupEvent.getSubEvents();
    subEvents.insertNewEvent(project, 'BuiltinCommonInstructions::Comment', 0);

    // Replace with a standard event that also has a sub-event
    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'replace_event_but_keep_existing_sub_events',
        operationTargetEvent: 'event-0',
        generatedEvents:
          '[{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[],"events":[{"type":"BuiltinCommonInstructions::Repeat","conditions":[],"actions":[]}]}]',
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );

    expect(sceneEventsList.getEventsCount()).toBe(1);
    const replacedEvent = sceneEventsList.getEventAt(0);
    // Existing sub-event at start, new sub-event appended at end
    expect(replacedEvent.getSubEvents().getEventsCount()).toBe(2);
    expect(
      replacedEvent
        .getSubEvents()
        .getEventAt(0)
        .getType()
    ).toBe('BuiltinCommonInstructions::Comment'); // Existing
    expect(
      replacedEvent
        .getSubEvents()
        .getEventAt(1)
        .getType()
    ).toBe('BuiltinCommonInstructions::Repeat'); // From replacement
  });

  it('should insert events after target with insert_after_event', () => {
    setupInitialSceneEvents([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Repeat',
      'BuiltinCommonInstructions::While',
    ]);
    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'insert_after_event',
        operationTargetEvent: 'event-0',
        generatedEvents: newEventsForInsertionJson,
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );
    // Expected: S0, NewS, NewS, R1, W2
    expect(sceneEventsList.getEventsCount()).toBe(5);
    expect(getEventTypes(sceneEventsList)).toEqual([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Repeat',
      'BuiltinCommonInstructions::While',
    ]);
  });

  it('should insert events after last event with insert_after_event', () => {
    setupInitialSceneEvents([
      'BuiltinCommonInstructions::Standard',
      'BuiltinCommonInstructions::Repeat',
    ]);
    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'insert_after_event',
        operationTargetEvent: 'event-1', // After the last event
        generatedEvents: newEventsForInsertionJson,
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
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

  it('should copy actions and conditions at end with insert_actions_conditions_at_end', () => {
    sceneEventsList.clear();
    const standardEvent = gd.asStandardEvent(
      sceneEventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      )
    );
    // Add one existing action and condition
    const existingAction = new gd.Instruction();
    existingAction.setType('ExistingAction');
    standardEvent.getActions().insert(existingAction, 0);
    existingAction.delete();

    const existingCondition = new gd.Instruction();
    existingCondition.setType('ExistingCondition');
    standardEvent.getConditions().insert(existingCondition, 0);
    existingCondition.delete();

    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'insert_actions_conditions_at_end',
        operationTargetEvent: 'event-0',
        generatedEvents:
          '[{"type":"BuiltinCommonInstructions::Standard","conditions":[{"type":{"value":"NewCondition"}}],"actions":[{"type":{"value":"NewAction"}}]}]',
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );

    const resultEvent = gd.asStandardEvent(sceneEventsList.getEventAt(0));
    // Check actions: existing first, new at end
    expect(resultEvent.getActions().size()).toBe(2);
    expect(
      resultEvent
        .getActions()
        .get(0)
        .getType()
    ).toBe('ExistingAction');
    expect(
      resultEvent
        .getActions()
        .get(1)
        .getType()
    ).toBe('NewAction');
    // Check conditions: existing first, new at end
    expect(resultEvent.getConditions().size()).toBe(2);
    expect(
      resultEvent
        .getConditions()
        .get(0)
        .getType()
    ).toBe('ExistingCondition');
    expect(
      resultEvent
        .getConditions()
        .get(1)
        .getType()
    ).toBe('NewCondition');
  });

  it('should copy while conditions at end for While events with insert_actions_conditions_at_end', () => {
    sceneEventsList.clear();
    const whileEvent = gd.asWhileEvent(
      sceneEventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::While',
        0
      )
    );
    // Add one existing while condition
    const existingWhileCondition = new gd.Instruction();
    existingWhileCondition.setType('ExistingWhileCondition');
    whileEvent.getWhileConditions().insert(existingWhileCondition, 0);
    existingWhileCondition.delete();

    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'insert_actions_conditions_at_end',
        operationTargetEvent: 'event-0',
        generatedEvents:
          '[{"type":"BuiltinCommonInstructions::While","whileConditions":[{"type":{"value":"NewWhileCondition"}}],"conditions":[],"actions":[]}]',
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );

    const resultEvent = gd.asWhileEvent(sceneEventsList.getEventAt(0));
    expect(resultEvent.getWhileConditions().size()).toBe(2);
    expect(
      resultEvent
        .getWhileConditions()
        .get(0)
        .getType()
    ).toBe('ExistingWhileCondition');
    expect(
      resultEvent
        .getWhileConditions()
        .get(1)
        .getType()
    ).toBe('NewWhileCondition');
  });

  it('should copy actions and conditions at start with insert_actions_conditions_at_start', () => {
    sceneEventsList.clear();
    const standardEvent = gd.asStandardEvent(
      sceneEventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      )
    );
    // Add existing action and condition
    const existingAction = new gd.Instruction();
    existingAction.setType('ExistingAction');
    standardEvent.getActions().insert(existingAction, 0);
    existingAction.delete();

    const existingCondition = new gd.Instruction();
    existingCondition.setType('ExistingCondition');
    standardEvent.getConditions().insert(existingCondition, 0);
    existingCondition.delete();

    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'insert_actions_conditions_at_start',
        operationTargetEvent: 'event-0',
        generatedEvents:
          '[{"type":"BuiltinCommonInstructions::Standard","conditions":[{"type":{"value":"NewCondition"}}],"actions":[{"type":{"value":"NewAction"}}]}]',
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );

    const resultEvent = gd.asStandardEvent(sceneEventsList.getEventAt(0));
    // Check actions: new first, existing at end
    expect(resultEvent.getActions().size()).toBe(2);
    expect(
      resultEvent
        .getActions()
        .get(0)
        .getType()
    ).toBe('NewAction');
    expect(
      resultEvent
        .getActions()
        .get(1)
        .getType()
    ).toBe('ExistingAction');
    // Check conditions: new first, existing at end
    expect(resultEvent.getConditions().size()).toBe(2);
    expect(
      resultEvent
        .getConditions()
        .get(0)
        .getType()
    ).toBe('NewCondition');
    expect(
      resultEvent
        .getConditions()
        .get(1)
        .getType()
    ).toBe('ExistingCondition');
  });

  it('should replace all actions with replace_all_actions', () => {
    sceneEventsList.clear();
    const standardEvent = gd.asStandardEvent(
      sceneEventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      )
    );
    // Add existing actions
    const existingAction1 = new gd.Instruction();
    existingAction1.setType('ExistingAction1');
    standardEvent.getActions().insert(existingAction1, 0);
    existingAction1.delete();
    const existingAction2 = new gd.Instruction();
    existingAction2.setType('ExistingAction2');
    standardEvent.getActions().insert(existingAction2, 1);
    existingAction2.delete();

    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'replace_all_actions',
        operationTargetEvent: 'event-0',
        generatedEvents:
          '[{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[{"type":{"value":"ReplacementAction"}}]}]',
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );

    const resultEvent = gd.asStandardEvent(sceneEventsList.getEventAt(0));
    // Only the replacement action should remain
    expect(resultEvent.getActions().size()).toBe(1);
    expect(
      resultEvent
        .getActions()
        .get(0)
        .getType()
    ).toBe('ReplacementAction');
  });

  it('should replace all conditions with replace_all_conditions', () => {
    sceneEventsList.clear();
    const standardEvent = gd.asStandardEvent(
      sceneEventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      )
    );
    // Add existing conditions
    const existingCondition1 = new gd.Instruction();
    existingCondition1.setType('ExistingCondition1');
    standardEvent.getConditions().insert(existingCondition1, 0);
    existingCondition1.delete();
    const existingCondition2 = new gd.Instruction();
    existingCondition2.setType('ExistingCondition2');
    standardEvent.getConditions().insert(existingCondition2, 1);
    existingCondition2.delete();

    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'replace_all_conditions',
        operationTargetEvent: 'event-0',
        generatedEvents:
          '[{"type":"BuiltinCommonInstructions::Standard","conditions":[{"type":{"value":"ReplacementCondition"}}],"actions":[]}]',
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );

    const resultEvent = gd.asStandardEvent(sceneEventsList.getEventAt(0));
    // Only the replacement condition should remain
    expect(resultEvent.getConditions().size()).toBe(1);
    expect(
      resultEvent
        .getConditions()
        .get(0)
        .getType()
    ).toBe('ReplacementCondition');
  });

  it('should replace while conditions with replace_all_conditions for While events', () => {
    sceneEventsList.clear();
    const whileEvent = gd.asWhileEvent(
      sceneEventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::While',
        0
      )
    );
    // Add existing while conditions
    const existingWhileCondition = new gd.Instruction();
    existingWhileCondition.setType('ExistingWhileCondition');
    whileEvent.getWhileConditions().insert(existingWhileCondition, 0);
    existingWhileCondition.delete();

    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'replace_all_conditions',
        operationTargetEvent: 'event-0',
        generatedEvents:
          '[{"type":"BuiltinCommonInstructions::While","whileConditions":[{"type":{"value":"ReplacementWhileCondition"}}],"conditions":[],"actions":[]}]',
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );

    const resultEvent = gd.asWhileEvent(sceneEventsList.getEventAt(0));
    expect(resultEvent.getWhileConditions().size()).toBe(1);
    expect(
      resultEvent
        .getWhileConditions()
        .get(0)
        .getType()
    ).toBe('ReplacementWhileCondition');
  });

  it('should target event by aiGeneratedEventId instead of path', () => {
    sceneEventsList.clear();
    const event1 = sceneEventsList.insertNewEvent(
      project,
      'BuiltinCommonInstructions::Standard',
      0
    );
    event1.setAiGeneratedEventId('target-event-id');

    sceneEventsList.insertNewEvent(
      project,
      'BuiltinCommonInstructions::Repeat',
      1
    );

    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'insert_and_replace_event',
        operationTargetEvent: 'target-event-id', // Using aiGeneratedEventId instead of path
        generatedEvents:
          '[{"type":"BuiltinCommonInstructions::Comment","conditions":[],"actions":[]}]',
        isEventsJsonValid: true,
        areEventsValid: true,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );

    // First event should be replaced with Comment
    expect(sceneEventsList.getEventsCount()).toBe(2);
    expect(getEventTypes(sceneEventsList)).toEqual([
      'BuiltinCommonInstructions::Comment',
      'BuiltinCommonInstructions::Repeat',
    ]);
  });

  it('should find nested event by aiGeneratedEventId', () => {
    sceneEventsList.clear();
    const parentEvent = gd.asGroupEvent(
      sceneEventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Group',
        0
      )
    );
    const subEvents = parentEvent.getSubEvents();
    subEvents.insertNewEvent(project, 'BuiltinCommonInstructions::Comment', 0);
    const targetSubEvent = subEvents.insertNewEvent(
      project,
      'BuiltinCommonInstructions::Standard',
      1
    );
    targetSubEvent.setAiGeneratedEventId('nested-target-id');

    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'delete_event',
        operationTargetEvent: 'nested-target-id', // Target nested event by ID
        generatedEvents: null,
        isEventsJsonValid: null,
        areEventsValid: null,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );

    // The nested Standard event should be deleted
    const finalParentEvent = sceneEventsList.getEventAt(0);
    expect(finalParentEvent.getSubEvents().getEventsCount()).toBe(1);
    expect(
      finalParentEvent
        .getSubEvents()
        .getEventAt(0)
        .getType()
    ).toBe('BuiltinCommonInstructions::Comment');
  });

  it('should skip operation if event with aiGeneratedEventId is not found', () => {
    setupInitialSceneEvents(['BuiltinCommonInstructions::Standard']);
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const eventOperations: Array<AiGeneratedEventChange> = [
      {
        operationName: 'delete_event',
        operationTargetEvent: 'non-existent-id',
        generatedEvents: null,
        isEventsJsonValid: null,
        areEventsValid: null,
        diagnosticLines: [],
        extensionNames: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
      },
    ];
    applyEventsChanges(
      project,
      sceneEventsList,
      eventOperations,
      fakeGeneratedEventId
    );

    expect(sceneEventsList.getEventsCount()).toBe(1); // No change
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Could not find event with aiGeneratedEventId')
    );
    consoleWarnSpy.mockRestore();
  });
});
