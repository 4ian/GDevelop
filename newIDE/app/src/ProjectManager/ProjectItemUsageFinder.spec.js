// @flow
import { findProjectItemUsages } from './ProjectItemUsageFinder';
import { getSceneLifecycleEvents } from '../SceneContextLifecycleFunctions';

const gd: libGDevelop = global.gd;

const makeProject = () => {
  const project = gd.ProjectHelper.createNewGDJSProject();
  const layout = project.insertNewLayout('SceneA', 0);
  const extension = project.insertNewEventsFunctionsExtension('PlantCards', 0);
  extension.setName('PlantCards');

  return { project, layout, extension };
};

const addActionToLayout = (
  project: gdProject,
  layout: gdLayout,
  type: string,
  parameters: Array<string>,
  lifecycleFunctionName:
    | 'sceneLoad'
    | 'sceneSignal'
    | 'sceneUpdate'
    | 'sceneUnload' = 'sceneUpdate'
) => {
  const event = getSceneLifecycleEvents(
    layout,
    lifecycleFunctionName
  ).insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
  const standardEvent = gd.asStandardEvent(event);
  const action = new gd.Instruction();
  action.setType(type);
  action.setParametersCount(parameters.length);
  parameters.forEach((parameter, index) => {
    action.setParameter(index, parameter);
  });
  standardEvent.getActions().insert(action, 0);
  action.delete();
};

describe('ProjectItemUsageFinder', () => {
  it('finds custom object instances', () => {
    const { project, layout, extension } = makeProject();
    const eventsBasedObject = extension
      .getEventsBasedObjects()
      .insertNew('PlantCardSlot', 0);

    layout
      .getObjects()
      .insertNewObject(project, 'PlantCards::PlantCardSlot', 'Slot', 0);

    const report = findProjectItemUsages(project, {
      kind: 'custom-object',
      eventsFunctionsExtension: extension,
      eventsBasedObject,
    });

    expect(report.objectUsages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          location: 'Scene "SceneA" object "Slot"',
          details: 'Object type "PlantCards::PlantCardSlot"',
        }),
      ])
    );
  });

  it('finds custom object variant instances', () => {
    const { project, layout, extension } = makeProject();
    const eventsBasedObject = extension
      .getEventsBasedObjects()
      .insertNew('PlantCardSlot', 0);
    const variant = eventsBasedObject
      .getVariants()
      .insertNewVariant('New variant', 0);

    const baseSlot = layout
      .getObjects()
      .insertNewObject(project, 'PlantCards::PlantCardSlot', 'BaseSlot', 0);
    gd.asCustomObjectConfiguration(baseSlot.getConfiguration()).setVariantName(
      ''
    );

    const variantSlot = layout
      .getObjects()
      .insertNewObject(project, 'PlantCards::PlantCardSlot', 'VariantSlot', 1);
    gd.asCustomObjectConfiguration(
      variantSlot.getConfiguration()
    ).setVariantName('New variant');

    const report = findProjectItemUsages(project, {
      kind: 'custom-object-variant',
      eventsFunctionsExtension: extension,
      eventsBasedObject,
      variant,
    });

    expect(report.objectUsages).toEqual([
      expect.objectContaining({
        location: 'Scene "SceneA" object "VariantSlot"',
        details:
          'Object variant "New variant" of type "PlantCards::PlantCardSlot"',
      }),
    ]);
  });

  it('finds events based behavior instances', () => {
    const { project, layout, extension } = makeProject();
    const eventsBasedBehavior = extension
      .getEventsBasedBehaviors()
      .insertNew('PlantCard', 0);
    eventsBasedBehavior.setObjectType('Sprite');
    const object = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Card', 0);
    object.addNewBehavior(project, 'PlantCards::PlantCard', 'PlantCard');

    const report = findProjectItemUsages(project, {
      kind: 'events-based-behavior',
      eventsFunctionsExtension: extension,
      eventsBasedBehavior,
    });

    expect(report.objectUsages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          location: 'Scene "SceneA" object "Card"',
          details: 'Behavior "PlantCard" of type "PlantCards::PlantCard"',
        }),
      ])
    );
  });

  it('finds extension function calls in events', () => {
    const { project, layout, extension } = makeProject();
    const eventsFunction = extension
      .getEventsFunctions()
      .insertNewEventsFunction('testfunc', 0);
    addActionToLayout(project, layout, 'PlantCards::testfunc', []);

    const report = findProjectItemUsages(project, {
      kind: 'events-function',
      eventsFunctionsExtension: extension,
      eventsFunction,
    });

    expect(report.eventUsages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          location: 'Scene "SceneA" / Scene update - event 1',
          details: 'PlantCards::testfunc',
        }),
      ])
    );
  });

  it('reports the lifecycle function that owns an event usage', () => {
    const { project, layout, extension } = makeProject();
    const eventsFunction = extension
      .getEventsFunctions()
      .insertNewEventsFunction('testfunc', 0);
    addActionToLayout(project, layout, 'PlantCards::testfunc', [], 'sceneLoad');

    const report = findProjectItemUsages(project, {
      kind: 'events-function',
      eventsFunctionsExtension: extension,
      eventsFunction,
    });

    expect(report.eventUsages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          location: 'Scene "SceneA" / On scene load - event 1',
          details: 'PlantCards::testfunc',
        }),
      ])
    );
  });

  it('finds links to external events', () => {
    const { project, layout } = makeProject();
    const externalEvents = project.insertNewExternalEvents('UI Initial', 0);
    externalEvents.setAssociatedLayout('SceneA');
    const event = layout
      .getEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::Link', 0);
    gd.asLinkEvent(event).setTarget('UI Initial');

    const report = findProjectItemUsages(project, {
      kind: 'external-events',
      externalEvents,
    });

    expect(report.relatedUsages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          location: 'Scene "SceneA"',
          details: 'Associated external events',
        }),
      ])
    );
    expect(report.eventUsages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          location: 'Scene "SceneA" / Scene update - event 1',
          details: 'Link to external events "UI Initial"',
        }),
      ])
    );
  });

  it('finds external layout creation actions with quoted parameters', () => {
    const { project, layout } = makeProject();
    const externalLayout = project.insertNewExternalLayout('UI', 0);
    externalLayout.setAssociatedLayout('SceneA');
    addActionToLayout(
      project,
      layout,
      'BuiltinExternalLayouts::CreateObjectsFromExternalLayout',
      ['', '"UI"']
    );

    const report = findProjectItemUsages(project, {
      kind: 'external-layout',
      externalLayout,
    });

    expect(report.relatedUsages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          location: 'Scene "SceneA"',
          details: 'Associated external layout',
        }),
      ])
    );
    expect(report.eventUsages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          location: 'Scene "SceneA" / Scene update - event 1',
        }),
      ])
    );
  });
});
