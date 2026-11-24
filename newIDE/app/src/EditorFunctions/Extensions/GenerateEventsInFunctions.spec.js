// @flow
import { editorFunctions, type EditorFunctionGenericOutput } from '../index';
import { makeFakeLaunchFunctionOptionsWithProject } from '../TestHelpers';
import { makeStoreExtensionReadOnlyMessage, type ToolScope } from '../Scope';
import { EXTENSION_STORE_ORIGIN_NAME } from '../SimplifiedProject/SimplifiedExtensions';
import {
  type AiGeneratedEvent,
  type AiGeneratedEventChange,
} from '../../Utils/GDevelopServices/Generation';
import { serializeToJSON } from '../../Utils/Serializer';

const gd: libGDevelop = global.gd;

const fakeAiGeneratedEventId = 'fake-ai-generated-event-id';

/**
 * A project with an extension "Tank" holding a custom object "CombinedTank"
 * (children `TankBase` and `TankTop_Combined`, a property `CannonAngle`, a
 * named variant `Camo` and a function `onCreated` with one event) and a scene.
 */
const createFakeProjectWithCustomObject = (project: gdProject) => {
  project.insertNewLayout('Level', 0);

  const extension = project.insertNewEventsFunctionsExtension('Tank', 0);
  extension
    .getGlobalVariables()
    .insertNew('Difficulty', 0)
    .setValue(1);
  extension
    .getSceneVariables()
    .insertNew('WaveCount', 0)
    .setValue(0);

  const eventsBasedObject = extension
    .getEventsBasedObjects()
    .insertNew('CombinedTank', 0);
  eventsBasedObject
    .getPropertyDescriptors()
    .insertNew('CannonAngle', 0)
    .setType('Number')
    .setValue('0');
  eventsBasedObject
    .getObjects()
    .insertNewObject(project, 'Sprite', 'TankBase', 0);
  eventsBasedObject
    .getObjects()
    .insertNewObject(project, 'Sprite', 'TankTop_Combined', 1);
  // A group over the two children: what is declared on it reaches both.
  const tankParts = eventsBasedObject
    .getObjects()
    .getObjectGroups()
    .insertNew('TankParts', 0);
  tankParts.addObject('TankBase');
  tankParts.addObject('TankTop_Combined');

  const onCreatedFunction = eventsBasedObject
    .getEventsFunctions()
    .insertNewEventsFunction('onCreated', 0);
  onCreatedFunction
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
  gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
    extension,
    eventsBasedObject
  );

  eventsBasedObject.getVariants().insertNewVariant('Camo', 0);
  gd.EventsBasedObjectVariantHelper.complyVariantsToEventsBasedObject(
    project,
    eventsBasedObject
  );

  return { extension, eventsBasedObject, onCreatedFunction };
};

const combinedTankScope: ToolScope = {
  type: 'custom_object',
  extension_name: 'Tank',
  custom_object_name: 'CombinedTank',
};

const getChildObject = (
  project: gdProject,
  variantName: string,
  objectName: string
): gdObject => {
  const eventsBasedObject = project
    .getEventsFunctionsExtension('Tank')
    .getEventsBasedObjects()
    .get('CombinedTank');
  const variant = variantName
    ? eventsBasedObject.getVariants().getVariant(variantName)
    : eventsBasedObject.getDefaultVariant();
  return variant.getObjects().getObject(objectName);
};

