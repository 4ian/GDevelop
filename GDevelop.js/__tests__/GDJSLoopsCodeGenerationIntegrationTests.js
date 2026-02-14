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
        indexVariable: 'LoopIndex',
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
        indexVariable: 'LoopIndex',
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
        indexVariable: 'LoopIndex',
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
        indexVariable: 'LoopIndex',
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
        indexVariable: 'OuterIndex',
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::Repeat',
            repeatExpression: '2',
            indexVariable: 'InnerIndex',
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
        indexVariable: 'LoopIndex',
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
            indexVariable: 'LoopIndex',
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
        indexVariable: 'I',
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
            indexVariable: 'J',
            conditions: [],
            actions: [],
            events: [
              {
                type: 'BuiltinCommonInstructions::Repeat',
                repeatExpression: '2',
                indexVariable: 'I',
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
});
