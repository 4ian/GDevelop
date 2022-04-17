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
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
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
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(1);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
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
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
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
                'MyParamObject',
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
                'MyParamObject',
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
    parameter.setName('MyParamObject');
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
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(myObjectA.getVariables().get('TestVariable').getAsNumber()).toBe(10);
  });

  it('generates a working function with two asynchronous actions and a condition in between filtering objects', function () {
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
          ],
          events: [
            {
              disabled: false,
              folded: false,
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [
                {
                  type: { inverted: false, value: 'VarObjet' },
                  parameters: ['MyParamObject', 'TestVariable', '=', '1'],
                  subInstructions: [],
                },],
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
                  type: { inverted: false, value: 'ModVarObjet' },
                  parameters: [
                    'MyParamObject',
                    'TestVariable',
                    '+',
                    'GetArgumentAsNumber("IncreaseValue")',
                  ],
                  subInstructions: [],
                },
              ],
              events: [],
            },
          ],
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
    parameter.setName('MyParamObject');
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
    const myObjectA1 = runtimeScene.createObject('MyObjectA');
    const myObjectA2 = runtimeScene.createObject('MyObjectA');
    const myObjectALists = gdjs.Hashtable.newFrom({ MyObjectA: [myObjectA1, myObjectA2] });
    myObjectA2.getVariables().get('TestVariable').setNumber(1);

    runCompiledEvents(gdjs, runtimeScene, [5, myObjectALists]);

    // Initial state is unchanged because the first wait task is not done.
    expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
    expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
    expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(1);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

    // Initial state is still unchanged because the condition ran but the second wait task
    // is not done.
    expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
    expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
    expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(1);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

    // Only the "myObjectA2" instance was modified by the action.
    expect(myObjectA1.getVariables().has('TestVariable')).toBe(false);
    expect(myObjectA2.getVariables().has('TestVariable')).toBe(true);
    expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(6);
  });

  it('generates a working function with asynchronous actions referring to objects, and it handles deleted objects before the task continues', function () {
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
                'MyParamObject',
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
                'MyParamObject',
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
                'MyParamObject',
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
    parameter.setName('MyParamObject');
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
    const myObjectA1 = runtimeScene.createObject('MyObjectA');
    const myObjectA2 = runtimeScene.createObject('MyObjectA');
    const myObjectA3 = runtimeScene.createObject('MyObjectA');
    const myObjectB1 = runtimeScene.createObject('MyObjectB');
    const myObjectB2 = runtimeScene.createObject('MyObjectB');
    const myObjectsLists = gdjs.Hashtable.newFrom({
      MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
      MyObjectB: [myObjectB1, myObjectB2],
    });
    runCompiledEvents(gdjs, runtimeScene, [5, myObjectsLists]);
    expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(5);

    // Delete an object while the task is running.
    myObjectA1.deleteFromScene(runtimeScene);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
      10
    );
    expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
      10
    );
    expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
      10
    );
    expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
      10
    );

    // Delete other objects while the task is running.
    myObjectA3.deleteFromScene(runtimeScene);
    myObjectB1.deleteFromScene(runtimeScene);

    // Process the tasks again (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
      15
    );
    expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(
      10
    );
    expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(
      10
    );
    expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
      15
    );
  });

  it('generates a working function with asynchronous actions referring to objects, and using object groups', function () {
    const eventsSerializerElement = gd.Serializer.fromJSON(
      JSON.stringify([
        {
          disabled: false,
          folded: false,
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            {
              type: { inverted: false, value: 'VarObjet' },
              parameters: ['MyGroup', 'TestVariable', '=', '1'],
              subInstructions: [],
            },
          ],
          actions: [
            {
              type: { inverted: false, value: 'ModVarObjet' },
              parameters: [
                'MyParamObject1',
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
                'MyParamObject2',
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
                'MyGroup',
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
    parameter.setName('MyParamObject1');
    eventsFunction.getParameters().push_back(parameter);
    parameter.setType('object');
    parameter.setName('MyParamObject2');
    eventsFunction.getParameters().push_back(parameter);
    parameter.delete();

    // Create a group that refers to both objects passed as parameters.
    const myGroup = eventsFunction.getObjectGroups().insertNew('MyGroup', 0);
    myGroup.addObject('MyParamObject1');
    myGroup.addObject('MyParamObject2');

    const runCompiledEvents = generateCompiledEventsForEventsFunction(
      gd,
      project,
      eventsFunction
    );

    eventsFunction.delete();
    project.delete();

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const myObjectA1 = runtimeScene.createObject('MyObjectA');
    const myObjectA2 = runtimeScene.createObject('MyObjectA');
    const myObjectA3 = runtimeScene.createObject('MyObjectA');
    const myObjectB1 = runtimeScene.createObject('MyObjectB');
    const myObjectB2 = runtimeScene.createObject('MyObjectB');
    const myObjectALists = gdjs.Hashtable.newFrom({
      MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
    });
    const myObjectBLists = gdjs.Hashtable.newFrom({
      MyObjectB: [myObjectB1, myObjectB2],
    });

    myObjectA2.getVariables().get('TestVariable').setNumber(1);
    myObjectB2.getVariables().get('TestVariable').setNumber(1);

    runCompiledEvents(gdjs, runtimeScene, [5, myObjectALists, myObjectBLists]);

    // Only objects passed to the "MyParamObject1" parameter have their variable increased.
    expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
      1 + 5
    );
    expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(1);

    // Object filtered in the initial condition are not updated.
    expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(0);
    expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(0);
    expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(0);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

    // Now, only objects passed to the "MyParamObject2" parameter have their variable increased.
    expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
      1 + 5
    );
    expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
      1 + 5
    );

    // Object filtered in the initial condition are not updated.
    expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(0);
    expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(0);
    expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(0);

    // Process the tasks again (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

    // All the remaining objects, refered by "MyGroup" in the function, should have their variable increased.
    expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
      1 + 5 + 5
    );
    expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
      1 + 5 + 5
    );

    // Object filtered in the initial condition are not updated.
    expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(0);
    expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(0);
    expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(0);
  });

  it('generates a working function with asynchronous actions referring to objects, and it handles deleted objects in object groups', function () {
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
                'MyParamObject1',
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
                'MyParamObject2',
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
                'MyGroup',
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
    parameter.setName('MyParamObject1');
    eventsFunction.getParameters().push_back(parameter);
    parameter.setType('object');
    parameter.setName('MyParamObject2');
    eventsFunction.getParameters().push_back(parameter);
    parameter.delete();

    // Create a group that refers to both objects passed as parameters.
    const myGroup = eventsFunction.getObjectGroups().insertNew('MyGroup', 0);
    myGroup.addObject('MyParamObject1');
    myGroup.addObject('MyParamObject2');

    const runCompiledEvents = generateCompiledEventsForEventsFunction(
      gd,
      project,
      eventsFunction
    );

    eventsFunction.delete();
    project.delete();

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const myObjectA1 = runtimeScene.createObject('MyObjectA');
    const myObjectA2 = runtimeScene.createObject('MyObjectA');
    const myObjectA3 = runtimeScene.createObject('MyObjectA');
    const myObjectB1 = runtimeScene.createObject('MyObjectB');
    const myObjectB2 = runtimeScene.createObject('MyObjectB');
    const myObjectALists = gdjs.Hashtable.newFrom({
      MyObjectA: [myObjectA1, myObjectA2, myObjectA3],
    });
    const myObjectBLists = gdjs.Hashtable.newFrom({
      MyObjectB: [myObjectB1, myObjectB2],
    });

    runCompiledEvents(gdjs, runtimeScene, [5, myObjectALists, myObjectBLists]);

    // Only objects passed to the "MyParamObject1" parameter have their variable increased.
    expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(0);
    expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(0);

    // Delete an object while the task is running.
    myObjectA1.deleteFromScene(runtimeScene);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

    // Now, only objects passed to the "MyParamObject2" parameter have their variable increased.
    expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(5);

    // Delete other objects while the task is running.
    myObjectA3.deleteFromScene(runtimeScene);
    myObjectB1.deleteFromScene(runtimeScene);

    // Process the tasks again (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);

    // All the remaining objects, refered by "MyGroup" in the function, should have their variable increased.
    expect(myObjectA2.getVariables().get('TestVariable').getAsNumber()).toBe(
      10
    );
    expect(myObjectB2.getVariables().get('TestVariable').getAsNumber()).toBe(
      10
    );

    // Objects deleted, even if they are in "MyGroup", don't have their variable increased.
    expect(myObjectA1.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectA3.getVariables().get('TestVariable').getAsNumber()).toBe(5);
    expect(myObjectB1.getVariables().get('TestVariable').getAsNumber()).toBe(5);
  });

  // TODO: add a test involving TaskGroup (i.e: an object async action).
  // TODO: add a test involving CreateObject
  // TODO: add a test involving subevents
});
