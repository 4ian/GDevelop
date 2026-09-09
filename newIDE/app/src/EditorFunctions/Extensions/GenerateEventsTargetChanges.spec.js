// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from '../index';
import { makeFakeLaunchFunctionOptionsWithProject } from '../TestHelpers';
import { type ToolScope } from '../Scope';
import {
  type AiGeneratedEvent,
  type AiGeneratedEventChange,
} from '../../Utils/GDevelopServices/Generation';
import { renderEventSourceById } from '../../EventsSheet/EventsTree/TextRenderer/EventScriptSourceView';

const gd: libGDevelop = global.gd;

const fakeAiGeneratedEventId = 'fake-ai-generated-event-id';

/**
 * A project with a scene "Level" holding one comment event, and an extension
 * "Tank" holding a custom object "CombinedTank" (a child object and a function
 * `onCreated`) and a custom behavior "Shield" (a function `Absorb`).
 */
const createFakeProject = (project: gdProject) => {
  const scene = project.insertNewLayout('Level', 0);
  scene.getObjects().insertNewObject(project, 'Sprite', 'Player', 0);
  const comment = gd.asCommentEvent(
    scene
      .getEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::Comment', 0)
  );
  comment.setComment('The events of the level');

  const extension = project.insertNewEventsFunctionsExtension('Tank', 0);

  const eventsBasedObject = extension
    .getEventsBasedObjects()
    .insertNew('CombinedTank', 0);
  eventsBasedObject
    .getObjects()
    .insertNewObject(project, 'Sprite', 'TankTop_Combined', 0);
  eventsBasedObject
    .getEventsFunctions()
    .insertNewEventsFunction('onCreated', 0);
  gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
    extension,
    eventsBasedObject
  );

  const eventsBasedBehavior = extension
    .getEventsBasedBehaviors()
    .insertNew('Shield', 0);
  eventsBasedBehavior.getEventsFunctions().insertNewEventsFunction('Absorb', 0);
  gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
    extension,
    eventsBasedBehavior
  );

  return { scene, extension, eventsBasedObject, eventsBasedBehavior };
};

const combinedTankScope: ToolScope = {
  type: 'custom_object',
  extension_name: 'Tank',
  custom_object_name: 'CombinedTank',
};

const shieldScope: ToolScope = {
  type: 'custom_behavior',
  extension_name: 'Tank',
  custom_behavior_name: 'Shield',
};

const levelScope: ToolScope = {
  type: 'scene',
  scene_name: 'Level',
};

/**
 * A change as the generation backend returns it: an empty event added at the
 * end of the target events, with a variable and a behavior to declare (nothing
 * of this must be applied when the target is gone).
 */
const createFakeChange = (
  partialChange?: Partial<AiGeneratedEventChange>
): AiGeneratedEventChange => ({
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
  undeclaredVariables: [
    { name: 'BossCount', type: 'number', requiredScope: 'global' },
  ],
  undeclaredObjectVariables: {},
  missingObjectBehaviors: {
    TankTop_Combined: [
      {
        objectName: 'TankTop_Combined',
        name: 'PlatformerObject',
        type: 'PlatformBehavior::PlatformerObjectBehavior',
      },
    ],
    Player: [
      {
        objectName: 'Player',
        name: 'PlatformerObject',
        type: 'PlatformBehavior::PlatformerObjectBehavior',
      },
    ],
  },
  missingResources: [],
  ...partialChange,
});

const createFakeAiGeneratedEvent = (
  changes: Array<AiGeneratedEventChange>
): AiGeneratedEvent => ({
  id: fakeAiGeneratedEventId,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  userId: 'fake-user-id',
  status: 'ready',
  partialGameProjectJson: '{}',
  eventsDescription: 'Some events',
  eventBatches: null,
  extensionNamesList: '',
  objectsList: '',
  existingEventsJson: null,
  existingEventsJsonUserRelativeKey: null,
  resultMessage: 'Modified or added event(s).',
  changes,
  error: null,
  stats: null,
});

