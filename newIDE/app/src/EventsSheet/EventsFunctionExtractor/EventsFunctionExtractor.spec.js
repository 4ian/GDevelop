// @flow
import { setupFunctionFromEvents } from '.';
import { makeTestProject } from '../../fixtures/TestProject';
const gd: libGDevelop = global.gd;

const serializedEvents = [
  {
    disabled: false,
    folded: false,
    type: 'BuiltinCommonInstructions::Standard',
    conditions: [
      // Condition referring to a group, with a behavior:
      // 1) The group will be referred as such in the parameters
      //    (because no object of the group is used directly in the rest of events)
      // 2) The behavior will be the next parameter after the group.
      {
        type: { inverted: false, value: 'PlatformBehavior::IsFalling' },
        parameters: ['GroupOfSpriteObjectsWithBehaviors', 'PlatformerObject'],
        subInstructions: [],
      },
    ],
    actions: [
      // Action referring directly to MySpriteObject
      {
        type: { inverted: false, value: 'ChangeAnimation' },
        parameters: ['MySpriteObject', '=', '1'],
        subInstructions: [],
      },
      // Action referring to GroupOfObjects, which contains MySpriteObject and MyTextObject.
      // As MySpriteObject is used separately, the group will be expanded.
      {
        type: { inverted: false, value: 'Montre' },
        parameters: ['GroupOfObjects', ''],
        subInstructions: [],
      },
    ],
    events: [],
  },
];

describe('EventsFunctionExtractor', () => {
  it('configures the events function with the proper parameters', () => {
    const { project, testLayout } = makeTestProject(gd);
    const eventsFunction = new gd.EventsFunction();

    setupFunctionFromEvents({
      project,
      scope: { project, layout: testLayout },
      globalObjectsContainer: project.getObjects(),
      objectsContainer: testLayout.getObjects(),
      serializedEvents,
      eventsFunction,
    });

    expect(eventsFunction.getParameters().getParametersCount()).toBe(4);
    // The "GroupOfSpriteObjectsWithBehaviors" group (not expanded) and its behavior:
    expect(
      eventsFunction
        .getParameters()
        .getParameterAt(0)
        .getName()
    ).toBe('GroupOfSpriteObjectsWithBehaviors');
    expect(
      eventsFunction
        .getParameters()
        .getParameterAt(1)
        .getName()
    ).toBe('PlatformerObject');
    // The "GroupOfObjects" group, expanded into MySpriteObject and MyTextObject
    // as both "GroupOfObjects" and "MySpriteObject" are used in events.
    expect(
      eventsFunction
        .getParameters()
        .getParameterAt(2)
        .getName()
    ).toBe('MySpriteObject');
    expect(
      eventsFunction
        .getParameters()
        .getParameterAt(3)
        .getName()
    ).toBe('MyTextObject');
  });
});
