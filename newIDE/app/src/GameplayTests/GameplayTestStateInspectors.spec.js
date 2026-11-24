// @flow
import { enumerateGameplayTestStateInspectors } from './GameplayTestStateInspectors';
import {
  reloadProjectEventsFunctionsExtensionMetadata,
  type EventsFunctionCodeWriter,
} from '../EventsFunctionsExtensionsLoader';
import { makeFakeI18n } from '../EditorFunctions/TestHelpers';

const gd: libGDevelop = global.gd;

const fakeEventsFunctionCodeWriter: EventsFunctionCodeWriter = {
  getIncludeFileFor: (functionName: string) => `fake-${functionName}.js`,
  writeFunctionCode: () => Promise.resolve(),
  writeBehaviorCode: () => Promise.resolve(),
  writeObjectCode: () => Promise.resolve(),
};

describe('enumerateGameplayTestStateInspectors', () => {
  let project: gdProject;

  beforeEach(() => {
    // $FlowFixMe[invalid-constructor]
    project = new gd.ProjectHelper.createNewGDJSProject();
  });

  afterEach(() => {
    project.delete();
  });

  it('derives readable state entries for a built-in (TS-based) behavior', () => {
    const layout = project.insertNewLayout('Scene', 0);
    const object = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Player', 0);
    object.addNewBehavior(
      project,
      'PlatformBehavior::PlatformerObjectBehavior',
      'PlatformerObject'
    );

    const inspectors = enumerateGameplayTestStateInspectors(project);
    const entries =
      inspectors.behaviors['PlatformBehavior::PlatformerObjectBehavior'];
    expect(entries).toBeDefined();

    // Zero-parameter conditions become booleans, under their event names,
    // mapped to the real runtime getters.
    expect(entries).toContainEqual({
      name: 'IsOnFloor',
      functionName: 'isOnFloor',
      kind: 'boolean',
    });
    expect(entries).toContainEqual({
      name: 'IsJumping',
      functionName: 'isJumping',
      kind: 'boolean',
    });
    // Zero-parameter expressions become numbers (configuration and dynamic
    // state alike).
    const currentFallSpeed = entries.find(
      entry => entry.name === 'CurrentFallSpeed' && entry.kind === 'number'
    );
    expect(currentFallSpeed).toBeDefined();
    // The comparison CONDITION of the same name takes operands, so the
    // number entry (from the expression) must be the only one kept.
    expect(
      entries.filter(entry => entry.name === 'CurrentFallSpeed')
    ).toHaveLength(1);
    // Parameterized conditions are excluded (nothing to call them with).
    expect(entries.some(entry => entry.name === 'IsOnFloorObject')).toBe(false);
  });

  it('derives state entries for events-based behaviors and objects (functions and properties)', () => {
    const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);
    extension.setName('MyExt');

    // An events-based behavior with a property and a zero-parameter
    // condition function.
    const eventsBasedBehavior = extension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);
    eventsBasedBehavior.setObjectType('');
    const healthProperty = eventsBasedBehavior
      .getPropertyDescriptors()
      .insertNew('Health', 0);
    healthProperty.setType('Number');
    const isDeadFunction = eventsBasedBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('IsDead', 0);
    isDeadFunction.setFunctionType(gd.EventsFunction.Condition);

    // An events-based (custom) object with a property.
    const eventsBasedObject = extension
      .getEventsBasedObjects()
      .insertNew('MyButton', 0);
    const pressedProperty = eventsBasedObject
      .getPropertyDescriptors()
      .insertNew('IsPressed', 0);
    pressedProperty.setType('Boolean');

    // Register the generated metadata (as the editor does at project load).
    reloadProjectEventsFunctionsExtensionMetadata(
      project,
      extension,
      fakeEventsFunctionCodeWriter,
      makeFakeI18n()
    );

    // Use the behavior and the custom object in a scene.
    const layout = project.insertNewLayout('Scene', 0);
    const object = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', 'Enemy', 0);
    object.addNewBehavior(project, 'MyExt::MyBehavior', 'MyBehavior');
    layout
      .getObjects()
      .insertNewObject(project, 'MyExt::MyButton', 'Button', 1);

    const inspectors = enumerateGameplayTestStateInspectors(project);

    const behaviorEntries = inspectors.behaviors['MyExt::MyBehavior'];
    expect(behaviorEntries).toBeDefined();
    // The property generates a readable numeric getter.
    const propertyHealth = behaviorEntries.find(
      entry => entry.name === 'PropertyHealth'
    );
    expect(propertyHealth).toBeDefined();
    expect(propertyHealth && propertyHealth.kind).toBe('number');
    expect(propertyHealth && propertyHealth.functionName).toBeTruthy();
    // The condition function is exposed as a boolean, mapped to the
    // generated method.
    const isDead = behaviorEntries.find(entry => entry.name === 'IsDead');
    expect(isDead).toBeDefined();
    expect(isDead && isDead.kind).toBe('boolean');
    expect(isDead && isDead.functionName).toBeTruthy();

    const objectEntries = inspectors.objects['MyExt::MyButton'];
    expect(objectEntries).toBeDefined();
    const propertyIsPressed = objectEntries.find(
      entry => entry.name === 'PropertyIsPressed'
    );
    expect(propertyIsPressed).toBeDefined();
    expect(propertyIsPressed && propertyIsPressed.kind).toBe('boolean');
  });

  it('only includes types used in the project', () => {
    project.insertNewLayout('Scene', 0);
    const inspectors = enumerateGameplayTestStateInspectors(project);
    expect(
      inspectors.behaviors['PlatformBehavior::PlatformerObjectBehavior']
    ).toBeUndefined();
  });
});