describe('generate_events when its target changes while generating', () => {
  let project: gdProject;
  let scene: gdLayout;
  let extension: gdEventsFunctionsExtension;
  let eventsBasedObject: gdEventsBasedObject;
  let eventsBasedBehavior: gdEventsBasedBehavior;
  let onSceneEventsModifiedOutsideEditor;

  beforeEach(() => {
    project = gd.ProjectHelper.createNewGDJSProject();
    ({
      scene,
      extension,
      eventsBasedObject,
      eventsBasedBehavior,
    } = createFakeProject(project));
    // $FlowFixMe[underconstrained-implicit-instantiation]
    onSceneEventsModifiedOutsideEditor = jest.fn();
  });

  afterEach(() => {
    project.delete();
  });

  const launch = async (
    args: any,
    options?: Object
  ): Promise<EditorFunctionGenericOutput> =>
    editorFunctions.generate_events.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      onSceneEventsModifiedOutsideEditor,
      ...options,
      args,
    });

  const makeArgs = (partialArgs?: Object) => ({
    scope: combinedTankScope,
    function_name: 'onCreated',
    events_description: 'Do something when the object is created',
    extension_names_list: '',
    objects_list: '',
    ...partialArgs,
  });

  /**
   * A `generateEvents` staying pending until `finishGeneration` is called, so
   * that the project can be changed while the generation runs.
   */
  const makePendingGeneration = (changes: Array<AiGeneratedEventChange>) => {
    let onGenerationStarted = () => {};
    const generationStarted: Promise<void> = new Promise(resolve => {
      onGenerationStarted = resolve;
    });
    let finishGeneration = () => {};
    const generationFinished: Promise<void> = new Promise(resolve => {
      finishGeneration = resolve;
    });
    const generateEvents = jest.fn(async () => {
      onGenerationStarted();
      await generationFinished;
      return {
        generationCompleted: true,
        aiGeneratedEvent: createFakeAiGeneratedEvent(changes),
      };
    });

    return {
      generateEvents,
      generationStarted,
      finishGeneration: () => finishGeneration(),
    };
  };

  const getChildObject = (objectName: string): gdObject =>
    project
      .getEventsFunctionsExtension('Tank')
      .getEventsBasedObjects()
      .get('CombinedTank')
      .getDefaultVariant()
      .getObjects()
      .getObject(objectName);

  /** Nothing at all was written: no events, no variables, no behaviors. */
  const expectNothingWasChanged = () => {
    expect(scene.getEvents().getEventsCount()).toBe(1);
    expect(project.getVariables().has('BossCount')).toBe(false);
    expect(extension.getGlobalVariables().has('BossCount')).toBe(false);
    expect(
      scene
        .getObjects()
        .getObject('Player')
        .hasBehaviorNamed('PlatformerObject')
    ).toBe(false);
    expect(onSceneEventsModifiedOutsideEditor).not.toHaveBeenCalled();
  };

  it('fails without writing anything when the target function is deleted while generating', async () => {
    const {
      generateEvents,
      generationStarted,
      finishGeneration,
    } = makePendingGeneration([createFakeChange()]);

    const resultPromise = launch(makeArgs(), { generateEvents });
    await generationStarted;
    eventsBasedObject.getEventsFunctions().removeEventsFunction('onCreated');
    finishGeneration();
    const result = await resultPromise;

    expect(result.success).toBe(false);
    expect(result.message).toContain('not available anymore');
    expect(result.message).toContain('Function "onCreated" not found');
    // The failure is still tied to the generation, like every other one.
    expect(result.aiGeneratedEventId).toBe(fakeAiGeneratedEventId);
    expect(
      getChildObject('TankTop_Combined').hasBehaviorNamed('PlatformerObject')
    ).toBe(false);
    expectNothingWasChanged();
  });

  it('fails without writing anything when the custom object owning the function is renamed while generating', async () => {
    const {
      generateEvents,
      generationStarted,
      finishGeneration,
    } = makePendingGeneration([createFakeChange()]);

    const resultPromise = launch(makeArgs(), { generateEvents });
    await generationStarted;
    gd.WholeProjectRefactorer.renameEventsBasedObject(
      project,
      extension,
      'CombinedTank',
      'RenamedTank'
    );
    eventsBasedObject.setName('RenamedTank');
    finishGeneration();
    const result = await resultPromise;

    expect(result.success).toBe(false);
    expect(result.message).toContain('not available anymore');
    // The renamed custom object was not written in either.
    expect(
      extension
        .getEventsBasedObjects()
        .get('RenamedTank')
        .getEventsFunctions()
        .getEventsFunction('onCreated')
        .getEvents()
        .getEventsCount()
    ).toBe(0);
    expectNothingWasChanged();
  });

  it('fails without writing anything when the custom behavior owning the function is renamed while generating', async () => {
    const {
      generateEvents,
      generationStarted,
      finishGeneration,
    } = makePendingGeneration([createFakeChange()]);

    const resultPromise = launch(
      makeArgs({ scope: shieldScope, function_name: 'Absorb' }),
      { generateEvents }
    );
    await generationStarted;
    gd.WholeProjectRefactorer.renameEventsBasedBehavior(
      project,
      extension,
      'Shield',
      'RenamedShield'
    );
    eventsBasedBehavior.setName('RenamedShield');
    finishGeneration();
    const result = await resultPromise;

    expect(result.success).toBe(false);
    expect(result.message).toContain('not available anymore');
    expect(
      extension
        .getEventsBasedBehaviors()
        .get('RenamedShield')
        .getEventsFunctions()
        .getEventsFunction('Absorb')
        .getEvents()
        .getEventsCount()
    ).toBe(0);
    expectNothingWasChanged();
  });

  it('writes in the function that replaced a deleted one with the same name', async () => {
    const {
      generateEvents,
      generationStarted,
      finishGeneration,
    } = makePendingGeneration([
      createFakeChange({
        undeclaredVariables: [],
        missingObjectBehaviors: {},
      }),
    ]);

    const resultPromise = launch(makeArgs(), { generateEvents });
    await generationStarted;
    const eventsFunctions = eventsBasedObject.getEventsFunctions();
    eventsFunctions.removeEventsFunction('onCreated');
    eventsFunctions.insertNewEventsFunction('onCreated', 0);
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      extension,
      eventsBasedObject
    );
    finishGeneration();
    const result = await resultPromise;

    // The events are written in the function that exists now.
    expect(result.success).toBe(true);
    const recreatedFunction = eventsBasedObject
      .getEventsFunctions()
      .getEventsFunction('onCreated');
    expect(recreatedFunction.getEvents().getEventsCount()).toBe(1);
    expect(
      recreatedFunction
        .getEvents()
        .getEventAt(0)
        .getAiGeneratedEventId()
    ).toBe(fakeAiGeneratedEventId);
    // The editors are told about this very function, and nothing else was
    // written (the events of the behavior and of the scene are untouched).
    expect(onSceneEventsModifiedOutsideEditor).toHaveBeenCalledTimes(1);
    const sceneEventsChanges =
      onSceneEventsModifiedOutsideEditor.mock.calls[0][0];
    expect(
      sceneEventsChanges.eventsFunction && sceneEventsChanges.eventsFunction.ptr
    ).toBe(recreatedFunction.ptr);
    expect(
      eventsBasedBehavior
        .getEventsFunctions()
        .getEventsFunction('Absorb')
        .getEvents()
        .getEventsCount()
    ).toBe(0);
    expect(scene.getEvents().getEventsCount()).toBe(1);
  });

  it('fails without writing anything when the target scene is deleted while generating', async () => {
    const {
      generateEvents,
      generationStarted,
      finishGeneration,
    } = makePendingGeneration([createFakeChange()]);

    const resultPromise = launch(
      makeArgs({ scope: levelScope, function_name: undefined }),
      { generateEvents }
    );
    await generationStarted;
    project.removeLayout('Level');
    finishGeneration();
    const result = await resultPromise;

    expect(result.success).toBe(false);
    expect(result.message).toContain('not available anymore');
    expect(result.message).toContain('Scene not found');
    expect(project.hasLayoutNamed('Level')).toBe(false);
    expect(project.getVariables().has('BossCount')).toBe(false);
    expect(onSceneEventsModifiedOutsideEditor).not.toHaveBeenCalled();
  });

  const makeReplaceCommentArgs = () => ({
    scope: levelScope,
    extension_names_list: '',
    objects_list: '',
    event_batches: [
      {
        events_description: 'Replace the comment',
        placement_relation: 'replace_event_but_keep_existing_sub_events',
        placement_target_event_id: 'event-0',
        expected_event_source: renderEventSourceById({
          eventsList: scene.getEvents(),
          eventIdOrGroupName: 'event-0',
          includeSubEvents: false,
        }),
      },
    ],
  });

  const replaceCommentChange = () =>
    createFakeChange({
      operationName: 'replace_event_but_keep_existing_sub_events',
      operationTargetEvent: 'event-0',
      undeclaredVariables: [],
      missingObjectBehaviors: {},
    });

  it('fails without writing anything when the event to replace changed while generating', async () => {
    const {
      generateEvents,
      generationStarted,
      finishGeneration,
    } = makePendingGeneration([replaceCommentChange()]);

    const resultPromise = launch(makeReplaceCommentArgs(), { generateEvents });
    await generationStarted;
    gd.asCommentEvent(scene.getEvents().getEventAt(0)).setComment(
      'Rewritten by the user'
    );
    finishGeneration();
    const result = await resultPromise;

    expect(result.success).toBe(false);
    expect(result.message).toContain(
      'changed while the events were being generated'
    );
    // The event the user rewrote is still there, untouched.
    expect(scene.getEvents().getEventsCount()).toBe(1);
    expect(
      gd.asCommentEvent(scene.getEvents().getEventAt(0)).getComment()
    ).toBe('Rewritten by the user');
    expect(onSceneEventsModifiedOutsideEditor).not.toHaveBeenCalled();
  });

  it('replaces the event when it did not change while generating', async () => {
    const {
      generateEvents,
      generationStarted,
      finishGeneration,
    } = makePendingGeneration([replaceCommentChange()]);

    const resultPromise = launch(makeReplaceCommentArgs(), { generateEvents });
    await generationStarted;
    finishGeneration();
    const result = await resultPromise;

    expect(result.success).toBe(true);
    expect(scene.getEvents().getEventsCount()).toBe(1);
    expect(
      scene
        .getEvents()
        .getEventAt(0)
        .getType()
    ).toBe('BuiltinCommonInstructions::Standard');
    expect(onSceneEventsModifiedOutsideEditor).toHaveBeenCalledTimes(1);
  });
});
