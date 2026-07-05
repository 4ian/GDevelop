const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

const expectAmbiguousObjectPickingError = (fn) => {
  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  try {
    expect(fn).toThrow(/Ambiguous object picking/);
  } finally {
    consoleErrorSpy.mockRestore();
  }
};

describe('libGD.js - GDJS deterministic object picking integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  it('throws when an object action receives more than one picked instance', function () {
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

    expectAmbiguousObjectPickingError(() =>
      runCompiledEvents(gdjs, runtimeScene, [objectLists])
    );
  });

  it('throws when an object expression receives more than one picked instance', function () {
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
    const myObject1 = runtimeScene.createObject('MyObject');
    const myObject2 = runtimeScene.createObject('MyObject');
    myObject1.getVariables().get('Value').setNumber(1);
    myObject2.getVariables().get('Value').setNumber(2);
    const objectLists = gdjs.Hashtable.newFrom({
      MyObject: [myObject1, myObject2],
    });

    expectAmbiguousObjectPickingError(() =>
      runCompiledEvents(gdjs, runtimeScene, [objectLists])
    );
  });

  it('throws when an object-list function parameter receives more than one picked instance', function () {
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
    const objectLists = gdjs.Hashtable.newFrom({
      MyObject: [
        runtimeScene.createObject('MyObject'),
        runtimeScene.createObject('MyObject'),
      ],
    });

    expectAmbiguousObjectPickingError(() =>
      runCompiledEvents(gdjs, runtimeScene, [objectLists])
    );
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

  it('allows deterministic object actions inside a for each object event', function () {
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
