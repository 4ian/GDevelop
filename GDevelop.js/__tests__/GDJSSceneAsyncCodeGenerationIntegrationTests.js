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
              type: { value: 'ModVarScene' },
              parameters: ['SuccessVariable', '+', '1'],
            },
            {
              type: { value: 'Wait' },
              parameters: ['1.5'],
            },
            {
              type: { value: 'ModVarScene' },
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

  test('generate an asynchronous action with objects', function () {
    const object = scene.insertNewObject(project, 'Sprite', 'MyObjectA', 0);
    object.getVariables().insertNew('TestVariable', 0).setValue(0);
    const instance = scene
      .getInitialInstances()
      .insertNewInitialInstance();
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
