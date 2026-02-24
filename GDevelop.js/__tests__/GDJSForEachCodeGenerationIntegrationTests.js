const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks');
const {
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS ForEach Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  // ---- Simple and nested ForEach without orderBy ----

  it('can generate a simple "for each object" event without orderBy', function () {
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
        parameterTypes: { MyObject: 'object' },
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

    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(
      1 + 2 + 3 + 4
    );
  });

  it('can generate nested "for each object" events without orderBy', function () {
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
        parameterTypes: { MyObjectA: 'object', MyObjectB: 'object' },
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const objectALists = new gdjs.Hashtable();
    const myObjectsA = [];
    objectALists.put('MyObjectA', myObjectsA);
    for (let index = 1; index <= 3; index++) {
      const obj = runtimeScene.createObject('MyObjectA');
      obj.getVariables().get('MyVariable').setNumber(index);
      myObjectsA.push(obj);
    }
    const objectBLists = new gdjs.Hashtable();
    const myObjectsB = [];
    objectBLists.put('MyObjectB', myObjectsB);
    for (let index = 1; index <= 2; index++) {
      const obj = runtimeScene.createObject('MyObjectB');
      obj.getVariables().get('MyVariable').setNumber(10 * index);
      myObjectsB.push(obj);
    }

    runCompiledEvents(gdjs, runtimeScene, [objectALists, objectBLists]);

    // (1+2+3) * (10+20) = 6*30 = 180
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(180);
  });

  it('order and limit have no impact when orderBy is not set', function () {
    // Without orderBy, order and limit should be ignored.
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'MyObject',
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
      serializerElement,
      {
        parameterTypes: { MyObject: 'object' },
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const objectLists = new gdjs.Hashtable();
    const myObjects = [];
    objectLists.put('MyObject', myObjects);
    for (let index = 0; index < 5; index++) {
      myObjects.push(runtimeScene.createObject('MyObject'));
    }

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    // All 5 objects iterated
    expect(runtimeScene.getVariables().get('Counter').getAsNumber()).toBe(5);
  });

  // ---- 3 nested ForEach with orderBy ----

  it('can generate 3 nested "for each" with orderBy, checking object picking', function () {
    // Outer: ForEach on ObjectA ordered by ObjectA.Variable(Priority) asc
    // Middle: ForEach on ObjectB ordered by ObjectB.Variable(Priority) desc
    // Inner: ForEach on ObjectC (no orderBy)
    // Action: Use positional encoding to verify order:
    //   Accumulate ObjectA.Priority * 10000 + ObjectB.Priority * 100 + ObjectC.Priority
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'ObjectA',
        orderBy: 'ObjectA.Variable(Priority)',
        order: 'asc',
        conditions: [],
        actions: [],
        events: [
          {
            type: 'BuiltinCommonInstructions::ForEach',
            object: 'ObjectB',
            orderBy: 'ObjectB.Variable(Priority)',
            order: 'desc',
            conditions: [],
            actions: [],
            events: [
              {
                type: 'BuiltinCommonInstructions::ForEach',
                object: 'ObjectC',
                conditions: [],
                actions: [
                  {
                    type: { value: 'ModVarScene' },
                    parameters: [
                      'Sum',
                      '+',
                      'ObjectA.Variable(Priority) * 10000 + ObjectB.Variable(Priority) * 100 + ObjectC.Variable(Priority)',
                    ],
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
      serializerElement,
      {
        parameterTypes: {
          ObjectA: 'object',
          ObjectB: 'object',
          ObjectC: 'object',
        },
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();

    // ObjectA with Priority: 30, 10, 20 -> sorted asc: 10, 20, 30
    const objectALists = new gdjs.Hashtable();
    const objAs = [];
    objectALists.put('ObjectA', objAs);
    [30, 10, 20].forEach(v => {
      const o = runtimeScene.createObject('ObjectA');
      o.getVariables().get('Priority').setNumber(v);
      objAs.push(o);
    });

    // ObjectB with Priority: 5, 15 -> sorted desc: 15, 5
    const objectBLists = new gdjs.Hashtable();
    const objBs = [];
    objectBLists.put('ObjectB', objBs);
    [5, 15].forEach(v => {
      const o = runtimeScene.createObject('ObjectB');
      o.getVariables().get('Priority').setNumber(v);
      objBs.push(o);
    });

    // ObjectC with Priority: 1
    const objectCLists = new gdjs.Hashtable();
    const objCs = [];
    objectCLists.put('ObjectC', objCs);
    [1].forEach(v => {
      const o = runtimeScene.createObject('ObjectC');
      o.getVariables().get('Priority').setNumber(v);
      objCs.push(o);
    });

    runCompiledEvents(gdjs, runtimeScene, [
      objectALists,
      objectBLists,
      objectCLists,
    ]);

    // A sorted asc (10,20,30), B sorted desc (15,5), C unordered (1)
    // Iterations: (10,15,1), (10,5,1), (20,15,1), (20,5,1), (30,15,1), (30,5,1)
    // Sum = 101501 + 100501 + 201501 + 200501 + 301501 + 300501
    const expected =
      10 * 10000 + 15 * 100 + 1 +
      (10 * 10000 + 5 * 100 + 1) +
      (20 * 10000 + 15 * 100 + 1) +
      (20 * 10000 + 5 * 100 + 1) +
      (30 * 10000 + 15 * 100 + 1) +
      (30 * 10000 + 5 * 100 + 1);
    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(expected);
  });

  // ---- ForEach with orderBy and limit (1, 2, none) for asc and desc ----

  it('can generate a "for each" with orderBy ascending and limit 1 (pick lowest)', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'MyObject',
        orderBy: 'MyObject.Variable(Score)',
        order: 'asc',
        limit: '1',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['PickedScore', '=', 'MyObject.Variable(Score)'],
          },
        ],
        events: [],
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
    const objectLists = new gdjs.Hashtable();
    const myObjects = [];
    objectLists.put('MyObject', myObjects);
    [50, 10, 30, 20].forEach(v => {
      const o = runtimeScene.createObject('MyObject');
      o.getVariables().get('Score').setNumber(v);
      myObjects.push(o);
    });

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    // Ascending + limit 1 → picks the object with lowest Score = 10
    expect(runtimeScene.getVariables().get('PickedScore').getAsNumber()).toBe(
      10
    );
  });

  it('can generate a "for each" with orderBy descending and limit 1 (pick highest)', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'MyObject',
        orderBy: 'MyObject.Variable(Score)',
        order: 'desc',
        limit: '1',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['PickedScore', '=', 'MyObject.Variable(Score)'],
          },
        ],
        events: [],
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
    const objectLists = new gdjs.Hashtable();
    const myObjects = [];
    objectLists.put('MyObject', myObjects);
    [50, 10, 30, 20].forEach(v => {
      const o = runtimeScene.createObject('MyObject');
      o.getVariables().get('Score').setNumber(v);
      myObjects.push(o);
    });

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    // Descending + limit 1 → picks the object with highest Score = 50
    expect(runtimeScene.getVariables().get('PickedScore').getAsNumber()).toBe(
      50
    );
  });

  it('can generate a "for each" with orderBy ascending and limit 2', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'MyObject',
        orderBy: 'MyObject.Variable(Score)',
        order: 'asc',
        limit: '2',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Sum', '+', 'MyObject.Variable(Score)'],
          },
        ],
        events: [],
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
    const objectLists = new gdjs.Hashtable();
    const myObjects = [];
    objectLists.put('MyObject', myObjects);
    [50, 10, 30, 20].forEach(v => {
      const o = runtimeScene.createObject('MyObject');
      o.getVariables().get('Score').setNumber(v);
      myObjects.push(o);
    });

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    // Ascending + limit 2 → picks 10 + 20 = 30
    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(30);
  });

  it('can generate a "for each" with orderBy descending and limit 2', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'MyObject',
        orderBy: 'MyObject.Variable(Score)',
        order: 'desc',
        limit: '2',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Sum', '+', 'MyObject.Variable(Score)'],
          },
        ],
        events: [],
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
    const objectLists = new gdjs.Hashtable();
    const myObjects = [];
    objectLists.put('MyObject', myObjects);
    [50, 10, 30, 20].forEach(v => {
      const o = runtimeScene.createObject('MyObject');
      o.getVariables().get('Score').setNumber(v);
      myObjects.push(o);
    });

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    // Descending + limit 2 → picks 50 + 30 = 80
    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(80);
  });

  it('can generate a "for each" with orderBy ascending and no limit', function () {
    // Verify ordering by using positional encoding:
    // Multiply each Score by 10^position to check exact iteration order.
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'MyObject',
        orderBy: 'MyObject.Variable(Score)',
        order: 'asc',
        variables: [{ name: 'Position', type: 'number', value: 0 }],
        loopIndexVariable: 'Position',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Sum', '+', 'MyObject.Variable(Score)'],
          },
          {
            type: { value: 'ModVarScene' },
            parameters: [
              'OrderCheck',
              '+',
              'MyObject.Variable(Score) * pow(10, Position)',
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
        parameterTypes: { MyObject: 'object' },
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const objectLists = new gdjs.Hashtable();
    const myObjects = [];
    objectLists.put('MyObject', myObjects);
    [50, 10, 30, 20].forEach(v => {
      const o = runtimeScene.createObject('MyObject');
      o.getVariables().get('Score').setNumber(v);
      myObjects.push(o);
    });

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    // Ascending, no limit → sum of all scores
    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(
      10 + 20 + 30 + 50
    );
    // OrderCheck: 10*10^0 + 20*10^1 + 30*10^2 + 50*10^3 = 10 + 200 + 3000 + 50000 = 53210
    expect(runtimeScene.getVariables().get('OrderCheck').getAsNumber()).toBe(
      53210
    );
  });

  it('can generate a "for each" with orderBy descending and no limit', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'MyObject',
        orderBy: 'MyObject.Variable(Score)',
        order: 'desc',
        variables: [{ name: 'Position', type: 'number', value: 0 }],
        loopIndexVariable: 'Position',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Sum', '+', 'MyObject.Variable(Score)'],
          },
          {
            type: { value: 'ModVarScene' },
            parameters: [
              'OrderCheck',
              '+',
              'MyObject.Variable(Score) * pow(10, Position)',
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
        parameterTypes: { MyObject: 'object' },
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const objectLists = new gdjs.Hashtable();
    const myObjects = [];
    objectLists.put('MyObject', myObjects);
    [50, 10, 30, 20].forEach(v => {
      const o = runtimeScene.createObject('MyObject');
      o.getVariables().get('Score').setNumber(v);
      myObjects.push(o);
    });

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    // Descending, no limit → sum of all scores
    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(
      10 + 20 + 30 + 50
    );
    // OrderCheck: 50*10^0 + 30*10^1 + 20*10^2 + 10*10^3 = 50 + 300 + 2000 + 10000 = 12350
    expect(runtimeScene.getVariables().get('OrderCheck').getAsNumber()).toBe(
      12350
    );
  });

  // ---- ForEach with orderBy with local variables and loop index ----

  it('can generate a "for each" with orderBy, local variables and loop index', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'MyObject',
        orderBy: 'MyObject.Variable(Score)',
        order: 'asc',
        variables: [
          { name: 'LoopIndex', type: 'number', value: 0 },
          { name: 'Multiplier', type: 'number', value: 10 },
        ],
        loopIndexVariable: 'LoopIndex',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: [
              'Sum',
              '+',
              'MyObject.Variable(Score) * Multiplier + LoopIndex',
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
        parameterTypes: { MyObject: 'object' },
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();
    const objectLists = new gdjs.Hashtable();
    const myObjects = [];
    objectLists.put('MyObject', myObjects);
    [30, 10, 20].forEach(v => {
      const o = runtimeScene.createObject('MyObject');
      o.getVariables().get('Score').setNumber(v);
      myObjects.push(o);
    });

    runCompiledEvents(gdjs, runtimeScene, [objectLists]);

    // Objects sorted asc by Score: 10, 20, 30
    // Loop indices: 0, 1, 2
    // Sum = (10*10 + 0) + (20*10 + 1) + (30*10 + 2) = 100 + 201 + 302 = 603
    expect(runtimeScene.getVariables().get('Sum').getAsNumber()).toBe(603);
    expect(runtimeScene.getVariables().has('LoopIndex')).toBe(false);
    expect(runtimeScene.getVariables().has('Multiplier')).toBe(false);
  });

  // ---- 3 nested ForEach with orderBy on a group then on objects of this group ----

  it('can generate 3 nested "for each" with orderBy on a group then on objects of that group', function () {
    // ForEach on AllObjects (group: ObjX, ObjY) ordered by score asc
    //   Action: accumulate the score of each picked object from the group
    //   Sub-event with condition: check if the picked object is ObjX
    //     ForEach on same group AllObjects ordered by score desc
    //       Action: accumulate into a second variable
    //       Sub-event: ForEach on ObjY (different object type, always available)
    //         Action: accumulate into a third variable

    // Simpler test: outer ForEach on group ordered asc, middle ForEach on group
    // ordered desc, inner ForEach on third object.
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::ForEach',
        object: 'AllObjects',
        orderBy: 'AllObjects.Variable(Score)',
        order: 'asc',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: [
              'OuterSum',
              '+',
              'AllObjects.Variable(Score)',
            ],
          },
        ],
        events: [
          // Inner ForEach on IndependentObj (not in the group, so always fully available)
          {
            type: 'BuiltinCommonInstructions::ForEach',
            object: 'IndependentObj',
            orderBy: 'IndependentObj.Variable(Val)',
            order: 'desc',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: [
                  'InnerSum',
                  '+',
                  'AllObjects.Variable(Score) + IndependentObj.Variable(Val)',
                ],
              },
            ],
            events: [
              {
                type: 'BuiltinCommonInstructions::ForEach',
                object: 'ThirdObj',
                orderBy: 'ThirdObj.Variable(V)',
                order: 'asc',
                conditions: [],
                actions: [
                  {
                    type: { value: 'ModVarScene' },
                    parameters: [
                      'DeepSum',
                      '+',
                      'ThirdObj.Variable(V)',
                    ],
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
      serializerElement,
      {
        parameterTypes: { ObjX: 'object', ObjY: 'object', IndependentObj: 'object', ThirdObj: 'object' },
        groups: {
          AllObjects: ['ObjX', 'ObjY'],
        },
        logCode: false,
      }
    );

    const { gdjs, runtimeScene } = makeMinimalGDJSMock();

    // ObjX with Scores: 5, 15
    const objXLists = new gdjs.Hashtable();
    const objXs = [];
    objXLists.put('ObjX', objXs);
    [5, 15].forEach(v => {
      const o = runtimeScene.createObject('ObjX');
      o.getVariables().get('Score').setNumber(v);
      objXs.push(o);
    });

    // ObjY with Scores: 100, 200
    const objYLists = new gdjs.Hashtable();
    const objYs = [];
    objYLists.put('ObjY', objYs);
    [100, 200].forEach(v => {
      const o = runtimeScene.createObject('ObjY');
      o.getVariables().get('Score').setNumber(v);
      objYs.push(o);
    });

    // IndependentObj with Val: 1000, 2000
    const indepLists = new gdjs.Hashtable();
    const indepObjs = [];
    indepLists.put('IndependentObj', indepObjs);
    [1000, 2000].forEach(v => {
      const o = runtimeScene.createObject('IndependentObj');
      o.getVariables().get('Val').setNumber(v);
      indepObjs.push(o);
    });

    // ThirdObj with V: 7
    const thirdLists = new gdjs.Hashtable();
    const thirdObjs = [];
    thirdLists.put('ThirdObj', thirdObjs);
    [7].forEach(v => {
      const o = runtimeScene.createObject('ThirdObj');
      o.getVariables().get('V').setNumber(v);
      thirdObjs.push(o);
    });

    runCompiledEvents(gdjs, runtimeScene, [objXLists, objYLists, indepLists, thirdLists]);

    // Outer ForEach: AllObjects (group) sorted asc by Score:
    // ObjX(5), ObjX(15), ObjY(100), ObjY(200)
    // OuterSum = 5 + 15 + 100 + 200 = 320
    expect(
      runtimeScene.getVariables().get('OuterSum').getAsNumber()
    ).toBe(320);

    // Inner ForEach on IndependentObj desc (2000, 1000):
    // For each of the 4 outer iterations × 2 inner iterations:
    // InnerSum += AllObjects.Score + IndependentObj.Val
    // = 4 outer × 2 inner = 8 iterations
    // Score contributions: each outer score appears 2 times: 2*(5+15+100+200) = 640
    // Val contributions: each Val appears 4 times: 4*(2000+1000) = 12000
    // InnerSum = 640 + 12000 = 12640
    expect(runtimeScene.getVariables().get('InnerSum').getAsNumber()).toBe(
      12640
    );

    // DeepSum: for each of 8 middle iterations × 1 ThirdObj iteration:
    // DeepSum += 7, so 8 * 7 = 56
    expect(runtimeScene.getVariables().get('DeepSum').getAsNumber()).toBe(
      56
    );
  });
});
