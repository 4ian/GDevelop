// @flow
import { makeTestExtensions } from '../fixtures/TestExtensions';
import { createTree, createTreeInListOrder } from './CreateTree';
import { type EnumeratedInstructionMetadata } from './EnumeratedInstructionOrExpressionMetadata';
import {
  enumerateAllInstructions,
  enumerateObjectAndBehaviorsInstructions,
  getObjectParameterIndex,
} from './EnumerateInstructions';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  reloadProjectEventsFunctionsExtensionMetadata,
  type EventsFunctionCodeWriter,
} from '../EventsFunctionsExtensionsLoader';

const gd: libGDevelop = global.gd;

// $FlowFixMe[incompatible-type]
// $FlowFixMe[missing-local-annot]
// $FlowFixMe[cannot-resolve-name]
const makeFakeI18n = (fakeI18n): I18nType => ({
  ...fakeI18n,
  _: message => (typeof message === 'string' ? message : message.id),
});

const fakeEventsFunctionCodeWriter: EventsFunctionCodeWriter = {
  getIncludeFileFor: (functionName: string) => `fake-${functionName}.js`,
  writeFunctionCode: () => Promise.resolve(),
  writeBehaviorCode: () => Promise.resolve(),
  writeObjectCode: () => Promise.resolve(),
};

const addEventsFunction = (
  eventsFunctionsContainer: gdEventsFunctionsContainer,
  name: string,
  group: string
): gdEventsFunction => {
  const eventsFunction = eventsFunctionsContainer.insertNewEventsFunction(
    name,
    eventsFunctionsContainer.getEventsFunctionsCount()
  );
  eventsFunction.setFunctionType(gd.EventsFunction.Action);
  eventsFunction.setFullName(name);
  eventsFunction.setGroup(group);
  return eventsFunction;
};

const getTopLevelGroupNames = (
  instructions: Array<EnumeratedInstructionMetadata>
): Array<string> => Object.keys(createTreeInListOrder(instructions));

