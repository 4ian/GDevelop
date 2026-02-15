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

  it('can generate a stress test with deeply nested loops of all types, local variables, indexes and variable shadowing', function () {
    // This test nests all four loop types (for-each-child, repeat, while,
    // for-each-object) four levels deep, with local variables at every level,
    // multiple loop index variables, and a variable "ShadowedIdx" that is
    // shadowed at three different scopes.
    //
    // Scoping hierarchy:
    //   Level 0 (Standard):            ShadowedIdx = 100
    //   Level 1 (ForEachChildVariable): ChildValue, ChildKey, ChildLoopIdx, DataMap
    //   Level 2 (Repeat):              RepeatIdx, ShadowedIdx = 0  (shadows L0)
    //   Level 3 (While):               WhileIdx
    //   Level 4 (ForEach object):      ShadowedIdx = loop index   (shadows L2)

    const serializerElement = gd.Serializer.fromJSObject([
      {
        // Level 0: Standard event declaring ShadowedIdx = 100
        type: 'BuiltinCommonInstructions::Standard',
        variables: [{ name: 'ShadowedIdx', type: 'number', value: 100 }],
        conditions: [],
        actions: [],
        events: [
          {
            // Level 1: ForEachChildVariable over a local structure
            type: 'BuiltinCommonInstructions::ForEachChildVariable',
            iterableVariableName: 'DataMap',
            valueIteratorVariableName: 'ChildValue',
            keyIteratorVariableName: 'ChildKey',
            loopIndexVariable: 'ChildLoopIdx',
            variables: [
              {
                name: 'DataMap',
                type: 'structure',
                children: [
                  { name: 'X', type: 'number', value: 10 },
                  { name: 'Y', type: 'number', value: 20 },
                ],
              },
              { name: 'ChildValue', type: 'number', value: 0 },
              { name: 'ChildKey', type: 'string', value: '' },
              { name: 'ChildLoopIdx', type: 'number', value: 0 },
            ],
            conditions: [],
            actions: [],
            events: [
              {
                // Level 2: Repeat 3 times, with local ShadowedIdx=0
                // that shadows Level 0's ShadowedIdx=100.
                type: 'BuiltinCommonInstructions::Repeat',
                repeatExpression: '3',
                loopIndexVariable: 'RepeatIdx',
                variables: [
                  { name: 'RepeatIdx', type: 'number', value: 0 },
                  { name: 'ShadowedIdx', type: 'number', value: 0 },
                ],
                conditions: [],
                actions: [],
                events: [
                  {
                    // Level 3: While loop (WhileIdx < 2 → 2 iterations)
                    infiniteLoopWarning: true,
                    type: 'BuiltinCommonInstructions::While',
                    whileConditions: [
                      {
                        type: { value: 'NumberVariable' },
                        parameters: ['WhileIdx', '<', '2'],
                      },
                    ],
                    loopIndexVariable: 'WhileIdx',
                    variables: [{ name: 'WhileIdx', type: 'number', value: 0 }],
                    conditions: [],
                    actions: [],
                    events: [
                      {
                        // Level 4: ForEach object whose loop index variable
                        // is "ShadowedIdx", shadowing Level 2's ShadowedIdx.
                        type: 'BuiltinCommonInstructions::ForEach',
                        object: 'MyObject',
                        loopIndexVariable: 'ShadowedIdx',
                        variables: [
                          {
                            name: 'ShadowedIdx',
                            type: 'number',
                            value: 0,
                          },
                        ],
                        conditions: [],
                        actions: [
                          {
                            type: { value: 'ModVarScene' },
                            parameters: [
                              'Sum',
                              '+',
                              'ChildValue + RepeatIdx + WhileIdx + ShadowedIdx + MyObject.Variable(MyVar)',
                            ],
                          },
                        ],
                        events: [],
                      },
                    ],
                  },
                ],
              },
              // After repeat, still inside for-each-child: read indexes
              // and verify shadowing restores to the correct scope.
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [],
                actions: [
                  {
                    // ChildLoopIdx should still be the for-each-child index.
                    type: { value: 'ModVarScene' },
                    parameters: ['ChildIdxSum', '+', 'ChildLoopIdx'],
                  },
                  {
                    // ShadowedIdx here should be Level 0's value (100)
                    // because Level 2's local is now out of scope.
                    type: { value: 'ModVarScene' },
                    parameters: ['ShadowAfterRepeat', '+', 'ShadowedIdx'],
                  },
                ],
                events: [],
              },
            ],
          },
          // After for-each-child, inside Level 0 Standard:
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                // ShadowedIdx should be Level 0's original value (100).
                type: { value: 'ModVarScene' },
                parameters: ['OriginalShadow', '=', 'ShadowedIdx'],
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
        parameterTypes: { MyObject: 'object' },
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();

    // Create 2 objects with MyVar values 1 and 2.
    const objectLists = new gdjs.Hashtable();
    const myObjects = [];
    objectLists.put('MyObject', myObjects);
    for (let index = 1; index <= 2; index++) {
      const myObject = runtimeScene.createObject('MyObject');
      myObject.getVariables().get('MyVar').setNumber(index);
      myObjects.push(myObject);
    }

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    // --- Verify Sum ---
    // Total inner iterations:
    //   2 (for-each-child: X,Y) × 3 (repeat) × 2 (while) × 2 (for-each-object) = 24
    // Each addend appears in 24/(number of its distinct values) iterations:
    //   ChildValue ∈ {10,20} → 12 each → 12*(10+20) = 360
    //   RepeatIdx  ∈ {0,1,2} →  8 each →  8*(0+1+2) =  24
    //   WhileIdx   ∈ {0,1}   → 12 each → 12*(0+1)   =  12
    //   ShadowedIdx∈ {0,1}   → 12 each → 12*(0+1)   =  12
    //   MyVar      ∈ {1,2}   → 12 each → 12*(1+2)   =  36
    // Total Sum = 360 + 24 + 12 + 12 + 36 = 444
    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(444);

    // --- Verify for-each-child loop index survives the inner loops ---
    // Runs once per for-each-child iteration (2 iterations): 0 + 1 = 1
    expect(runtimeScene.getVariables().get('ChildIdxSum').getAsNumber()).toBe(
      1
    );

    // --- Verify variable shadowing restores correctly ---
    // After the repeat exits, its local ShadowedIdx=0 is out of scope,
    // so ShadowedIdx resolves to Level 0's value (100).
    // Runs once per for-each-child iteration (2): 100 + 100 = 200
    expect(
      runtimeScene.getVariables().get('ShadowAfterRepeat').getAsNumber()
    ).toBe(200);

    // After the for-each-child exits, ShadowedIdx is still Level 0's 100.
    expect(
      runtimeScene.getVariables().get('OriginalShadow').getAsNumber()
    ).toBe(100);

    // --- Verify no local variable leaked to the scene ---
    expect(runtimeScene.getVariables().has('ShadowedIdx')).toBe(false);
    expect(runtimeScene.getVariables().has('DataMap')).toBe(false);
    expect(runtimeScene.getVariables().has('ChildValue')).toBe(false);
    expect(runtimeScene.getVariables().has('ChildKey')).toBe(false);
    expect(runtimeScene.getVariables().has('ChildLoopIdx')).toBe(false);
    expect(runtimeScene.getVariables().has('RepeatIdx')).toBe(false);
    expect(runtimeScene.getVariables().has('WhileIdx')).toBe(false);
  });
});
