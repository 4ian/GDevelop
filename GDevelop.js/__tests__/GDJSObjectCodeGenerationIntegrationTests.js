const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

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
        // This condition should pass, but do not change the picking of the objects.
        conditions: [
          {
            type: { value: 'SceneInstancesCount' },
            parameters: ['', 'MyObjectGroup', '>', '0'],
            subInstructions: [],
          },
        ],
        actions: [
          {
            type: { inverted: false, value: 'ModVarScene' },
            parameters: ['ResultBeforePicking', '=', 'SceneInstancesCount(MyObjectGroup)'],
            subInstructions: [],
          },
          {
            type: { inverted: false, value: 'ModVarObjet' },
            parameters: ['MyObjectGroup', 'Picked', '=', '1'],
            subInstructions: [],
          },
          {
            type: { inverted: false, value: 'ModVarScene' },
            parameters: ['ResultAfterPicking', '=', 'SceneInstancesCount(MyObjectGroup)'],
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
    expect(runtimeScene.getVariables().get('ResultBeforePicking').getAsNumber()).toBe(5);
    expect(runtimeScene.getVariables().get('ResultAfterPicking').getAsNumber()).toBe(5);

    // Check that the initial condition did not modify the objects picked by the action.
    expect(myObjectA1.getVariables().get('Picked').getAsNumber()).toBe(1);
    expect(myObjectA2.getVariables().get('Picked').getAsNumber()).toBe(1);
    expect(myObjectB1.getVariables().get('Picked').getAsNumber()).toBe(1);
    expect(myObjectB2.getVariables().get('Picked').getAsNumber()).toBe(1);
    expect(myObjectB3.getVariables().get('Picked').getAsNumber()).toBe(1);

    eventsFunction.delete();
    project.delete();
  });

  it('generates a working function counting picked instances', function () {
    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        disabled: false,
        folded: false,
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result1', '=', 'PickedInstancesCount(MyObjectGroup)'],
            subInstructions: [],
          },
        ],
        events: [{
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
              parameters: ['Result2', '=', 'PickedInstancesCount(MyObjectGroup)'],
              subInstructions: [],
            },
          ],
        }]
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
    expect(runtimeScene.getVariables().get('Result1').getAsNumber()).toBe(0);
    expect(runtimeScene.getVariables().get('Result2').getAsNumber()).toBe(3);

    eventsFunction.delete();
    project.delete();
  });
});