describe('EnumerateInstructions', () => {
  it('can enumerate instructions being conditions', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const instructions = enumerateAllInstructions(
      true,
      project,
      // $FlowFixMe[incompatible-type] The fake I18n translates groups to empty strings.
      null
    );

    // Test for the proper presence of a few conditions
    expect(
      instructions.find(
        instruction =>
          instruction.type ===
          'AnimatableCapability::AnimatableBehavior::HasAnimationEnded'
      )
    ).toEqual(
      expect.objectContaining({
        displayedName: 'Animation finished',
        fullGroupName:
          'General ❯ Objects with animations ❯ Animations and images',
        type: 'AnimatableCapability::AnimatableBehavior::HasAnimationEnded',
      })
    );
    expect(
      instructions.find(instruction => instruction.type === 'Sprite')
    ).toEqual(
      expect.objectContaining({
        displayedName: 'Current frame',
        fullGroupName: 'General ❯ Sprite ❯ Animations and images',
        type: 'Sprite',
      })
    );
    expect(
      instructions.find(
        instruction => instruction.type === 'BuiltinCommonInstructions::Once'
      )
    ).toEqual(
      expect.objectContaining({
        displayedName: 'Trigger once while true',
        fullGroupName: 'Advanced ❯ Events and control flow',
        type: 'BuiltinCommonInstructions::Once',
      })
    );
    expect(
      instructions.find(instruction => instruction.type === 'IsCursorOnObject')
    ).toEqual(
      expect.objectContaining({
        displayedName: 'The cursor/touch is on an object',
        fullGroupName: 'General ❯ Objects ❯ Mouse and touch',
        type: 'IsCursorOnObject',
      })
    );
    project.delete();
  });

  it('can enumerate instructions being actions', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const instructions = enumerateAllInstructions(
      false,
      project,
      // $FlowFixMe[incompatible-type] The fake I18n translates groups to empty strings.
      null
    );

    // Test for the proper presence of a few actions
    expect(instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayedName: 'Start (or reset) a scene timer',
          fullGroupName: 'General ❯ Timers and time',
          type: 'ResetTimer',
        }),
        expect.objectContaining({
          displayedName: 'Rotate',
          fullGroupName: 'General ❯ Objects ❯ Angle',
          type: 'Rotate',
        }),
      ])
    );
    project.delete();
  });

  it('can enumerate instructions of deprecated extensions in old projects', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const serializedProject = serializeToJSObject(project);
    serializedProject.initialGDVersion = '5.6.269';
    unserializeFromJSObject(project, serializedProject);

    const instructions = enumerateAllInstructions(
      false,
      project,
      // $FlowFixMe[incompatible-type] The fake I18n translates groups to empty strings.
      null
    );

    expect(
      instructions.some(instruction => instruction.type === 'Inventory::Add')
    ).toBe(true);
    expect(
      instructions.some(
        instruction =>
          instruction.type ===
          'PhysicsBehavior::ApplyForceUsingPolarCoordinates'
      )
    ).toBe(true);
    expect(
      instructions.some(
        instruction => instruction.type === 'TextEntryObject::String'
      )
    ).toBe(true);
    project.delete();
  });

  it('can enumerate instructions of deprecated extensions in very old projects', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const serializedProject = serializeToJSObject(project);
    delete serializedProject.initialGDVersion;
    unserializeFromJSObject(project, serializedProject);

    const instructions = enumerateAllInstructions(
      false,
      project,
      // $FlowFixMe[incompatible-type] The fake I18n translates groups to empty strings.
      null
    );

    expect(
      instructions.some(instruction => instruction.type === 'Inventory::Add')
    ).toBe(true);
    expect(
      instructions.some(
        instruction =>
          instruction.type ===
          'PhysicsBehavior::ApplyForceUsingPolarCoordinates'
      )
    ).toBe(true);
    expect(
      instructions.some(
        instruction => instruction.type === 'TextEntryObject::String'
      )
    ).toBe(true);
    project.delete();
  });

  it('can enumerate instructions hiding deprecated extensions in new projects', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const serializedProject = serializeToJSObject(project);
    serializedProject.initialGDVersion = '5.6.270';
    unserializeFromJSObject(project, serializedProject);

    const instructions = enumerateAllInstructions(
      false,
      project,
      // $FlowFixMe[incompatible-type] The fake I18n translates groups to empty strings.
      null
    );

    expect(
      instructions.every(instruction => instruction.type !== 'Inventory::Add')
    );
    expect(
      instructions.every(
        instruction =>
          instruction.type !==
          'PhysicsBehavior::ApplyForceUsingPolarCoordinates'
      )
    ).toBe(true);
    expect(
      instructions.every(
        instruction => instruction.type !== 'TextEntryObject::String'
      )
    ).toBe(true);
    project.delete();
  });

  it('can create the tree of instructions', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const instructions = enumerateAllInstructions(
      true,
      project,
      makeFakeI18n()
    );
    const tree = createTree(instructions, makeFakeI18n());
    expect(tree).toHaveProperty('Advanced');
    expect(tree).toHaveProperty('Audio');
    expect(tree).toMatchObject({
      Advanced: {
        'Events and control flow': {
          'BuiltinCommonInstructions::Once': {
            displayedName: 'Trigger once while true',
            fullGroupName: 'Advanced ❯ Events and control flow',
            type: 'BuiltinCommonInstructions::Once',
          },
        },
      },
      Audio: {
        'Sounds and music': {
          GlobalVolume: {
            displayedName: 'Global volume',
            fullGroupName: 'Audio ❯ Sounds and music',
            type: 'GlobalVolume',
          },
        },
      },
    });
    project.delete();
  });

  it('can find the object parameter, if any', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const actions = enumerateAllInstructions(false, project, makeFakeI18n());
    const conditions = enumerateAllInstructions(true, project, makeFakeI18n());

    const createInstruction = actions.filter(
      ({ type }) => type === 'Create'
    )[0];
    expect(createInstruction).not.toBeUndefined();
    expect(getObjectParameterIndex(createInstruction.metadata)).toBe(1);

    const pickRandom = actions.filter(
      ({ type }) => type === 'PickRandomInstance'
    )[0];
    expect(pickRandom).not.toBeUndefined();
    expect(getObjectParameterIndex(pickRandom.metadata)).toBe(1);

    const pickAll = actions.filter(
      ({ type }) => type === 'PickAllInstances'
    )[0];
    expect(pickAll).not.toBeUndefined();
    expect(getObjectParameterIndex(pickAll.metadata)).toBe(1);

    const triggerOnce = conditions.filter(
      ({ type }) => type === 'BuiltinCommonInstructions::Once'
    )[0];
    expect(triggerOnce).not.toBeUndefined();
    expect(getObjectParameterIndex(triggerOnce.metadata)).toBe(-1);

    const spriteAnimationEnded = conditions.filter(
      ({ type }) =>
        type === 'AnimatableCapability::AnimatableBehavior::HasAnimationEnded'
    )[0];
    expect(spriteAnimationEnded).not.toBeUndefined();
    expect(getObjectParameterIndex(spriteAnimationEnded.metadata)).toBe(0);
    project.delete();
  });

  it('can enumerate instructions for an object (Sprite)', () => {
    makeTestExtensions(gd);
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'MySpriteObject', 0);

    // Test for the proper presence of a few conditions.
    const spriteInstructions = enumerateObjectAndBehaviorsInstructions(
      true,
      project.getObjects(),
      layout.getObjects(),
      'MySpriteObject',
      project,
      makeFakeI18n()
    );
    expect(spriteInstructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayedName: 'Animation finished',
          type: 'AnimatableCapability::AnimatableBehavior::HasAnimationEnded',
        }),
        expect.objectContaining({
          displayedName: 'The cursor/touch is on an object',
          type: 'IsCursorOnObject',
        }),
      ])
    );
    project.delete();
  });

  it('orders the instructions of an object from the most specific to the most generic', () => {
    makeTestExtensions(gd);
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const object = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'MySpriteObject', 0);
    object.addNewBehavior(
      project,
      'PlatformBehavior::PlatformerObjectBehavior',
      'PlatformerObject'
    );

    const spriteActions = enumerateObjectAndBehaviorsInstructions(
      false,
      project.getObjects(),
      layout.getObjects(),
      'MySpriteObject',
      project,
      makeFakeI18n()
    );

    // The groups of the Sprite, then of its behavior, then the ones of all
    // objects (including the default behaviors of the Sprite).
    expect(getTopLevelGroupNames(spriteActions).slice(0, 9)).toEqual([
      'Animations and images',
      'Effects',
      'Platformer configuration',
      'Platformer state',
      'Platformer controls',
      'Objects',
      'Position',
      'Angle',
      'Size',
    ]);
    // A capability instruction is shown with the Sprite ones in the same group.
    expect(
      spriteActions
        .filter(
          instruction => instruction.fullGroupName === 'Animations and images'
        )
        .map(instruction => instruction.type)
    ).toEqual(
      expect.arrayContaining([
        'ChangeSprite',
        'AnimatableCapability::AnimatableBehavior::SetName',
      ])
    );
    project.delete();
  });

  it('orders the instructions of a custom object and a custom behavior as declared in their extension', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
    extension.setFullName('My extension');

    const eventsBasedObject = extension
      .getEventsBasedObjects()
      .insertNew('MyShop', 0);
    const objectFunctions = eventsBasedObject.getEventsFunctions();
    addEventsFunction(objectFunctions, 'Open', 'Shop');
    addEventsFunction(objectFunctions, 'AddItem', 'Items');
    addEventsFunction(objectFunctions, 'Close', 'Shop');
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      extension,
      eventsBasedObject
    );

    const eventsBasedBehavior = extension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);
    eventsBasedBehavior.setFullName('My behavior');
    addEventsFunction(eventsBasedBehavior.getEventsFunctions(), 'Shake', '');
    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      extension,
      eventsBasedBehavior
    );

    // A free function that can be used with any object.
    const maskFunction = addEventsFunction(
      extension.getEventsFunctions(),
      'Mask',
      ''
    );
    maskFunction
      .getParameters()
      .addNewParameter('Object')
      .setType('objectList');

    reloadProjectEventsFunctionsExtensionMetadata(
      project,
      extension,
      fakeEventsFunctionCodeWriter,
      makeFakeI18n()
    );
    const layout = project.insertNewLayout('Scene', 0);
    const object = layout
      .getObjects()
      .insertNewObject(project, 'MyExt::MyShop', 'MyShopObject', 0);
    object.addNewBehavior(project, 'MyExt::MyBehavior', 'MyBehavior');

    const shopActions = enumerateObjectAndBehaviorsInstructions(
      false,
      project.getObjects(),
      layout.getObjects(),
      'MyShopObject',
      project,
      makeFakeI18n()
    );

    const groupNames = getTopLevelGroupNames(shopActions);
    expect(groupNames.slice(0, 4)).toEqual([
      'Shop',
      'Items',
      // The behavior instructions without a group are in a group named after it.
      'My behavior',
      'Objects',
    ]);
    // Free instructions of extensions without a group are in a group named
    // after their extension, after the instructions of all objects.
    expect(groupNames[groupNames.length - 1]).toBe('My extension');
    expect(
      shopActions
        .filter(instruction => instruction.fullGroupName === 'Shop')
        .map(instruction => instruction.type)
    ).toEqual(['MyExt::MyShop::Open', 'MyExt::MyShop::Close']);
    project.delete();
  });
});