/**
 * A change as the generation backend returns it: an event rotating the child
 * object `TankTop_Combined` with the `CannonAngle` property of the custom
 * object, added at the end of the function events.
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
      actions: [
        {
          type: { value: 'SetAngle' },
          parameters: ['TankTop_Combined', '=', 'CannonAngle'],
        },
      ],
    },
  ]),
  areEventsValid: true,
  extensionNames: [],
  diagnosticLines: [],
  undeclaredVariables: [],
  undeclaredObjectVariables: {},
  missingObjectBehaviors: {},
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
  eventsDescription: 'Rotate the tank top when the object is created',
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

describe('generate_events in a function of an extension', () => {
  let project: gdProject;
  let extension: gdEventsFunctionsExtension;
  let eventsBasedObject: gdEventsBasedObject;
  let onCreatedFunction: gdEventsFunction;
  let consoleWarnSpy;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
    ({
      extension,
      eventsBasedObject,
      onCreatedFunction,
    } = createFakeProjectWithCustomObject(project));
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    project.delete();
  });

  const launch = async (
    args: any,
    options?: Object
  ): Promise<EditorFunctionGenericOutput> =>
    editorFunctions.generate_events.launchFunction({
      ...makeFakeLaunchFunctionOptionsWithProject(project),
      ...options,
      args,
    });

  const makeArgs = (partialArgs?: Object) => ({
    scope: combinedTankScope,
    function_name: 'onCreated',
    events_description: 'Rotate the tank top when the object is created',
    extension_names_list: '',
    objects_list: 'TankTop_Combined',
    ...partialArgs,
  });

  it('generates the events of the function, notifies the editors and regenerates the extension', async () => {
    // The extensions must be regenerated BEFORE the generation (the summary
    // uploaded with it must describe them as they are now).
    const callOrder: Array<string> = [];
    const generateEvents = jest.fn(async () => {
      callOrder.push('generateEvents');
      return {
        generationCompleted: true,
        aiGeneratedEvent: createFakeAiGeneratedEvent([createFakeChange()]),
      };
    });
    const ensureExtensionsUpToDate = jest.fn(async () => {
      callOrder.push('ensureExtensionsUpToDate');
    });
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const onSceneEventsModifiedOutsideEditor = jest.fn();
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const onExtensionsModifiedOutsideEditor = jest.fn();
    const existingEventsJsonBeforeGeneration = serializeToJSON(
      onCreatedFunction.getEvents()
    );

    const result = await launch(makeArgs(), {
      generateEvents,
      ensureExtensionsUpToDate,
      onSceneEventsModifiedOutsideEditor,
      onExtensionsModifiedOutsideEditor,
    });

    expect(result.success).toBe(true);
    expect(result.aiGeneratedEventId).toBe(fakeAiGeneratedEventId);

    // The generation is asked for the function, with the events it already
    // has (and no scene name: there is no scene involved).
    expect(generateEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: combinedTankScope,
        functionName: 'onCreated',
        sceneName: '',
        existingEventsJson: existingEventsJsonBeforeGeneration,
      })
    );

    expect(callOrder).toEqual(['ensureExtensionsUpToDate', 'generateEvents']);

    // The events are applied to the events of the function.
    const functionEvents = onCreatedFunction.getEvents();
    expect(functionEvents.getEventsCount()).toBe(2);
    const addedEvent = functionEvents.getEventAt(1);
    expect(addedEvent.getAiGeneratedEventId()).toBe(fakeAiGeneratedEventId);
    const appliedEventsJson = serializeToJSON(functionEvents);
    expect(appliedEventsJson).toContain('TankTop_Combined');
    expect(appliedEventsJson).toContain('CannonAngle');
    // Nothing was written in the scene.
    expect(
      project
        .getLayout('Level')
        .getEvents()
        .getEventsCount()
    ).toBe(0);

    // The extension editor showing this function refreshes its events sheet,
    expect(onSceneEventsModifiedOutsideEditor).toHaveBeenCalledTimes(1);
    const sceneEventsChanges =
      onSceneEventsModifiedOutsideEditor.mock.calls[0][0];
    expect(sceneEventsChanges.scene).toBe(null);
    expect(sceneEventsChanges.extensionName).toBe('Tank');
    expect(
      sceneEventsChanges.eventsFunction && sceneEventsChanges.eventsFunction.ptr
    ).toBe(onCreatedFunction.ptr);
    expect(sceneEventsChanges.newOrChangedAiGeneratedEventIds).toEqual(
      new Set([fakeAiGeneratedEventId])
    );
    // and the code of the extension is regenerated (the function changed).
    expect(onExtensionsModifiedOutsideEditor).toHaveBeenCalledWith({
      extensionNames: ['Tank'],
      needsCodeRegeneration: true,
    });
  });

  it('declares the variables of a child object, and skips those of a parameter object', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: true,
      aiGeneratedEvent: createFakeAiGeneratedEvent([
        createFakeChange({
          undeclaredObjectVariables: {
            TankTop_Combined: [
              { name: 'Hp', type: 'number', requiredScope: 'none' },
            ],
            // `Object` is the custom object itself, picked at runtime: it has
            // no variables container of its own.
            Object: [{ name: 'Ghost', type: 'number', requiredScope: 'none' }],
          },
        }),
      ]),
    });

    const result = await launch(makeArgs(), { generateEvents });

    expect(result.success).toBe(true);
    expect(
      getChildObject(project, '', 'TankTop_Combined')
        .getVariables()
        .has('Hp')
    ).toBe(true);
    // The named variants inherit the variables of the default variant.
    expect(
      getChildObject(project, 'Camo', 'TankTop_Combined')
        .getVariables()
        .has('Hp')
    ).toBe(true);
    // Nothing was created for `Object` (and no crash).
    expect(eventsBasedObject.getObjects().hasObjectNamed('Object')).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Object "Object" is not a child object of custom object "Tank::CombinedTank"'
      )
    );
  });

  it('adds a missing behavior to a child object, but never to a parameter object', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: true,
      aiGeneratedEvent: createFakeAiGeneratedEvent([
        createFakeChange({
          missingObjectBehaviors: {
            TankTop_Combined: [
              {
                objectName: 'TankTop_Combined',
                name: 'PlatformerObject',
                type: 'PlatformBehavior::PlatformerObjectBehavior',
              },
            ],
            Object: [
              {
                objectName: 'Object',
                name: 'PlatformerObject',
                type: 'PlatformBehavior::PlatformerObjectBehavior',
              },
            ],
          },
        }),
      ]),
    });

    const result = await launch(makeArgs(), { generateEvents });

    expect(result.success).toBe(true);
    expect(
      getChildObject(project, '', 'TankTop_Combined').hasBehaviorNamed(
        'PlatformerObject'
      )
    ).toBe(true);
    // The named variants inherit the behaviors of the default variant.
    expect(
      getChildObject(project, 'Camo', 'TankTop_Combined').hasBehaviorNamed(
        'PlatformerObject'
      )
    ).toBe(true);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Object "Object" is not a child object of custom object "Tank::CombinedTank"'
      )
    );
  });

  it('declares the variables and behaviors of a group of child objects on every child, in every variant', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: true,
      aiGeneratedEvent: createFakeAiGeneratedEvent([
        createFakeChange({
          undeclaredObjectVariables: {
            TankParts: [{ name: 'Hp', type: 'number', requiredScope: 'none' }],
          },
          missingObjectBehaviors: {
            TankParts: [
              {
                objectName: 'TankParts',
                name: 'PlatformerObject',
                type: 'PlatformBehavior::PlatformerObjectBehavior',
              },
            ],
          },
        }),
      ]),
    });

    const result = await launch(makeArgs(), { generateEvents });

    expect(result.success).toBe(true);
    for (const variantName of ['', 'Camo']) {
      for (const childName of ['TankBase', 'TankTop_Combined']) {
        const child = getChildObject(project, variantName, childName);
        expect(child.getVariables().has('Hp')).toBe(true);
        expect(child.hasBehaviorNamed('PlatformerObject')).toBe(true);
      }
    }
  });

  it('declares an undeclared variable in the variables of the extension', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn().mockResolvedValue({
      generationCompleted: true,
      aiGeneratedEvent: createFakeAiGeneratedEvent([
        createFakeChange({
          undeclaredVariables: [
            { name: 'BossCount', type: 'number', requiredScope: 'global' },
            { name: 'WaveIndex', type: 'number', requiredScope: 'scene' },
          ],
        }),
      ]),
    });

    const result = await launch(makeArgs(), { generateEvents });

    expect(result.success).toBe(true);
    // There is no scene nor project variable reachable from a function: the
    // extension variables are the only ones that can be declared.
    expect(extension.getGlobalVariables().has('BossCount')).toBe(true);
    expect(extension.getSceneVariables().has('WaveIndex')).toBe(true);
    expect(project.getVariables().has('BossCount')).toBe(false);
    expect(
      project
        .getLayout('Level')
        .getVariables()
        .has('WaveIndex')
    ).toBe(false);
  });

  it('requires a function_name, listing the functions of the custom object', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn();
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const ensureExtensionsUpToDate = jest.fn().mockResolvedValue(undefined);

    const result = await launch(makeArgs({ function_name: undefined }), {
      generateEvents,
      ensureExtensionsUpToDate,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      '`function_name` is required for custom object "Tank::CombinedTank". Existing functions: "onCreated".'
    );
    expect(generateEvents).not.toHaveBeenCalled();
    // A refused call regenerates nothing.
    expect(ensureExtensionsUpToDate).not.toHaveBeenCalled();
  });

  it('fails on an unknown function, listing the existing ones', async () => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn();

    const result = await launch(makeArgs({ function_name: 'onDestroyed' }), {
      generateEvents,
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      'Function "onDestroyed" not found in custom object "Tank::CombinedTank". Existing functions: "onCreated".'
    );
    expect(generateEvents).not.toHaveBeenCalled();
  });

  it('refuses to generate events in an extension installed from the store', async () => {
    extension.setOrigin(EXTENSION_STORE_ORIGIN_NAME, 'Tank');
    // $FlowFixMe[underconstrained-implicit-instantiation]
    const generateEvents = jest.fn();

    const result = await launch(makeArgs(), { generateEvents });

    expect(result.success).toBe(false);
    expect(result.message).toBe(makeStoreExtensionReadOnlyMessage('Tank'));
    expect(generateEvents).not.toHaveBeenCalled();
    expect(onCreatedFunction.getEvents().getEventsCount()).toBe(1);
  });
});
