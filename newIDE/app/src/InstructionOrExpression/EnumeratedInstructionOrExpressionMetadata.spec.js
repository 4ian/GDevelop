// @flow
import { filterEnumeratedInstructionOrExpressionMetadataByScope } from './EnumeratedInstructionOrExpressionMetadata';
import { enumerateAllInstructions } from './EnumerateInstructions';

const gd: libGDevelop = global.gd;

// $FlowExpectedError
const makeFakeI18n = (fakeI18n): I18nType => ({
  ...fakeI18n,
  _: message => message.id,
});

describe('EnumeratedInstructionOrExpressionMetadata', () => {
  it('can hide actions that are not relevant to layouts', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = new gd.Layout();

    const instructions = filterEnumeratedInstructionOrExpressionMetadataByScope(
      enumerateAllInstructions(false, makeFakeI18n()),
      { project, layout }
    );

    expect(instructions.length).toBeGreaterThan(0);
    // The action is NOT in the list.
    expect(instructions).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          displayedName: 'Set number return value',
          fullGroupName: 'Advanced/Event functions',
          type: 'SetReturnNumber',
        }),
      ])
    );

    layout.delete();
  });

  it('can show actions that are only relevant for functions', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = new gd.EventsFunctionsExtension();
    const eventsFunction = new gd.EventsFunction();

    const instructions = filterEnumeratedInstructionOrExpressionMetadataByScope(
      enumerateAllInstructions(false, makeFakeI18n()),
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
          fullGroupName: 'Advanced/Event functions',
          type: 'SetReturnNumber',
        }),
      ])
    );

    eventsFunctionsExtension.delete();
    eventsFunction.delete();
  });
});
