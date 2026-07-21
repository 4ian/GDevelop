// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from './index';
import { makeFakeLaunchFunctionOptionsWithProject } from './TestHelpers';

const gd: libGDevelop = global.gd;

describe('add_scene_events', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('TestScene', 0);
  });

  afterEach(() => {
    project.delete();
  });

  const makeArgs = (args: Object) => ({
    scene_name: 'TestScene',
    events_description: 'When the player presses space, make the player jump',
    extension_names_list: '',
    objects_list: 'Player',
    ...args,
  });

  it('fails when the scene does not exist', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn();

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: makeArgs({ scene_name: 'MissingScene' }),
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Scene not found: "MissingScene". Scenes in this project: "TestScene".'
    );
    expect(generateEvents).not.toHaveBeenCalled();
  });

  it('fails when there is no related AI request ID', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn();

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        relatedAiRequestId: null,
        args: makeArgs({}),
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'No related AI request ID found for events generation.'
    );
    expect(generateEvents).not.toHaveBeenCalled();
  });

  it('fails when no events description (and no event batches) is provided', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn();

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: {
          scene_name: 'TestScene',
          extension_names_list: '',
          objects_list: 'Player',
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe('No events description provided.');
    expect(generateEvents).not.toHaveBeenCalled();
  });

  it('reports an aborted generation without an error message', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationAborted: true,
    });

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: makeArgs({}),
      }
    );

    expect(result).toEqual({ success: false, aborted: true });
  });

  it('fails when the generation could not complete (infrastructure error)', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: false,
      errorMessage: 'Service unavailable',
    });

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: makeArgs({}),
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Infrastructure error during events generation (Service unavailable). Try again or a different approach.'
    );
  });

  // A full, valid generation result, as returned by the generation service,
  // used to exercise the post-generation apply pipeline. Pass an array to
  // build a result with several changes.
  const makeFakeAiGeneratedEvent = (
    changeOrChanges: Object | Array<Object>
  ) => ({
    id: 'test-ai-event-id',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userId: 'test-user',
    status: 'ready',
    partialGameProjectJson: '{}',
    eventsDescription: 'Some events',
    extensionNamesList: '',
    objectsList: 'Player',
    existingEventsAsText: '',
    existingEventsJson: null,
    existingEventsJsonUserRelativeKey: null,
    resultMessage: 'Successfully added events.',
    changes: (Array.isArray(changeOrChanges)
      ? changeOrChanges
      : [changeOrChanges]
    ).map(
      (change): Object => ({
        operationName: 'insert_at_end',
        operationTargetEvent: null,
        isEventsJsonValid: true,
        generatedEvents: JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [],
          },
        ]),
        areEventsValid: true,
        extensionNames: [],
        diagnosticLines: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
        missingResources: [],
        ...change,
      })
    ),
    error: null,
    stats: null,
  });

  // The resource installation runs after the events were applied: a failure
  // there must not fail the call, or the caller would retry and add the same
  // events a second time.
  it('still succeeds (with a warning) when installing resources fails after events were applied', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const onSceneEventsModifiedOutsideEditor = jest.fn();
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const searchAndInstallResources = jest.fn();
    searchAndInstallResources.mockRejectedValue(new Error('Network down'));
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: true,
      aiGeneratedEvent: makeFakeAiGeneratedEvent({
        missingResources: [
          { resourceName: 'explosion.wav', resourceKind: 'audio' },
        ],
      }),
    });

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        onSceneEventsModifiedOutsideEditor,
        searchAndInstallResources,
        args: makeArgs({}),
      }
    );

    expect(result.success).toBe(true);
    expect(result.aiGeneratedEventId).toBe('test-ai-event-id');
    expect(result.message).toEqual(
      expect.stringContaining(
        'Warning: the events were added, but installing their missing resources failed (Network down). Do NOT add the events again'
      )
    );
    // The events were really applied.
    expect(
      project
        .getLayout('TestScene')
        .getEvents()
        .getEventsCount()
    ).toBe(1);
    expect(onSceneEventsModifiedOutsideEditor).toHaveBeenCalled();
  });

  it('fails with the generated event id and errors when no change could be applied', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const onSceneEventsModifiedOutsideEditor = jest.fn();
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: true,
      aiGeneratedEvent: makeFakeAiGeneratedEvent({
        // Targeting an unknown event id makes the only operation fail,
        // so nothing is applied.
        operationName: 'insert_before_event',
        operationTargetEvent: 'nonexistent-event-id',
      }),
    });

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        onSceneEventsModifiedOutsideEditor,
        args: makeArgs({}),
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toEqual(
      expect.stringContaining('Events generated but not applied.')
    );
    // The generated event id is carried like on every other failure, so the
    // editor can keep tracking this generation.
    expect(result.aiGeneratedEventId).toBe('test-ai-event-id');
    expect(result.errors).toEqual([
      expect.stringContaining(
        'Could not find event with aiGeneratedEventId "nonexistent-event-id"'
      ),
    ]);
    // Nothing was applied: no event added, no editor notification.
    expect(
      project
        .getLayout('TestScene')
        .getEvents()
        .getEventsCount()
    ).toBe(0);
    expect(onSceneEventsModifiedOutsideEditor).not.toHaveBeenCalled();
  });

  it('fails with aggregated diagnostics when the generated events are invalid', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: true,
      aiGeneratedEvent: makeFakeAiGeneratedEvent([
        {
          areEventsValid: false,
          diagnosticLines: ['Unknown object "Playerr".', 'Missing action.'],
        },
        {
          isEventsJsonValid: false,
          diagnosticLines: ['Malformed JSON.'],
        },
      ]),
    });

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: makeArgs({}),
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toEqual(
      expect.stringContaining('Generated events invalid:')
    );
    expect(result.aiGeneratedEventId).toBe('test-ai-event-id');
    // Each change's diagnostics are joined, separated by a blank line.
    expect(result.generatedEventsErrorDiagnostics).toBe(
      'Unknown object "Playerr".\nMissing action.\n\nMalformed JSON.'
    );
    expect(
      project
        .getLayout('TestScene')
        .getEvents()
        .getEventsCount()
    ).toBe(0);
  });

  it('succeeds with errors when only some changes could be applied', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: true,
      aiGeneratedEvent: makeFakeAiGeneratedEvent([
        // Applies fine.
        {},
        // Targets an unknown event id: this change alone fails.
        {
          operationName: 'insert_before_event',
          operationTargetEvent: 'nonexistent-event-id',
        },
      ]),
    });

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: makeArgs({}),
      }
    );

    expect(result.success).toBe(true);
    expect(result.message).toEqual(
      expect.stringContaining('Events generated but some applies failed.')
    );
    expect(result.errors).toEqual([
      expect.stringContaining(
        'Could not find event with aiGeneratedEventId "nonexistent-event-id"'
      ),
    ]);
    // The valid change was applied.
    expect(
      project
        .getLayout('TestScene')
        .getEvents()
        .getEventsCount()
    ).toBe(1);
  });

  it('fails when event_batches is an empty array', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn();

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: {
          scene_name: 'TestScene',
          extension_names_list: '',
          objects_list: 'Player',
          event_batches: [],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'No event batches provided. Provide one or more with a description of events to generate.'
    );
    expect(generateEvents).not.toHaveBeenCalled();
  });

  it('fails when a non-delete event batch has no description nor script', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn();

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: {
          scene_name: 'TestScene',
          extension_names_list: '',
          objects_list: 'Player',
          event_batches: [
            { events_description: 'Make the player jump' },
            { placement_relation: 'after' }, // No description: invalid.
          ],
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'No events description/events script provided for some event batches. Provide one for each event(s) to generate.'
    );
    expect(generateEvents).not.toHaveBeenCalled();
  });

  it('fails when an extension required by the generated events cannot be installed', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const ensureExtensionInstalled = jest.fn();
    ensureExtensionInstalled.mockRejectedValue(new Error('Network down'));
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: true,
      aiGeneratedEvent: makeFakeAiGeneratedEvent({
        extensionNames: ['SomeExtension'],
      }),
    });

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        ensureExtensionInstalled,
        args: makeArgs({}),
      }
    );

    expect(ensureExtensionInstalled).toHaveBeenCalledWith(
      expect.objectContaining({ extensionName: 'SomeExtension' })
    );
    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Error installing extensions: Network down. Try again or a different approach.'
    );
    expect(result.aiGeneratedEventId).toBe('test-ai-event-id');
    // No event was applied.
    expect(
      project
        .getLayout('TestScene')
        .getEvents()
        .getEventsCount()
    ).toBe(0);
  });

  it('declares the undeclared variables referenced by the generated events', async () => {
    const scene = project.getLayout('TestScene');
    scene.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: true,
      aiGeneratedEvent: makeFakeAiGeneratedEvent({
        undeclaredVariables: [
          { name: 'score', type: 'Number', requiredScope: 'scene' },
          { name: 'settings', type: 'Structure', requiredScope: 'global' },
        ],
        undeclaredObjectVariables: {
          Player: [{ name: 'health', type: 'Number', requiredScope: 'none' }],
        },
      }),
    });

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: makeArgs({}),
      }
    );

    expect(result.success).toBe(true);
    expect(scene.getVariables().has('score')).toBe(true);
    expect(
      scene
        .getVariables()
        .get('score')
        .getType()
    ).toBe(gd.Variable.Number);
    expect(project.getVariables().has('settings')).toBe(true);
    expect(
      project
        .getVariables()
        .get('settings')
        .getType()
    ).toBe(gd.Variable.Structure);
    expect(
      scene
        .getObjects()
        .getObject('Player')
        .getVariables()
        .has('health')
    ).toBe(true);
  });

  it('fails when the AI generated event contains an error', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: true,
      aiGeneratedEvent: {
        id: 'test-ai-event-id',
        error: { message: 'Model crashed' },
        changes: [],
        resultMessage: '',
      },
    });

    const result: EditorFunctionGenericOutput = await editorFunctions.add_scene_events.launchFunction(
      {
        ...makeFakeLaunchFunctionOptionsWithProject(project),
        generateEvents,
        args: makeArgs({}),
      }
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Infrastructure error generating events (Model crashed). Try again or a different approach.'
    );
    expect(result.aiGeneratedEventId).toBe('test-ai-event-id');
  });
});
