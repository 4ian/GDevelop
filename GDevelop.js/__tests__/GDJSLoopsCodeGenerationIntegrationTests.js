const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS Loops Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  it('can generate a While event', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '=', '0'],
          },
        ],
        events: [],
      },
      {
        infiniteLoopWarning: true,
        type: 'BuiltinCommonInstructions::While',
        whileConditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '<', '4'],
          },
        ],
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '+', '1'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().has('Counter')).toBe(true);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(4);
  });

  it('can generate nested While events', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '=', '0'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['CellY', '=', '0'],
          },
        ],
        events: [],
      },
      {
        infiniteLoopWarning: true,
        type: 'BuiltinCommonInstructions::While',
        whileConditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['CellY', '<', '4'],
          },
        ],
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['CellX', '=', '0'],
          },
        ],
        events: [
          {
            infiniteLoopWarning: true,
            type: 'BuiltinCommonInstructions::While',
            whileConditions: [
              {
                type: { value: 'VarScene' },
                parameters: ['CellX', '<', '5'],
              },
            ],
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['CellX', '+', '1'],
              },
              {
                type: { value: 'ModVarScene' },
                parameters: ['Counter', '+', '1'],
              },
            ],
            events: [],
          },
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['CellY', '+', '1'],
              },
            ],
            events: [],
          },
        ],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().has('Counter')).toBe(true);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(20);
  });

  it('can generate a Repeat event', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Repeat',
        repeatExpression: '4',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '+', '1'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().has('Counter')).toBe(true);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(4);
  });

  it('can generate a nested Repeat event', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Repeat',
        repeatExpression: '4',
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::Repeat',
            repeatExpression: '5',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['Counter', '+', '1'],
              },
            ],
            events: [],
          },
        ],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().has('Counter')).toBe(true);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(20);
  });

  it('can generate a "for each object" event', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'MyObject',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '+', 'MyObject.Variable(MyVariable)'],
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
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();

    // Create 4 objects with variable values from 1 to 4.
    const objectLists = new gdjs.Hashtable();
    const myObjects = [];
    objectLists.put('MyObject', myObjects);
    for (let index = 1; index <= 4; index++) {
      const myObject = runtimeScene.createObject('MyObject');
      myObject.getVariables().get('MyVariable').setNumber(index);
      myObjects.push(myObject);
    }

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    expect(runtimeScene.getVariables().has('Counter')).toBe(true);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
      1 + 2 + 3 + 4
    );
  });

  it('can generate a nested "for each object" event', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'MyObjectA',
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::ForEach',
            object: 'MyObjectB',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: [
                  'Counter',
                  '+',
                  'MyObjectA.Variable(MyVariable) * MyObjectB.Variable(MyVariable)',
                ],
              },
            ],
            events: [],
          },
        ],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        parameterTypes: {
          MyObjectA: 'object',
          MyObjectB: 'object',
        },
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();

    // Create 4 objects with variable values from 1 to 4.
    const objectALists = new gdjs.Hashtable();
    const myObjectsA = [];
    objectALists.put('MyObjectA', myObjectsA);
    for (let index = 1; index <= 4; index++) {
      const myObjectA = runtimeScene.createObject('MyObjectA');
      myObjectA.getVariables().get('MyVariable').setNumber(index);
      myObjectsA.push(myObjectA);
    }
    // Create 3 objects with variable values from 5 to 7.
    const objectBLists = new gdjs.Hashtable();
    const myObjectsB = [];
    objectBLists.put('MyObjectB', myObjectsB);
    for (let index = 1; index <= 3; index++) {
      const myObjectB = runtimeScene.createObject('MyObjectB');
      myObjectB
        .getVariables()
        .get('MyVariable')
        .setNumber(4 + index);
      myObjectsB.push(myObjectB);
    }

    runCompiledEvents(gdjs, runtimeScene, [objectALists, objectBLists]);

    expect(runtimeScene.getVariables().has('Counter')).toBe(true);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
      (1 + 2 + 3 + 4) * (5 + 6 + 7)
    );
  });

  it('can generate a "for each child variable" event with undeclared variables', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEachChildVariable',
        iterableVariableName: 'MyVariable',
        valueIteratorVariableName: 'child',
        keyIteratorVariableName: '',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '+', 'Variable(child)'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();

    // Create 4 child-variables with values from 1 to 4.
    const myVariable = runtimeScene.getVariables().get('MyVariable');
    for (let index = 1; index <= 4; index++) {
      myVariable.getChild('Child' + index).setNumber(index);
    }

    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().has('Counter')).toBe(true);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
      1 + 2 + 3 + 4
    );
  });

  it('can generate a nested "for each child variable" event with undeclared variables', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEachChildVariable',
        iterableVariableName: 'MyVariableA',
        valueIteratorVariableName: 'childA',
        keyIteratorVariableName: '',
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::ForEachChildVariable',
            iterableVariableName: 'MyVariableB',
            valueIteratorVariableName: 'childB',
            keyIteratorVariableName: '',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: [
                  'Counter',
                  '+',
                  'Variable(childA) * Variable(childB)',
                ],
              },
            ],
            events: [],
          },
        ],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();

    // Create 4 child-variables with values from 1 to 4.
    const myVariableA = runtimeScene.getVariables().get('MyVariableA');
    for (let index = 1; index <= 4; index++) {
      myVariableA.getChild('Child' + index).setNumber(index);
    }
    // Create 4 child-variables with values from 5 to 7.
    const myVariableB = runtimeScene.getVariables().get('MyVariableB');
    for (let index = 1; index <= 3; index++) {
      myVariableB.getChild('Child' + index).setNumber(4 + index);
    }

    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().has('Counter')).toBe(true);
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
      (1 + 2 + 3 + 4) * (5 + 6 + 7)
    );
  });

  it('can generate a While event with local variables', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::While',
        whileConditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['LocalCounter', '<', '3'],
          },
        ],
        variables: [{ name: 'LocalCounter', type: 'number', value: 0 }],
        conditions: [],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['LocalCounter', '+', '1'],
          },
          {
            type: { value: 'ModVarScene' },
            parameters: ['Counter', '+', 'LocalCounter'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(6);
    expect(runtimeScene.getVariables().has('LocalCounter')).toBe(false);
  });

  it('can generate a While event with an index variable', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::While',
        whileConditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['LoopIndex', '<', '4'],
          },
        ],
        variables: [{ name: 'LoopIndex', type: 'number', value: 0 }],
        loopIndexVariable: 'LoopIndex',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Sum', '+', 'LoopIndex'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(6);
    expect(runtimeScene.getVariables().has('LoopIndex')).toBe(false);
  });

  it('can generate a Repeat event with local variables', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Repeat',
        repeatExpression: '3',
        variables: [{ name: 'LocalValue', type: 'number', value: 1 }],
        conditions: [],
        actions: [
          {
            type: { value: 'SetNumberVariable' },
            parameters: ['LocalValue', '+', '1'],
          },
          {
            type: { value: 'ModVarScene' },
            parameters: ['Sum', '+', 'LocalValue'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(9);
    expect(runtimeScene.getVariables().has('LocalValue')).toBe(false);
  });

  it('can generate a Repeat event with an index variable', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Repeat',
        repeatExpression: '5',
        variables: [{ name: 'LoopIndex', type: 'number', value: 0 }],
        loopIndexVariable: 'LoopIndex',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Sum', '+', 'LoopIndex'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(10);
    expect(runtimeScene.getVariables().has('LoopIndex')).toBe(false);
  });

  it('can generate a ForEach event with local variables', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'MyObject',
        variables: [{ name: 'Multiplier', type: 'number', value: 2 }],
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: [
              'Counter',
              '+',
              'MyObject.Variable(MyVariable) * Multiplier',
            ],
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
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const objectLists = new gdjs.Hashtable();
    const myObjects = [];
    objectLists.put('MyObject', myObjects);
    for (let index = 1; index <= 4; index++) {
      const myObject = runtimeScene.createObject('MyObject');
      myObject.getVariables().get('MyVariable').setNumber(index);
      myObjects.push(myObject);
    }

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(20);
    expect(runtimeScene.getVariables().has('Multiplier')).toBe(false);
  });

  it('can generate a ForEach event with an index variable', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'MyObject',
        variables: [{ name: 'LoopIndex', type: 'number', value: 0 }],
        loopIndexVariable: 'LoopIndex',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Sum', '+', 'LoopIndex'],
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
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const objectLists = new gdjs.Hashtable();
    const myObjects = [];
    objectLists.put('MyObject', myObjects);
    for (let index = 1; index <= 4; index++) {
      const myObject = runtimeScene.createObject('MyObject');
      myObjects.push(myObject);
    }

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(6);
    expect(runtimeScene.getVariables().has('LoopIndex')).toBe(false);
  });

  it('can generate a "for each child variable" event with local variables', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEachChildVariable',
        iterableVariableName: 'MyStructure',
        valueIteratorVariableName: 'CurrentChild',
        keyIteratorVariableName: '',
        variables: [
          {
            name: 'MyStructure',
            type: 'structure',
            children: [
              { name: 'Child1', type: 'number', value: 1 },
              { name: 'Child2', type: 'number', value: 2 },
              { name: 'Child3', type: 'number', value: 3 },
            ],
          },
          { name: 'CurrentChild', type: 'number', value: 0 },
        ],
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Sum', '+', 'CurrentChild'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(6);
    expect(runtimeScene.getVariables().has('MyStructure')).toBe(false);
    expect(runtimeScene.getVariables().has('CurrentChild')).toBe(false);
  });

  it('can generate a "for each child variable" event with an index variable', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEachChildVariable',
        iterableVariableName: 'MyVariable',
        valueIteratorVariableName: '',
        keyIteratorVariableName: '',
        variables: [{ name: 'LoopIndex', type: 'number', value: 0 }],
        loopIndexVariable: 'LoopIndex',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Sum', '+', 'LoopIndex'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const myVariable = runtimeScene.getVariables().get('MyVariable');
    for (let index = 1; index <= 4; index++) {
      myVariable.getChild('Child' + index).setNumber(index);
    }

    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(6);
    expect(runtimeScene.getVariables().has('LoopIndex')).toBe(false);
  });

  it('can generate a "for each child variable" event with local iterator variables', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEachChildVariable',
        iterableVariableName: 'MyArray',
        valueIteratorVariableName: 'CurrentValue',
        keyIteratorVariableName: 'CurrentKey',
        variables: [
          {
            name: 'MyArray',
            type: 'array',
            children: [
              { name: '0', type: 'number', value: 5 },
              { name: '1', type: 'number', value: 7 },
            ],
          },
          { name: 'CurrentValue', type: 'number', value: 0 },
          { name: 'CurrentKey', type: 'number', value: 0 },
        ],
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['ValueSum', '+', 'CurrentValue'],
          },
          {
            type: { value: 'ModVarScene' },
            parameters: ['KeySum', '+', 'CurrentKey'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      {
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('ValueSum').getAsNumber()).toBe(12);
    expect(runtimeScene.getVariables().get('KeySum').getAsNumber()).toBe(1);
  });

  it('can generate nested loops with index variables of different names', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Repeat',
        repeatExpression: '3',
        loopIndexVariable: 'OuterIndex',
        variables: [{ name: 'OuterIndex', type: 'number', value: 0 }],
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::Repeat',
            repeatExpression: '2',
            loopIndexVariable: 'InnerIndex',
            variables: [{ name: 'InnerIndex', type: 'number', value: 0 }],
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['Sum', '+', 'OuterIndex * 10 + InnerIndex'],
              },
            ],
            events: [],
          },
        ],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(63);
    expect(runtimeScene.getVariables().has('OuterIndex')).toBe(false);
    expect(runtimeScene.getVariables().has('InnerIndex')).toBe(false);
  });

  it('can generate nested loops where an index variable shadows another one', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Repeat',
        repeatExpression: '3',
        variables: [{ name: 'LoopIndex', type: 'number', value: 0 }],
        loopIndexVariable: 'LoopIndex',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Sum', '+', 'LoopIndex'],
          },
        ],
        events: [
          {
            type: 'BuiltinCommonInstructions::Repeat',
            repeatExpression: '2',
            loopIndexVariable: 'LoopIndex',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['Sum', '+', 'LoopIndex'],
              },
            ],
            events: [],
          },
        ],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(6);
    expect(runtimeScene.getVariables().has('LoopIndex')).toBe(false);
  });

  it('can generate deeper nested loops mixing local variables and index variable shadowing', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Repeat',
        repeatExpression: '2',
        loopIndexVariable: 'I',
        variables: [{ name: 'I', type: 'number', value: 0 }],
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::Repeat',
            repeatExpression: '3',
            variables: [{ name: 'InnerConstant', type: 'number', value: 2 }],
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['Sum', '+', 'I + InnerConstant'],
              },
            ],
            events: [],
          },
          {
            type: 'BuiltinCommonInstructions::Repeat',
            repeatExpression: '2',
            loopIndexVariable: 'J',
            variables: [{ name: 'J', type: 'number', value: 0 }],
            conditions: [],
            actions: [],
            events: [
              {
                type: 'BuiltinCommonInstructions::Repeat',
                repeatExpression: '2',
                loopIndexVariable: 'I',
                conditions: [],
                actions: [
                  {
                    type: { value: 'ModVarScene' },
                    parameters: ['Sum', '+', 'I + J'],
                  },
                ],
                events: [],
              },
            ],
          },
        ],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(23);
    expect(runtimeScene.getVariables().has('InnerConstant')).toBe(false);
    expect(runtimeScene.getVariables().has('I')).toBe(false);
    expect(runtimeScene.getVariables().has('J')).toBe(false);
  });

  it('can generate a "for each child variable" event with scene key and value iterators', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEachChildVariable',
        iterableVariableName: 'MyArray',
        valueIteratorVariableName: 'child',
        keyIteratorVariableName: 'ChildName',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['ValueSum', '+', 'Variable(child)'],
          },
          {
            type: { value: 'ModVarScene' },
            parameters: ['KeySum', '+', 'Variable(ChildName)'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      { logCode: false }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const myArray = runtimeScene.getVariables().get('MyArray');
    myArray.getChild('0').setNumber(2);
    myArray.getChild('1').setNumber(4);
    myArray.getChild('2').setNumber(6);

    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('ValueSum').getAsNumber()).toBe(12);
    expect(runtimeScene.getVariables().get('KeySum').getAsNumber()).toBe(3);
  });

  it('can generate a "for each child variable" event with scene iterable and local value iterator', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEachChildVariable',
        iterableVariableName: 'MyArray',
        valueIteratorVariableName: 'LocalChildValue',
        keyIteratorVariableName: 'ChildName',
        variables: [{ name: 'LocalChildValue', type: 'number', value: 0 }],
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['ValueSum', '+', 'LocalChildValue'],
          },
          {
            type: { value: 'ModVarScene' },
            parameters: ['KeySum', '+', 'Variable(ChildName)'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      { logCode: false }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const myArray = runtimeScene.getVariables().get('MyArray');
    myArray.getChild('0').setNumber(2);
    myArray.getChild('1').setNumber(4);
    myArray.getChild('2').setNumber(6);

    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('ValueSum').getAsNumber()).toBe(12);
    expect(runtimeScene.getVariables().get('KeySum').getAsNumber()).toBe(3);
    expect(runtimeScene.getVariables().has('LocalChildValue')).toBe(false);
  });

  it('can generate a "for each child variable" event with scene iterable and both local iterators', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEachChildVariable',
        iterableVariableName: 'MyArray',
        valueIteratorVariableName: 'LocalChildValue',
        keyIteratorVariableName: 'LocalChildName',
        variables: [
          { name: 'LocalChildName', type: 'string', value: '' },
          { name: 'LocalChildValue', type: 'number', value: 0 },
        ],
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['ValueSum', '+', 'LocalChildValue'],
          },
          {
            type: { value: 'ModVarScene' },
            parameters: ['KeySum', '+', 'LocalChildName'],
          },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      { logCode: false }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const myArray = runtimeScene.getVariables().get('MyArray');
    myArray.getChild('0').setNumber(2);
    myArray.getChild('1').setNumber(4);
    myArray.getChild('2').setNumber(6);

    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('ValueSum').getAsNumber()).toBe(12);
    expect(runtimeScene.getVariables().get('KeySum').getAsNumber()).toBe(3);
    expect(runtimeScene.getVariables().has('LocalChildValue')).toBe(false);
    expect(runtimeScene.getVariables().has('LocalChildName')).toBe(false);
  });

  it('can generate a "for each child variable" event with local iterable declared in a parent event', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [
          {
            name: 'LocalUpperArray',
            type: 'array',
            children: [
              { type: 'number', value: 9 },
              { type: 'number', value: 10 },
              { type: 'number', value: 11 },
            ],
          },
        ],
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::ForEachChildVariable',
            iterableVariableName: 'LocalUpperArray',
            valueIteratorVariableName: 'LocalChildValue',
            keyIteratorVariableName: 'LocalChildName',
            variables: [
              { name: 'LocalChildName', type: 'string', value: '' },
              { name: 'LocalChildValue', type: 'number', value: 0 },
            ],
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['ValueSum', '+', 'LocalChildValue'],
              },
              {
                type: { value: 'ModVarScene' },
                parameters: ['KeySum', '+', 'LocalChildName'],
              },
            ],
            events: [],
          },
        ],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      { logCode: false }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('ValueSum').getAsNumber()).toBe(30);
    expect(runtimeScene.getVariables().get('KeySum').getAsNumber()).toBe(3);
    expect(runtimeScene.getVariables().has('LocalUpperArray')).toBe(false);
    expect(runtimeScene.getVariables().has('LocalChildValue')).toBe(false);
    expect(runtimeScene.getVariables().has('LocalChildName')).toBe(false);
  });

  it('can iterate over a local array containing mixed types (number + structure) using ToJSON', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEachChildVariable',
        iterableVariableName: 'MixedArray',
        valueIteratorVariableName: 'LocalChildValue',
        keyIteratorVariableName: 'LocalChildName',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarSceneTxt' },
            parameters: ['Content', '+', 'ToJSON(LocalChildValue)'],
          },
        ],
        variables: [
          { name: 'LocalChildName', type: 'string', value: '' },
          {
            name: 'MixedArray',
            type: 'array',
            children: [
              { type: 'number', value: 9 },
              {
                type: 'structure',
                children: [
                  { name: 'a', type: 'number', value: 1 },
                  { name: 'b', type: 'string', value: 'two' },
                ],
              },
              { type: 'number', value: 11 },
            ],
          },
          { name: 'LocalChildValue', type: 'number', value: 0 },
        ],
        events: [],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement,
      { logCode: false }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runtimeScene.getVariables().get('Content').setString('');

    runCompiledEvents(gdjs, runtimeScene, []);

    expect(runtimeScene.getVariables().get('Content').getAsString()).toBe(
      '9{"a":1,"b":"two"}11'
    );
    expect(runtimeScene.getVariables().has('MixedArray')).toBe(false);
    expect(runtimeScene.getVariables().has('LocalChildValue')).toBe(false);
  });

  it('can generate a Repeat event where a local index variable shadows a parent local variable', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        variables: [{ name: 'SomeLocalVariable', type: 'number', value: 50 }],
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::Repeat',
            repeatExpression: '5',
            loopIndexVariable: 'SomeLocalVariable',
            variables: [
              { name: 'SomeLocalVariable', type: 'number', value: 0 },
            ],
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['Sum', '+', 'SomeLocalVariable'],
              },
            ],
            events: [],
          },
          // After the loop, read the parent's SomeLocalVariable (should still be 50).
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['ParentValue', '=', 'SomeLocalVariable'],
              },
            ],
            events: [],
          },
        ],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    // Inner loop: 0+1+2+3+4 = 10
    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(10);
    // Parent's variable is unaffected by the inner loop's index.
    expect(runtimeScene.getVariables().get('ParentValue').getAsNumber()).toBe(
      50
    );
    expect(runtimeScene.getVariables().has('SomeLocalVariable')).toBe(false);
  });

  it('can generate nested While events with same-named local index variables', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        infiniteLoopWarning: true,
        type: 'BuiltinCommonInstructions::While',
        whileConditions: [
          {
            type: { value: 'NumberVariable' },
            parameters: ['LoopIndex', '<', '3'],
          },
        ],
        loopIndexVariable: 'LoopIndex',
        variables: [{ name: 'LoopIndex', type: 'number', value: 0 }],
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['OuterSum', '+', 'LoopIndex'],
          },
        ],
        events: [
          {
            infiniteLoopWarning: true,
            type: 'BuiltinCommonInstructions::While',
            whileConditions: [
              {
                type: { value: 'NumberVariable' },
                parameters: ['LoopIndex', '<', '3'],
              },
            ],
            loopIndexVariable: 'LoopIndex',
            variables: [{ name: 'LoopIndex', type: 'number', value: 0 }],
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['InnerSum', '+', 'LoopIndex'],
              },
            ],
            events: [],
          },
        ],
      },
    ]);

    const runCompiledEvents = generateCompiledEventsFromSerializedEvents(
      gd,
      serializerElement
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    runCompiledEvents(gdjs, runtimeScene, []);

    // Outer loop: 0+1+2 = 3
    expect(runtimeScene.getVariables().get('OuterSum').getAsNumber()).toBe(3);
    // Inner loop runs 3 times per outer iteration: 3*(0+1+2) = 9
    expect(runtimeScene.getVariables().get('InnerSum').getAsNumber()).toBe(9);
    expect(runtimeScene.getVariables().has('LoopIndex')).toBe(false);
  });
});
