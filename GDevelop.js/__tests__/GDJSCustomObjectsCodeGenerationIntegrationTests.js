const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const {
  generateCompiledEventsForEventsBasedObject,
  generateCompiledEventsForSerializedEventsBasedExtension,
} = require('../TestUtils/CodeGenerationHelpers.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const { makeTestExtensions } = require('../TestUtils/TestExtensions.js');

describe('libGD.js - GDJS Custom Object Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
    makeTestExtensions(gd);
  });

  it('generates a working custom object with properties (with different types), all used in an expression', () => {
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const extensionModule = generateCompiledEventsForSerializedEventsBasedExtension(
      gd,
      require('./extensions/EBObject.json'),
      gdjs,
      runtimeScene
    );

    const {
      objects: { Object },
    } = extensionModule;

    const object = new Object(runtimeScene, { content: {} });
    object.testProperties();

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(7);
    expect(runtimeScene.getVariables().has('SuccessStringVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessStringVariable').getAsString()
    ).toBe('2trueTest');
  });

  it('generates a working custom object function with parameters (with different types), all used in an expression ', () => {
    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const extensionModule = generateCompiledEventsForSerializedEventsBasedExtension(
      gd,
      require('./extensions/EBObject.json'),
      gdjs,
      runtimeScene
    );

    const {
      objects: { Object },
    } = extensionModule;

    const object = new Object(runtimeScene, { content: {} });
    object.testParameters(16, '32', true, 'TestTest');

    expect(runtimeScene.getVariables().has('SuccessVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessVariable').getAsNumber()
    ).toBe(16 + 32 + 1);
    expect(runtimeScene.getVariables().has('SuccessStringVariable')).toBe(true);
    expect(
      runtimeScene.getVariables().get('SuccessStringVariable').getAsString()
    ).toBe('16trueTestTest');
  });



  it('Can use a property in a variable action', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedObject = eventsFunctionsExtension
      .getEventsBasedObjects()
      .insertNew('MyCustomObject', 0);

    eventsBasedObject
      .getPropertyDescriptors()
      .insertNew('MyProperty', 0)
      .setValue('123')
      .setType('Number');

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyProperty', '=', '456'],
          },
        ],
      },
    ]);
    eventsBasedObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0)
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    eventsSerializerElement.delete();
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );

    const { runtimeScene, object } = generatedCustomObject(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      { logCode: false }
    );

    // Check the default value is set.
    expect(object._getMyProperty()).toBe(123);

    object.MyFunction();
    expect(object._getMyProperty()).toBe(456);
  });

  it('Can use a property in a variable condition', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const scene = project.insertNewLayout('MyScene', 0);
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedObject = eventsFunctionsExtension
      .getEventsBasedObjects()
      .insertNew('MyCustomObject', 0);

    eventsBasedObject
      .getPropertyDescriptors()
      .insertNew('MyProperty', 0)
      .setValue('123')
      .setType('Number');

    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setValue(0);

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['MyProperty', '=', '123'],
          },
        ],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyVariable', '=', '456'],
          },
        ],
      },
    ]);
    eventsBasedObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0)
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    eventsSerializerElement.delete();
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );

    const { runtimeScene, object } = generatedCustomObject(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    object.MyFunction();
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(456);
  });

  it('Can use a property in a variable condition (with name collisions)', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const scene = project.insertNewLayout('MyScene', 0);
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedObject = eventsFunctionsExtension
      .getEventsBasedObjects()
      .insertNew('MyCustomObject', 0);

    eventsBasedObject
      .getPropertyDescriptors()
      .insertNew('MyIdentifier', 0)
      .setValue('123')
      .setType('Number');

    // Extension scene variable with the same name as the property.
    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyIdentifier', 0)
      .setValue(222);

    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setValue(0);

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['MyIdentifier', '=', '123'],
          },
        ],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyVariable', '=', '456'],
          },
        ],
      },
    ]);
    eventsBasedObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0)
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    eventsSerializerElement.delete();
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );

    const { runtimeScene, object } = generatedCustomObject(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    object.MyFunction();
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(456);
  });

  it('Can use a parameter in a variable condition', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedObject = eventsFunctionsExtension
      .getEventsBasedObjects()
      .insertNew('MyCustomObject', 0);

    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setValue(0);

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['MyParameter', '=', '123'],
          },
        ],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyVariable', '=', '456'],
          },
        ],
      },
    ]);
    const eventsFunction = eventsBasedObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    eventsSerializerElement.delete();
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );
    const parameter = eventsFunction
      .getParameters()
      .insertNewParameter(
        'MyParameter',
        eventsFunction.getParameters().getParametersCount()
      );
    parameter.setType('number');

    const { runtimeScene, object } = generatedCustomObject(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    object.MyFunction(123);
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(456);
  });

  it('Can use a parameter in a variable condition (with name collisions)', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedObject = eventsFunctionsExtension
      .getEventsBasedObjects()
      .insertNew('MyCustomObject', 0);

    // Property with the same name as the parameter.
    eventsBasedObject
      .getPropertyDescriptors()
      .insertNew('MyIdentifier', 0)
      .setValue('111')
      .setType('Number');

    // Extension scene variable with the same name as the parameter.
    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyIdentifier', 0)
      .setValue(222);

    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setValue(0);

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['MyIdentifier', '=', '123'],
          },
        ],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyVariable', '=', '456'],
          },
        ],
      },
    ]);
    const eventsFunction = eventsBasedObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    eventsSerializerElement.delete();
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );
    const parameter = eventsFunction
      .getParameters()
      .insertNewParameter(
        'MyIdentifier',
        eventsFunction.getParameters().getParametersCount()
      );
    parameter.setType('number');

    const { runtimeScene, object } = generatedCustomObject(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    object.MyFunction(123);
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(456);
  });

  it('Can use a local variable in a variable condition (with name collisions)', () => {
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedObject = eventsFunctionsExtension
      .getEventsBasedObjects()
      .insertNew('MyCustomObject', 0);

    // Property with the same name as the local variable.
    eventsBasedObject
      .getPropertyDescriptors()
      .insertNew('MyIdentifier', 0)
      .setValue('111')
      .setType('Number');

    // Extension scene variable with the same name as the local variable.
    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyIdentifier', 0)
      .setValue(222);

    eventsFunctionsExtension
      .getSceneVariables()
      .insertNew('MyVariable', 0)
      .setValue(0);

    const eventsSerializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [
          {
            name: 'MyIdentifier',
            type: 'number',
            value: 123,
          },
        ],
        conditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['MyIdentifier', '=', '123'],
          },
        ],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['MyVariable', '=', '456'],
          },
        ],
      },
    ]);
    const eventsFunction = eventsBasedObject
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);
    eventsFunction
      .getEvents()
      .unserializeFrom(project, eventsSerializerElement);
    eventsSerializerElement.delete();
    gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
      eventsFunctionsExtension,
      eventsBasedObject
    );
    // Parameter with the same name as the local variable.
    const parameter = eventsFunction
      .getParameters()
      .insertNewParameter(
        'MyIdentifier',
        eventsFunction.getParameters().getParametersCount()
      );
    parameter.setType('number');

    const { runtimeScene, object } = generatedCustomObject(
      gd,
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      { logCode: false }
    );

    // Check the default value is set.
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(0);

    object.MyFunction(333);
    expect(
      runtimeScene
        .getVariablesForExtension('MyExtension')
        .get('MyVariable')
        .getAsNumber()
    ).toBe(456);
  });

  describe('Child object instance creation', () => {
    // Builds an events-based object with a child object and an events function
    // running the provided list of events.
    const setupCustomObjectWithChild = (events) => {
      const project = new gd.ProjectHelper.createNewGDJSProject();
      const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
        'MyExtension',
        0
      );
      const eventsBasedObject = eventsFunctionsExtension
        .getEventsBasedObjects()
        .insertNew('MyCustomObject', 0);

      eventsBasedObject
        .getObjects()
        .insertNewObject(project, 'Sprite', 'MyChildObject', 0);

      const eventsSerializerElement = gd.Serializer.fromJSObject(events);
      eventsBasedObject
        .getEventsFunctions()
        .insertNewEventsFunction('MyFunction', 0)
        .getEvents()
        .unserializeFrom(project, eventsSerializerElement);
      eventsSerializerElement.delete();
      gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
        eventsFunctionsExtension,
        eventsBasedObject
      );

      return generatedCustomObject(
        gd,
        project,
        eventsFunctionsExtension,
        eventsBasedObject,
        { logCode: false }
      );
    };

    it('Picks a created child object only once in the same event scope', () => {
      const { runtimeScene, object } = setupCustomObjectWithChild([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'MyChildObject', '0', '0', ''],
            },
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'PickedAfterCreate',
                '=',
                'PickedInstancesCount(MyChildObject)',
              ],
            },
          ],
        },
      ]);

      object.MyFunction();

      // The created child object should be picked exactly once.
      expect(
        runtimeScene.getVariables().get('PickedAfterCreate').getAsNumber()
      ).toBe(1);
      // And it should only be created once on the scene.
      expect(runtimeScene.getObjects('MyChildObject').length).toBe(1);
    });

    it('Picks a created child object only once when picked again in a sibling event', () => {
      // This is the scenario broken by the regression: after a child object
      // is created, a subsequent event re-picking all instances of the child
      // object would see it twice because it had been pushed twice into the
      // function-level child object list.
      const { runtimeScene, object } = setupCustomObjectWithChild([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'MyChildObject', '0', '0', ''],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'PickAllInstances' },
              parameters: ['', 'MyChildObject'],
            },
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'PickedAfterRePick',
                '=',
                'PickedInstancesCount(MyChildObject)',
              ],
            },
          ],
        },
      ]);

      object.MyFunction();

      // After re-picking all instances, the created child object should
      // appear exactly once.
      expect(
        runtimeScene.getVariables().get('PickedAfterRePick').getAsNumber()
      ).toBe(1);
      expect(runtimeScene.getObjects('MyChildObject').length).toBe(1);
    });

    it('Counts created child object instances once in scene instances count', () => {
      const { runtimeScene, object } = setupCustomObjectWithChild([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'MyChildObject', '0', '0', ''],
            },
            {
              type: { value: 'PickAllInstances' },
              parameters: ['', 'MyChildObject'],
            },
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'SceneCount',
                '=',
                'SceneInstancesCount(MyChildObject)',
              ],
            },
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'PickedCount',
                '=',
                'PickedInstancesCount(MyChildObject)',
              ],
            },
          ],
        },
      ]);

      object.MyFunction();

      // Both the scene-instances count and the picked-instances count must
      // agree: a single child object was created.
      expect(
        runtimeScene.getVariables().get('SceneCount').getAsNumber()
      ).toBe(1);
      expect(
        runtimeScene.getVariables().get('PickedCount').getAsNumber()
      ).toBe(1);
      expect(runtimeScene.getObjects('MyChildObject').length).toBe(1);
    });

    it('Picks several created child object instances once each', () => {
      const { runtimeScene, object } = setupCustomObjectWithChild([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'MyChildObject', '0', '0', ''],
            },
            {
              type: { value: 'Create' },
              parameters: ['', 'MyChildObject', '0', '0', ''],
            },
            {
              type: { value: 'Create' },
              parameters: ['', 'MyChildObject', '0', '0', ''],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'PickAllInstances' },
              parameters: ['', 'MyChildObject'],
            },
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'PickedAfterRePick',
                '=',
                'PickedInstancesCount(MyChildObject)',
              ],
            },
          ],
        },
      ]);

      object.MyFunction();

      // Three creations should yield three picked instances - not six.
      expect(
        runtimeScene.getVariables().get('PickedAfterRePick').getAsNumber()
      ).toBe(3);
      expect(runtimeScene.getObjects('MyChildObject').length).toBe(3);
    });

    it('Modifies a created child object only once via picked-list actions', () => {
      // If the created child instance was picked twice, an additive action
      // on the picked list would run twice on the same object. Using "+"
      // makes the doubling observable on the resulting variable value.
      const { runtimeScene, object } = setupCustomObjectWithChild([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'MyChildObject', '0', '0', ''],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'PickAllInstances' },
              parameters: ['', 'MyChildObject'],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: ['MyChildObject', 'Counter', '+', '1'],
            },
          ],
        },
      ]);

      object.MyFunction();

      const childInstances = runtimeScene.getObjects('MyChildObject');
      expect(childInstances.length).toBe(1);
      // The "+ 1" action must have run exactly once on the unique child
      // instance, so the counter is 1 (not 2).
      expect(
        childInstances[0].getVariables().get('Counter').getAsNumber()
      ).toBe(1);
    });

    it('Picks only the newly created child object instance in each sibling event', () => {
      // Two child object instances are created in two sibling events.
      // Each sibling event has its own picking scope, so the action
      // following the Create must only affect the instance created in
      // that scope - not the instance created in the previous scope.
      const { runtimeScene, object } = setupCustomObjectWithChild([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'MyChildObject', '0', '0', ''],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: ['MyChildObject', 'CreatedIn', '=', '1'],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: ['MyChildObject', 'Counter', '+', '1'],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'MyChildObject', '0', '0', ''],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: ['MyChildObject', 'CreatedIn', '=', '2'],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: ['MyChildObject', 'Counter', '+', '1'],
            },
          ],
        },
      ]);

      object.MyFunction();

      const childInstances = runtimeScene.getObjects('MyChildObject');
      expect(childInstances.length).toBe(2);

      // Each instance was created in its own scope, so the "CreatedIn"
      // variable must distinguish them: one is tagged 1, the other 2.
      const createdInValues = childInstances
        .map((instance) => instance.getVariables().get('CreatedIn').getAsNumber())
        .sort();
      expect(createdInValues).toEqual([1, 2]);

      // The "+ 1" counter ran exactly once on each instance: the action
      // in the second sibling event must not see the instance created in
      // the first sibling event.
      for (const instance of childInstances) {
        expect(instance.getVariables().get('Counter').getAsNumber()).toBe(1);
      }
    });

    it('Picks all created child object instances exactly once when re-picked', () => {
      // Two child object instances are created in two sibling events.
      // A third sibling event re-picks all instances and applies a
      // counter increment. Each instance must be picked exactly once.
      const { runtimeScene, object } = setupCustomObjectWithChild([
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'MyChildObject', '0', '0', ''],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: ['MyChildObject', 'CreatedIn', '=', '1'],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Create' },
              parameters: ['', 'MyChildObject', '0', '0', ''],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: ['MyChildObject', 'CreatedIn', '=', '2'],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'PickAllInstances' },
              parameters: ['', 'MyChildObject'],
            },
            {
              type: { value: 'ModVarScene' },
              parameters: [
                'PickedAfterRePick',
                '=',
                'PickedInstancesCount(MyChildObject)',
              ],
            },
            {
              type: { value: 'ModVarObjet' },
              parameters: ['MyChildObject', 'AllPickedCounter', '+', '1'],
            },
          ],
        },
      ]);

      object.MyFunction();

      const childInstances = runtimeScene.getObjects('MyChildObject');
      expect(childInstances.length).toBe(2);

      // After re-picking, exactly the two created instances are picked
      // (not duplicated entries of the same instance).
      expect(
        runtimeScene.getVariables().get('PickedAfterRePick').getAsNumber()
      ).toBe(2);

      // Both instances have been incremented exactly once each by the
      // re-pick + ModVarObjet action.
      const createdInValues = childInstances
        .map((instance) => instance.getVariables().get('CreatedIn').getAsNumber())
        .sort();
      expect(createdInValues).toEqual([1, 2]);
      for (const instance of childInstances) {
        expect(
          instance.getVariables().get('AllPickedCounter').getAsNumber()
        ).toBe(1);
      }
    });
  });
});

function generatedCustomObject(
  gd,
  project,
  eventsFunctionsExtension,
  eventsBasedObject,
  options = {}
) {
  const serializedProjectElement = new gd.SerializerElement();
  project.serializeTo(serializedProjectElement);
  const serializedSceneElement = new gd.SerializerElement();
  const scene = project.insertNewLayout('MyScene', 0);
  scene.serializeTo(serializedSceneElement);
  const { gdjs, runtimeScene } = makeMinimalGDJSMock({
    gameData: JSON.parse(gd.Serializer.toJSON(serializedProjectElement)),
    sceneData: JSON.parse(gd.Serializer.toJSON(serializedSceneElement)),
  });

  const CompiledRuntimeCustomObject = generateCompiledEventsForEventsBasedObject(
    gd,
    project,
    eventsFunctionsExtension,
    eventsBasedObject,
    gdjs,
    options
  );
  serializedProjectElement.delete();
  serializedSceneElement.delete();
  project.delete();

  const object = new CompiledRuntimeCustomObject(runtimeScene, { content: {} });

  return { gdjs, runtimeScene, object };
}
