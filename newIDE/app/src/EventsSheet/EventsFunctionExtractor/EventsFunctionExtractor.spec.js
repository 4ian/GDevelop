// @flow
import { setupFunctionFromEvents } from '.';
import { makeTestProject } from '../../fixtures/TestProject';
import {
  ProjectScopedContainersAccessor,
  type EventsScope,
} from '../../InstructionOrExpression/EventsScope';
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

  it('can configure an events function from object function events', () => {
    const { project, testEventsBasedObject } = makeTestProject(gd);
    const eventsFunctionsExtension = project.getEventsFunctionsExtension(
      'Button'
    );
    const objectEventsFunction = testEventsBasedObject
      .getEventsFunctions()
      .getEventsFunction('MyTestFunction');
    objectEventsFunction
      .getParameters()
      .insertNewParameter('Object', 0)
      .setType('object');
    const eventsFunction = new gd.EventsFunction();
    const parameterObjectsContainer = new gd.ObjectsContainer(
      gd.ObjectsContainer.Function
    );
    const parameterVariablesContainer = new gd.VariablesContainer(
      gd.VariablesContainer.Parameters
    );
    const propertyVariablesContainer = new gd.VariablesContainer(
      gd.VariablesContainer.Properties
    );
    const parameterResourcesContainer = new gd.ResourcesContainer(
      gd.ResourcesContainer.Parameters
    );
    const propertyResourcesContainer = new gd.ResourcesContainer(
      gd.ResourcesContainer.Properties
    );
    const scope: EventsScope = {
      project,
      eventsFunctionsExtension,
      eventsBasedObject: testEventsBasedObject,
      eventsFunction: objectEventsFunction,
    };
    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      scope,
      parameterObjectsContainer,
      parameterVariablesContainer,
      propertyVariablesContainer,
      parameterResourcesContainer,
      propertyResourcesContainer
    );

    setupFunctionFromEvents({
      project,
      scope,
      globalObjectsContainer: testEventsBasedObject.getObjects(),
      objectsContainer: parameterObjectsContainer,
      projectScopedContainersAccessor,
      serializedEvents: [
        {
          disabled: false,
          folded: false,
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { inverted: false, value: 'Cache' },
              parameters: ['Label'],
              subInstructions: [],
            },
          ],
          events: [],
        },
      ],
      eventsFunction,
    });

    expect(eventsFunction.getParameters().getParametersCount()).toBe(1);
    expect(
      eventsFunction
        .getParameters()
        .getParameterAt(0)
        .getName()
    ).toBe('Label');
  });
});
