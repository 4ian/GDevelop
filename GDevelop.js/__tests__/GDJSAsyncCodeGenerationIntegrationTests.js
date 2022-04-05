const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');

describe('libGD.js - GDJS Async Code Generation integration tests', function () {
  let gd = null;
  beforeAll((done) =>
    initializeGDevelopJs().then((module) => {
      gd = module;
      done();
    })
  );

  it('generates a working function with asynchronous actions', function () {
    const eventsSerializerElement = gd.Serializer.fromJSON(
      JSON.stringify([
        {
          disabled: false,
          folded: false,
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: {
                inverted: false,
                value: 'Wait',
              },
              parameters: ['1.5'],
              subInstructions: [],
            },
            {
              type: { inverted: false, value: 'ModVarScene' },
              parameters: ['SuccessVariable', '+', '1'],
              subInstructions: [],
            },
          ],
          events: [],
        },
      ])
    );

    var runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      eventsSerializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);
    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

    // Process the tasks (but the task is not finished yet).
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeSyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);
  });

  it('generates a working function with two asynchronous actions', function () {
    // Create events using the Trigger Once condition.
    const eventsSerializerElement = gd.Serializer.fromJSON(
      JSON.stringify([
        {
          disabled: false,
          folded: false,
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: {
                inverted: false,
                value: 'Wait',
              },
              parameters: ['1.5'],
              subInstructions: [],
            },
            {
              type: { inverted: false, value: 'ModVarScene' },
              parameters: ['SuccessVariable', '+', '1'],
              subInstructions: [],
            },
            {
              type: {
                inverted: false,
                value: 'Wait',
              },
              parameters: ['1.5'],
              subInstructions: [],
            },
            {
              type: { inverted: false, value: 'ModVarScene' },
              parameters: ['SuccessVariable', '+', '2'],
              subInstructions: [],
            },
          ],
          events: [],
        },
      ])
    );

    var runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      eventsSerializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);
    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

    // Process the tasks (but the task is not finished yet).
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeSyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeSyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(3);
  });

  it('generates a working function with asynchronous actions referring to the function arguments', function () {
    const eventsSerializerElement = gd.Serializer.fromJSON(
      JSON.stringify([
        {
          disabled: false,
          folded: false,
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: {
                inverted: false,
                value: 'Wait',
              },
              parameters: ['1.5'],
              subInstructions: [],
            },
            {
              type: { inverted: false, value: 'ModVarScene' },
              parameters: [
                'SuccessVariable',
                '+',
                'GetArgumentAsNumber("IncreaseValue")',
              ],
              subInstructions: [],
            },
          ],
          events: [],
        },
      ])
    );

    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunction = new gd.EventsFunction();

    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);

    const parameter = new gd.ParameterMetadata();
    parameter.setType('number');
    parameter.setName('IncreaseValue');
    eventsFunction.getParameters().push_back(parameter);
    parameter.delete();
    const runCompiledEvents = generateCompiledEventsForEventsFunction(
      gd,
      project,
      eventsFunction
    );

    eventsFunction.delete();
    project.delete();

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, [5]);
    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

    // Process the tasks (but the task is not finished yet).
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(false);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeSyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(5);
  });

  it('generates a working function with asynchronous actions referring to objects', function () {
    const eventsSerializerElement = gd.Serializer.fromJSON(
      JSON.stringify([
        {
          disabled: false,
          folded: false,
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { inverted: false, value: 'ModVarObjet' },
              parameters: [
                'MyObjectA',
                'TestVariable',
                '+',
                'GetArgumentAsNumber("IncreaseValue")',
              ],
              subInstructions: [],
            },
            {
              type: {
                inverted: false,
                value: 'Wait',
              },
              parameters: ['1.5'],
              subInstructions: [],
            },
            {
              type: { inverted: false, value: 'ModVarObjet' },
              parameters: [
                'MyObjectA',
                'TestVariable',
                '+',
                'GetArgumentAsNumber("IncreaseValue")',
              ],
              subInstructions: [],
            },
          ],
          events: [],
        },
      ])
    );

    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunction = new gd.EventsFunction();

    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);

    const parameter = new gd.ParameterMetadata();
    parameter.setType('number');
    parameter.setName('IncreaseValue');
    eventsFunction.getParameters().push_back(parameter);
    parameter.setType('object');
    parameter.setName('MyObjectA');
    eventsFunction.getParameters().push_back(parameter);
    parameter.delete();

    const runCompiledEvents = generateCompiledEventsForEventsFunction(
      gd,
      project,
      eventsFunction
    );

    eventsFunction.delete();
    project.delete();

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const myObjectA = runtimeScene.createObject('MyObjectA');
    const myObjectALists = gdjs.Hashtable.newFrom({ MyObjectA: [myObjectA] });
    runCompiledEvents(gdjs, runtimeScene, [5, myObjectALists]);
    expect(myObjectA.getVariables().has('TestVariable')).toBe(true);
    expect(myObjectA.getVariables().get('TestVariable').getAsNumber()).toBe(5);

    // Process the tasks (but the task is not finished yet).
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(myObjectA.getVariables().get('TestVariable').getAsNumber()).toBe(5);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeSyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(myObjectA.getVariables().get('TestVariable').getAsNumber()).toBe(10);
  });

  // TODO: Add a test simulating the deletion of an object before a task is finished,
  // and the task then updating the other object instances variable.
});
