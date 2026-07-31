const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS multiple object picking integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  it('applies an object action to every picked instance', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarObjet' },
            parameters: ['MyObject', 'Touched', '=', '1'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        parameterTypes: {
          MyObject: 'object',
        },
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const myObjects = [
      runtimeScene.createObject('MyObject'),
      runtimeScene.createObject('MyObject'),
    ];
    const objectLists = gdjs.Hashtable.newFrom({ MyObject: myObjects });

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    expect(
      myObjects.every(
        (object) => object.getVariables().get('Touched').getAsNumber() === 1
      )
    ).toBe(true);
  });

  it('uses the first picked instance for an object expression', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', 'MyObject.Variable(Value)'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        parameterTypes: {
          MyObject: 'object',
        },
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const objectListAssertionSpy = jest.spyOn(
      gdjs,
      'assertObjectListHasNoMoreThanOnePickedInstance'
    );
    const objectListsAssertionSpy = jest.spyOn(
      gdjs,
      'assertObjectListsHaveNoMoreThanOnePickedInstance'
    );
    const myObject1 = runtimeScene.createObject('MyObject');
    const myObject2 = runtimeScene.createObject('MyObject');
    myObject1.getVariables().get('Value').setNumber(1);
    myObject2.getVariables().get('Value').setNumber(2);
    const objectLists = gdjs.Hashtable.newFrom({
      MyObject: [myObject1, myObject2],
    });

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(1);
    expect(objectListAssertionSpy).not.toHaveBeenCalled();
    expect(objectListsAssertionSpy).not.toHaveBeenCalled();
  });

  it('passes every picked instance to an object-list function parameter', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', 'PickedInstancesCount(MyObject)'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        parameterTypes: {
          MyObject: 'object',
        },
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const objectMapAssertionSpy = jest.spyOn(
      gdjs,
      'assertObjectMapHasNoMoreThanOnePickedInstance'
    );
    const objectLists = gdjs.Hashtable.newFrom({
      MyObject: [
        runtimeScene.createObject('MyObject'),
        runtimeScene.createObject('MyObject'),
      ],
    });

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(2);
    expect(objectMapAssertionSpy).not.toHaveBeenCalled();
  });

  it('allows a picking condition to narrow multiple picked instances', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'PickRandomInstance' },
            parameters: ['', 'MyObject'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarObjet' },
            parameters: ['MyObject', 'Touched', '=', '1'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        parameterTypes: {
          MyObject: 'object',
        },
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const myObjects = [
      runtimeScene.createObject('MyObject'),
      runtimeScene.createObject('MyObject'),
    ];
    const objectLists = gdjs.Hashtable.newFrom({ MyObject: myObjects });

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    expect(
      myObjects.filter(
        (object) => object.getVariables().get('Touched').getAsNumber() === 1
      )
    ).toHaveLength(1);
  });

  it('applies object actions inside a for each object event', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'MyObject',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarObjet' },
            parameters: ['MyObject', 'Touched', '=', '1'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        parameterTypes: {
          MyObject: 'object',
        },
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const myObjects = [
      runtimeScene.createObject('MyObject'),
      runtimeScene.createObject('MyObject'),
    ];
    const objectLists = gdjs.Hashtable.newFrom({ MyObject: myObjects });

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    expect(
      myObjects.every(
        (object) => object.getVariables().get('Touched').getAsNumber() === 1
      )
    ).toBe(true);
  });
});
