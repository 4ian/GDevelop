const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsForEventsBasedBehavior,
  generateCompiledEventsForLayout,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Advanced Behavior Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  describe('Object parameter creation (FireBullet-like behavior)', () => {
    it('Picks only the instances created by a behavior action via an object parameter', () => {
      // A behavior MyBehavior has a custom action MyAction that takes an
      // object as parameter. The action's events use Create twice on the
      // object passed as parameter, mimicking a FireBullet behavior.
      //
      // The scene contains two objects: Bullet (the parameter type) and
      // Cannon (the object holding the behavior). The scene events first
      // create one Bullet directly (without going through the behavior),
      // and in a subsequent event call MyBehavior::MyAction(Bullet) on the
      // Cannon, then increment a Counter on the picked Bullet. Only the
      // two newly created Bullets must be picked by this increment - not
      // the one created in the previous scene event.
      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
        'MyExtension',
        0
      );
      const eventsBasedBehavior = eventsFunctionsExtension
        .getEventsBasedBehaviors()
        .insertNew('MyBehavior', 0);

      // Behavior's MyAction creates the parameter object twice.
      const behaviorEventsSerializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'MyObjectParam', '0', '0', ''],
            },
            {
              type: { value: 'Create' },
              parameters: ['', 'MyObjectParam', '0', '0', ''],
            },
          ],
        },
      ]);
      const behaviorEventsFunction = eventsBasedBehavior
        .getEventsFunctions()
        .insertNewEventsFunction('MyAction', 0);
      behaviorEventsFunction
        .getEvents()
        .unserializeFrom(project, behaviorEventsSerializerElement);
      behaviorEventsSerializerElement.delete();
      gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
        eventsFunctionsExtension,
        eventsBasedBehavior
      );
      // Add the object parameter used in the behavior's events. Use
      // "objectListOrEmptyIfJustDeclared" (the IDE's "Created objects"
      // parameter type) so the parameter starts empty in the caller scope
      // and only contains the instances created inside the action.
      const objectParameter = behaviorEventsFunction
        .getParameters()
        .insertNewParameter(
          'MyObjectParam',
          behaviorEventsFunction.getParameters().getParametersCount()
        );
      objectParameter.setType('objectListOrEmptyIfJustDeclared');

      // Scene with the two objects:
      // - Bullet, the object passed as parameter
      // - Cannon, the object holding the behavior
      const layout = project.insertNewLayout('MyScene', 0);
      layout.getObjects().insertNewObject(project, 'Sprite', 'Bullet', 0);
      const cannon = layout
        .getObjects()
        .insertNewObject(project, 'Sprite', 'Cannon', 1);
      // Register the events-based behavior on the platform so that the
      // layout code generator can find the metadata for the action call.
      const platformExtension = new gd.PlatformExtension();
      gd.MetadataDeclarationHelper.declareExtension(
        platformExtension,
        eventsFunctionsExtension
      );
      const behaviorMethodMangledNames = new gd.MapStringString();
      gd.MetadataDeclarationHelper.generateBehaviorMetadata(
        project,
        platformExtension,
        eventsFunctionsExtension,
        eventsBasedBehavior,
        behaviorMethodMangledNames
      );
      behaviorMethodMangledNames.delete();
      gd.JsPlatform.get().addNewExtension(platformExtension);
      platformExtension.delete();

      cannon.addNewBehavior(
        project,
        'MyExtension::MyBehavior',
        'MyBehavior'
      );

      // Scene events:
      // - First event: create one Bullet directly.
      // - Second event: call the behavior's MyAction passing Bullet, then
      //   increment Counter on the picked Bullets.
      const layoutEventsSerializerElement = gd.Serializer.fromJSObject([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'Bullet', '0', '0', ''],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'MyExtension::MyBehavior::MyAction' },
              parameters: ['Cannon', 'MyBehavior', 'Bullet'],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: ['Bullet', 'Counter', '+', '1'],
            },
          ],
        },
      ]);
      layout
        .getEvents()
        .unserializeFrom(project, layoutEventsSerializerElement);
      layoutEventsSerializerElement.delete();

      // Serialize before we delete the project, since the mock needs the
      // project/scene data to instantiate the runtime scene.
      const serializedProjectElement = new gd.SerializerElement();
      project.serializeTo(serializedProjectElement);
      const serializedSceneElement = new gd.SerializerElement();
      layout.serializeTo(serializedSceneElement);

      const { gdjs, runtimeScene } = makeMinimalGDJSMock({
        gameData: JSON.parse(gd.Serializer.toJSON(serializedProjectElement)),
        sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
      });

      // Compile the behavior - this also registers it on the gdjs mock.
      const CompiledRuntimeBehavior =
        generateCompiledEventsForEventsBasedBehavior(
          gd,
          project,
          eventsFunctionsExtension,
          eventsBasedBehavior,
          gdjs,
          { logCode: false }
        );

      // Compile the layout events.
      const runCompiledLayoutEvents = generateCompiledEventsForLayout(
        gd,
        project,
        layout,
        false
      );

      serializedProjectElement.delete();
      serializedSceneElement.delete();
      project.delete();

      // Manually create a Cannon instance with MyBehavior attached: the
      // minimal GDJS mock does not auto-instantiate behaviors from the
      // scene data.
      const cannonInstance = runtimeScene.createObject('Cannon');
      const behaviorInstance = new CompiledRuntimeBehavior(
        runtimeScene,
        { name: 'MyBehavior', type: 'MyExtension::MyBehavior' },
        cannonInstance
      );
      cannonInstance.addBehavior(behaviorInstance);

      runCompiledLayoutEvents(gdjs, runtimeScene);

      // Three Bullets should exist on the scene: one created directly in
      // the first scene event, plus the two created by the behavior's
      // action via the object parameter.
      const bulletInstances = runtimeScene.getObjects('Bullet');
      expect(bulletInstances.length).toBe(3);

      // Only the two Bullets created through the behavior's action must
      // be picked by the increment that follows the action call. The
      // Bullet created directly in the previous scene event must keep
      // its Counter at 0.
      const counterValues = bulletInstances
        .map((instance) =>
          instance.getVariables().get('Counter').getAsNumber()
        )
        .sort();
      expect(counterValues).toEqual([0, 1, 1]);
    });
  });
});
