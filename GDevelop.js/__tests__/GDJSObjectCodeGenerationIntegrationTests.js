const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

/**
 * Helper generating an event, ready to be unserialized, adding 1 to
 * "TestVariable" of the specified object (or object group).
 */
const makeAddOneToObjectTestVariableEvent = (objectName) => ({
  disabled: false,
  folded: false,
  type: 'BuiltinCommonInstructions::Standard',
  conditions: [],
  actions: [
    {
      type: { inverted: false, value: 'ModVarObjet' },
      parameters: [objectName, 'TestVariable', '+', '1'],
      subInstructions: [],
    },
  ],
  events: [],
});

describe('libGD.js - GDJS Object Code Generation integration tests', function () {
  let gd = null;
  beforeAll((done) =>
    initializeGDevelopJs().then((module) => {
      gd = module;
      done();
    })
  );

  it('generates a working function counting instances from the scene', function () {
    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        disabled: false,
        folded: false,
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { inverted: false, value: 'ModVarScene' },
            parameters: ['Result', '=', 'SceneInstancesCount(MyObjectGroup)'],
            subInstructions: [],
          },
        ],
      },
    ]);

    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunction = new gd.EventsFunction();
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);

    // Add an object parameter to the function:
    const objectParameter = new gd.ParameterMetadata();
    objectParameter.setType('object');
    objectParameter.setName('MyObjectGroup');
    eventsFunction.getParameters().push_back(objectParameter);
    objectParameter.delete();

    const runCompiledEvents = generateCompiledEventsForEventsFunction(
      gd,
      project,
      eventsFunction
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runtimeScene.getOnceTriggers().startNewFrame();

    const objectsLists = gdjs.Hashtable.newFrom({
      MyObjectA: [],
      MyObjectB: [],
      MyObjectC: [],
    });
    const myObjectA1 = runtimeScene.createObject('MyObjectA');
    const myObjectA2 = runtimeScene.createObject('MyObjectA');
    const myObjectB1 = runtimeScene.createObject('MyObjectB');
    const myObjectB2 = runtimeScene.createObject('MyObjectB');
    const myObjectB3 = runtimeScene.createObject('MyObjectB');

    runCompiledEvents(gdjs, runtimeScene, [objectsLists]);

    // Check that the instances from the scene were counted.
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(5);

    eventsFunction.delete();
    project.delete();
  });

  it('generates a working function counting picked instances', function () {
    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        disabled: false,
        folded: false,
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarObjet' },
            parameters: ['MyObjectGroup', 'PleaseCountMe', '=', '1'],
            subInstructions: [],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', 'PickedInstancesCount(MyObjectGroup)'],
            subInstructions: [],
          },
        ],
      },
    ]);

    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunction = new gd.EventsFunction();
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);

    // Add an object parameter to the function:
    const objectParameter = new gd.ParameterMetadata();
    objectParameter.setType('object');
    objectParameter.setName('MyObjectGroup');
    eventsFunction.getParameters().push_back(objectParameter);
    objectParameter.delete();

    const runCompiledEvents = generateCompiledEventsForEventsFunction(
      gd,
      project,
      eventsFunction,
      true
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runtimeScene.getOnceTriggers().startNewFrame();

    const myObjectA1 = runtimeScene.createObject('MyObjectA');
    const myObjectA2 = runtimeScene.createObject('MyObjectA');
    const myObjectB1 = runtimeScene.createObject('MyObjectB');
    const myObjectB2 = runtimeScene.createObject('MyObjectB');
    const myObjectB3 = runtimeScene.createObject('MyObjectB');
    const objectsLists = gdjs.Hashtable.newFrom({
      MyObjectA: [myObjectA1],
      MyObjectB: [myObjectB1, myObjectB3],
      MyObjectC: [],
    });

    myObjectA1.getVariables().get('PleaseCountMe').setNumber(1);
    myObjectB1.getVariables().get('PleaseCountMe').setNumber(1);
    myObjectB3.getVariables().get('PleaseCountMe').setNumber(1);

    runCompiledEvents(gdjs, runtimeScene, [objectsLists]);

    // Check that the instances from the scene were counted.
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(3);

    eventsFunction.delete();
    project.delete();
  });
});
