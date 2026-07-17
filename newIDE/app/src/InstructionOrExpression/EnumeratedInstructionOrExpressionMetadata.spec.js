// @flow
import { filterEnumeratedInstructionOrExpressionMetadataByScope } from './EnumeratedInstructionOrExpressionMetadata';
import { enumerateAllInstructions } from './EnumerateInstructions';

const gd: libGDevelop = global.gd;

// $FlowFixMe[incompatible-type]
// $FlowFixMe[missing-local-annot]
// $FlowFixMe[cannot-resolve-name]
const makeFakeI18n = (fakeI18n): I18nType => ({
  ...fakeI18n,
  _: message => message.id,
});

describe('EnumeratedInstructionOrExpressionMetadata', () => {
  it('can hide actions that are not relevant to layouts', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = new gd.Layout();

    const instructions = filterEnumeratedInstructionOrExpressionMetadataByScope(
      enumerateAllInstructions(false, project, makeFakeI18n()),
      { project, layout }
    );

    expect(instructions.length).toBeGreaterThan(0);
    // The action is NOT in the list.
    expect(instructions).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          displayedName: 'Set number return value',
          fullGroupName: 'Advanced ❯ Event functions',
          type: 'SetReturnNumber',
        }),
      ])
    );

    layout.delete();
    project.delete();
  });

  it('can show actions that are only relevant for functions', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = new gd.EventsFunctionsExtension();
    const eventsFunction = new gd.EventsFunction();

    const instructions = filterEnumeratedInstructionOrExpressionMetadataByScope(
      enumerateAllInstructions(false, project, makeFakeI18n()),
      {
        project,
        eventsFunctionsExtension,
        eventsFunction,
      }
    );

    expect(instructions.length).toBeGreaterThan(0);
    // The action is in the list.
    expect(instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          displayedName: 'Set number return value',
          fullGroupName: 'Advanced ❯ Event functions',
          type: 'SetReturnNumber',
        }),
      ])
    );

    eventsFunctionsExtension.delete();
    eventsFunction.delete();
    project.delete();
  });

  it('shows only the two signal emit actions in free extension events', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = new gd.EventsFunctionsExtension();
    const eventsFunction = new gd.EventsFunction();

    const instructions = filterEnumeratedInstructionOrExpressionMetadataByScope(
      enumerateAllInstructions(false, project, makeFakeI18n()),
      {
        project,
        eventsFunctionsExtension,
        eventsFunction,
      }
    );
    const instructionTypes = instructions.map(instruction => instruction.type);

    expect(instructionTypes).toEqual(
      expect.arrayContaining(['EmitSceneSignal', 'EmitSignalToObjectInstance'])
    );
    expect(instructionTypes).toEqual(
      expect.not.arrayContaining([
        'EmitSignalToObject',
        'EmitSignalToPickedObjects',
        'EmitSignalToObjectGroup',
        'SubscribeSceneSignal',
      ])
    );

    eventsFunctionsExtension.delete();
    eventsFunction.delete();
    project.delete();
  });

  it('shows scene signal subscription only in object and behavior events', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = new gd.EventsFunctionsExtension();
    const eventsFunction = new gd.EventsFunction();
    const eventsBasedObject = new gd.EventsBasedObject();
    const eventsBasedBehavior = new gd.EventsBasedBehavior();
    const emitSceneSignal = enumerateAllInstructions(
      false,
      project,
      makeFakeI18n()
    ).find(instruction => instruction.type === 'EmitSceneSignal');
    if (!emitSceneSignal) throw new Error('EmitSceneSignal metadata missing.');
    const subscribeSceneSignal = {
      ...emitSceneSignal,
      type: 'SubscribeSceneSignal',
    };

    const objectInstructions = filterEnumeratedInstructionOrExpressionMetadataByScope(
      [subscribeSceneSignal],
      {
        project,
        eventsFunctionsExtension,
        eventsFunction,
        eventsBasedObject,
      }
    );
    const behaviorInstructions = filterEnumeratedInstructionOrExpressionMetadataByScope(
      [subscribeSceneSignal],
      {
        project,
        eventsFunctionsExtension,
        eventsFunction,
        eventsBasedBehavior,
      }
    );

    expect(objectInstructions.map(instruction => instruction.type)).toContain(
      'SubscribeSceneSignal'
    );
    expect(behaviorInstructions.map(instruction => instruction.type)).toContain(
      'SubscribeSceneSignal'
    );

    eventsBasedBehavior.delete();
    eventsBasedObject.delete();
    eventsFunction.delete();
    eventsFunctionsExtension.delete();
    project.delete();
  });
});
