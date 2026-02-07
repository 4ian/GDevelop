const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');
const { makeMinimalGDJSMock } = require('../TestUtils/GDJSMocks.js');
const {
  generateCompiledEventsForEventsFunction,
  generateCompiledEventsFromSerializedEvents,
} = require('../TestUtils/CodeGenerationHelpers.js');

describe('libGD.js - GDJS "Else" Code Generation integration tests', function () {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  it('can generate a simple Else event (pure else)', function () {
    // Standard event with a false condition, followed by Else.
    // The Else branch should run since the Standard condition fails.
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '999'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '2'],
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
    expect(runtimeScene.getVariables().has('Result')).toBe(true);
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(2);
  });

  it('does not run Else event when Standard event conditions are satisfied', function () {
    // Standard event with no conditions (always true), followed by Else.
    // The Else branch should NOT run.
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '2'],
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
    expect(runtimeScene.getVariables().has('Result')).toBe(true);
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(1);
  });

  it('can generate an Else-If chain', function () {
    // If Counter == 999 -> Result = 1 (won't run)
    // Else if Counter == 0 -> Result = 2 (will run since Counter defaults to 0)
    // Else -> Result = 3 (won't run since previous else-if matched)
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '999'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '0'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '2'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '3'],
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
    expect(runtimeScene.getVariables().has('Result')).toBe(true);
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(2);
  });

  it('can generate an Else chain that falls through to pure else', function () {
    // If Counter == 999 -> Result = 1 (won't run)
    // Else if Counter == 888 -> Result = 2 (won't run)
    // Else -> Result = 3 (will run)
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '999'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '888'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '2'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '3'],
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
    expect(runtimeScene.getVariables().has('Result')).toBe(true);
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(3);
  });

  it('resets Else chain when a new Standard event starts', function () {
    // First chain: Standard (true) -> Else (should not run)
    // Second chain: Standard (false) -> Else (should run)
    const serializerElement = gd.Serializer.fromJSObject([
      // First chain
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result1', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result1', '=', '2'],
          },
        ],
        events: [],
      },
      // Second chain
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '999'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result2', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result2', '=', '2'],
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
    // First chain: Standard runs (no conditions = always true)
    expect(runtimeScene.getVariables().get('Result1').getAsNumber()).toBe(1);
    // Second chain: Standard fails, Else runs
    expect(runtimeScene.getVariables().get('Result2').getAsNumber()).toBe(2);
  });

  it('can generate Else events with sub-events', function () {
    // Standard (false) -> Else runs, and sub-events also run
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '999'],
          },
        ],
        actions: [],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '1'],
          },
        ],
        events: [
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['SubResult', '=', '10'],
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
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(1);
    expect(runtimeScene.getVariables().get('SubResult').getAsNumber()).toBe(10);
  });

  it('runs an Else event like a Standard event when not preceded by Standard/Else', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '5'],
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
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(5);
  });

  it('runs an Else event like a Standard event when previous event is disabled', function () {
    const serializerElement = gd.Serializer.fromJSObject([
      {
        type: 'BuiltinCommonInstructions::Standard',
        disabled: true,
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '1'],
          },
        ],
        events: [],
      },
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['Result', '=', '2'],
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
    expect(runtimeScene.getVariables().get('Result').getAsNumber()).toBe(2);
  });

  it('can generate three nested levels of Else if/else chains with surrounding events', function () {
    // Level 1: else-if matches (Counter == 0, which is the default)
    // Level 2 (sub-events of L1 else-if): final else runs
    // Level 3 (sub-events of L2 else): first else-if matches (Counter == 0)
    // At each level, events before and after the else chain verify execution flow.
    const serializerElement = gd.Serializer.fromJSObject([
      // --- Before Level 1 chain ---
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['BeforeL1', '=', '1'],
          },
        ],
        events: [],
      },
      // --- Level 1 chain ---
      // If Counter == 999 (false)
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '999'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['L1Result', '=', '1'],
          },
        ],
        events: [],
      },
      // Else if Counter == 0 (true - this branch runs)
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [
          {
            type: { value: 'VarScene' },
            parameters: ['Counter', '=', '0'],
          },
        ],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['L1Result', '=', '2'],
          },
        ],
        events: [
          // --- Before Level 2 chain ---
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['BeforeL2', '=', '1'],
              },
            ],
            events: [],
          },
          // --- Level 2 chain ---
          // If Counter == 999 (false)
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [
              {
                type: { value: 'VarScene' },
                parameters: ['Counter', '=', '999'],
              },
            ],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['L2Result', '=', '1'],
              },
            ],
            events: [],
          },
          // Else if Counter == 888 (false)
          {
            type: 'BuiltinCommonInstructions::Else',
            conditions: [
              {
                type: { value: 'VarScene' },
                parameters: ['Counter', '=', '888'],
              },
            ],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['L2Result', '=', '2'],
              },
            ],
            events: [],
          },
          // Else (true - final else runs)
          {
            type: 'BuiltinCommonInstructions::Else',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['L2Result', '=', '3'],
              },
            ],
            events: [
              // --- Before Level 3 chain ---
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [],
                actions: [
                  {
                    type: { value: 'ModVarScene' },
                    parameters: ['BeforeL3', '=', '1'],
                  },
                ],
                events: [],
              },
              // --- Level 3 chain ---
              // If Counter == 999 (false)
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [
                  {
                    type: { value: 'VarScene' },
                    parameters: ['Counter', '=', '999'],
                  },
                ],
                actions: [
                  {
                    type: { value: 'ModVarScene' },
                    parameters: ['L3Result', '=', '1'],
                  },
                ],
                events: [],
              },
              // Else if Counter == 0 (true - first else-if matches)
              {
                type: 'BuiltinCommonInstructions::Else',
                conditions: [
                  {
                    type: { value: 'VarScene' },
                    parameters: ['Counter', '=', '0'],
                  },
                ],
                actions: [
                  {
                    type: { value: 'ModVarScene' },
                    parameters: ['L3Result', '=', '2'],
                  },
                ],
                events: [],
              },
              // Else (won't run - previous else-if matched)
              {
                type: 'BuiltinCommonInstructions::Else',
                conditions: [],
                actions: [
                  {
                    type: { value: 'ModVarScene' },
                    parameters: ['L3Result', '=', '3'],
                  },
                ],
                events: [],
              },
              // --- After Level 3 chain ---
              {
                type: 'BuiltinCommonInstructions::Standard',
                conditions: [],
                actions: [
                  {
                    type: { value: 'ModVarScene' },
                    parameters: ['AfterL3', '=', '1'],
                  },
                ],
                events: [],
              },
            ],
          },
          // --- After Level 2 chain ---
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [],
            actions: [
              {
                type: { value: 'ModVarScene' },
                parameters: ['AfterL2', '=', '1'],
              },
            ],
            events: [],
          },
        ],
      },
      // Else (won't run - previous else-if matched)
      {
        type: 'BuiltinCommonInstructions::Else',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['L1Result', '=', '3'],
          },
        ],
        events: [],
      },
      // --- After Level 1 chain ---
      {
        type: 'BuiltinCommonInstructions::Standard',
        conditions: [],
        actions: [
          {
            type: { value: 'ModVarScene' },
            parameters: ['AfterL1', '=', '1'],
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

    // Events before each chain ran.
    expect(runtimeScene.getVariables().get('BeforeL1').getAsNumber()).toBe(1);
    expect(runtimeScene.getVariables().get('BeforeL2').getAsNumber()).toBe(1);
    expect(runtimeScene.getVariables().get('BeforeL3').getAsNumber()).toBe(1);
    // Level 1: else-if matched (Counter == 0).
    expect(runtimeScene.getVariables().get('L1Result').getAsNumber()).toBe(2);
    // Level 2: final else ran (Counter != 999 and Counter != 888).
    expect(runtimeScene.getVariables().get('L2Result').getAsNumber()).toBe(3);
    // Level 3: first else-if matched (Counter == 0).
    expect(runtimeScene.getVariables().get('L3Result').getAsNumber()).toBe(2);
    // Events after each chain ran.
    expect(runtimeScene.getVariables().get('AfterL1').getAsNumber()).toBe(1);
    expect(runtimeScene.getVariables().get('AfterL2').getAsNumber()).toBe(1);
    expect(runtimeScene.getVariables().get('AfterL3').getAsNumber()).toBe(1);
  });
});
