const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const {
  generateCompiledEventsForLayout,
} = require('../TestUtils/CodeGenerationHelpers.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const { makeTestExtensions } = require('../TestUtils/TestExtensions.js');

describe('libGD.js - GDJS Async Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
    makeTestExtensions(gd);
  });

  let project = null;
  let scene = null;
  beforeEach(() => {
    project = new gd.ProjectHelper.createNewGDJSProject();
    scene = project.insertNewLayout('Scene', 0);
  });
  afterEach(() => {
    project.delete();
  });

  const generateAndRunEventsForLayout = (events, logCode = false) => {
    const serializedProjectElement = new gd.SerializerElement();
    project.serializeTo(serializedProjectElement);

    const serializedSceneElement = new gd.SerializerElement();
    scene.serializeTo(serializedSceneElement);

    const serializedLayoutEvents = gd.Serializer.fromJSObject(events);
    scene.getEvents().unserializeFrom(project, serializedLayoutEvents);

    const runCompiledEvents = generateCompiledEventsForLayout(
      gd,
      project,
      scene,
      logCode
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock({
      gameData: JSON.parse(gd.Serializer.toJSON(serializedProjectElement)),
      sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
    });
    serializedProjectElement.delete();
    serializedSceneElement.delete();

    runCompiledEvents(gdjs, runtimeScene, []);
    return runtimeScene;
  };

  describe('Basics', () => {
    it('generates a working function with asynchronous actions', function () {
      scene.getVariables().insertNew('SuccessVariable', 0).setValue(0);
      const runtimeScene = generateAndRunEventsForLayout([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Wait' },
              parameters: ['1.5'],
            },
            {
              type: { value: 'SetNumberVariable' },
              parameters: ['SuccessVariable', '+', '1'],
            },
          ],
        },
      ]);

      expect(
        runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
      ).toBe(0);

      // Process the tasks (but the task is not finished yet).
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(
        runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
      ).toBe(0);

      // Process the tasks (after faking it's finished).
      runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(
        runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
      ).toBe(1);
    });

    it('generates a working function with two asynchronous actions', function () {
      scene.getVariables().insertNew('SuccessVariable', 0).setValue(0);
      const runtimeScene = generateAndRunEventsForLayout([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Wait' },
              parameters: ['1.5'],
            },
            {
              type: { value: 'SetNumberVariable' },
              parameters: ['SuccessVariable', '+', '1'],
            },
            {
              type: { value: 'Wait' },
              parameters: ['1.5'],
            },
            {
              type: { value: 'SetNumberVariable' },
              parameters: ['SuccessVariable', '+', '2'],
            },
          ],
        },
      ]);

      expect(
        runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
      ).toBe(0);

      // Process the tasks (but the task is not finished yet).
      runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
      expect(
        runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
      ).toBe(0);

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
  });

  it('generates a local variable expression after an async action', function () {
    scene.getVariables().insertNew('SuccessVariable', 0).setValue(0);
    const runtimeScene = generateAndRunEventsForLayout([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [{ name: 'MyLocalVariable', type: 'number', value: 8 }],
        conditions: [],
        actions: [
          {
            type: { value: 'Wait' },
            parameters: ['1.5'],
          },
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['SuccessVariable', '+', 'MyLocalVariable'],
          },
          {
            type: { value: 'Wait' },
            parameters: ['1.5'],
          },
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['SuccessVariable', '+', 'MyLocalVariable'],
          },
        ],
      },
    ]);

    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(0);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(8);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(16);
  });

  it('generates a local variable action after an async action', function () {
    scene.getVariables().insertNew('SuccessVariable', 0).setValue(0);
    const runtimeScene = generateAndRunEventsForLayout([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [{ name: 'MyLocalVariable', type: 'number', value: 1 }],
        conditions: [],
        actions: [
          {
            type: { value: 'Wait' },
            parameters: ['1.5'],
          },
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyLocalVariable', '+', '1'],
          },
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['SuccessVariable', '+', 'MyLocalVariable'],
          },
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyLocalVariable', '+', '1'],
          },
          {
            type: { value: 'Wait' },
            parameters: ['1.5'],
          },
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['SuccessVariable', '+', 'MyLocalVariable'],
          },
        ],
      },
    ]);

    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(0);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2 + 3);
  });

  it('generates async forks that share a local variable', function () {
    scene.getVariables().insertNew('SuccessVariable', 0).setValue(0);
    const runtimeScene = generateAndRunEventsForLayout([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [{ name: 'MyLocalVariable', type: 'number', value: 1 }],
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['2.5'],
              },
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['MyLocalVariable', '+', '1'],
              },
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['SuccessVariable', '+', 'MyLocalVariable'],
              },
            ],
          },
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['1.5'],
              },
              // The same action is used here because the mock doesn't handle
              // the wait duration.
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['MyLocalVariable', '+', '1'],
              },
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['SuccessVariable', '+', 'MyLocalVariable'],
              },
            ],
          },
        ],
      },
    ]);

    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(0);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2 + 3);
  });

  it('generates an async fork that shares a local variable a non-async sub-event', function () {
    scene.getVariables().insertNew('SuccessVariable', 0).setValue(0);
    const runtimeScene = generateAndRunEventsForLayout([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [{ name: 'MyLocalVariable', type: 'number', value: 1 }],
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'Wait' },
                parameters: ['2.5'],
              },
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['MyLocalVariable', '+', '3'],
              },
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['SuccessVariable', '+', 'MyLocalVariable'],
              },
            ],
          },
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              // There is no wait action this time
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['MyLocalVariable', '+', '1'],
              },
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['SuccessVariable', '+', 'MyLocalVariable'],
              },
            ],
          },
        ],
      },
    ]);

    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2 + 5);
  });

  it('generates an async fork that shares a scene variable a non-async sub-event', function () {
    scene.getVariables().insertNew('SuccessVariable', 0).setValue(0);
    scene.getVariables().insertNew('MySceneVariable', 0).setValue(1);
    const runtimeScene = generateAndRunEventsForLayout([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'Wait' },
            parameters: ['2.5'],
          },
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MySceneVariable', '+', '3'],
          },
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['SuccessVariable', '+', 'MySceneVariable'],
          },
        ],
      },
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          // There is no wait action this time
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MySceneVariable', '+', '1'],
          },
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['SuccessVariable', '+', 'MySceneVariable'],
          },
        ],
      },
    ]);

    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2);

    // Process the tasks (after faking it's finished).
    runtimeScene.getAsyncTasksManager().markAllFakeAsyncTasksAsFinished();
    runtimeScene.getAsyncTasksManager().processTasks(runtimeScene);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(2 + 5);
  });

  test('generate an asynchronous action with objects', function () {
    const object = scene.insertNewObject(project, 'Sprite', 'MyObjectA', 0);
    object.getVariables().insertNew('TestVariable', 0).setValue(0);
    const instance = scene.getInitialInstances().insertNewInitialInstance();
    instance.setObjectName('MyObjectA');
    const runtimeScene = generateAndRunEventsForLayout([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'SetNumberObjectVariable' },
            parameters: ['MyObjectA', 'TestVariable', '+', '5'],
          },
          {
            type: { value: 'Wait' },
            parameters: ['1.5'],
          },
          {
            type: { value: 'SetNumberObjectVariable' },
            parameters: ['MyObjectA', 'TestVariable', '+', '5'],
          },
        ],
      },
    ]);

    const myObjectA = runtimeScene.getObjects('MyObjectA')[0];
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
});
